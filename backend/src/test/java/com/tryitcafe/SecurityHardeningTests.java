package com.tryitcafe;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tryitcafe.config.JwtUtils;
import com.tryitcafe.model.dto.AuthDtos.LoginRequest;
import com.tryitcafe.model.dto.AuthDtos.RegisterRequest;
import com.tryitcafe.model.dto.AuthDtos.UpdateProfileRequest;
import com.tryitcafe.model.dto.ReviewDtos.ReviewCreateRequest;
import com.tryitcafe.model.entity.User;
import com.tryitcafe.model.enums.UserRole;
import com.tryitcafe.repository.UserRepository;
import com.tryitcafe.service.RateLimiterService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
public class SecurityHardeningTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private RateLimiterService rateLimiterService;

    @BeforeEach
    void setUp() {
        rateLimiterService.resetForTesting();
    }

    // ==========================================================
    // SEC-02: Path Traversal Tests on Media Endpoint
    // ==========================================================

    @Test
    @DisplayName("SEC-02: Legitimate nonexistent media request should return 404")
    void testLegitimateNonexistentMedia() throws Exception {
        mockMvc.perform(get("/api/v1/public/media/gallery/nonexistent_dish.jpg"))
                .andExpect(status().isNotFound());
    }

    @Test
    @DisplayName("SEC-02: Path traversal attempt with relative dots should be rejected (400 or 403)")
    void testTraversalWithDotsRejected() throws Exception {
        mockMvc.perform(get("/api/v1/public/media/gallery/../../application.yml"))
                .andExpect(status().is(org.hamcrest.Matchers.isOneOf(400, 403)));
    }

    @Test
    @DisplayName("SEC-02: Path traversal attempt targeting root directory should be rejected (400 or 403)")
    void testTraversalRootEscapeRejected() throws Exception {
        mockMvc.perform(get("/api/v1/public/media/gallery/../../../etc/passwd"))
                .andExpect(status().is(org.hamcrest.Matchers.isOneOf(400, 403)));
    }

    @Test
    @DisplayName("SEC-02: Path traversal with backslashes should be rejected (400 or 403)")
    void testTraversalWithBackslashesRejected() throws Exception {
        mockMvc.perform(get("/api/v1/public/media/gallery/..\\..\\secret.txt"))
                .andExpect(status().is(org.hamcrest.Matchers.isOneOf(400, 403)));
    }

    @Test
    @DisplayName("SEC-02: Access to unauthorized media folder should return 403 Forbidden")
    void testUnauthorizedFolderRejected() throws Exception {
        mockMvc.perform(get("/api/v1/public/media/system_secrets/keys.txt"))
                .andExpect(status().isForbidden());
    }

    // ==========================================================
    // SEC-04: CORS Hardening Tests
    // ==========================================================

    @Test
    @DisplayName("SEC-04: Preflight request from trusted origin should include CORS headers")
    void testTrustedOriginCorsAccepted() throws Exception {
        mockMvc.perform(options("/api/v1/public/menu")
                        .header("Origin", "http://localhost:5173")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string("Access-Control-Allow-Origin", "http://localhost:5173"))
                .andExpect(header().string("Access-Control-Allow-Credentials", "true"));
    }

    @Test
    @DisplayName("SEC-04: Preflight request from untrusted origin should not reflect origin")
    void testUntrustedOriginCorsRejected() throws Exception {
        mockMvc.perform(options("/api/v1/public/menu")
                        .header("Origin", "http://malicious-attacker-domain.com")
                        .header("Access-Control-Request-Method", "GET"))
                .andExpect(status().isForbidden());
    }

    // ==========================================================
    // SEC-07: Rate Limiting Tests
    // ==========================================================

    @Test
    @DisplayName("SEC-07: Excessive failed logins should trigger HTTP 429 Too Many Requests")
    void testLoginRateLimitingTriggered() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setPhone("9988776655");
        req.setPassword("WrongPassword123");

        // First 5 attempts consume the bucket tokens
        for (int i = 0; i < 5; i++) {
            mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isUnauthorized());
        }

        // 6th attempt within same minute must be blocked by rate limiter with 429
        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().exists("Retry-After"))
                .andExpect(jsonPath("$.code").value("RATE_LIMIT_EXCEEDED"));
    }

    @Test
    @DisplayName("SEC-07: Customer review rate limiter enforces maximum 3 submissions per hour")
    void testReviewSubmissionRateLimitingTriggered() {
        String customerId = "test-customer-uuid-12345";

        // First 3 submissions are permitted
        assertDoesNotThrow(() -> rateLimiterService.checkReviewRateLimit(customerId));
        assertDoesNotThrow(() -> rateLimiterService.checkReviewRateLimit(customerId));
        assertDoesNotThrow(() -> rateLimiterService.checkReviewRateLimit(customerId));

        // 4th submission exceeds the 3/hour capacity and throws RateLimitExceededException
        com.tryitcafe.exception.RateLimitExceededException ex =
                assertThrows(com.tryitcafe.exception.RateLimitExceededException.class,
                        () -> rateLimiterService.checkReviewRateLimit(customerId));

        org.junit.jupiter.api.Assertions.assertTrue(ex.getMessage().contains("Review submission limit reached"));
        org.junit.jupiter.api.Assertions.assertEquals(3600, ex.getRetryAfterSeconds());
    }

    // ==========================================================
    // SEC-09: Password Policy Tests
    // ==========================================================

    @Test
    @DisplayName("SEC-09: Registration with weak password (< 8 chars) should fail validation")
    void testWeakPasswordRejectedShort() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setPhone("9888877771");
        req.setFullName("Weak User");
        req.setEmail("weak1@example.com");
        req.setPassword("Abc1"); // Only 4 chars

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.data.password").isNotEmpty());
    }

    @Test
    @DisplayName("SEC-09: Registration with password lacking uppercase or digits should fail validation")
    void testWeakPasswordRejectedNoDigitsOrUppercase() throws Exception {
        RegisterRequest req = new RegisterRequest();
        req.setPhone("9888877772");
        req.setFullName("Weak User");
        req.setEmail("weak2@example.com");
        req.setPassword("lowercaseonlypass");

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.data.password").isNotEmpty());
    }

    // ==========================================================
    // SEC-AUD-02: Rate Limiting Header Spoofing Protection
    // ==========================================================

    @Test
    @DisplayName("SEC-AUD-02: Spoofed X-Forwarded-For header cannot evade rate limit when requests arrive from same socket")
    void testSpoofedXForwardedForCannotBypassRateLimit() throws Exception {
        LoginRequest req = new LoginRequest();
        req.setPhone("9988776655");
        req.setPassword("WrongPassword123!");

        // Fire 5 requests with different spoofed X-Forwarded-For headers
        for (int i = 1; i <= 5; i++) {
            mockMvc.perform(post("/api/v1/auth/login")
                            .header("X-Forwarded-For", "203.0.113." + i)
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(req)))
                    .andExpect(status().isUnauthorized());
        }

        // 6th attempt must be blocked by rate limiter despite different X-Forwarded-For header
        mockMvc.perform(post("/api/v1/auth/login")
                        .header("X-Forwarded-For", "203.0.113.99")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().exists("Retry-After"));
    }

    // ==========================================================
    // SEC-AUD-05: Profile Image URL Validation Tests
    // ==========================================================

    @Test
    @DisplayName("SEC-AUD-05: Profile update with valid HTTPS Cloudinary URL should succeed")
    void testValidHttpsProfileImageUrlAccepted() throws Exception {
        User customer = userRepository.findByPhone("9876543210")
                .orElseGet(() -> userRepository.save(User.builder()
                        .phone("9876543210")
                        .fullName("Test Customer")
                        .passwordHash("hashed")
                        .role(UserRole.ROLE_CUSTOMER)
                        .active(true)
                        .build()));

        String token = jwtUtils.generateToken(customer);

        UpdateProfileRequest req = new UpdateProfileRequest();
        req.setFullName("Updated Customer Name");
        req.setProfileImageUrl("https://res.cloudinary.com/tryitcafe/image/upload/v123456789/profile.jpg");

        mockMvc.perform(put("/api/v1/customer/profile")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.profileImageUrl").value("https://res.cloudinary.com/tryitcafe/image/upload/v123456789/profile.jpg"));
    }

    @Test
    @DisplayName("SEC-AUD-05: Profile update with insecure http:// URL should be rejected (400)")
    void testInsecureHttpProfileImageUrlRejected() throws Exception {
        User customer = userRepository.findByPhone("9876543210")
                .orElseGet(() -> userRepository.save(User.builder()
                        .phone("9876543210")
                        .fullName("Test Customer")
                        .passwordHash("hashed")
                        .role(UserRole.ROLE_CUSTOMER)
                        .active(true)
                        .build()));
        String token = jwtUtils.generateToken(customer);

        UpdateProfileRequest req = new UpdateProfileRequest();
        req.setFullName("Test Customer");
        req.setProfileImageUrl("http://insecure.example.com/avatar.jpg");

        mockMvc.perform(put("/api/v1/customer/profile")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("SEC-AUD-05: Profile update with javascript: URL scheme must be rejected (400)")
    void testJavascriptProfileImageUrlRejected() throws Exception {
        User customer = userRepository.findByPhone("9876543210")
                .orElseGet(() -> userRepository.save(User.builder()
                        .phone("9876543210")
                        .fullName("Test Customer")
                        .passwordHash("hashed")
                        .role(UserRole.ROLE_CUSTOMER)
                        .active(true)
                        .build()));
        String token = jwtUtils.generateToken(customer);

        UpdateProfileRequest req = new UpdateProfileRequest();
        req.setFullName("Test Customer");
        req.setProfileImageUrl("javascript:alert(1)");

        mockMvc.perform(put("/api/v1/customer/profile")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("SEC-AUD-05: Profile update with data: URL scheme must be rejected (400)")
    void testDataUriProfileImageUrlRejected() throws Exception {
        User customer = userRepository.findByPhone("9876543210")
                .orElseGet(() -> userRepository.save(User.builder()
                        .phone("9876543210")
                        .fullName("Test Customer")
                        .passwordHash("hashed")
                        .role(UserRole.ROLE_CUSTOMER)
                        .active(true)
                        .build()));
        String token = jwtUtils.generateToken(customer);

        UpdateProfileRequest req = new UpdateProfileRequest();
        req.setFullName("Test Customer");
        req.setProfileImageUrl("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA");

        mockMvc.perform(put("/api/v1/customer/profile")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("SEC-AUD-05: Profile update with excessively long URL (> 500 chars) must be rejected (400)")
    void testExcessivelyLongProfileImageUrlRejected() throws Exception {
        User customer = userRepository.findByPhone("9876543210")
                .orElseGet(() -> userRepository.save(User.builder()
                        .phone("9876543210")
                        .fullName("Test Customer")
                        .passwordHash("hashed")
                        .role(UserRole.ROLE_CUSTOMER)
                        .active(true)
                        .build()));
        String token = jwtUtils.generateToken(customer);

        UpdateProfileRequest req = new UpdateProfileRequest();
        req.setFullName("Test Customer");
        req.setProfileImageUrl("https://example.com/" + "a".repeat(510));

        mockMvc.perform(put("/api/v1/customer/profile")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest());
    }
}
