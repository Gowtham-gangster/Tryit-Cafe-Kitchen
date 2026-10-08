package com.tryitcafe;

import com.tryitcafe.exception.BadRequestException;
import com.tryitcafe.exception.OrderingClosedException;
import com.tryitcafe.exception.ResourceNotFoundException;
import com.tryitcafe.model.dto.AuthDtos.RegisterRequest;
import com.tryitcafe.model.dto.CustomerLocationDtos.CreateLocationRequest;
import com.tryitcafe.model.dto.CustomerLocationDtos.CustomerLocationDto;
import com.tryitcafe.model.dto.CustomerLocationDtos.UpdateLocationRequest;
import com.tryitcafe.model.dto.OrderDtos.OrderItemRequest;
import com.tryitcafe.model.dto.OrderDtos.OrderPreviewRequest;
import com.tryitcafe.model.dto.OrderDtos.OrderPreviewResponse;
import com.tryitcafe.model.entity.MenuItem;
import com.tryitcafe.model.entity.User;
import com.tryitcafe.repository.MenuItemRepository;
import com.tryitcafe.repository.UserRepository;
import com.tryitcafe.service.AuthService;
import com.tryitcafe.service.BusinessSettingsService;
import com.tryitcafe.service.CustomerLocationService;
import com.tryitcafe.service.DistanceService;
import com.tryitcafe.service.OrderService;
import org.junit.jupiter.api.BeforeEach;
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
public class CustomerLocationAndOrderTests {

    @Autowired
    private DistanceService distanceService;

    @Autowired
    private CustomerLocationService customerLocationService;

    @Autowired
    private OrderService orderService;

    @Autowired
    private BusinessSettingsService businessSettingsService;

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    private User customerA;
    private User customerB;

    @BeforeEach
    void setUp() {
        String suffix = String.valueOf(System.nanoTime()).substring(6);
        String phoneA = "98" + suffix;
        String phoneB = "97" + suffix;

        RegisterRequest reqA = new RegisterRequest();
        reqA.setPhone(phoneA);
        reqA.setFullName("Customer A");
        reqA.setEmail("customera_" + suffix + "@tryit.com");
        reqA.setPassword("CustPass@123");
        authService.registerCustomer(reqA);
        customerA = userRepository.findByPhone(phoneA).orElseThrow();

        RegisterRequest reqB = new RegisterRequest();
        reqB.setPhone(phoneB);
        reqB.setFullName("Customer B");
        reqB.setEmail("customerb_" + suffix + "@tryit.com");
        reqB.setPassword("CustPass@123");
        authService.registerCustomer(reqB);
        customerB = userRepository.findByPhone(phoneB).orElseThrow();
    }

    // =========================================================================
    // DISTANCE & DELIVERY CHARGE UNIT TESTS (Requirement 9, 10, 11)
    // =========================================================================

    @Test
    @DisplayName("Should verify straight-line distance calculation using Haversine formula")
    void testHaversineDistanceCalculation() {
        // TryIt Cafe: 17.5765121, 78.4200518
        // Gandi Maisamma junction (~0.5 km away): 17.5790, 78.4215
        double dist = distanceService.calculateHaversineDistanceKm(17.5765121, 78.4200518, 17.5790, 78.4215);
        assertTrue(dist > 0.2 && dist < 1.0, "Distance should be ~0.3-0.5 km");
    }

