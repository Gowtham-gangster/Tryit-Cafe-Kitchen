package com.tryitcafe.controller;

import com.tryitcafe.model.dto.ApiResponse;
import com.tryitcafe.model.dto.AuthDtos.*;
import com.tryitcafe.model.entity.User;
import com.tryitcafe.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final com.tryitcafe.service.RateLimiterService rateLimiterService;

    public AuthController(AuthService authService, com.tryitcafe.service.RateLimiterService rateLimiterService) {
        this.authService = authService;
        this.rateLimiterService = rateLimiterService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.registerCustomer(request);
        return ResponseEntity.ok(ApiResponse.ok("Registration successful", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            jakarta.servlet.http.HttpServletRequest httpRequest
    ) {
        rateLimiterService.checkLoginRateLimit(httpRequest, request.getPhone());
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }

    @PostMapping("/owner-login")
    public ResponseEntity<ApiResponse<AuthResponse>> ownerLogin(
            @Valid @RequestBody LoginRequest request,
            jakarta.servlet.http.HttpServletRequest httpRequest
    ) {
        rateLimiterService.checkLoginRateLimit(httpRequest, request.getPhone());
        AuthResponse response = authService.loginOwner(request);
        return ResponseEntity.ok(ApiResponse.ok("Owner login successful", response));
    }

    @PostMapping("/google")
    public ResponseEntity<ApiResponse<GoogleAuthResponse>> authenticateWithGoogle(
            @Valid @RequestBody GoogleAuthRequest request,
            jakarta.servlet.http.HttpServletRequest httpRequest
    ) {
        rateLimiterService.checkLoginRateLimit(httpRequest, request.getPhone() != null ? request.getPhone() : "google_oauth");
        GoogleAuthResponse response = authService.authenticateWithGoogle(request);
        return ResponseEntity.ok(ApiResponse.ok("Google authentication processed", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileDto>> getCurrentUser(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        }
        UserProfileDto profile = authService.getProfile(user);
        return ResponseEntity.ok(ApiResponse.ok(profile));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request,
            jakarta.servlet.http.HttpServletRequest httpRequest
    ) {
        rateLimiterService.checkLoginRateLimit(httpRequest, request.getEmail());
        authService.requestPasswordReset(request);
        return ResponseEntity.ok(ApiResponse.ok("Password reset link has been sent to your email address", null));
    }

    @GetMapping("/verify-reset-token")
    public ResponseEntity<ApiResponse<VerifyResetTokenResponse>> verifyResetToken(@RequestParam("token") String token) {
        VerifyResetTokenResponse response = authService.verifyResetToken(token);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.ok("Password reset successfully. You can now login with your new password.", null));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileDto>> updateProfile(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        if (user == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        }
        UserProfileDto profile = authService.updateProfile(user, request);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully", profile));
    }

    @DeleteMapping("/account")
    public ResponseEntity<ApiResponse<Void>> deleteAccount(@AuthenticationPrincipal User user) {
        if (user == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));
        }
        authService.deleteAccount(user);
        return ResponseEntity.ok(ApiResponse.ok("Account deleted successfully", null));
    }
}
