package com.tryitcafe.repository;

import com.tryitcafe.model.entity.MenuItem;
import com.tryitcafe.model.enums.FoodType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, UUID> {

    @EntityGraph(attributePaths = {"category"})
    List<MenuItem> findAllByDeletedFalseOrderByDisplayOrderAsc();

    @EntityGraph(attributePaths = {"category"})
    @Query("SELECT m FROM MenuItem m WHERE m.deleted = false AND m.available = true ORDER BY m.displayOrder ASC")
    List<MenuItem> findActiveAndAvailable();

    @EntityGraph(attributePaths = {"category"})
    @Query("SELECT m FROM MenuItem m WHERE m.deleted = false AND (:categoryId IS NULL OR m.category.id = :categoryId) AND (:foodType IS NULL OR m.foodType = :foodType) AND (:bestseller IS NULL OR m.bestseller = :bestseller) AND (CAST(:search AS string) IS NULL OR LOWER(m.name) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%')) OR LOWER(m.description) LIKE LOWER(CONCAT('%', CAST(:search AS string), '%'))) ORDER BY m.displayOrder ASC, m.name ASC")
    List<MenuItem> searchMenuItems(
            @Param("categoryId") UUID categoryId,
            @Param("foodType") FoodType foodType,
            @Param("bestseller") Boolean bestseller,
            @Param("search") String search
    );

    @EntityGraph(attributePaths = {"category"})
    Optional<MenuItem> findBySlugAndDeletedFalse(String slug);

    boolean existsBySlug(String slug);

    boolean existsByCategoryIdAndDeletedFalse(UUID categoryId);

    long countByCategoryIdAndDeletedFalse(UUID categoryId);

    long countByDeletedFalse();

    long countByDeletedFalseAndAvailableTrue();

    @EntityGraph(attributePaths = {"category"})
    List<MenuItem> findAllByDeletedFalseAndIsPopularTrueOrderByPopularDisplayOrderAscDisplayOrderAsc();

    long countByDeletedFalseAndIsPopularTrue();
}
