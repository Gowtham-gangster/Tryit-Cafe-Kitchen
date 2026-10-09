import React, { useState, useEffect } from 'react';
import { Home, UtensilsCrossed, Tag, ShoppingBag, User as UserIcon } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useCustomerNavigation } from '../../utils/navigation';

interface BottomNavProps {
  onOpenProfile: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenProfile }) => {
  const { getTotalCount, setIsCartOpen } = useCartStore();
  const { user, isAuthenticated, openAuthModal } = useAuthStore();
  const { navigateToSection, isHomePage } = useCustomerNavigation();
  const totalItems = getTotalCount();
  const [activeSection, setActiveSection] = useState<'home' | 'menu' | 'offers' | ''>('home');

  useEffect(() => {
    if (!isHomePage) {
      setActiveSection('');
      return;
    }

    let rafId: number | null = null;
    const handleScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        const scrollY = window.scrollY;
        const offersEl = document.getElementById('offers');
        const menuEl = document.getElementById('menu');

        const offersTop = offersEl ? offersEl.offsetTop - 140 : Infinity;
        const offersBottom = offersEl ? offersTop + offersEl.offsetHeight : Infinity;
        const menuTop = menuEl ? menuEl.offsetTop - 140 : Infinity;

        if (scrollY < 200) {
          setActiveSection('home');
        } else if (scrollY >= offersTop && scrollY < offersBottom) {
          setActiveSection('offers');
        } else if (scrollY >= menuTop) {
          setActiveSection('menu');
        }
        rafId = null;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, [isHomePage]);

  const scrollTo = (id: string) => {
    if (isHomePage && (id === 'home' || id === 'offers' || id === 'menu')) {
      setActiveSection(id as 'home' | 'menu' | 'offers');
    }
    navigateToSection(id);
  };

  const isCustomer = isAuthenticated && user && user.role === 'ROLE_CUSTOMER';

  const handleProfileClick = () => {
    if (isCustomer) {
      onOpenProfile();
    } else {
      openAuthModal('login', 'Sign in to access your profile & saved details.');
    }
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FFFBF7]/95 backdrop-blur-xl border-t border-[#EEDDCC] shadow-2xl px-2 sm:px-3 py-1.5 sm:py-2 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))]">
      <div className="grid grid-cols-5 items-center justify-around max-w-md mx-auto">
        {/* 1. Home */}
        <button
          type="button"
          onClick={() => scrollTo('home')}
          className={`flex flex-col items-center gap-1 transition-colors py-1.5 px-1 min-h-[44px] cursor-pointer ${
            activeSection === 'home' ? 'text-[#FE8E2A] font-extrabold' : 'text-[#7A5C4A] hover:text-[#FE8E2A]'
          }`}
          aria-label="Home"
        >
          <Home size={20} className={activeSection === 'home' ? 'text-[#FE8E2A]' : ''} />
          <span className="text-[10px] font-bold tracking-tight">Home</span>
        </button>

        {/* 2. Menu */}
        <button
          type="button"
          onClick={() => scrollTo('menu')}
          className={`flex flex-col items-center gap-1 transition-colors py-1.5 px-1 min-h-[44px] cursor-pointer ${
            activeSection === 'menu' ? 'text-[#FE8E2A] font-extrabold' : 'text-[#7A5C4A] hover:text-[#FE8E2A]'
          }`}
          aria-label="Menu"
        >
          <UtensilsCrossed size={20} className={activeSection === 'menu' ? 'text-[#FE8E2A]' : ''} />
          <span className="text-[10px] font-bold tracking-tight">Menu</span>
        </button>

        {/* 3. Offers */}
        <button
          type="button"
          onClick={() => scrollTo('offers')}
          className={`flex flex-col items-center gap-1 transition-colors py-1.5 px-1 min-h-[44px] cursor-pointer ${
            activeSection === 'offers' ? 'text-[#FE8E2A] font-extrabold' : 'text-[#7A5C4A] hover:text-[#FE8E2A]'
          }`}
          aria-label="Offers"
        >
          <Tag size={20} className={activeSection === 'offers' ? 'text-[#FE8E2A]' : ''} />
          <span className="text-[10px] font-bold tracking-tight">Offers</span>
        </button>

        {/* 4. Cart */}
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center gap-1 text-[#2B1408] hover:text-[#FE8E2A] font-bold py-1.5 px-1 min-h-[44px] cursor-pointer"
          aria-label="View cart"
        >
          <div className="relative">
            <ShoppingBag size={20} className="text-[#FE8E2A]" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2.5 w-4 h-4 rounded-full bg-[#FE8E2A] text-white text-[9px] font-black flex items-center justify-center border-2 border-white shadow-xs">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold tracking-tight">Cart</span>
        </button>

        {/* 5. Profile */}
        <button
          type="button"
          onClick={handleProfileClick}
          className="flex flex-col items-center gap-1 text-[#7A5C4A] hover:text-[#FE8E2A] transition-colors py-1.5 px-1 min-h-[44px] cursor-pointer"
          aria-label={isCustomer ? 'Open profile' : 'Sign in'}
        >
          {isCustomer ? (
            <div className="w-5 h-5 rounded-full overflow-hidden border border-[#FE8E2A]/40 flex items-center justify-center bg-[#FFF0DF] shrink-0">
              {user?.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt={user.fullName || 'User'}
                  className="w-full h-full object-cover rounded-full"
                  referrerPolicy="no-referrer"
                />
              ) : user?.fullName?.trim() ? (
                <span className="text-[10px] font-black text-[#FE8E2A] leading-none">
                  {user.fullName.trim().charAt(0).toUpperCase()}
                </span>
              ) : (
                <UserIcon size={13} className="text-[#FE8E2A]" />
              )}
            </div>
          ) : (
            <UserIcon size={20} />
          )}
          <span className="text-[10px] font-bold tracking-tight">
            {isCustomer ? 'Profile' : 'Sign In'}
          </span>
        </button>
      </div>
    </nav>
  );
};
