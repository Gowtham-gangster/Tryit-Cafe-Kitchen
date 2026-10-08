package com.tryitcafe.model.dto;

import com.tryitcafe.model.dto.CustomerLocationDtos.CustomerLocationDto;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public class OrderDtos {

    public static class OrderItemRequest {
        @NotNull(message = "Item ID is required")
        private UUID menuItemId;

        @NotNull(message = "Quantity is required")
        private Integer quantity;

        public OrderItemRequest() {}

        public OrderItemRequest(UUID menuItemId, Integer quantity) {
            this.menuItemId = menuItemId;
            this.quantity = quantity;
        }

        public UUID getMenuItemId() { return menuItemId; }
        public void setMenuItemId(UUID menuItemId) { this.menuItemId = menuItemId; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
    }

    public static class OrderPreviewRequest {
        @NotNull(message = "Order type is required (DELIVERY or TAKEAWAY)")
        private String orderType; // "DELIVERY" | "TAKEAWAY"

        private UUID locationId;

        private List<OrderItemRequest> items;

        private String instructions;
        private String cravingText;

        public OrderPreviewRequest() {}

        public String getOrderType() { return orderType; }
        public void setOrderType(String orderType) { this.orderType = orderType; }

        public UUID getLocationId() { return locationId; }
        public void setLocationId(UUID locationId) { this.locationId = locationId; }

        public List<OrderItemRequest> getItems() { return items; }
        public void setItems(List<OrderItemRequest> items) { this.items = items; }

        public String getInstructions() { return instructions; }
        public void setInstructions(String instructions) { this.instructions = instructions; }

        public String getCravingText() { return cravingText; }
        public void setCravingText(String cravingText) { this.cravingText = cravingText; }
    }

    public static class OrderPreviewItemDto {
        private UUID id;
        private String name;
        private BigDecimal price;
        private Integer quantity;
        private BigDecimal itemTotal;
        private String imageUrl;
        private String foodType;

        public OrderPreviewItemDto() {}

        public OrderPreviewItemDto(UUID id, String name, BigDecimal price, Integer quantity, BigDecimal itemTotal) {
            this(id, name, price, quantity, itemTotal, null, null);
        }

        public OrderPreviewItemDto(UUID id, String name, BigDecimal price, Integer quantity, BigDecimal itemTotal, String imageUrl, String foodType) {
            this.id = id;
            this.name = name;
            this.price = price;
            this.quantity = quantity;
            this.itemTotal = itemTotal;
            this.imageUrl = imageUrl;
            this.foodType = foodType;
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public BigDecimal getPrice() { return price; }
        public void setPrice(BigDecimal price) { this.price = price; }

        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }

        public BigDecimal getItemTotal() { return itemTotal; }
        public void setItemTotal(BigDecimal itemTotal) { this.itemTotal = itemTotal; }

        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

        public String getFoodType() { return foodType; }
        public void setFoodType(String foodType) { this.foodType = foodType; }
    }

    public static class OrderPreviewResponse {
        private String orderType;
        private BigDecimal subtotal;
        private Double distanceKm;
        private BigDecimal deliveryCharge;
        private BigDecimal total;
        private Double freeDeliveryDistanceKm;
        private BigDecimal deliveryRatePerKm;
        private CustomerLocationDto location;
        private List<OrderPreviewItemDto> items;

        public OrderPreviewResponse() {}

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private String orderType;
            private BigDecimal subtotal;
            private Double distanceKm;
            private BigDecimal deliveryCharge;
            private BigDecimal total;
            private Double freeDeliveryDistanceKm;
            private BigDecimal deliveryRatePerKm;
            private CustomerLocationDto location;
            private List<OrderPreviewItemDto> items;

            public Builder orderType(String orderType) { this.orderType = orderType; return this; }
            public Builder subtotal(BigDecimal subtotal) { this.subtotal = subtotal; return this; }
            public Builder distanceKm(Double distanceKm) { this.distanceKm = distanceKm; return this; }
            public Builder deliveryCharge(BigDecimal deliveryCharge) { this.deliveryCharge = deliveryCharge; return this; }
            public Builder total(BigDecimal total) { this.total = total; return this; }
            public Builder freeDeliveryDistanceKm(Double freeDeliveryDistanceKm) { this.freeDeliveryDistanceKm = freeDeliveryDistanceKm; return this; }
            public Builder deliveryRatePerKm(BigDecimal deliveryRatePerKm) { this.deliveryRatePerKm = deliveryRatePerKm; return this; }
            public Builder location(CustomerLocationDto location) { this.location = location; return this; }
            public Builder items(List<OrderPreviewItemDto> items) { this.items = items; return this; }

            public OrderPreviewResponse build() {
                OrderPreviewResponse res = new OrderPreviewResponse();
                res.setOrderType(orderType);
                res.setSubtotal(subtotal);
                res.setDistanceKm(distanceKm);
                res.setDeliveryCharge(deliveryCharge);
                res.setTotal(total);
                res.setFreeDeliveryDistanceKm(freeDeliveryDistanceKm);
                res.setDeliveryRatePerKm(deliveryRatePerKm);
                res.setLocation(location);
                res.setItems(items);
                return res;
            }
        }

        public String getOrderType() { return orderType; }
        public void setOrderType(String orderType) { this.orderType = orderType; }

        public BigDecimal getSubtotal() { return subtotal; }
        public void setSubtotal(BigDecimal subtotal) { this.subtotal = subtotal; }

        public Double getDistanceKm() { return distanceKm; }
        public void setDistanceKm(Double distanceKm) { this.distanceKm = distanceKm; }

        public BigDecimal getDeliveryCharge() { return deliveryCharge; }
        public void setDeliveryCharge(BigDecimal deliveryCharge) { this.deliveryCharge = deliveryCharge; }

        public BigDecimal getTotal() { return total; }
        public void setTotal(BigDecimal total) { this.total = total; }

        public Double getFreeDeliveryDistanceKm() { return freeDeliveryDistanceKm; }
        public void setFreeDeliveryDistanceKm(Double freeDeliveryDistanceKm) { this.freeDeliveryDistanceKm = freeDeliveryDistanceKm; }

        public BigDecimal getDeliveryRatePerKm() { return deliveryRatePerKm; }
        public void setDeliveryRatePerKm(BigDecimal deliveryRatePerKm) { this.deliveryRatePerKm = deliveryRatePerKm; }

        public CustomerLocationDto getLocation() { return location; }
        public void setLocation(CustomerLocationDto location) { this.location = location; }

        public List<OrderPreviewItemDto> getItems() { return items; }
        public void setItems(List<OrderPreviewItemDto> items) { this.items = items; }
    }
}
