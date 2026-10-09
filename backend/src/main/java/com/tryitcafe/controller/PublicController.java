package com.tryitcafe.controller;

import com.tryitcafe.model.dto.ApiResponse;
import com.tryitcafe.model.dto.GalleryDtos.GalleryItemDto;
import com.tryitcafe.model.dto.MenuDtos.CategoryDto;
import com.tryitcafe.model.dto.MenuDtos.MenuItemDto;
import com.tryitcafe.model.dto.OfferDtos.OfferDto;
import com.tryitcafe.model.dto.ReviewDtos.ReviewDto;
import com.tryitcafe.model.dto.SettingsDtos.BusinessSettingsDto;
import com.tryitcafe.model.enums.FoodType;
import com.tryitcafe.service.*;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/public")
public class PublicController {

    private final CategoryService categoryService;
    private final MenuItemService menuItemService;
    private final OfferService offerService;
    private final GalleryService galleryService;
    private final ReviewService reviewService;
    private final BusinessSettingsService businessSettingsService;

    public PublicController(
            CategoryService categoryService,
            MenuItemService menuItemService,
            OfferService offerService,
            GalleryService galleryService,
            ReviewService reviewService,
            BusinessSettingsService businessSettingsService
    ) {
        this.categoryService = categoryService;
        this.menuItemService = menuItemService;
        this.offerService = offerService;
        this.galleryService = galleryService;
        this.reviewService = reviewService;
        this.businessSettingsService = businessSettingsService;
    }

    @GetMapping("/settings")
    public ResponseEntity<ApiResponse<BusinessSettingsDto>> getSettings() {
        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=30, stale-while-revalidate=60")
                .body(ApiResponse.ok(businessSettingsService.getSettings()));
    }

    @GetMapping("/business/status")
    public ResponseEntity<ApiResponse<com.tryitcafe.model.dto.SettingsDtos.OnlineOrderingStatusDto>> getOnlineOrderingStatus() {
        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=5, stale-while-revalidate=10")
                .body(ApiResponse.ok(businessSettingsService.getOnlineOrderingStatus()));
    }

    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<CategoryDto>>> getCategories() {
        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=15, stale-while-revalidate=60")
                .body(ApiResponse.ok(categoryService.getPublicCategories()));
    }

    @GetMapping("/menu")
    public ResponseEntity<ApiResponse<List<MenuItemDto>>> getMenu(
            @RequestParam(required = false) UUID categoryId,
            @RequestParam(required = false) FoodType foodType,
            @RequestParam(required = false) Boolean bestseller,
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=15, stale-while-revalidate=60")
                .body(ApiResponse.ok(menuItemService.searchMenuItems(categoryId, foodType, bestseller, search)));
    }

    @GetMapping("/menu/popular")
    public ResponseEntity<ApiResponse<List<MenuItemDto>>> getPopularMenu() {
        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=15, stale-while-revalidate=60")
                .body(ApiResponse.ok(menuItemService.getPopularMenuItems()));
    }

    @GetMapping("/menu/{slug}")
    public ResponseEntity<ApiResponse<MenuItemDto>> getMenuItemBySlug(@PathVariable String slug) {
        try {
            return ResponseEntity.ok()
                    .header(HttpHeaders.CACHE_CONTROL, "public, max-age=15, stale-while-revalidate=60")
                    .body(ApiResponse.ok(menuItemService.getBySlug(slug)));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/offers")
    public ResponseEntity<ApiResponse<List<OfferDto>>> getOffers() {
        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=15, stale-while-revalidate=60")
                .body(ApiResponse.ok(offerService.getActiveOffers()));
    }

    @GetMapping("/gallery")
    public ResponseEntity<ApiResponse<List<GalleryItemDto>>> getGallery() {
        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=30, stale-while-revalidate=60")
                .body(ApiResponse.ok(galleryService.getActiveGallery()));
    }

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(PublicController.class);
    private static final java.util.Set<String> ALLOWED_MEDIA_FOLDERS = java.util.Set.of(
            "menu", "categories", "gallery", "general", "dishes", "offers"
    );

    @GetMapping("/reviews")
    public ResponseEntity<ApiResponse<List<ReviewDto>>> getReviews() {
        return ResponseEntity.ok()
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=30, stale-while-revalidate=60")
                .body(ApiResponse.ok(reviewService.getApprovedReviews()));
    }

    @GetMapping("/media/{folder}/{filename:.+}")
    public ResponseEntity<Resource> getMediaFile(@PathVariable String folder, @PathVariable String filename) {
        if (folder == null || filename == null) {
            return ResponseEntity.badRequest().build();
        }

        // Strict input sanitization for folder and filename
        String cleanFolder = folder.trim().toLowerCase();
        String cleanFilename = filename.trim();

        if (cleanFolder.contains("..") || cleanFolder.contains("/") || cleanFolder.contains("\\")
                || cleanFolder.contains("%") || cleanFolder.contains("\0") || cleanFolder.contains(":")) {
            log.warn("Security Alert: Path traversal attempt detected in media folder parameter: {}", cleanFolder);
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).build();
        }

        if (cleanFilename.contains("..") || cleanFilename.contains("/") || cleanFilename.contains("\\")
                || cleanFilename.contains("%") || cleanFilename.contains("\0") || cleanFilename.contains(":")) {
            log.warn("Security Alert: Path traversal attempt detected in media filename parameter: {}", cleanFilename);
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).build();
        }

        if (!ALLOWED_MEDIA_FOLDERS.contains(cleanFolder)) {
            log.warn("Security Alert: Access attempt to unauthorized media folder: {}", cleanFolder);
            return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).build();
        }

        try {
            List<Path> candidateRoots = List.of(
                    Paths.get(System.getProperty("user.dir"), "uploads").toAbsolutePath().normalize(),
                    Paths.get(System.getProperty("user.dir"), "backend", "uploads").toAbsolutePath().normalize()
            );

            Path validTarget = null;
            for (Path root : candidateRoots) {
                Path resolved = root.resolve(cleanFolder).resolve(cleanFilename).normalize();
                if (!resolved.startsWith(root)) {
                    log.warn("Security Alert: Path traversal normalized path escaped root: {}", resolved);
                    return ResponseEntity.status(org.springframework.http.HttpStatus.FORBIDDEN).build();
                }
                if (Files.exists(resolved) && Files.isRegularFile(resolved)) {
                    validTarget = resolved;
                    break;
                }
            }

            if (validTarget == null) {
                return ResponseEntity.notFound().build();
            }

            Resource resource = new UrlResource(validTarget.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = Files.probeContentType(validTarget);
            if (contentType == null) {
                contentType = "application/octet-stream";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
                    .header("X-Content-Type-Options", "nosniff")
                    .body(resource);
        } catch (Exception e) {
            log.error("Error retrieving media resource: {}", e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }
}
