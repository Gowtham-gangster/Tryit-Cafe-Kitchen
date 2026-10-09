import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, useScroll, useSpring } from 'framer-motion';
import { SplashScreen } from './SplashScreen';
import { Navbar } from './Navbar';
import { BottomNav } from './BottomNav';
import { Footer } from './Footer';
import { FloatingCartCTA } from './FloatingCartCTA';
import { CartDrawer } from './CartDrawer';
import { DishDetailModal } from './DishDetailModal';
import { ReviewModal } from './ReviewModal';
import { OrderConfirmationModal } from '../cart/OrderConfirmationModal';
import { useMenuStore } from '../../store/useMenuStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { getWhatsAppBusinessNumber } from '../../utils/whatsapp';

import { OnlineOrderingBanner } from './OnlineOrderingBanner';
import { Modal } from '../common/Modal';
import { useNavigate } from 'react-router-dom';

import { scrollToSectionElement } from '../../utils/navigation';

export const CustomerLayout: React.FC = () => {
  const { fetchAllPublicData } = useMenuStore();
  const { settings, fetchSettings, isOnlineOrderingOpen, getClosureMessage } = useSettingsStore();
  const {
    items,
    instructions,
    cravingText,
    isCheckoutOpen,
    setIsCheckoutOpen,
    setIsCartOpen,
    setPendingCheckout,
  } = useCartStore();
  const { isAuthenticated, user, openAuthModal, fetchLocations } = useAuthStore();
  const { success } = useToastStore();
  const [isCheckoutBlockedOpen, setIsCheckoutBlockedOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const prevPathRef = useRef(location.pathname);

  useEffect(() => {
    fetchAllPublicData();
    fetchSettings();
    if (isAuthenticated && user?.role === 'ROLE_CUSTOMER') {
      fetchLocations();
    }
  }, [fetchAllPublicData, fetchSettings, isAuthenticated, user?.role, fetchLocations]);

  // Handle customer sub-routes: /cart, /checkout, /profile, /menu, /offers, /popular, /gallery, /reviews, /about, /location
  useEffect(() => {
    const path = location.pathname;
    const isNewRoute = prevPathRef.current !== path;
    prevPathRef.current = path;

    if (path === '/checkout') {
      if (!isOnlineOrderingOpen()) {
        setIsCheckoutBlockedOpen(true);
      } else if (!isAuthenticated || !user || user.role === 'ROLE_OWNER') {
        setPendingCheckout(true);
        openAuthModal('login', 'Sign in to continue with your order');
      } else {
        setIsCheckoutOpen(true);
      }
    } else if (path === '/cart') {
      setIsCartOpen(true);
    } else if (path === '/profile') {
      window.scrollTo({ top: 0, behavior: 'instant' });
      if (!isAuthenticated || !user || user.role === 'ROLE_OWNER') {
        openAuthModal('login', 'Sign in to access your customer profile.');
      }
    } else if (['/menu', '/offers', '/popular', '/gallery', '/reviews', '/about', '/location'].includes(path)) {
      const targetId = path.replace('/', '');
      let attempts = 0;
      const tryScroll = () => {
        const scrolled = scrollToSectionElement(targetId, true);
        if (!scrolled && attempts < 10) {
          attempts++;
          requestAnimationFrame(tryScroll);
        }
      };
      requestAnimationFrame(tryScroll);
    } else if (path === '/' && isNewRoute) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    } else if ((path === '/privacy-policy' || path === '/terms-and-conditions' || path === '/reset-password') && isNewRoute) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [location.pathname, isAuthenticated, user, setIsCartOpen, openAuthModal, isOnlineOrderingOpen]);

  const handleOpenProfile = () => {
    if (isAuthenticated && user && user.role !== 'ROLE_OWNER') {
      navigate('/profile');
    } else {
      openAuthModal('login', 'Sign in to access your customer profile & saved details.');
    }
  };

  const handleOrderPlaced = () => {
    success('WhatsApp launched! Please press Send in WhatsApp to place your order.');
    setIsCheckoutOpen(false);
  };

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-stone-900 selection:bg-amber-500 selection:text-white relative">
      {/* Desktop-only subtle scroll progress indicator (2.5px brand orange) */}
      <motion.div
        style={{ scaleX }}
        className="hidden lg:block fixed top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#FE8E2A] via-[#E67616] to-[#FE8E2A] origin-left z-60 pointer-events-none"
      />

      {/* 1. Splash Screen */}
      <SplashScreen />

      {/* 2. Customer Header / Navigation */}
      <Navbar onOpenProfile={handleOpenProfile} />

      {/* 3. Global Online Ordering Status Banner */}
      <OnlineOrderingBanner />

      {/* 4. Main Customer Content */}
      <main className="flex-1">
        <Outlet context={{ onOpenProfile: handleOpenProfile }} />
      </main>

      {/* Checkout Blocked Modal */}
      <Modal
        isOpen={isCheckoutBlockedOpen}
        onClose={() => {
          setIsCheckoutBlockedOpen(false);
          navigate('/');
        }}
        title="Online Ordering Closed"
        maxWidth="sm"
      >
        <div className="space-y-4 text-center py-2">
          <div className="w-14 h-14 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <span className="text-2xl">🔴</span>
          </div>
          <h3 className="text-lg font-bold text-stone-900 font-display">
            Online ordering is currently closed.
          </h3>
          <p className="text-xs text-stone-600 leading-relaxed max-w-xs mx-auto">
            {getClosureMessage() || 'We are temporarily not taking online orders. You can continue to browse our full menu and dishes.'}
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setIsCheckoutBlockedOpen(false);
                navigate('/');
              }}
              className="w-full py-3 px-6 rounded-2xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer min-h-[44px]"
            >
              Continue Browsing
            </button>
          </div>
        </div>
      </Modal>

      {/* 4. Customer Footer */}
      <Footer />

      {/* 5. Floating Sticky Cart CTA */}
      <FloatingCartCTA />

      {/* 6. Customer Mobile Bottom Navigation */}
      <BottomNav onOpenProfile={handleOpenProfile} />

      {/* 7. Slide-over / Bottom-sheet Cart Drawer */}
      <CartDrawer />

      {/* 8. Dish Detail Lightbox Modal */}
      <DishDetailModal />

      {/* 9. Review Submission Modal */}
      <ReviewModal />

      {/* 11. Customer Checkout & Delivery Confirmation Modal */}
      <OrderConfirmationModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={items}
        instructions={instructions}
        cravingText={cravingText || ''}
        customer={user}
        whatsappNumber={getWhatsAppBusinessNumber(settings?.whatsappNumber) || ''}
        cafeName={settings?.cafeName || 'TryIt Cafe & Kitchen'}
        onOrderPlaced={handleOrderPlaced}
        onBackToCart={() => {
          setIsCheckoutOpen(false);
          setIsCartOpen(true);
        }}
      />
    </div>
  );
};
