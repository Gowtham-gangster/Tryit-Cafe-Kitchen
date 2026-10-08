# Supabase PostgreSQL Production Setup & Deployment Guide
**Project:** TryIt Cafe & Kitchen  
**Target Environment:** AWS Amplify (Frontend) + AWS App Runner / Container (Spring Boot Backend) + Supabase PostgreSQL  
**Document Classification:** Operations & Setup Guide  

---

## 1. Creating Your Supabase Project

1. Log into your [Supabase Dashboard](https://supabase.com/dashboard).
2. Click **New Project** and select your preferred Organization.
3. Choose a project name (e.g., `tryit-cafe-prod`).
4. Enter a **strong database password** (save this securely in your password manager / AWS Secrets Manager).
5. Select the **Region** geographically closest to your customer base (e.g., `ap-south-1` for Mumbai / Hyderabad).
6. Complete creation and allow 1–2 minutes for the PostgreSQL instance to provision.

---

## 2. Obtaining Connection Details from Supabase

1. In your Supabase Dashboard, navigate to:
   **Project Settings** (gear icon) → **Database**.
2. Scroll to the **Connection parameters** / **Connection string** section.
3. Supabase provides multiple connection options:

### Option A: Direct Connection (Recommended for Dedicated Backend Instances)
- **Port:** `5432`
- **Host:** `db.[YOUR-PROJECT-REF].supabase.co`
- **JDBC Connection String:**
  ```text
  jdbc:postgresql://db.[YOUR-PROJECT-REF].supabase.co:5432/postgres?sslmode=require
  ```
- **Username:** `postgres`
- **Password:** `<YOUR-DATABASE-PASSWORD>`

### Option B: Connection Pooler (Session Mode — Port 5432)
If your deployment connects from serverless or dynamic IP environments, use the Supavisor Pooler in **Session Mode**:
- **Port:** `5432`
- **Host:** `aws-0-[REGION].pooler.supabase.com`
- **JDBC Connection String:**
  ```text
  jdbc:postgresql://aws-0-[REGION].pooler.supabase.com:5432/postgres?sslmode=require
  ```
- **Username:** `postgres.[YOUR-PROJECT-REF]`
- **Password:** `<YOUR-DATABASE-PASSWORD>`

> [!IMPORTANT]
> **Flyway Schema Migrations Require Session Mode or Direct Connection (Port 5432):**  
> Do NOT use Transaction Mode (Port 6543) for initial Flyway migrations because transaction pooling disables transactional advisory locks and prepared statement caching required by migration runners.

---

## 3. Configuring Production Environment Variables

### Backend Required Environment Variables (AWS App Runner / ECS / Container)

Configure the following environment variables in your backend hosting service:

| Variable Name | Purpose | Example / Format | Secret Status |
| :--- | :--- | :--- | :--- |
| `SPRING_PROFILES_ACTIVE` | Activates production profile | `prod` | Public Config |
| `DATABASE_URL` *(or `SPRING_DATASOURCE_URL`)* | Supabase PostgreSQL JDBC connection string | `jdbc:postgresql://db.[REF].supabase.co:5432/postgres?sslmode=require` | Sensitive |
| `DATABASE_USERNAME` *(or `SPRING_DATASOURCE_USERNAME`)* | Supabase PostgreSQL user | `postgres` (or `postgres.[REF]`) | Sensitive |
| `DATABASE_PASSWORD` *(or `SPRING_DATASOURCE_PASSWORD`)* | Supabase database master password | `<your-db-password>` | **Strict Secret** |
| `JWT_SECRET` | 256-bit HMAC-SHA256 token signing key | Minimum 32 characters (e.g. `openssl rand -hex 32`) | **Strict Secret** |
| `JWT_EXPIRATION_MS` | Token expiry time in milliseconds | `86400000` (24 hours) | Config |
| `CORS_ALLOWED_ORIGINS` | Permitted frontend origins | `https://tryitcafe.com,https://www.tryitcafe.com` | Config |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary Product Environment Cloud Name | `<your-cloud-name>` | Identifier |
| `CLOUDINARY_API_KEY` | Cloudinary API Key | `<your-api-key>` | Identifier |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret | `<your-api-secret>` | **Strict Secret** |
| `GOOGLE_CLIENT_ID` | Google Identity Services Web Client ID | `*.apps.googleusercontent.com` | Public Identifier |
| `APP_SEED_ENABLED` | Controls auto-seeding on empty database | `false` (set `true` only for initial owner setup) | Config |
| `OWNER_INITIAL_PHONE` | Initial owner phone number for first-time setup | `9999999999` | Sensitive |
| `OWNER_INITIAL_PASSWORD` | Initial owner login password | `<strong-initial-password>` | **Strict Secret** |

### Frontend Required Environment Variables (AWS Amplify Console)

In AWS Amplify Console → **App settings** → **Environment variables**:

| Variable Name | Purpose | Example Value |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Production HTTPS backend API gateway base URL | `https://api.tryitcafe.com/api/v1` |
| `VITE_GOOGLE_CLIENT_ID` | Google Identity Web Client ID (matches backend) | `*.apps.googleusercontent.com` |
| `VITE_GOOGLE_MAPS_API_KEY` | Restricted Google Maps JavaScript API browser key | `AIzaSy...` |
| `VITE_CAFE_WHATSAPP_NUMBER`| Public WhatsApp ordering number | `8977774885` |
| `VITE_CAFE_PHONE_NUMBER` | Public Cafe contact phone | `+918977774885` |
| `VITE_CAFE_EMAIL` | Public Cafe customer support email | `tryit.cafekichen@gmail.com` |

---

## 4. SSL & Security Enforcement

- **Mandatory Encrypted Transport:** The backend's `DatabaseConfigNormalizer` automatically enforces `sslmode=require` on all remote PostgreSQL connections.
- **Fail-Safe Startup:** `EnvironmentConfigValidator` runs at startup and verifies that all critical production credentials are set. If any are missing or if default development secrets are detected, the application terminates immediately with a sanitized error message and never logs secret values.
- **Backend-Only Secrets:** Supabase credentials, Cloudinary API secrets, and JWT keys are isolated strictly on the backend. The frontend bundle and browser never receive database or API secret keys.

---

## 5. Flyway Migration Behavior

1. When Spring Boot starts with `SPRING_PROFILES_ACTIVE=prod`, Flyway executes automatically before Hibernate initializes.
2. Flyway creates its metadata table `flyway_schema_history` and executes `V1__init_schema.sql` in order.
3. The migration defines all 11 normalized tables, primary keys, foreign key constraints with proper cascades, and performance composite indexes.
4. Hibernate runs with `spring.jpa.hibernate.ddl-auto=validate`. Hibernate strictly validates that the physical tables match the Java entity mappings without executing any DDL statements.

---

## 6. Fresh Database Initialization vs. Existing Database Safety

### On an Empty / Fresh Database:
- Flyway automatically applies `V1__init_schema.sql`.
- If `APP_SEED_ENABLED=true`, `DataSeeder` provisions the initial owner account and cafe contact settings if none exist.
- Subsequent restarts detect existing data and do not re-seed.

### On an Existing Database:
- Flyway's `baseline-on-migrate: true` and `validate-on-migrate: true` ensure that existing tables are never dropped or recreated.
- The application executes **zero** destructive statements (`DROP`, `TRUNCATE`, `DELETE FROM *`).
- Existing customer orders, menu items, reviews, and cafe settings are completely preserved.

---

## 7. Hikari Connection Pool Settings for Supabase

In `application-prod.yml`, HikariCP is pre-configured with cloud-resilient timeouts:
```yaml
spring:
  datasource:
    hikari:
      pool-name: TryItCafeHikariPool
      maximum-pool-size: 10         # Optimal for cafe traffic without exceeding Supabase connection limits
      minimum-idle: 2
      idle-timeout: 300000          # 5 minutes
      connection-timeout: 20000     # 20 seconds
      max-lifetime: 1200000         # 20 minutes (prevents cloud NAT stale connection drops)
      keepalive-time: 60000         # 1 minute (keeps TCP connection active across AWS/Supabase network)
      validation-timeout: 5000      # 5 seconds
      connection-test-query: SELECT 1
```

---

## 8. Health Checks & Verification

- **Public Endpoint:** `GET /api/v1/health`
- **Response Format:**
  ```json
  {
    "success": true,
    "message": "TryIt Cafe Backend is healthy and running",
    "data": {
      "service": "TryIt Cafe & Kitchen REST API",
      "version": "1.0.0",
      "timestamp": "2026-10-08T16:15:00Z",
      "database": "UP",
      "status": "UP"
    }
  }
  ```
- If database connectivity is interrupted, the endpoint returns `503 Service Unavailable` with `"database": "DOWN"`, enabling AWS load balancers to accurately manage container routing.

---

## 9. Troubleshooting Common PostgreSQL / Supabase Issues

| Symptom | Cause | Solution |
| :--- | :--- | :--- |
| `FATAL: password authentication failed` | Wrong database password or special characters not URL-encoded | Verify the password in Supabase Dashboard. If special characters are used in a URI string, URL-encode them or use separate `DATABASE_PASSWORD`. |
| `Connection refused` / `Timeout` | Incorrect host or port, or firewall blocking port 5432 | Ensure using `db.[REF].supabase.co` on port 5432 with `sslmode=require`. |
| `Prepared statement already exists` | Using Supavisor in Transaction Mode (port 6543) | Switch to direct connection or Session Pooler (port 5432). |
| `No suitable driver found for postgresql://...` | Connection string lacks `jdbc:` prefix | The included `DatabaseConfigNormalizer` automatically translates `postgresql://` to `jdbc:postgresql://`. |
| `SSL connection required` | Omitted `sslmode=require` in query parameters | Append `?sslmode=require` to the JDBC URL (automatically enforced by `DatabaseConfigNormalizer`). |
