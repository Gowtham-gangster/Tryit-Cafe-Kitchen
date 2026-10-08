/**
 * Intelligent Route Prefetch Utilities
 *
 * Preloads code chunks on idle or on user interaction (e.g. hover/focus)
 * without blocking initial load or slow networks.
 */

const isSlowConnection = (): boolean => {
  if (typeof navigator !== 'undefined' && 'connection' in navigator) {
    const conn = (navigator as any).connection;
    if (conn && (conn.saveData || /2g/i.test(conn.effectiveType || ''))) {
      return true;
    }
  }
  return false;
};

export const prefetchRoute = (importer: () => Promise<any>): void => {
  if (isSlowConnection()) return;
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => {
      importer().catch(() => {});
    });
  } else {
    setTimeout(() => {
      importer().catch(() => {});
    }, 200);
  }
};

// Owner routes prefetchers
export const prefetchOwnerDashboard = () => prefetchRoute(() => import('../pages/owner/OwnerDashboardPage'));
export const prefetchOwnerMenu = () => prefetchRoute(() => import('../pages/owner/OwnerMenuPage'));
export const prefetchOwnerCategories = () => prefetchRoute(() => import('../pages/owner/OwnerCategoriesPage'));
export const prefetchOwnerOffers = () => prefetchRoute(() => import('../pages/owner/OwnerOffersPage'));
export const prefetchOwnerGallery = () => prefetchRoute(() => import('../pages/owner/OwnerGalleryPage'));
export const prefetchOwnerReviews = () => prefetchRoute(() => import('../pages/owner/OwnerReviewsPage'));
export const prefetchOwnerBusinessHours = () => prefetchRoute(() => import('../pages/owner/OwnerBusinessHoursPage'));

// Legal pages prefetchers
export const prefetchLegalPages = () => {
  prefetchRoute(() => import('../pages/PrivacyPolicyPage'));
  prefetchRoute(() => import('../pages/TermsAndConditionsPage'));
};
