package com.tryitcafe.repository;

import com.tryitcafe.model.entity.Review;
import com.tryitcafe.model.enums.ReviewStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReviewRepository extends JpaRepository<Review, UUID> {
    List<Review> findAllByStatusOrderByCreatedAtDesc(ReviewStatus status);
    List<Review> findAllByOrderByCreatedAtDesc();
    long countByStatus(ReviewStatus status);
    long countByUserIdAndStatus(UUID userId, ReviewStatus status);
}
