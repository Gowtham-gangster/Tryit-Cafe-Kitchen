package com.tryitcafe.service;

import com.tryitcafe.config.JwtUtils;
import com.tryitcafe.exception.BadRequestException;
import com.tryitcafe.exception.UnauthorizedException;
import com.tryitcafe.model.dto.AuthDtos.*;
import com.tryitcafe.model.entity.User;
import com.tryitcafe.model.enums.UserRole;
import com.tryitcafe.repository.CustomerLocationRepository;
import com.tryitcafe.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final CustomerLocationRepository customerLocationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final GoogleTokenVerifierService googleTokenVerifierService;

    public AuthService(UserRepository userRepository,
                       CustomerLocationRepository customerLocationRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtils jwtUtils,
                       GoogleTokenVerifierService googleTokenVerifierService) {
        this.userRepository = userRepository;
        this.customerLocationRepository = customerLocationRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtils = jwtUtils;
        this.googleTokenVerifierService = googleTokenVerifierService;
    }

    @Transactional
    public AuthResponse registerCustomer(RegisterRequest request) {
        String cleanedPhone = request.getPhone().replaceAll("\\s+", "");
        if (userRepository.existsByPhone(cleanedPhone)) {
            throw new BadRequestException("Phone number is already registered. Please login instead.");
        }

        String cleanedEmail = request.getEmail() != null && !request.getEmail().isBlank()
                ? request.getEmail().trim().toLowerCase()
                : null;

        if (cleanedEmail != null && userRepository.existsByEmail(cleanedEmail)) {
            throw new BadRequestException("Email address is already in use by another account.");
        }

        User user = User.builder()
                .phone(cleanedPhone)
                .fullName(request.getFullName().trim())
                .email(cleanedEmail)
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.ROLE_CUSTOMER)
                .active(true)
                .build();

        User saved = userRepository.save(user);

        // Optional onboarding initial location
        if (request.getLatitude() != null && request.getLongitude() != null && request.getAddress() != null && !request.getAddress().isBlank()) {
            com.tryitcafe.model.entity.CustomerLocation initialLoc = com.tryitcafe.model.entity.CustomerLocation.builder()
                    .customer(saved)
                    .label(request.getLocationLabel() != null && !request.getLocationLabel().isBlank() ? request.getLocationLabel().trim() : "Home")
                    .address(request.getAddress().trim())
                    .latitude(request.getLatitude())
                    .longitude(request.getLongitude())
                    .isDefault(true)
                    .build();
            customerLocationRepository.save(initialLoc);
        }

        String token = jwtUtils.generateToken(saved);

        return AuthResponse.builder()
                .token(token)
                .userId(saved.getId())
                .phone(saved.getPhone())
                .fullName(saved.getFullName())
                .email(saved.getEmail())
                .role(saved.getRole())
                .profileImageUrl(saved.getProfileImageUrl())
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        String cleanedPhone = request.getPhone().replaceAll("\\s+", "");
        User user = userRepository.findByPhone(cleanedPhone)
                .orElseThrow(() -> new UnauthorizedException("Invalid phone number or password"));

        if (!user.isActive()) {
            throw new UnauthorizedException("This account has been deactivated. Please contact cafe support.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid phone number or password");
        }

        String token = jwtUtils.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .phone(user.getPhone())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .profileImageUrl(user.getProfileImageUrl())
                .build();
    }

    public AuthResponse loginOwner(LoginRequest request) {
        AuthResponse response = login(request);
        if (response.getRole() != UserRole.ROLE_OWNER) {
            throw new UnauthorizedException("Access denied. Owner privileges required.");
        }
        return response;
    }

    public UserProfileDto getProfile(User user) {
        return UserProfileDto.builder()
                .id(user.getId())
                .phone(user.getPhone())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .profileImageUrl(user.getProfileImageUrl())
                .build();
    }

    @Transactional
    public UserProfileDto updateProfile(User user, UpdateProfileRequest request) {
        User existing = userRepository.findById(user.getId())
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            existing.setFullName(request.getFullName().trim());
        }

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            String newEmail = request.getEmail().trim().toLowerCase();
            if (userRepository.existsByEmailAndIdNot(newEmail, existing.getId())) {
                throw new BadRequestException("Email address is already in use by another account.");
            }
            existing.setEmail(newEmail);
        }

        if (request.getProfileImageUrl() != null) {
            String trimmed = request.getProfileImageUrl().trim();
            if (!trimmed.isEmpty()) {
                validateProfileImageUrl(trimmed);
                existing.setProfileImageUrl(trimmed);
            } else {
                existing.setProfileImageUrl(null);
            }
        }

        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            if (request.getCurrentPassword() == null || request.getCurrentPassword().isBlank()) {
                throw new BadRequestException("Current password is required to set a new password.");
            }
            if (!passwordEncoder.matches(request.getCurrentPassword(), existing.getPasswordHash())) {
                throw new BadRequestException("Current password does not match.");
            }
            if (request.getNewPassword().length() < 8 ||
                    !request.getNewPassword().matches("^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$")) {
                throw new BadRequestException("New password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number.");
            }
            existing.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        }

        User saved = userRepository.save(existing);
        return getProfile(saved);
    }

    @Transactional
    public GoogleAuthResponse authenticateWithGoogle(GoogleAuthRequest request) {
        GoogleTokenVerifierService.GoogleIdTokenClaims claims = googleTokenVerifierService.verify(request.getIdToken());

        // 1. Try finding user by Google Subject
        java.util.Optional<User> bySubject = userRepository.findByGoogleSubject(claims.subject());
        if (bySubject.isPresent()) {
            User user = bySubject.get();
            validateCustomerAccount(user);

            // If user somehow doesn't have phone, and phone is provided in request, update it
            if ((user.getPhone() == null || user.getPhone().isBlank()) && request.getPhone() != null && !request.getPhone().isBlank()) {
                String cleanedPhone = request.getPhone().replaceAll("\\s+", "");
                if (userRepository.existsByPhone(cleanedPhone)) {
                    throw new BadRequestException("Phone number is already associated with another account.");
                }
                user.setPhone(cleanedPhone);
                userRepository.save(user);
            }

            if (user.getPhone() == null || user.getPhone().isBlank()) {
                return GoogleAuthResponse.needsCompletion(claims.subject(), claims.email(), user.getFullName(), user.getProfileImageUrl());
            }

            String token = jwtUtils.generateToken(user);
            return GoogleAuthResponse.success(toAuthResponse(user, token));
        }

        // 2. Try linking by verified email
        java.util.Optional<User> byEmail = userRepository.findByEmail(claims.email());
        if (byEmail.isPresent()) {
            User user = byEmail.get();
            validateCustomerAccount(user);

            // Link Google subject and provider
            user.setGoogleSubject(claims.subject());
            user.setAuthProvider("GOOGLE");
            if ((user.getProfileImageUrl() == null || user.getProfileImageUrl().isBlank()) && claims.pictureUrl() != null) {
                user.setProfileImageUrl(claims.pictureUrl());
            }

            // If phone provided and user missing phone, update it
            if ((user.getPhone() == null || user.getPhone().isBlank()) && request.getPhone() != null && !request.getPhone().isBlank()) {
                String cleanedPhone = request.getPhone().replaceAll("\\s+", "");
                if (userRepository.existsByPhone(cleanedPhone)) {
                    throw new BadRequestException("Phone number is already associated with another account.");
                }
                user.setPhone(cleanedPhone);
            }

            User saved = userRepository.save(user);

            if (saved.getPhone() == null || saved.getPhone().isBlank()) {
                return GoogleAuthResponse.needsCompletion(claims.subject(), claims.email(), saved.getFullName(), saved.getProfileImageUrl());
            }

            String token = jwtUtils.generateToken(saved);
            return GoogleAuthResponse.success(toAuthResponse(saved, token));
        }

        // 3. Brand-new customer
        // If phone is missing, prompt customer to complete profile
        if (request.getPhone() == null || request.getPhone().isBlank()) {
            String initialName = request.getFullName() != null && !request.getFullName().isBlank()
                    ? request.getFullName().trim()
                    : (claims.name() != null ? claims.name() : "Customer");
            return GoogleAuthResponse.needsCompletion(claims.subject(), claims.email(), initialName, claims.pictureUrl());
        }

        // Phone is provided -> Create complete customer account
        String cleanedPhone = request.getPhone().replaceAll("\\s+", "");
        if (userRepository.existsByPhone(cleanedPhone)) {
            throw new BadRequestException("Phone number is already associated with another account. Please use your existing account or a different phone number.");
        }

        String displayName = request.getFullName() != null && !request.getFullName().isBlank()
                ? request.getFullName().trim()
                : (claims.name() != null && !claims.name().isBlank() ? claims.name().trim() : "Customer");

        User newUser = User.builder()
                .phone(cleanedPhone)
                .fullName(displayName)
                .email(claims.email())
                .passwordHash(passwordEncoder.encode(java.util.UUID.randomUUID().toString()))
                .role(UserRole.ROLE_CUSTOMER)
                .authProvider("GOOGLE")
                .googleSubject(claims.subject())
                .profileImageUrl(claims.pictureUrl())
                .active(true)
                .build();

        User saved = userRepository.save(newUser);

        // Save delivery location if provided
        if (request.getLatitude() != null && request.getLongitude() != null && request.getAddress() != null && !request.getAddress().isBlank()) {
            com.tryitcafe.model.entity.CustomerLocation loc = com.tryitcafe.model.entity.CustomerLocation.builder()
                    .customer(saved)
                    .label(request.getLocationLabel() != null && !request.getLocationLabel().isBlank() ? request.getLocationLabel().trim() : "Home")
                    .address(request.getAddress().trim())
                    .latitude(request.getLatitude())
                    .longitude(request.getLongitude())
                    .isDefault(true)
                    .build();
            customerLocationRepository.save(loc);
        }

        String token = jwtUtils.generateToken(saved);
        return GoogleAuthResponse.success(toAuthResponse(saved, token));
    }

    private void validateCustomerAccount(User user) {
        if (!user.isActive()) {
            throw new UnauthorizedException("This account has been deactivated. Please contact cafe support.");
        }
        if (user.getRole() == UserRole.ROLE_OWNER) {
            throw new UnauthorizedException("Owner accounts cannot authenticate via customer Google sign-in.");
        }
    }

    private AuthResponse toAuthResponse(User user, String token) {
        return AuthResponse.builder()
                .token(token)
                .userId(user.getId())
                .phone(user.getPhone())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .profileImageUrl(user.getProfileImageUrl())
                .build();
    }

    public static void validateProfileImageUrl(String url) {
        if (url == null || url.isBlank()) return;
        if (url.length() > 500) {
            throw new BadRequestException("Profile image URL cannot exceed 500 characters.");
        }
        if (!url.startsWith("https://")) {
            throw new BadRequestException("Profile image URL must use secure HTTPS protocol.");
        }
        if (url.contains("\n") || url.contains("\r") || url.contains("\t") || url.contains(" ")) {
            throw new BadRequestException("Profile image URL contains invalid whitespace or control characters.");
        }
        try {
            java.net.URI uri = java.net.URI.create(url);
            if (!"https".equalsIgnoreCase(uri.getScheme())) {
                throw new BadRequestException("Profile image URL must use secure HTTPS protocol.");
            }
            if (uri.getHost() == null || uri.getHost().isBlank()) {
                throw new BadRequestException("Profile image URL must contain a valid host domain.");
            }
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Malformed profile image URL.");
        }
    }
}
