package com.tryitcafe.model.dto;

import com.tryitcafe.model.enums.DiscountType;
import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class OfferDtos {

    public static class OfferDto {
        private UUID id;
        private String title;
        private String badgeText;
        private String description;
        private DiscountType discountType;
        private BigDecimal discountValue;
        private BigDecimal minOrderAmount;
        private String bannerImageUrl;
        private String bannerPublicId;
        private LocalDateTime startDate;
        private LocalDateTime endDate;
        private boolean active;
        private Integer displayOrder;

        public OfferDto() {}

        public OfferDto(UUID id, String title, String badgeText, String description, DiscountType discountType,
                        BigDecimal discountValue, BigDecimal minOrderAmount, String bannerImageUrl, String bannerPublicId,
                        LocalDateTime startDate, LocalDateTime endDate, boolean active, Integer displayOrder) {
            this.id = id;
            this.title = title;
            this.badgeText = badgeText;
            this.description = description;
            this.discountType = discountType;
            this.discountValue = discountValue;
            this.minOrderAmount = minOrderAmount;
            this.bannerImageUrl = bannerImageUrl;
            this.bannerPublicId = bannerPublicId;
            this.startDate = startDate;
            this.endDate = endDate;
            this.active = active;
            this.displayOrder = displayOrder;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private UUID id;
            private String title;
            private String badgeText;
            private String description;
            private DiscountType discountType;
            private BigDecimal discountValue;
            private BigDecimal minOrderAmount;
            private String bannerImageUrl;
            private String bannerPublicId;
            private LocalDateTime startDate;
            private LocalDateTime endDate;
            private boolean active;
            private Integer displayOrder;

            public Builder id(UUID id) { this.id = id; return this; }
            public Builder title(String title) { this.title = title; return this; }
            public Builder badgeText(String badgeText) { this.badgeText = badgeText; return this; }
            public Builder description(String description) { this.description = description; return this; }
            public Builder discountType(DiscountType discountType) { this.discountType = discountType; return this; }
            public Builder discountValue(BigDecimal discountValue) { this.discountValue = discountValue; return this; }
            public Builder minOrderAmount(BigDecimal minOrderAmount) { this.minOrderAmount = minOrderAmount; return this; }
            public Builder bannerImageUrl(String bannerImageUrl) { this.bannerImageUrl = bannerImageUrl; return this; }
            public Builder bannerPublicId(String bannerPublicId) { this.bannerPublicId = bannerPublicId; return this; }
            public Builder startDate(LocalDateTime startDate) { this.startDate = startDate; return this; }
            public Builder endDate(LocalDateTime endDate) { this.endDate = endDate; return this; }
            public Builder active(boolean active) { this.active = active; return this; }
            public Builder displayOrder(Integer displayOrder) { this.displayOrder = displayOrder; return this; }

            public OfferDto build() {
                return new OfferDto(id, title, badgeText, description, discountType, discountValue, minOrderAmount,
                        bannerImageUrl, bannerPublicId, startDate, endDate, active, displayOrder);
            }
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getBadgeText() { return badgeText; }
        public void setBadgeText(String badgeText) { this.badgeText = badgeText; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public DiscountType getDiscountType() { return discountType; }
        public void setDiscountType(DiscountType discountType) { this.discountType = discountType; }

        public BigDecimal getDiscountValue() { return discountValue; }
        public void setDiscountValue(BigDecimal discountValue) { this.discountValue = discountValue; }

        public BigDecimal getMinOrderAmount() { return minOrderAmount; }
        public void setMinOrderAmount(BigDecimal minOrderAmount) { this.minOrderAmount = minOrderAmount; }

        public String getBannerImageUrl() { return bannerImageUrl; }
        public void setBannerImageUrl(String bannerImageUrl) { this.bannerImageUrl = bannerImageUrl; }

        public String getBannerPublicId() { return bannerPublicId; }
        public void setBannerPublicId(String bannerPublicId) { this.bannerPublicId = bannerPublicId; }

        public LocalDateTime getStartDate() { return startDate; }
        public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }

        public LocalDateTime getEndDate() { return endDate; }
        public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }

        public boolean isActive() { return active; }
        public void setActive(boolean active) { this.active = active; }

        public Integer getDisplayOrder() { return displayOrder; }
        public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
    }

    public static class OfferCreateUpdateRequest {
        @NotBlank(message = "Offer title is required")
        private String title;
        private String badgeText;
        private String description;
        private DiscountType discountType;
        private BigDecimal discountValue;
        private BigDecimal minOrderAmount;
        private String bannerImageUrl;
        private String bannerPublicId;
        private LocalDateTime startDate;
        private LocalDateTime endDate;
        private Boolean active;
        private Integer displayOrder;

        public OfferCreateUpdateRequest() {}

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getBadgeText() { return badgeText; }
        public void setBadgeText(String badgeText) { this.badgeText = badgeText; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public DiscountType getDiscountType() { return discountType; }
        public void setDiscountType(DiscountType discountType) { this.discountType = discountType; }

        public BigDecimal getDiscountValue() { return discountValue; }
        public void setDiscountValue(BigDecimal discountValue) { this.discountValue = discountValue; }

        public BigDecimal getMinOrderAmount() { return minOrderAmount; }
        public void setMinOrderAmount(BigDecimal minOrderAmount) { this.minOrderAmount = minOrderAmount; }

        public String getBannerImageUrl() { return bannerImageUrl; }
        public void setBannerImageUrl(String bannerImageUrl) { this.bannerImageUrl = bannerImageUrl; }

        public String getBannerPublicId() { return bannerPublicId; }
        public void setBannerPublicId(String bannerPublicId) { this.bannerPublicId = bannerPublicId; }

        public LocalDateTime getStartDate() { return startDate; }
        public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }

        public LocalDateTime getEndDate() { return endDate; }
        public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }

        public Boolean getActive() { return active; }
        public void setActive(Boolean active) { this.active = active; }

        public Integer getDisplayOrder() { return displayOrder; }
        public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
    }
}
