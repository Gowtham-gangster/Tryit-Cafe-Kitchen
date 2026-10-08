import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CustomerLayout } from '../components/customer/CustomerLayout';
import { CustomerHomePage } from '../pages/CustomerHomePage';
import { RouteLoadingFallback } from '../components/common/RouteLoadingFallback';

// Customer Legal Routes - Code Split
const PrivacyPolicyPage = lazy(() =>
  import('../pages/PrivacyPolicyPage').then((m) => ({ default: m.PrivacyPolicyPage }))
);
const TermsAndConditionsPage = lazy(() =>
  import('../pages/TermsAndConditionsPage').then((m) => ({ default: m.TermsAndConditionsPage }))
);

// Owner Portal - Code Split (Completely isolated from initial customer bundle)
const OwnerLoginPage = lazy(() =>
  import('../pages/owner/OwnerLoginPage').then((m) => ({ default: m.OwnerLoginPage }))
);
const OwnerAuthGuard = lazy(() =>
  import('./OwnerAuthGuard').then((m) => ({ default: m.OwnerAuthGuard }))
);
const OwnerLayout = lazy(() =>
  import('../components/owner/OwnerLayout').then((m) => ({ default: m.OwnerLayout }))
);
const OwnerDashboardPage = lazy(() =>
  import('../pages/owner/OwnerDashboardPage').then((m) => ({ default: m.OwnerDashboardPage }))
);
const OwnerMenuPage = lazy(() =>
  import('../pages/owner/OwnerMenuPage').then((m) => ({ default: m.OwnerMenuPage }))
);
const OwnerCategoriesPage = lazy(() =>
  import('../pages/owner/OwnerCategoriesPage').then((m) => ({ default: m.OwnerCategoriesPage }))
);
const OwnerOffersPage = lazy(() =>
  import('../pages/owner/OwnerOffersPage').then((m) => ({ default: m.OwnerOffersPage }))
);
const OwnerGalleryPage = lazy(() =>
  import('../pages/owner/OwnerGalleryPage').then((m) => ({ default: m.OwnerGalleryPage }))
);
const OwnerReviewsPage = lazy(() =>
  import('../pages/owner/OwnerReviewsPage').then((m) => ({ default: m.OwnerReviewsPage }))
);
const OwnerBusinessHoursPage = lazy(() =>
  import('../pages/owner/OwnerBusinessHoursPage').then((m) => ({ default: m.OwnerBusinessHoursPage }))
);
const OwnerProfilePage = lazy(() =>
  import('../pages/owner/OwnerProfilePage').then((m) => ({ default: m.OwnerProfilePage }))
);

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteLoadingFallback />}>
        <Routes>
          {/* Customer Portal */}
          <Route element={<CustomerLayout />}>
            <Route path="/" element={<CustomerHomePage />} />
            <Route path="/menu" element={<CustomerHomePage />} />
            <Route path="/offers" element={<CustomerHomePage />} />
            <Route path="/popular" element={<CustomerHomePage />} />
            <Route path="/gallery" element={<CustomerHomePage />} />
            <Route path="/reviews" element={<CustomerHomePage />} />
            <Route path="/about" element={<CustomerHomePage />} />
            <Route path="/location" element={<CustomerHomePage />} />
            <Route path="/cart" element={<CustomerHomePage />} />
            <Route path="/checkout" element={<CustomerHomePage />} />
            <Route path="/profile" element={<CustomerHomePage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms-and-conditions" element={<TermsAndConditionsPage />} />
          </Route>

          {/* Dedicated Owner Login */}
          <Route path="/owner/login" element={<OwnerLoginPage />} />

          {/* Protected Owner Routes */}
          <Route path="/owner" element={<OwnerAuthGuard />}>
            <Route element={<OwnerLayout />}>
              <Route index element={<Navigate to="/owner/dashboard" replace />} />
              <Route path="dashboard" element={<OwnerDashboardPage />} />
              <Route path="menu" element={<OwnerMenuPage />} />
              <Route path="categories" element={<OwnerCategoriesPage />} />
              <Route path="offers" element={<OwnerOffersPage />} />
              <Route path="gallery" element={<OwnerGalleryPage />} />
              <Route path="reviews" element={<OwnerReviewsPage />} />
              <Route path="business-hours" element={<OwnerBusinessHoursPage />} />
              <Route path="settings" element={<Navigate to="/owner/dashboard" replace />} />
              <Route path="profile" element={<OwnerProfilePage />} />
            </Route>
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};
