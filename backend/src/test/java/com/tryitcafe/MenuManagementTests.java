package com.tryitcafe;

import com.tryitcafe.model.dto.MenuDtos.*;
import com.tryitcafe.model.enums.FoodType;
import com.tryitcafe.service.CategoryService;
import com.tryitcafe.service.MenuItemService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("dev")
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
public class MenuManagementTests {

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private MenuItemService menuItemService;

    @Test
    @DisplayName("Owner should successfully create and edit categories")
    void testCategoryLifecycle() {
        CategoryCreateUpdateRequest req = new CategoryCreateUpdateRequest();
        req.setName("Beverages & Shakes");
        req.setDescription("Thick creamy shakes");
        req.setDisplayOrder(10);
        req.setActive(true);

        CategoryDto created = categoryService.createCategory(req);
        assertNotNull(created);
        assertEquals("Beverages & Shakes", created.getName());
        assertEquals("beverages-shakes", created.getSlug());

        // Update Category
        req.setName("Gourmet Beverages & Shakes");
        CategoryDto updated = categoryService.updateCategory(created.getId(), req);
        assertEquals("Gourmet Beverages & Shakes", updated.getName());
    }

    @Test
    @DisplayName("Owner should create, update, toggle availability, and soft delete menu items")
    void testMenuItemLifecycle() {
        List<CategoryDto> categories = categoryService.getAllCategoriesForOwner();
        assertFalse(categories.isEmpty(), "Categories should be seeded");
        CategoryDto cat = categories.get(0);

        // 1. Create Dish
        MenuItemCreateUpdateRequest addReq = new MenuItemCreateUpdateRequest();
        addReq.setName("Paneer Tikka Roll");
        addReq.setCategoryId(cat.getId());
        addReq.setPrice(new BigDecimal("150.00"));
        addReq.setFoodType(FoodType.VEG);
        addReq.setDescription("Marinated cottage cheese wrapped in paratha");
        addReq.setAvailable(true);
        addReq.setBestseller(true);
        addReq.setIsNew(true);
        addReq.setDisplayOrder(1);

        MenuItemDto created = menuItemService.createMenuItem(addReq);
        assertNotNull(created);
        assertEquals("Paneer Tikka Roll", created.getName());
        assertEquals(new BigDecimal("150.00"), created.getPrice());
        assertTrue(created.isAvailable());

        // 2. Edit Dish Price
        addReq.setPrice(new BigDecimal("165.00"));
        MenuItemDto updated = menuItemService.updateMenuItem(created.getId(), addReq);
        assertEquals(new BigDecimal("165.00"), updated.getPrice());

        // 3. Toggle Availability
        MenuItemDto toggled = menuItemService.toggleAvailability(created.getId());
        assertFalse(toggled.isAvailable(), "Availability should be false after toggle");

        // 4. Soft Delete Dish
        menuItemService.deleteMenuItem(created.getId());
        List<MenuItemDto> activePublicDishes = menuItemService.searchMenuItems(null, null, null, "Paneer Tikka Roll");
        assertTrue(activePublicDishes.isEmpty(), "Soft deleted dish should not appear in public menu search");
    }

    @Test
    @DisplayName("Should prevent deletion of category containing dishes")
    void testPreventDeleteNonEmptyCategory() {
        List<CategoryDto> categories = categoryService.getAllCategoriesForOwner();
        CategoryDto seededCategoryWithDishes = categories.stream()
                .filter(c -> c.getItemCount() > 0)
                .findFirst()
                .orElse(null);

        assertNotNull(seededCategoryWithDishes, "A seeded category with dishes should exist");
        assertThrows(IllegalStateException.class, () -> categoryService.deleteCategory(seededCategoryWithDishes.getId()));
    }

