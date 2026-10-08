package com.tryitcafe;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

@SpringBootApplication
public class TryItCafeApplication {

    public static void main(String[] args) {
        loadDotEnv();
        SpringApplication.run(TryItCafeApplication.class, args);
    }

    private static void loadDotEnv() {
        List<Path> candidatePaths = List.of(
                Path.of(".env"),
                Path.of("backend/.env"),
                Path.of("../.env")
        );
        for (Path path : candidatePaths) {
            if (Files.exists(path)) {
                try {
                    List<String> lines = Files.readAllLines(path);
                    for (String line : lines) {
                        line = line.trim();
                        if (line.isEmpty() || line.startsWith("#") || !line.contains("=")) {
                            continue;
                        }
                        int eqIdx = line.indexOf('=');
                        String key = line.substring(0, eqIdx).trim();
                        String val = line.substring(eqIdx + 1).trim();
                        if ((val.startsWith("\"") && val.endsWith("\"")) || (val.startsWith("'") && val.endsWith("'"))) {
                            val = val.substring(1, val.length() - 1);
                        }
                        if (System.getProperty(key) == null && System.getenv(key) == null) {
                            System.setProperty(key, val);
                        }
                        if ("SPRING_PROFILES_ACTIVE".equalsIgnoreCase(key) && System.getProperty("spring.profiles.active") == null) {
                            System.setProperty("spring.profiles.active", val);
                        }
                    }
                    break;
                } catch (Exception ignored) {
                }
            }
        }
    }
}
