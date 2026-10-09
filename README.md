# Tryit Cafe & Kitchen

A modern, high-performance full-stack web application for **Tryit Cafe & Kitchen**, built with **React 19**, **TypeScript**, **Vite**, **Spring Boot 3.3.5**, **PostgreSQL / Supabase**, and **Cloudinary**.

---

## 🌟 Overview

Tryit Cafe & Kitchen is a full-featured cafe ordering and operations platform featuring:
- An ultra-fast, responsive customer experience with interactive menus, promotional offers, gallery media, customer reviews, and direct WhatsApp ordering.
- A secure, real-time Owner Dashboard for menu management, live dish availability toggling, offers, photo/video gallery curation, and business hours configuration.
- Production-grade architecture deployed across **Vercel** (Frontend) and **Railway** (Backend) with **Supabase PostgreSQL** for authoritative data persistence and **Cloudinary** for media delivery.

---

## 🛠️ Technology Stack

### Frontend
- **Framework & Runtime:** React 19, TypeScript, Vite 8
- **Styling:** Tailwind CSS, Vanilla CSS
- **Animations:** Framer Motion (respecting reduced-motion preferences)
- **State Management:** Zustand (decoupled customer & owner state)
- **Icons & Forms:** Lucide React, React Hook Form, Zod
- **HTTP Client:** Axios (with unified interceptors, auth tokens, and 15s timeout protection)

### Backend
- **Framework:** Spring Boot 3.3.5 (Java 21)
- **Security:** Spring Security, JWT (`jjwt 0.12.6`), BCrypt password hashing, IP rate limiting
- **Data Persistence:** Spring Data JPA, Hibernate, HikariCP connection pooling
- **Migrations:** Flyway schema versioning
- **Database:** PostgreSQL (Supabase) in production, H2 for development & testing
- **Media Delivery:** Cloudinary Java SDK with CDN transformations

---

## 🚀 Key Features

### Customer Experience
- **Interactive Menu:** Filter by category, dietary preferences (Veg / Non-Veg / Egg), popular items, and search keywords with zero UI lag.
- **Visual Media Gallery:** Responsive photography and video gallery with Cloudinary poster snapshots, desktop hover previews, and full-screen lightbox navigation.
- **Promotions & Offers:** Live discount codes and promotional banners with automated order qualification checks.
- **Cart & WhatsApp Ordering:** Seamless cart management, instant item increment/decrement, distance-based delivery calculations, and formatted WhatsApp order transmission.
- **Customer Profiles:** Saved delivery addresses, account management, and profile customization.

### Owner Dashboard
- **Menu Management:** Create, edit, delete, and categorize dishes with instant local state updates (no full-page reloads).
- **One-Click Availability Toggle:** Instantly toggle dish availability and popular item status without multi-request cascades.
- **Offers & Discounts:** Configure percentage and flat discounts, validity dates, and minimum order values.
- **Media Curation:** Upload and replace high-resolution images and videos directly to Cloudinary with secure public IDs stored in PostgreSQL.
- **Business Operations:** Manage opening/closing hours, toggle online ordering status, and moderate customer reviews.

---

## ⚡ Performance & Synchronization Optimizations

The system has undergone rigorous performance engineering:
- **Zero Cascading Refetches:** Owner mutations update local state and invalidate targeted store nodes, reducing network requests per mutation from 7 down to 1 (-85.7%).
- **Eliminated $1+N$ Database Queries:** Category listings batch-fetch menu item counts using a single grouped aggregate query (`GROUP BY m.category.id`).
- **In-Memory Business Settings Cache:** Static business settings and ordering availability are cached in memory with atomic invalidation upon owner modification.
- **Resilient Data Fetching:** Public customer data is loaded via `Promise.allSettled`, preventing secondary section failures from interrupting menu availability.
- **On-Demand Video Streaming:** Gallery videos utilize `preload="none"` with lightweight Cloudinary-generated poster images, saving up to 98% bandwidth on initial load.
- **HTTP Edge Caching:** Public read endpoints provide standard `Cache-Control: public, max-age=15, stale-while-revalidate=60` headers for edge and browser cache acceleration.

---

## 💻 Local Development Setup

### Prerequisites
- **Java 21** or later
- **Node.js 20+** and **npm**
- **Maven 3.9+** (or included `./mvnw`)

### 1. Clone the Repository
```bash
git clone https://github.com/Gowtham-gangster/Tryit-Cafe-Kitchen.git
cd Tryit-Cafe-Kitchen
```

### 2. Backend Setup
```bash
cd backend

# Run with in-memory H2 profile (no external DB required for local dev)
mvn spring-boot:run
```
The backend API will be available at `http://localhost:8088`.

To run backend tests:
```bash
mvn test
```

### 3. Frontend Setup
```bash
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
```
The frontend will start at `http://localhost:5173`.

To verify production bundle:
```bash
npm run build
```

---

## 🔒 Security & Best Practices

- **Role-Based Access Control:** Strict owner authorization on `/api/v1/owner/**` routes via Spring Security.
- **Input Sanitization:** Multi-layer protection against SQL injection, XSS, and path traversal on media endpoints.
- **Rate Limiting:** Protects authentication and password reset endpoints against brute-force attempts.
- **Environment Confidentiality:** All database credentials, JWT secrets, and Cloudinary keys are configured via environment variables and never committed to source control.

---

## 📄 License

Proprietary — All rights reserved by **Tryit Cafe & Kitchen**.