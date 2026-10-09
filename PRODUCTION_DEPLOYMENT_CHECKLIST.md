# TryIt Cafe & Kitchen — Production Deployment Checklist

**Date:** 2026-10-09  
**Target Environment:** Railway (Backend) & Vercel (Frontend)

---

## 1. Railway Backend Configuration & Deployment

### Step 1: Configure Backend Environment Variables
Navigate to **Railway Dashboard > Your Project > `tryit-backend` > Variables**:

- [ ] `SPRING_PROFILES_ACTIVE`: `prod`
- [ ] `DATABASE_URL`: `jdbc:postgresql://<supabase-host>:5432/postgres?sslmode=require`
- [ ] `DATABASE_USERNAME`: `<your-supabase-db-user>`
- [ ] `DATABASE_PASSWORD`: `<your-supabase-db-password>`
- [ ] `JWT_SECRET`: `<minimum-32-character-random-hex-string>`
- [ ] `JWT_EXPIRATION_MS`: `86400000`
- [ ] `CORS_ALLOWED_ORIGINS`: `https://tryit-cafe-kitchen.vercel.app` *(NO trailing slash)*
- [ ] `CLOUDINARY_CLOUD_NAME`: `<your-cloudinary-cloud-name>`
- [ ] `CLOUDINARY_API_KEY`: `<your-cloudinary-api-key>`
- [ ] `CLOUDINARY_API_SECRET`: `<your-cloudinary-api-secret>`
- [ ] `ALLOW_LOCAL_MEDIA_FALLBACK`: `false`
- [ ] `GOOGLE_CLIENT_ID`: `<google-client-id>.apps.googleusercontent.com`
- [ ] `APP_SEED_ENABLED`: `false`
- [ ] `APP_SEED_SAMPLE_DATA`: `false`
- [ ] `WHATSAPP_NUMBER`: `8977774885`
- [ ] `SUPPORT_EMAIL`: `tryit.cafekichen@gmail.com`

### Step 2: Deploy & Monitor Logs
- [ ] Trigger deployment from GitHub `main` branch.
- [ ] Confirm in Railway Deployment Logs:
  - Maven compiles JAR and builds Alpine JRE 21 container.
  - `The following 1 profile is active: "prod"`
  - `Flyway schema history validated / up to date`
  - `Production configuration validation passed: All critical infrastructure environment variables are properly configured.`
  - `Tomcat started on port(s): [Railway PORT]`
- [ ] Verify healthcheck endpoint in terminal or browser:
  ```bash
  curl -s https://<your-railway-domain>.up.railway.app/health
  # Expected: {"success":true,"data":{"database":"UP","status":"UP"}}
  ```

---

## 2. Google Cloud Console Configuration

To enable Google Sign-In on `https://tryit-cafe-kitchen.vercel.app`:

1. Open [Google Cloud Console > Credentials](https://console.cloud.google.com/apis/credentials).
2. Under **OAuth 2.0 Client IDs**, select your Web Client ID.
3. Under **Authorized JavaScript Origins**, add:
   - `https://tryit-cafe-kitchen.vercel.app`
   - `http://localhost:5173` *(optional for local testing)*
4. Under **Authorized Redirect URIs**, ensure `https://tryit-cafe-kitchen.vercel.app` is allowed.
5. Copy the **Client ID** (e.g., `xxxx.apps.googleusercontent.com`).

---

## 3. Vercel Frontend Configuration & Redeployment

### Step 1: Configure Frontend Variables
Navigate to **Vercel Dashboard > Project Settings > Environment Variables**:

- [ ] `VITE_API_BASE_URL`: `https://<your-railway-domain>.up.railway.app/api/v1`
- [ ] `VITE_GOOGLE_CLIENT_ID`: `<google-client-id>.apps.googleusercontent.com`
- [ ] `VITE_CAFE_WHATSAPP_NUMBER`: `8977774885`
- [ ] `VITE_CAFE_PHONE_NUMBER`: `+918977774885`
- [ ] `VITE_CAFE_EMAIL`: `tryit.cafekichen@gmail.com`
- [ ] `VITE_CAFE_INSTAGRAM_URL`: `https://instagram.com/tryit.cafe_kitchen`
- [ ] `VITE_CAFE_INSTAGRAM_HANDLE`: `@tryit.cafe_kitchen`

> [!IMPORTANT]
> Because Vite embeds environment variables into JavaScript bundles at build time, you **must trigger a new deployment** in Vercel after saving these variables!

### Step 2: Redeploy Frontend
- [ ] In Vercel, go to **Deployments** > Click the three dots on latest deployment > **Redeploy**.
- [ ] Wait for build to complete (`tsc -b && vite build`).

---

## 4. Post-Deployment Smoke Test Protocol

Execute these smoke tests against the live application:

1. **Public Site Loading**:
   - Visit `https://tryit-cafe-kitchen.vercel.app/`
   - Verify categories, menu items, hero banner, and contact details load without network errors.
2. **Owner Portal Sign-In**:
   - Navigate to `https://tryit-cafe-kitchen.vercel.app/owner/login`
   - Enter Phone: `8977774885`
   - Enter Password: `<owner-password>` (10 characters, ensure no trailing spaces)
   - Click **Sign In to Dashboard**
   - Confirm successful redirection to `/owner/dashboard`.
3. **Google Sign-In Check**:
   - Open Customer Sign In modal.
   - Click **Continue with Google**.
   - Verify Google Identity popup renders with cafe account selection prompt (no "missing configuration" alert).
4. **Cloudinary Media Upload**:
   - In Owner Portal, navigate to **Menu Management** or **Gallery Management**.
   - Upload a test photo.
   - Verify the image persists with a Cloudinary URL (`https://res.cloudinary.com/...`).
5. **Cart & WhatsApp Ordering**:
   - Add a menu item to the cart as a customer.
   - Proceed to checkout.
   - Click **Order via WhatsApp**.
   - Verify the pre-filled message opens with the cafe's phone number (`8977774885`) and order summary.
