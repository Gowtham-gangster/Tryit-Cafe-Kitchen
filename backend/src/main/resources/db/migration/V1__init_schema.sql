-- ==============================================================================
-- TRYIT CAFE & KITCHEN — PRODUCTION RELATIONAL DATABASE SCHEMA (V1)
-- CLEAN ARCHITECTURE & NORMALIZED SOURCE OF TRUTH
-- Compatible with PostgreSQL 15+ and Hibernate 6.5+ ddl-auto=validate
-- ==============================================================================

-- 1. Users Table (Customer & Owner Unified Authentication)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    phone VARCHAR(20) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE,
    password_hash VARCHAR(255),
    role VARCHAR(30) NOT NULL DEFAULT 'ROLE_CUSTOMER',
    profile_image_url VARCHAR(500),
    auth_provider VARCHAR(30) NOT NULL DEFAULT 'LOCAL',
    google_subject VARCHAR(100) UNIQUE,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_user_google_sub ON users(google_subject);
CREATE INDEX IF NOT EXISTS idx_user_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. Menu Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500),
    display_order INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_category_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_category_order ON categories(display_order);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(active);

-- 3. Menu Items Table
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    description TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    food_type VARCHAR(20) NOT NULL DEFAULT 'VEG',
    image_url VARCHAR(500),
    image_public_id VARCHAR(200),
    available BOOLEAN NOT NULL DEFAULT TRUE,
    bestseller BOOLEAN NOT NULL DEFAULT FALSE,
    is_new BOOLEAN NOT NULL DEFAULT FALSE,
    is_popular BOOLEAN NOT NULL DEFAULT FALSE,
    popular_display_order INTEGER NOT NULL DEFAULT 0,
    discount_enabled BOOLEAN NOT NULL DEFAULT FALSE,
    discount_type VARCHAR(20),
    discount_value NUMERIC(10, 2) CHECK (discount_value IS NULL OR discount_value >= 0),
    display_order INTEGER NOT NULL DEFAULT 0,
    deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_menu_item_slug ON menu_items(slug);
CREATE INDEX IF NOT EXISTS idx_menu_item_category ON menu_items(category_id);
CREATE INDEX IF NOT EXISTS idx_menu_item_available ON menu_items(available);
CREATE INDEX IF NOT EXISTS idx_menu_item_deleted ON menu_items(deleted);
CREATE INDEX IF NOT EXISTS idx_menu_items_food_type ON menu_items(food_type);
CREATE INDEX IF NOT EXISTS idx_menu_items_is_popular ON menu_items(is_popular);
CREATE INDEX IF NOT EXISTS idx_menu_items_discount_enabled ON menu_items(discount_enabled);

-- Menu Performance Composite Indexes
CREATE INDEX IF NOT EXISTS idx_menu_items_active_avail_order ON menu_items(deleted, available, display_order);
CREATE INDEX IF NOT EXISTS idx_menu_items_active_popular_order ON menu_items(deleted, is_popular, popular_display_order, display_order);
CREATE INDEX IF NOT EXISTS idx_menu_items_cat_deleted_order ON menu_items(category_id, deleted, display_order);

