# Tryit Cafe & Kitchen — Railway + Vercel Production Migration Report

**Date:** October 8, 2026  
**Target Architecture:**
- **Frontend:** Vercel (React 19 + Vite 6 Single Page Application)
- **Backend:** Railway (Spring Boot 3.3.5 / Eclipse Temurin JDK 21 Alpine Container)
- **Database:** Supabase PostgreSQL (Managed PostgreSQL 15+ with SSL Enforced)
- **Media CDN:** Cloudinary Authenticated CDN Storage
- **Ordering Channel:** WhatsApp Business API Direct Dispatch
- **Location & Maps:** Google Maps JavaScript API (Client-side interactive address pin)

---

## 1. Final Architecture

```
                                  INTERNET
                                      │
                                      ▼
                        ┌───────────────────────────┐
                        │          VERCEL           │
                        │    React + Vite (SPA)     │
                        │  https://<app>.vercel.app │
                        └─────────────┬─────────────┘
                                      │ HTTPS (CORS Controlled)
                                      ▼
                        ┌───────────────────────────┐
                        │          RAILWAY          │
                        │  Spring Boot 3.3 Backend  │
                        │ https://<app>.railway.app │
                        └─────────────┬─────────────┘
                                      │
                   ┌──────────────────┴──────────────────┐
                   │ SSL Enforced JDBC                   │ Authenticated Upload/Delete
                   ▼                                     ▼
     ┌───────────────────────────┐         ┌───────────────────────────┐
     │         SUPABASE          │         │        CLOUDINARY         │
     │     Managed PostgreSQL    │         │     Media Storage & CDN   │
     │   aws-0-ap-northeast-1    │         │  tryit_cafe/{dishes, ...} │
     └───────────────────────────┘         └───────────────────────────┘
```

- **Frontend Hosting:** Vercel serves the static assets with HTTP/2 and edge caching. SPA route fallbacks are configured via `frontend/vercel.json`.
- **Backend Hosting:** Railway runs the Spring Boot application containerized with multi-stage Eclipse Temurin JRE 21 Alpine, listening dynamically on the Railway-assigned `${PORT:8080}`.
- **Database:** Supabase PostgreSQL is the sole system of record. Spring Boot connects directly via SSL (`sslmode=require`), utilizing Flyway schema validation.
- **Media Storage:** Cloudinary is the sole media store for user-uploaded assets. Local disk fallback is strictly disabled (`ALLOW_LOCAL_MEDIA_FALLBACK=false`).
- **External Channels:** WhatsApp handles direct order placement; Google Maps Platform handles customer address pin location and distance calculation.

---

## 2. Backend Deployment Configuration (Railway)

