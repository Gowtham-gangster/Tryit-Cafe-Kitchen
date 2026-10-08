package com.tryitcafe.service;

import com.tryitcafe.exception.BadRequestException;
import com.tryitcafe.exception.OrderingClosedException;
import com.tryitcafe.exception.ResourceNotFoundException;
import com.tryitcafe.model.dto.CustomerLocationDtos.CustomerLocationDto;
import com.tryitcafe.model.dto.OrderDtos.*;
import com.tryitcafe.model.entity.BusinessSettings;
import com.tryitcafe.model.entity.CustomerLocation;
import com.tryitcafe.model.entity.MenuItem;
import com.tryitcafe.model.entity.User;
import com.tryitcafe.repository.CustomerLocationRepository;
import com.tryitcafe.repository.MenuItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    private final BusinessSettingsService businessSettingsService;
    private final CustomerLocationRepository customerLocationRepository;
    private final MenuItemRepository menuItemRepository;
    private final DistanceService distanceService;
    private final CustomerLocationService customerLocationService;
    private final MenuPricingService menuPricingService;

    public OrderService(
            BusinessSettingsService businessSettingsService,
            CustomerLocationRepository customerLocationRepository,
            MenuItemRepository menuItemRepository,
            DistanceService distanceService,
            CustomerLocationService customerLocationService,
            MenuPricingService menuPricingService
    ) {
        this.businessSettingsService = businessSettingsService;
        this.customerLocationRepository = customerLocationRepository;
        this.menuItemRepository = menuItemRepository;
        this.distanceService = distanceService;
        this.customerLocationService = customerLocationService;
        this.menuPricingService = menuPricingService;
    }

    /**
     * Authoritative backend order validation and delivery charge calculation.
     * Prevents any client-side tampering with price, distance, or delivery charge.
     */
    @Transactional(readOnly = true)
    public OrderPreviewResponse previewOrder(User user, OrderPreviewRequest request) {
        // 1. Authoritative check: Is online ordering open?
        if (!businessSettingsService.isOnlineOrderingEnabled()) {
            throw new OrderingClosedException(businessSettingsService.getEffectiveClosureMessage());
        }

        if (request == null || request.getOrderType() == null) {
            throw new BadRequestException("Order type is required (DELIVERY or TAKEAWAY)");
        }

        String orderType = request.getOrderType().trim().toUpperCase();
        if (!orderType.equals("DELIVERY") && !orderType.equals("TAKEAWAY")) {
            throw new BadRequestException("Order type must be either DELIVERY or TAKEAWAY");
        }

        // 2. Fetch authoritative business settings for origin & delivery pricing
        BusinessSettings settings = businessSettingsService.getOrCreateDefaultSettings();
        double cafeLat = settings.getCafeLatitude();
        double cafeLon = settings.getCafeLongitude();
        double freeDistanceKm = settings.getFreeDeliveryDistanceKm();
        BigDecimal ratePerKm = settings.getDeliveryRatePerKm();

        CustomerLocationDto locationDto = null;
        double distanceKm = 0.0;
        BigDecimal deliveryCharge = BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);

        // 3. If DELIVERY: authoritative location validation and distance calculation
        if (orderType.equals("DELIVERY")) {
            if (request.getLocationId() == null) {
                throw new BadRequestException("A valid saved delivery location is required for DELIVERY orders");
            }

            CustomerLocation location = customerLocationRepository.findByIdAndCustomerId(request.getLocationId(), user.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Selected delivery location not found or unauthorized"));

            if (location.getAddress() == null || location.getAddress().trim().isEmpty()) {
                throw new BadRequestException("Selected delivery location has an invalid or empty address");
            }

            if (location.getLatitude() == null || location.getLongitude() == null ||
                    Double.isNaN(location.getLatitude()) || Double.isNaN(location.getLongitude()) ||
                    location.getLatitude() < -90.0 || location.getLatitude() > 90.0 ||
                    location.getLongitude() < -180.0 || location.getLongitude() > 180.0) {
                throw new BadRequestException("Selected delivery location has invalid GPS coordinates");
            }

            // Haversine straight-line distance from cafe origin
            distanceKm = distanceService.calculateHaversineDistanceKm(
                    cafeLat, cafeLon,
                    location.getLatitude(), location.getLongitude()
            );

            // Authoritative delivery charge calculation
            deliveryCharge = distanceService.calculateDeliveryCharge(distanceKm, freeDistanceKm, ratePerKm);
            locationDto = customerLocationService.toDto(location);
        }

        // 4. Validate menu items and compute authoritative subtotal directly from database prices
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException("Cart cannot be empty for checkout preview");
        }

        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderPreviewItemDto> previewItems = new ArrayList<>();

        for (OrderItemRequest itemReq : request.getItems()) {
            if (itemReq.getMenuItemId() == null || itemReq.getQuantity() == null || itemReq.getQuantity() <= 0) {
                continue;
            }

            MenuItem item = menuItemRepository.findById(itemReq.getMenuItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("MenuItem", "id", itemReq.getMenuItemId()));

            if (!item.isAvailable()) {
                throw new BadRequestException("'" + item.getName() + "' is currently unavailable");
            }

            BigDecimal unitPrice = menuPricingService.calculateEffectivePrice(item);
            BigDecimal itemTotal = unitPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity())).setScale(2, RoundingMode.HALF_UP);
            subtotal = subtotal.add(itemTotal);

            previewItems.add(new OrderPreviewItemDto(
                    item.getId(),
                    item.getName(),
                    unitPrice,
                    itemReq.getQuantity(),
                    itemTotal,
                    item.getImageUrl(),
                    item.getFoodType() != null ? item.getFoodType().name() : null
            ));
        }

        if (previewItems.isEmpty()) {
            throw new BadRequestException("No valid items found in the order request");
        }

        // 5. Compute authoritative final total
        BigDecimal total = subtotal.add(deliveryCharge).setScale(2, RoundingMode.HALF_UP);

        return OrderPreviewResponse.builder()
                .orderType(orderType)
                .subtotal(subtotal.setScale(2, RoundingMode.HALF_UP))
                .distanceKm(distanceService.roundDistance(distanceKm))
                .deliveryCharge(deliveryCharge)
                .total(total)
                .freeDeliveryDistanceKm(freeDistanceKm)
                .deliveryRatePerKm(ratePerKm)
                .location(locationDto)
                .items(previewItems)
                .build();
    }
}
