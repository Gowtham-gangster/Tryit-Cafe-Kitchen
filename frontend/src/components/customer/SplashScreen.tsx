import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Utensils, Sparkles } from 'lucide-react';

export const SplashScreen: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem('tryit_splash_seen');
    if (!hasSeenSplash) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        sessionStorage.setItem('tryit_splash_seen', 'true');
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('tryit_splash_seen', 'true');
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          onClick={handleDismiss}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#18130F] text-white select-none cursor-pointer overflow-hidden px-6"
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
            <div className="absolute w-72 h-72 rounded-full bg-amber-500/15 blur-[90px] -top-12 -right-12" />
            <div className="absolute w-72 h-72 rounded-full bg-orange-600/10 blur-[90px] -bottom-12 -left-12" />
          </div>

          {/* Logo & Icon Badge */}
          <motion.div
            initial={{ scale: 0.6, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
            className="relative flex items-center justify-center w-28 h-28 rounded-3xl bg-white shadow-2xl mb-6 p-1.5 border border-[#FE8E2A]/40"
          >
            <img
              src="/assets/Logo.jpeg"
              alt="TryIt Cafe & Kitchen"
              className="w-full h-full object-contain rounded-2xl"
            />
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full bg-[#FE8E2A] text-white flex items-center justify-center shadow-lg"
            >
              <Sparkles className="w-4 h-4" />
            </motion.div>
          </motion.div>

          {/* Typography */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
            className="text-center"
          >
            <h1 className="font-serif text-3xl font-black tracking-tight text-white sm:text-4xl">
              TryIt <span className="text-amber-400 italic">Cafe & Kitchen</span>
            </h1>
            <p className="text-stone-400 text-sm mt-2 font-medium tracking-wide uppercase text-[11px]">
              Delicious Comfort Food · Crafted With Passion
            </p>
          </motion.div>

          {/* Progress Pulse */}
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 90, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.9, ease: 'easeInOut' }}
            className="h-1 bg-gradient-to-r from-amber-500 to-amber-300 rounded-full mt-8"
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 1 }}
            className="absolute bottom-8 text-[11px] text-stone-500 tracking-wider"
          >
            Tap anywhere to enter
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