-- 4. Offers & Promotions Table
CREATE TABLE IF NOT EXISTS offers (
    id UUID PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    badge_text VARCHAR(50),
    description TEXT,
    discount_type VARCHAR(30) NOT NULL DEFAULT 'PROMO_TEXT',
    discount_value NUMERIC(10, 2) CHECK (discount_value IS NULL OR discount_value >= 0),
    min_order_amount NUMERIC(10, 2) CHECK (min_order_amount IS NULL OR min_order_amount >= 0),
    banner_image_url VARCHAR(500),
    banner_public_id VARCHAR(200),
    start_date TIMESTAMP WITHOUT TIME ZONE,
    end_date TIMESTAMP WITHOUT TIME ZONE,
    display_order INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_offer_active ON offers(active);
CREATE INDEX IF NOT EXISTS idx_offers_active_display_order ON offers(active, display_order ASC);

-- 5. Cafe Gallery Items Table
CREATE TABLE IF NOT EXISTS gallery_items (
    id UUID PRIMARY KEY,
    title VARCHAR(150),
    caption TEXT,
    category_tag VARCHAR(50) NOT NULL DEFAULT 'AMBIENCE',
    media_type VARCHAR(20) NOT NULL DEFAULT 'IMAGE',
    media_url VARCHAR(500) NOT NULL,
    media_public_id VARCHAR(200),
    thumbnail_url VARCHAR(500),
    display_order INTEGER NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_gallery_category_tag ON gallery_items(category_tag);
CREATE INDEX IF NOT EXISTS idx_gallery_active ON gallery_items(active);
CREATE INDEX IF NOT EXISTS idx_gallery_active_display_order ON gallery_items(active, display_order ASC, created_at DESC);

-- 6. Customer Reviews Table (Moderated)
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(100) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status_created_at ON reviews(status, created_at DESC);

-- 7. Business Settings Table (Single Source of Cafe Info)
CREATE TABLE IF NOT EXISTS business_settings (
    id UUID PRIMARY KEY,
    cafe_name VARCHAR(150) NOT NULL DEFAULT 'TryIt Cafe & Kitchen',
    tagline VARCHAR(200) DEFAULT 'Delicious Food, Cozy Ambience, Unforgettable Flavours',
    about_text TEXT,
    hero_heading VARCHAR(200) DEFAULT 'Craving Delicious Bites & Warm Moments?',
    hero_subheading TEXT DEFAULT 'Experience authentic café flavors, crafted with passion. Order your favorite dishes directly via WhatsApp!',
    hero_media_url VARCHAR(500),
    hero_media_type VARCHAR(20) DEFAULT 'IMAGE',
    hero_media_public_id VARCHAR(200),
    phone_number VARCHAR(100) DEFAULT '',
    whatsapp_number VARCHAR(50) NOT NULL DEFAULT '',
    email VARCHAR(200) DEFAULT '',
    instagram_url VARCHAR(500) DEFAULT '',
    address TEXT DEFAULT 'Back side Union Bank, H No 3-127/2, Hyderabad - Narsapur Rd, Ganesh Nagar, Gandi Maisamma, Hyderabad, Telangana 500043',
    plus_code VARCHAR(50) DEFAULT 'HCGC+FM Hyderabad, Telangana',
    google_maps_embed_url TEXT,
    google_maps_link VARCHAR(500),
    display_rating NUMERIC(3, 1) DEFAULT 4.9,
    display_review_count INTEGER DEFAULT 50,
    price_range_text VARCHAR(50) DEFAULT '₹1–200 per person',
    online_ordering_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    closure_message TEXT,
    next_opening_time VARCHAR(50),
    cafe_latitude DOUBLE PRECISION DEFAULT 17.5752766,
    cafe_longitude DOUBLE PRECISION DEFAULT 78.4211027,
    free_delivery_distance_km DOUBLE PRECISION DEFAULT 3.0,
    delivery_rate_per_km NUMERIC(10, 2) DEFAULT 5.00,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. Business Operating Hours Table
CREATE TABLE IF NOT EXISTS business_hours (
    id UUID PRIMARY KEY,
    business_settings_id UUID REFERENCES business_settings(id) ON DELETE CASCADE,
    day_of_week VARCHAR(20) NOT NULL,
    open_time TIME,
    close_time TIME,
    closed BOOLEAN NOT NULL DEFAULT FALSE,
    day_order INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_business_hours_day_order ON business_hours(day_order);
CREATE INDEX IF NOT EXISTS idx_business_hours_settings ON business_hours(business_settings_id);

-- 9. Customer Carts Table
CREATE TABLE IF NOT EXISTS carts (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_carts_user_id ON carts(user_id);

-- 10. Relational Cart Items Table
CREATE TABLE IF NOT EXISTS cart_items (
    id UUID PRIMARY KEY,
    cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    menu_item_id UUID NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL CHECK (quantity >= 1),
    special_instruction VARCHAR(500),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_menu_item_id ON cart_items(menu_item_id);

-- 11. Customer Saved Delivery Locations Table
CREATE TABLE IF NOT EXISTS customer_locations (
    id UUID PRIMARY KEY,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    label VARCHAR(50) NOT NULL DEFAULT 'Home',
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    is_default BOOLEAN NOT NULL DEFAULT FALSE,
    house_flat VARCHAR(150),
    building_name VARCHAR(150),
    street VARCHAR(200),
    area VARCHAR(150),
    landmark VARCHAR(200),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_customer_location_customer_id ON customer_locations(customer_id);
