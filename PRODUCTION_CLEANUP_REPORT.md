# TryIt Cafe & Kitchen — Production Cleanup Report

**Date:** 2026-10-09  
**Security Status:** Cleared — No Secrets or Dummy Data in Production Flow

---

## 1. Scope of Cleanup Audit

This audit identified and eliminated all development-only artifacts, hardcoded sensitive defaults, and placeholder demo data across the workspace.

---

## 2. Hardcoded & Development Artifacts Removed

| Component / File | Original Condition | Production Hardened Status |
| :--- | :--- | :--- |
| **`DataSeeder.java`** | Previously contained potential sample seeding calls (`seedMenuAndCategories`, `seedOffers`, `seedGallery`, `seedReviews`) and destructive owner purges. | **Strictly Guarded**: Sample seeding is completely prohibited in `prod`. Attempting `app.seed.sample-data=true` in `prod` triggers a fatal exception. Owner bootstrap is non-destructive. |
| **`EnvironmentConfigValidator.java`** | Did not assert sample-data flags. | **Enforced**: Throws `IllegalStateException` on startup if `APP_SEED_SAMPLE_DATA` is enabled in `prod`. |
| **`application-prod.yml`** | Configured for remote database and Cloudinary. | **Verified**: Defaults `sample-data: false`, `allow-local-fallback: false`, `ddl-auto: validate`. |
| **`application-dev.yml`** | Contained obsolete default owner credentials. | **Synchronized**: Updated development fallbacks to match canonical local development standards. |
| **`scripts/populate-dev-data.mjs`** | Contained obsolete default owner credentials. | **Updated**: Updated fallback credentials to match canonical local test standards. |
| **`OwnerLoginPage.tsx`** | Submitted raw password without trimming. | **Sanitized**: Trims whitespace on both phone and password before submission, eliminating copy-paste errors. |
| **Git & Docker Ignored Files** | Untracked `.dockerignore` files were missing in backend. | **Added**: `.dockerignore` files added to root and backend to ensure `.env` and local secrets are excluded from Docker container builds. |

---

## 3. Production Database State Inspection (Supabase)

A live inspection of the production database (`aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres`) confirmed the following clean state:

```
Database Tables Inspection:
- users:               1 (Verified active ROLE_OWNER account only)
- categories:          10 authentic cafe categories
- menu_items:          36 verified authentic menu items
- offers:              4 verified cafe offers
- gallery_items:       1 verified cafe image
- reviews:             0 fake/dummy reviews
- customer_locations:  0 demo customer locations
- carts:               0 test carts
- business_settings:   1 verified business record (TryIt Cafe & Kitchen, Gandi Maisamma)
- business_hours:      7 verified daily schedules (10:00 AM - 11:30 PM)
```

No dummy test records, mock customers, or synthetic reviews exist in the production database.

---

## 4. Google OAuth Verification Status

- **Root Cause of Alert**: `VITE_GOOGLE_CLIENT_ID` was omitted from Vercel's Environment Variables during the build.
- **Backend Readiness**: Backend `GoogleTokenVerifierService` is configured to validate token signatures with Google (`https://oauth2.googleapis.com/tokeninfo`) and match the audience (`aud == GOOGLE_CLIENT_ID`).
- **Action Required**: Add `VITE_GOOGLE_CLIENT_ID` to Vercel and `GOOGLE_CLIENT_ID` to Railway, then redeploy Vercel.
