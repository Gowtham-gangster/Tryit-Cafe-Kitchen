# Railway Backend Environment Variables Reference
## Tryit Cafe & Kitchen — Spring Boot Production Deployment

This document specifies the required environment variables to configure in the **Railway Dashboard** under `Your Project > Backend Service > Variables`.

> **CRITICAL SECURITY RULES:**
> - Never commit production secret values to version control.
> - Railway variables are encrypted at rest and injected into the backend runtime container.
> - None of these secret variables are exposed to the browser or frontend.

---

### 1. Public / Non-Secret Configuration Variables

| Variable Name | Recommended Production Value | Description |
| :--- | :--- | :--- |
| `SPRING_PROFILES_ACTIVE` | `prod` | Activates production profile (`application-prod.yml`) with strict validation, SSL enforcement, and disabled dev consoles |
| `PORT` | *(Provided by Railway)* | Railway automatically assigns the container listen port. Spring Boot reads `${PORT:8080}` |
| `CORS_ALLOWED_ORIGINS` | `https://<your-vercel-app>.vercel.app,https://tryitcafe.com` | Comma-separated list of allowed origins. Must include your Vercel deployment URL (no trailing slash) |
| `ALLOW_LOCAL_MEDIA_FALLBACK` | `false` | Strictly disables local disk media fallback; guarantees all uploads go directly to Cloudinary CDN |
| `APP_SEED_ENABLED` | `false` | Disables automated administrative account recreation on container restarts |
| `APP_SEED_SAMPLE_DATA` | `false` | Strictly ensures no demo/sample menu data is injected into production tables |
| `GOOGLE_CLIENT_ID` | `<client-id>.apps.googleusercontent.com` | Google Identity Services Web Client ID (matches the frontend client ID) |
| `WHATSAPP_NUMBER` | `918977774885` | Public cafe WhatsApp business ordering number |
| `SUPPORT_EMAIL` | `tryit.cafekichen@gmail.com` | Public contact and support email address |

---

### 2. Secret / Backend-Only Variables (STRICT CONFIDENTIALITY)

| Variable Name | Secret Type | Requirement & Security Specification |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL Connection URL | Supabase JDBC URL: `jdbc:postgresql://<host>:5432/postgres?sslmode=require` or URI `postgresql://...` |
| `DATABASE_USERNAME` | Database User | Supabase user (e.g., `postgres` or `postgres.<project-ref>`) |
| `DATABASE_PASSWORD` | Database Secret | Supabase PostgreSQL user password |
| `JWT_SECRET` | HMAC-SHA256 Signing Key | Cryptographically secure random secret (minimum 32 characters / 256 bits). Generate via `openssl rand -hex 32` |
| `JWT_EXPIRATION_MS` | Token Expiry Duration | Recommended: `86400000` (24 hours in milliseconds) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Identifier | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary Identifier | Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | Media API Secret | Authenticated media upload & deletion secret. **STRICT BACKEND ONLY** |
| `GOOGLE_CLIENT_SECRET` | OAuth Secret *(Optional)* | Server-side Google OAuth client secret |
| `OWNER_INITIAL_PHONE` | Admin Bootstrap Phone | Initial owner phone number for first-time account setup |
| `OWNER_INITIAL_PASSWORD` | Admin Bootstrap Password | Initial owner password for first-time login |

---

### 3. Alternative Spring Datasource Bindings (Optional)

If your setup prefers standard Spring Boot property names instead of `DATABASE_*`, the application supports:
- `SPRING_DATASOURCE_URL` *(falls back to `DATABASE_URL`)*
- `SPRING_DATASOURCE_USERNAME` *(falls back to `DATABASE_USERNAME`)*
- `SPRING_DATASOURCE_PASSWORD` *(falls back to `DATABASE_PASSWORD`)*

---

### 4. Healthcheck Configuration in Railway

In Railway Service **Settings > Deploy**:
- **Healthcheck Path:** `/health`
- **Healthcheck Timeout:** `300` seconds
- **Restart Policy:** `On Failure` (Max Retries: `10`)
