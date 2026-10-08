import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, User as UserIcon, LogOut, Utensils, Menu as MenuIcon, X } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { Link } from 'react-router-dom';
import { useCustomerNavigation } from '../../utils/navigation';

interface NavbarProps {
  onOpenProfile?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenProfile }) => {
  const { user, isAuthenticated, logout, openAuthModal } = useAuthStore();
  const { getTotalCount, setIsCartOpen } = useCartStore();
  const { settings } = useSettingsStore();
  const { navigateToSection, isHomePage } = useCustomerNavigation();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isScrolled, setIsScrolled] = useState(false);

  const isClickScrollingRef = React.useRef(false);
  const clickTimeoutRef = React.useRef<number | null>(null);

  const totalCartCount = getTotalCount();
  const cafeName = settings?.cafeName?.replace(/TryIt/g, 'Tryit') || 'Tryit Cafe & Kitchen';
  const isCustomer = isAuthenticated && user && user.role === 'ROLE_CUSTOMER';

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'offers', label: 'Offers' },
    { id: 'popular', label: 'Popular' },
    { id: 'menu', label: 'Menu' },
    { id: 'gallery', label: 'Gallery' },
    { id: 'reviews', label: 'Reviews' },
    { id: 'about', label: 'About' },
    { id: 'location', label: 'Location' },
  ];

  useEffect(() => {
    // If not on the home page (e.g. Policy or Terms), do not waste CPU cycles tracking home sections
    if (!isHomePage) {
      setActiveSection('');
      const handleScroll = () => {
        setIsScrolled(window.scrollY > 20);
      };
      window.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
      return () => window.removeEventListener('scroll', handleScroll);
    }

    const sectionIds = [
      'home',
      'offers',
      'popular',
      'menu',
      'gallery',
      'reviews',
      'about',
      'location',
    ];

    const updateActiveSection = () => {
      // If user recently clicked a nav link, respect the target section until smooth scroll finishes
      if (isClickScrollingRef.current) return;

      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 20);

      // Top of page check
      if (scrollY < 120) {
        setActiveSection('home');
        return;
      }

      // Bottom of page check (within footer / last section)
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      if (windowHeight + scrollY >= documentHeight - 70) {
        setActiveSection('location');
        return;
      }

      // Focal evaluation:
      const focalLine = windowHeight * 0.28;

      let foundSection: string | null = null;
      let maxOverlap = -1;
      let closestSection = 'home';

      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (!el) continue;
        const rect = el.getBoundingClientRect();

        // 1. Direct containment of the focal line
        if (rect.top <= focalLine && rect.bottom > focalLine) {
          foundSection = id;
          break;
        }

        // 2. Overlap measurement within a generous reading window [20%, 65%]
        const bandTop = windowHeight * 0.20;
        const bandBottom = windowHeight * 0.65;
        const overlapTop = Math.max(rect.top, bandTop);
        const overlapBottom = Math.min(rect.bottom, bandBottom);
        const overlap = Math.max(0, overlapBottom - overlapTop);

        if (overlap > maxOverlap) {
          maxOverlap = overlap;
          closestSection = id;
        }
      }

      setActiveSection(foundSection || closestSection);
    };

    // Run immediately on mount
    updateActiveSection();

    // IntersectionObserver with the desktop rootMargin (-22% top, -58% bottom)
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    let observer: IntersectionObserver | null = null;
    if (elements.length > 0 && typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        () => {
          updateActiveSection();
        },
        {
          rootMargin: '-22% 0px -58% 0px',
          threshold: [0, 0.2, 0.5],
        }
      );
      elements.forEach((el) => observer?.observe(el));
    }

    // Scroll listener with RAF for 60/120fps stutter-free scroll tracking
    let rafId: number | null = null;
    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        updateActiveSection();
        rafId = null;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      if (observer) observer.disconnect();
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      if (clickTimeoutRef.current) window.clearTimeout(clickTimeoutRef.current);
    };
  }, [isHomePage]);

  const scrollTo = (id: string) => {
    setIsMobileMenuOpen(false);
    if (isHomePage) {
      setActiveSection(id);
      isClickScrollingRef.current = true;
      if (clickTimeoutRef.current) window.clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = window.setTimeout(() => {
        isClickScrollingRef.current = false;
      }, 650);
    }
    navigateToSection(id);
  };

  const handleProfileClick = () => {
    setIsMobileMenuOpen(false);
    if (isCustomer) {
      onOpenProfile?.();
    } else {
      openAuthModal('login', 'Sign in to access your customer profile & saved details.');
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${isScrolled
          ? 'bg-[#FFFBF7]/98 backdrop-blur-md border-b border-[#EEDDCC] shadow-sm'
          : 'bg-[#FFFBF7]/90 backdrop-blur-sm border-b border-[#EEDDCC]/70'
        }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Brand Logo & Title (Flexible, responsive typography to fit full name cleanly) */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => scrollTo('home')}
          className="flex items-center gap-1.5 min-[375px]:gap-2 sm:gap-3 group text-left cursor-pointer flex-1 min-w-0 py-1"
          aria-label={`${cafeName} Home`}
        >
          <div className="w-8 h-8 min-[375px]:w-9 min-[375px]:h-9 sm:w-11 sm:h-11 rounded-2xl bg-white p-1 shadow-xs border border-[#EEDDCC] flex items-center justify-center shrink-0 group-hover:shadow-md group-hover:border-[#FE8E2A]/50 transition-all">
            <img
              src="/assets/Logo.jpeg"
              alt={cafeName}
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
          <div className="min-w-0 flex-1">
            <span className="font-serif font-extrabold text-[13.5px] min-[360px]:text-[14.5px] min-[375px]:text-[15.5px] min-[390px]:text-base sm:text-lg xl:text-xl text-[#2B1408] tracking-tight block leading-tight whitespace-nowrap">
              {cafeName}
            </span>
          </div>
        </motion.button>

        {/* Center: Desktop Navigation Links with responsive typography & active indicator */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 2xl:gap-2">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <motion.button
                key={item.id}
                type="button"
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => scrollTo(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative px-3 py-1.5 xl:px-3.5 xl:py-2 rounded-xl text-[14.5px] xl:text-[15.5px] font-semibold transition-all duration-200 cursor-pointer select-none ${isActive
                    ? 'text-[#E67616] bg-[#FFF0DF] font-bold shadow-xs'
                    : 'text-[#2B1408] hover:text-[#E67616] hover:bg-[#FFF0DF]/70'
                  }`}
              >
                <span>{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeNavIndicator"
                    className="absolute bottom-0.5 left-2.5 right-2.5 h-[2.5px] bg-[#FE8E2A] rounded-full shadow-xs"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Right: Actions (Cart & Profile on desktop only; Hamburger menu on mobile) */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Cart Button (Desktop only - mobile uses bottom navigation) */}
          <motion.button
            type="button"
            whileHover={{ y: -1, scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setIsCartOpen(true)}
            className="hidden lg:flex relative px-4 py-2.5 rounded-2xl bg-[#FFF0DF] hover:bg-[#FFE4CC] text-[#2B1408] font-bold items-center justify-center gap-2 transition-all border border-[#EEDDCC] shadow-2xs min-h-[44px] min-w-[44px] cursor-pointer"
            aria-label={`View Cart${totalCartCount > 0 ? `: ${totalCartCount} items` : ''}`}
          >
            <ShoppingBag size={18} className="text-[#FE8E2A] shrink-0" />
            <span className="text-xs uppercase tracking-wider font-extrabold text-[#2B1408]">Cart</span>
            {totalCartCount > 0 && (
              <motion.span
                key={totalCartCount}
                initial={{ scale: 0.7 }}
                animate={{ scale: [1, 1.25, 1] }}
                transition={{ duration: 0.3 }}
                className="w-5 h-5 rounded-full bg-[#FE8E2A] text-white text-[10px] font-black flex items-center justify-center shadow-xs"
              >
                {totalCartCount}
              </motion.span>
            )}
          </motion.button>

          {/* Customer Auth Button (Desktop only - mobile uses bottom navigation) */}
          {isCustomer ? (
            <div className="hidden lg:flex items-center gap-1 sm:gap-2">
              <motion.button
                type="button"
                whileHover={{ y: -1, scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleProfileClick}
                className="flex items-center gap-2 px-3 py-2 rounded-2xl hover:bg-[#FDF6EE] text-left transition cursor-pointer border border-transparent hover:border-[#EEDDCC] min-h-[44px] min-w-[44px]"
                aria-label="Open Profile"
              >
                <div className="w-8 h-8 rounded-xl bg-[#FFF0DF] border border-[#FE8E2A]/30 text-[#2B1408] font-bold text-xs flex items-center justify-center shrink-0">
                  <UserIcon size={16} className="text-[#FE8E2A]" />
                </div>
                <div className="flex flex-col items-start min-w-0">
                  <span className="text-xs font-bold text-[#2B1408] leading-tight truncate max-w-[120px]">
                    {user?.fullName}
                  </span>
                  <span className="text-[10px] text-[#7A5C4A] font-medium">Customer</span>
                </div>
              </motion.button>

              <motion.button
                type="button"
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={logout}
                title="Sign Out"
                className="p-2.5 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 transition min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
                aria-label="Log out"
              >
                <LogOut size={17} />
              </motion.button>
            </div>
          ) : (
            <motion.button
              type="button"
              whileHover={{ y: -1, scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => openAuthModal('login')}
              className="hidden lg:flex px-4 py-2.5 rounded-2xl bg-[#2B1408] hover:bg-[#4A2B18] text-white text-xs font-bold items-center justify-center gap-1.5 transition-all shadow-xs min-h-[44px] min-w-[44px] cursor-pointer"
              aria-label="Sign In"
            >
              <UserIcon size={16} className="text-[#FE8E2A] shrink-0" />
              <span>Sign In</span>
            </motion.button>
          )}

          {/* Mobile Hamburger Menu Toggle */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="lg:hidden p-2.5 rounded-2xl text-[#2B1408] hover:bg-[#FDF6EE] transition min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer border border-transparent hover:border-[#EEDDCC] shrink-0"
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {isMobileMenuOpen ? <X size={20} /> : <MenuIcon size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden border-t border-[#EEDDCC] bg-[#FFFBF7] px-4 py-3 space-y-1 shadow-lg animate-in fade-in slide-in-from-top-2 duration-150">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => scrollTo(item.id)}
                className={`w-full text-left py-3 px-3.5 rounded-xl text-sm font-semibold transition min-h-[44px] flex items-center justify-between ${isActive
                    ? 'text-[#FE8E2A] bg-[#FFF0DF] font-bold'
                    : 'text-[#2B1408] hover:bg-[#FFF0DF]/60 hover:text-[#FE8E2A]'
                  }`}
              >
                <span>{item.label}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-[#FE8E2A]" />}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
