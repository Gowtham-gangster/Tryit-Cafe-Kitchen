# Tryit Cafe & Kitchen — Development Sample Data Report

**Generated Date:** October 8, 2026  
**Target Environment:** Development Database (Supabase PostgreSQL `aws-0-ap-northeast-1.pooler.supabase.com`)  
**Status:** Complete & Verified  

---

## 1. Executive Summary

A comprehensive, realistic development dataset has been seeded into the Tryit Cafe & Kitchen development database. The seeding strictly respected:
- Zero modifications to database architecture, tables, or Flyway migrations.
- Complete adherence to existing backend entity validations, domain constraints, and service rules.
- Execution via authenticated REST endpoints (`POST /api/v1/owner/...` and customer flows).
- Zero fake Cloudinary / Unsplash URLs created (Menu items fallback to `/Hero.jpg` as designed; Gallery media uploaded directly to Cloudinary CDN via backend authenticated API).
- Production automated sample seeding remains permanently disabled (`app.seed-sample-data: false`).
- Full idempotency check confirmed: running the dataset seeder again generates zero duplicates.

---

## 2. Records Created per Table

| Database Table | Record Count | Notes / Status |
| :--- | :--- | :--- |
| `categories` | **10** | All requested categories in exact sequence (Quick Bites to Shakes) |
| `menu_items` | **36** | 19 VEG, 13 NON_VEG, 4 EGG dishes across 10 categories |
| `offers` | **4** | 4 active promotional development deals (percentage & flat off) |
| `reviews` | **4** | Demo Customer 1–4 ratings (5, 5, 5, 4 stars), status `APPROVED` |
| `gallery_items` | **1** | Real Cloudinary image upload via Owner Dashboard workflow |
| `business_settings` | **1** | Updated with real store info, GPS coordinates, delivery rules |
| `business_hours` | **7** | Monday through Sunday, 03:00 PM – 11:30 PM (`15:00` - `23:30`) |
| `users` (Demo Customers) | **4** | Dedicated accounts registered for realistic review generation |
| `customer_locations` | **2** | Geo-coordinates for testing free radius & distance delivery fees |

---

## 3. Dataset Breakdown & Verification

### 3.1 Categories (10 Total)
1. **Quick Bites** (Slug: `quick-bites`, Order: 1, 6 items)
2. **Fast Food** (Slug: `fast-food`, Order: 2, 6 items)
3. **Rice Bowls** (Slug: `rice-bowls`, Order: 3, 5 items)
4. **Fried Rice** (Slug: `fried-rice`, Order: 4, 4 items)
5. **Pasta** (Slug: `pasta`, Order: 5, 4 items)
6. **Biryanis** (Slug: `biryanis`, Order: 6, 4 items)
7. **Bagara Rice Combos** (Slug: `bagara-rice-combos`, Order: 7, 4 items)
8. **Combos** (Slug: `combos`, Order: 8, 3 items)
9. **Beverages** (Slug: `beverages`, Order: 9, 0 items)
10. **Shakes** (Slug: `shakes`, Order: 10, 0 items)

### 3.2 Menu Items (36 Total)
All 36 items created with exact prices, dietary classification, short descriptions, and clean `/Hero.jpg` fallback:
- **Quick Bites (6):** Onion Pakoda (₹70, VEG), Veg Roll (₹80, VEG), Chicken Pakoda (₹90, NON_VEG), Bread Omelette (₹80, EGG), Egg Roll (₹100, EGG), Chicken Roll (₹120, NON_VEG).
- **Fast Food (6):** Veg Burger (₹110, VEG), Veg Sandwich (₹110, VEG), Veg Nuggets (₹80, VEG), Chicken Burger (₹130, NON_VEG), Chicken Sandwich (₹130, NON_VEG), Chicken Nuggets (₹100, NON_VEG).
- **Rice Bowls (5):** Curd Rice (₹80, VEG), Lemon Rice (₹80, VEG), Jeera Rice (₹80, VEG), Gongura Pickle Rice (₹80, VEG), Avakaya Rice (₹80, VEG).
- **Fried Rice (4):** Veg Fried Rice (₹100, VEG), Mushroom Fried Rice (₹100, VEG), Egg Fried Rice (₹80, EGG), Chicken Fried Rice (₹90, NON_VEG).
- **Pasta (4):** Veg Alfredo Penne Pasta (₹80, VEG), Veg Red Sauce Penne Pasta (₹90, VEG), Chicken Alfredo Penne Pasta (₹90, NON_VEG), Chicken Red Sauce Penne Pasta (₹100, NON_VEG).
- **Biryanis (4):** Veg Biryani (₹80, VEG), Mushroom Biryani (₹90, VEG), Paneer Biryani (₹90, VEG), Chicken Biryani (₹100, NON_VEG).
- **Bagara Rice Combos (4):** Bagara Rice with Chicken Fry (₹90, NON_VEG), Bagara Rice with Mutton Curry (₹100, NON_VEG), Bagara Rice with Mushroom Curry (₹100, VEG), Bagara Rice with Paneer Curry (₹100, VEG).
- **Combos (3):** Egg Roll with Oreo Shake (₹100, EGG), Chicken Roll with Chicken Nuggets (₹130, NON_VEG), Burger Drink Combo (₹140, NON_VEG).

