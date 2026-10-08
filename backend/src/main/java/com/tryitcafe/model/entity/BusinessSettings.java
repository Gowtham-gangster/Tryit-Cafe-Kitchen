package com.tryitcafe.model.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "business_settings")
public class BusinessSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 150)
    private String cafeName = "TryIt Cafe & Kitchen";

    @Column(length = 200)
    private String tagline = "Delicious Food, Cozy Ambience, Unforgettable Flavours";

    @Column(columnDefinition = "TEXT")
    private String aboutText;

    @Column(length = 200)
    private String heroHeading = "Craving Delicious Bites & Warm Moments?";

    @Column(columnDefinition = "TEXT")
    private String heroSubheading = "Experience authentic café flavors, crafted with passion. Order your favorite dishes directly via WhatsApp!";

    @Column(length = 500)
    private String heroMediaUrl;

    @Column(length = 20)
    private String heroMediaType = "IMAGE";

    @Column(length = 200)
    private String heroMediaPublicId;

    @Column(length = 100)
    private String phoneNumber = "";

    @Column(nullable = false, length = 50)
    private String whatsappNumber = "";

    @Column(length = 200)
    private String email = "";

    @Column(length = 500)
    private String instagramUrl = "";

    @Column(columnDefinition = "TEXT")
    private String address = "Back side Union Bank, H No 3-127/2, Hyderabad - Narsapur Rd, Ganesh Nagar, Gandi Maisamma, Hyderabad, Telangana 500043";

    @Column(length = 50)
    private String plusCode = "HCGC+FM Hyderabad, Telangana";

    @Column(columnDefinition = "TEXT")
    private String googleMapsEmbedUrl;

    @Column(length = 500)
    private String googleMapsLink;

    @Column(precision = 3, scale = 1)
    private java.math.BigDecimal displayRating = new java.math.BigDecimal("4.9");

    @Column
    private Integer displayReviewCount = 50;

    @Column(length = 50)
    private String priceRangeText = "\u20b91\u2013200 per person";

    @Column(nullable = false)
    private Boolean onlineOrderingEnabled = true;

    @Column(columnDefinition = "TEXT")
    private String closureMessage;

    @Column(length = 50)
    private String nextOpeningTime;

    @Column
    private Double cafeLatitude = 17.5752766;

    @Column
    private Double cafeLongitude = 78.4211027;

    @Column
    private Double freeDeliveryDistanceKm = 3.0;

    @Column(precision = 10, scale = 2)
    private java.math.BigDecimal deliveryRatePerKm = new java.math.BigDecimal("5.00");

    @OneToMany(mappedBy = "businessSettings", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<BusinessHours> businessHours = new ArrayList<>();

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public BusinessSettings() {
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private UUID id;
        private String cafeName = "TryIt Cafe & Kitchen";
        private String tagline = "Delicious Food, Cozy Ambience, Unforgettable Flavours";
        private String aboutText;
        private String heroHeading = "Craving Delicious Bites & Warm Moments?";
        private String heroSubheading = "Experience authentic café flavors, crafted with passion. Order your favorite dishes directly via WhatsApp!";
        private String heroMediaUrl;
        private String heroMediaType = "IMAGE";
        private String heroMediaPublicId;
        private String phoneNumber = "";
        private String whatsappNumber = "";
        private String email = "contact@tryitcafe.com";
        private String instagramUrl = "https://instagram.com/tryitcafe";
        private String address = "Back side Union Bank, H No 3-127/2, Hyderabad - Narsapur Rd, Ganesh Nagar, Gandi Maisamma, Hyderabad, Telangana 500043";
        private String plusCode = "HCGC+FM Hyderabad, Telangana";
        private String googleMapsEmbedUrl;
        private String googleMapsLink;
        private java.math.BigDecimal displayRating = new java.math.BigDecimal("4.9");
        private Integer displayReviewCount = 50;
        private String priceRangeText = "\u20b91\u2013200 per person";
        private Boolean onlineOrderingEnabled = true;
        private String closureMessage;
        private String nextOpeningTime;

        private Double cafeLatitude = 17.5765121;
        private Double cafeLongitude = 78.4200518;
        private Double freeDeliveryDistanceKm = 3.0;
        private java.math.BigDecimal deliveryRatePerKm = new java.math.BigDecimal("5.00");

        public Builder id(UUID id) {
            this.id = id;
            return this;
        }

        public Builder cafeName(String cafeName) {
            this.cafeName = cafeName;
            return this;
        }

        public Builder tagline(String tagline) {
            this.tagline = tagline;
            return this;
        }

        public Builder aboutText(String aboutText) {
            this.aboutText = aboutText;
            return this;
        }

        public Builder heroHeading(String heroHeading) {
            this.heroHeading = heroHeading;
            return this;
        }

        public Builder heroSubheading(String heroSubheading) {
            this.heroSubheading = heroSubheading;
            return this;
        }

        public Builder heroMediaUrl(String heroMediaUrl) {
            this.heroMediaUrl = heroMediaUrl;
            return this;
        }

        public Builder heroMediaType(String heroMediaType) {
            this.heroMediaType = heroMediaType;
            return this;
        }

        public Builder heroMediaPublicId(String heroMediaPublicId) {
            this.heroMediaPublicId = heroMediaPublicId;
            return this;
        }

        public Builder phoneNumber(String phoneNumber) {
            this.phoneNumber = phoneNumber;
            return this;
        }

        public Builder whatsappNumber(String whatsappNumber) {
            this.whatsappNumber = whatsappNumber;
            return this;
        }

        public Builder email(String email) {
            this.email = email;
            return this;
        }

        public Builder instagramUrl(String instagramUrl) {
            this.instagramUrl = instagramUrl;
            return this;
        }

        public Builder address(String address) {
            this.address = address;
            return this;
        }

        public Builder plusCode(String plusCode) {
            this.plusCode = plusCode;
            return this;
        }

        public Builder googleMapsEmbedUrl(String googleMapsEmbedUrl) {
            this.googleMapsEmbedUrl = googleMapsEmbedUrl;
            return this;
        }

        public Builder googleMapsLink(String googleMapsLink) {
            this.googleMapsLink = googleMapsLink;
            return this;
        }

        public Builder displayRating(java.math.BigDecimal displayRating) {
            this.displayRating = displayRating;
            return this;
        }

        public Builder displayReviewCount(Integer displayReviewCount) {
            this.displayReviewCount = displayReviewCount;
            return this;
        }

        public Builder priceRangeText(String priceRangeText) {
            this.priceRangeText = priceRangeText;
            return this;
        }

        public Builder onlineOrderingEnabled(Boolean onlineOrderingEnabled) {
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

        public Builder cafeLatitude(Double cafeLatitude) {
            this.cafeLatitude = cafeLatitude;
            return this;
        }

        public Builder cafeLongitude(Double cafeLongitude) {
            this.cafeLongitude = cafeLongitude;
            return this;
        }

        public Builder freeDeliveryDistanceKm(Double freeDeliveryDistanceKm) {
            this.freeDeliveryDistanceKm = freeDeliveryDistanceKm;
            return this;
        }

        public Builder deliveryRatePerKm(java.math.BigDecimal deliveryRatePerKm) {
            this.deliveryRatePerKm = deliveryRatePerKm;
            return this;
        }

        public BusinessSettings build() {
            BusinessSettings bs = new BusinessSettings();
            bs.setId(id);
            bs.setCafeName(cafeName);
            bs.setTagline(tagline);
            bs.setAboutText(aboutText);
            bs.setHeroHeading(heroHeading);
            bs.setHeroSubheading(heroSubheading);
            bs.setHeroMediaUrl(heroMediaUrl);
            bs.setHeroMediaType(heroMediaType);
            bs.setHeroMediaPublicId(heroMediaPublicId);
            bs.setPhoneNumber(phoneNumber);
            bs.setWhatsappNumber(whatsappNumber);
            bs.setEmail(email);
            bs.setInstagramUrl(instagramUrl);
            bs.setAddress(address);
            bs.setPlusCode(plusCode);
            bs.setGoogleMapsEmbedUrl(googleMapsEmbedUrl);
            bs.setGoogleMapsLink(googleMapsLink);
            bs.setDisplayRating(displayRating);
            bs.setDisplayReviewCount(displayReviewCount);
            bs.setPriceRangeText(priceRangeText);
            bs.setOnlineOrderingEnabled(onlineOrderingEnabled != null ? onlineOrderingEnabled : true);
            bs.setClosureMessage(closureMessage);
            bs.setNextOpeningTime(nextOpeningTime);
            if (cafeLatitude != null)
                bs.setCafeLatitude(cafeLatitude);
            if (cafeLongitude != null)
                bs.setCafeLongitude(cafeLongitude);
            if (freeDeliveryDistanceKm != null)
                bs.setFreeDeliveryDistanceKm(freeDeliveryDistanceKm);
            if (deliveryRatePerKm != null)
                bs.setDeliveryRatePerKm(deliveryRatePerKm);
            return bs;
        }
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getCafeName() {
        return cafeName;
    }

    public void setCafeName(String cafeName) {
        this.cafeName = cafeName;
    }

    public String getTagline() {
        return tagline;
    }

    public void setTagline(String tagline) {
        this.tagline = tagline;
    }

    public String getAboutText() {
        return aboutText;
    }

    public void setAboutText(String aboutText) {
        this.aboutText = aboutText;
    }

    public String getHeroHeading() {
        return heroHeading;
    }

    public void setHeroHeading(String heroHeading) {
        this.heroHeading = heroHeading;
    }

    public String getHeroSubheading() {
        return heroSubheading;
    }

    public void setHeroSubheading(String heroSubheading) {
        this.heroSubheading = heroSubheading;
    }

    public String getHeroMediaUrl() {
        return heroMediaUrl;
    }

    public void setHeroMediaUrl(String heroMediaUrl) {
        this.heroMediaUrl = heroMediaUrl;
    }

    public String getHeroMediaType() {
        return heroMediaType;
    }

    public void setHeroMediaType(String heroMediaType) {
        this.heroMediaType = heroMediaType;
    }

    public String getHeroMediaPublicId() {
        return heroMediaPublicId;
    }

    public void setHeroMediaPublicId(String heroMediaPublicId) {
        this.heroMediaPublicId = heroMediaPublicId;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getWhatsappNumber() {
        return whatsappNumber;
    }

    public void setWhatsappNumber(String whatsappNumber) {
        this.whatsappNumber = whatsappNumber;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getInstagramUrl() {
        return instagramUrl;
    }

    public void setInstagramUrl(String instagramUrl) {
        this.instagramUrl = instagramUrl;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPlusCode() {
        return plusCode;
    }

    public void setPlusCode(String plusCode) {
        this.plusCode = plusCode;
    }

    public String getGoogleMapsEmbedUrl() {
        return googleMapsEmbedUrl;
    }

    public void setGoogleMapsEmbedUrl(String googleMapsEmbedUrl) {
        this.googleMapsEmbedUrl = googleMapsEmbedUrl;
    }

    public String getGoogleMapsLink() {
        return googleMapsLink;
    }

    public void setGoogleMapsLink(String googleMapsLink) {
        this.googleMapsLink = googleMapsLink;
    }

    public java.math.BigDecimal getDisplayRating() {
        return displayRating;
    }

    public void setDisplayRating(java.math.BigDecimal displayRating) {
        this.displayRating = displayRating;
    }

    public Integer getDisplayReviewCount() {
        return displayReviewCount;
    }

    public void setDisplayReviewCount(Integer displayReviewCount) {
        this.displayReviewCount = displayReviewCount;
    }

    public String getPriceRangeText() {
        return priceRangeText;
    }

    public void setPriceRangeText(String priceRangeText) {
        this.priceRangeText = priceRangeText;
    }

    public Boolean getOnlineOrderingEnabled() {
        return onlineOrderingEnabled != null ? onlineOrderingEnabled : true;
    }

    public void setOnlineOrderingEnabled(Boolean onlineOrderingEnabled) {
        this.onlineOrderingEnabled = onlineOrderingEnabled != null ? onlineOrderingEnabled : true;
    }

    public String getClosureMessage() {
        return closureMessage;
    }

    public void setClosureMessage(String closureMessage) {
        this.closureMessage = closureMessage;
    }

    public String getNextOpeningTime() {
        return nextOpeningTime;
    }

    public void setNextOpeningTime(String nextOpeningTime) {
        this.nextOpeningTime = nextOpeningTime;
    }

    public Double getCafeLatitude() {
        return cafeLatitude != null ? cafeLatitude : 17.5752766;
    }

    public void setCafeLatitude(Double cafeLatitude) {
        this.cafeLatitude = cafeLatitude;
    }

    public Double getCafeLongitude() {
        return cafeLongitude != null ? cafeLongitude : 78.4211027;
    }

    public void setCafeLongitude(Double cafeLongitude) {
        this.cafeLongitude = cafeLongitude;
    }

    public Double getFreeDeliveryDistanceKm() {
        return freeDeliveryDistanceKm != null ? freeDeliveryDistanceKm : 3.0;
    }

    public void setFreeDeliveryDistanceKm(Double freeDeliveryDistanceKm) {
        this.freeDeliveryDistanceKm = freeDeliveryDistanceKm;
    }

    public java.math.BigDecimal getDeliveryRatePerKm() {
        return deliveryRatePerKm != null ? deliveryRatePerKm : new java.math.BigDecimal("5.00");
    }

    public void setDeliveryRatePerKm(java.math.BigDecimal deliveryRatePerKm) {
        this.deliveryRatePerKm = deliveryRatePerKm;
    }

    public List<BusinessHours> getBusinessHours() {
        return businessHours;
    }

    public void setBusinessHours(List<BusinessHours> businessHours) {
        this.businessHours = businessHours;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
