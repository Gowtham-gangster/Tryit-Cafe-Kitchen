package com.tryitcafe.controller;

import com.tryitcafe.model.dto.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestController
public class HealthController {

    private static final Logger log = LoggerFactory.getLogger(HealthController.class);
    private final DataSource dataSource;

    public HealthController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @GetMapping({"/health", "/api/health", "/api/v1/health"})
    public ResponseEntity<ApiResponse<Map<String, Object>>> getHealthStatus() {
        boolean dbHealthy = false;
        try (Connection conn = dataSource.getConnection()) {
            dbHealthy = conn.isValid(2);
        } catch (Exception e) {
            log.warn("Health check: Database connectivity check failed: {}", e.getMessage());
        }

        Map<String, Object> status = new HashMap<>();
        status.put("service", "TryIt Cafe & Kitchen REST API");
        status.put("version", "1.0.0");
        status.put("timestamp", Instant.now().toString());
        status.put("database", dbHealthy ? "UP" : "DOWN");
        status.put("status", dbHealthy ? "UP" : "DEGRADED");

        if (dbHealthy) {
            return ResponseEntity.ok(ApiResponse.ok("TryIt Cafe Backend is healthy and running", status));
        } else {
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .body(ApiResponse.error("TryIt Cafe Backend database connectivity degraded", status));
        }
    }
}