    @Test
    @DisplayName("Should strictly satisfy all delivery charge test cases")
    void testDeliveryChargeRules() {
        BigDecimal rate = new BigDecimal("5.00");
        double freeRadius = 3.0;

        // 2.0 km -> FREE
        assertEquals(new BigDecimal("0.00"), distanceService.calculateDeliveryCharge(2.0, freeRadius, rate));

        // 2.9 km -> FREE
        assertEquals(new BigDecimal("0.00"), distanceService.calculateDeliveryCharge(2.9, freeRadius, rate));

        // 3.0 km -> FREE
        assertEquals(new BigDecimal("0.00"), distanceService.calculateDeliveryCharge(3.0, freeRadius, rate));

        // 3.1 km -> 3.1 * 5 = 15.50
        assertEquals(new BigDecimal("15.50"), distanceService.calculateDeliveryCharge(3.1, freeRadius, rate));

        // 4.0 km -> 4.0 * 5 = 20.00
        assertEquals(new BigDecimal("20.00"), distanceService.calculateDeliveryCharge(4.0, freeRadius, rate));

        // 5.0 km -> 5.0 * 5 = 25.00
        assertEquals(new BigDecimal("25.00"), distanceService.calculateDeliveryCharge(5.0, freeRadius, rate));

        // 7.5 km -> 7.5 * 5 = 37.50
        assertEquals(new BigDecimal("37.50"), distanceService.calculateDeliveryCharge(7.5, freeRadius, rate));

        // 10.0 km -> 10.0 * 5 = 50.00
        assertEquals(new BigDecimal("50.00"), distanceService.calculateDeliveryCharge(10.0, freeRadius, rate));
    }

    // =========================================================================
    // SAVED LOCATIONS TESTS (Requirement 4, 5, 21, 28)
    // =========================================================================

    @Test
    @DisplayName("Should save, retrieve, and manage saved locations for customer")
    void testSavedLocationsManagement() {
        // 1. Add Home location
        CreateLocationRequest loc1 = new CreateLocationRequest();
        loc1.setLabel("Home");
        loc1.setAddress("Gandi Maisamma, Hyderabad");
        loc1.setLatitude(17.5780);
        loc1.setLongitude(78.4210);

        CustomerLocationDto saved1 = customerLocationService.createLocation(customerA, loc1);
        assertNotNull(saved1.getId());
        assertTrue(saved1.isDefault(), "First location should automatically be default");

        // 2. Add Work location with isDefault = true
        CreateLocationRequest loc2 = new CreateLocationRequest();
        loc2.setLabel("Work");
        loc2.setAddress("Kompally, Hyderabad");
        loc2.setLatitude(17.5450);
        loc2.setLongitude(78.4850);
        loc2.setIsDefault(true);

        CustomerLocationDto saved2 = customerLocationService.createLocation(customerA, loc2);
        assertTrue(saved2.isDefault(), "Second location marked default");

        // Verify loc1 is no longer default
        List<CustomerLocationDto> allA = customerLocationService.getLocationsForUser(customerA);
        assertEquals(2, allA.size());
        assertEquals(saved2.getId(), allA.get(0).getId());

        // 3. Delete default location -> remaining location becomes default
        customerLocationService.deleteLocation(customerA, saved2.getId());
        List<CustomerLocationDto> remaining = customerLocationService.getLocationsForUser(customerA);
        assertEquals(1, remaining.size());
        assertTrue(remaining.get(0).isDefault(), "Remaining location should be promoted to default");
    }

    @Test
    @DisplayName("Security: Customer B cannot access or modify Customer A's saved location")
    void testCustomerLocationIsolation() {
        CreateLocationRequest loc1 = new CreateLocationRequest();
        loc1.setLabel("Home");
        loc1.setAddress("Customer A Home");
        loc1.setLatitude(17.5780);
        loc1.setLongitude(78.4210);
        CustomerLocationDto savedA = customerLocationService.createLocation(customerA, loc1);

        // Customer B attempting to access Customer A's location
        assertThrows(ResourceNotFoundException.class, () ->
                customerLocationService.getLocationByIdAndUser(savedA.getId(), customerB)
        );

        // Customer B attempting to update Customer A's location
        UpdateLocationRequest updateReq = new UpdateLocationRequest();
        updateReq.setLabel("Hacked");
        assertThrows(ResourceNotFoundException.class, () ->
                customerLocationService.updateLocation(customerB, savedA.getId(), updateReq)
        );

        // Customer B attempting to delete Customer A's location
        assertThrows(ResourceNotFoundException.class, () ->
                customerLocationService.deleteLocation(customerB, savedA.getId())
        );
    }

