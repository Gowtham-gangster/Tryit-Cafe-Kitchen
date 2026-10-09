# TryIt Cafe & Kitchen — Owner Account Provisioning & Security Architecture

**Date:** 2026-10-09  
**Security Level:** Production Security Standard

---

## 1. Overview & Threat Model

The TryIt Cafe & Kitchen administrative portal grants full control over live menu offerings, active pricing, discounts, business operating hours, and online ordering availability. To protect administrative access:
1. **No Public Role Elevation**: The public customer registration API (`/api/v1/auth/register`) enforces `UserRole.ROLE_CUSTOMER`. There is zero capability for a user to supply or request `ROLE_OWNER` from client-side payloads.
2. **Dedicated Owner Authentication Endpoint**: Dedicated route `/api/v1/auth/owner-login` verifies credentials and validates `user.getRole() == UserRole.ROLE_OWNER`. Non-owners receive immediate `HTTP 403 Forbidden` rejection.
3. **Password Security**: Passwords are never stored in plaintext. They are hashed using Spring Security's `BCryptPasswordEncoder` (salted, work factor 10).
4. **Idempotent Non-Destructive Bootstrap**: Automatic startup seeding preserves existing database records and skips provisioning once an owner account is established.

---

## 2. Verified Production Owner State

Inspection of the production Supabase PostgreSQL database confirmed:
- **Phone**: `8977774885`
- **Email**: `tryit.cafekichen@gmail.com`
- **Full Name**: `TryIt Cafe Owner`
- **Role**: `ROLE_OWNER`
- **Authentication Provider**: `LOCAL`
- **Status**: `active = true`
- **Password**: BCrypt hashed (`Tryit@2026`)

Live API verification against the Railway production deployment returned:
```http
POST /api/v1/auth/owner-login HTTP/1.1
Host: tryit-cafe-kitchen-production.up.railway.app
Content-Type: application/json

{"phone": "8977774885", "password": "<REDACTED>"}

HTTP/1.1 200 OK
{"success": true, "message": "Owner login successful", "data": {"role": "ROLE_OWNER", ...}}
```

---

## 3. Secure Production Provisioning Procedure (For Future Rotation or Recovery)

If the owner credentials ever need to be rotated or re-provisioned from scratch:

### Method A: Via Owner Dashboard (Recommended Self-Service)
Once authenticated into `/owner/dashboard`:
1. Navigate to **Owner Portal > Profile & Security** (`/owner/profile`).
2. Input the current password to authorize modification.
3. Provide the new password adhering to password policy:
   - Minimum 8 characters.
   - At least 1 uppercase letter.
   - At least 1 lowercase letter.
   - At least 1 digit.
4. Click **Update Password**. The backend updates the BCrypt hash in PostgreSQL.

---

### Method B: Database-Level Emergency Credential Reset
If administrative access is lost, execute an explicit BCrypt update directly via Supabase SQL Editor:

```sql
-- Step 1: Verify current owner record
SELECT id, phone, email, role, active 
FROM users 
WHERE role = 'ROLE_OWNER';

-- Step 2: Update password hash (Replace with fresh BCrypt hash generated with bcrypt tool)
-- Example bcrypt hash for rotation:
UPDATE users 
SET password_hash = '<new-bcrypt-hash-string>',
    updated_at = NOW()
WHERE phone = '8977774885' AND role = 'ROLE_OWNER';
```

---

### Method C: Environment Bootstrap (One-Time First Boot)
1. On fresh deployment with empty database, set in Railway Variables:
   - `APP_SEED_ENABLED=true`
   - `OWNER_INITIAL_PHONE=8977774885`
   - `OWNER_INITIAL_PASSWORD=<strong-random-password>`
2. Deploy backend. `DataSeeder.java` checks `userRepository.countByRole(ROLE_OWNER) == 0` and inserts the owner.
3. Once booted, set `APP_SEED_ENABLED=false` in Railway to disable further seeder execution.

---

## 4. Key Hardening Protections Implemented

- **No Destructive Overwrite**: `DataSeeder.java` will **never** delete, overwrite, or reset an existing owner account on application reboot.
- **Frontend Input Sanitization**: `OwnerLoginPage.tsx` sanitizes all input with `.trim()` on both phone and password fields to prevent browser autofill whitespace errors.
- **Session Protection**: Failed authorization (401/403) on owner routes immediately clears local tokens (`tryit_owner_token`) and redirects to `/owner/login`.
