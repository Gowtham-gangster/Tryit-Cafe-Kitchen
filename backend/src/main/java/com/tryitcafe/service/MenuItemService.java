package com.tryitcafe.service;

import com.tryitcafe.model.dto.MenuDtos.MenuItemCreateUpdateRequest;
import com.tryitcafe.model.dto.MenuDtos.MenuItemDto;
import com.tryitcafe.model.entity.Category;
import com.tryitcafe.model.entity.MenuItem;
import com.tryitcafe.model.enums.FoodType;
import com.tryitcafe.repository.CategoryRepository;
import com.tryitcafe.repository.MenuItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MenuItemService {

    private final MenuItemRepository menuItemRepository;
    private final CategoryRepository categoryRepository;
    private final CloudinaryService cloudinaryService;
    private final MenuPricingService menuPricingService;
    private final com.tryitcafe.mapper.MenuItemMapper menuItemMapper;

    public MenuItemService(MenuItemRepository menuItemRepository,
                           CategoryRepository categoryRepository,
                           CloudinaryService cloudinaryService,
                           MenuPricingService menuPricingService,
                           com.tryitcafe.mapper.MenuItemMapper menuItemMapper) {
        this.menuItemRepository = menuItemRepository;
        this.categoryRepository = categoryRepository;
        this.cloudinaryService = cloudinaryService;
        this.menuPricingService = menuPricingService;
        this.menuItemMapper = menuItemMapper;
    }

    @Transactional(readOnly = true)
    public List<MenuItemDto> searchMenuItems(UUID categoryId, FoodType foodType, Boolean bestseller, String search) {
        String cleanSearch = (search != null && !search.trim().isEmpty()) ? search.trim() : null;
        if (categoryId == null && foodType == null && bestseller == null && cleanSearch == null) {
            return menuItemRepository.findAllByDeletedFalseOrderByDisplayOrderAsc().stream()
                    .map(this::toDto)
                    .collect(Collectors.toList());
        }
        return menuItemRepository.searchMenuItems(categoryId, foodType, bestseller, cleanSearch).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MenuItemDto> getAllForOwner() {
        return menuItemRepository.findAllByDeletedFalseOrderByDisplayOrderAsc().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MenuItemDto getBySlug(String slug) {
        MenuItem item = menuItemRepository.findBySlugAndDeletedFalse(slug)
                .orElseThrow(() -> new IllegalArgumentException("Menu item not found: " + slug));
        return toDto(item);
    }

    @Transactional
    public MenuItemDto createMenuItem(MenuItemCreateUpdateRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found with ID: " + request.getCategoryId()));

        menuPricingService.validateDiscount(
                request.getPrice(),
                request.getDiscountEnabled(),
                request.getDiscountType(),
                request.getDiscountValue()
        );

        String baseSlug = CategoryService.toSlug(request.getName());
        String slug = baseSlug;
        int counter = 1;
        while (menuItemRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter++;
        }

        boolean isPopular = Boolean.TRUE.equals(request.getIsPopular());
        if (isPopular && menuItemRepository.countByDeletedFalseAndIsPopularTrue() >= 6) {
            throw new IllegalStateException("You can feature up to 6 dishes on the homepage.");
        }

        MenuItem item = MenuItem.builder()
                .category(category)
                .name(request.getName().trim())
                .slug(slug)
                .description(request.getDescription())
                .price(request.getPrice())
                .foodType(request.getFoodType())
                .imageUrl(request.getImageUrl())
                .imagePublicId(request.getImagePublicId())
                .available(request.getAvailable() != null ? request.getAvailable() : true)
                .bestseller(request.getBestseller() != null ? request.getBestseller() : false)
                .isNew(request.getIsNew() != null ? request.getIsNew() : false)
                .isPopular(isPopular)
                .popularDisplayOrder(request.getPopularDisplayOrder() != null ? request.getPopularDisplayOrder() : 0)
                .discountEnabled(Boolean.TRUE.equals(request.getDiscountEnabled()))
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .deleted(false)
                .build();

        return toDto(menuItemRepository.save(item));
    }

    @Transactional
    public MenuItemDto updateMenuItem(UUID id, MenuItemCreateUpdateRequest request) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Menu item not found with ID: " + id));

        BigDecimal basePrice = request.getPrice() != null ? request.getPrice() : item.getPrice();
        Boolean discountEnabled = request.getDiscountEnabled() != null ? request.getDiscountEnabled() : item.isDiscountEnabled();
        com.tryitcafe.model.enums.DiscountType discountType = request.getDiscountType() != null ? request.getDiscountType() : item.getDiscountType();
        BigDecimal discountValue = request.getDiscountValue() != null ? request.getDiscountValue() : item.getDiscountValue();

        menuPricingService.validateDiscount(basePrice, discountEnabled, discountType, discountValue);

        if (!item.getCategory().getId().equals(request.getCategoryId())) {
            Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found with ID: " + request.getCategoryId()));
            item.setCategory(category);
        }

        if (request.getImagePublicId() != null && item.getImagePublicId() != null
                && !request.getImagePublicId().equals(item.getImagePublicId())) {
            cloudinaryService.deleteFile(item.getImagePublicId());
        }

        item.setName(request.getName().trim());
        item.setDescription(request.getDescription());
        item.setPrice(request.getPrice());
        item.setFoodType(request.getFoodType());
        if (request.getImageUrl() != null) {
            item.setImageUrl(request.getImageUrl());
        }
        if (request.getImagePublicId() != null) {
            item.setImagePublicId(request.getImagePublicId());
        }
        if (request.getAvailable() != null) {
            item.setAvailable(request.getAvailable());
        }
        if (request.getBestseller() != null) {
            item.setBestseller(request.getBestseller());
        }
        if (request.getIsNew() != null) {
            item.setNew(request.getIsNew());
        }
        if (request.getIsPopular() != null) {
            boolean wantPopular = request.getIsPopular();
            if (wantPopular && !item.isPopular() && menuItemRepository.countByDeletedFalseAndIsPopularTrue() >= 6) {
                throw new IllegalStateException("You can feature up to 6 dishes on the homepage.");
            }
            item.setPopular(wantPopular);
        }
        if (request.getPopularDisplayOrder() != null) {
            item.setPopularDisplayOrder(request.getPopularDisplayOrder());
        }
        if (request.getDiscountEnabled() != null) {
            item.setDiscountEnabled(request.getDiscountEnabled());
        }
        if (request.getDiscountType() != null) {
            item.setDiscountType(request.getDiscountType());
        }
        if (request.getDiscountValue() != null) {
            item.setDiscountValue(request.getDiscountValue());
        }
        if (request.getDisplayOrder() != null) {
            item.setDisplayOrder(request.getDisplayOrder());
        }

        return toDto(menuItemRepository.save(item));
    }

    @Transactional
    public MenuItemDto updatePopularStatus(UUID id, Boolean popular, Integer displayOrder) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Menu item not found with ID: " + id));

        boolean newPopular = (popular != null) ? popular : !item.isPopular();

        if (newPopular && !item.isPopular()) {
            if (menuItemRepository.countByDeletedFalseAndIsPopularTrue() >= 6) {
                throw new IllegalStateException("You can feature up to 6 dishes on the homepage.");
            }
        }

        item.setPopular(newPopular);
        if (displayOrder != null) {
            item.setPopularDisplayOrder(displayOrder);
        } else if (newPopular && (item.getPopularDisplayOrder() == null || item.getPopularDisplayOrder() == 0)) {
            item.setPopularDisplayOrder((int) menuItemRepository.countByDeletedFalseAndIsPopularTrue() + 1);
        }

        return toDto(menuItemRepository.save(item));
    }

    @Transactional(readOnly = true)
    public List<MenuItemDto> getPopularMenuItems() {
        return menuItemRepository.findAllByDeletedFalseAndIsPopularTrueOrderByPopularDisplayOrderAscDisplayOrderAsc().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public MenuItemDto toggleAvailability(UUID id) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Menu item not found with ID: " + id));
        item.setAvailable(!item.isAvailable());
        return toDto(menuItemRepository.save(item));
    }

    @Transactional
    public void deleteMenuItem(UUID id) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Menu item not found with ID: " + id));
        item.setDeleted(true);
        menuItemRepository.save(item);
    }

    public MenuItemDto toDto(MenuItem item) {
        return menuItemMapper.toDto(item);
    }
}
