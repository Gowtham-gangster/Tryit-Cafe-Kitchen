import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useSettingsStore } from '../../store/useSettingsStore';

export const OnlineOrderingBanner: React.FC = () => {
  const { isOnlineOrderingOpen, getClosureMessage, getNextOpeningTime } =
    useSettingsStore();
  const location = useLocation();

  const isOpen = isOnlineOrderingOpen();
  const closureMessage = getClosureMessage();
  const nextOpeningTime = getNextOpeningTime();

  const isHome = location.pathname === '/' || location.pathname === '';

  const bannerRef = useRef<HTMLElement>(null);
  const [bannerHeight, setBannerHeight] = useState(0);

  // Measure dynamic banner height to ensure the hero section never shifts downwards
  useEffect(() => {
    if (!bannerRef.current || isOpen) {
      document.documentElement.style.removeProperty('--ordering-banner-height');
      setBannerHeight(0);
      return;
    }

    const updateHeight = () => {
      if (bannerRef.current) {
        const h = bannerRef.current.offsetHeight;
        setBannerHeight(h);
        document.documentElement.style.setProperty(
          '--ordering-banner-height',
          `${h}px`
        );
      }
    };

    updateHeight();
    const ro = new ResizeObserver(updateHeight);
    ro.observe(bannerRef.current);

    window.addEventListener('resize', updateHeight);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateHeight);
      document.documentElement.style.removeProperty('--ordering-banner-height');
    };
  }, [isOpen, closureMessage, nextOpeningTime]);

  return (
    <AnimatePresence>
      {!isOpen && (
        <motion.aside
          ref={bannerRef}
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          role="region"
          aria-label="Online ordering status notification"
          className="sticky top-16 sm:top-20 z-35 bg-gradient-to-r from-red-950 via-rose-950 to-stone-950 text-white border-b border-red-500/35 shadow-md backdrop-blur-md"
          style={{
            marginBottom:
              isHome && bannerHeight > 0 ? `-${bannerHeight}px` : undefined,
          }}
        >
          <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-2 sm:py-2.5">
            {/* DESKTOP VIEW (sm:flex): Clean, single-row layout */}
            <div className="hidden sm:flex items-center justify-between gap-4">
              {/* Left: Tag + Full Closure Message */}
              <div className="flex items-center gap-2.5 min-w-0">
                <span
                  className="shrink-0 px-2.5 py-1 rounded-full bg-red-600/90 border border-red-400/50 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs"
                  role="status"
                  aria-live="polite"
                >
                  <span
                    className="w-2 h-2 rounded-full bg-white animate-pulse"
                    aria-hidden="true"
                  />
                  <span>Online Ordering Closed</span>
                </span>

                <p className="text-xs sm:text-sm text-red-100 font-medium whitespace-normal">
                  {closureMessage}
                </p>
              </div>

              {/* Right: Next Opening Time + Browsing Notice */}
              <div className="flex items-center gap-3 shrink-0">
                {nextOpeningTime && (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 text-white text-xs font-bold border border-white/15">
                    <Clock
                      size={13}
                      className="text-amber-300"
                      aria-hidden="true"
                    />
                    <span>Opens at {nextOpeningTime}</span>
                  </div>
                )}
                <span className="text-xs text-stone-300 font-semibold hidden md:inline">
                  Menu &amp; prices available for browsing
                </span>
              </div>
            </div>

            {/* MOBILE VIEW (< sm): Multi-line clean layout, no truncation, full message visible */}
            <div className="sm:hidden flex flex-col gap-1.5">
              {/* Row 1: Tag & Opening Time */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span
                  className="shrink-0 px-2 py-0.5 rounded-full bg-red-600/95 border border-red-400/50 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs"
                  role="status"
                  aria-live="polite"
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"
                    aria-hidden="true"
                  />
                  <span>Online Ordering Closed</span>
                </span>

                {nextOpeningTime && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 text-white text-[10px] font-bold border border-white/15 shrink-0">
                    <Clock
                      size={11}
                      className="text-amber-300"
                      aria-hidden="true"
                    />
                    <span>Opens at {nextOpeningTime}</span>
                  </div>
                )}
              </div>

              {/* Row 2: Full Closure Message (100% visible, no truncate!) */}
              {closureMessage && (
                <p className="text-[11px] text-red-100/95 font-medium leading-snug break-words">
                  {closureMessage}
                </p>
              )}
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};
