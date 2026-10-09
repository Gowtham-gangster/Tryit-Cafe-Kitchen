package com.tryitcafe.repository;

import com.tryitcafe.model.entity.User;
import com.tryitcafe.model.enums.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByPhone(String phone);
    boolean existsByPhone(String phone);
    boolean existsByPhoneAndIdNot(String phone, UUID id);
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailIgnoreCase(String email);
    boolean existsByEmail(String email);
    boolean existsByEmailAndIdNot(String email, UUID id);
    Optional<User> findByGoogleSubject(String googleSubject);
    boolean existsByGoogleSubject(String googleSubject);
    Optional<User> findByPasswordResetToken(String passwordResetToken);
    long countByRole(UserRole role);
}
