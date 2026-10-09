# TryIt Cafe & Kitchen — Production Environment Variables Guide

**Date:** 2026-10-09  
**Security Level:** Production Reference Template (Contains No Live Secrets)

---

## 1. Summary of Architecture Separation

- **Frontend (Vercel)**: Only browser-safe variables prefixed with `VITE_` are provided to client bundle execution. Secrets such as JWT keys, database passwords, and Cloudinary secrets are **never** injected into the frontend.
- **Backend (Railway)**: Contains server-side runtime secrets, database credentials, Cloudinary API secrets, and server configuration.

---

## 2. Vercel Frontend Environment Variables

Configure these in **Vercel Dashboard > Project Settings > Environment Variables**:

| Variable Name | Required / Optional | Service | Example Format / Placeholder | Requires Redeploy | Safe Validation Method |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `VITE_API_BASE_URL` | **Required** | Vercel (Client) | `https://tryit-cafe-kitchen-production.up.railway.app/api/v1` | **Yes** (Build-time) | Inspect network tab in browser; requests to `/public/menu` must hit Railway domain. |
| `VITE_GOOGLE_CLIENT_ID` | **Required** *(for Google Login)* | Vercel (Client) | `<your-google-oauth-client-id>.apps.googleusercontent.com` | **Yes** (Build-time) | Click "Sign in with Google"; GIS prompt renders without configuration warning. |
| `VITE_GOOGLE_MAPS_API_KEY` | **Optional** *(Delivery Map)* | Vercel (Client) | `AIzaSy<your-google-maps-api-key>` | **Yes** (Build-time) | Delivery address pin map renders interactively during checkout. |
| `VITE_CAFE_WHATSAPP_NUMBER` | **Required** | Vercel (Client) | `8977774885` | **Yes** (Build-time) | Click "Order on WhatsApp" and verify target phone in URL. |
| `VITE_CAFE_PHONE_NUMBER` | **Required** | Vercel (Client) | `+918977774885` | **Yes** (Build-time) | Check call links in header and footer. |
| `VITE_CAFE_EMAIL` | **Required** | Vercel (Client) | `tryit.cafekichen@gmail.com` | **Yes** (Build-time) | Check support email link in footer. |
| `VITE_CAFE_INSTAGRAM_URL` | **Required** | Vercel (Client) | `https://instagram.com/tryit.cafe_kitchen` | **Yes** (Build-time) | Click Instagram icon in footer. |
| `VITE_CAFE_INSTAGRAM_HANDLE`| **Required** | Vercel (Client) | `@tryit.cafe_kitchen` | **Yes** (Build-time) | Text displayed in social section. |

---

## 3. Railway Backend Environment Variables

Configure these in **Railway Dashboard > `tryit-backend` > Variables**:

| Variable Name | Required / Optional | Service | Example Format / Placeholder | Requires Redeploy | Safe Validation Method |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `SPRING_PROFILES_ACTIVE` | **Required** | Railway (Backend) | `prod` | **Yes** | Log output displays `The following 1 profile is active: "prod"`. |
| `PORT` | **Automatic** | Railway (Backend) | `8080` (Injected by Railway) | **No** | Tomcat binds dynamically to `${PORT}` without port conflicts. |
| `DATABASE_URL` | **Required** | Railway (Backend) | `jdbc:postgresql://<host>:5432/<db>?sslmode=require` or `postgresql://<user>:<pass>@<host>:5432/<db>` | **Yes** | Log shows `Enforced SSL transport (sslmode=require) on PostgreSQL JDBC connection`. |
| `DATABASE_USERNAME` | **Required** *(if not in URI)* | Railway (Backend) | `postgres.<project-ref>` | **Yes** | Flyway schema check succeeds. |
| `DATABASE_PASSWORD` | **Required** *(if not in URI)* | Railway (Backend) | `<your-database-password>` | **Yes** | Log shows `Flyway schema history validated`. |
| `JWT_SECRET` | **Required** | Railway (Backend) | `<secure-256-bit-random-hex-at-least-32-chars>` | **Yes** | `EnvironmentConfigValidator` passes during startup. |
| `JWT_EXPIRATION_MS` | **Required** | Railway (Backend) | `86400000` (24 hours) | **Yes** | Login response returns token with standard 24h expiry claim. |
| `CORS_ALLOWED_ORIGINS` | **Required** | Railway (Backend) | `https://tryit-cafe-kitchen.vercel.app` | **Yes** | Browser requests from Vercel origin do not trigger CORS preflight errors. |
| `CLOUDINARY_CLOUD_NAME` | **Required** | Railway (Backend) | `<your-cloudinary-cloud-name>` | **Yes** | Image upload in Owner Portal returns CDN URL. |
| `CLOUDINARY_API_KEY` | **Required** | Railway (Backend) | `<your-cloudinary-api-key>` | **Yes** | Media upload authentication succeeds. |
| `CLOUDINARY_API_SECRET` | **Required** | Railway (Backend) | `<your-cloudinary-api-secret>` | **Yes** | Server-side signature validation succeeds. |
| `ALLOW_LOCAL_MEDIA_FALLBACK` | **Required** | Railway (Backend) | `false` | **Yes** | Disallows ephemeral container filesystem uploads. |
| `GOOGLE_CLIENT_ID` | **Required** *(for Google Login)* | Railway (Backend) | `<matches-frontend-client-id>.apps.googleusercontent.com` | **Yes** | Google ID token verification matches `aud` claim without rejection. |
| `GOOGLE_CLIENT_SECRET` | **Optional** | Railway (Backend) | `<your-google-client-secret>` | **Yes** | Server token exchange if offline access is enabled. |
| `APP_SEED_ENABLED` | **Required** | Railway (Backend) | `false` | **Yes** | Logs show `Initial data seeding disabled by configuration`. |
| `APP_SEED_SAMPLE_DATA` | **Required** | Railway (Backend) | `false` | **Yes** | Strict startup validator fails if set to `true`. |
| `OWNER_INITIAL_PHONE` | **Optional** *(Bootstrap only)* | Railway (Backend) | `8977774885` | **Yes** | Initial setup only; ignored once owner account is present. |
| `OWNER_INITIAL_PASSWORD` | **Optional** *(Bootstrap only)* | Railway (Backend) | `<strong-owner-password>` | **Yes** | BCrypt hashed on first boot; ignored on subsequent restarts. |
| `WHATSAPP_NUMBER` | **Required** | Railway (Backend) | `8977774885` | **Yes** | Order WhatsApp message routing. |
| `SUPPORT_EMAIL` | **Required** | Railway (Backend) | `tryit.cafekichen@gmail.com` | **Yes** | Customer inquiry recipient. |

---

## 4. Renamed and Standardized Variables

To prevent naming collisions and confusion between frameworks, the following aliases were unified:
- `VITE_API_BASE_URL` is canonical across all frontend API clients (replacing legacy `VITE_API_URL`).
- `DATABASE_URL` is parsed by `DatabaseConfigNormalizer.java` to support both native Supabase/Heroku URI format (`postgresql://...`) and Spring Boot JDBC URL format (`jdbc:postgresql://...`).