#### Dietary Classification Distribution:
- **Vegetarian (`VEG`):** 19 items
- **Non-Vegetarian (`NON_VEG`):** 13 items
- **Egg (`EGG`):** 4 items
- **Bestsellers:** 15 items balanced across categories
- **Popular Showcase Dishes:** Exactly 6 dishes flagged as `isPopular: true` (complying with the backend constraint `count <= 6`)

### 3.3 Development Offers (4 Total)
1. **Chicken Burger Combo**
   - *Description:* Chicken Burger + Chicken Nuggets + Drink
   - *Discount:* 15% (`PERCENTAGE`)
   - *Status:* Active / Demo
2. **Evening Snack Deal**
   - *Description:* Chicken Roll + Chicken Nuggets
   - *Discount:* ₹30 OFF (`FLAT`)
   - *Status:* Active / Demo
3. **Veg Treat**
   - *Description:* Veg Burger + Drink
   - *Discount:* 10% (`PERCENTAGE`)
   - *Status:* Active / Demo
4. **Weekend Special**
   - *Description:* Selected cafe favourites
   - *Discount:* 20% (`PERCENTAGE`)
   - *Status:* Active / Demo

### 3.4 Development Customer Reviews (4 Total)
1. **Demo Customer 1** | Rating: 5/5 | *“Super fresh food and quick service! The Chicken Burger and fries were top notch.”* (Approved)
2. **Demo Customer 2** | Rating: 5/5 | *“Loved the Bagara rice combo. Authentic Hyderabad flavours at very reasonable prices.”* (Approved)
3. **Demo Customer 3** | Rating: 5/5 | *“Great cafe ambiance and delicious pasta. Chicken Alfredo was creamy and satisfying.”* (Approved)
4. **Demo Customer 4** | Rating: 4/5 | *“Good variety on the menu. Evening snacks and rolls are great for quick bites.”* (Approved)

### 3.5 Gallery Media (1 Total)
- **Upload Flow:** Owner Dashboard Authenticated Multipart Upload via `POST /api/v1/owner/upload-media`
- **Cloudinary CDN URL:** `https://res.cloudinary.com/jqwx7wdo/image/upload/v1791478054/tryit_cafe/gallery/ulzgiupq0coxesmoimuw.jpg`
- **Public ID:** `tryit_cafe/gallery/ulzgiupq0coxesmoimuw`
- **Title:** "Tryit Cafe & Kitchen Welcome"
- **Status:** Active, visible on Customer Homepage / Gallery

### 3.6 Business Settings Status
- **Business Name:** Tryit Cafe & Kitchen
- **Phone Number:** `8977774885`
- **WhatsApp Number:** `8977774885`
- **Contact Email:** `tryit.cafekichen@gmail.com`
- **Instagram Profile:** `https://instagram.com/tryit.cafe_kitchen`
- **Full Address:** Back side Union Bank, H No 3-127/2, Hyderabad - Narsapur Road, Ganesh Nagar, Gandi Maisamma, Hyderabad, Telangana 500043
- **GPS Coordinates:**
  - Latitude: `17.57651209843505`
  - Longitude: `78.42005183478837`
- **Ordering Channels:** Online Ordering: `OPEN`, Delivery: `ENABLED`, Takeaway: `ENABLED`
- **Delivery Calculation Rules:**
  - Free delivery radius: **3.0 KM**
  - Delivery charge: **₹5.00 × distance (KM)** beyond free radius

### 3.7 Business Hours Status
- **Schedule:** Monday – Sunday (All 7 Days)
- **Open Time:** `15:00` (03:00 PM)
- **Close Time:** `23:30` (11:30 PM)
- **Closed Days:** None (Open 7 days a week)
- **Frontend Display:** Formatted in 12-hour AM/PM format ("03:00 PM - 11:30 PM")

