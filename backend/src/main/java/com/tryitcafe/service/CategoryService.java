package com.tryitcafe.service;

import com.tryitcafe.model.dto.MenuDtos.CategoryCreateUpdateRequest;
import com.tryitcafe.model.dto.MenuDtos.CategoryDto;
import com.tryitcafe.model.entity.Category;
import com.tryitcafe.repository.CategoryRepository;
import com.tryitcafe.repository.MenuItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final MenuItemRepository menuItemRepository;

    public CategoryService(CategoryRepository categoryRepository, MenuItemRepository menuItemRepository) {
        this.categoryRepository = categoryRepository;
        this.menuItemRepository = menuItemRepository;
    }

    public static String toSlug(String input) {
        if (input == null) return "";
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        String slug = normalized.replaceAll("[^a-zA-Z0-9]+", "-")
                .replaceAll("^-+|-+$", "")
                .toLowerCase(Locale.ENGLISH);
        return slug.isEmpty() ? "category" : slug;
    }

    public List<CategoryDto> getPublicCategories() {
        return categoryRepository.findAllByActiveTrueOrderByDisplayOrderAsc().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<CategoryDto> getAllCategoriesForOwner() {
        return categoryRepository.findAllByOrderByDisplayOrderAsc().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public CategoryDto createCategory(CategoryCreateUpdateRequest request) {
        String baseSlug = toSlug(request.getName());
        String slug = baseSlug;
        int counter = 1;
        while (categoryRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + counter++;
        }

        Category category = Category.builder()
                .name(request.getName().trim())
                .slug(slug)
                .description(request.getDescription())
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        return toDto(categoryRepository.save(category));
    }

    @Transactional
    public CategoryDto updateCategory(UUID id, CategoryCreateUpdateRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found with ID: " + id));

        category.setName(request.getName().trim());
        category.setDescription(request.getDescription());
        if (request.getDisplayOrder() != null) {
            category.setDisplayOrder(request.getDisplayOrder());
        }
        if (request.getActive() != null) {
            category.setActive(request.getActive());
        }

        return toDto(categoryRepository.save(category));
    }

    @Transactional
    public void deleteCategory(UUID id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Category not found with ID: " + id));
        if (menuItemRepository.existsByCategoryIdAndDeletedFalse(id)) {
            throw new IllegalStateException("Cannot delete category containing dishes. Please reassign or delete the dishes first.");
        }
        categoryRepository.delete(category);
    }

    public CategoryDto toDto(Category category) {
        int count = (int) menuItemRepository.countByCategoryIdAndDeletedFalse(category.getId());
        return CategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .displayOrder(category.getDisplayOrder())
                .active(category.isActive())
                .itemCount(count)
                .build();
    }
}
