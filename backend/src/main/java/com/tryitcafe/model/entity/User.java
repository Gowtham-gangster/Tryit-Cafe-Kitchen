package com.tryitcafe.model.entity;

import com.tryitcafe.model.enums.UserRole;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_user_phone", columnList = "phone", unique = true),
    @Index(name = "idx_user_google_sub", columnList = "google_subject", unique = true),
    @Index(name = "idx_user_email", columnList = "email")
})
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true, length = 20)
    private String phone;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(length = 150)
    private String email;

    @Column(nullable = true)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private UserRole role = UserRole.ROLE_CUSTOMER;

    @Column(length = 500)
    private String profileImageUrl;

    @Column(name = "auth_provider", length = 30)
    private String authProvider = "LOCAL"; // "LOCAL" | "GOOGLE"

    @Column(name = "google_subject", length = 100, unique = true)
    private String googleSubject;

    @Column(nullable = false)
    private boolean active = true;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public User() {}

    public User(UUID id, String phone, String fullName, String email, String passwordHash, UserRole role, String profileImageUrl, String authProvider, String googleSubject, boolean active) {
        this.id = id;
        this.phone = phone;
        this.fullName = fullName;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role != null ? role : UserRole.ROLE_CUSTOMER;
        this.profileImageUrl = profileImageUrl;
        this.authProvider = authProvider != null ? authProvider : "LOCAL";
        this.googleSubject = googleSubject;
        this.active = active;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private UUID id;
        private String phone;
        private String fullName;
        private String email;
        private String passwordHash;
        private UserRole role = UserRole.ROLE_CUSTOMER;
        private String profileImageUrl;
        private String authProvider = "LOCAL";
        private String googleSubject;
        private boolean active = true;

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder phone(String phone) { this.phone = phone; return this; }
        public Builder fullName(String fullName) { this.fullName = fullName; return this; }
        public Builder email(String email) { this.email = email; return this; }
        public Builder passwordHash(String passwordHash) { this.passwordHash = passwordHash; return this; }
        public Builder role(UserRole role) { this.role = role; return this; }
        public Builder profileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; return this; }
        public Builder authProvider(String authProvider) { this.authProvider = authProvider; return this; }
        public Builder googleSubject(String googleSubject) { this.googleSubject = googleSubject; return this; }
        public Builder active(boolean active) { this.active = active; return this; }

        public User build() {
            return new User(id, phone, fullName, email, passwordHash, role, profileImageUrl, authProvider, googleSubject, active);
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

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }

    public String getProfileImageUrl() { return profileImageUrl; }
    public void setProfileImageUrl(String profileImageUrl) { this.profileImageUrl = profileImageUrl; }

    public String getAuthProvider() { return authProvider; }
    public void setAuthProvider(String authProvider) { this.authProvider = authProvider; }

    public String getGoogleSubject() { return googleSubject; }
    public void setGoogleSubject(String googleSubject) { this.googleSubject = googleSubject; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
