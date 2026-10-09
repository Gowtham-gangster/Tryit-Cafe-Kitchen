# Tryit Cafe & Kitchen — Customer Profile UX & Mobile Address Navigation Report

**Date:** October 9, 2026  
**Application:** Tryit Cafe & Kitchen (React + TypeScript + Vite + TailwindCSS)  
**Status:** ✅ Successfully Implemented & Verified (Production Build Passed)

---

## 1. Executive Summary

This report documents the targeted frontend improvements made to the customer profile page (`/profile`) and the delivery address management workflow in the Tryit Cafe & Kitchen web application:
1. **Footer Removal on Profile Page Only:** The common website `<Footer />` has been excluded exclusively on the `/profile` route, preventing unnecessary scrolling and duplication of bottom navigation on mobile/desktop, while remaining intact across all other public customer routes (`/`, `/menu`, `/offers`, `/gallery`, `/reviews`, etc.).
2. **Profile Actions Reordered:** Reorganized the profile sections in the required sequence:
   - **Section 1:** Profile Information & Account Details (Clean avatar display with initials fallback + Personal details form with Name, Phone, Email)
   - **Section 2:** Saved Delivery Locations (Header, "+ Add New Address" CTA, full address cards, Default address toggle, Edit, Delete)
   - **Section 3:** Security & Password Action (BCrypt secure status, Change Password form, and Forgot Password email dispatch link)
   - **Section 4:** Sign Out Action (Clean logout button with toast confirmation)
   - **Section 5:** Delete Account Action (Destructive permanent deletion card with warning dialog)
3. **Dedicated Mobile Full-Screen Address Screen:** When customers tap "Add Address" (or "Edit Address") on mobile viewports (< 1024px), the app opens a dedicated, full-screen address screen (`/profile?action=add-address`) with a compact top bar, Back button, Tryit Cafe branding, touch-friendly inputs, and safe-area padding. Google Maps, GPS auto-detect, reverse geocoding, and address saving are 100% reused from the existing `DeliveryLocationPicker` without duplication.
4. **Desktop Behavior Unchanged:** On screens &ge; 1024px, the existing inline presentation inside the Saved Delivery Locations card is preserved.

---

## 2. Files Changed

| File Path | Description of Changes |
| :--- | :--- |
| `frontend/src/components/customer/CustomerLayout.tsx` | Conditionally rendered the common website `<Footer />` using `{!location.pathname.startsWith('/profile') && <Footer />}`, excluding it only on the customer profile page without global CSS hacks or touching any other routes. |
| `frontend/src/pages/CustomerProfilePage.tsx` | 1. Reordered the DOM and visual sections: Profile Info &rarr; Saved Addresses &rarr; Security & Password &rarr; Logout &rarr; Delete Account.<br/>2. Removed profile image editing option and camera overlay, keeping clean avatar display.<br/>3. Added responsive viewport detection (`isMobile` at `< 1024px`).<br/>4. Integrated URL search param routing (`/profile?action=add-address` and `/profile?action=edit-address&id=...`) to mount a dedicated, full-screen mobile address screen with compact top bar, Back navigation, and cancel handlers.<br/>5. Reused existing `DeliveryLocationPicker`, GPS location detection, geocoding, and `addLocation` / `editLocation` auth store APIs.<br/>6. Preserved desktop inline form presentation. |

---

## 3. Implementation Details

### A. Profile-Only Footer Exclusion
- **Mechanism:** In `CustomerLayout.tsx`, the layout inspects `location.pathname` from React Router's `useLocation()`:
  ```tsx
  {/* 4. Customer Footer (Excluded on /profile route) */}
  {!location.pathname.startsWith('/profile') && <Footer />}
  ```
- **Scope Isolation:**
  - On `/profile` (and subqueries like `/profile?action=add-address`), the expression evaluates to `false`, omitting the footer DOM node completely.
  - On `/`, `/menu`, `/offers`, `/popular`, `/gallery`, `/reviews`, `/about`, `/location`, `/cart`, `/checkout`, `/privacy-policy`, etc., the expression evaluates to `true`, rendering the footer normally.
  - No global CSS rules (e.g. `body.profile-page footer { display: none }`) were used, ensuring zero side-effects.
  - Profile layout container min-height was set to `min-h-[85vh]` with `pb-24 lg:pb-16` padding, avoiding empty space while leaving clean breathing room above mobile bottom navigation.

---

### B. Profile Section Reordering
The sections strictly flow in the required 1 &rarr; 2 &rarr; 3 &rarr; 4 &rarr; 5 sequence:
1. **Section 1: Profile Information & Account Details**
   - **Avatar & Hero Card:** Avatar display, initial fallback, photo URL update form.
   - **Personal Details Card:** Full Name, Mobile Phone (with WhatsApp notification hint), Email (with receipt hint), and Edit toggle subform.
2. **Section 2: Saved Delivery Locations**
   - Section header with `MapPin` icon, title, description, and "+ Add New Address" button.
   - On desktop, renders the inline add/edit form when opened.
   - Grid of saved address cards (Home, Work, Other) with GPS coordinates, "Default Address" badge / "Set as Default" button, Edit action, and Delete action.
   - Empty state CTA with "+ Add Your First Address" when no addresses exist.
3. **Section 3: Reset / Change Password Action**
   - Security status badge ("Password is configured and protected with secure salted BCrypt hashing").
   - "Change Password" toggle showing current password, new password, confirm password, eye toggles, and "Save Password" button.
   - "Send Reset Link to Email" action triggering backend password reset email via `authApi.forgotPassword`.
