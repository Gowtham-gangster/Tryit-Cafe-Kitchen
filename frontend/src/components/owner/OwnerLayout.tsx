import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  UtensilsCrossed,
  FolderTree,
  Tag,
  Camera,
  Star,
  Clock,
  User,
  LogOut,
  Menu as MenuIcon,
  X,
  Coffee,
  ExternalLink,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { modalBackdrop } from '../../utils/animations';
import {
  prefetchOwnerMenu,
  prefetchOwnerCategories,
  prefetchOwnerOffers,
  prefetchOwnerGallery,
  prefetchOwnerReviews,
  prefetchOwnerBusinessHours,
  prefetchOwnerDashboard,
} from '../../routes/routePrefetch';

export const OwnerLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/owner/login');
  };

  const navLinks = [
    { to: '/owner/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/owner/menu', label: 'Menu Dishes', icon: UtensilsCrossed },
    { to: '/owner/categories', label: 'Categories', icon: FolderTree },
    { to: '/owner/offers', label: 'Offers & Deals', icon: Tag },
    { to: '/owner/gallery', label: 'Gallery Media', icon: Camera },
    { to: '/owner/reviews', label: 'Reviews Moderation', icon: Star },
    { to: '/owner/business-hours', label: 'Business Hours', icon: Clock },
    { to: '/owner/profile', label: 'Owner Profile', icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#FDF6EE] flex flex-col md:flex-row">
      {/* 1. Mobile Top Bar */}
      <div className="md:hidden bg-[#1E0D05] text-[#D8C7BC] px-4 py-3 flex items-center justify-between sticky top-0 z-40 border-b border-[#3B1E12]">
        <Link
          to="/owner/dashboard"
          className="flex items-center gap-2.5 cursor-pointer select-none active:opacity-80 transition-opacity"
          aria-label="Go to Owner Dashboard"
        >
          <img
            src="/assets/Logo.jpeg"
            alt="TryIt Cafe"
            className="w-8 h-8 rounded-lg object-contain bg-white p-0.5 shadow-sm shrink-0"
          />
          <span className="font-serif font-bold text-sm text-white hover:text-[#FE8E2A] transition-colors">
            TryIt Owner
          </span>
        </Link>

        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg bg-[#2B1408] text-[#D8C7BC] min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
          aria-label="Toggle owner navigation"
        >
          {mobileOpen ? <X size={20} /> : <MenuIcon size={20} />}
        </motion.button>
      </div>

      {/* Mobile Backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            variants={modalBackdrop}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setMobileOpen(false)}
            className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-xs"
          />
        )}
      </AnimatePresence>

      {/* 2. Sidebar (Desktop & Mobile Drawer) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#1E0D05] text-[#D8C7BC] p-6 flex flex-col justify-between transform transition-transform duration-300 md:relative md:translate-x-0 border-r border-[#3B1E12] ${
          mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Brand */}
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-[#3B1E12]">
            <Link
              to="/owner/dashboard"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 cursor-pointer group select-none"
              aria-label="Go to Owner Dashboard"
            >
              <img
                src="/assets/Logo.jpeg"
                alt="TryIt Cafe"
                className="w-11 h-11 rounded-2xl object-contain bg-white p-0.5 shadow-md border border-[#4A2B18] shrink-0 group-hover:scale-105 transition-transform"
              />
              <div>
                <h2 className="font-serif font-bold text-white text-base group-hover:text-[#FE8E2A] transition-colors">
                  TryIt Cafe
                </h2>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#FE8E2A]">
                  Owner Portal
                </span>
              </div>
            </Link>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setMobileOpen(false)}
              className="md:hidden text-[#BFAEA2] hover:text-white p-1 cursor-pointer"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </motion.button>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const handlePrefetch = () => {
                if (link.to.includes('menu')) prefetchOwnerMenu();
                else if (link.to.includes('categories')) prefetchOwnerCategories();
                else if (link.to.includes('offers')) prefetchOwnerOffers();
                else if (link.to.includes('gallery')) prefetchOwnerGallery();
                else if (link.to.includes('reviews')) prefetchOwnerReviews();
                else if (link.to.includes('business-hours')) prefetchOwnerBusinessHours();
                else if (link.to.includes('dashboard')) prefetchOwnerDashboard();
              };

              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  onMouseEnter={handlePrefetch}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all min-h-[44px] ${
                      isActive
                        ? 'bg-[#FE8E2A] text-white shadow-md shadow-[#FE8E2A]/25'
                        : 'hover:bg-[#2B1408] text-[#BFAEA2] hover:text-white'
                    }`
                  }
                >
                  <Icon size={18} />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Info & Actions */}
        <div className="pt-6 border-t border-stone-800 space-y-3">
          <Link
            to="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-stone-800/80 hover:bg-stone-800 text-stone-300 text-xs font-bold transition-colors min-h-[40px]"
          >
            <span className="flex items-center gap-2">
              <ExternalLink size={14} />
              <span>View Customer App</span>
            </span>
          </Link>

          <div className="flex items-center justify-between px-2 pt-2">
            <div>
              <p className="text-xs font-bold text-white truncate max-w-[130px]">
                {user?.fullName || 'Owner'}
              </p>
              <p className="text-[10px] text-stone-500 font-mono">{user?.phone}</p>
            </div>

            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleLogout}
              title="Logout"
              className="p-2.5 rounded-xl text-stone-400 hover:text-red-400 hover:bg-stone-800 transition-colors min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
              aria-label="Logout"
            >
              <LogOut size={16} />
            </motion.button>
          </div>
        </div>
      </aside>

      {/* 3. Main Dashboard Content (Full available content utilization) */}
      <main className="flex-1 w-full max-w-[1720px] p-4 sm:p-6 lg:p-8 2xl:p-10 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

