package com.tryitcafe.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tryitcafe.model.dto.ApiResponse;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CorsConfigurationSource corsConfigurationSource;
    private final ObjectMapper objectMapper;

    private final org.springframework.core.env.Environment environment;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                          CorsConfigurationSource corsConfigurationSource,
                          ObjectMapper objectMapper,
                          org.springframework.core.env.Environment environment) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.corsConfigurationSource = corsConfigurationSource;
        this.objectMapper = objectMapper;
        this.environment = environment;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationEntryPoint authenticationEntryPoint() {
        return (request, response, authException) -> {
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            ApiResponse<Void> apiResponse = ApiResponse.error("Authentication required or token is invalid/expired");
            response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
        };
    }

    @Bean
    public AccessDeniedHandler accessDeniedHandler() {
        return (request, response, accessDeniedException) -> {
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            ApiResponse<Void> apiResponse = ApiResponse.error("Access denied: You do not have permission for this resource");
            response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
        };
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        boolean isDev = java.util.Arrays.asList(environment.getActiveProfiles()).contains("dev");

        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint(authenticationEntryPoint())
                        .accessDeniedHandler(accessDeniedHandler())
                )
                .authorizeHttpRequests(auth -> {
                    // Health & Diagnostics Endpoints
                    auth.requestMatchers("/health", "/api/health", "/api/v1/health").permitAll()
                            // Public Endpoints
                            .requestMatchers("/api/v1/auth/register", "/api/v1/auth/login", "/api/v1/auth/owner-login", "/api/v1/auth/google", "/api/v1/auth/forgot-password", "/api/v1/auth/verify-reset-token", "/api/v1/auth/reset-password").permitAll()
                            .requestMatchers("/api/v1/public/**", "/api/business/**", "/api/v1/business/**").permitAll()
                            .requestMatchers("/error").permitAll();

                    // Only permit H2 console in explicit dev profile - strictly forbidden in prod
                    if (isDev) {
                        auth.requestMatchers("/h2-console/**").permitAll();
                    }

                    // Authenticated Auth Profile Endpoints
                    auth.requestMatchers("/api/v1/auth/me", "/api/v1/auth/profile", "/api/v1/auth/account").authenticated()
                            // Customer & Order Endpoints
                            .requestMatchers("/api/v1/customer/**", "/api/orders/**", "/api/v1/orders/**", "/api/orders", "/api/v1/orders", "/api/checkout/**", "/api/v1/checkout/**", "/api/checkout", "/api/v1/checkout").hasAnyAuthority("ROLE_CUSTOMER", "ROLE_OWNER")
                            // Owner Dashboard Endpoints
                            .requestMatchers("/api/v1/owner/**", "/api/owner/**").hasAnyAuthority("ROLE_OWNER", "OWNER")
                            .anyRequest().authenticated();
                })
                .headers(headers -> {
                    if (isDev) {
                        headers.frameOptions(frame -> frame.sameOrigin());
                    } else {
                        headers.frameOptions(frame -> frame.deny());
                        headers.httpStrictTransportSecurity(hsts -> hsts
                                .includeSubDomains(true)
                                .maxAgeInSeconds(31536000));
                    }
                    headers.contentTypeOptions(contentType -> {});
                })
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
