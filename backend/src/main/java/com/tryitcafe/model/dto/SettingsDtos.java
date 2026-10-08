package com.tryitcafe.model.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public class SettingsDtos {

    public static class BusinessHoursDto {
        private UUID id;
        private String dayOfWeek;
        @JsonFormat(pattern = "HH:mm")
        private LocalTime openTime;
        @JsonFormat(pattern = "HH:mm")
        private LocalTime closeTime;
        private boolean closed;
        private Integer dayOrder;

        public BusinessHoursDto() {}

        public BusinessHoursDto(UUID id, String dayOfWeek, LocalTime openTime, LocalTime closeTime, boolean closed, Integer dayOrder) {
            this.id = id;
            this.dayOfWeek = dayOfWeek;
            this.openTime = openTime;
            this.closeTime = closeTime;
            this.closed = closed;
            this.dayOrder = dayOrder;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private UUID id;
            private String dayOfWeek;
            private LocalTime openTime;
            private LocalTime closeTime;
            private boolean closed;
            private Integer dayOrder;

            public Builder id(UUID id) { this.id = id; return this; }
            public Builder dayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; return this; }
            public Builder openTime(LocalTime openTime) { this.openTime = openTime; return this; }
            public Builder closeTime(LocalTime closeTime) { this.closeTime = closeTime; return this; }
            public Builder closed(boolean closed) { this.closed = closed; return this; }
            public Builder dayOrder(Integer dayOrder) { this.dayOrder = dayOrder; return this; }

            public BusinessHoursDto build() {
                return new BusinessHoursDto(id, dayOfWeek, openTime, closeTime, closed, dayOrder);
            }
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }

        public String getDayOfWeek() { return dayOfWeek; }
        public void setDayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; }

        public LocalTime getOpenTime() { return openTime; }
        public void setOpenTime(LocalTime openTime) { this.openTime = openTime; }

        public LocalTime getCloseTime() { return closeTime; }
        public void setCloseTime(LocalTime closeTime) { this.closeTime = closeTime; }

        public boolean isClosed() { return closed; }
        public void setClosed(boolean closed) { this.closed = closed; }

        public Integer getDayOrder() { return dayOrder; }
        public void setDayOrder(Integer dayOrder) { this.dayOrder = dayOrder; }
    }

    public static class BusinessSettingsDto {
        private UUID id;
        private String cafeName;
        private String tagline;
        private String aboutText;
        private String heroHeading;
        private String heroSubheading;
        private String heroMediaUrl;
        private String heroMediaType;
        private String heroMediaPublicId;
        private String phoneNumber;
        private String whatsappNumber;
        private String email;
        private String instagramUrl;
        private String address;
        private String plusCode;
        private String googleMapsEmbedUrl;
        private String googleMapsLink;
        private java.math.BigDecimal displayRating;
        private Integer displayReviewCount;
        private String priceRangeText;
        private Boolean onlineOrderingEnabled = true;
        private String closureMessage;
        private String nextOpeningTime;
        private Double cafeLatitude;
        private Double cafeLongitude;
        private Double freeDeliveryDistanceKm;
        private java.math.BigDecimal deliveryRatePerKm;
        private List<BusinessHoursDto> businessHours;

        public BusinessSettingsDto() {}

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private UUID id;
            private String cafeName;
            private String tagline;
            private String aboutText;
            private String heroHeading;
            private String heroSubheading;
            private String heroMediaUrl;
            private String heroMediaType;
            private String heroMediaPublicId;
            private String phoneNumber;
            private String whatsappNumber;
            private String email;
            private String instagramUrl;
            private String address;
            private String plusCode;
            private String googleMapsEmbedUrl;
            private String googleMapsLink;
            private java.math.BigDecimal displayRating;
            private Integer displayReviewCount;
            private String priceRangeText;
            private Boolean onlineOrderingEnabled = true;
            private String closureMessage;
            private String nextOpeningTime;
            private Double cafeLatitude;
            private Double cafeLongitude;
            private Double freeDeliveryDistanceKm;
            private java.math.BigDecimal deliveryRatePerKm;
            private List<BusinessHoursDto> businessHours;

            public Builder id(UUID id) { this.id = id; return this; }
            public Builder cafeName(String cafeName) { this.cafeName = cafeName; return this; }
            public Builder tagline(String tagline) { this.tagline = tagline; return this; }
            public Builder aboutText(String aboutText) { this.aboutText = aboutText; return this; }
            public Builder heroHeading(String heroHeading) { this.heroHeading = heroHeading; return this; }
            public Builder heroSubheading(String heroSubheading) { this.heroSubheading = heroSubheading; return this; }
            public Builder heroMediaUrl(String heroMediaUrl) { this.heroMediaUrl = heroMediaUrl; return this; }
            public Builder heroMediaType(String heroMediaType) { this.heroMediaType = heroMediaType; return this; }
            public Builder heroMediaPublicId(String heroMediaPublicId) { this.heroMediaPublicId = heroMediaPublicId; return this; }
            public Builder phoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; return this; }
            public Builder whatsappNumber(String whatsappNumber) { this.whatsappNumber = whatsappNumber; return this; }
            public Builder email(String email) { this.email = email; return this; }
            public Builder instagramUrl(String instagramUrl) { this.instagramUrl = instagramUrl; return this; }
            public Builder address(String address) { this.address = address; return this; }
            public Builder plusCode(String plusCode) { this.plusCode = plusCode; return this; }
            public Builder googleMapsEmbedUrl(String googleMapsEmbedUrl) { this.googleMapsEmbedUrl = googleMapsEmbedUrl; return this; }
            public Builder googleMapsLink(String googleMapsLink) { this.googleMapsLink = googleMapsLink; return this; }
            public Builder displayRating(java.math.BigDecimal displayRating) { this.displayRating = displayRating; return this; }
            public Builder displayReviewCount(Integer displayReviewCount) { this.displayReviewCount = displayReviewCount; return this; }
            public Builder priceRangeText(String priceRangeText) { this.priceRangeText = priceRangeText; return this; }
            public Builder onlineOrderingEnabled(Boolean onlineOrderingEnabled) { this.onlineOrderingEnabled = onlineOrderingEnabled; return this; }
            public Builder closureMessage(String closureMessage) { this.closureMessage = closureMessage; return this; }
            public Builder nextOpeningTime(String nextOpeningTime) { this.nextOpeningTime = nextOpeningTime; return this; }
            public Builder cafeLatitude(Double cafeLatitude) { this.cafeLatitude = cafeLatitude; return this; }
            public Builder cafeLongitude(Double cafeLongitude) { this.cafeLongitude = cafeLongitude; return this; }
            public Builder freeDeliveryDistanceKm(Double freeDeliveryDistanceKm) { this.freeDeliveryDistanceKm = freeDeliveryDistanceKm; return this; }
            public Builder deliveryRatePerKm(java.math.BigDecimal deliveryRatePerKm) { this.deliveryRatePerKm = deliveryRatePerKm; return this; }
            public Builder businessHours(List<BusinessHoursDto> businessHours) { this.businessHours = businessHours; return this; }

            public BusinessSettingsDto build() {
                BusinessSettingsDto dto = new BusinessSettingsDto();
                dto.setId(id);
                dto.setCafeName(cafeName);
                dto.setTagline(tagline);
                dto.setAboutText(aboutText);
                dto.setHeroHeading(heroHeading);
                dto.setHeroSubheading(heroSubheading);
                dto.setHeroMediaUrl(heroMediaUrl);
                dto.setHeroMediaType(heroMediaType);
                dto.setHeroMediaPublicId(heroMediaPublicId);
                dto.setPhoneNumber(phoneNumber);
                dto.setWhatsappNumber(whatsappNumber);
                dto.setEmail(email);
                dto.setInstagramUrl(instagramUrl);
                dto.setAddress(address);
                dto.setPlusCode(plusCode);
                dto.setGoogleMapsEmbedUrl(googleMapsEmbedUrl);
                dto.setGoogleMapsLink(googleMapsLink);
                dto.setDisplayRating(displayRating);
                dto.setDisplayReviewCount(displayReviewCount);
                dto.setPriceRangeText(priceRangeText);
                dto.setOnlineOrderingEnabled(onlineOrderingEnabled != null ? onlineOrderingEnabled : true);
                dto.setClosureMessage(closureMessage);
                dto.setNextOpeningTime(nextOpeningTime);
                dto.setCafeLatitude(cafeLatitude);
                dto.setCafeLongitude(cafeLongitude);
                dto.setFreeDeliveryDistanceKm(freeDeliveryDistanceKm);
                dto.setDeliveryRatePerKm(deliveryRatePerKm);
                dto.setBusinessHours(businessHours);
                return dto;
            }
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }

        public String getCafeName() { return cafeName; }
        public void setCafeName(String cafeName) { this.cafeName = cafeName; }

        public String getTagline() { return tagline; }
        public void setTagline(String tagline) { this.tagline = tagline; }

        public String getAboutText() { return aboutText; }
        public void setAboutText(String aboutText) { this.aboutText = aboutText; }

        public String getHeroHeading() { return heroHeading; }
        public void setHeroHeading(String heroHeading) { this.heroHeading = heroHeading; }

        public String getHeroSubheading() { return heroSubheading; }
        public void setHeroSubheading(String heroSubheading) { this.heroSubheading = heroSubheading; }

        public String getHeroMediaUrl() { return heroMediaUrl; }
        public void setHeroMediaUrl(String heroMediaUrl) { this.heroMediaUrl = heroMediaUrl; }

        public String getHeroMediaType() { return heroMediaType; }
        public void setHeroMediaType(String heroMediaType) { this.heroMediaType = heroMediaType; }

        public String getHeroMediaPublicId() { return heroMediaPublicId; }
        public void setHeroMediaPublicId(String heroMediaPublicId) { this.heroMediaPublicId = heroMediaPublicId; }

        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

        public String getWhatsappNumber() { return whatsappNumber; }
        public void setWhatsappNumber(String whatsappNumber) { this.whatsappNumber = whatsappNumber; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getInstagramUrl() { return instagramUrl; }
        public void setInstagramUrl(String instagramUrl) { this.instagramUrl = instagramUrl; }

        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }

        public String getPlusCode() { return plusCode; }
        public void setPlusCode(String plusCode) { this.plusCode = plusCode; }

        public String getGoogleMapsEmbedUrl() { return googleMapsEmbedUrl; }
        public void setGoogleMapsEmbedUrl(String googleMapsEmbedUrl) { this.googleMapsEmbedUrl = googleMapsEmbedUrl; }

        public String getGoogleMapsLink() { return googleMapsLink; }
        public void setGoogleMapsLink(String googleMapsLink) { this.googleMapsLink = googleMapsLink; }

        public java.math.BigDecimal getDisplayRating() { return displayRating; }
        public void setDisplayRating(java.math.BigDecimal displayRating) { this.displayRating = displayRating; }

        public Integer getDisplayReviewCount() { return displayReviewCount; }
        public void setDisplayReviewCount(Integer displayReviewCount) { this.displayReviewCount = displayReviewCount; }

        public String getPriceRangeText() { return priceRangeText; }
        public void setPriceRangeText(String priceRangeText) { this.priceRangeText = priceRangeText; }

        public Boolean getOnlineOrderingEnabled() { return onlineOrderingEnabled != null ? onlineOrderingEnabled : true; }
        public void setOnlineOrderingEnabled(Boolean onlineOrderingEnabled) { this.onlineOrderingEnabled = onlineOrderingEnabled != null ? onlineOrderingEnabled : true; }

        public String getClosureMessage() { return closureMessage; }
        public void setClosureMessage(String closureMessage) { this.closureMessage = closureMessage; }

        public String getNextOpeningTime() { return nextOpeningTime; }
        public void setNextOpeningTime(String nextOpeningTime) { this.nextOpeningTime = nextOpeningTime; }

        public Double getCafeLatitude() { return cafeLatitude; }
        public void setCafeLatitude(Double cafeLatitude) { this.cafeLatitude = cafeLatitude; }

        public Double getCafeLongitude() { return cafeLongitude; }
        public void setCafeLongitude(Double cafeLongitude) { this.cafeLongitude = cafeLongitude; }

        public Double getFreeDeliveryDistanceKm() { return freeDeliveryDistanceKm; }
        public void setFreeDeliveryDistanceKm(Double freeDeliveryDistanceKm) { this.freeDeliveryDistanceKm = freeDeliveryDistanceKm; }

        public java.math.BigDecimal getDeliveryRatePerKm() { return deliveryRatePerKm; }
        public void setDeliveryRatePerKm(java.math.BigDecimal deliveryRatePerKm) { this.deliveryRatePerKm = deliveryRatePerKm; }

        public List<BusinessHoursDto> getBusinessHours() { return businessHours; }
        public void setBusinessHours(List<BusinessHoursDto> businessHours) { this.businessHours = businessHours; }
    }

    public static class BusinessSettingsUpdateRequest {
        private String cafeName;
        private String tagline;
        private String aboutText;
        private String heroHeading;
        private String heroSubheading;
        private String heroMediaUrl;
        private String heroMediaType;
        private String heroMediaPublicId;
        private String phoneNumber;
        private String whatsappNumber;
        private String email;
        private String instagramUrl;
        private String address;
        private String plusCode;
        private String googleMapsEmbedUrl;
        private String googleMapsLink;
        private java.math.BigDecimal displayRating;
        private Integer displayReviewCount;
        private String priceRangeText;
        private Boolean onlineOrderingEnabled;
        private String closureMessage;
        private String nextOpeningTime;
        private Double cafeLatitude;
        private Double cafeLongitude;
        private Double freeDeliveryDistanceKm;
        private java.math.BigDecimal deliveryRatePerKm;

        public BusinessSettingsUpdateRequest() {}

        public String getCafeName() { return cafeName; }
        public void setCafeName(String cafeName) { this.cafeName = cafeName; }

        public String getTagline() { return tagline; }
        public void setTagline(String tagline) { this.tagline = tagline; }

        public String getAboutText() { return aboutText; }
        public void setAboutText(String aboutText) { this.aboutText = aboutText; }

        public String getHeroHeading() { return heroHeading; }
        public void setHeroHeading(String heroHeading) { this.heroHeading = heroHeading; }

        public String getHeroSubheading() { return heroSubheading; }
        public void setHeroSubheading(String heroSubheading) { this.heroSubheading = heroSubheading; }

        public String getHeroMediaUrl() { return heroMediaUrl; }
        public void setHeroMediaUrl(String heroMediaUrl) { this.heroMediaUrl = heroMediaUrl; }

        public String getHeroMediaType() { return heroMediaType; }
        public void setHeroMediaType(String heroMediaType) { this.heroMediaType = heroMediaType; }

        public String getHeroMediaPublicId() { return heroMediaPublicId; }
        public void setHeroMediaPublicId(String heroMediaPublicId) { this.heroMediaPublicId = heroMediaPublicId; }

        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

        public String getWhatsappNumber() { return whatsappNumber; }
        public void setWhatsappNumber(String whatsappNumber) { this.whatsappNumber = whatsappNumber; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getInstagramUrl() { return instagramUrl; }
        public void setInstagramUrl(String instagramUrl) { this.instagramUrl = instagramUrl; }

        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }

        public String getPlusCode() { return plusCode; }
        public void setPlusCode(String plusCode) { this.plusCode = plusCode; }

        public String getGoogleMapsEmbedUrl() { return googleMapsEmbedUrl; }
        public void setGoogleMapsEmbedUrl(String googleMapsEmbedUrl) { this.googleMapsEmbedUrl = googleMapsEmbedUrl; }

        public String getGoogleMapsLink() { return googleMapsLink; }
        public void setGoogleMapsLink(String googleMapsLink) { this.googleMapsLink = googleMapsLink; }

        public java.math.BigDecimal getDisplayRating() { return displayRating; }
        public void setDisplayRating(java.math.BigDecimal displayRating) { this.displayRating = displayRating; }

        public Integer getDisplayReviewCount() { return displayReviewCount; }
        public void setDisplayReviewCount(Integer displayReviewCount) { this.displayReviewCount = displayReviewCount; }

        public String getPriceRangeText() { return priceRangeText; }
        public void setPriceRangeText(String priceRangeText) { this.priceRangeText = priceRangeText; }

        public Boolean getOnlineOrderingEnabled() { return onlineOrderingEnabled; }
        public void setOnlineOrderingEnabled(Boolean onlineOrderingEnabled) { this.onlineOrderingEnabled = onlineOrderingEnabled; }

        public String getClosureMessage() { return closureMessage; }
        public void setClosureMessage(String closureMessage) { this.closureMessage = closureMessage; }

        public String getNextOpeningTime() { return nextOpeningTime; }
        public void setNextOpeningTime(String nextOpeningTime) { this.nextOpeningTime = nextOpeningTime; }

        public Double getCafeLatitude() { return cafeLatitude; }
        public void setCafeLatitude(Double cafeLatitude) { this.cafeLatitude = cafeLatitude; }

        public Double getCafeLongitude() { return cafeLongitude; }
        public void setCafeLongitude(Double cafeLongitude) { this.cafeLongitude = cafeLongitude; }

        public Double getFreeDeliveryDistanceKm() { return freeDeliveryDistanceKm; }
        public void setFreeDeliveryDistanceKm(Double freeDeliveryDistanceKm) { this.freeDeliveryDistanceKm = freeDeliveryDistanceKm; }

        public java.math.BigDecimal getDeliveryRatePerKm() { return deliveryRatePerKm; }
        public void setDeliveryRatePerKm(java.math.BigDecimal deliveryRatePerKm) { this.deliveryRatePerKm = deliveryRatePerKm; }
    }

    public static class BusinessHoursUpdateRequest {
        private List<BusinessHoursDto> hours;

        public BusinessHoursUpdateRequest() {}

        public List<BusinessHoursDto> getHours() { return hours; }
        public void setHours(List<BusinessHoursDto> hours) { this.hours = hours; }
    }

    public static class OnlineOrderingStatusDto {
        private boolean onlineOrderingEnabled;
        private String closureMessage;
        private String nextOpeningTime;

        public OnlineOrderingStatusDto() {}

        public OnlineOrderingStatusDto(boolean onlineOrderingEnabled, String closureMessage, String nextOpeningTime) {
            this.onlineOrderingEnabled = onlineOrderingEnabled;
            this.closureMessage = closureMessage;
            this.nextOpeningTime = nextOpeningTime;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private boolean onlineOrderingEnabled = true;
            private String closureMessage;
            private String nextOpeningTime;

            public Builder onlineOrderingEnabled(boolean onlineOrderingEnabled) {
                this.onlineOrderingEnabled = onlineOrderingEnabled;
                return this;
            }
            public Builder closureMessage(String closureMessage) {
                this.closureMessage = closureMessage;
                return this;
            }
            public Builder nextOpeningTime(String nextOpeningTime) {
                this.nextOpeningTime = nextOpeningTime;
                return this;
            }
            public OnlineOrderingStatusDto build() {
                return new OnlineOrderingStatusDto(onlineOrderingEnabled, closureMessage, nextOpeningTime);
            }
        }

        public boolean isOnlineOrderingEnabled() { return onlineOrderingEnabled; }
        public void setOnlineOrderingEnabled(boolean onlineOrderingEnabled) { this.onlineOrderingEnabled = onlineOrderingEnabled; }

        public String getClosureMessage() { return closureMessage; }
        public void setClosureMessage(String closureMessage) { this.closureMessage = closureMessage; }

        public String getNextOpeningTime() { return nextOpeningTime; }
        public void setNextOpeningTime(String nextOpeningTime) { this.nextOpeningTime = nextOpeningTime; }
    }

    public static class OnlineOrderingUpdateRequest {
        private Boolean enabled;
        private String closureMessage;
        private String nextOpeningTime;

        public OnlineOrderingUpdateRequest() {}

        public OnlineOrderingUpdateRequest(Boolean enabled, String closureMessage, String nextOpeningTime) {
            this.enabled = enabled;
            this.closureMessage = closureMessage;
            this.nextOpeningTime = nextOpeningTime;
        }

        public Boolean getEnabled() { return enabled; }
        public void setEnabled(Boolean enabled) { this.enabled = enabled; }

        public String getClosureMessage() { return closureMessage; }
        public void setClosureMessage(String closureMessage) { this.closureMessage = closureMessage; }

        public String getNextOpeningTime() { return nextOpeningTime; }
        public void setNextOpeningTime(String nextOpeningTime) { this.nextOpeningTime = nextOpeningTime; }
    }
}
