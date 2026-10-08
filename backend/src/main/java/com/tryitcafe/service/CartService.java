package com.tryitcafe.service;

import com.tryitcafe.model.dto.CartDtos;

import java.util.UUID;

public interface CartService {
    CartDtos.CartDto getCartForUser(UUID userId);
    CartDtos.CartDto addToCart(UUID userId, CartDtos.AddToCartRequest request);
    CartDtos.CartDto updateCartItem(UUID userId, UUID cartItemId, CartDtos.UpdateCartItemRequest request);
    CartDtos.CartDto removeCartItem(UUID userId, UUID cartItemId);
    void clearCart(UUID userId);
}
