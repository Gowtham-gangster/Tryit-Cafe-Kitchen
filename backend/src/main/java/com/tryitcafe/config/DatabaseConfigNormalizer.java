package com.tryitcafe.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanPostProcessor;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.util.Arrays;

/**
 * Normalizes PostgreSQL/Supabase database connection URLs and parameters.
 * 
 * Supports:
 * 1. Standard JDBC URLs: jdbc:postgresql://host:port/database?sslmode=require
 * 2. Supabase / Heroku URI format: postgresql://user:pass@host:port/database or postgres://...
 * 3. Automatic SSL enforcement (sslmode=require) for production remote connections.
 * 4. Extraction of credentials from URI when embedded in connection string.
 * 
 * Leaves H2 and other local dev databases completely untouched.
 */
@Component
public class DatabaseConfigNormalizer implements BeanPostProcessor {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConfigNormalizer.class);
    private final Environment environment;

    public DatabaseConfigNormalizer(Environment environment) {
        this.environment = environment;
    }

    @Override
    public Object postProcessBeforeInitialization(Object bean, String beanName) throws BeansException {
        if (bean instanceof DataSourceProperties properties) {
            normalizeDataSourceProperties(properties);
        }
        return bean;
    }

    public void normalizeDataSourceProperties(DataSourceProperties properties) {
        String rawUrl = properties.getUrl();
        if (rawUrl == null || rawUrl.isBlank()) {
            return;
        }

        String trimmedUrl = rawUrl.trim();

        // 1. If it's an H2 in-memory or embedded database (used in dev/test), do not alter
        if (trimmedUrl.startsWith("jdbc:h2:") || trimmedUrl.contains("jdbc:h2:mem:")) {
            return;
        }

        boolean isProd = Arrays.asList(environment.getActiveProfiles()).contains("prod");

        try {
            // 2. Handle URI style: postgresql://user:pass@host:port/db or postgres://user:pass@host:port/db
            if (trimmedUrl.startsWith("postgres://") || trimmedUrl.startsWith("postgresql://")) {
                log.info("Detected standard URI connection format from environment. Normalizing for PostgreSQL JDBC driver.");
                URI uri = new URI(trimmedUrl.replaceFirst("^postgres://", "http://").replaceFirst("^postgresql://", "http://"));

                String host = uri.getHost();
                int port = uri.getPort() > 0 ? uri.getPort() : 5432;
                String path = uri.getPath();
                String database = (path != null && path.length() > 1) ? path.substring(1) : "postgres";

                // Extract credentials if embedded in URI
                if (uri.getUserInfo() != null && !uri.getUserInfo().isBlank()) {
                    String[] userInfo = uri.getUserInfo().split(":", 2);
                    if (userInfo.length > 0 && (properties.getUsername() == null || properties.getUsername().isBlank())) {
                        properties.setUsername(userInfo[0]);
                    }
                    if (userInfo.length > 1 && (properties.getPassword() == null || properties.getPassword().isBlank())) {
                        properties.setPassword(userInfo[1]);
                    }
                }

                StringBuilder jdbcUrl = new StringBuilder();
                jdbcUrl.append("jdbc:postgresql://").append(host).append(":").append(port).append("/").append(database);

                String query = uri.getQuery();
                if (query != null && !query.isBlank()) {
                    jdbcUrl.append("?").append(query);
                    if (!query.contains("sslmode=")) {
                        jdbcUrl.append("&sslmode=require");
                    }
                } else if (isProd || (!"localhost".equalsIgnoreCase(host) && !"127.0.0.1".equals(host))) {
                    jdbcUrl.append("?sslmode=require");
                }

                properties.setUrl(jdbcUrl.toString());
                properties.setDriverClassName("org.postgresql.Driver");
                log.info("Successfully normalized PostgreSQL JDBC connection to {}:{}/{}", host, port, database);
                return;
            }

            // 3. Handle JDBC style: jdbc:postgresql://...
            if (trimmedUrl.startsWith("jdbc:postgresql://")) {
                properties.setDriverClassName("org.postgresql.Driver");

                // Enforce SSL if remote connection or production profile and sslmode is omitted
                boolean isLocalhost = trimmedUrl.contains("localhost") || trimmedUrl.contains("127.0.0.1");
                if ((isProd || !isLocalhost) && !trimmedUrl.contains("sslmode=") && !trimmedUrl.contains("ssl=")) {
                    String separator = trimmedUrl.contains("?") ? "&" : "?";
                    String securedUrl = trimmedUrl + separator + "sslmode=require";
                    properties.setUrl(securedUrl);
                    log.info("Enforced SSL transport (sslmode=require) on PostgreSQL JDBC connection.");
                }
            }
        } catch (Exception e) {
            log.warn("Could not parse database URL format. Preserving original connection string: {}", e.getMessage());
        }
    }
}
