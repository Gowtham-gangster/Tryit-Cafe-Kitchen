package com.tryitcafe.model.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "cart_items", indexes = {
    @Index(name = "idx_cart_item_cart", columnList = "cart_id")
})
public class CartItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    private Cart cart;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "menu_item_id", nullable = false)
    private MenuItem menuItem;

    @Column(nullable = false)
    private Integer quantity = 1;

    @Column(length = 500)
    private String specialInstruction;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public CartItem() {}

    public CartItem(UUID id, Cart cart, MenuItem menuItem, Integer quantity, String specialInstruction) {
        this.id = id;
        this.cart = cart;
        this.menuItem = menuItem;
        this.quantity = quantity != null ? quantity : 1;
        this.specialInstruction = specialInstruction;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private UUID id;
        private Cart cart;
        private MenuItem menuItem;
        private Integer quantity = 1;
        private String specialInstruction;

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder cart(Cart cart) { this.cart = cart; return this; }
        public Builder menuItem(MenuItem menuItem) { this.menuItem = menuItem; return this; }
        public Builder quantity(Integer quantity) { this.quantity = quantity; return this; }
        public Builder specialInstruction(String specialInstruction) { this.specialInstruction = specialInstruction; return this; }

        public CartItem build() {
            return new CartItem(id, cart, menuItem, quantity, specialInstruction);
        }
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public Cart getCart() { return cart; }
    public void setCart(Cart cart) { this.cart = cart; }

    public MenuItem getMenuItem() { return menuItem; }
    public void setMenuItem(MenuItem menuItem) { this.menuItem = menuItem; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public String getSpecialInstruction() { return specialInstruction; }
    public void setSpecialInstruction(String specialInstruction) { this.specialInstruction = specialInstruction; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
