package com.tryitcafe;

import com.tryitcafe.model.dto.CartDtos;
import com.tryitcafe.model.dto.MenuDtos.MenuItemDto;
import com.tryitcafe.model.entity.User;
import com.tryitcafe.repository.UserRepository;
import com.tryitcafe.service.CartService;
import com.tryitcafe.service.MenuItemService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("dev")
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
public class CartIntegrationTests {

    @Autowired
    private CartService cartService;

    @Autowired
    private MenuItemService menuItemService;

    @Autowired
    private UserRepository userRepository;

    @Test
    @DisplayName("Should successfully add, update, calculate totals, and remove cart items")
    void testCompleteCartFlow() {
        User customer = userRepository.findByPhone("9876543210")
                .orElseThrow(() -> new IllegalStateException("Test customer not found"));

        List<MenuItemDto> menuItems = menuItemService.searchMenuItems(null, null, null, null);
        assertFalse(menuItems.isEmpty(), "Menu items must be seeded");

        MenuItemDto pasta = menuItems.get(0);
        MenuItemDto roll = menuItems.get(1);

        // 1. Add item 1
        CartDtos.AddToCartRequest addReq1 = new CartDtos.AddToCartRequest();
        addReq1.setMenuItemId(pasta.getId());
        addReq1.setQuantity(2);
        addReq1.setSpecialInstruction("Extra spicy, please");

        CartDtos.CartDto cart = cartService.addToCart(customer.getId(), addReq1);
        assertNotNull(cart);
        assertEquals(1, cart.getItems().size());
        assertEquals(2, cart.getItems().get(0).getQuantity());
        assertEquals("Extra spicy, please", cart.getItems().get(0).getSpecialInstruction());
        assertEquals(pasta.getPrice().multiply(BigDecimal.valueOf(2)), cart.getSubtotal());

        // 2. Add item 2
        CartDtos.AddToCartRequest addReq2 = new CartDtos.AddToCartRequest();
        addReq2.setMenuItemId(roll.getId());
        addReq2.setQuantity(1);

        cart = cartService.addToCart(customer.getId(), addReq2);
        assertEquals(2, cart.getItems().size());

        // 3. Update quantity of item 1
        UUID cartItemId = cart.getItems().get(0).getId();
        CartDtos.UpdateCartItemRequest updateReq = new CartDtos.UpdateCartItemRequest();
        updateReq.setQuantity(3);
        updateReq.setSpecialInstruction("Mild spicy now");

        cart = cartService.updateCartItem(customer.getId(), cartItemId, updateReq);
        assertEquals(3, cart.getItems().get(0).getQuantity());
        assertEquals("Mild spicy now", cart.getItems().get(0).getSpecialInstruction());

        // 4. Remove item
        cart = cartService.removeCartItem(customer.getId(), cartItemId);
        assertEquals(1, cart.getItems().size());

        // 5. Clear cart
        cartService.clearCart(customer.getId());
        CartDtos.CartDto emptyCart = cartService.getCartForUser(customer.getId());
        assertTrue(emptyCart.getItems().isEmpty());
        assertEquals(BigDecimal.ZERO, emptyCart.getSubtotal());
    }

    @Test
    @DisplayName("Should reject adding unavailable (sold out) dishes to cart")
    void testRejectSoldOutDish() {
        User customer = userRepository.findByPhone("9876543210")
                .orElseThrow(() -> new IllegalStateException("Test customer not found"));

        List<MenuItemDto> menuItems = menuItemService.searchMenuItems(null, null, null, null);
        MenuItemDto item = menuItems.get(0);

        // Make dish unavailable
        menuItemService.toggleAvailability(item.getId());

        CartDtos.AddToCartRequest addReq = new CartDtos.AddToCartRequest();
        addReq.setMenuItemId(item.getId());
        addReq.setQuantity(1);

        assertThrows(RuntimeException.class, () -> cartService.addToCart(customer.getId(), addReq));
    }
}
