package com.tryitcafe.mapper;

import com.tryitcafe.model.dto.SettingsDtos;
import com.tryitcafe.model.entity.BusinessHours;
import com.tryitcafe.model.entity.BusinessSettings;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class BusinessSettingsMapper {

    public SettingsDtos.BusinessSettingsDto toDto(BusinessSettings settings, List<BusinessHours> hours) {
        if (settings == null) return null;
        return SettingsDtos.BusinessSettingsDto.builder()
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
                .businessHours(hours != null ? hours.stream().map(this::toHoursDto).collect(Collectors.toList()) : List.of())
                .build();
    }

    public SettingsDtos.BusinessHoursDto toHoursDto(BusinessHours h) {
        if (h == null) return null;
        return SettingsDtos.BusinessHoursDto.builder()
                .id(h.getId())
                .dayOfWeek(h.getDayOfWeek())
                .openTime(h.getOpenTime())
                .closeTime(h.getCloseTime())
                .closed(h.isClosed())
                .dayOrder(h.getDayOrder())
                .build();
    }
}
