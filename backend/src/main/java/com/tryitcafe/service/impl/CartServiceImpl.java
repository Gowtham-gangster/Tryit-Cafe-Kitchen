package com.tryitcafe.service.impl;

import com.tryitcafe.exception.BadRequestException;
import com.tryitcafe.exception.OrderingClosedException;
import com.tryitcafe.exception.ResourceNotFoundException;
import com.tryitcafe.mapper.CartMapper;
import com.tryitcafe.model.dto.CartDtos;
import com.tryitcafe.model.entity.Cart;
import com.tryitcafe.model.entity.CartItem;
import com.tryitcafe.model.entity.MenuItem;
import com.tryitcafe.model.entity.User;
import com.tryitcafe.repository.CartItemRepository;
import com.tryitcafe.repository.CartRepository;
import com.tryitcafe.repository.MenuItemRepository;
import com.tryitcafe.repository.UserRepository;
import com.tryitcafe.service.BusinessSettingsService;
import com.tryitcafe.service.CartService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@Transactional
public class CartServiceImpl implements CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final MenuItemRepository menuItemRepository;
    private final UserRepository userRepository;
    private final CartMapper cartMapper;
    private final BusinessSettingsService businessSettingsService;

    public CartServiceImpl(CartRepository cartRepository,
                           CartItemRepository cartItemRepository,
                           MenuItemRepository menuItemRepository,
                           UserRepository userRepository,
                           CartMapper cartMapper,
                           BusinessSettingsService businessSettingsService) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.menuItemRepository = menuItemRepository;
        this.userRepository = userRepository;
        this.cartMapper = cartMapper;
        this.businessSettingsService = businessSettingsService;
    }

    private Cart getOrCreateCart(UUID userId) {
        return cartRepository.findByUserId(userId).orElseGet(() -> {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
            Cart newCart = new Cart();
            newCart.setUser(user);
            return cartRepository.save(newCart);
        });
    }

    @Override
    @Transactional(readOnly = true)
    public CartDtos.CartDto getCartForUser(UUID userId) {
        Cart cart = getOrCreateCart(userId);
        return cartMapper.toCartDto(cart);
    }

    @Override
    public CartDtos.CartDto addToCart(UUID userId, CartDtos.AddToCartRequest request) {
        if (!businessSettingsService.isOnlineOrderingEnabled()) {
            throw new OrderingClosedException(businessSettingsService.getEffectiveClosureMessage());
        }

        Cart cart = getOrCreateCart(userId);
        MenuItem menuItem = menuItemRepository.findById(request.getMenuItemId())
                .orElseThrow(() -> new ResourceNotFoundException("MenuItem", "id", request.getMenuItemId()));

        if (!menuItem.isAvailable()) {
            throw new BadRequestException("This dish is currently sold out and unavailable for ordering.");
        }

        Optional<CartItem> existingItemOpt = cartItemRepository.findByCartIdAndMenuItemId(cart.getId(), menuItem.getId());
        if (existingItemOpt.isPresent()) {
            CartItem existingItem = existingItemOpt.get();
            existingItem.setQuantity(existingItem.getQuantity() + request.getQuantity());
            if (request.getSpecialInstruction() != null && !request.getSpecialInstruction().isBlank()) {
                existingItem.setSpecialInstruction(request.getSpecialInstruction());
            }
            cartItemRepository.save(existingItem);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .menuItem(menuItem)
                    .quantity(request.getQuantity())
                    .specialInstruction(request.getSpecialInstruction())
                    .build();
            cart.addItem(newItem);
            cartItemRepository.save(newItem);
        }

        return cartMapper.toCartDto(cartRepository.findById(cart.getId()).orElse(cart));
    }

    @Override
    public CartDtos.CartDto updateCartItem(UUID userId, UUID cartItemId, CartDtos.UpdateCartItemRequest request) {
        if (!businessSettingsService.isOnlineOrderingEnabled()) {
            throw new OrderingClosedException(businessSettingsService.getEffectiveClosureMessage());
        }

        Cart cart = getOrCreateCart(userId);
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", cartItemId));

        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Cart item does not belong to your cart.");
        }

        if (request.getQuantity() <= 0) {
            cart.removeItem(cartItem);
            cartItemRepository.delete(cartItem);
        } else {
            cartItem.setQuantity(request.getQuantity());
            if (request.getSpecialInstruction() != null) {
                cartItem.setSpecialInstruction(request.getSpecialInstruction());
            }
            cartItemRepository.save(cartItem);
        }

        return cartMapper.toCartDto(cartRepository.findById(cart.getId()).orElse(cart));
    }

    @Override
    public CartDtos.CartDto removeCartItem(UUID userId, UUID cartItemId) {
        Cart cart = getOrCreateCart(userId);
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("CartItem", "id", cartItemId));

        if (!cartItem.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Cart item does not belong to your cart.");
        }

        cart.removeItem(cartItem);
        cartItemRepository.delete(cartItem);
        return cartMapper.toCartDto(cartRepository.findById(cart.getId()).orElse(cart));
    }

    @Override
    public void clearCart(UUID userId) {
        Cart cart = getOrCreateCart(userId);
        cart.clearItems();
        cartRepository.save(cart);
    }
}
