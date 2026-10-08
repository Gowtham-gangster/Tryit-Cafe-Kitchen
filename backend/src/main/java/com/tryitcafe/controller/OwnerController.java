package com.tryitcafe.controller;

import com.tryitcafe.model.dto.ApiResponse;
import com.tryitcafe.model.dto.DashboardSummaryDto;
import com.tryitcafe.model.dto.GalleryDtos.GalleryCreateRequest;
import com.tryitcafe.model.dto.GalleryDtos.GalleryItemDto;
import com.tryitcafe.model.dto.MenuDtos.CategoryCreateUpdateRequest;
import com.tryitcafe.model.dto.MenuDtos.CategoryDto;
import com.tryitcafe.model.dto.MenuDtos.MenuItemCreateUpdateRequest;
import com.tryitcafe.model.dto.MenuDtos.MenuItemDto;
import com.tryitcafe.model.dto.OfferDtos.OfferCreateUpdateRequest;
import com.tryitcafe.model.dto.OfferDtos.OfferDto;
import com.tryitcafe.model.dto.ReviewDtos.ReviewDto;
import com.tryitcafe.model.dto.ReviewDtos.ReviewStatusUpdateRequest;
import com.tryitcafe.model.dto.SettingsDtos.*;
import com.tryitcafe.service.*;
import jakarta.validation.Valid;
import com.tryitcafe.exception.BadRequestException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/owner")
@PreAuthorize("hasRole('OWNER')")
public class OwnerController {

    private static final Logger log = LoggerFactory.getLogger(OwnerController.class);

    private final CategoryService categoryService;
    private final MenuItemService menuItemService;
    private final OfferService offerService;
    private final GalleryService galleryService;
    private final ReviewService reviewService;
    private final BusinessSettingsService businessSettingsService;
    private final CloudinaryService cloudinaryService;

    public OwnerController(
            CategoryService categoryService,
            MenuItemService menuItemService,
            OfferService offerService,
            GalleryService galleryService,
            ReviewService reviewService,
            BusinessSettingsService businessSettingsService,
            CloudinaryService cloudinaryService
    ) {
        this.categoryService = categoryService;
        this.menuItemService = menuItemService;
        this.offerService = offerService;
        this.galleryService = galleryService;
        this.reviewService = reviewService;
        this.businessSettingsService = businessSettingsService;
        this.cloudinaryService = cloudinaryService;
    }

    // --- Dashboard ---
    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<DashboardSummaryDto>> getDashboardSummary() {
        return ResponseEntity.ok(ApiResponse.ok(businessSettingsService.getDashboardSummary()));
    }

    // --- Categories ---
    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getAllCategories() {
        return ResponseEntity.ok(ApiResponse.ok(categoryService.getAllCategoriesForOwner()));
    }

