package com.tryitcafe;

import com.tryitcafe.exception.BadRequestException;
import com.tryitcafe.exception.UnauthorizedException;
import com.tryitcafe.model.dto.AuthDtos.*;
import com.tryitcafe.model.enums.UserRole;
import com.tryitcafe.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("dev")
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
public class AuthServiceTests {

    @Autowired
    private AuthService authService;

    @Test
    @DisplayName("Should successfully register a new customer")
    void testSuccessfulRegistration() {
        RegisterRequest request = new RegisterRequest();
        request.setPhone("9123456789");
        request.setFullName("Priya Sharma");
        request.setEmail("priya@example.com");
        request.setPassword("PriyaPass@123");

        AuthResponse response = authService.registerCustomer(request);

        assertNotNull(response);
        assertNotNull(response.getToken());
        assertEquals("9123456789", response.getPhone());
        assertEquals("Priya Sharma", response.getFullName());
        assertEquals(UserRole.ROLE_CUSTOMER, response.getRole());
    }

    @Test
    @DisplayName("Should reject registration with duplicate phone")
    void testDuplicatePhoneRegistration() {
        RegisterRequest request1 = new RegisterRequest();
        request1.setPhone("9000000001");
        request1.setFullName("User One");
        request1.setEmail("user1@example.com");
        request1.setPassword("Password123");
        authService.registerCustomer(request1);

        RegisterRequest request2 = new RegisterRequest();
        request2.setPhone("9000000001");
        request2.setFullName("User Two");
        request2.setEmail("user2@example.com");
        request2.setPassword("Password123");

        BadRequestException ex = assertThrows(BadRequestException.class, () -> authService.registerCustomer(request2));
        assertTrue(ex.getMessage().contains("Phone number is already registered"));
    }

    @Test
    @DisplayName("Should reject registration with duplicate email")
    void testDuplicateEmailRegistration() {
        RegisterRequest request1 = new RegisterRequest();
        request1.setPhone("9000000002");
        request1.setFullName("User One");
        request1.setEmail("common@example.com");
        request1.setPassword("Password123");
        authService.registerCustomer(request1);

        RegisterRequest request2 = new RegisterRequest();
        request2.setPhone("9000000003");
        request2.setFullName("User Two");
        request2.setEmail("common@example.com");
        request2.setPassword("Password123");

        BadRequestException ex = assertThrows(BadRequestException.class, () -> authService.registerCustomer(request2));
        assertTrue(ex.getMessage().contains("Email address is already in use"));
    }

    @Test
    @DisplayName("Should login successfully with valid credentials")
    void testSuccessfulLogin() {
        LoginRequest request = new LoginRequest();
        request.setPhone("9876543210");
        request.setPassword("Customer@TryIt2026");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertNotNull(response.getToken());
        assertEquals("9876543210", response.getPhone());
    }

    @Test
    @DisplayName("Should reject login with invalid password")
    void testInvalidPasswordLogin() {
        LoginRequest request = new LoginRequest();
        request.setPhone("9876543210");
        request.setPassword("WrongPassword");

        assertThrows(UnauthorizedException.class, () -> authService.login(request));
    }

    @Test
    @DisplayName("Should reject owner login if user does not have owner role")
    void testCustomerDeniedOwnerLogin() {
        LoginRequest request = new LoginRequest();
        request.setPhone("9876543210");
        request.setPassword("Customer@TryIt2026");

        assertThrows(UnauthorizedException.class, () -> authService.loginOwner(request));
    }
}
