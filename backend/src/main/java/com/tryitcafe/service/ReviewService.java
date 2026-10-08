package com.tryitcafe.service;

import com.tryitcafe.exception.BadRequestException;
import com.tryitcafe.exception.ResourceNotFoundException;
import com.tryitcafe.model.dto.ReviewDtos.ReviewCreateRequest;
import com.tryitcafe.model.dto.ReviewDtos.ReviewDto;
import com.tryitcafe.model.dto.ReviewDtos.ReviewStatusUpdateRequest;
import com.tryitcafe.model.entity.Review;
import com.tryitcafe.model.entity.User;
import com.tryitcafe.model.enums.ReviewStatus;
import com.tryitcafe.repository.ReviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;

    public ReviewService(ReviewRepository reviewRepository) {
        this.reviewRepository = reviewRepository;
    }

    @Transactional(readOnly = true)
    public List<ReviewDto> getApprovedReviews() {
        return reviewRepository.findAllByStatusOrderByCreatedAtDesc(ReviewStatus.APPROVED).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ReviewDto> getAllReviewsForOwner() {
        return reviewRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReviewDto submitReview(User user, ReviewCreateRequest request) {
        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new BadRequestException("Rating must be between 1 and 5 stars.");
        }

        if (request.getComment() == null || request.getComment().trim().length() < 5) {
            throw new BadRequestException("Review comment must be at least 5 characters long.");
        }

        if (reviewRepository.countByUserIdAndStatus(user.getId(), ReviewStatus.PENDING) >= 2) {
            throw new BadRequestException("You already have a review submitted and awaiting moderation.");
        }

        Review review = Review.builder()
                .user(user)
                .customerName(user.getFullName() != null && !user.getFullName().isBlank() ? user.getFullName() : "Customer " + user.getPhone().substring(Math.max(0, user.getPhone().length() - 4)))
                .rating(request.getRating())
                .comment(request.getComment().trim())
                .status(ReviewStatus.PENDING)
                .build();

        return toDto(reviewRepository.save(review));
    }

    @Transactional
    public ReviewDto updateReviewStatus(UUID id, ReviewStatusUpdateRequest request) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", id));
        review.setStatus(request.getStatus());
        return toDto(reviewRepository.save(review));
    }

    @Transactional
    public void deleteReview(UUID id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", id));
        reviewRepository.delete(review);
    }

    public ReviewDto toDto(Review review) {
        return ReviewDto.builder()
                .id(review.getId())
                .customerName(review.getCustomerName())
                .rating(review.getRating())
                .comment(review.getComment())
                .status(review.getStatus())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
