package com.tryitcafe;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tryitcafe.model.dto.AuthDtos.GoogleAuthRequest;
import com.tryitcafe.model.entity.User;
import com.tryitcafe.model.enums.UserRole;
import com.tryitcafe.repository.CustomerLocationRepository;
import com.tryitcafe.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
public class GoogleAuthIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CustomerLocationRepository customerLocationRepository;

    @BeforeEach
    void setUp() {
        java.util.List.of("newgoogler@gmail.com", "onboarded@gmail.com", "existing_googler@gmail.com", "local_user@gmail.com")
                .forEach(email -> userRepository.findByEmail(email).ifPresent(user -> {
                    customerLocationRepository.findByCustomerId(user.getId())
                            .forEach(customerLocationRepository::delete);
                    userRepository.delete(user);
                }));
    }

    @Test
    void testGoogleSignIn_NewUser_NeedsProfileCompletion() throws Exception {
        GoogleAuthRequest request = new GoogleAuthRequest();
        request.setIdToken("mock_google_token_:goog_sub_101:newgoogler@gmail.com:Google Explorer");

        mockMvc.perform(post("/api/v1/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.needsProfileCompletion").value(true))
                .andExpect(jsonPath("$.data.googleSubject").value("goog_sub_101"))
                .andExpect(jsonPath("$.data.email").value("newgoogler@gmail.com"))
                .andExpect(jsonPath("$.data.fullName").value("Google Explorer"))
                .andExpect(jsonPath("$.data.authResponse").doesNotExist());
    }

    @Test
    void testGoogleSignIn_NewUser_CompleteRegistration() throws Exception {
        GoogleAuthRequest request = new GoogleAuthRequest();
        request.setIdToken("mock_google_token_:goog_sub_102:registeredgoogler@gmail.com:John Doe");
        request.setPhone("9123456780");
        request.setFullName("John Doe");
        request.setLocationLabel("Home");
        request.setAddress("Gandi Maisamma, Hyderabad");
        request.setLatitude(17.5765);
        request.setLongitude(78.4200);

        mockMvc.perform(post("/api/v1/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.needsProfileCompletion").value(false))
                .andExpect(jsonPath("$.data.authResponse.token").isNotEmpty())
                .andExpect(jsonPath("$.data.authResponse.phone").value("9123456780"))
                .andExpect(jsonPath("$.data.authResponse.email").value("registeredgoogler@gmail.com"))
                .andExpect(jsonPath("$.data.authResponse.fullName").value("John Doe"))
                .andExpect(jsonPath("$.data.authResponse.role").value("ROLE_CUSTOMER"));

        // Verify user and location saved
        User created = userRepository.findByGoogleSubject("goog_sub_102").orElseThrow();
        assertEquals("registeredgoogler@gmail.com", created.getEmail());
        assertEquals("GOOGLE", created.getAuthProvider());
        assertEquals(1, customerLocationRepository.findByCustomerIdOrderByIsDefaultDescCreatedAtDesc(created.getId()).size());
    }

    @Test
    void testGoogleSignIn_ExistingCustomer_LogsInDirectly() throws Exception {
        // Pre-create user with googleSubject and phone
        User existing = User.builder()
                .phone("9111222333")
                .fullName("Existing Google User")
                .email("existing@gmail.com")
                .googleSubject("goog_sub_103")
                .authProvider("GOOGLE")
                .role(UserRole.ROLE_CUSTOMER)
                .active(true)
                .build();
        userRepository.save(existing);

        GoogleAuthRequest request = new GoogleAuthRequest();
        request.setIdToken("mock_google_token_:goog_sub_103:existing@gmail.com:Existing Google User");

        mockMvc.perform(post("/api/v1/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.needsProfileCompletion").value(false))
                .andExpect(jsonPath("$.data.authResponse.token").isNotEmpty())
                .andExpect(jsonPath("$.data.authResponse.phone").value("9111222333"))
                .andExpect(jsonPath("$.data.authResponse.email").value("existing@gmail.com"));
    }

    @Test
    void testGoogleSignIn_ExistingEmailLinking_LinksAndLogsIn() throws Exception {
        // Pre-create local user with same email
        User localUser = User.builder()
                .phone("9444555666")
                .fullName("Local Customer")
                .email("local@gmail.com")
                .passwordHash("$2a$10$abcdefghijklmnopqrstuvwxyz1234567890")
                .role(UserRole.ROLE_CUSTOMER)
                .authProvider("LOCAL")
                .active(true)
                .build();
        userRepository.save(localUser);

        GoogleAuthRequest request = new GoogleAuthRequest();
        request.setIdToken("mock_google_token_:goog_sub_104:local@gmail.com:Local Customer");

        mockMvc.perform(post("/api/v1/auth/google")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.needsProfileCompletion").value(false))
                .andExpect(jsonPath("$.data.authResponse.token").isNotEmpty())
                .andExpect(jsonPath("$.data.authResponse.phone").value("9444555666"));

        // Verify googleSubject linked
        User updated = userRepository.findByEmail("local@gmail.com").orElseThrow();
        assertEquals("goog_sub_104", updated.getGoogleSubject());
        assertEquals("GOOGLE", updated.getAuthProvider());
    }

    @Test
    void testGoogleSignIn_OwnerAccount_Rejected() throws Exception {
        // Find owner account
        User owner = userRepository.findAll().stream()
                .filter(u -> u.getRole() == UserRole.ROLE_OWNER)
                .findFirst()
                .orElse(null);

        if (owner != null && owner.getEmail() != null && !owner.getEmail().isBlank()) {
            GoogleAuthRequest request = new GoogleAuthRequest();
            request.setIdToken("mock_google_token_:goog_sub_owner:" + owner.getEmail() + ":Owner Admin");

            mockMvc.perform(post("/api/v1/auth/google")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isUnauthorized());
        }
    }
}
