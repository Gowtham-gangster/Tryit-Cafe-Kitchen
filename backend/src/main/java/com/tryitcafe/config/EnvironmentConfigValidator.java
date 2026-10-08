package com.tryitcafe.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.util.Arrays;

/**
 * Validates critical infrastructure environment variables on application startup.
 * Prevents the application from silently starting with insecure or missing configurations.
 * NEVER logs secret values.
 */
@Component
public class EnvironmentConfigValidator implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(EnvironmentConfigValidator.class);

    private final Environment environment;

    @Value("${app.jwt.secret:}")
    private String jwtSecret;

    public EnvironmentConfigValidator(Environment environment) {
        this.environment = environment;
    }

    @Override
    public void run(ApplicationArguments args) {
        boolean isProd = Arrays.asList(environment.getActiveProfiles()).contains("prod");

        if (jwtSecret == null || jwtSecret.isBlank()) {
            if (isProd) {
                throw new IllegalStateException("CRITICAL CONFIGURATION ERROR: Missing required environment variable 'JWT_SECRET'. Application cannot start securely in production.");
            } else {
                log.warn("Running in development mode without explicit JWT_SECRET. Using development fallback.");
            }
        } else if (jwtSecret.length() < 32) {
            throw new IllegalStateException("CRITICAL CONFIGURATION ERROR: 'JWT_SECRET' must be at least 32 characters (256 bits) for HMAC-SHA256 signing.");
        }

        if (isProd) {
            String dbUrl = environment.getProperty("spring.datasource.url");
            if (dbUrl == null || dbUrl.isBlank()) {
                throw new IllegalStateException("CRITICAL CONFIGURATION ERROR: Missing required database connection URL in production. Please set 'SPRING_DATASOURCE_URL' or 'DATABASE_URL'.");
            }

            String dbUser = environment.getProperty("spring.datasource.username");
            if ((dbUser == null || dbUser.isBlank()) && !dbUrl.contains("@")) {
                throw new IllegalStateException("CRITICAL CONFIGURATION ERROR: Missing required database username in production. Please set 'SPRING_DATASOURCE_USERNAME' or 'DATABASE_USERNAME'.");
            }

            String dbPass = environment.getProperty("spring.datasource.password");
            if ((dbPass == null || dbPass.isBlank()) && !dbUrl.contains("@")) {
                throw new IllegalStateException("CRITICAL CONFIGURATION ERROR: Missing required database password in production. Please set 'SPRING_DATASOURCE_PASSWORD' or 'DATABASE_PASSWORD'.");
            }

            if (jwtSecret.contains("dev_secret_key_for_local_testing_only")) {
                throw new IllegalStateException("CRITICAL SECURITY ERROR: Development JWT secret is not allowed in production profile! Provide a secure unique JWT_SECRET.");
            }

            String corsOrigins = environment.getProperty("app.cors.allowed-origins");
            if (corsOrigins == null || corsOrigins.isBlank()) {
                throw new IllegalStateException("CRITICAL CONFIGURATION ERROR: Missing required environment variable 'CORS_ALLOWED_ORIGINS' in production.");
            }

            String googleClientId = environment.getProperty("app.google.client-id");
            if (googleClientId == null || googleClientId.isBlank()) {
                log.warn("SECURITY NOTICE: 'GOOGLE_CLIENT_ID' is not configured in production. Google OAuth sign-in will be strictly disabled until configured.");
            }

            String cloudinaryCloud = environment.getProperty("app.cloudinary.cloud-name");
            if (cloudinaryCloud == null || cloudinaryCloud.isBlank()) {
                throw new IllegalStateException("CRITICAL CONFIGURATION ERROR: Missing required environment variable 'CLOUDINARY_CLOUD_NAME' in production.");
            }

            String cloudinaryKey = environment.getProperty("app.cloudinary.api-key");
            if (cloudinaryKey == null || cloudinaryKey.isBlank()) {
                throw new IllegalStateException("CRITICAL CONFIGURATION ERROR: Missing required environment variable 'CLOUDINARY_API_KEY' in production.");
            }

            String cloudinarySecret = environment.getProperty("app.cloudinary.api-secret");
            if (cloudinarySecret == null || cloudinarySecret.isBlank()) {
                throw new IllegalStateException("CRITICAL CONFIGURATION ERROR: Missing required environment variable 'CLOUDINARY_API_SECRET' in production.");
            }

            log.info("Production configuration validation passed: All critical infrastructure environment variables are properly configured.");
        } else {
            log.info("Development configuration active. Local dev profiles initialized.");
        }
    }
}
