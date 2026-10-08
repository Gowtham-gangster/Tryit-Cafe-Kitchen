package com.tryitcafe;

import com.tryitcafe.exception.OrderingClosedException;
import com.tryitcafe.model.dto.CartDtos;
import com.tryitcafe.model.dto.MenuDtos.MenuItemDto;
import com.tryitcafe.model.dto.SettingsDtos.OnlineOrderingStatusDto;
import com.tryitcafe.model.dto.SettingsDtos.OnlineOrderingUpdateRequest;
import com.tryitcafe.model.entity.MenuItem;
import com.tryitcafe.model.entity.User;
import com.tryitcafe.repository.MenuItemRepository;
import com.tryitcafe.repository.UserRepository;
import com.tryitcafe.service.BusinessSettingsService;
import com.tryitcafe.service.CartService;
import com.tryitcafe.service.MenuItemService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("dev")
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
public class OnlineOrderingIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private BusinessSettingsService businessSettingsService;

    @Autowired
    private CartService cartService;

    @Autowired
    private MenuItemService menuItemService;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private UserRepository userRepository;

    @org.junit.jupiter.api.BeforeEach
    void resetOrderingState() {
        businessSettingsService.updateOnlineOrderingStatus(new OnlineOrderingUpdateRequest(true, null, null));
    }

    @Test
    @DisplayName("Owner should toggle online ordering open/closed and public status endpoint should reflect it")
    void testToggleOnlineOrdering() {
        // 1. Initial state: Open
        OnlineOrderingStatusDto initial = businessSettingsService.getOnlineOrderingStatus();
        assertTrue(initial.isOnlineOrderingEnabled());

        // 2. Owner closes online ordering with custom closure message and next opening time
        OnlineOrderingUpdateRequest closeReq = new OnlineOrderingUpdateRequest(
                false,
                "Online ordering is closed today for kitchen maintenance.",
                "Tomorrow 11:00 AM"
        );
        OnlineOrderingStatusDto closed = businessSettingsService.updateOnlineOrderingStatus(closeReq);
        assertFalse(closed.isOnlineOrderingEnabled());
        assertEquals("Online ordering is closed today for kitchen maintenance.", closed.getClosureMessage());
        assertEquals("Tomorrow 11:00 AM", closed.getNextOpeningTime());
        assertFalse(businessSettingsService.isOnlineOrderingEnabled());

        // 3. Owner reopens online ordering
        OnlineOrderingUpdateRequest openReq = new OnlineOrderingUpdateRequest(
                true,
                null,
                null
        );
        OnlineOrderingStatusDto reopened = businessSettingsService.updateOnlineOrderingStatus(openReq);
        assertTrue(reopened.isOnlineOrderingEnabled());
        assertTrue(businessSettingsService.isOnlineOrderingEnabled());
    }

    @Test
    @DisplayName("Backend must reject Add to Cart and Update Cart when online ordering is closed")
    void testCartEnforcementWhenClosed() {
        User customer = userRepository.findByPhone("9876543210")
                .orElseThrow(() -> new IllegalStateException("Test customer not found"));

        List<MenuItemDto> items = menuItemService.searchMenuItems(null, null, null, null);
        assertFalse(items.isEmpty());
        MenuItemDto dish = items.stream().filter(MenuItemDto::isAvailable).findFirst().orElse(null);
        if (dish == null) {
            MenuItem entity = menuItemRepository.findById(items.get(0).getId()).orElseThrow();
            entity.setAvailable(true);
            menuItemRepository.save(entity);
            dish = menuItemService.searchMenuItems(null, null, null, null).get(0);
        }

        // First add item while OPEN to simulate existing cart
        CartDtos.AddToCartRequest addReq = new CartDtos.AddToCartRequest();
        addReq.setMenuItemId(dish.getId());
        addReq.setQuantity(2);
        CartDtos.CartDto activeCart = cartService.addToCart(customer.getId(), addReq);
        assertEquals(1, activeCart.getItems().size());
        var cartItemId = activeCart.getItems().get(0).getId();

        // Now Owner CLOSES online ordering
        businessSettingsService.updateOnlineOrderingStatus(new OnlineOrderingUpdateRequest(
                false,
                "Online ordering is currently closed.",
                "10:00"
        ));

        // Existing cart MUST remain accessible
        CartDtos.CartDto existingCart = cartService.getCartForUser(customer.getId());
        assertEquals(1, existingCart.getItems().size(), "Existing cart must not be deleted when ordering is closed");

        // Attempting to add item while CLOSED must throw OrderingClosedException
        CartDtos.AddToCartRequest rejectedAdd = new CartDtos.AddToCartRequest();
        rejectedAdd.setMenuItemId(dish.getId());
        rejectedAdd.setQuantity(1);

        OrderingClosedException addEx = assertThrows(OrderingClosedException.class, () -> {
            cartService.addToCart(customer.getId(), rejectedAdd);
        });
        assertEquals("ONLINE_ORDERING_CLOSED", addEx.getCode());

        // Attempting to update item while CLOSED must throw OrderingClosedException
        CartDtos.UpdateCartItemRequest updateReq = new CartDtos.UpdateCartItemRequest();
        updateReq.setQuantity(5);

        OrderingClosedException updateEx = assertThrows(OrderingClosedException.class, () -> {
            cartService.updateCartItem(customer.getId(), cartItemId, updateReq);
        });
        assertEquals("ONLINE_ORDERING_CLOSED", updateEx.getCode());
    }

    @Test
    @DisplayName("Backend order endpoint /api/orders must return HTTP 403 with ONLINE_ORDERING_CLOSED when closed")
    @WithMockUser(username = "9876543210", authorities = {"ROLE_CUSTOMER"})
    void testDirectOrderApiRejectionWhenClosed() throws Exception {
        // Owner closes online ordering
        businessSettingsService.updateOnlineOrderingStatus(new OnlineOrderingUpdateRequest(
                false,
                "Online ordering is currently closed.",
                "10:00"
        ));

        // Customer calls POST /api/orders while closed
        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"items\":[]}"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("ONLINE_ORDERING_CLOSED"))
                .andExpect(jsonPath("$.message").value("Online ordering is currently closed."));
    }

    @Test
    @DisplayName("Public status endpoint /api/business/status must be publicly accessible without authentication")
    void testPublicBusinessStatusEndpoint() throws Exception {
        businessSettingsService.updateOnlineOrderingStatus(new OnlineOrderingUpdateRequest(
                false,
                "Online ordering closed for renovation.",
                "Friday 5:00 PM"
        ));

        mockMvc.perform(get("/api/business/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.onlineOrderingEnabled").value(false))
                .andExpect(jsonPath("$.data.closureMessage").value("Online ordering closed for renovation."))
                .andExpect(jsonPath("$.data.nextOpeningTime").value("Friday 5:00 PM"));
    }
}
