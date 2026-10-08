package com.tryitcafe.controller;

import com.tryitcafe.model.dto.ApiResponse;
import com.tryitcafe.model.dto.AuthDtos.UpdateProfileRequest;
import com.tryitcafe.model.dto.AuthDtos.UserProfileDto;
import com.tryitcafe.model.dto.CartDtos;
import com.tryitcafe.model.dto.CustomerLocationDtos.CreateLocationRequest;
import com.tryitcafe.model.dto.CustomerLocationDtos.CustomerLocationDto;
import com.tryitcafe.model.dto.CustomerLocationDtos.UpdateLocationRequest;
import com.tryitcafe.model.dto.OrderDtos.OrderPreviewRequest;
import com.tryitcafe.model.dto.OrderDtos.OrderPreviewResponse;
import com.tryitcafe.model.dto.ReviewDtos.ReviewCreateRequest;
import com.tryitcafe.model.dto.ReviewDtos.ReviewDto;
import com.tryitcafe.model.entity.User;
import com.tryitcafe.service.AuthService;
import com.tryitcafe.service.CartService;
import com.tryitcafe.service.CustomerLocationService;
import com.tryitcafe.service.OrderService;
import com.tryitcafe.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/customer")
public class CustomerController {

    private final ReviewService reviewService;
    private final CartService cartService;
    private final CustomerLocationService customerLocationService;
    private final AuthService authService;
    private final OrderService orderService;
    private final com.tryitcafe.service.RateLimiterService rateLimiterService;

    public CustomerController(
            ReviewService reviewService,
            CartService cartService,
            CustomerLocationService customerLocationService,
            AuthService authService,
            OrderService orderService,
            com.tryitcafe.service.RateLimiterService rateLimiterService
    ) {
        this.reviewService = reviewService;
        this.cartService = cartService;
        this.customerLocationService = customerLocationService;
        this.authService = authService;
        this.orderService = orderService;
        this.rateLimiterService = rateLimiterService;
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileDto>> getProfile(@AuthenticationPrincipal User user) {
        UserProfileDto profile = authService.getProfile(user);
        return ResponseEntity.ok(ApiResponse.ok(profile));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileDto>> updateProfile(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        UserProfileDto updated = authService.updateProfile(user, request);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully", updated));
    }

    // -------------------------------------------------------------
    // Customer Saved Locations Endpoints
    // -------------------------------------------------------------

    @GetMapping("/locations")
    public ResponseEntity<ApiResponse<List<CustomerLocationDto>>> getLocations(@AuthenticationPrincipal User user) {
        List<CustomerLocationDto> locations = customerLocationService.getLocationsForUser(user);
        return ResponseEntity.ok(ApiResponse.ok(locations));
    }

    @PostMapping("/locations")
    public ResponseEntity<ApiResponse<CustomerLocationDto>> createLocation(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreateLocationRequest request
    ) {
        CustomerLocationDto location = customerLocationService.createLocation(user, request);
        return ResponseEntity.ok(ApiResponse.ok("Location saved successfully", location));
    }

    @PutMapping("/locations/{id}")
    public ResponseEntity<ApiResponse<CustomerLocationDto>> updateLocation(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateLocationRequest request
    ) {
        CustomerLocationDto location = customerLocationService.updateLocation(user, id, request);
        return ResponseEntity.ok(ApiResponse.ok("Location updated successfully", location));
    }

    @DeleteMapping("/locations/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteLocation(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id
    ) {
        customerLocationService.deleteLocation(user, id);
        return ResponseEntity.ok(ApiResponse.ok("Location deleted successfully", null));
    }

    @PutMapping("/locations/{id}/default")
    public ResponseEntity<ApiResponse<CustomerLocationDto>> setDefaultLocation(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id
    ) {
        CustomerLocationDto location = customerLocationService.setDefaultLocation(user, id);
        return ResponseEntity.ok(ApiResponse.ok("Default location updated", location));
    }

    // -------------------------------------------------------------
    // Authoritative Checkout Preview Endpoint
    // -------------------------------------------------------------

    @PostMapping("/orders/preview")
    public ResponseEntity<ApiResponse<OrderPreviewResponse>> previewOrder(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody OrderPreviewRequest request
    ) {
        OrderPreviewResponse preview = orderService.previewOrder(user, request);
        return ResponseEntity.ok(ApiResponse.ok("Order preview verified", preview));
    }

    // -------------------------------------------------------------
    // Customer Reviews & Cart
    // -------------------------------------------------------------

    @PostMapping("/reviews")
    public ResponseEntity<ApiResponse<ReviewDto>> submitReview(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ReviewCreateRequest request
    ) {
        if (user != null) {
            rateLimiterService.checkReviewRateLimit(user.getId().toString());
        }
        ReviewDto review = reviewService.submitReview(user, request);
        return ResponseEntity.ok(ApiResponse.ok("Review submitted for approval. Thank you for your feedback!", review));
    }

    @GetMapping("/cart")
    public ResponseEntity<ApiResponse<CartDtos.CartDto>> getCart(@AuthenticationPrincipal User user) {
        CartDtos.CartDto cart = cartService.getCartForUser(user.getId());
        return ResponseEntity.ok(ApiResponse.ok(cart));
    }

    @PostMapping("/cart/items")
    public ResponseEntity<ApiResponse<CartDtos.CartDto>> addToCart(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CartDtos.AddToCartRequest request
    ) {
        CartDtos.CartDto cart = cartService.addToCart(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Item added to cart", cart));
    }

    @PutMapping("/cart/items/{itemId}")
    public ResponseEntity<ApiResponse<CartDtos.CartDto>> updateCartItem(
            @AuthenticationPrincipal User user,
            @PathVariable UUID itemId,
            @Valid @RequestBody CartDtos.UpdateCartItemRequest request
    ) {
        CartDtos.CartDto cart = cartService.updateCartItem(user.getId(), itemId, request);
        return ResponseEntity.ok(ApiResponse.ok("Cart updated", cart));
    }

    @DeleteMapping("/cart/items/{itemId}")
    public ResponseEntity<ApiResponse<CartDtos.CartDto>> removeCartItem(
            @AuthenticationPrincipal User user,
            @PathVariable UUID itemId
    ) {
        CartDtos.CartDto cart = cartService.removeCartItem(user.getId(), itemId);
        return ResponseEntity.ok(ApiResponse.ok("Item removed from cart", cart));
    }

    @DeleteMapping("/cart")
    public ResponseEntity<ApiResponse<Void>> clearCart(@AuthenticationPrincipal User user) {
        cartService.clearCart(user.getId());
        return ResponseEntity.ok(ApiResponse.ok("Cart cleared", null));
    }
}
