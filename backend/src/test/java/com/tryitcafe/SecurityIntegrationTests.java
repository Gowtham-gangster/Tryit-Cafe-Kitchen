package com.tryitcafe;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tryitcafe.config.JwtUtils;
import com.tryitcafe.model.entity.User;
import com.tryitcafe.model.enums.UserRole;
import com.tryitcafe.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
public class SecurityIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @Test
    @DisplayName("Health endpoint should be accessible publicly without authentication")
    void testHealthEndpointAccessible() throws Exception {
        mockMvc.perform(get("/api/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("UP"));
    }

    @Test
    @DisplayName("Public menu endpoint should be accessible without authentication")
    void testPublicMenuAccessible() throws Exception {
        mockMvc.perform(get("/api/v1/public/menu"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("Unauthenticated request to protected customer profile should return 401")
    void testUnauthenticatedCustomerProfileAccess() throws Exception {
        mockMvc.perform(get("/api/v1/customer/profile"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("Unauthenticated request to owner endpoint should return 401")
    void testUnauthenticatedOwnerAccess() throws Exception {
        mockMvc.perform(get("/api/v1/owner/menu"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("Customer token accessing owner endpoint should return 403 Forbidden")
    void testCustomerForbiddenFromOwnerEndpoints() throws Exception {
        User customer = userRepository.findByPhone("9876543210")
                .orElseGet(() -> userRepository.save(User.builder()
                        .phone("9876543210")
                        .fullName("Test Customer")
                        .passwordHash("hashed")
                        .role(UserRole.ROLE_CUSTOMER)
                        .active(true)
                        .build()));

        String token = jwtUtils.generateToken(customer);

        mockMvc.perform(get("/api/v1/owner/menu")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("Owner token accessing owner endpoint should return 200 OK")
    void testOwnerAccessingOwnerEndpoint() throws Exception {
        User owner = userRepository.findByPhone("9999999999")
                .orElseGet(() -> userRepository.save(User.builder()
                        .phone("9999999999")
                        .fullName("Owner")
                        .passwordHash("hashed")
                        .role(UserRole.ROLE_OWNER)
                        .active(true)
                        .build()));

        String token = jwtUtils.generateToken(owner);

        mockMvc.perform(get("/api/v1/owner/menu")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @DisplayName("Expired or malformed JWT token should return 401 Unauthorized")
    void testInvalidTokenAccess() throws Exception {
        mockMvc.perform(get("/api/v1/customer/profile")
                        .header("Authorization", "Bearer invalid.jwt.token.here"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false));
    }

    // =========================================================================
    // SEC-AUD-04: Method-Level Owner Authorization Tests on Direct Aliases
    // =========================================================================

    @Test
    @DisplayName("SEC-AUD-04: Customer token calling /api/owner/business/online-ordering should be rejected with 403")
    void testCustomerForbiddenFromDirectOwnerOrdering() throws Exception {
        User customer = userRepository.findByPhone("9876543210")
                .orElseGet(() -> userRepository.save(User.builder()
                        .phone("9876543210")
                        .fullName("Test Customer")
                        .passwordHash("hashed")
                        .role(UserRole.ROLE_CUSTOMER)
                        .active(true)
                        .build()));

        String token = jwtUtils.generateToken(customer);

        mockMvc.perform(get("/api/owner/business/online-ordering")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());

        mockMvc.perform(put("/api/owner/business/online-ordering")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"onlineOrderingEnabled\":false}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("SEC-AUD-04: Owner token calling /api/owner/business/online-ordering should succeed (200)")
    void testOwnerAllowedOnDirectOwnerOrdering() throws Exception {
        User owner = userRepository.findByPhone("9999999999")
                .orElseGet(() -> userRepository.save(User.builder()
                        .phone("9999999999")
                        .fullName("Owner")
                        .passwordHash("hashed")
                        .role(UserRole.ROLE_OWNER)
                        .active(true)
                        .build()));

        String token = jwtUtils.generateToken(owner);

        mockMvc.perform(get("/api/owner/business/online-ordering")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
