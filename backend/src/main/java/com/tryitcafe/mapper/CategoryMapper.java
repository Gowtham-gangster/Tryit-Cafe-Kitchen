package com.tryitcafe.mapper;

import com.tryitcafe.model.dto.MenuDtos;
import com.tryitcafe.model.entity.Category;
import org.springframework.stereotype.Component;

@Component
public class CategoryMapper {

    public MenuDtos.CategoryDto toDto(Category category, int itemCount) {
        if (category == null) return null;
        return MenuDtos.CategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .displayOrder(category.getDisplayOrder())
                .active(category.isActive())
                .itemCount(itemCount)
                .build();
    }
}