    @Test
    @DisplayName("Should persist and compose structured address details (Flat, Building, Street, Area, Landmark, PIN)")
    void testStructuredAddressPersistenceAndAutoComposition() {
        CreateLocationRequest req = new CreateLocationRequest();
        req.setLabel("Home");
        req.setHouseFlat("Flat 203");
        req.setBuildingName("Sri Sai Residency");
        req.setStreet("Hyderabad-Narsapur Road");
        req.setLandmark("Near Union Bank");
        req.setArea("Dundigal");
        req.setCity("Hyderabad");
        req.setState("Telangana");
        req.setPostalCode("500043");
        req.setLatitude(17.5780);
        req.setLongitude(78.4210);

        CustomerLocationDto saved = customerLocationService.createLocation(customerA, req);
        assertNotNull(saved.getId());
        assertEquals("Flat 203", saved.getHouseFlat());
        assertEquals("Sri Sai Residency", saved.getBuildingName());
        assertEquals("Hyderabad-Narsapur Road", saved.getStreet());
        assertEquals("Near Union Bank", saved.getLandmark());
        assertEquals("Dundigal", saved.getArea());
        assertEquals("Hyderabad", saved.getCity());
        assertEquals("Telangana", saved.getState());
        assertEquals("500043", saved.getPostalCode());
        assertTrue(saved.getAddress().contains("Flat 203"));
        assertTrue(saved.getAddress().contains("Sri Sai Residency"));
        assertTrue(saved.getAddress().contains("500043"));
    }

    // =========================================================================
    // CHECKOUT PREVIEW TESTS (Requirement 6, 7, 12, 16, 20)
    // =========================================================================

    @Test
    @DisplayName("Should preview delivery order with accurate distance and delivery charge")
    void testDeliveryOrderPreview() {
        // Find an active seed menu item without discount
        MenuItem item = menuItemRepository.findAllByDeletedFalseOrderByDisplayOrderAsc().stream()
                .filter(i -> i.isAvailable() && !i.isDiscountEnabled())
                .findFirst()
                .orElseThrow();

        // Create location within 2 km of cafe
        CreateLocationRequest locReq = new CreateLocationRequest();
        locReq.setLabel("Home");
        locReq.setAddress("Near Gandi Maisamma");
        locReq.setLatitude(17.5770);
        locReq.setLongitude(78.4210);
        CustomerLocationDto loc = customerLocationService.createLocation(customerA, locReq);

        OrderPreviewRequest orderReq = new OrderPreviewRequest();
        orderReq.setOrderType("DELIVERY");
        orderReq.setLocationId(loc.getId());
        orderReq.setItems(List.of(new OrderItemRequest(item.getId(), 2)));

        OrderPreviewResponse response = orderService.previewOrder(customerA, orderReq);

        assertNotNull(response);
        assertEquals("DELIVERY", response.getOrderType());
        assertTrue(response.getDistanceKm() <= 3.0);
        assertEquals(new BigDecimal("0.00"), response.getDeliveryCharge(), "Within 3 km should be FREE delivery");
        assertEquals(item.getPrice().multiply(BigDecimal.valueOf(2)).setScale(2), response.getSubtotal());
        assertEquals(response.getSubtotal(), response.getTotal());
        assertNotNull(response.getLocation());
    }

    @Test
    @DisplayName("Should preview takeaway order with zero delivery fee and no location required")
    void testTakeawayOrderPreview() {
        MenuItem item = menuItemRepository.findAllByDeletedFalseOrderByDisplayOrderAsc().stream()
                .filter(i -> i.isAvailable() && !i.isDiscountEnabled())
                .findFirst()
                .orElseThrow();

        OrderPreviewRequest orderReq = new OrderPreviewRequest();
        orderReq.setOrderType("TAKEAWAY");
        orderReq.setItems(List.of(new OrderItemRequest(item.getId(), 1)));

        OrderPreviewResponse response = orderService.previewOrder(customerA, orderReq);

        assertNotNull(response);
        assertEquals("TAKEAWAY", response.getOrderType());
        assertEquals(0.0, response.getDistanceKm());
        assertEquals(new BigDecimal("0.00"), response.getDeliveryCharge());
        assertEquals(item.getPrice().setScale(2), response.getSubtotal());
        assertEquals(response.getSubtotal(), response.getTotal());
        assertNull(response.getLocation());
    }

