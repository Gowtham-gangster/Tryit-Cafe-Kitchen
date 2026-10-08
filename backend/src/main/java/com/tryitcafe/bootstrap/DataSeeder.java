package com.tryitcafe.bootstrap;

import com.tryitcafe.model.entity.*;
import com.tryitcafe.model.enums.*;
import com.tryitcafe.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final MenuItemRepository menuItemRepository;
    private final OfferRepository offerRepository;
    private final GalleryItemRepository galleryItemRepository;
    private final ReviewRepository reviewRepository;
    private final BusinessSettingsRepository businessSettingsRepository;
    private final BusinessHoursRepository businessHoursRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.seed.enabled:true}")
    private boolean seedEnabled;

    @Value("${app.seed.sample-data:false}")
    private boolean seedSampleData;

    @Value("${app.seed.owner-phone:}")
    private String defaultOwnerPhone;

    @Value("${app.seed.owner-password:}")
    private String defaultOwnerPassword;

    @Value("${app.seed.customer-phone:}")
    private String defaultCustomerPhone;

    @Value("${app.seed.customer-password:}")
    private String defaultCustomerPassword;

    @Value("${app.seed.whatsapp-number:}")
    private String initialWhatsappNumber;

    @Value("${app.seed.phone-number:}")
    private String initialPhoneNumber;

    public DataSeeder(
            UserRepository userRepository,
            CategoryRepository categoryRepository,
            MenuItemRepository menuItemRepository,
            OfferRepository offerRepository,
            GalleryItemRepository galleryItemRepository,
            ReviewRepository reviewRepository,
            BusinessSettingsRepository businessSettingsRepository,
            BusinessHoursRepository businessHoursRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.userRepository = userRepository;
        this.categoryRepository = categoryRepository;
        this.menuItemRepository = menuItemRepository;
        this.offerRepository = offerRepository;
        this.galleryItemRepository = galleryItemRepository;
        this.reviewRepository = reviewRepository;
        this.businessSettingsRepository = businessSettingsRepository;
        this.businessHoursRepository = businessHoursRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (!seedEnabled) {
            log.info("Initial data seeding disabled by configuration.");
            return;
        }
        seedAccounts();
        seedBusinessSettings();
        if (seedSampleData) {
            seedMenuAndCategories();
            seedOffers();
            seedGallery();
            seedReviews();
            log.info("TryIt Cafe sample/dummy data seeding completed.");
        } else {
            log.info("TryIt Cafe clean state: Accounts & Business Settings initialized without sample/dummy data.");
        }
    }

    private void seedAccounts() {
        // Seed Owner Account when configured
        if (defaultOwnerPhone != null && !defaultOwnerPhone.isBlank() && defaultOwnerPassword != null && !defaultOwnerPassword.isBlank()) {
            if (userRepository.countByRole(UserRole.ROLE_OWNER) == 0) {
                User owner = User.builder()
                        .phone(defaultOwnerPhone)
                        .fullName("TryIt Cafe Owner")
                        .email("owner@tryitcafe.com")
                        .passwordHash(passwordEncoder.encode(defaultOwnerPassword))
                        .role(UserRole.ROLE_OWNER)
                        .active(true)
                        .build();
                userRepository.save(owner);
                log.info("Owner account provisioned from environment configuration.");
            }
        }

        // Seed Customer Test Account when configured (dev profile only)
        if (defaultCustomerPhone != null && !defaultCustomerPhone.isBlank() && defaultCustomerPassword != null && !defaultCustomerPassword.isBlank()) {
            if (userRepository.findByPhone(defaultCustomerPhone).isEmpty()) {
                User customer = User.builder()
                        .phone(defaultCustomerPhone)
                        .fullName("Demo Customer")
                        .email("customer@tryitcafe.com")
                        .passwordHash(passwordEncoder.encode(defaultCustomerPassword))
                        .role(UserRole.ROLE_CUSTOMER)
                        .active(true)
                        .build();
                userRepository.save(customer);
                log.info("Development test customer account provisioned.");
            }
        }
    }

    private void seedBusinessSettings() {
        if (businessSettingsRepository.count() == 0) {
            BusinessSettings settings = BusinessSettings.builder()
                    .cafeName("TryIt Cafe & Kitchen")
                    .tagline("Delicious Food, Cozy Ambience, Unforgettable Flavours")
                    .aboutText("TryIt Cafe & Kitchen is your neighbourhood food court and culinary sanctuary in Gandi Maisamma, Hyderabad. From crispy pakodas and hearty biryanis to authentic creamy pastas, loaded burgers, and signature shakes — every dish is crafted with fresh ingredients and real passion.")
                    .heroHeading("Taste The Moment at TryIt Cafe & Kitchen")
                    .heroSubheading("From sizzling starters & handcrafted pastas to loaded burgers & cold shakes. Browse our menu and order via WhatsApp!")
                    .heroMediaUrl("/Hero.jpg")
                    .heroMediaType("IMAGE")
                    // Real Cafe Contact & Socials
                    .phoneNumber(initialPhoneNumber != null && !initialPhoneNumber.isBlank() ? initialPhoneNumber : "8977774885")
                    .whatsappNumber(initialWhatsappNumber != null && !initialWhatsappNumber.isBlank() ? initialWhatsappNumber : "8977774885")
                    .email("tryit.cafekichen@gmail.com")
                    .instagramUrl("https://instagram.com/tryit.cafe_kitchen")
                    // Real address from Google Maps
                    .address("Back side Union Bank, H No 3-127/2, Hyderabad - Narsapur Rd, Ganesh Nagar, Gandi Maisamma, Hyderabad, Telangana 500043")
                    .plusCode("HCGC+FM Hyderabad, Telangana")
                    .googleMapsLink("https://maps.app.goo.gl/swbv6jctCUrmXMsq7")
                    .googleMapsEmbedUrl("https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3615.355248458839!2d78.42005183478837!3d17.57651209843505!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb8fea4ccf6b03%3A0xa4f2b954bdf0d4df!2sTryit%20cafe%26%20kichen!5e1!3m2!1sen!2sin!4v1787115650386!5m2!1sen!2sin")
                    // Google Maps verified data
                    .displayRating(new java.math.BigDecimal("4.9"))
                    .displayReviewCount(50)
                    .priceRangeText("\u20b91\u2013200 per person")
                    .onlineOrderingEnabled(true)
                    .cafeLatitude(17.5752766)
                    .cafeLongitude(78.4211027)
                    .freeDeliveryDistanceKm(3.0)
                    .deliveryRatePerKm(new java.math.BigDecimal("5.00"))
                    .build();

            BusinessSettings saved = businessSettingsRepository.save(settings);

            // Business hours: closing time confirmed as 11:30 PM.
            // Opening time NOT yet confirmed — defaulted to 10:00 AM until owner updates via Owner Portal.
            String[] days = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"};
            for (int i = 0; i < days.length; i++) {
                BusinessHours hours = BusinessHours.builder()
                        .businessSettings(saved)
                        .dayOfWeek(days[i])
                        .openTime(LocalTime.of(10, 0))  // PLACEHOLDER — owner must confirm opening time
                        .closeTime(LocalTime.of(23, 30)) // Confirmed: 11:30 PM
                        .closed(false)
                        .dayOrder(i)
                        .build();
                businessHoursRepository.save(hours);
            }
        }
    }

    private void seedMenuAndCategories() {
        if (categoryRepository.count() > 0) {
            return;
        }

        // Categories
        Category starters = createCategory("Starters & Quick Bites", "starters-quick-bites", "Crispy, crunchy, and savory appetizers to start your meal", 1);
        Category rolls = createCategory("Rolls & Wraps", "rolls-wraps", "Freshly rolled paratha wraps with rich fillings", 2);
        Category burgers = createCategory("Burgers & Sandwiches", "burgers-sandwiches", "Juicy patties, fresh veggies, and toasted artisan bread", 3);
        Category pastas = createCategory("Pastas", "pastas", "Creamy Alfredo & zesty Arrabbiata made with Italian herbs", 4);
        Category rice = createCategory("Rice Bowls & Mains", "rice-bowls-mains", "Comforting rice bowls, fried rice, and authentic flavors", 5);
        Category biryani = createCategory("Biryani Specials", "biryani-specials", "Slow-cooked fragrant basmati rice with aromatic spices", 6);
        Category combos = createCategory("Combos & Beverages", "combos-beverages", "Satisfying pairing deals and refreshing shakes", 7);

        // 20 Initial Items from the Cafe Pamphlet (Configurable prices subject to final owner update in Owner Portal)
        createDish(starters, "Onion Pakoda", "onion-pakoda", "Crispy golden spiced onion fritters served with tangy mint chutney and spicy sauce.", new BigDecimal("120.00"), 12, FoodType.VEG, "https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80", true, false, true, 3, 1);
        createDish(starters, "Chicken Nuggets", "chicken-nuggets", "Tender juicy chicken nuggets fried to golden perfection with garlic dip.", new BigDecimal("180.00"), 15, FoodType.NON_VEG, "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80", false, true, 2);
        createDish(starters, "Chicken Pakoda", "chicken-pakoda", "Crunchy and flavorful spiced chicken bites tossed in curry leaves and green chilies.", new BigDecimal("190.00"), 15, FoodType.NON_VEG, "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80", true, false, true, 1, 3);

        createDish(rolls, "Veg Roll", "veg-roll", "Flaky layered paratha wrap loaded with spiced sautéed veggies and tangy house sauce.", new BigDecimal("110.00"), 10, FoodType.VEG, "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80", false, false, 4);
        createDish(rolls, "Egg Roll", "egg-roll", "Double-egg layered crispy paratha with crunchy onions, lime juice, and special masala.", new BigDecimal("130.00"), 10, FoodType.EGG, "https://images.unsplash.com/photo-1606491956689-2ea866880c84?auto=format&fit=crop&w=600&q=80", false, false, true, 2, 5);

        createDish(burgers, "Veg Burger", "veg-burger", "Crispy herb potato patty topped with cheese slice, fresh lettuce, tomatoes, and house mayo.", new BigDecimal("130.00"), 12, FoodType.VEG, "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80", false, false, 6);
        createDish(burgers, "Veg Sandwich", "veg-sandwich", "Grilled sourdough filled with spiced potatoes, cucumber, cheese, and emerald mint chutney.", new BigDecimal("120.00"), 10, FoodType.VEG, "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=600&q=80", false, false, 7);
        createDish(burgers, "Chicken Burger", "chicken-burger", "Crispy seasoned fried chicken fillet topped with coleslaw, melted cheddar, and smoked chipotle mayo.", new BigDecimal("170.00"), 15, FoodType.NON_VEG, "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80", true, false, 8);
        createDish(burgers, "Chicken Sandwich", "chicken-sandwich", "Shredded smoked chicken tossed in creamy mayo and herbs, grilled with double cheese.", new BigDecimal("160.00"), 12, FoodType.NON_VEG, "https://images.unsplash.com/photo-1553909489-cd47e0907980?auto=format&fit=crop&w=600&q=80", false, false, 9);

        createDish(rice, "Curd Rice", "curd-rice", "Homestyle creamy tempered curd rice with mustard seeds, curry leaves, and ginger.", new BigDecimal("120.00"), 10, FoodType.VEG, "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80", false, false, 10);
        createDish(rice, "Lemon Rice", "lemon-rice", "Zesty aromatic turmeric rice tempered with crunchy peanuts, mustard seeds, and fresh lime.", new BigDecimal("130.00"), 10, FoodType.VEG, "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=600&q=80", false, false, 11);
        createDish(rice, "Chicken Fried Rice", "chicken-fried-rice", "Wok-tossed aromatic rice with tender chicken chunks, scrambled egg, scallions, and soy seasonings.", new BigDecimal("210.00"), 15, FoodType.NON_VEG, "https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80", true, false, 12);
        createDish(rice, "Veg Fried Rice", "veg-fried-rice", "Wok-tossed fragrant rice with garden-fresh bell peppers, carrots, beans, and spring onions.", new BigDecimal("160.00"), 12, FoodType.VEG, "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=600&q=80", false, false, 13);

        createDish(pastas, "Alfredo Pasta (Veg)", "alfredo-pasta-veg", "Penne pasta enveloped in a rich, velvety garlic parmesan cream sauce with mushrooms and broccoli.", new BigDecimal("220.00"), 18, FoodType.VEG, "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=600&q=80", true, false, 14);
        createDish(pastas, "Alfredo Pasta (Chicken)", "alfredo-pasta-chicken", "Classic creamy Alfredo penne tossed with herb-grilled chicken slices and aged parmesan.", new BigDecimal("260.00"), 18, FoodType.NON_VEG, "https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=600&q=80", true, false, 15);
        createDish(pastas, "Red Sauce Pasta (Veg)", "red-sauce-pasta-veg", "Al dente penne in a tangy sun-ripened tomato basil sauce with zucchini, olives, and bell peppers.", new BigDecimal("210.00"), 15, FoodType.VEG, "https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=600&q=80", false, false, 16);
        createDish(pastas, "Red Sauce Pasta (Chicken)", "red-sauce-pasta-chicken", "Spicy Arrabbiata pasta tossed with juicy marinated chicken pieces and grated parmesan.", new BigDecimal("250.00"), 18, FoodType.NON_VEG, "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80", false, true, 17);

        createDish(biryani, "Chicken Biryani", "chicken-biryani", "Authentic Dum Biryani with succulent chicken pieces, caramelized onions, and royal saffron aroma.", new BigDecimal("260.00"), 20, FoodType.NON_VEG, "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80", true, false, 18);
        createDish(biryani, "Veg Biryani", "veg-biryani", "Fragrant basmati rice layered with fresh paneer, garden veggies, mint, and rich biryani spices.", new BigDecimal("200.00"), 18, FoodType.VEG, "https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=600&q=80", false, false, 19);

        createDish(combos, "Egg Roll + Oreo Shake", "egg-roll-oreo-shake", "Combo special: One double-egg roll served with our decadent thick creamy Oreo blast milkshake.", new BigDecimal("230.00"), 12, FoodType.EGG, "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80", true, true, 20);
    }

    private Category createCategory(String name, String slug, String desc, int order) {
        Category category = Category.builder()
                .name(name)
                .slug(slug)
                .description(desc)
                .displayOrder(order)
                .active(true)
                .build();
        return categoryRepository.save(category);
    }

    private void createDish(Category cat, String name, String slug, String desc, BigDecimal price, int prep, FoodType type, String img, boolean bestseller, boolean isNew, int order) {
        createDish(cat, name, slug, desc, price, prep, type, img, bestseller, isNew, false, 0, order);
    }

    private void createDish(Category cat, String name, String slug, String desc, BigDecimal price, int prep, FoodType type, String img, boolean bestseller, boolean isNew, boolean isPopular, int popularOrder, int order) {
        MenuItem item = MenuItem.builder()
                .category(cat)
                .name(name)
                .slug(slug)
                .description(desc)
                .price(price)
                .foodType(type)
                .imageUrl(img)
                .available(true)
                .bestseller(bestseller)
                .isNew(isNew)
                .isPopular(isPopular)
                .popularDisplayOrder(popularOrder)
                .displayOrder(order)
                .deleted(false)
                .build();
        menuItemRepository.save(item);
    }

    private void seedOffers() {
        if (offerRepository.count() == 0) {
            Offer offer1 = Offer.builder()
                    .title("Combo Craving Deal")
                    .badgeText("SPECIAL COMBO")
                    .description("Get Flat ₹50 OFF on any 2 Pastas or Rice Bowls ordered together!")
                    .discountType(DiscountType.FLAT_AMOUNT)
                    .discountValue(new BigDecimal("50.00"))
                    .minOrderAmount(new BigDecimal("400.00"))
                    .bannerImageUrl("https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80")
                    .active(true)
                    .displayOrder(1)
                    .build();

            Offer offer2 = Offer.builder()
                    .title("Weekend Shake Delight")
                    .badgeText("WEEKEND SPECIAL")
                    .description("Free extra dip and 10% OFF on all Burgers and Rolls this weekend.")
                    .discountType(DiscountType.PERCENTAGE)
                    .discountValue(new BigDecimal("10.00"))
                    .minOrderAmount(new BigDecimal("250.00"))
                    .bannerImageUrl("https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80")
                    .active(true)
                    .displayOrder(2)
                    .build();

            offerRepository.saveAll(Arrays.asList(offer1, offer2));
        }
    }

    private void seedGallery() {
        if (galleryItemRepository.count() == 0) {
            List<GalleryItem> gallery = Arrays.asList(
                    GalleryItem.builder().mediaType(MediaType.IMAGE).mediaUrl("https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1000&q=80").title("Cozy Dining Ambience").caption("Warm ambient seating perfect for casual conversations and study sessions").categoryTag("AMBIENCE").displayOrder(1).active(true).build(),
                    GalleryItem.builder().mediaType(MediaType.IMAGE).mediaUrl("https://images.unsplash.com/photo-1559925393-8be0ec4767c8?auto=format&fit=crop&w=1000&q=80").title("Cafe Corner & Brews").caption("Our cozy corner with warm pendant lighting").categoryTag("AMBIENCE").displayOrder(2).active(true).build(),
                    GalleryItem.builder().mediaType(MediaType.IMAGE).mediaUrl("https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=1000&q=80").title("Signature Alfredo Pasta").caption("Freshly prepared creamy pasta topped with herbs").categoryTag("FOOD").displayOrder(3).active(true).build(),
                    GalleryItem.builder().mediaType(MediaType.IMAGE).mediaUrl("https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=1000&q=80").title("Gourmet Loaded Burgers").caption("Juicy hand-crafted patties with artisanal toasted buns").categoryTag("FOOD").displayOrder(4).active(true).build(),
                    GalleryItem.builder().mediaType(MediaType.IMAGE).mediaUrl("https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1000&q=80").title("Hygienic Open Kitchen").caption("Freshly cooked meals prepared with the highest hygiene standards").categoryTag("KITCHEN").displayOrder(5).active(true).build()
            );
            galleryItemRepository.saveAll(gallery);
        }
    }

    private void seedReviews() {
        if (reviewRepository.count() == 0) {
            List<Review> reviews = Arrays.asList(
                    Review.builder().customerName("Ananya S.").rating(5).comment("The Alfredo Chicken Pasta is by far the best in town! Super creamy, rich, and the cafe vibe is unmatched.").status(ReviewStatus.APPROVED).build(),
                    Review.builder().customerName("Vikram Reddy").rating(5).comment("Ordered the Egg Roll combo and Chicken Biryani on WhatsApp. The ordering process was so smooth and the food was piping hot!").status(ReviewStatus.APPROVED).build(),
                    Review.builder().customerName("Sneha Roy").rating(5).comment("Love the ambience and fast service. The Onion Pakoda with mint chutney is an absolute must-try with evening tea.").status(ReviewStatus.APPROVED).build(),
                    Review.builder().customerName("Rohit Sharma").rating(4).comment("Great taste and reasonable prices. Loved the loaded chicken burger!").status(ReviewStatus.APPROVED).build()
            );
            reviewRepository.saveAll(reviews);
        }
    }
}
