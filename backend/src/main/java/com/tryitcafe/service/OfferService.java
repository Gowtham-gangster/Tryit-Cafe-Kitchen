package com.tryitcafe.service;

import com.tryitcafe.exception.BadRequestException;
import com.tryitcafe.model.dto.OfferDtos.OfferCreateUpdateRequest;
import com.tryitcafe.model.dto.OfferDtos.OfferDto;
import com.tryitcafe.model.entity.Offer;
import com.tryitcafe.model.enums.DiscountType;
import com.tryitcafe.repository.OfferRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OfferService {

    private final OfferRepository offerRepository;
    private final CloudinaryService cloudinaryService;

    public OfferService(OfferRepository offerRepository, CloudinaryService cloudinaryService) {
        this.offerRepository = offerRepository;
        this.cloudinaryService = cloudinaryService;
    }

    public List<OfferDto> getActiveOffers() {
        return offerRepository.findAllByActiveTrueOrderByDisplayOrderAsc().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<OfferDto> getAllOffersForOwner() {
        return offerRepository.findAllByOrderByDisplayOrderAsc().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private void validateOffer(OfferCreateUpdateRequest request) {
        if (request.getTitle() == null || request.getTitle().trim().isEmpty()) {
            throw new BadRequestException("Offer title is required.");
        }
        if (request.getDescription() == null || request.getDescription().trim().isEmpty()) {
            throw new BadRequestException("Offer description is required.");
        }
        if (request.getDiscountType() == null) {
            throw new BadRequestException("Discount type is required.");
        }
        if (request.getDiscountValue() == null) {
            throw new BadRequestException("Discount value is required.");
        }
        if (request.getDiscountValue().compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Discount value cannot be negative.");
        }
        if (request.getDiscountType() == DiscountType.PERCENTAGE) {
            if (request.getDiscountValue().compareTo(BigDecimal.ZERO) <= 0 || request.getDiscountValue().compareTo(BigDecimal.valueOf(100)) > 0) {
                throw new BadRequestException("Percentage discount must be between 1% and 100%.");
            }
        }
        if (request.getMinOrderAmount() != null && request.getMinOrderAmount().compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("Minimum order cannot be negative.");
        }
    }

    @Transactional
    public OfferDto createOffer(OfferCreateUpdateRequest request) {
        validateOffer(request);

        String bannerUrl = request.getBannerImageUrl() != null && !request.getBannerImageUrl().trim().isEmpty()
                ? request.getBannerImageUrl().trim() : null;
        String bannerPid = request.getBannerPublicId() != null && !request.getBannerPublicId().trim().isEmpty()
                ? request.getBannerPublicId().trim() : null;

        Offer offer = Offer.builder()
                .title(request.getTitle().trim())
                .badgeText(request.getBadgeText() != null ? request.getBadgeText().trim() : null)
                .description(request.getDescription().trim())
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .minOrderAmount(request.getMinOrderAmount() != null ? request.getMinOrderAmount() : BigDecimal.ZERO)
                .bannerImageUrl(bannerUrl)
                .bannerPublicId(bannerPid)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .active(request.getActive() != null ? request.getActive() : true)
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .build();

        return toDto(offerRepository.save(offer));
    }

    @Transactional
    public OfferDto updateOffer(UUID id, OfferCreateUpdateRequest request) {
        Offer offer = offerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Offer not found with ID: " + id));

        validateOffer(request);

        offer.setTitle(request.getTitle().trim());
        offer.setBadgeText(request.getBadgeText() != null ? request.getBadgeText().trim() : null);
        offer.setDescription(request.getDescription().trim());
        if (request.getDiscountType() != null) offer.setDiscountType(request.getDiscountType());
        offer.setDiscountValue(request.getDiscountValue());
        offer.setMinOrderAmount(request.getMinOrderAmount() != null ? request.getMinOrderAmount() : BigDecimal.ZERO);

        // Safe banner replacement and removal with Cloudinary cleanup
        if (request.getBannerImageUrl() != null) {
            String newUrl = request.getBannerImageUrl().trim();
            if (newUrl.isEmpty()) {
                if (offer.getBannerPublicId() != null) {
                    cloudinaryService.deleteFile(offer.getBannerPublicId());
                }
                offer.setBannerImageUrl(null);
                offer.setBannerPublicId(null);
            } else {
                if (request.getBannerPublicId() != null && offer.getBannerPublicId() != null
                        && !request.getBannerPublicId().equals(offer.getBannerPublicId())) {
                    cloudinaryService.deleteFile(offer.getBannerPublicId());
                }
                offer.setBannerImageUrl(newUrl);
                if (request.getBannerPublicId() != null) {
                    offer.setBannerPublicId(request.getBannerPublicId().trim());
                }
            }
        }

        offer.setStartDate(request.getStartDate());
        offer.setEndDate(request.getEndDate());
        if (request.getActive() != null) offer.setActive(request.getActive());
        if (request.getDisplayOrder() != null) offer.setDisplayOrder(request.getDisplayOrder());

        return toDto(offerRepository.save(offer));
    }

    @Transactional
    public OfferDto toggleOfferStatus(UUID id) {
        Offer offer = offerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Offer not found with ID: " + id));
        offer.setActive(!offer.isActive());
        return toDto(offerRepository.save(offer));
    }

    @Transactional
    public void deleteOffer(UUID id) {
        Offer offer = offerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Offer not found with ID: " + id));
        if (offer.getBannerPublicId() != null) {
            cloudinaryService.deleteFile(offer.getBannerPublicId());
        }
        offerRepository.delete(offer);
    }

    public OfferDto toDto(Offer offer) {
        return OfferDto.builder()
                .id(offer.getId())
                .title(offer.getTitle())
                .badgeText(offer.getBadgeText())
                .description(offer.getDescription())
                .discountType(offer.getDiscountType())
                .discountValue(offer.getDiscountValue())
                .minOrderAmount(offer.getMinOrderAmount())
                .bannerImageUrl(offer.getBannerImageUrl())
                .bannerPublicId(offer.getBannerPublicId())
                .startDate(offer.getStartDate())
                .endDate(offer.getEndDate())
                .active(offer.isActive())
                .displayOrder(offer.getDisplayOrder())
                .build();
    }
}
