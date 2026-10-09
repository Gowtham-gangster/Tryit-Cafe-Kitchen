package com.tryitcafe.service;

import com.tryitcafe.model.dto.DashboardSummaryDto;
import com.tryitcafe.model.dto.SettingsDtos.*;
import com.tryitcafe.model.entity.BusinessHours;
import com.tryitcafe.model.entity.BusinessSettings;
import com.tryitcafe.model.enums.ReviewStatus;
import com.tryitcafe.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BusinessSettingsService {

    private final BusinessSettingsRepository businessSettingsRepository;
    private final BusinessHoursRepository businessHoursRepository;
    private final MenuItemRepository menuItemRepository;
    private final CategoryRepository categoryRepository;
    private final OfferRepository offerRepository;
    private final ReviewRepository reviewRepository;

    @org.springframework.beans.factory.annotation.Value("${app.seed.whatsapp-number:}")
    private String defaultWhatsappNumber;

    @org.springframework.beans.factory.annotation.Value("${app.seed.phone-number:}")
    private String defaultPhoneNumber;

    public BusinessSettingsService(
            BusinessSettingsRepository businessSettingsRepository,
            BusinessHoursRepository businessHoursRepository,
            MenuItemRepository menuItemRepository,
            CategoryRepository categoryRepository,
            OfferRepository offerRepository,
            ReviewRepository reviewRepository
    ) {
        this.businessSettingsRepository = businessSettingsRepository;
        this.businessHoursRepository = businessHoursRepository;
        this.menuItemRepository = menuItemRepository;
        this.categoryRepository = categoryRepository;
        this.offerRepository = offerRepository;
        this.reviewRepository = reviewRepository;
    }

    private final Object settingsLock = new Object();
    private volatile BusinessSettingsDto cachedSettingsDto = null;
    private volatile long lastSettingsCacheTime = 0L;
    private static final long SETTINGS_CACHE_TTL_MS = 60_000L; // 60 seconds

    public void invalidateCache() {
        synchronized (settingsLock) {
            cachedSettingsDto = null;
            lastSettingsCacheTime = 0L;
        }
    }

    public BusinessSettingsDto getSettings() {
        long now = System.currentTimeMillis();
        BusinessSettingsDto local = cachedSettingsDto;
        if (local != null && (now - lastSettingsCacheTime < SETTINGS_CACHE_TTL_MS)) {
            return local;
        }
        synchronized (settingsLock) {
            if (cachedSettingsDto != null && (System.currentTimeMillis() - lastSettingsCacheTime < SETTINGS_CACHE_TTL_MS)) {
                return cachedSettingsDto;
            }
            BusinessSettings settings = getOrCreateDefaultSettings();
            BusinessSettingsDto dto = toDto(settings);
            cachedSettingsDto = dto;
            lastSettingsCacheTime = System.currentTimeMillis();
            return dto;
        }
    }

    @Transactional
    public BusinessSettingsDto updateSettings(BusinessSettingsUpdateRequest request) {
        BusinessSettings settings = getOrCreateDefaultSettings();

        if (request.getCafeName() != null) settings.setCafeName(request.getCafeName());
        if (request.getTagline() != null) settings.setTagline(request.getTagline());
        if (request.getAboutText() != null) settings.setAboutText(request.getAboutText());
        if (request.getHeroHeading() != null) settings.setHeroHeading(request.getHeroHeading());
        if (request.getHeroSubheading() != null) settings.setHeroSubheading(request.getHeroSubheading());
        if (request.getHeroMediaUrl() != null) settings.setHeroMediaUrl(request.getHeroMediaUrl());
        if (request.getHeroMediaType() != null) settings.setHeroMediaType(request.getHeroMediaType());
        if (request.getHeroMediaPublicId() != null) settings.setHeroMediaPublicId(request.getHeroMediaPublicId());
        if (request.getPhoneNumber() != null) settings.setPhoneNumber(request.getPhoneNumber());
        if (request.getWhatsappNumber() != null) settings.setWhatsappNumber(request.getWhatsappNumber());
        if (request.getEmail() != null) settings.setEmail(request.getEmail());
        if (request.getInstagramUrl() != null) settings.setInstagramUrl(request.getInstagramUrl());
        if (request.getAddress() != null) settings.setAddress(request.getAddress());
        if (request.getPlusCode() != null) settings.setPlusCode(request.getPlusCode());
        if (request.getGoogleMapsEmbedUrl() != null) settings.setGoogleMapsEmbedUrl(request.getGoogleMapsEmbedUrl());
        if (request.getGoogleMapsLink() != null) settings.setGoogleMapsLink(request.getGoogleMapsLink());
        if (request.getDisplayRating() != null) settings.setDisplayRating(request.getDisplayRating());
        if (request.getDisplayReviewCount() != null) settings.setDisplayReviewCount(request.getDisplayReviewCount());
        if (request.getPriceRangeText() != null) settings.setPriceRangeText(request.getPriceRangeText());
        if (request.getOnlineOrderingEnabled() != null) settings.setOnlineOrderingEnabled(request.getOnlineOrderingEnabled());
        if (request.getClosureMessage() != null) settings.setClosureMessage(request.getClosureMessage());
        if (request.getNextOpeningTime() != null) settings.setNextOpeningTime(request.getNextOpeningTime());
        if (request.getCafeLatitude() != null) settings.setCafeLatitude(request.getCafeLatitude());
        if (request.getCafeLongitude() != null) settings.setCafeLongitude(request.getCafeLongitude());
        if (request.getFreeDeliveryDistanceKm() != null) settings.setFreeDeliveryDistanceKm(request.getFreeDeliveryDistanceKm());
        if (request.getDeliveryRatePerKm() != null) settings.setDeliveryRatePerKm(request.getDeliveryRatePerKm());

        BusinessSettings saved = businessSettingsRepository.save(settings);
        invalidateCache();
        return toDto(saved);
    }

    @Transactional
    public List<BusinessHoursDto> updateBusinessHours(BusinessHoursUpdateRequest request) {
        BusinessSettings settings = getOrCreateDefaultSettings();
        if (request.getHours() != null) {
            for (BusinessHoursDto dto : request.getHours()) {
                if (dto.getId() != null) {
                    businessHoursRepository.findById(dto.getId()).ifPresent(hour -> {
                        hour.setOpenTime(dto.getOpenTime());
                        hour.setCloseTime(dto.getCloseTime());
                        hour.setClosed(dto.isClosed());
                        businessHoursRepository.save(hour);
                    });
                }
            }
        }
        invalidateCache();
        return businessHoursRepository.findAllByOrderByDayOrderAsc().stream()
                .map(this::toHoursDto)
                .collect(Collectors.toList());
    }

    public DashboardSummaryDto getDashboardSummary() {
        long totalItems = menuItemRepository.countByDeletedFalse();
        long availableItems = menuItemRepository.countByDeletedFalseAndAvailableTrue();
        long totalCategories = categoryRepository.count();
        long activeOffers = offerRepository.countByActiveTrue();
        long totalReviews = reviewRepository.count();
        long pendingReviews = reviewRepository.countByStatus(ReviewStatus.PENDING);
        long approvedReviews = reviewRepository.countByStatus(ReviewStatus.APPROVED);

        List<com.tryitcafe.model.entity.Review> approved = reviewRepository.findAllByStatusOrderByCreatedAtDesc(ReviewStatus.APPROVED);
        double avgRating = approved.isEmpty() ? 5.0 : approved.stream().mapToInt(com.tryitcafe.model.entity.Review::getRating).average().orElse(5.0);

        return DashboardSummaryDto.builder()
                .totalMenuItems(totalItems)
                .availableMenuItems(availableItems)
                .totalCategories(totalCategories)
                .activeOffers(activeOffers)
                .totalReviews(totalReviews)
                .pendingReviews(pendingReviews)
                .approvedReviews(approvedReviews)
                .averageRating(Math.round(avgRating * 10.0) / 10.0)
                .build();
    }

    public BusinessSettings getOrCreateDefaultSettings() {
        return businessSettingsRepository.findAll().stream().findFirst().orElseGet(() -> {
            BusinessSettings defaultSettings = BusinessSettings.builder()
                    .cafeName("TryIt Cafe & Kitchen")
                    .tagline("Delicious Food, Cozy Ambience, Unforgettable Flavours")
                    .aboutText("TryIt Cafe & Kitchen is your neighbourhood food court and culinary sanctuary in Gandi Maisamma, Hyderabad. From crispy pakodas and hearty biryanis to authentic creamy pastas, loaded burgers, and signature shakes — every dish is crafted with fresh ingredients and real passion.")
                    .heroHeading("Taste The Moment at TryIt Cafe & Kitchen")
                    .heroSubheading("Freshly crafted pastas, loaded burgers, sizzlers & signature shakes. Browse our digital menu and order in seconds via WhatsApp!")
                    .phoneNumber(defaultPhoneNumber != null && !defaultPhoneNumber.isBlank() ? defaultPhoneNumber : "")
                    .whatsappNumber(defaultWhatsappNumber != null && !defaultWhatsappNumber.isBlank() ? defaultWhatsappNumber : "")
                    .email("")
                    .instagramUrl("")
                    .address("Back side Union Bank, H No 3-127/2, Hyderabad - Narsapur Rd, Ganesh Nagar, Gandi Maisamma, Hyderabad, Telangana 500043")
                    .plusCode("HCGC+FM Hyderabad, Telangana")
                    .googleMapsLink("https://maps.app.goo.gl/swbv6jctCUrmXMsq7")
                    .googleMapsEmbedUrl("https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3615.355248458839!2d78.42005183478837!3d17.57651209843505!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb8fea4ccf6b03%3A0xa4f2b954bdf0d4df!2sTryit%20cafe%26%20kichen!5e1!3m2!1sen!2sin!4v1787115650386!5m2!1sen!2sin")
                    .displayRating(new java.math.BigDecimal("4.9"))
                    .displayReviewCount(50)
                    .priceRangeText("\u20b91\u2013200 per person")
                    .onlineOrderingEnabled(true)
                    .build();
            return businessSettingsRepository.save(defaultSettings);
        });
    }

    public BusinessSettingsDto toDto(BusinessSettings settings) {
        List<BusinessHoursDto> hours = businessHoursRepository.findAllByOrderByDayOrderAsc().stream()
                .map(this::toHoursDto)
                .collect(Collectors.toList());

        return BusinessSettingsDto.builder()
                .id(settings.getId())
                .cafeName(settings.getCafeName())
                .tagline(settings.getTagline())
                .aboutText(settings.getAboutText())
                .heroHeading(settings.getHeroHeading())
                .heroSubheading(settings.getHeroSubheading())
                .heroMediaUrl(settings.getHeroMediaUrl())
                .heroMediaType(settings.getHeroMediaType())
                .heroMediaPublicId(settings.getHeroMediaPublicId())
                .phoneNumber(settings.getPhoneNumber())
                .whatsappNumber(settings.getWhatsappNumber())
                .email(settings.getEmail())
                .instagramUrl(settings.getInstagramUrl())
                .address(settings.getAddress())
                .plusCode(settings.getPlusCode())
                .googleMapsEmbedUrl(settings.getGoogleMapsEmbedUrl())
                .googleMapsLink(settings.getGoogleMapsLink())
                .displayRating(settings.getDisplayRating())
                .displayReviewCount(settings.getDisplayReviewCount())
                .priceRangeText(settings.getPriceRangeText())
                .onlineOrderingEnabled(settings.getOnlineOrderingEnabled())
                .closureMessage(settings.getClosureMessage())
                .nextOpeningTime(settings.getNextOpeningTime())
                .cafeLatitude(settings.getCafeLatitude())
                .cafeLongitude(settings.getCafeLongitude())
                .freeDeliveryDistanceKm(settings.getFreeDeliveryDistanceKm())
                .deliveryRatePerKm(settings.getDeliveryRatePerKm())
                .businessHours(hours)
                .build();
    }

    public boolean isOnlineOrderingEnabled() {
        BusinessSettings settings = getOrCreateDefaultSettings();
        return settings.getOnlineOrderingEnabled() != null ? settings.getOnlineOrderingEnabled() : true;
    }

    public String getEffectiveClosureMessage() {
        BusinessSettings settings = getOrCreateDefaultSettings();
        String msg = settings.getClosureMessage();
        if (msg == null || msg.trim().isEmpty()) {
            return "Online ordering is currently closed. We'll be back soon!";
        }
        return msg.trim();
    }

    public OnlineOrderingStatusDto getOnlineOrderingStatus() {
        BusinessSettings settings = getOrCreateDefaultSettings();
        return OnlineOrderingStatusDto.builder()
                .onlineOrderingEnabled(settings.getOnlineOrderingEnabled() != null ? settings.getOnlineOrderingEnabled() : true)
                .closureMessage(settings.getClosureMessage())
                .nextOpeningTime(settings.getNextOpeningTime())
                .build();
    }

    @Transactional
    public OnlineOrderingStatusDto updateOnlineOrderingStatus(OnlineOrderingUpdateRequest request) {
        BusinessSettings settings = getOrCreateDefaultSettings();
        if (request.getEnabled() != null) {
            settings.setOnlineOrderingEnabled(request.getEnabled());
        }
        if (request.getClosureMessage() != null) {
            settings.setClosureMessage(request.getClosureMessage());
        }
        if (request.getNextOpeningTime() != null) {
            settings.setNextOpeningTime(request.getNextOpeningTime());
        }
        businessSettingsRepository.save(settings);
        invalidateCache();
        return getOnlineOrderingStatus();
    }

    public BusinessHoursDto toHoursDto(BusinessHours h) {
        return BusinessHoursDto.builder()
                .id(h.getId())
                .dayOfWeek(h.getDayOfWeek())
                .openTime(h.getOpenTime())
                .closeTime(h.getCloseTime())
                .closed(h.isClosed())
                .dayOrder(h.getDayOrder())
                .build();
    }
}
