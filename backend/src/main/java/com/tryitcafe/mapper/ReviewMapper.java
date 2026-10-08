package com.tryitcafe.mapper;

import com.tryitcafe.model.dto.ReviewDtos;
import com.tryitcafe.model.entity.Review;
import org.springframework.stereotype.Component;

@Component
public class ReviewMapper {

    public ReviewDtos.ReviewDto toDto(Review review) {
        if (review == null) return null;
        String name = review.getCustomerName();
        if (name == null && review.getUser() != null) {
            name = review.getUser().getFullName();
        }
        if (name == null) {
            name = "Valued Customer";
        }

        return ReviewDtos.ReviewDto.builder()
                .id(review.getId())
                .customerName(name)
                .rating(review.getRating())
                .comment(review.getComment())
                .status(review.getStatus())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