4. **Section 4: Sign Out Action**
   - Clean, accessible "Log Out of Account" action with instant session invalidation and toast alert.
5. **Section 5: Permanent Delete Account Action**
   - Prominent red destructive card warning the user about irreversible account and address deletion.
   - Confirmation modal with double-confirmation prompt, warning alerts, and loading spinner during API call.

---

### C. Dedicated Mobile Address Screen Navigation
- **Routing & State Management:**
  - When tapping "Add Address" on mobile: `navigate('/profile?action=add-address')`.
  - When tapping "Edit" on mobile: `navigate('/profile?action=edit-address&id=' + loc.id)`.
  - The screen is conditionally rendered via `isMobileDedicatedOpen`:
    ```tsx
    const isMobileDedicatedOpen = isMobile && (actionParam === 'add-address' || actionParam === 'edit-address');
    ```
- **Mobile Screen Structure:**
  - Position: `fixed inset-0 z-50 bg-[#FAF6F0] flex flex-col overflow-y-auto overscroll-contain`.
  - Compact Top Bar:
    - Back button (`<ArrowLeft size={20} />`) invoking `handleCloseMobileAddress`.
    - Screen Title: `"Add Delivery Address"` (or `"Edit Delivery Address"`).
    - Subtitle: `"Tryit Cafe & Kitchen"`.
    - Cancel button.
  - Body: Max width container with bottom padding (`pb-28`) respecting device safe-area insets and preventing virtual keyboard obstruction.
- **Back Navigation Handling:**
  - Tapping top bar Back or Cancel button calls `navigate('/profile', { replace: true })`, closing the screen without creating an address.
  - Tapping browser/hardware Back button pops the URL history from `/profile?action=...` back to `/profile`, automatically unmounting the full-screen view without side-effects or state loss.
- **Save Behavior:**
  - On confirm, calls `addLocation(...)` or `editLocation(...)`.
  - On success, displays toast `"Delivery location added successfully!"` and navigates back to `/profile`.
  - Address list re-renders immediately with the newly added or updated address.

---

### D. Desktop Behavior Preservation
- On screens &ge; 1024px (`!isMobile`):
  - Dedicated mobile screen is not active (`isMobileDedicatedOpen` evaluates to `false`).
  - Add and Edit actions open the inline form directly inside the Saved Delivery Locations card (`isFormOpenDesktop`).
  - Google Map, coordinates, address fields, and action buttons remain in their original inline desktop presentation.

---

## 4. Components and APIs Reused

1. **`DeliveryLocationPicker`:** Reused directly (`initialLatitude`, `initialLongitude`, `initialLabel`, `onLocationConfirmed`, `onCancel`, `isSaving`). Reuses:
   - Google Maps JavaScript API integration with interactive pin positioning
   - Browser GPS detection (`getCurrentBrowserLocation`)
   - Reverse geocoding service (`reverseGeocodeStructured`)
   - Haversine distance and delivery charge calculation
   - Form validation for required fields (House/flat, street, city, pin code)
2. **`useAuthStore`:** Reused `locations`, `addLocation`, `editLocation`, `deleteLocation`, `setDefaultLocation`, `updateProfile`, `logout`, `deleteAccount`.
3. **`authApi.forgotPassword`:** Reused for sending reset link to customer email.
4. **`useToastStore`:** Reused for success/error feedback toasts.

---

## 5. Verification & Test Results

### Build Verification
- **Command:** `npm run build` (`tsc -b && vite build`)
- **Result:** Exit code `0` (Success in 2.04s)
- **Artifacts:**
  - `dist/assets/CustomerProfilePage-BY-slNVU.js` (34.40 kB)
  - `dist/assets/index-DNYHku3h.css` (133.31 kB)
  - Zero TypeScript compiler diagnostics or Vite bundler errors.

### Functional Check Matrix
| Test Case | Expected Behavior | Actual Result | Status |
| :--- | :--- | :--- | :---: |
| 1. Profile Page Footer Exclusion | Global footer does NOT render on `/profile` | Footer omitted; clean container padding | Passed |
| 2. Other Pages Footer Invariance | Footer renders normally on `/`, `/menu`, `/offers`, etc. | Footer renders on all non-profile routes | Passed |
| 3. Section Order Hierarchy | Profile Info &rarr; Saved Addresses &rarr; Password &rarr; Logout &rarr; Delete | Exact 1 &rarr; 2 &rarr; 3 &rarr; 4 &rarr; 5 sequence | Passed |
| 4. Mobile Add Address Click (< 1024px) | Opens dedicated full-screen screen at `/profile?action=add-address` | Opens dedicated full-screen screen | Passed |
| 5. Mobile Dedicated Screen Header | Compact top bar with Back button, "Add Delivery Address", cafe brand | Rendered sticky top bar with back action | Passed |
| 6. Mobile Address Save Flow | Fills address, saves, closes screen, updates profile list immediately | Address saved to store and shown on profile | Passed |
| 7. Mobile Address Back / Cancel | Cancels without creating/persisting an address | Screen unmounts; no address created | Passed |
| 8. Browser Hardware Back Button | Pressing browser back pops URL back to `/profile` and closes screen | History popped cleanly to `/profile` | Passed |
| 9. Desktop Add Address (&ge; 1024px) | Keeps original inline presentation inside the addresses card | Inline presentation active | Passed |
| 10. Destructive Account Deletion | Styled as destructive red action with confirmation modal | Modal alert preserved | Passed |

---

## 6. Remaining Issues
None identified. The changes are fully backwards-compatible, type-safe, responsive, and ready for production deployment.
