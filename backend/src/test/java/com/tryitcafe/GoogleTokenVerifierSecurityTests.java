package com.tryitcafe;

import com.tryitcafe.exception.UnauthorizedException;
import com.tryitcafe.service.GoogleTokenVerifierService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;
import org.springframework.web.client.RestClient;

import static org.junit.jupiter.api.Assertions.*;

public class GoogleTokenVerifierSecurityTests {

    @Test
    @DisplayName("SEC-01: Mock token must be strictly rejected when production profile is active")
    void testMockTokenRejectedInProduction() {
        MockEnvironment prodEnv = new MockEnvironment();
        prodEnv.setActiveProfiles("prod");

        RestClient.Builder builder = RestClient.builder();
        GoogleTokenVerifierService service = new GoogleTokenVerifierService(builder, prodEnv);

        UnauthorizedException ex = assertThrows(UnauthorizedException.class, () ->
                service.verify("mock_google_token_:123:attacker@example.com:Hacker"));

        assertTrue(ex.getMessage().contains("Mock Google authentication is disabled"));
    }

    @Test
    @DisplayName("SEC-01: Mock token must be rejected when no dev/test profile is active")
    void testMockTokenRejectedInDefaultEnvironment() {
        MockEnvironment emptyEnv = new MockEnvironment(); // No active profiles

        RestClient.Builder builder = RestClient.builder();
        GoogleTokenVerifierService service = new GoogleTokenVerifierService(builder, emptyEnv);

        UnauthorizedException ex = assertThrows(UnauthorizedException.class, () ->
                service.verify("mock_google_token_:123:attacker@example.com:Hacker"));

        assertTrue(ex.getMessage().contains("Mock Google authentication is disabled"));
    }

    @Test
    @DisplayName("SEC-01: Null or blank token must be rejected")
    void testBlankTokenRejected() {
        MockEnvironment devEnv = new MockEnvironment();
        devEnv.setActiveProfiles("dev");

        RestClient.Builder builder = RestClient.builder();
        GoogleTokenVerifierService service = new GoogleTokenVerifierService(builder, devEnv);

        assertThrows(UnauthorizedException.class, () -> service.verify(""));
        assertThrows(UnauthorizedException.class, () -> service.verify(null));
    }

    @Test
    @DisplayName("SEC-01: Invalid real Google token must be rejected via tokeninfo failure")
    void testInvalidGoogleTokenRejected() {
        MockEnvironment prodEnv = new MockEnvironment();
        prodEnv.setActiveProfiles("prod");

        RestClient.Builder builder = RestClient.builder();
        GoogleTokenVerifierService service = new GoogleTokenVerifierService(builder, prodEnv, "some-client-id");

        assertThrows(UnauthorizedException.class, () -> service.verify("invalid.google.token.value"));
    }

    // =========================================================================
    // SEC-AUD-01: Mandatory Audience & Client ID Verification Tests
    // =========================================================================

    @Test
    @DisplayName("SEC-AUD-01: Real token verification must be rejected when client ID is missing in production")
    void testMissingClientIdRejectedInProduction() {
        MockEnvironment prodEnv = new MockEnvironment();
        prodEnv.setActiveProfiles("prod");

        RestClient.Builder builder = RestClient.builder();
        GoogleTokenVerifierService service = new GoogleTokenVerifierService(builder, prodEnv, "");

        UnauthorizedException ex = assertThrows(UnauthorizedException.class, () ->
                service.verify("real.google.id.token"));

        assertTrue(ex.getMessage().contains("Google authentication is not configured"));
    }

    @Test
    @DisplayName("SEC-AUD-01: Real token verification must be rejected when client ID is blank in production")
    void testBlankClientIdRejectedInProduction() {
        MockEnvironment prodEnv = new MockEnvironment();
        prodEnv.setActiveProfiles("prod");

        RestClient.Builder builder = RestClient.builder();
        GoogleTokenVerifierService service = new GoogleTokenVerifierService(builder, prodEnv, "   ");

        UnauthorizedException ex = assertThrows(UnauthorizedException.class, () ->
                service.verify("real.google.id.token"));

        assertTrue(ex.getMessage().contains("Google authentication is not configured"));
    }

