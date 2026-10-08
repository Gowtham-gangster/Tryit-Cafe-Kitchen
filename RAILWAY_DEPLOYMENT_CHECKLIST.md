# Railway Backend Deployment Checklist
## Tryit Cafe & Kitchen — Spring Boot Production Deployment

Follow this step-by-step checklist to deploy the backend to Railway.

---

### Step 1: Push Repository to GitHub
- Ensure all recent changes are staged and committed.
- Verify that `.env` files are NOT committed (protected by `.gitignore`).
- Push to your GitHub repository (e.g., `git push origin main`).

---

### Step 2: Create Railway Project
1. Log in to [Railway](https://railway.com/).
2. Click **New Project** → **Deploy from GitHub repo**.
3. Select your repository: `Tryit Cafe Website`.

---

### Step 3: Configure Service Root Directory & Dockerfile
1. Click on the created service card and go to **Settings**.
2. Under **General > Service Name**, name it `tryit-cafe-backend`.
3. Under **Source > Root Directory**, set:
   ```
   /backend
   ```
   *(Or leave as root if using the root `railway.json` which points to `backend/Dockerfile`)*.
4. Under **Build > Builder**, confirm **Dockerfile** is selected.
   - If Root Directory is `/backend`, Dockerfile path is `Dockerfile`.
   - If Root Directory is root, Dockerfile path is `backend/Dockerfile`.

---

### Step 4: Configure Production Environment Variables
Go to the **Variables** tab of the service and add:

- `SPRING_PROFILES_ACTIVE`: `prod`
- `DATABASE_URL`: `jdbc:postgresql://aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres?sslmode=require`
- `DATABASE_USERNAME`: `postgres.etuvzbcibjtegtvqptrg`
- `DATABASE_PASSWORD`: `<your-supabase-db-password>`
- `JWT_SECRET`: `<your-secure-64-character-jwt-secret>`
- `CLOUDINARY_CLOUD_NAME`: `jqwx7wdo`
- `CLOUDINARY_API_KEY`: `273295281151238`
- `CLOUDINARY_API_SECRET`: `<your-cloudinary-api-secret>`
- `ALLOW_LOCAL_MEDIA_FALLBACK`: `false`
- `APP_SEED_ENABLED`: `false`
- `APP_SEED_SAMPLE_DATA`: `false`
- `CORS_ALLOWED_ORIGINS`: `https://<your-vercel-app>.vercel.app,https://tryitcafe.com`
- `GOOGLE_CLIENT_ID`: `460324472173-p8u90f74r2vvffepugmua8nkkfj0jj83.apps.googleusercontent.com`
- `WHATSAPP_NUMBER`: `8977774885`

---

### Step 5: Configure Healthcheck
Under **Settings > Deploy**:
- **Healthcheck Path:** `/health`
- **Healthcheck Timeout:** `300` seconds

---

### Step 6: Deploy Service
1. Trigger deployment (or Railway will deploy automatically on variable save).
2. Monitor build logs in the **Deployments** tab.
3. Verify Maven builds the JAR and the Alpine JRE container starts.
4. Verify Spring Boot logs confirm:
   - `Detected standard URI connection format from environment.`
   - `Enforced SSL transport (sslmode=require) on PostgreSQL JDBC connection.`
   - `Successfully applied 1 migration to schema "PUBLIC", now at version v1`
   - `Tomcat started on port(s): [Railway PORT]`
   - `Started TryItCafeApplication in X seconds`

---

### Step 7: Generate Railway Public Domain
1. In the service **Settings > Networking > Public Networking**, click **Generate Domain**.
2. Railway creates a public URL (e.g., `https://tryit-cafe-backend-production.up.railway.app`).
3. Note your URL:
   ```
   RAILWAY_API_URL=https://<your-generated-domain>.up.railway.app
   ```

---

### Step 8: Production Endpoint Verification Tests
Run curl or browser tests against your new Railway URL:

1. **Health Check:**
   ```bash
   curl -I https://<your-railway-domain>.up.railway.app/health
   # Expected: HTTP 200 OK
   # Response body: {"success":true,"data":{"database":"UP","status":"UP"}}
   ```

2. **Public Menu:**
   ```bash
   curl -s https://<your-railway-domain>.up.railway.app/api/v1/public/menu | head -n 30
   # Expected: HTTP 200 with 36 items
   ```

3. **Public Categories:**
   ```bash
   curl -s https://<your-railway-domain>.up.railway.app/api/v1/public/categories
   # Expected: HTTP 200 with 10 categories
   ```

4. **Security Check (Unauthenticated Owner Access):**
   ```bash
   curl -I https://<your-railway-domain>.up.railway.app/api/v1/owner/summary
   # Expected: HTTP 401 Unauthorized
   ```

---

### Step 9: Record API Base URL for Vercel
Save the verified API base URL:
```
VITE_API_BASE_URL=https://<your-railway-domain>.up.railway.app/api/v1
```
Use this value in the Vercel frontend deployment.
