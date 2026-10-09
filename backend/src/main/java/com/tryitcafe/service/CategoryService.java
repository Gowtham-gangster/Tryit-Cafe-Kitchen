package com.tryitcafe.service;

import com.tryitcafe.model.dto.MenuDtos.CategoryCreateUpdateRequest;
import com.tryitcafe.model.dto.MenuDtos.CategoryDto;
import com.tryitcafe.model.entity.Category;
import com.tryitcafe.repository.CategoryRepository;
import com.tryitcafe.repository.MenuItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
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

    private Map<UUID, Integer> getCategoryCountsMap() {
        List<Object[]> rows = menuItemRepository.countGroupedByCategoryId();
        Map<UUID, Integer> counts = new HashMap<>();
        for (Object[] row : rows) {
            if (row != null && row.length >= 2 && row[0] instanceof UUID) {
                UUID catId = (UUID) row[0];
                long count = row[1] instanceof Number ? ((Number) row[1]).longValue() : 0L;
                counts.put(catId, (int) count);
            }
        }
        return counts;
    }

    public List<CategoryDto> getPublicCategories() {
        List<Category> categories = categoryRepository.findAllByActiveTrueOrderByDisplayOrderAsc();
        Map<UUID, Integer> counts = getCategoryCountsMap();
        return categories.stream()
                .map(c -> toDto(c, counts.getOrDefault(c.getId(), 0)))
                .collect(Collectors.toList());
    }

    public List<CategoryDto> getAllCategoriesForOwner() {
        List<Category> categories = categoryRepository.findAllByOrderByDisplayOrderAsc();
        Map<UUID, Integer> counts = getCategoryCountsMap();
        return categories.stream()
                .map(c -> toDto(c, counts.getOrDefault(c.getId(), 0)))
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
        return toDto(category, count);
    }

    public CategoryDto toDto(Category category, int count) {
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
