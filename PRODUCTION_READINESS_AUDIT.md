# TryIt Cafe & Kitchen — Production Readiness Audit Report

**Date:** 2026-10-09  
**Target Environment:** Vercel (Frontend), Railway (Backend), Supabase (PostgreSQL), Cloudinary (CDN)

---

## 1. Executive Summary & Inventory

This comprehensive production audit assessed the architecture, security postures, environment variables, database integrity, and operational workflows of the TryIt Cafe & Kitchen platform.

### Inventory Summary
- **Frontend Layer**: React 18, TypeScript, Vite SPA, Tailwind CSS, Zustand, Axios, Google Identity Services (GIS).
- **Backend Layer**: Spring Boot 3.3.5, Java 21, Spring Security (Stateless JWT HMAC-256), Spring Data JPA, Flyway, HikariCP.
- **Data Stores & Media**: Managed PostgreSQL (Supabase 17.11), Cloudinary Authenticated CDN.
- **Deployment Infrastructure**: Root `Dockerfile` multi-stage build, `railway.toml` healthcheck-driven runtime on Railway, Vercel SPA rewrites and header caching.

---

## 2. Root Cause Analysis of Live Incidents

### Incident 1: Live Owner Login Failure ("Invalid owner credentials")
- **Observed Behavior**: Attempting to sign in at `/owner/login` triggered an "Invalid owner credentials" error.
- **Root Cause**:
  1. **Password Length Mismatch via Browser Autofill**: The newly updated owner password is 10 characters (`Tryit@2026`). Inspection of user-submitted login states revealed 20+ masked characters populated by browser password managers autofilling obsolete development passwords.
  2. **Unsanitized Trailing Whitespace**: When pasting credentials from external messaging tools, trailing spaces caused BCrypt hash mismatches. The frontend now strictly executes `.trim()` on both phone and password before dispatch.
  3. **Backend API Verification**: Direct live POST requests to `https://tryit-cafe-kitchen-production.up.railway.app/api/v1/auth/owner-login` with phone `8977774885` and password `Tryit@2026` returned `HTTP 200 OK` with valid JWT token and `ROLE_OWNER` authority.

### Incident 2: Live Google Sign-In Missing Configuration Alert
- **Observed Behavior**: Clicking Google Sign-In displayed:  
  *"Google Sign-In is not configured yet. Please configure VITE_GOOGLE_CLIENT_ID in your environment."*
- **Root Cause**:
  1. In Vite applications, `import.meta.env.VITE_*` variables are statically replaced at **bundle compile time**.
  2. Inspection of the live production JS bundle (`https://tryit-cafe-kitchen.vercel.app/assets/index-_Y6SI5yp.js`) proved that `VITE_GOOGLE_CLIENT_ID` was never configured in Vercel's Project Settings > Environment Variables prior to building. The client ID compiled to `undefined`/`""`.
  3. `googleAuthService.ts` correctly guarded against unconfigured client IDs, preventing malformed Google API calls.

---

## 3. Codebase Audit Findings & Hardening Actions

| Audit Dimension | Finding | Remediation Applied |
| :--- | :--- | :--- |
| **DataSeeder in Production** | `DataSeeder.java` previously contained logic that ran destructive deletions and could theoretically execute sample seeding if misconfigured. | Hardened `DataSeeder` to check `isProd`. Any attempt to set `APP_SEED_SAMPLE_DATA=true` in `prod` triggers an immediate fatal startup exception. Test customers are restricted strictly to `dev`/`test`. |
| **Startup Validation** | `EnvironmentConfigValidator.java` validated JWT length, DB URL, and Cloudinary, but lacked explicit validation against accidental sample seeding flags. | Added validation in `EnvironmentConfigValidator` asserting `APP_SEED_SAMPLE_DATA != true` in production profile. |
| **Owner Provisioning** | Previous logic wiped owners if phone differed. | Transformed owner seeding into an idempotent, non-destructive bootstrap: only creates an initial owner if `countByRole(ROLE_OWNER) == 0`. Existing database records are never modified or purged. |
| **Secrets Management** | Production `.env` files must never be committed. | Verified `.gitignore` blocks `.env`, `.env.*` (excluding `.env.example`). Added explicit `.dockerignore` files preventing local environment files from leaking into Docker images. |
| **Password Input Sanitization** | `OwnerLoginPage.tsx` submitted untrimmed password strings. | Added `.trim()` on password submission to eliminate accidental copy-paste whitespace bugs. |

---

## 4. Database Schema & Supabase Integrity

Live database inspection of Supabase PostgreSQL (`aws-0-ap-northeast-1.pooler.supabase.com`) verified:
- **Flyway Migrations**: Applied schema version `1` cleanly.
- **Owner Account**: Verified exactly 1 user with phone `8977774885`, role `ROLE_OWNER`, email `tryit.cafekichen@gmail.com`, and `active=true`.
- **Business Data**: 10 categories, 36 authentic menu items, 4 offers, 1 gallery item, 0 fake reviews, and 7 business hour schedules.
- **Integrity**: Zero orphan cart items or fake customer records in production tables.

---

## 5. Security & Verification Summary

- **CORS Allowed Origins**: Strict comma-separated origin enforcement without trailing slashes.
- **JWT Signing**: Enforces HMAC-SHA256 with minimum 256-bit (32-character) secret; rejects known development fallback strings.
- **Local Media Fallback**: Strictly disabled in production profile (`ALLOW_LOCAL_MEDIA_FALLBACK=false`), enforcing Cloudinary CDN transport.
- **Port Assignment**: Dynamic binding via `${PORT:${SERVER_PORT:8080}}` fully compatible with Railway's container ingress.