    @Test
    @DisplayName("Owner should manage Popular status and display order independently of Bestseller")
    void testPopularItemLifecycleAndOrder() {
        // Clear any existing popular items to guarantee test isolation
        for (MenuItemDto p : menuItemService.getPopularMenuItems()) {
            menuItemService.updatePopularStatus(p.getId(), false, null);
        }

        List<CategoryDto> categories = categoryService.getAllCategoriesForOwner();
        CategoryDto cat = categories.get(0);

        MenuItemCreateUpdateRequest req = new MenuItemCreateUpdateRequest();
        req.setName("Special Corn Cheese Toast");
        req.setCategoryId(cat.getId());
        req.setPrice(new BigDecimal("140.00"));
        req.setFoodType(FoodType.VEG);
        req.setBestseller(false);
        req.setIsPopular(true);
        req.setPopularDisplayOrder(4);

        MenuItemDto created = menuItemService.createMenuItem(req);
        assertNotNull(created);
        assertFalse(created.isBestseller(), "Bestseller should be false");
        assertTrue(created.isPopular(), "isPopular should be true");
        assertEquals(4, created.getPopularDisplayOrder());

        // Update popular order
        MenuItemDto updated = menuItemService.updatePopularStatus(created.getId(), true, 1);
        assertEquals(1, updated.getPopularDisplayOrder());

        // Remove from popular
        MenuItemDto removed = menuItemService.updatePopularStatus(created.getId(), false, null);
        assertFalse(removed.isPopular());
        // Verify item is NOT deleted when removed from popular
        assertTrue(removed.isAvailable());
    }

    @Test
    @DisplayName("Bestseller and Popular must support all independent combinations")
    void testPopularAndBestsellerIndependence() {
        // Clear any existing popular items to guarantee test isolation
        for (MenuItemDto p : menuItemService.getPopularMenuItems()) {
            menuItemService.updatePopularStatus(p.getId(), false, null);
        }

        List<CategoryDto> categories = categoryService.getAllCategoriesForOwner();
        CategoryDto cat = categories.get(0);

        // Combo 1: Bestseller=true, Popular=false
        MenuItemCreateUpdateRequest req1 = new MenuItemCreateUpdateRequest();
        req1.setName("Dish A - Bestseller Only");
        req1.setCategoryId(cat.getId());
        req1.setPrice(new BigDecimal("100.00"));
        req1.setFoodType(FoodType.VEG);
        req1.setBestseller(true);
        req1.setIsPopular(false);
        MenuItemDto dto1 = menuItemService.createMenuItem(req1);
        assertTrue(dto1.isBestseller());
        assertFalse(dto1.isPopular());

        // Combo 2: Bestseller=false, Popular=true
        MenuItemCreateUpdateRequest req2 = new MenuItemCreateUpdateRequest();
        req2.setName("Dish B - Popular Only");
        req2.setCategoryId(cat.getId());
        req2.setPrice(new BigDecimal("120.00"));
        req2.setFoodType(FoodType.VEG);
        req2.setBestseller(false);
        req2.setIsPopular(true);
        MenuItemDto dto2 = menuItemService.createMenuItem(req2);
        assertFalse(dto2.isBestseller());
        assertTrue(dto2.isPopular());

        // Verify public popular list contains Dish B but NOT Dish A
        List<MenuItemDto> popularList = menuItemService.getPopularMenuItems();
        assertTrue(popularList.stream().anyMatch(d -> d.getName().equals("Dish B - Popular Only")));
        assertFalse(popularList.stream().anyMatch(d -> d.getName().equals("Dish A - Bestseller Only")));
    }

