package com.tryitcafe.model.dto;

import com.tryitcafe.model.enums.FoodType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class CartDtos {

    public static class CartItemDto {
        private UUID id;
        private UUID menuItemId;
        private String menuItemName;
        private BigDecimal menuItemPrice;
        private FoodType foodType;
        private String imageUrl;
        private Integer quantity;
        private String specialInstruction;
        private BigDecimal itemTotal;

        public CartItemDto() {}

        public CartItemDto(UUID id, UUID menuItemId, String menuItemName, BigDecimal menuItemPrice,
                           FoodType foodType, String imageUrl, Integer quantity, String specialInstruction, BigDecimal itemTotal) {
            this.id = id;
            this.menuItemId = menuItemId;
            this.menuItemName = menuItemName;
            this.menuItemPrice = menuItemPrice;
            this.foodType = foodType;
            this.imageUrl = imageUrl;
            this.quantity = quantity;
            this.specialInstruction = specialInstruction;
            this.itemTotal = itemTotal;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private UUID id;
            private UUID menuItemId;
            private String menuItemName;
            private BigDecimal menuItemPrice;
            private FoodType foodType;
            private String imageUrl;
            private Integer quantity;
            private String specialInstruction;
            private BigDecimal itemTotal;

            public Builder id(UUID id) { this.id = id; return this; }
            public Builder menuItemId(UUID menuItemId) { this.menuItemId = menuItemId; return this; }
            public Builder menuItemName(String menuItemName) { this.menuItemName = menuItemName; return this; }
            public Builder menuItemPrice(BigDecimal menuItemPrice) { this.menuItemPrice = menuItemPrice; return this; }
            public Builder foodType(FoodType foodType) { this.foodType = foodType; return this; }
            public Builder imageUrl(String imageUrl) { this.imageUrl = imageUrl; return this; }
            public Builder quantity(Integer quantity) { this.quantity = quantity; return this; }
            public Builder specialInstruction(String specialInstruction) { this.specialInstruction = specialInstruction; return this; }
            public Builder itemTotal(BigDecimal itemTotal) { this.itemTotal = itemTotal; return this; }

            public CartItemDto build() {
                return new CartItemDto(id, menuItemId, menuItemName, menuItemPrice, foodType, imageUrl, quantity, specialInstruction, itemTotal);
            }
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }

        public UUID getMenuItemId() { return menuItemId; }
        public void setMenuItemId(UUID menuItemId) { this.menuItemId = menuItemId; }

        public String getMenuItemName() { return menuItemName; }
        public void setMenuItemName(String menuItemName) { this.menuItemName = menuItemName; }

        public BigDecimal getMenuItemPrice() { return menuItemPrice; }
        public void setMenuItemPrice(BigDecimal menuItemPrice) { this.menuItemPrice = menuItemPrice; }

        public FoodType getFoodType() { return foodType; }
        public void setFoodType(FoodType foodType) { this.foodType = foodType; }

        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }

        public String getSpecialInstruction() { return specialInstruction; }
        public void setSpecialInstruction(String specialInstruction) { this.specialInstruction = specialInstruction; }

        public BigDecimal getItemTotal() { return itemTotal; }
        public void setItemTotal(BigDecimal itemTotal) { this.itemTotal = itemTotal; }
    }

    public static class CartDto {
        private UUID id;
        private UUID userId;
        private List<CartItemDto> items = new ArrayList<>();
        private int totalQuantity;
        private BigDecimal subtotal;

        public CartDto() {}

        public CartDto(UUID id, UUID userId, List<CartItemDto> items, int totalQuantity, BigDecimal subtotal) {
            this.id = id;
            this.userId = userId;
            this.items = items != null ? items : new ArrayList<>();
            this.totalQuantity = totalQuantity;
            this.subtotal = subtotal;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private UUID id;
            private UUID userId;
            private List<CartItemDto> items = new ArrayList<>();
            private int totalQuantity;
            private BigDecimal subtotal;

            public Builder id(UUID id) { this.id = id; return this; }
            public Builder userId(UUID userId) { this.userId = userId; return this; }
            public Builder items(List<CartItemDto> items) { this.items = items; return this; }
            public Builder totalQuantity(int totalQuantity) { this.totalQuantity = totalQuantity; return this; }
            public Builder subtotal(BigDecimal subtotal) { this.subtotal = subtotal; return this; }

            public CartDto build() {
                return new CartDto(id, userId, items, totalQuantity, subtotal);
            }
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }

        public UUID getUserId() { return userId; }
        public void setUserId(UUID userId) { this.userId = userId; }

        public List<CartItemDto> getItems() { return items; }
        public void setItems(List<CartItemDto> items) { this.items = items; }

        public int getTotalQuantity() { return totalQuantity; }
        public void setTotalQuantity(int totalQuantity) { this.totalQuantity = totalQuantity; }

        public BigDecimal getSubtotal() { return subtotal; }
        public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }
    }

    public static class AddToCartRequest {
        @NotNull(message = "Menu item ID is required")
        private UUID menuItemId;

        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantity = 1;

        private String specialInstruction;

        public AddToCartRequest() {}

        public UUID getMenuItemId() { return menuItemId; }
        public void setMenuItemId(UUID menuItemId) { this.menuItemId = menuItemId; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }

        public String getSpecialInstruction() { return specialInstruction; }
        public void setSpecialInstruction(String specialInstruction) { this.specialInstruction = specialInstruction; }
    }

    public static class UpdateCartItemRequest {
        @NotNull(message = "Quantity is required")
        @Min(value = 0, message = "Quantity cannot be negative")
        private Integer quantity;

        private String specialInstruction;

        public UpdateCartItemRequest() {}

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }

        public String getSpecialInstruction() { return specialInstruction; }
        public void setSpecialInstruction(String specialInstruction) { this.specialInstruction = specialInstruction; }
    }
}
