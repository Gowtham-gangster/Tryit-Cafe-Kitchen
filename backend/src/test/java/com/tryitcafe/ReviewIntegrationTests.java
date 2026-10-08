package com.tryitcafe;

import com.tryitcafe.exception.BadRequestException;
import com.tryitcafe.model.dto.ReviewDtos.*;
import com.tryitcafe.model.entity.User;
import com.tryitcafe.model.enums.ReviewStatus;
import com.tryitcafe.repository.UserRepository;
import com.tryitcafe.service.ReviewService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("dev")
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
public class ReviewIntegrationTests {

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private UserRepository userRepository;

    @Test
    @DisplayName("Should successfully handle complete review submission, moderation, and public visibility lifecycle")
    void testReviewLifecycle() {
        User customer = userRepository.findByPhone("9876543210")
                .orElseThrow(() -> new IllegalStateException("Test customer not found"));

        int initialPublicCount = reviewService.getApprovedReviews().size();

        // 1. Customer Submits Review
        ReviewCreateRequest createReq = new ReviewCreateRequest();
        createReq.setRating(5);
        createReq.setComment("Alfredo pasta was exceptionally creamy and fresh! Loved it.");

        ReviewDto submitted = reviewService.submitReview(customer, createReq);
        assertNotNull(submitted);
        assertEquals(ReviewStatus.PENDING, submitted.getStatus());
        assertEquals("Alfredo pasta was exceptionally creamy and fresh! Loved it.", submitted.getComment());
        assertEquals(5, submitted.getRating());

        // 2. Verify pending review is NOT visible in public approved reviews
        List<ReviewDto> publicReviews = reviewService.getApprovedReviews();
        assertEquals(initialPublicCount, publicReviews.size(), "Pending review should NOT be public");

        // 3. Owner Approves Review
        ReviewStatusUpdateRequest approveReq = new ReviewStatusUpdateRequest();
        approveReq.setStatus(ReviewStatus.APPROVED);
        ReviewDto approved = reviewService.updateReviewStatus(submitted.getId(), approveReq);
        assertEquals(ReviewStatus.APPROVED, approved.getStatus());

        // 4. Verify review IS NOW visible in public approved reviews
        publicReviews = reviewService.getApprovedReviews();
        assertEquals(initialPublicCount + 1, publicReviews.size(), "Approved review MUST be public");

        // 5. Owner Hides Review
        ReviewStatusUpdateRequest hideReq = new ReviewStatusUpdateRequest();
        hideReq.setStatus(ReviewStatus.HIDDEN);
        reviewService.updateReviewStatus(submitted.getId(), hideReq);

        publicReviews = reviewService.getApprovedReviews();
        assertEquals(initialPublicCount, publicReviews.size(), "Hidden review should NOT be public");

        // 6. Owner Deletes Review
        reviewService.deleteReview(submitted.getId());
        List<ReviewDto> allOwnerReviews = reviewService.getAllReviewsForOwner();
        assertFalse(allOwnerReviews.stream().anyMatch(r -> r.getId().equals(submitted.getId())));
    }

    @Test
    @DisplayName("Should prevent spam with multiple pending reviews from the same user")
    void testPreventDuplicatePendingSpam() {
        User customer = userRepository.findByPhone("9876543210")
                .orElseThrow(() -> new IllegalStateException("Test customer not found"));

        ReviewCreateRequest req1 = new ReviewCreateRequest();
        req1.setRating(5);
        req1.setComment("First review comment text.");
        reviewService.submitReview(customer, req1);

        ReviewCreateRequest req2 = new ReviewCreateRequest();
        req2.setRating(4);
        req2.setComment("Second review comment text.");
        reviewService.submitReview(customer, req2);

        ReviewCreateRequest req3 = new ReviewCreateRequest();
        req3.setRating(3);
        req3.setComment("Third review comment spam attempt.");

        assertThrows(RuntimeException.class, () -> reviewService.submitReview(customer, req3));
    }

    @Test
    @DisplayName("Should reject invalid review ratings (< 1 or > 5)")
    void testRejectInvalidRatings() {
        User customer = userRepository.findByPhone("9876543210")
                .orElseThrow(() -> new IllegalStateException("Test customer not found"));

        ReviewCreateRequest lowRating = new ReviewCreateRequest();
        lowRating.setRating(0);
        lowRating.setComment("Invalid low rating");
        assertThrows(RuntimeException.class, () -> reviewService.submitReview(customer, lowRating));

        ReviewCreateRequest highRating = new ReviewCreateRequest();
        highRating.setRating(6);
        highRating.setComment("Invalid high rating");
        assertThrows(RuntimeException.class, () -> reviewService.submitReview(customer, highRating));
    }
}