    @Test
    @DisplayName("SEC-AUD-01: Valid Google token with matching client ID is accepted")
    void testMatchingAudienceAccepted() {
        MockEnvironment prodEnv = new MockEnvironment();
        prodEnv.setActiveProfiles("prod");

        String configuredClientId = "tryit-cafe-app-id.apps.googleusercontent.com";
        RestClient.Builder builder = RestClient.builder();
        org.springframework.test.web.client.MockRestServiceServer server =
                org.springframework.test.web.client.MockRestServiceServer.bindTo(builder).build();

        long futureExp = (System.currentTimeMillis() / 1000) + 3600;
        String mockGoogleResponse = """
            {
                "iss": "https://accounts.google.com",
                "aud": "tryit-cafe-app-id.apps.googleusercontent.com",
                "sub": "google-user-sub-12345",
                "email": "customer@example.com",
                "email_verified": "true",
                "name": "TryIt Customer",
                "picture": "https://lh3.googleusercontent.com/a/pic.jpg",
                "exp": %d
            }
            """.formatted(futureExp);

        server.expect(org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo(
                        org.hamcrest.Matchers.containsString("/tokeninfo?id_token=valid_test_token")))
                .andRespond(org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess(
                        mockGoogleResponse, org.springframework.http.MediaType.APPLICATION_JSON));

        GoogleTokenVerifierService service = new GoogleTokenVerifierService(builder, prodEnv, configuredClientId);
        GoogleTokenVerifierService.GoogleIdTokenClaims claims = service.verify("valid_test_token");

        assertNotNull(claims);
        assertEquals("google-user-sub-12345", claims.subject());
        assertEquals("customer@example.com", claims.email());
        assertTrue(claims.emailVerified());
        server.verify();
    }

    @Test
    @DisplayName("SEC-AUD-01: Correct signature & issuer but wrong audience must be strictly rejected")
    void testMismatchedAudienceRejected() {
        MockEnvironment prodEnv = new MockEnvironment();
        prodEnv.setActiveProfiles("prod");

        String configuredClientId = "tryit-cafe-app-id.apps.googleusercontent.com";
        RestClient.Builder builder = RestClient.builder();
        org.springframework.test.web.client.MockRestServiceServer server =
                org.springframework.test.web.client.MockRestServiceServer.bindTo(builder).build();

        long futureExp = (System.currentTimeMillis() / 1000) + 3600;
        String foreignTokenResponse = """
            {
                "iss": "https://accounts.google.com",
                "aud": "attacker-foreign-app-id.apps.googleusercontent.com",
                "sub": "google-user-sub-12345",
                "email": "victim@example.com",
                "email_verified": "true",
                "name": "TryIt Customer",
                "exp": %d
            }
            """.formatted(futureExp);

        server.expect(org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo(
                        org.hamcrest.Matchers.containsString("/tokeninfo?id_token=foreign_app_token")))
                .andRespond(org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess(
                        foreignTokenResponse, org.springframework.http.MediaType.APPLICATION_JSON));

        GoogleTokenVerifierService service = new GoogleTokenVerifierService(builder, prodEnv, configuredClientId);

        UnauthorizedException ex = assertThrows(UnauthorizedException.class, () ->
                service.verify("foreign_app_token"));

        assertTrue(ex.getMessage().contains("Google client ID mismatch"));
        server.verify();
    }

    @Test
    @DisplayName("SEC-AUD-01: Token missing aud claim must be strictly rejected")
    void testMissingAudienceClaimRejected() {
        MockEnvironment prodEnv = new MockEnvironment();
        prodEnv.setActiveProfiles("prod");

        String configuredClientId = "tryit-cafe-app-id.apps.googleusercontent.com";
        RestClient.Builder builder = RestClient.builder();
        org.springframework.test.web.client.MockRestServiceServer server =
                org.springframework.test.web.client.MockRestServiceServer.bindTo(builder).build();

        long futureExp = (System.currentTimeMillis() / 1000) + 3600;
        String noAudResponse = """
            {
                "iss": "https://accounts.google.com",
                "sub": "google-user-sub-12345",
                "email": "victim@example.com",
                "email_verified": "true",
                "exp": %d
            }
            """.formatted(futureExp);

        server.expect(org.springframework.test.web.client.match.MockRestRequestMatchers.requestTo(
                        org.hamcrest.Matchers.containsString("/tokeninfo?id_token=no_aud_token")))
                .andRespond(org.springframework.test.web.client.response.MockRestResponseCreators.withSuccess(
                        noAudResponse, org.springframework.http.MediaType.APPLICATION_JSON));

        GoogleTokenVerifierService service = new GoogleTokenVerifierService(builder, prodEnv, configuredClientId);

        UnauthorizedException ex = assertThrows(UnauthorizedException.class, () ->
                service.verify("no_aud_token"));

        assertTrue(ex.getMessage().contains("audience claim is missing"));
        server.verify();
    }
}