### Dynamic Port Assignment
Spring Boot configuration in [`application.yml`](file:///d:/Sunday%20Sessions/Tryit%20Cafe%20Website/backend/src/main/resources/application.yml) binds dynamically:
```yaml
server:
  port: ${PORT:${SERVER_PORT:8080}}
```
- In Railway: Railway injects `$PORT`, which Spring Boot binds to automatically.
- In local development: Binds to `SERVER_PORT` (8088) or falls back to 8080.

### Proxy & Protocol Headers
In [`application-prod.yml`](file:///d:/Sunday%20Sessions/Tryit%20Cafe%20Website/backend/src/main/resources/application-prod.yml):
```yaml
server:
  forward-headers-strategy: framework
  tomcat:
    remoteip:
      internal-proxies: 127\.0\.0\.1|10\..*|172\.(1[6-9]|2[0-9]|3[0-1])\..*|192\.168\..*
```
Ensures correct resolution of HTTPS scheme from Railway's reverse proxy ingress.

### Flyway Schema Safety
- `spring.flyway.enabled: true`
- `spring.flyway.baseline-on-migrate: true`
- `spring.flyway.validate-on-migrate: true`
- `spring.jpa.hibernate.ddl-auto: validate`
- Automated sample data generation disabled: `app.seed.sample-data: false`.

---

## 3. Frontend Deployment Configuration (Vercel)

### Build Parameters
- **Root Directory:** `frontend`
- **Framework Preset:** `Vite`
- **Build Command:** `npm run build` (`tsc -b && vite build`)
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### SPA Routing & Refresh Fallback
Configured via [`frontend/vercel.json`](file:///d:/Sunday%20Sessions/Tryit%20Cafe%20Website/frontend/vercel.json):
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```
Eliminates 404 errors when refreshing on deep routes (`/menu`, `/offers`, `/reviews`, `/profile`, `/owner/dashboard`, etc.).

---

## 4. Supabase PostgreSQL Configuration

- **Host:** `aws-0-ap-northeast-1.pooler.supabase.com`
- **Port:** `5432`
- **Database:** `postgres`
- **Transport Security:** SSL strictly enforced (`sslmode=require`) by [`DatabaseConfigNormalizer.java`](file:///d:/Sunday%20Sessions/Tryit%20Cafe%20Website/backend/src/main/java/com/tryitcafe/config/DatabaseConfigNormalizer.java).
- **Hikari Connection Pool Configuration:**
  - `maximum-pool-size: 10` (Conservative connection ceiling suitable for Supabase connection limits)
  - `minimum-idle: 2`
  - `idle-timeout: 300000` (5 minutes)
  - `max-lifetime: 1200000` (20 minutes to refresh before pooler idle disconnects)
  - `keepalive-time: 60000` (1 minute keepalive heartbeats)
  - `connection-timeout: 20000` (20 seconds)

---

## 5. Cloudinary Configuration

- **Upload Mode:** Server-side authenticated multipart uploads only (`/api/v1/owner/upload-media`).
- **Validation Pipeline:** Magic-byte inspection, file size limit (10MB for images, 50MB for videos), and folder allowlisting (`dishes`, `menu`, `offers`, `gallery`, `hero`, `categories`).
- **Local Fallback:** Strictly disabled (`ALLOW_LOCAL_MEDIA_FALLBACK=false`).
- **Frontend Secret Protection:** Zero Cloudinary secrets exposed to Vite or client bundle.

---

## 6. Environment Variable Matrix

| Variable Name | Required On | Sensitivity | Format / Example |
| :--- | :--- | :--- | :--- |
| `SPRING_PROFILES_ACTIVE` | Railway | Non-Secret | `prod` |
| `PORT` | Railway | System | Automatically injected by Railway |
| `DATABASE_URL` | Railway | Secret | `jdbc:postgresql://<host>:5432/postgres?sslmode=require` |
| `DATABASE_USERNAME` | Railway | Secret | `postgres.etuvzbcibjtegtvqptrg` |
| `DATABASE_PASSWORD` | Railway | Secret | *(Supabase Database Password)* |
| `JWT_SECRET` | Railway | Secret | *(64-hex character HMAC key)* |
| `CLOUDINARY_CLOUD_NAME` | Railway | Non-Secret | `jqwx7wdo` |
| `CLOUDINARY_API_KEY` | Railway | Non-Secret | `273295281151238` |
| `CLOUDINARY_API_SECRET` | Railway | Secret | *(Cloudinary Secret)* |
| `ALLOW_LOCAL_MEDIA_FALLBACK` | Railway | Non-Secret | `false` |
| `CORS_ALLOWED_ORIGINS` | Railway | Non-Secret | `https://<your-app>.vercel.app,https://tryitcafe.com` |
| `GOOGLE_CLIENT_ID` | Railway & Vercel | Public | `<id>.apps.googleusercontent.com` |
| `VITE_API_BASE_URL` | Vercel | Public | `https://<your-railway-app>.up.railway.app/api/v1` |
| `VITE_GOOGLE_MAPS_API_KEY` | Vercel | Public (Restricted) | `AIzaSy...` (Restricted by domain in GCP) |

---

## 7. CORS Configuration

Backend [`CorsConfig.java`](file:///d:/Sunday%20Sessions/Tryit%20Cafe%20Website/backend/src/main/java/com/tryitcafe/config/CorsConfig.java) reads `CORS_ALLOWED_ORIGINS`:
- Permitted Methods: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`
- Permitted Headers: `Authorization`, `Content-Type`, `X-Requested-With`, `Accept`, `Origin`, `Access-Control-Request-Method`, `Access-Control-Request-Headers`
- Exposed Headers: `Authorization`
- Allow Credentials: `true`
- Max Age: `3600` seconds
- Wildcards (`*`) are disallowed in production.

---

## 8. Authentication & Authorization Configuration

- **Customer Flow:** Phone + password login / registration issuing HMAC-SHA256 JWT tokens. Access to customer cart, saved locations, orders, and review submission (`ROLE_CUSTOMER`).
- **Owner Flow:** Phone + password login issuing JWT tokens with `ROLE_OWNER`. Strict enforcement on `/api/v1/owner/**`.
- **RBAC Enforcement:**
  - Unauthenticated access to protected routes returns `401 Unauthorized`.
  - Customer token attempting owner API returns `403 Forbidden`.
  - Inactive user accounts are denied access.

---

## 9. Healthcheck Endpoints

Both `/health` and `/api/v1/health` are mapped in [`HealthController.java`](file:///d:/Sunday%20Sessions/Tryit%20Cafe%20Website/backend/src/main/java/com/tryitcafe/controller/HealthController.java) and whitelisted in [`SecurityConfig.java`](file:///d:/Sunday%20Sessions/Tryit%20Cafe%20Website/backend/src/main/java/com/tryitcafe/config/SecurityConfig.java):
```json
{
  "success": true,
  "message": "TryIt Cafe Backend is healthy and running",
  "data": {
    "database": "UP",
    "service": "TryIt Cafe & Kitchen REST API",
    "version": "1.0.0",
    "timestamp": "2026-10-08T17:21:11.159403900Z",
    "status": "UP"
  }
}
```
Configured in Railway Deploy Settings with Path `/health` and Timeout `300s`.

---

## 10. Docker Configuration

Multi-stage Alpine Linux image in [`backend/Dockerfile`](file:///d:/Sunday%20Sessions/Tryit%20Cafe%20Website/backend/Dockerfile):
- **Stage 1 (Builder):** `maven:3.9.9-eclipse-temurin-21-alpine` caches dependencies and packages the executable JAR.
- **Stage 2 (Runtime):** `eclipse-temurin:21-jre-alpine` runs the JAR as non-privileged security user `appuser:appgroup`.
- **Exposed Port:** `EXPOSE 8080`.
- **Startup Entrypoint:** `ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]`.

---

## 11. Build Verification Results

### Frontend Build (`npm run build`)
```
> frontend@0.0.0 build
> tsc -b && vite build

vite v8.2.1 building client environment for production...
✓ 2338 modules transformed.
dist/index.html                                   2.88 kB │ gzip:  1.19 kB
dist/assets/index-Cr7cq1F3.css                  131.81 kB │ gzip: 19.87 kB
dist/assets/vendor-state-CRrULflc.js             47.13 kB │ gzip: 17.87 kB
dist/assets/vendor-motion-C64pX1Vl.js            48.72 kB │ gzip: 16.84 kB
dist/assets/vendor-libs-C6Ug_G3V.js             125.58 kB │ gzip: 41.01 kB
dist/assets/vendor-react-DY7nvF4K.js            233.34 kB │ gzip: 75.37 kB
dist/assets/index-B0l0T1Uv.js                   301.08 kB │ gzip: 68.02 kB
✓ built in 2.08s
```
- **TypeScript Errors:** 0
- **Vite/Rollup Errors:** 0

---

## 12. Test Suite Results (`mvn clean test`)

```
[INFO] Results:
[INFO] 
[INFO] Tests run: 86, Failures: 0, Errors: 0, Skipped: 0
[INFO] 
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] ------------------------------------------------------------------------
[INFO] Total time:  01:15 min
```
All 86 test cases across security integration, JWT authentication, rate limiting, and Supabase Flyway migrations passed cleanly.

---

## 13. Production Endpoint Placeholders

- **Railway Backend Base URL:**  
  `https://<your-generated-domain>.up.railway.app`  
  *(Generated in Railway Dashboard > Networking > Generate Domain)*
- **Vercel Frontend URL:**  
  `https://<your-project>.vercel.app`  
  *(Generated in Vercel Dashboard upon repository import)*

---

## 14. Media Upload Verification Pipeline

Verified end-to-end media upload pathway:
1. Owner Dashboard client issues `multipart/form-data` POST to `/api/v1/owner/upload-media`.
2. Spring Boot backend performs MIME & magic-byte validation.
3. Backend securely uploads the file to Cloudinary with folder prefix `tryit_cafe/{folder}`.
4. Cloudinary returns HTTPS `secure_url` and `public_id`.
5. Spring Boot persists the HTTPS CDN URL in PostgreSQL.
6. Customer frontend loads the image via Cloudinary CDN (`https://res.cloudinary.com/...`).

---

## 15. Security Verification & Secret Hygiene

- `.gitignore` verified: `.env`, `.env.*`, and `*.env` are excluded from Git across root, backend, and frontend.
- Zero credentials or tokens appear in client builds.
- Global exception handler intercepts unhandled exceptions and prevents stack trace leakage to the client.

---

## 16. Remaining Operational Risks & Mitigation

1. **Vercel Domain CORS Mismatch:**  
   *Risk:* Forgetting to update `CORS_ALLOWED_ORIGINS` in Railway when deploying a new Vercel preview or custom domain.  
   *Mitigation:* Update `CORS_ALLOWED_ORIGINS` in Railway with the exact Vercel URL without trailing slashes.
2. **Google Maps API Key Restrictions:**  
   *Risk:* Google Maps key rejected in production.  
   *Mitigation:* Add `https://<your-project>.vercel.app/*` to authorized HTTP referrers in Google Cloud Console.

---

## 17. Rollback Procedures

- **Frontend (Vercel):** Go to Vercel Dashboard → Deployments → click previous deployment → **Promote to Production** (instant zero-downtime rollback).
- **Backend (Railway):** Go to Railway Dashboard → Deployments → select previous release → **Rollback**.
- **Database Safety:** Since schema validation is active (`ddl-auto: validate`) and sample data seeding is disabled, rollbacks will not corrupt database state.
