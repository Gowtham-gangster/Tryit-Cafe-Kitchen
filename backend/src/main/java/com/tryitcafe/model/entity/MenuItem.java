package com.tryitcafe.model.entity;

import com.tryitcafe.model.enums.FoodType;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "menu_items", indexes = {
    @Index(name = "idx_menu_item_slug", columnList = "slug", unique = true),
    @Index(name = "idx_menu_item_category", columnList = "category_id"),
    @Index(name = "idx_menu_item_available", columnList = "available"),
    @Index(name = "idx_menu_item_deleted", columnList = "deleted")
})
public class MenuItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, unique = true, length = 150)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private FoodType foodType = FoodType.VEG;

    @Column(length = 500)
    private String imageUrl;

    @Column(length = 200)
    private String imagePublicId;

    @Column(nullable = false)
    private boolean available = true;

    @Column(nullable = false)
    private boolean bestseller = false;

    @Column(name = "is_new", nullable = false)
    private boolean isNew = false;

    @Column(name = "is_popular", nullable = false)
    private boolean isPopular = false;

    @Column(name = "popular_display_order", nullable = false)
    private Integer popularDisplayOrder = 0;

    @Column(name = "discount_enabled", nullable = false)
    private boolean discountEnabled = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "discount_type", length = 20)
    private com.tryitcafe.model.enums.DiscountType discountType;

    @Column(name = "discount_value", precision = 10, scale = 2)
    private BigDecimal discountValue;

    @Column(nullable = false)
    private Integer displayOrder = 0;

    @Column(nullable = false)
    private boolean deleted = false;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public MenuItem() {}

    public MenuItem(UUID id, Category category, String name, String slug, String description, BigDecimal price,
                    FoodType foodType, String imageUrl, String imagePublicId,
                    boolean available, boolean bestseller, boolean isNew, boolean isPopular, Integer popularDisplayOrder,
                    boolean discountEnabled, com.tryitcafe.model.enums.DiscountType discountType, BigDecimal discountValue,
                    Integer displayOrder, boolean deleted) {
        this.id = id;
        this.category = category;
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.price = price;
        this.foodType = foodType != null ? foodType : FoodType.VEG;
        this.imageUrl = imageUrl;
        this.imagePublicId = imagePublicId;
        this.available = available;
        this.bestseller = bestseller;
        this.isNew = isNew;
        this.isPopular = isPopular;
        this.popularDisplayOrder = popularDisplayOrder != null ? popularDisplayOrder : 0;
        this.discountEnabled = discountEnabled;
        this.discountType = discountType;
        this.discountValue = discountValue;
        this.displayOrder = displayOrder != null ? displayOrder : 0;
        this.deleted = deleted;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private UUID id;
        private Category category;
        private String name;
        private String slug;
        private String description;
        private BigDecimal price;
        private FoodType foodType = FoodType.VEG;
        private String imageUrl;
        private String imagePublicId;
        private boolean available = true;
        private boolean bestseller = false;
        private boolean isNew = false;
        private boolean isPopular = false;
        private Integer popularDisplayOrder = 0;
        private boolean discountEnabled = false;
        private com.tryitcafe.model.enums.DiscountType discountType;
        private BigDecimal discountValue;
        private Integer displayOrder = 0;
        private boolean deleted = false;

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder category(Category category) { this.category = category; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder slug(String slug) { this.slug = slug; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder price(BigDecimal price) { this.price = price; return this; }
        public Builder foodType(FoodType foodType) { this.foodType = foodType; return this; }
        public Builder imageUrl(String imageUrl) { this.imageUrl = imageUrl; return this; }
        public Builder imagePublicId(String imagePublicId) { this.imagePublicId = imagePublicId; return this; }
        public Builder available(boolean available) { this.available = available; return this; }
        public Builder bestseller(boolean bestseller) { this.bestseller = bestseller; return this; }
        public Builder isNew(boolean isNew) { this.isNew = isNew; return this; }
        public Builder isPopular(boolean isPopular) { this.isPopular = isPopular; return this; }
        public Builder popularDisplayOrder(Integer popularDisplayOrder) { this.popularDisplayOrder = popularDisplayOrder; return this; }
        public Builder discountEnabled(boolean discountEnabled) { this.discountEnabled = discountEnabled; return this; }
        public Builder discountType(com.tryitcafe.model.enums.DiscountType discountType) { this.discountType = discountType; return this; }
        public Builder discountValue(BigDecimal discountValue) { this.discountValue = discountValue; return this; }
        public Builder displayOrder(Integer displayOrder) { this.displayOrder = displayOrder; return this; }
        public Builder deleted(boolean deleted) { this.deleted = deleted; return this; }

        public MenuItem build() {
            return new MenuItem(id, category, name, slug, description, price, foodType,
                    imageUrl, imagePublicId, available, bestseller, isNew, isPopular, popularDisplayOrder,
                    discountEnabled, discountType, discountValue, displayOrder, deleted);
        }
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Category getCategory() { return category; }
    public void setCategory(Category category) { this.category = category; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }

    public FoodType getFoodType() { return foodType; }
    public void setFoodType(FoodType foodType) { this.foodType = foodType; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public String getImagePublicId() { return imagePublicId; }
    public void setImagePublicId(String imagePublicId) { this.imagePublicId = imagePublicId; }

    public boolean isAvailable() { return available; }
    public void setAvailable(boolean available) { this.available = available; }

    public boolean isBestseller() { return bestseller; }
    public void setBestseller(boolean bestseller) { this.bestseller = bestseller; }

    public boolean isNew() { return isNew; }
    public void setNew(boolean isNew) { this.isNew = isNew; }
    public void setIsNew(boolean isNew) { this.isNew = isNew; }

    public boolean isPopular() { return isPopular; }
    public void setPopular(boolean popular) { this.isPopular = popular; }
    public void setIsPopular(boolean isPopular) { this.isPopular = isPopular; }

    public Integer getPopularDisplayOrder() { return popularDisplayOrder; }
    public void setPopularDisplayOrder(Integer popularDisplayOrder) { this.popularDisplayOrder = popularDisplayOrder; }

    public boolean isDiscountEnabled() { return discountEnabled; }
    public void setDiscountEnabled(boolean discountEnabled) { this.discountEnabled = discountEnabled; }

    public com.tryitcafe.model.enums.DiscountType getDiscountType() { return discountType; }
    public void setDiscountType(com.tryitcafe.model.enums.DiscountType discountType) { this.discountType = discountType; }

    public BigDecimal getDiscountValue() { return discountValue; }
    public void setDiscountValue(BigDecimal discountValue) { this.discountValue = discountValue; }

    public Integer getDisplayOrder() { return displayOrder; }
    public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }

    public boolean isDeleted() { return deleted; }
    public void setDeleted(boolean deleted) { this.deleted = deleted; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