    @Test
    @DisplayName("Enforce maximum 6 popular dishes limit")
    void testMaxSixPopularItemsEnforced() {
        // Clear any existing popular items to guarantee predictable count
        for (MenuItemDto p : menuItemService.getPopularMenuItems()) {
            menuItemService.updatePopularStatus(p.getId(), false, null);
        }

        List<CategoryDto> categories = categoryService.getAllCategoriesForOwner();
        CategoryDto cat = categories.get(0);

        // Add 6 popular dishes
        for (int i = 0; i < 6; i++) {
            MenuItemCreateUpdateRequest req = new MenuItemCreateUpdateRequest();
            req.setName("Extra Popular Dish " + i);
            req.setCategoryId(cat.getId());
            req.setPrice(new BigDecimal("100.00"));
            req.setFoodType(FoodType.VEG);
            req.setIsPopular(true);
            menuItemService.createMenuItem(req);
        }

        assertEquals(6, menuItemService.getPopularMenuItems().size(), "Should have exactly 6 popular items");

        // Attempting to add a 7th popular dish must fail with clear exception message
        MenuItemCreateUpdateRequest req7 = new MenuItemCreateUpdateRequest();
        req7.setName("7th Popular Dish");
        req7.setCategoryId(cat.getId());
        req7.setPrice(new BigDecimal("100.00"));
        req7.setFoodType(FoodType.VEG);
        req7.setIsPopular(true);

        IllegalStateException ex = assertThrows(IllegalStateException.class, () -> menuItemService.createMenuItem(req7));
        assertTrue(ex.getMessage().contains("6 dishes"), "Exception message should mention 6 dishes limit");
    }

    @Test
    @DisplayName("Deleting a popular menu item safely removes it from popular without orphan records")
    void testDeletedPopularItemDoesNotLeaveOrphan() {
        List<CategoryDto> categories = categoryService.getAllCategoriesForOwner();
        CategoryDto cat = categories.get(0);

        // Create a popular item specifically for deletion test
        MenuItemCreateUpdateRequest req = new MenuItemCreateUpdateRequest();
        req.setName("Dish To Delete From Popular");
        req.setCategoryId(cat.getId());
        req.setPrice(new BigDecimal("110.00"));
        req.setFoodType(FoodType.VEG);
        req.setIsPopular(true);
        req.setPopularDisplayOrder(1);

        MenuItemDto created = menuItemService.createMenuItem(req);
        assertTrue(menuItemService.getPopularMenuItems().stream().anyMatch(d -> d.getId().equals(created.getId())));

        // Delete the dish
        menuItemService.deleteMenuItem(created.getId());

        List<MenuItemDto> updatedPopular = menuItemService.getPopularMenuItems();
        assertFalse(updatedPopular.stream().anyMatch(d -> d.getId().equals(created.getId())),
                "Soft-deleted dish must not appear in popular items list");
    }

