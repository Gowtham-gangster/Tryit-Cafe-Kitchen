import { useNavigate, useLocation } from 'react-router-dom';
import { useCallback } from 'react';

export const HOME_SECTIONS = [
  'home',
  'offers',
  'popular',
  'menu',
  'gallery',
  'reviews',
  'about',
  'location',
] as const;

export type HomeSectionId = (typeof HOME_SECTIONS)[number];

const NAVBAR_OFFSET = 70;

/**
 * Perform precise, smooth scroll to a section element on the home page.
 */
export function scrollToSectionElement(sectionId: string, smooth = true): boolean {
  if (sectionId === 'home' || sectionId === 'top') {
    window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'instant' });
    return true;
  }

  const el = document.getElementById(sectionId);
  if (!el) return false;

  const rect = el.getBoundingClientRect();
  const targetY = window.scrollY + rect.top - NAVBAR_OFFSET;
  window.scrollTo({
    top: Math.max(0, targetY),
    behavior: smooth ? 'smooth' : 'instant',
  });
  return true;
}

/**
 * Hook providing unified, ultra-fast customer navigation across all pages and sections.
 */
export function useCustomerNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage =
    location.pathname === '/' ||
    HOME_SECTIONS.some((sec) => location.pathname === `/${sec}`);

  const navigateToSection = useCallback(
    (sectionId: string) => {
      // 1. If currently on Home page or a home section sub-route
      if (isHomePage) {
        if (sectionId === 'home' || sectionId === 'top') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
          if (location.pathname !== '/') {
            navigate('/', { replace: true });
          }
        } else {
          const scrolled = scrollToSectionElement(sectionId, true);
          if (scrolled && location.pathname !== `/${sectionId}`) {
            navigate(`/${sectionId}`, { replace: true });
          }
        }
        return;
      }

      // 2. If on Policy, Terms, or any other external sub-page
      if (sectionId === 'home' || sectionId === 'top') {
        navigate('/');
        window.scrollTo({ top: 0, behavior: 'instant' });
      } else {
        // Navigate directly to the section route so CustomerLayout scrolls on mount
        navigate(`/${sectionId}`, { state: { targetSection: sectionId } });
      }
    },
    [isHomePage, location.pathname, navigate]
  );

  return {
    navigateToSection,
    isHomePage,
    currentPath: location.pathname,
  };
}