---

## 4. Verification & Testing

### 4.1 Filter, Search & Sort Verification
Tested against live endpoints with [scripts/test-filters.mjs](file:///d:/Sunday%20Sessions/Tryit%20Cafe%20Website/scripts/test-filters.mjs):
- **Food Type Filtering:**
  - `foodType=VEG`: Returned 19 items (100% VEG match).
  - `foodType=NON_VEG`: Returned 13 items (100% NON_VEG match).
  - `foodType=EGG`: Returned 4 items (100% EGG match).
- **Bestseller Filtering:**
  - `bestseller=true`: Returned 15 items (100% Bestseller match).
- **Search Query Filtering:**
  - Search `"burger"`: Returned 2 items (Veg Burger, Chicken Burger).
  - Search `"pakoda"`: Returned 2 items (Onion Pakoda, Chicken Pakoda).
  - Search `"biryani"`: Returned 4 items (Veg, Mushroom, Paneer, Chicken Biryanis).
- **Category Filtering:**
  - Category `"Quick Bites"`: Returned 6 items.
  - Category `"Bagara Rice Combos"`: Returned 4 items.
- **Price Sorting:** Verified ascending (₹70 -> ₹140) and descending (₹140 -> ₹70).

### 4.2 Cart, Checkout & Delivery Fee Engine Verification
Tested against checkout calculations with [scripts/test-cart-checkout.mjs](file:///d:/Sunday%20Sessions/Tryit%20Cafe%20Website/scripts/test-cart-checkout.mjs):
- **Within Free Delivery Radius (0.11 KM from Cafe):**
  - Distance: `0.11 KM` (<= 3.0 KM threshold)
  - Delivery Fee: **₹0.00** (Free delivery applied)
- **Outside Free Delivery Radius (6.07 KM from Cafe):**
  - Distance: `6.07 KM` (> 3.0 KM threshold)
  - Calculated Delivery Fee: **₹30.37** (6.074 × ₹5.00)
- **Takeaway Order Mode:**
  - Delivery Fee: **₹0.00** (Bypasses delivery calculation)
- **WhatsApp Order Summary Link:** Verified proper generation with customer name, items, breakdown, address, and Google Maps coordinate pin.

### 4.3 Idempotency & Duplicate Check
Re-ran the seeder script [scripts/populate-dev-data.mjs](file:///d:/Sunday%20Sessions/Tryit%20Cafe%20Website/scripts/populate-dev-data.mjs):
- Categories checked: 10 existing, 0 created
- Dishes checked: 36 existing, 0 created
- Offers checked: 4 existing, 0 created
- Reviews checked: 4 existing, 0 created
- Duplicate count: **0 duplicates found or created**

### 4.4 Automated Test Suite Results
1. **Backend Integration & Unit Tests (`mvn clean test`):**
   ```
   [INFO] Tests run: 86, Failures: 0, Errors: 0, Skipped: 0
   [INFO] BUILD SUCCESS
   ```
   All security hardening, rate limiting, Supabase schema validation, repository queries, and service tests passed cleanly.

2. **Frontend Production Build (`npm run build`):**
   ```
   vite v6.4.1 building for production...
   dist/index.html                   1.13 kB │ gzip:   0.50 kB
   dist/assets/index-*.css          40.91 kB │ gzip:   8.22 kB
   dist/assets/index-*.js          503.24 kB │ gzip: 147.16 kB
   ✓ built in 2.71s
   ```
   Zero TypeScript/JSX compiler warnings or errors.

---

## 5. Security & Production Guardrails

1. **Production Seeding Disabled:** `app.seed-sample-data` remains set to `false` in `backend/src/main/resources/application.yml` and environment configurations.
2. **PostgreSQL Compatibility Patch:** Updated [`MenuItemRepository.java`](file:///d:/Sunday%20Sessions/Tryit%20Cafe%20Website/backend/src/main/java/com/tryitcafe/repository/MenuItemRepository.java) to cast search string parameters (`CAST(:search AS string)`), preventing PostgreSQL `ERROR: function lower(bytea) does not exist` when handling untyped null parameters.
3. **No Fake URLs:** All images strictly respect authentic asset locations (real Cloudinary media URLs or local `/Hero.jpg` placeholder). No mock Unsplash, localhost uploads, or fake CDN links exist in the database.