    @PostMapping("/categories")
    public ResponseEntity<ApiResponse<CategoryDto>> createCategory(@Valid @RequestBody CategoryCreateUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Category created successfully", categoryService.createCategory(request)));
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<CategoryDto>> updateCategory(
            @PathVariable UUID id,
            @Valid @RequestBody CategoryCreateUpdateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Category updated successfully", categoryService.updateCategory(id, request)));
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable UUID id) {
        try {
            categoryService.deleteCategory(id);
            return ResponseEntity.ok(ApiResponse.ok("Category deleted successfully", null));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    // --- Menu Items ---
    @GetMapping("/menu")
    public ResponseEntity<ApiResponse<List<MenuItemDto>>> getAllMenuItems() {
        return ResponseEntity.ok(ApiResponse.ok(menuItemService.getAllForOwner()));
    }

    @PostMapping("/menu")
    public ResponseEntity<ApiResponse<MenuItemDto>> createMenuItem(@Valid @RequestBody MenuItemCreateUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Dish added to menu successfully", menuItemService.createMenuItem(request)));
    }

    @PutMapping("/menu/{id}")
    public ResponseEntity<ApiResponse<MenuItemDto>> updateMenuItem(
            @PathVariable UUID id,
            @Valid @RequestBody MenuItemCreateUpdateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Dish updated successfully", menuItemService.updateMenuItem(id, request)));
    }

    @PatchMapping("/menu/{id}/availability")
    public ResponseEntity<ApiResponse<MenuItemDto>> toggleAvailability(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok("Availability updated", menuItemService.toggleAvailability(id)));
    }

    @PatchMapping("/menu/{id}/popular")
    public ResponseEntity<ApiResponse<MenuItemDto>> togglePopular(
            @PathVariable UUID id,
            @RequestParam(required = false) Boolean popular,
            @RequestParam(required = false) Integer displayOrder
    ) {
        try {
            return ResponseEntity.ok(ApiResponse.ok("Popular status updated", menuItemService.updatePopularStatus(id, popular, displayOrder)));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @DeleteMapping("/menu/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteMenuItem(@PathVariable UUID id) {
        menuItemService.deleteMenuItem(id);
        return ResponseEntity.ok(ApiResponse.ok("Dish removed from menu", null));
    }

    // --- Offers ---
    @GetMapping("/offers")
    public ResponseEntity<ApiResponse<List<OfferDto>>> getAllOffers() {
        return ResponseEntity.ok(ApiResponse.ok(offerService.getAllOffersForOwner()));
    }

    @PostMapping("/offers")
    public ResponseEntity<ApiResponse<OfferDto>> createOffer(@Valid @RequestBody OfferCreateUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Offer created successfully", offerService.createOffer(request)));
    }

    @PutMapping("/offers/{id}")
    public ResponseEntity<ApiResponse<OfferDto>> updateOffer(
            @PathVariable UUID id,
            @Valid @RequestBody OfferCreateUpdateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Offer updated successfully", offerService.updateOffer(id, request)));
    }

    @PatchMapping("/offers/{id}/status")
    public ResponseEntity<ApiResponse<OfferDto>> toggleOfferStatus(@PathVariable UUID id) {
        return ResponseEntity.ok(ApiResponse.ok("Offer status updated", offerService.toggleOfferStatus(id)));
    }

    @DeleteMapping("/offers/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteOffer(@PathVariable UUID id) {
        offerService.deleteOffer(id);
        return ResponseEntity.ok(ApiResponse.ok("Offer deleted successfully", null));
    }

    // --- Gallery ---
    @GetMapping("/gallery")
    public ResponseEntity<ApiResponse<List<GalleryItemDto>>> getAllGalleryItems() {
        return ResponseEntity.ok(ApiResponse.ok(galleryService.getAllForOwner()));
    }

    @PostMapping("/gallery")
    public ResponseEntity<ApiResponse<GalleryItemDto>> addGalleryItem(@Valid @RequestBody GalleryCreateRequest request) {
        return ResponseEntity.ok(ApiResponse.ok("Gallery item added", galleryService.addGalleryItem(request)));
    }

    @PutMapping("/gallery/{id}")
    public ResponseEntity<ApiResponse<GalleryItemDto>> updateGalleryItem(
            @PathVariable UUID id,
            @RequestBody GalleryCreateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Gallery item updated", galleryService.updateGalleryItem(id, request)));
    }

    @DeleteMapping("/gallery/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteGalleryItem(@PathVariable UUID id) {
        galleryService.deleteGalleryItem(id);
        return ResponseEntity.ok(ApiResponse.ok("Gallery item removed", null));
    }

    // --- Media Upload ---
    @PostMapping("/upload-media")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadMedia(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "general") String folder
    ) {
        try {
            Map uploadResult = cloudinaryService.uploadFile(file, folder);
            Map<String, String> response = new HashMap<>();
            response.put("url", (String) uploadResult.get("secure_url"));
            response.put("publicId", (String) uploadResult.get("public_id"));
            return ResponseEntity.ok(ApiResponse.ok("File uploaded successfully", response));
        } catch (BadRequestException bre) {
            return ResponseEntity.badRequest().body(ApiResponse.error(bre.getMessage()));
        } catch (Exception e) {
            log.error("Failed to upload media: {}", e.getMessage());
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage() != null ? e.getMessage() : "Failed to upload media"));
        }
    }

    // --- Reviews Moderation ---
    @GetMapping("/reviews")
    public ResponseEntity<ApiResponse<List<ReviewDto>>> getAllReviews() {
        return ResponseEntity.ok(ApiResponse.ok(reviewService.getAllReviewsForOwner()));
    }

    @PatchMapping("/reviews/{id}/status")
    public ResponseEntity<ApiResponse<ReviewDto>> updateReviewStatus(
            @PathVariable UUID id,
            @Valid @RequestBody ReviewStatusUpdateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Review status updated", reviewService.updateReviewStatus(id, request)));
    }

    @DeleteMapping("/reviews/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(@PathVariable UUID id) {
        reviewService.deleteReview(id);
        return ResponseEntity.ok(ApiResponse.ok("Review deleted", null));
    }

    // --- Settings & Hours ---
    @GetMapping("/settings")
    public ResponseEntity<ApiResponse<BusinessSettingsDto>> getSettings() {
        return ResponseEntity.ok(ApiResponse.ok(businessSettingsService.getSettings()));
    }

    @PutMapping("/settings")
    public ResponseEntity<ApiResponse<BusinessSettingsDto>> updateSettings(
            @RequestBody BusinessSettingsUpdateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Settings saved successfully", businessSettingsService.updateSettings(request)));
    }

    @PutMapping("/business-hours")
    public ResponseEntity<ApiResponse<List<BusinessHoursDto>>> updateBusinessHours(
            @RequestBody BusinessHoursUpdateRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok("Operating hours updated successfully", businessSettingsService.updateBusinessHours(request)));
    }

    @GetMapping("/business/online-ordering")
    public ResponseEntity<ApiResponse<OnlineOrderingStatusDto>> getOnlineOrderingStatus() {
        return ResponseEntity.ok(ApiResponse.ok(businessSettingsService.getOnlineOrderingStatus()));
    }

    @PutMapping("/business/online-ordering")
    public ResponseEntity<ApiResponse<OnlineOrderingStatusDto>> updateOnlineOrderingStatus(
            @RequestBody OnlineOrderingUpdateRequest request
    ) {
        OnlineOrderingStatusDto updated = businessSettingsService.updateOnlineOrderingStatus(request);
        String msg = updated.isOnlineOrderingEnabled() ? "Online ordering is now open." : "Online ordering is now closed.";
        return ResponseEntity.ok(ApiResponse.ok(msg, updated));
    }
}