    @Test
    @DisplayName("Should block delivery order preview if locationId is missing")
    void testDeliveryOrderPreviewRequiresLocation() {
        MenuItem item = menuItemRepository.findAllByDeletedFalseOrderByDisplayOrderAsc().stream()
                .filter(MenuItem::isAvailable)
                .findFirst()
                .orElseThrow();

        OrderPreviewRequest orderReq = new OrderPreviewRequest();
        orderReq.setOrderType("DELIVERY");
        orderReq.setLocationId(null);
        orderReq.setItems(List.of(new OrderItemRequest(item.getId(), 1)));

        assertThrows(BadRequestException.class, () -> orderService.previewOrder(customerA, orderReq));
    }

    @Test
    @DisplayName("Security: Should block delivery order if customer submits another user's locationId")
    void testDeliveryOrderWithUnauthorizedLocationBlocked() {
        // Customer B creates a location
        CreateLocationRequest locReqB = new CreateLocationRequest();
        locReqB.setLabel("Home B");
        locReqB.setAddress("Customer B Address");
        locReqB.setLatitude(17.5000);
        locReqB.setLongitude(78.5000);
        CustomerLocationDto locB = customerLocationService.createLocation(customerB, locReqB);

        MenuItem item = menuItemRepository.findAllByDeletedFalseOrderByDisplayOrderAsc().stream()
                .filter(MenuItem::isAvailable)
                .findFirst()
                .orElseThrow();

        // Customer A attempts to checkout using Customer B's locationId
        OrderPreviewRequest orderReq = new OrderPreviewRequest();
        orderReq.setOrderType("DELIVERY");
        orderReq.setLocationId(locB.getId());
        orderReq.setItems(List.of(new OrderItemRequest(item.getId(), 1)));

        assertThrows(ResourceNotFoundException.class, () -> orderService.previewOrder(customerA, orderReq));
    }

    @Test
    @DisplayName("Order Preview: Authoritatively uses discounted item prices in subtotal calculation")
    void testOrderPreviewUsesDiscountedPrice() {
        MenuItem seed = menuItemRepository.findAllByDeletedFalseOrderByDisplayOrderAsc().stream()
                .filter(MenuItem::isAvailable)
                .findFirst()
                .orElseThrow();

        MenuItem item = menuItemRepository.save(MenuItem.builder()
                .name("Discounted Burger Test " + System.nanoTime())
                .slug("discounted-burger-test-" + System.nanoTime())
                .description("Test Description")
                .price(new BigDecimal("200.00"))
                .category(seed.getCategory())
                .foodType(com.tryitcafe.model.enums.FoodType.VEG)
                .available(true)
                .bestseller(false)
                .discountEnabled(true)
                .discountType(com.tryitcafe.model.enums.DiscountType.PERCENTAGE)
                .discountValue(new BigDecimal("10.00")) // 10% off -> ₹180
                .displayOrder(9999)
                .deleted(false)
                .build());

        OrderPreviewRequest orderReq = new OrderPreviewRequest();
        orderReq.setOrderType("TAKEAWAY");
        orderReq.setItems(List.of(new OrderItemRequest(item.getId(), 2)));

        OrderPreviewResponse preview = orderService.previewOrder(customerA, orderReq);
        assertNotNull(preview);
        assertEquals(new BigDecimal("360.00"), preview.getSubtotal(), "Subtotal should be 2 * ₹180 = ₹360");
        assertEquals(new BigDecimal("360.00"), preview.getTotal(), "Total should be ₹360 for TAKEAWAY");
        assertEquals(new BigDecimal("180.00"), preview.getItems().get(0).getPrice(), "Item unit price in preview should be ₹180");
        assertEquals(new BigDecimal("360.00"), preview.getItems().get(0).getItemTotal(), "Item line total should be ₹360");
    }
}
