package com.tryitcafe.model.dto;

import com.tryitcafe.model.enums.ReviewStatus;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.UUID;

public class ReviewDtos {

    public static class ReviewDto {
        private UUID id;
        private String customerName;
        private Integer rating;
        private String comment;
        private ReviewStatus status;
        private LocalDateTime createdAt;

        public ReviewDto() {}

        public ReviewDto(UUID id, String customerName, Integer rating, String comment, ReviewStatus status, LocalDateTime createdAt) {
            this.id = id;
            this.customerName = customerName;
            this.rating = rating;
            this.comment = comment;
            this.status = status;
            this.createdAt = createdAt;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private UUID id;
            private String customerName;
            private Integer rating;
            private String comment;
            private ReviewStatus status;
            private LocalDateTime createdAt;

            public Builder id(UUID id) { this.id = id; return this; }
            public Builder customerName(String customerName) { this.customerName = customerName; return this; }
            public Builder rating(Integer rating) { this.rating = rating; return this; }
            public Builder comment(String comment) { this.comment = comment; return this; }
            public Builder status(ReviewStatus status) { this.status = status; return this; }
            public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

            public ReviewDto build() {
                return new ReviewDto(id, customerName, rating, comment, status, createdAt);
            }
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }

        public String getCustomerName() { return customerName; }
        public void setCustomerName(String customerName) { this.customerName = customerName; }

        public Integer getRating() { return rating; }
        public void setRating(Integer rating) { this.rating = rating; }

        public String getComment() { return comment; }
        public void setComment(String comment) { this.comment = comment; }

        public ReviewStatus getStatus() { return status; }
        public void setStatus(ReviewStatus status) { this.status = status; }

        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }

    public static class ReviewCreateRequest {
        @NotNull(message = "Rating is required")
        @Min(value = 1, message = "Rating must be between 1 and 5")
        @Max(value = 5, message = "Rating must be between 1 and 5")
        private Integer rating;

        @NotBlank(message = "Review comment is required")
        private String comment;

        public ReviewCreateRequest() {}

        public Integer getRating() { return rating; }
        public void setRating(Integer rating) { this.rating = rating; }

        public String getComment() { return comment; }
        public void setComment(String comment) { this.comment = comment; }
    }

    public static class ReviewStatusUpdateRequest {
        @NotNull(message = "Review status is required")
        private ReviewStatus status;

        public ReviewStatusUpdateRequest() {}

        public ReviewStatus getStatus() { return status; }
        public void setStatus(ReviewStatus status) { this.status = status; }
    }
}
