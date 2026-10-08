package com.tryitcafe.mapper;

import com.tryitcafe.model.dto.MenuDtos;
import com.tryitcafe.model.entity.Category;
import com.tryitcafe.model.entity.MenuItem;
import org.springframework.stereotype.Component;

@Component
public class MenuItemMapper {

    private final com.tryitcafe.service.MenuPricingService pricingService;

    public MenuItemMapper(com.tryitcafe.service.MenuPricingService pricingService) {
        this.pricingService = pricingService;
    }

    public MenuDtos.MenuItemDto toDto(MenuItem item) {
        if (item == null) return null;
        return MenuDtos.MenuItemDto.builder()
                .id(item.getId())
                .categoryId(item.getCategory() != null ? item.getCategory().getId() : null)
                .categoryName(item.getCategory() != null ? item.getCategory().getName() : null)
                .name(item.getName())
                .slug(item.getSlug())
                .description(item.getDescription())
                .price(item.getPrice())
                .foodType(item.getFoodType())
                .imageUrl(item.getImageUrl())
                .imagePublicId(item.getImagePublicId())
                .available(item.isAvailable())
                .bestseller(item.isBestseller())
                .isNew(item.isNew())
                .isPopular(item.isPopular())
                .popularDisplayOrder(item.getPopularDisplayOrder())
                .discountEnabled(item.isDiscountEnabled())
                .discountType(item.getDiscountType())
                .discountValue(item.getDiscountValue())
                .discountAmount(pricingService.calculateDiscountAmount(item))
                .effectivePrice(pricingService.calculateEffectivePrice(item))
                .displayOrder(item.getDisplayOrder())
                .build();
    }

    public MenuItem toEntity(MenuDtos.MenuItemCreateUpdateRequest request, Category category) {
        if (request == null) return null;
        return MenuItem.builder()
                .category(category)
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .foodType(request.getFoodType())
                .imageUrl(request.getImageUrl())
                .imagePublicId(request.getImagePublicId())
                .available(request.getAvailable() != null ? request.getAvailable() : true)
                .bestseller(request.getBestseller() != null ? request.getBestseller() : false)
                .isNew(request.getIsNew() != null ? request.getIsNew() : false)
                .isPopular(request.getIsPopular() != null ? request.getIsPopular() : false)
                .popularDisplayOrder(request.getPopularDisplayOrder() != null ? request.getPopularDisplayOrder() : 0)
                .discountEnabled(Boolean.TRUE.equals(request.getDiscountEnabled()))
                .discountType(request.getDiscountType())
                .discountValue(request.getDiscountValue())
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .build();
    }
}
