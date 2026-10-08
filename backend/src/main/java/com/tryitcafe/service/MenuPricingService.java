package com.tryitcafe.service;

import com.tryitcafe.exception.BadRequestException;
import com.tryitcafe.model.entity.MenuItem;
import com.tryitcafe.model.enums.DiscountType;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Authoritative backend pricing service.
 * Handles discount calculations, effective prices, and validation for MenuItems.
 */
@Service
public class MenuPricingService {

    /**
     * Calculates the exact discount amount deducted from the base price.
     */
    public BigDecimal calculateDiscountAmount(BigDecimal basePrice, boolean discountEnabled, DiscountType discountType, BigDecimal discountValue) {
        if (!discountEnabled || discountType == null || discountValue == null || basePrice == null) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        if (discountType == DiscountType.PERCENTAGE) {
            BigDecimal amount = basePrice.multiply(discountValue)
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
            return amount.min(basePrice).setScale(2, RoundingMode.HALF_UP);
        }

        if (discountType == DiscountType.FIXED || discountType == DiscountType.FLAT_AMOUNT) {
            BigDecimal amount = discountValue.setScale(2, RoundingMode.HALF_UP);
            return amount.min(basePrice).setScale(2, RoundingMode.HALF_UP);
        }

        return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
    }

    public BigDecimal calculateDiscountAmount(MenuItem item) {
        if (item == null) return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        return calculateDiscountAmount(item.getPrice(), item.isDiscountEnabled(), item.getDiscountType(), item.getDiscountValue());
    }

    /**
     * Calculates the authoritative effective selling price.
     */
    public BigDecimal calculateEffectivePrice(BigDecimal basePrice, boolean discountEnabled, DiscountType discountType, BigDecimal discountValue) {
        if (basePrice == null) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }
        BigDecimal discountAmount = calculateDiscountAmount(basePrice, discountEnabled, discountType, discountValue);
        BigDecimal effective = basePrice.subtract(discountAmount);
        return effective.max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP);
    }

    public BigDecimal calculateEffectivePrice(MenuItem item) {
        if (item == null) return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        return calculateEffectivePrice(item.getPrice(), item.isDiscountEnabled(), item.getDiscountType(), item.getDiscountValue());
    }

    /**
     * Validates owner discount parameters.
     */
    public void validateDiscount(BigDecimal basePrice, Boolean discountEnabled, DiscountType discountType, BigDecimal discountValue) {
        if (Boolean.TRUE.equals(discountEnabled)) {
            if (discountType == null) {
                throw new BadRequestException("Discount type is required when discount is enabled.");
            }
            if (discountValue == null) {
                throw new BadRequestException("Discount value is required when discount is enabled.");
            }
            if (discountValue.compareTo(BigDecimal.ZERO) < 0) {
                throw new BadRequestException("Discount cannot be negative.");
            }

            if (discountType == DiscountType.PERCENTAGE) {
                if (discountValue.compareTo(BigDecimal.valueOf(100)) >= 0) {
                    throw new BadRequestException("Percentage discount cannot exceed 100% and must be less than 100%.");
                }
            } else if (discountType == DiscountType.FIXED || discountType == DiscountType.FLAT_AMOUNT) {
                if (basePrice != null && discountValue.compareTo(basePrice) >= 0) {
                    throw new BadRequestException("Discount amount must be less than the item price.");
                }
            }
        }
    }
}
