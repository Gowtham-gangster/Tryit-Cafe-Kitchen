package com.tryitcafe.model.dto;

import com.tryitcafe.model.enums.FoodType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public class MenuDtos {

    public static class CategoryDto {
        private UUID id;
        private String name;
        private String slug;
        private String description;
        private Integer displayOrder;
        private boolean active;
        private int itemCount;

        public CategoryDto() {}

        public CategoryDto(UUID id, String name, String slug, String description, Integer displayOrder, boolean active, int itemCount) {
            this.id = id;
            this.name = name;
            this.slug = slug;
            this.description = description;
            this.displayOrder = displayOrder;
            this.active = active;
            this.itemCount = itemCount;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private UUID id;
            private String name;
            private String slug;
            private String description;
            private Integer displayOrder;
            private boolean active;
            private int itemCount;

            public Builder id(UUID id) { this.id = id; return this; }
            public Builder name(String name) { this.name = name; return this; }
            public Builder slug(String slug) { this.slug = slug; return this; }
            public Builder description(String description) { this.description = description; return this; }
            public Builder displayOrder(Integer displayOrder) { this.displayOrder = displayOrder; return this; }
            public Builder active(boolean active) { this.active = active; return this; }
            public Builder itemCount(int itemCount) { this.itemCount = itemCount; return this; }

            public CategoryDto build() {
                return new CategoryDto(id, name, slug, description, displayOrder, active, itemCount);
            }
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getSlug() { return slug; }
        public void setSlug(String slug) { this.slug = slug; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public Integer getDisplayOrder() { return displayOrder; }
        public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }

        public boolean isActive() { return active; }
        public void setActive(boolean active) { this.active = active; }

        public int getItemCount() { return itemCount; }
        public void setItemCount(int itemCount) { this.itemCount = itemCount; }
    }

    public static class CategoryCreateUpdateRequest {
        @NotBlank(message = "Category name is required")
        private String name;
        private String description;
        private Integer displayOrder;
        private Boolean active;

        public CategoryCreateUpdateRequest() {}

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public Integer getDisplayOrder() { return displayOrder; }
        public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }

        public Boolean getActive() { return active; }
        public void setActive(Boolean active) { this.active = active; }
    }

    public static class MenuItemDto {
        private UUID id;
        private UUID categoryId;
        private String categoryName;
        private String name;
        private String slug;
        private String description;
        private BigDecimal price;
        private FoodType foodType;
        private String imageUrl;
        private String imagePublicId;
        private boolean available;
        private boolean bestseller;
        private boolean isNew;
        private boolean isPopular;
        private Integer popularDisplayOrder;
        private boolean discountEnabled;
        private com.tryitcafe.model.enums.DiscountType discountType;
        private BigDecimal discountValue;
        private BigDecimal discountAmount;
        private BigDecimal effectivePrice;
        private Integer displayOrder;

        public MenuItemDto() {}

        public MenuItemDto(UUID id, UUID categoryId, String categoryName, String name, String slug, String description,
                           BigDecimal price, FoodType foodType, String imageUrl,
                           String imagePublicId, boolean available, boolean bestseller, boolean isNew,
                           boolean isPopular, Integer popularDisplayOrder,
                           boolean discountEnabled, com.tryitcafe.model.enums.DiscountType discountType,
                           BigDecimal discountValue, BigDecimal discountAmount, BigDecimal effectivePrice,
                           Integer displayOrder) {
            this.id = id;
            this.categoryId = categoryId;
            this.categoryName = categoryName;
            this.name = name;
            this.slug = slug;
            this.description = description;
            this.price = price;
            this.foodType = foodType;
            this.imageUrl = imageUrl;
            this.imagePublicId = imagePublicId;
            this.available = available;
            this.bestseller = bestseller;
            this.isNew = isNew;
            this.isPopular = isPopular;
            this.popularDisplayOrder = popularDisplayOrder;
            this.discountEnabled = discountEnabled;
            this.discountType = discountType;
            this.discountValue = discountValue;
            this.discountAmount = discountAmount;
            this.effectivePrice = effectivePrice != null ? effectivePrice : price;
            this.displayOrder = displayOrder;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private UUID id;
            private UUID categoryId;
            private String categoryName;
            private String name;
            private String slug;
            private String description;
            private BigDecimal price;
            private FoodType foodType;
            private String imageUrl;
            private String imagePublicId;
            private boolean available;
            private boolean bestseller;
            private boolean isNew;
            private boolean isPopular;
            private Integer popularDisplayOrder;
            private boolean discountEnabled;
            private com.tryitcafe.model.enums.DiscountType discountType;
            private BigDecimal discountValue;
            private BigDecimal discountAmount;
            private BigDecimal effectivePrice;
            private Integer displayOrder;

            public Builder id(UUID id) { this.id = id; return this; }
            public Builder categoryId(UUID categoryId) { this.categoryId = categoryId; return this; }
            public Builder categoryName(String categoryName) { this.categoryName = categoryName; return this; }
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
            public Builder discountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; return this; }
            public Builder effectivePrice(BigDecimal effectivePrice) { this.effectivePrice = effectivePrice; return this; }
            public Builder displayOrder(Integer displayOrder) { this.displayOrder = displayOrder; return this; }

            public MenuItemDto build() {
                return new MenuItemDto(id, categoryId, categoryName, name, slug, description, price,
                        foodType, imageUrl, imagePublicId, available, bestseller, isNew, isPopular, popularDisplayOrder,
                        discountEnabled, discountType, discountValue, discountAmount, effectivePrice, displayOrder);
            }
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }

        public UUID getCategoryId() { return categoryId; }
        public void setCategoryId(UUID categoryId) { this.categoryId = categoryId; }

        public String getCategoryName() { return categoryName; }
        public void setCategoryName(String categoryName) { this.categoryName = categoryName; }

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

        @com.fasterxml.jackson.annotation.JsonProperty("isNew")
        public boolean isNew() { return isNew; }

        @com.fasterxml.jackson.annotation.JsonProperty("new")
        public boolean getNew() { return isNew; }

        @com.fasterxml.jackson.annotation.JsonProperty("isNew")
        @com.fasterxml.jackson.annotation.JsonAlias({"new", "is_new"})
        public void setNew(boolean isNew) { this.isNew = isNew; }

        public void setIsNew(boolean isNew) { this.isNew = isNew; }

        @com.fasterxml.jackson.annotation.JsonProperty("isPopular")
        public boolean isPopular() { return isPopular; }

        @com.fasterxml.jackson.annotation.JsonProperty("popular")
        public boolean getPopular() { return isPopular; }

        @com.fasterxml.jackson.annotation.JsonProperty("isPopular")
        @com.fasterxml.jackson.annotation.JsonAlias({"popular"})
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

        public BigDecimal getDiscountAmount() { return discountAmount; }
        public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }

        public BigDecimal getEffectivePrice() {
            return effectivePrice != null ? effectivePrice : price;
        }
        public void setEffectivePrice(BigDecimal effectivePrice) { this.effectivePrice = effectivePrice; }

        public Integer getDisplayOrder() { return displayOrder; }
        public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
    }

    public static class MenuItemCreateUpdateRequest {
        @NotNull(message = "Category is required")
        private UUID categoryId;

        @NotBlank(message = "Dish name is required")
        private String name;

        private String description;

        @NotNull(message = "Price is required")
        @DecimalMin(value = "0.0", inclusive = true, message = "Price cannot be negative")
        private BigDecimal price;

        @NotNull(message = "Food type (VEG, NON_VEG, EGG) is required")
        private FoodType foodType;

        private String imageUrl;
        private String imagePublicId;
        private Boolean available;
        private Boolean bestseller;
        private Boolean isNew;
        private Boolean isPopular;
        private Integer popularDisplayOrder;
        private Boolean discountEnabled;
        private com.tryitcafe.model.enums.DiscountType discountType;
        private BigDecimal discountValue;
        private Integer displayOrder;

        public MenuItemCreateUpdateRequest() {}

        public UUID getCategoryId() { return categoryId; }
        public void setCategoryId(UUID categoryId) { this.categoryId = categoryId; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

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

        public Boolean getAvailable() { return available; }
        public void setAvailable(Boolean available) { this.available = available; }

        public Boolean getBestseller() { return bestseller; }
        public void setBestseller(Boolean bestseller) { this.bestseller = bestseller; }

        @com.fasterxml.jackson.annotation.JsonProperty("isNew")
        @com.fasterxml.jackson.annotation.JsonAlias({"new", "is_new"})
        public Boolean getIsNew() { return isNew; }

        @com.fasterxml.jackson.annotation.JsonProperty("isNew")
        @com.fasterxml.jackson.annotation.JsonAlias({"new", "is_new"})
        public void setIsNew(Boolean isNew) { this.isNew = isNew; }

        @com.fasterxml.jackson.annotation.JsonProperty("new")
        public Boolean getNew() { return isNew; }

        @com.fasterxml.jackson.annotation.JsonProperty("new")
        public void setNew(Boolean isNew) { this.isNew = isNew; }

        @com.fasterxml.jackson.annotation.JsonProperty("isPopular")
        @com.fasterxml.jackson.annotation.JsonAlias({"popular"})
        public Boolean getIsPopular() { return isPopular; }

        @com.fasterxml.jackson.annotation.JsonProperty("isPopular")
        @com.fasterxml.jackson.annotation.JsonAlias({"popular"})
        public void setIsPopular(Boolean isPopular) { this.isPopular = isPopular; }

        public Integer getPopularDisplayOrder() { return popularDisplayOrder; }
        public void setPopularDisplayOrder(Integer popularDisplayOrder) { this.popularDisplayOrder = popularDisplayOrder; }

        public Boolean getDiscountEnabled() { return discountEnabled; }
        public void setDiscountEnabled(Boolean discountEnabled) { this.discountEnabled = discountEnabled; }

        public com.tryitcafe.model.enums.DiscountType getDiscountType() { return discountType; }
        public void setDiscountType(com.tryitcafe.model.enums.DiscountType discountType) { this.discountType = discountType; }

        public BigDecimal getDiscountValue() { return discountValue; }
        public void setDiscountValue(BigDecimal discountValue) { this.discountValue = discountValue; }

        public Integer getDisplayOrder() { return displayOrder; }
        public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }
    }
}
