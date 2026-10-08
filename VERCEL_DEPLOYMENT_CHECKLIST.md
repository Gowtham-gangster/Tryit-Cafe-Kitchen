# Vercel Frontend Deployment Checklist
## Tryit Cafe & Kitchen — React + Vite Production Deployment

Follow this step-by-step checklist to deploy the frontend to Vercel and connect it with your Railway backend.

---

### Step 1: Import Project in Vercel
1. Log in to [Vercel](https://vercel.com/).
2. Click **Add New...** → **Project**.
3. Import your GitHub repository: `Tryit Cafe Website`.

---

### Step 2: Configure Project Settings
In the Project Configuration screen:
1. **Framework Preset:** `Vite`
2. **Root Directory:** Click `Edit` and select `frontend`.
3. **Build and Output Settings:**
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

---

### Step 3: Configure Environment Variables
Expand **Environment Variables** and add the following:

1. `VITE_API_BASE_URL`:
   ```
   https://<your-railway-domain>.up.railway.app/api/v1
   ```
   *(Replace with the actual Railway domain generated in Step 7 of the Railway checklist).*

2. `VITE_GOOGLE_MAPS_API_KEY`:
   ```
   <your-google-maps-browser-api-key>
   ```

3. `VITE_GOOGLE_CLIENT_ID`:
   ```
   460324472173-p8u90f74r2vvffepugmua8nkkfj0jj83.apps.googleusercontent.com
   ```

4. `VITE_CAFE_WHATSAPP_NUMBER`:
   ```
   8977774885
   ```

5. `VITE_CAFE_PHONE_NUMBER`:
   ```
   +918977774885
   ```

6. `VITE_CAFE_EMAIL`:
   ```
   tryit.cafekichen@gmail.com
   ```

7. `VITE_CAFE_INSTAGRAM_URL`:
   ```
   https://instagram.com/tryit.cafe_kitchen
   ```

8. `VITE_CAFE_INSTAGRAM_HANDLE`:
   ```
   @tryit.cafe_kitchen
   ```

---

### Step 4: Deploy and Verify
1. Click **Deploy**.
2. Wait for the build and deployment process to finish (typically 1–2 minutes).
3. Once deployed, note your production Vercel URL:
   ```
   VERCEL_APP_URL=https://<your-project>.vercel.app
   ```

---

### Step 5: Update CORS in Railway
1. Return to the **Railway Dashboard** → Backend Service → **Variables**.
2. Update `CORS_ALLOWED_ORIGINS` to include your exact Vercel production URL:
   ```
   CORS_ALLOWED_ORIGINS=https://<your-project>.vercel.app,https://tryitcafe.com
   ```
3. Save changes so Railway updates and redeploys.

---

### Step 6: End-to-End Verification Checklist
Open your Vercel URL in an incognito window and test:

- [ ] **HTTPS:** Site loads securely with valid SSL certificate.
- [ ] **SPA Route Refresh:** Navigate directly to `/menu`, `/offers`, `/reviews`, `/profile`, `/owner/login` and press Refresh (F5). Ensure no 404 errors occur (handled by `vercel.json`).
- [ ] **Menu Loading:** 36 dishes load dynamically across 10 categories.
- [ ] **Filters & Search:** Veg/Non-Veg/Egg filters, Bestseller filter, category chips, and search input return instant results.
- [ ] **Cloudinary Media:** Gallery and dishes display images from Cloudinary CDN (`https://res.cloudinary.com/...`). Dishes without custom photos show the local `/Hero.jpg` fallback cleanly.
- [ ] **Google Maps Integration:** In checkout or location modal, map pin loads, GPS detection works, and distance/delivery fees calculate correctly.
- [ ] **Cart & Checkout:** Add dishes to cart, adjust quantities, review subtotal, taxes, delivery fee, and proceed to checkout.
- [ ] **WhatsApp Ordering:** Click **Place Order on WhatsApp**; verify the generated message URL contains full itemized breakdown and cafe GPS coordinate link.
- [ ] **Customer Authentication:** Register and log in with phone number/password; profile updates successfully.
- [ ] **Owner Dashboard:** Log in at `/owner/login`; verify dashboard statistics, menu management, offer management, review moderation, and gallery uploads.
- [ ] **Cloudinary Media Upload:** In Owner Dashboard → Menu/Gallery, upload an image and confirm it saves directly to Cloudinary without errors.
