import React, { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useReducedMotion, Variants } from 'framer-motion';
import { Utensils, Sparkles, Heart, Clock, Award } from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useDesktopTilt } from '../../utils/useDesktopTilt';
import { cafeConfig } from '../../config/business';

// Canonical permanent static hero assets
const HERO_IMAGE_SRC = '/assets/Hero.jpg';
const HERO_IMAGE_MOBILE_SRC = '/assets/Hero_mobile.jpg';

const DESCRIPTION_TEXT =
  'Great food, refreshing drinks, and cozy moments at Tryit Cafe & Kitchen. Explore our menu, find your favorites, and order with ease.';

const InstagramIcon: React.FC<{ size?: number; className?: string }> = ({ size = 18, className = '' }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`shrink-0 ${className}`}
    aria-hidden="true"
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const SparkleGlint: React.FC<{ shouldReduceMotion?: boolean }> = ({ shouldReduceMotion }) => {
  if (shouldReduceMotion) return null;
  return (
    <motion.span
      className="absolute -top-1 -right-3.5 sm:-top-2 sm:-right-5 inline-flex items-center justify-center text-[#FE8E2A] pointer-events-none select-none z-10"
      initial={{ opacity: 0, scale: 0.5, x: -3 }}
      animate={{
        opacity: [0, 1, 0, 0],
        scale: [0.5, 1, 0.7, 0.5],
        x: [-3, 0, 3, 3],
      }}
      transition={{
        duration: 0.65,
        times: [0, 0.35, 0.7, 1],
        repeat: Infinity,
        repeatDelay: 4.8,
        delay: 0.6,
        ease: 'easeInOut',
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        width="16"
        height="16"
        className="fill-current drop-shadow-[0_0_8px_rgba(254,142,42,0.9)] sm:w-5 sm:h-5"
      >
        <path d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z" />
      </svg>
    </motion.span>
  );
};

export const HeroSection: React.FC = () => {
  const { settings, isOnlineOrderingOpen } = useSettingsStore();
  const { user, isAuthenticated } = useAuthStore();
  const shouldReduceMotion = useReducedMotion();

  const orderingOpen = isOnlineOrderingOpen();
  const cafeName = settings?.cafeName?.replace(/TryIt/g, 'Tryit') || 'Tryit Cafe & Kitchen';
  const instagramUrl =
    cafeConfig.getInstagramUrl(settings?.instagramUrl) || '#';

  const heroSubheading =
    settings?.heroSubheading &&
      !settings.heroSubheading.toLowerCase().includes('pasta') &&
      !settings.heroSubheading.toLowerCase().includes('burger') &&
      !settings.heroSubheading.toLowerCase().includes('sizzler') &&
      !settings.heroSubheading.toLowerCase().includes('starter')
      ? settings.heroSubheading
      : DESCRIPTION_TEXT;

  // Single-run typing reveal animation: 500ms delay, ~15ms/char pace (~2.0s duration)
  const [typedCharCount, setTypedCharCount] = useState(
    shouldReduceMotion ? DESCRIPTION_TEXT.length : 0
  );
  const [isTypingDone, setIsTypingDone] = useState(Boolean(shouldReduceMotion));

  useEffect(() => {
    if (shouldReduceMotion) {
      setTypedCharCount(DESCRIPTION_TEXT.length);
      setIsTypingDone(true);
      return;
    }

    let intervalId: ReturnType<typeof setInterval> | null = null;
    const timeoutId = setTimeout(() => {
      let count = 0;
      const totalChars = DESCRIPTION_TEXT.length;
      intervalId = setInterval(() => {
        count += 1;
        setTypedCharCount(count);
        if (count >= totalChars) {
          if (intervalId) clearInterval(intervalId);
          setIsTypingDone(true);
        }
      }, 15);
    }, 500);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [shouldReduceMotion]);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Subtle 2.5D background scroll parallax (subtle 0-8px to avoid mobile repaint overhead)
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 400], [0, shouldReduceMotion ? 0 : 8]);

  // Desktop subtle mouse tilt
  const { ref: tiltRef, onMouseMove, onMouseLeave } = useDesktopTilt<HTMLDivElement>({
    maxTilt: 1.5,
    perspective: 1200,
    scale: 1,
  });

  const customerFirstName = user?.fullName ? user.fullName.split(' ')[0] : '';

  // Staggered lightweight 2D/2.5D entrance animations:
  // Badge: 0ms, Heading: 80ms, Tagline: 160ms, Description: 240ms, Explore Menu: 330ms, Connect Us: 400ms, Feature row: 480ms
  const getEntranceVariants = (delay: number, yOffset = 10, scaleInitial = 1): Variants => ({
    hidden: shouldReduceMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: yOffset, scale: scaleInitial },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: shouldReduceMotion
        ? { duration: 0 }
        : { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] },
    },
  });

  const badgeVariants = getEntranceVariants(0.0, 10, 0.97);
  const headingVariants = getEntranceVariants(0.08, 14);
  const taglineVariants = getEntranceVariants(0.16, 12);
  const descriptionVariants = getEntranceVariants(0.24, 10);

  const exploreBtnVariants: Variants = {
    hidden: shouldReduceMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 12, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: shouldReduceMotion
        ? { duration: 0 }
        : { duration: 0.5, delay: 0.33, ease: 'easeOut' },
    },
  };

  const connectBtnVariants: Variants = {
    hidden: shouldReduceMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 12, scale: 0.98 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: shouldReduceMotion
        ? { duration: 0 }
        : { duration: 0.5, delay: 0.40, ease: 'easeOut' },
    },
  };

  const featureRow1Variants: Variants = {
    hidden: shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: shouldReduceMotion
        ? { duration: 0 }
        : { duration: 0.4, delay: 0.48, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const featureRow2Variants: Variants = {
    hidden: shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: shouldReduceMotion
        ? { duration: 0 }
        : { duration: 0.4, delay: 0.58, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const featureIconVariants: Variants = {
    hidden: shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: shouldReduceMotion
        ? { duration: 0 }
        : { duration: 0.35, ease: 'easeOut' },
    },
  };

  return (
    <section
      id="home"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="relative overflow-hidden bg-stone-950 text-white hero-mobile-viewport flex flex-col justify-center border-b border-stone-800/80"

    >
      {/* Full-bleed Static Hero Background with Subtle 2.5D Entry Scale & Parallax */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        <motion.img
          src={HERO_IMAGE_SRC}
          srcSet={`${HERO_IMAGE_MOBILE_SRC} 720w, ${HERO_IMAGE_SRC} 1440w`}
          sizes="(max-width: 640px) 100vw, 100vw"
          alt={`${cafeName} Ambience`}
          style={{ y: bgY }}
          initial={shouldReduceMotion ? { scale: 1, opacity: 0.85 } : { scale: 1.06, opacity: 0.85 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-full object-cover object-[center_36%] sm:object-[center_45%]"
          loading="eager"
          decoding="async"
        />

        {/* Floating 2.5D Ambient Warm Glow Layer (Subtle, strictly contained to eliminate horizontal overflow) */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 0.3 } : { opacity: 0.3, scale: 1 }}
          animate={
            shouldReduceMotion
              ? { opacity: 0.3 }
              : {
                opacity: [0.3, 0.45, 0.3],
                scale: [1, 1.03, 1],
              }
          }
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute -top-12 left-1/2 -translate-x-1/2 w-[340px] sm:w-[540px] h-[340px] sm:h-[540px] rounded-full bg-gradient-to-br from-[#FE8E2A]/15 via-[#FE8E2A]/5 to-transparent blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        {/* Desktop horizontal cinematic vignette: preserves high readability on left while revealing cafe on right */}
        <div
          className="hidden sm:block absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(12, 10, 8, 0.94) 0%, rgba(12, 10, 8, 0.82) 42%, rgba(12, 10, 8, 0.48) 72%, rgba(12, 10, 8, 0.16) 100%)',
          }}
        />

        {/* Mobile vertical vignette: ensures strong text contrast on narrow viewports */}
        <div
          className="sm:hidden absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(12, 10, 8, 0.92) 0%, rgba(12, 10, 8, 0.74) 42%, rgba(12, 10, 8, 0.88) 100%)',
          }}
        />

        {/* Bottom smooth subtle fade into the page background */}
        <div className="absolute inset-x-0 bottom-0 h-16 sm:h-20 bg-gradient-to-t from-stone-950/95 via-stone-950/40 to-transparent" />

        {/* Top subtle fade under navbar */}
        <div className="absolute inset-x-0 top-0 h-10 sm:h-16 bg-gradient-to-b from-stone-950/60 to-transparent" />
      </div>

      {/* Main Content Container: Naturally balanced for mobile customer UX with comfortable breathing room */}
      <div className="relative z-10 w-full max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 pt-7 min-[390px]:pt-10 min-[412px]:pt-12 pb-6 min-[390px]:pb-8 sm:py-8 lg:py-10 sm:my-auto">
        <div
          ref={tiltRef}
          className="max-w-[680px] text-left transition-transform duration-300 ease-out will-change-transform"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* 1. Dynamic Customer Welcome / Guest Greeting Badge */}
          <motion.div
            variants={badgeVariants}
            initial="hidden"
            animate="visible"
            className="mb-2 sm:mb-3 inline-block"
          >
            {isAuthenticated && user ? (
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-[#FE8E2A]/20 border border-[#FE8E2A]/40 text-[#FE8E2A] text-[11px] sm:text-sm font-bold backdrop-blur-md shadow-2xs">
                <span>Welcome back, {customerFirstName || user.fullName} 👋</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-[#FE8E2A]/20 border border-[#FE8E2A]/40 text-[#FE8E2A] text-[11px] sm:text-xs font-semibold uppercase tracking-wider backdrop-blur-md shadow-2xs">
                <Sparkles size={13} className="text-[#FE8E2A] animate-pulse" />
                <span>Welcome to {cafeName}</span>
              </div>
            )}
          </motion.div>

          {/* 2. Brand Title: Responsive clamp-based size with subtle star glint */}
          <motion.h1
            variants={headingVariants}
            initial="hidden"
            animate="visible"
            className="text-[clamp(2.05rem,8.6vw,2.55rem)] sm:text-[clamp(2.75rem,4.2vw,3.85rem)] lg:text-[clamp(3rem,4.5vw,4.5rem)] font-black tracking-tight text-white leading-[1.06] sm:leading-[1.1] mb-1.5 sm:mb-2 font-serif drop-shadow-sm inline-block"
          >
            <span className="relative inline-block">
              {cafeName.toUpperCase()}
              <SparkleGlint shouldReduceMotion={Boolean(shouldReduceMotion)} />
            </span>
          </motion.h1>

          {/* 3. Tagline with Increased Prominence and Subtle Premium Shimmer */}
          <motion.p
            variants={taglineVariants}
            initial="hidden"
            animate="visible"
            className="text-[clamp(1.25rem,5.5vw,1.5rem)] sm:text-xl lg:text-2xl font-medium mb-2 min-[390px]:mb-2.5 sm:mb-3 font-serif italic drop-shadow-2xs leading-snug"
          >
            <span className={shouldReduceMotion ? 'text-[#FE8E2A]' : 'tagline-shimmer'}>
              &ldquo;Try it until you love it&rdquo;
            </span>
          </motion.p>

          {/* 4. Descriptive Subheading: Zero-Layout-Shift Typing Reveal */}
          <motion.div
            variants={descriptionVariants}
            initial="hidden"
            animate="visible"
            className="relative mb-3.5 min-[390px]:mb-4 sm:mb-6 max-w-[640px]"
          >
            {/* Layout Reservation Layer: Invisibly fixes the exact text footprint to avoid layout shift */}
            <p
              className="invisible select-none pointer-events-none text-[12.5px] min-[390px]:text-[13.5px] sm:text-base leading-[1.4] sm:leading-relaxed font-normal"
              aria-hidden="true"
            >
              <span className="sm:hidden">{DESCRIPTION_TEXT}</span>
              <span className="hidden sm:inline">{heroSubheading}</span>
            </p>

            {/* Active Typing Display Layer: Exact coordinates overlay */}
            <p
              className="absolute inset-0 text-stone-200/90 text-[12.5px] min-[390px]:text-[13.5px] sm:text-base leading-[1.4] sm:leading-relaxed font-normal drop-shadow-xs"
              aria-hidden="true"
            >
              <span className="sm:hidden">{DESCRIPTION_TEXT.slice(0, typedCharCount)}</span>
              <span className="hidden sm:inline">
                {isTypingDone
                  ? heroSubheading
                  : heroSubheading.slice(0, Math.min(typedCharCount, heroSubheading.length))}
              </span>
              {!isTypingDone && !shouldReduceMotion && (
                <span
                  className="inline-block w-[1.5px] h-[1em] bg-[#FE8E2A] ml-0.5 align-middle animate-pulse"
                  aria-hidden="true"
                />
              )}
            </p>

            {/* Accessible Semantic Text for Screen Readers and SEO */}
            <span className="sr-only">
              {DESCRIPTION_TEXT}
            </span>
          </motion.div>

          {/* 5. Call To Action Buttons: Compact centered buttons on mobile, spacious side-by-side on desktop */}
          <div className="flex flex-col sm:flex-row items-center sm:items-center justify-center sm:justify-start gap-2.5 sm:gap-4 mb-3 min-[390px]:mb-3.5 sm:mb-6 w-full">
            <motion.button
              variants={exploreBtnVariants}
              initial="hidden"
              animate="visible"
              whileHover={
                shouldReduceMotion
                  ? undefined
                  : {
                    y: -2,
                    filter: 'brightness(1.06)',
                    boxShadow: '0 8px 22px -4px rgba(254, 142, 42, 0.45)',
                    transition: { duration: 0.18 },
                  }
              }
              whileTap={
                shouldReduceMotion
                  ? undefined
                  : {
                    scale: 0.97,
                    transition: { duration: 0.15 },
                  }
              }
              onClick={() => scrollToSection('menu')}
              className="group w-full min-[360px]:w-auto min-[360px]:min-w-[220px] max-w-[260px] sm:max-w-none px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-[#FE8E2A] hover:bg-[#E67616] active:bg-[#C65A08] text-white font-extrabold text-[13.5px] sm:text-base flex items-center justify-center gap-2 sm:gap-2.5 shadow-md shadow-[#FE8E2A]/20 transition-all cursor-pointer min-h-[48px] h-12 select-none"
            >
              <Utensils
                size={16}
                className="sm:size-[18px] transition-transform duration-200 group-hover:translate-x-0.5 group-active:translate-x-0.5 shrink-0"
              />
              <span>Explore Menu</span>
            </motion.button>

            <motion.a
              variants={connectBtnVariants}
              initial="hidden"
              animate="visible"
              whileHover={
                shouldReduceMotion
                  ? undefined
                  : {
                    y: -2,
                    filter: 'brightness(1.15)',
                    borderColor: 'rgba(254, 142, 42, 0.75)',
                    boxShadow: '0 4px 16px -2px rgba(254, 142, 42, 0.25)',
                    transition: { duration: 0.18 },
                  }
              }
              whileTap={
                shouldReduceMotion
                  ? undefined
                  : {
                    scale: 0.97,
                    transition: { duration: 0.15 },
                  }
              }
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group w-full min-[360px]:w-auto min-[360px]:min-w-[220px] max-w-[260px] sm:max-w-none px-6 sm:px-8 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl bg-[#2B1408]/85 hover:bg-[#1E0D05] border border-[#FE8E2A]/35 text-white font-bold text-[13.5px] sm:text-base flex items-center justify-center gap-2 sm:gap-2.5 backdrop-blur-md transition-all cursor-pointer min-h-[48px] h-12 select-none"
              aria-label="Connect Us on Instagram"
            >
              <InstagramIcon
                size={16}
                className="text-[#FE8E2A] transition-transform duration-200 group-hover:scale-105 group-active:scale-105 shrink-0"
              />
              <span>Connect Us</span>
            </motion.a>
          </div>

          {/* 6. Feature Highlights: 2+1 layout on mobile, 3 columns on tablet/desktop */}
          <div className="pt-2 sm:pt-3.5 border-t border-white/15 text-left max-w-xl mx-auto sm:mx-0 w-full">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-2.5 sm:gap-x-4 lg:gap-x-6 gap-y-2 sm:gap-y-0">
              {/* Row 1, Col 1: Fresh Kitchen / Handcrafted */}
              <motion.div
                variants={featureRow1Variants}
                initial="hidden"
                animate="visible"
                whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                className="flex items-center gap-1.5 sm:gap-2.5 group cursor-default min-w-0"
              >
                <motion.div
                  variants={featureIconVariants}
                  initial="hidden"
                  animate="visible"
                  className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-[#FE8E2A] shrink-0 group-hover:bg-[#FE8E2A]/20 transition-all"
                >
                  <Heart size={13} className="sm:size-4 group-hover:scale-110 transition-transform" />
                </motion.div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] sm:text-xs text-stone-400 font-medium leading-tight">Fresh Kitchen</p>
                  <p className="text-[12px] min-[390px]:text-[12.5px] sm:text-sm font-bold text-stone-100 leading-tight mt-0.5">Handcrafted</p>
                </div>
              </motion.div>

              {/* Row 1, Col 2: Quality / 100% Fresh */}
              <motion.div
                variants={featureRow1Variants}
                initial="hidden"
                animate="visible"
                whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                className="flex items-center gap-1.5 sm:gap-2.5 group cursor-default min-w-0"
              >
                <motion.div
                  variants={featureIconVariants}
                  initial="hidden"
                  animate="visible"
                  className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-emerald-400 shrink-0 group-hover:bg-emerald-500/20 transition-all"
                >
                  <Award size={13} className="sm:size-4 group-hover:scale-110 transition-transform" />
                </motion.div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] sm:text-xs text-stone-400 font-medium leading-tight">Quality</p>
                  <p className="text-[12px] min-[390px]:text-[12.5px] sm:text-sm font-bold text-stone-100 leading-tight mt-0.5">100% Fresh</p>
                </div>
              </motion.div>

              {/* Row 2 (Mobile Spanned & Centered) / Col 3 (Tablet/Desktop): Convenient / Ordering Open */}
              <motion.div
                variants={featureRow2Variants}
                initial="hidden"
                animate="visible"
                whileHover={shouldReduceMotion ? undefined : { y: -2 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
                className="col-span-2 justify-self-center sm:col-span-1 sm:justify-self-auto flex items-center gap-1.5 sm:gap-2.5 group cursor-default min-w-0"
              >
                <motion.div
                  variants={featureIconVariants}
                  initial="hidden"
                  animate="visible"
                  className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-[#FE8E2A] shrink-0 group-hover:bg-[#FE8E2A]/20 transition-all"
                >
                  <Clock size={13} className="sm:size-4 group-hover:scale-110 transition-transform" />
                </motion.div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] sm:text-xs text-stone-400 font-medium leading-tight">Convenient</p>
                  <p className="text-[12px] min-[390px]:text-[12.5px] sm:text-sm font-bold text-stone-100 leading-tight mt-0.5">
                    {orderingOpen ? 'Ordering Open' : 'Browse Only'}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

