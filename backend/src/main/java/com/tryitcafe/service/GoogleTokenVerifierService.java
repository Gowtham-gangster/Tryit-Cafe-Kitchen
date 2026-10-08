package com.tryitcafe.service;

import com.tryitcafe.exception.UnauthorizedException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
public class GoogleTokenVerifierService {

    private static final Logger log = LoggerFactory.getLogger(GoogleTokenVerifierService.class);

    private static final List<String> VALID_ISSUERS = List.of(
            "accounts.google.com",
            "https://accounts.google.com"
    );

    @Value("${app.google.client-id:}")
    private String configuredClientId;

    private final org.springframework.core.env.Environment environment;
    private final RestClient restClient;

    @org.springframework.beans.factory.annotation.Autowired
    public GoogleTokenVerifierService(RestClient.Builder restClientBuilder,
                                      org.springframework.core.env.Environment environment) {
        this.environment = environment;
        this.restClient = restClientBuilder
                .baseUrl("https://oauth2.googleapis.com")
                .build();
        this.configuredClientId = environment.getProperty("app.google.client-id", "");
    }

    public GoogleTokenVerifierService(RestClient.Builder restClientBuilder,
                                      org.springframework.core.env.Environment environment,
                                      String configuredClientId) {
        this.environment = environment;
        this.restClient = restClientBuilder
                .baseUrl("https://oauth2.googleapis.com")
                .build();
        this.configuredClientId = configuredClientId != null ? configuredClientId.trim() : "";
    }

    public record GoogleIdTokenClaims(
            String subject,
            String email,
            boolean emailVerified,
            String name,
            String pictureUrl
    ) {}

    private boolean isMockAuthPermitted() {
        java.util.List<String> activeProfiles = java.util.Arrays.asList(environment.getActiveProfiles());
        if (activeProfiles.contains("prod")) {
            return false;
        }
        return activeProfiles.contains("dev") || activeProfiles.contains("test");
    }

    /**
     * Verifies the Google ID Token with Google Identity Services.
     * Validates signature, issuer, audience, expiration, email and email verification.
     */
    public GoogleIdTokenClaims verify(String idToken) {
        if (idToken == null || idToken.isBlank()) {
            throw new UnauthorizedException("Google ID token is required");
        }

        // Support mock tokens ONLY in dev/test profiles when prod profile is NOT active
        if (idToken.startsWith("mock_google_token_")) {
            if (!isMockAuthPermitted()) {
                log.warn("Rejected mock Google token in non-development environment");
                throw new UnauthorizedException("Mock Google authentication is disabled in this environment.");
            }
            return handleMockToken(idToken);
        }

        // Unconditional Client ID verification: Google sign-in is disabled if client ID is unconfigured
        String effectiveClientId = configuredClientId != null ? configuredClientId.trim() : "";
        if (effectiveClientId.isEmpty()) {
            log.warn("Security Alert: Google authentication rejected because GOOGLE_CLIENT_ID is not configured");
            throw new UnauthorizedException("Google authentication is not configured in this application.");
        }

        try {
            Map<String, Object> payload = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/tokeninfo")
                            .queryParam("id_token", idToken.trim())
                            .build())
                    .retrieve()
                    .onStatus(HttpStatusCode::isError, (request, response) -> {
                        throw new UnauthorizedException("Unable to verify Google credential with Google Identity Services");
                    })
                    .body(new ParameterizedTypeReference<Map<String, Object>>() {});

            if (payload == null || payload.isEmpty()) {
                throw new UnauthorizedException("Empty response from Google verification service");
            }

            // 1. Verify Issuer
            String iss = (String) payload.get("iss");
            if (iss == null || !VALID_ISSUERS.contains(iss)) {
                log.warn("Rejected Google token with invalid issuer: {}", iss);
                throw new UnauthorizedException("Invalid Google token issuer");
            }

            // 2. Unconditional Audience / Client ID verification

            String aud = (String) payload.get("aud");
            if (aud == null || aud.isBlank()) {
                log.warn("Security Alert: Google token rejected because audience claim is missing");
                throw new UnauthorizedException("Invalid Google token: audience claim is missing.");
            }

            if (!aud.equals(effectiveClientId)) {
                log.warn("Security Alert: Google token audience mismatch: token aud='{}', configured='{}'", aud, effectiveClientId);
                throw new UnauthorizedException("Google client ID mismatch. Token was not issued for this application.");
            }

            // 3. Verify Expiration
            Object expObj = payload.get("exp");
            if (expObj != null) {
                long expSeconds = Long.parseLong(expObj.toString());
                if (expSeconds < Instant.now().getEpochSecond()) {
                    throw new UnauthorizedException("Google authentication token has expired. Please sign in again.");
                }
            }

            // 4. Verify Subject (Google User ID)
            String sub = (String) payload.get("sub");
            if (sub == null || sub.isBlank()) {
                throw new UnauthorizedException("Invalid Google token: missing subject identifier");
            }

            // 5. Verify Email and Email Verification Status
            String email = (String) payload.get("email");
            if (email == null || email.isBlank()) {
                throw new UnauthorizedException("Google account must provide an email address");
            }

            Object emailVerifiedObj = payload.get("email_verified");
            boolean emailVerified = emailVerifiedObj != null &&
                    ("true".equalsIgnoreCase(emailVerifiedObj.toString()) || Boolean.TRUE.equals(emailVerifiedObj));

            if (!emailVerified) {
                throw new UnauthorizedException("Your Google account email could not be verified. Please verify your email with Google.");
            }

            String name = (String) payload.get("name");
            String picture = (String) payload.get("picture");

            return new GoogleIdTokenClaims(sub, email.trim().toLowerCase(), true, name, picture);

        } catch (UnauthorizedException ue) {
            throw ue;
        } catch (Exception e) {
            log.error("Google token verification failed: {}", e.getMessage());
            throw new UnauthorizedException("Unable to sign in with Google. Please try again.");
        }
    }

    private GoogleIdTokenClaims handleMockToken(String mockToken) {
        String[] parts = mockToken.split(":");
        String sub = parts.length > 1 ? parts[1] : "mock_sub_12345";
        String email = parts.length > 2 ? parts[2] : "mockuser@gmail.com";
        String name = parts.length > 3 ? parts[3] : "Mock Google User";
        return new GoogleIdTokenClaims(sub, email, true, name, "https://lh3.googleusercontent.com/a/default-user");
    }
}
