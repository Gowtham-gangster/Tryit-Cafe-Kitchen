package com.tryitcafe.model.dto;

import com.tryitcafe.model.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public class AuthDtos {

    public static class RegisterRequest {
        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^[0-9+ ]{8,20}$", message = "Please enter a valid phone number")
        private String phone;

        @NotBlank(message = "Full name is required")
        @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
        private String fullName;

        @Email(message = "Please provide a valid email address")
        private String email;

        @NotBlank(message = "Password is required")
        @Pattern(
                regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$",
                message = "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number"
        )
        private String password;

        private String locationLabel;
        private String address;
        private Double latitude;
        private Double longitude;

        public RegisterRequest() {}

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }

        public String getLocationLabel() { return locationLabel; }
        public void setLocationLabel(String locationLabel) { this.locationLabel = locationLabel; }

        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }

        public Double getLatitude() { return latitude; }
        public void setLatitude(Double latitude) { this.latitude = latitude; }

        public Double getLongitude() { return longitude; }
        public void setLongitude(Double longitude) { this.longitude = longitude; }
    }

    public static class LoginRequest {
        @NotBlank(message = "Phone number is required")
        private String phone;

        @NotBlank(message = "Password is required")
        private String password;

        public LoginRequest() {}

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class UpdateProfileRequest {
        @NotBlank(message = "Full name is required")
        @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
        private String fullName;

        @Email(message = "Please provide a valid email address")
        private String email;

        @Size(max = 500, message = "Profile image URL cannot exceed 500 characters")
        @Pattern(
                regexp = "^$|^https://[a-zA-Z0-9.-]+(?::[0-9]+)?(?:/[a-zA-Z0-9._~!$&'()*+,;=:@%/?#-]*)?$",
                message = "Profile image URL must be a valid secure HTTPS URL"
        )
        private String profileImageUrl;
        private String currentPassword;
        private String newPassword;

        public UpdateProfileRequest() {}

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getProfileImageUrl() { return profileImageUrl; }
        public void setProfileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; }

        public String getCurrentPassword() { return currentPassword; }
        public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }

        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }

    public static class AuthResponse {
        private String token;
        private UUID userId;
        private String phone;
        private String fullName;
        private String email;
        private UserRole role;
        private String profileImageUrl;

        public AuthResponse() {}

        public AuthResponse(String token, UUID userId, String phone, String fullName, String email, UserRole role, String profileImageUrl) {
            this.token = token;
            this.userId = userId;
            this.phone = phone;
            this.fullName = fullName;
            this.email = email;
            this.role = role;
            this.profileImageUrl = profileImageUrl;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private String token;
            private UUID userId;
            private String phone;
            private String fullName;
            private String email;
            private UserRole role;
            private String profileImageUrl;

            public Builder token(String token) { this.token = token; return this; }
            public Builder userId(UUID userId) { this.userId = userId; return this; }
            public Builder phone(String phone) { this.phone = phone; return this; }
            public Builder fullName(String fullName) { this.fullName = fullName; return this; }
            public Builder email(String email) { this.email = email; return this; }
            public Builder role(UserRole role) { this.role = role; return this; }
            public Builder profileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; return this; }

            public AuthResponse build() {
                return new AuthResponse(token, userId, phone, fullName, email, role, profileImageUrl);
            }
        }

        public String getToken() { return token; }
        public void setToken(String token) { this.token = token; }

        public UUID getUserId() { return userId; }
        public void setUserId(UUID userId) { this.userId = userId; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public UserRole getRole() { return role; }
        public void setRole(UserRole role) { this.role = role; }

        public String getProfileImageUrl() { return profileImageUrl; }
        public void setProfileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; }
    }

    public static class UserProfileDto {
        private UUID id;
        private String phone;
        private String fullName;
        private String email;
        private UserRole role;
        private String profileImageUrl;

        public UserProfileDto() {}

        public UserProfileDto(UUID id, String phone, String fullName, String email, UserRole role, String profileImageUrl) {
            this.id = id;
            this.phone = phone;
            this.fullName = fullName;
            this.email = email;
            this.role = role;
            this.profileImageUrl = profileImageUrl;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private UUID id;
            private String phone;
            private String fullName;
            private String email;
            private UserRole role;
            private String profileImageUrl;

            public Builder id(UUID id) { this.id = id; return this; }
            public Builder phone(String phone) { this.phone = phone; return this; }
            public Builder fullName(String fullName) { this.fullName = fullName; return this; }
            public Builder email(String email) { this.email = email; return this; }
            public Builder role(UserRole role) { this.role = role; return this; }
            public Builder profileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; return this; }

            public UserProfileDto build() {
                return new UserProfileDto(id, phone, fullName, email, role, profileImageUrl);
            }
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public UserRole getRole() { return role; }
        public void setRole(UserRole role) { this.role = role; }

        public String getProfileImageUrl() { return profileImageUrl; }
        public void setProfileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; }
    }

    public static class GoogleAuthRequest {
        @NotBlank(message = "Google ID token credential is required")
        private String idToken;

        private String phone;
        private String fullName;
        private String locationLabel;
        private String address;
        private Double latitude;
        private Double longitude;

        public GoogleAuthRequest() {}

        public String getIdToken() { return idToken; }
        public void setIdToken(String idToken) { this.idToken = idToken; }

        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getLocationLabel() { return locationLabel; }
        public void setLocationLabel(String locationLabel) { this.locationLabel = locationLabel; }

        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }

        public Double getLatitude() { return latitude; }
        public void setLatitude(Double latitude) { this.latitude = latitude; }

        public Double getLongitude() { return longitude; }
        public void setLongitude(Double longitude) { this.longitude = longitude; }
    }

    public static class GoogleAuthResponse {
        private boolean needsProfileCompletion;
        private String googleSubject;
        private String email;
        private String fullName;
        private String profileImageUrl;
        private AuthResponse authResponse;

        public GoogleAuthResponse() {}

        public GoogleAuthResponse(boolean needsProfileCompletion, String googleSubject, String email, String fullName, String profileImageUrl, AuthResponse authResponse) {
            this.needsProfileCompletion = needsProfileCompletion;
            this.googleSubject = googleSubject;
            this.email = email;
            this.fullName = fullName;
            this.profileImageUrl = profileImageUrl;
            this.authResponse = authResponse;
        }

        public static GoogleAuthResponse needsCompletion(String googleSubject, String email, String fullName, String profileImageUrl) {
            return new GoogleAuthResponse(true, googleSubject, email, fullName, profileImageUrl, null);
        }

        public static GoogleAuthResponse success(AuthResponse authResponse) {
            return new GoogleAuthResponse(false, null, authResponse.getEmail(), authResponse.getFullName(), authResponse.getProfileImageUrl(), authResponse);
        }

        public boolean isNeedsProfileCompletion() { return needsProfileCompletion; }
        public void setNeedsProfileCompletion(boolean needsProfileCompletion) { this.needsProfileCompletion = needsProfileCompletion; }

        public String getGoogleSubject() { return googleSubject; }
        public void setGoogleSubject(String googleSubject) { this.googleSubject = googleSubject; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }

        public String getProfileImageUrl() { return profileImageUrl; }
        public void setProfileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; }

        public AuthResponse getAuthResponse() { return authResponse; }
        public void setAuthResponse(AuthResponse authResponse) { this.authResponse = authResponse; }
    }
}
