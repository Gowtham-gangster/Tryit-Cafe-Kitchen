# Vercel Frontend Environment Variables Reference
## Tryit Cafe & Kitchen — React + Vite Production Deployment

This document specifies the environment variables to configure in the **Vercel Dashboard** under `Project > Settings > Environment Variables`.

> **CRITICAL SECURITY RULES:**
> - In Vite applications, only variables prefixed with `VITE_` are bundled into the client browser build.
> - **NEVER** add `CLOUDINARY_API_SECRET`, `JWT_SECRET`, `DATABASE_PASSWORD`, or `GOOGLE_CLIENT_SECRET` to Vercel!
> - The browser communicates with the backend exclusively via HTTPS REST endpoints.

---

### 1. Production Required Environment Variables

| Variable Name | Example Production Value | Purpose & Restriction |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | `https://your-backend.up.railway.app/api/v1` | **MANDATORY.** Base URL for all backend REST endpoints. Must use `https://` protocol and include `/api/v1`. |
| `VITE_GOOGLE_MAPS_API_KEY` | `AIzaSy...` | Browser API key for interactive delivery map and location autocomplete. **Must be restricted in Google Cloud Console** to your Vercel domains (`https://*.vercel.app/*`, `https://tryitcafe.com/*`). |

---

### 2. Optional Frontend UI Configuration Variables

| Variable Name | Recommended Value | Description |
| :--- | :--- | :--- |
| `VITE_GOOGLE_CLIENT_ID` | `<client-id>.apps.googleusercontent.com` | Google Identity Services Client ID for optional Google Sign-In button |
| `VITE_CAFE_WHATSAPP_NUMBER` | `8977774885` | Public WhatsApp number used for WhatsApp order checkout redirection |
| `VITE_CAFE_PHONE_NUMBER` | `+918977774885` | Public customer calling number displayed in navbar and footer |
| `VITE_CAFE_EMAIL` | `tryit.cafekichen@gmail.com` | Public contact and inquiry email address |
| `VITE_CAFE_INSTAGRAM_URL` | `https://instagram.com/tryit.cafe_kitchen` | Social media link for Instagram profile |
| `VITE_CAFE_INSTAGRAM_HANDLE` | `@tryit.cafe_kitchen` | Displayed handle for social proof |

---

### 3. Verification Checklist for Vercel Setup

1. **Framework Preset:** `Vite`
2. **Root Directory:** `frontend`
3. **Build Command:** `npm run build`
4. **Output Directory:** `dist`
5. **Install Command:** `npm install`
6. **Vercel Routing:** Handled automatically by `frontend/vercel.json` SPA rewrites.
