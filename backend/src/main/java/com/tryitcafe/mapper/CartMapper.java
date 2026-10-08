package com.tryitcafe.mapper;

import com.tryitcafe.model.dto.CartDtos;
import com.tryitcafe.model.entity.Cart;
import com.tryitcafe.model.entity.CartItem;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class CartMapper {

    public CartDtos.CartItemDto toItemDto(CartItem item) {
        if (item == null) return null;
        BigDecimal price = item.getMenuItem() != null && item.getMenuItem().getPrice() != null
                ? item.getMenuItem().getPrice()
                : BigDecimal.ZERO;
        BigDecimal total = price.multiply(BigDecimal.valueOf(item.getQuantity()));

        return CartDtos.CartItemDto.builder()
                .id(item.getId())
                .menuItemId(item.getMenuItem() != null ? item.getMenuItem().getId() : null)
                .menuItemName(item.getMenuItem() != null ? item.getMenuItem().getName() : "")
                .menuItemPrice(price)
                .foodType(item.getMenuItem() != null ? item.getMenuItem().getFoodType() : null)
                .imageUrl(item.getMenuItem() != null ? item.getMenuItem().getImageUrl() : null)
                .quantity(item.getQuantity())
                .specialInstruction(item.getSpecialInstruction())
                .itemTotal(total)
                .build();
    }

    public CartDtos.CartDto toCartDto(Cart cart) {
        if (cart == null) return null;
        List<CartDtos.CartItemDto> itemDtos = cart.getItems() != null
                ? cart.getItems().stream().map(this::toItemDto).collect(Collectors.toList())
                : List.of();

        int totalQty = itemDtos.stream().mapToInt(CartDtos.CartItemDto::getQuantity).sum();
        BigDecimal subtotal = itemDtos.stream()
                .map(CartDtos.CartItemDto::getItemTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartDtos.CartDto.builder()
                .id(cart.getId())
                .userId(cart.getUser() != null ? cart.getUser().getId() : null)
                .items(itemDtos)
                .totalQuantity(totalQty)
                .subtotal(subtotal)
                .build();
    }
}
