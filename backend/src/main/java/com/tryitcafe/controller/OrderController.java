package com.tryitcafe.controller;

import com.tryitcafe.exception.OrderingClosedException;
import com.tryitcafe.model.dto.ApiResponse;
import com.tryitcafe.model.dto.OrderDtos.OrderPreviewRequest;
import com.tryitcafe.model.dto.OrderDtos.OrderPreviewResponse;
import com.tryitcafe.model.entity.User;
import com.tryitcafe.service.BusinessSettingsService;
import com.tryitcafe.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
public class OrderController {

    private final BusinessSettingsService businessSettingsService;
    private final OrderService orderService;

    public OrderController(BusinessSettingsService businessSettingsService, OrderService orderService) {
        this.businessSettingsService = businessSettingsService;
        this.orderService = orderService;
    }

    /**
     * Authoritative Order Preview Endpoint for Distance, Delivery Charge, and Subtotal.
     * Accessible at both /api/orders/preview and /api/v1/orders/preview.
     */
    @PostMapping(value = {"/api/orders/preview", "/api/v1/orders/preview"})
    public ResponseEntity<ApiResponse<OrderPreviewResponse>> previewOrder(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody OrderPreviewRequest request
    ) {
        OrderPreviewResponse preview = orderService.previewOrder(user, request);
        return ResponseEntity.ok(ApiResponse.ok("Order preview verified", preview));
    }

    /**
     * Critical Backend Enforcement Endpoint for Order Creation / Checkout.
     * Rejects any order creation attempt if onlineOrderingEnabled is false with HTTP 403
     * and code "ONLINE_ORDERING_CLOSED".
     */
    @PostMapping(value = {"/api/orders", "/api/v1/orders", "/api/v1/customer/orders", "/api/checkout", "/api/v1/checkout"})
    public ResponseEntity<ApiResponse<Map<String, Object>>> createOrValidateOrder(
            @AuthenticationPrincipal User user,
            @RequestBody(required = false) Map<String, Object> orderPayload
    ) {
        if (!businessSettingsService.isOnlineOrderingEnabled()) {
            throw new OrderingClosedException(businessSettingsService.getEffectiveClosureMessage());
        }

        return ResponseEntity.ok(ApiResponse.ok("Online ordering is active and order verified", Map.of(
                "status", "ACTIVE",
                "message", "Order verified successfully for WhatsApp dispatch"
        )));
    }
}
