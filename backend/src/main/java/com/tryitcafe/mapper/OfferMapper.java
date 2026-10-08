package com.tryitcafe.mapper;

import com.tryitcafe.model.dto.OfferDtos;
import com.tryitcafe.model.entity.Offer;
import org.springframework.stereotype.Component;

@Component
public class OfferMapper {

    public OfferDtos.OfferDto toDto(Offer offer) {
        if (offer == null) return null;
        return OfferDtos.OfferDto.builder()
                .id(offer.getId())
                .title(offer.getTitle())
                .badgeText(offer.getBadgeText())
                .description(offer.getDescription())
                .discountType(offer.getDiscountType())
                .discountValue(offer.getDiscountValue())
                .minOrderAmount(offer.getMinOrderAmount())
                .bannerImageUrl(offer.getBannerImageUrl())
                .bannerPublicId(offer.getBannerPublicId())
                .active(offer.isActive())
                .displayOrder(offer.getDisplayOrder())
                .startDate(offer.getStartDate())
                .endDate(offer.getEndDate())
                .build();
    }
}
