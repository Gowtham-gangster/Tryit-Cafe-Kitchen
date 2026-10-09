import React from 'react';
import { motion, useScroll, useTransform, useReducedMotion, Variants } from 'framer-motion';
import { Utensils, Sparkles, Heart, Clock, Award } from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useDesktopTilt } from '../../utils/useDesktopTilt';
import { cafeConfig } from '../../config/business';
import { InstagramIcon } from '../common/BrandIcons';

// Canonical permanent static hero assets
const HERO_IMAGE_SRC = '/assets/Hero.jpg';
const HERO_IMAGE_MOBILE_SRC = '/assets/Hero_mobile.jpg';

const DESCRIPTION_TEXT =
  'Great food, refreshing drinks, and cozy moments at Tryit Cafe & Kitchen. Explore our menu, find your favorites, and order with ease.';

const SparkleGlint: React.FC<{ shouldReduceMotion?: boolean | null }> = ({ shouldReduceMotion }) => {
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

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 400], [0, shouldReduceMotion ? 0 : 8]);

  // Desktop subtle mouse tilt
  const { onMouseMove, onMouseLeave } = useDesktopTilt<HTMLElement>({
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
          initial={shouldReduceMotion ? { scale: 1, opacity: 0.85 } : { scale: 1.04, opacity: 0.85 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-full object-cover object-[center_36%] sm:object-[center_45%]"
          loading="eager"
          decoding="async"
        />

        {/* Ambient Warm Glow */}
        <div
          className="absolute -top-12 left-1/2 -translate-x-1/2 w-[340px] sm:w-[540px] h-[340px] sm:h-[540px] rounded-full bg-gradient-to-br from-[#FE8E2A]/15 via-[#FE8E2A]/5 to-transparent blur-3xl pointer-events-none"
          aria-hidden="true"
        />

        {/* Desktop horizontal cinematic vignette: preserves high readability on left while revealing cafe on right */}
        <div
          className="hidden sm:block absolute inset-0"
          style={{
            background:
              'linear-gradient(90deg, rgba(14, 11, 8, 0.92) 0%, rgba(14, 11, 8, 0.78) 45%, rgba(14, 11, 8, 0.42) 75%, rgba(14, 11, 8, 0.15) 100%)',
          }}
        />

        {/* Mobile vertical vignette: ensures strong text contrast on narrow viewports */}
        <div
          className="sm:hidden absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(14, 11, 8, 0.90) 0%, rgba(14, 11, 8, 0.72) 45%, rgba(14, 11, 8, 0.86) 100%)',
          }}
        />

        {/* Bottom smooth subtle fade into the page background */}
        <div className="absolute inset-x-0 bottom-0 h-16 sm:h-20 bg-gradient-to-t from-stone-950/95 via-stone-950/40 to-transparent" />

        {/* Top subtle fade under navbar */}
        <div className="absolute inset-x-0 top-0 h-10 sm:h-16 bg-gradient-to-b from-stone-950/60 to-transparent" />
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-7 min-[390px]:pt-10 pb-6 min-[390px]:pb-8 sm:py-10 lg:py-12 sm:my-auto">
        <div className="max-w-[620px] text-left">
          {/* 1. Dynamic Customer Welcome / Guest Greeting Badge */}
          <motion.div
            variants={badgeVariants}
            initial="hidden"
            animate="visible"
            className="mb-2.5 sm:mb-3.5 inline-block"
          >
            {isAuthenticated && user ? (
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-[#FE8E2A]/15 border border-[#FE8E2A]/35 text-[#FE8E2A] text-xs sm:text-[13px] font-semibold backdrop-blur-md shadow-2xs">
                <span>Welcome back, {customerFirstName || user.fullName} 👋</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-white/10 border border-white/20 text-[#FFF8F0] text-[11px] sm:text-xs font-semibold uppercase tracking-wider backdrop-blur-md shadow-2xs">
                <span className="text-xs">✨</span>
                <span>Welcome to Tryit Cafe</span>
              </div>
            )}
          </motion.div>

          {/* 2. Brand Title: Tasteful, balanced heading scale with SparkleGlint */}
          <motion.h1
            variants={headingVariants}
            initial="hidden"
            animate="visible"
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-[1.12] sm:leading-[1.15] mb-2 font-serif relative inline-block"
          >
            <span>{cafeName}</span>
            <SparkleGlint shouldReduceMotion={shouldReduceMotion} />
          </motion.h1>

          {/* 3. Distinct Tagline with Shimmer */}
          <motion.p
            variants={taglineVariants}
            initial="hidden"
            animate="visible"
            className="text-lg sm:text-xl lg:text-2xl font-medium mb-3 sm:mb-4 font-serif italic leading-snug"
          >
            <span className={shouldReduceMotion ? 'text-[#FE8E2A]' : 'tagline-shimmer'}>
              &ldquo;Try it until you love it&rdquo;
            </span>
          </motion.p>

          {/* 4. Descriptive Subheading: Comfortable line length */}
          <motion.p
            variants={descriptionVariants}
            initial="hidden"
            animate="visible"
            className="text-xs min-[390px]:text-[13.5px] sm:text-[15px] lg:text-base text-stone-200/90 leading-relaxed mb-5 sm:mb-7 max-w-[540px]"
          >
            {heroSubheading}
          </motion.p>

          {/* 5. Call To Action Buttons: Compact fitted layout on mobile, prominent on desktop */}
          <div className="flex flex-row flex-wrap items-center justify-start gap-2.5 sm:gap-3.5 mb-5 sm:mb-7 w-auto">
            <motion.button
              variants={exploreBtnVariants}
              initial="hidden"
              animate="visible"
              whileHover={
                shouldReduceMotion
                  ? undefined
                  : {
                    y: -2,
                    scale: 1.02,
                    boxShadow: '0 8px 24px -4px rgba(254, 142, 42, 0.48)',
                    transition: { duration: 0.18 },
                  }
              }
              whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
              onClick={() => scrollToSection('menu')}
              className="group px-4.5 min-[390px]:px-5 sm:px-7 py-2.5 sm:py-3 rounded-xl bg-[#FE8E2A] hover:bg-[#E67616] active:bg-[#C65A08] text-white font-bold text-xs min-[390px]:text-sm sm:text-base inline-flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer h-10.5 sm:h-12 select-none shrink-0"
            >
              <span className="text-sm sm:text-base shrink-0">🍽️</span>
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
                    scale: 1.02,
                    borderColor: 'rgba(254, 142, 42, 0.7)',
                    backgroundColor: 'rgba(255, 255, 255, 0.16)',
                    boxShadow: '0 4px 16px -2px rgba(254, 142, 42, 0.25)',
                    transition: { duration: 0.18 },
                  }
              }
              whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group px-4 min-[390px]:px-4.5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white font-semibold text-xs min-[390px]:text-sm sm:text-base inline-flex items-center justify-center gap-2 backdrop-blur-xs transition-all cursor-pointer h-10.5 sm:h-12 select-none shrink-0"
              aria-label="Connect Us on Instagram"
            >
              <InstagramIcon size={17} className="text-white group-hover:scale-110 transition-transform" />
              <span>Connect Us</span>
            </motion.a>
          </div>

          {/* 6. Feature Highlights */}
          <div className="pt-3 sm:pt-4 border-t border-white/15 text-left max-w-xl w-full">
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
                  className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#FE8E2A]/20 transition-all text-sm sm:text-base"
                >
                  <span>❤️</span>
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
                  className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/20 transition-all text-sm sm:text-base"
                >
                  <span>✨</span>
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
                  className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0 group-hover:bg-[#FE8E2A]/20 transition-all text-sm sm:text-base"
                >
                  <span>⏰</span>
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