    @Test
    @DisplayName("Discount calculations: Percentage and Fixed discounts, and independent Bestseller/Popular badges")
    void testDiscountCalculationsAndCombinations() {
        List<CategoryDto> categories = categoryService.getAllCategoriesForOwner();
        CategoryDto cat = categories.get(0);

        // 1. No discount -> effective price equals base price
        MenuItemCreateUpdateRequest req1 = new MenuItemCreateUpdateRequest();
        req1.setName("Regular Item Without Discount");
        req1.setCategoryId(cat.getId());
        req1.setPrice(new BigDecimal("200.00"));
        req1.setFoodType(FoodType.VEG);
        req1.setDiscountEnabled(false);

        MenuItemDto item1 = menuItemService.createMenuItem(req1);
        assertEquals(new BigDecimal("200.00"), item1.getPrice());
        assertEquals(new BigDecimal("200.00"), item1.getEffectivePrice());
        assertEquals(new BigDecimal("0.00"), item1.getDiscountAmount());

        // 2. 10% discount on ₹200 item -> ₹20 off, ₹180 final
        MenuItemCreateUpdateRequest req2 = new MenuItemCreateUpdateRequest();
        req2.setName("10 Percent Discount Item");
        req2.setCategoryId(cat.getId());
        req2.setPrice(new BigDecimal("200.00"));
        req2.setFoodType(FoodType.NON_VEG);
        req2.setDiscountEnabled(true);
        req2.setDiscountType(com.tryitcafe.model.enums.DiscountType.PERCENTAGE);
        req2.setDiscountValue(new BigDecimal("10.00"));
        req2.setBestseller(false);
        req2.setIsPopular(true);
        req2.setPopularDisplayOrder(4);

        MenuItemDto item2 = menuItemService.createMenuItem(req2);
        assertTrue(item2.isDiscountEnabled());
        assertEquals(com.tryitcafe.model.enums.DiscountType.PERCENTAGE, item2.getDiscountType());
        assertEquals(new BigDecimal("20.00"), item2.getDiscountAmount());
        assertEquals(new BigDecimal("180.00"), item2.getEffectivePrice());
        assertEquals(new BigDecimal("200.00"), item2.getPrice(), "Base price must remain unchanged");
        assertTrue(item2.isPopular(), "Popular should be true independently");
        assertFalse(item2.isBestseller(), "Bestseller should be false independently");

        // 3. 50% discount on ₹200 item -> ₹100 off, ₹100 final
        req2.setDiscountValue(new BigDecimal("50.00"));
        req2.setBestseller(true);
        MenuItemDto item3 = menuItemService.updateMenuItem(item2.getId(), req2);
        assertEquals(new BigDecimal("100.00"), item3.getDiscountAmount());
        assertEquals(new BigDecimal("100.00"), item3.getEffectivePrice());
        assertTrue(item3.isBestseller(), "Bestseller and discount coexist");

        // 4. Fixed discount of ₹30 on ₹200 item -> ₹170 final
        MenuItemCreateUpdateRequest reqFixed = new MenuItemCreateUpdateRequest();
        reqFixed.setName("Fixed Discount Item");
        reqFixed.setCategoryId(cat.getId());
        reqFixed.setPrice(new BigDecimal("200.00"));
        reqFixed.setFoodType(FoodType.EGG);
        reqFixed.setDiscountEnabled(true);
        reqFixed.setDiscountType(com.tryitcafe.model.enums.DiscountType.FIXED);
        reqFixed.setDiscountValue(new BigDecimal("30.00"));

        MenuItemDto fixedItem = menuItemService.createMenuItem(reqFixed);
        assertEquals(new BigDecimal("30.00"), fixedItem.getDiscountAmount());
        assertEquals(new BigDecimal("170.00"), fixedItem.getEffectivePrice());
    }

    @Test
    @DisplayName("Discount validations: Reject 100%, negative, and fixed >= price")
    void testDiscountValidations() {
        List<CategoryDto> categories = categoryService.getAllCategoriesForOwner();
        CategoryDto cat = categories.get(0);

        MenuItemCreateUpdateRequest invalidReq = new MenuItemCreateUpdateRequest();
        invalidReq.setName("Invalid Discount Item");
        invalidReq.setCategoryId(cat.getId());
        invalidReq.setPrice(new BigDecimal("100.00"));
        invalidReq.setFoodType(FoodType.VEG);
        invalidReq.setDiscountEnabled(true);

        // A. 100% percentage discount rejected
        invalidReq.setDiscountType(com.tryitcafe.model.enums.DiscountType.PERCENTAGE);
        invalidReq.setDiscountValue(new BigDecimal("100.00"));
        assertThrows(com.tryitcafe.exception.BadRequestException.class, () -> menuItemService.createMenuItem(invalidReq));

        // B. Negative discount value rejected
        invalidReq.setDiscountValue(new BigDecimal("-5.00"));
        assertThrows(com.tryitcafe.exception.BadRequestException.class, () -> menuItemService.createMenuItem(invalidReq));

        // C. Fixed discount equal to base price rejected
        invalidReq.setDiscountType(com.tryitcafe.model.enums.DiscountType.FIXED);
        invalidReq.setDiscountValue(new BigDecimal("100.00"));
        assertThrows(com.tryitcafe.exception.BadRequestException.class, () -> menuItemService.createMenuItem(invalidReq));

        // D. Fixed discount greater than base price rejected
        invalidReq.setDiscountValue(new BigDecimal("150.00"));
        assertThrows(com.tryitcafe.exception.BadRequestException.class, () -> menuItemService.createMenuItem(invalidReq));
    }
}
