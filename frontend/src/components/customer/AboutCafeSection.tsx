import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Sparkles,
  Coffee,
  UtensilsCrossed,
  MessageCircle,
  MapPin,
  Clock,
  ArrowUpRight,
  Heart,
} from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { RevealCard } from '../common/RevealCard';
import { cafeConfig } from '../../config/business';
import { formatBusinessHoursRange } from '../../utils/timeFormat';

// Canonical official cafe hero asset reused for About section
const HERO_IMAGE_SRC = '/assets/Hero.jpg';

export const AboutCafeSection: React.FC = () => {
  const { settings } = useSettingsStore();

  const shouldReduceMotion = useReducedMotion();

  // Dynamic values from backend settings
  const cafeName = settings?.cafeName || 'TryIt Cafe & Kitchen';
  const hours = settings?.businessHours || [];

  // Find opening and closing hours dynamically
  const hoursText = useMemo(() => {
    if (hours && hours.length > 0) {
      const activeDay = hours.find((h) => !h.closed) || hours[0];
      if (activeDay) {
        return formatBusinessHoursRange(
          activeDay.openTime,
          activeDay.closeTime,
          activeDay.closed
        );
      }
    }
    return '10:00 AM – 11:30 PM';
  }, [hours]);

  // Clean WhatsApp ordering URL
  const whatsappUrl = useMemo(() => {
    return (
      cafeConfig.getWhatsAppUrl(
        'Hi Tryit Cafe! I would like to place an order.',
        settings?.whatsappNumber
      ) || ''
    );
  }, [settings?.whatsappNumber]);

  // Smooth scroll to location section
  const handleScrollToLocation = () => {
    const locationEl = document.getElementById('location');
    if (locationEl) {
      locationEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // 4 Core Highlights aligned with cafe offerings
  const highlights = [
    {
      icon: UtensilsCrossed,
      title: 'Freshly Prepared Food',
      desc: 'Delicious fast food, flavorful snacks, and satisfying meals cooked fresh to order.',
    },
    {
      icon: Coffee,
      title: 'Premium Coffee & Brews',
      desc: 'Freshly brewed aromatic coffee, teas, and soothing hot drinks crafted for every mood.',
    },
    {
      icon: Sparkles,
      title: 'Shakes & Mocktails',
      desc: 'Thick indulgence shakes, chilled mocktails, and handcrafted beverages for every craving.',
    },
    {
      icon: Heart,
      title: 'Friendly & Cozy Ambience',
      desc: 'A spotlessly clean, relaxed, and welcoming environment for friends, family, and remote work.',
    },
  ];

  return (
    <section
      id="about"
      className="py-8 sm:py-10 lg:py-12 bg-[#FDF6EE] border-t border-[#EEDDCC] relative overflow-hidden scroll-mt-16"
      aria-label="About Tryit Cafe & Kitchen"
    >
      {/* Subtle brand ambient accents */}
      <div className="absolute top-1/3 -left-32 w-80 h-80 rounded-full bg-[#FE8E2A]/5 pointer-events-none blur-3xl" />
      <div className="absolute bottom-10 -right-32 w-80 h-80 rounded-full bg-[#FE8E2A]/5 pointer-events-none blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* ========================================================== */}
        {/* 1. SECTION HEADER */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="text-center max-w-2xl mx-auto mb-6 sm:mb-8"
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#FE8E2A] mb-2 px-3 py-1 rounded-full bg-[#FE8E2A]/10 border border-[#FE8E2A]/20">
            <Sparkles size={13} className="text-[#FE8E2A]" />
            <span>ABOUT TRYIT CAFE & KITCHEN</span>
          </div>

          {/* Heading */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2B1408] font-serif tracking-tight leading-tight">
            Fresh Food, Great Coffee &amp; Memorable Moments
          </h2>

          {/* Supporting Copy */}
          <p className="text-xs sm:text-sm lg:text-base text-[#7A5C4A] mt-1.5 max-w-xl mx-auto leading-relaxed">
            A warm neighborhood gathering spot in Gandi Maisamma where great taste, quality beverages, and genuine hospitality meet.
          </p>
        </motion.div>

        {/* 2. HERO STORY BLOCK (Two-Column Layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center mb-6 sm:mb-8">
          {/* Left: Premium Cafe Image */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="lg:col-span-6 relative"
          >
            <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-[4/3] sm:aspect-[16/11] bg-stone-200 border border-[#EEDDCC] shadow-2xs group">
              <img
                src={HERO_IMAGE_SRC}
                alt={`${cafeName} Ambience`}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out will-change-transform"
              />

              {/* Location Tag Pill */}
              <div className="absolute bottom-3.5 left-3.5 bg-[#2B1408]/85 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 text-white flex items-center gap-1.5 shadow-sm group-hover:-translate-y-1 group-hover:shadow-md transition-all duration-300">
                <Coffee size={13} className="text-[#FE8E2A]" />
                <span className="text-[11px] font-semibold">Gandi Maisamma, Hyderabad</span>
              </div>
            </div>
          </motion.div>

          {/* Right: Brand Story */}
          <motion.div
            initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.08, ease: 'easeOut' }}
            className="lg:col-span-6 space-y-3.5 sm:space-y-4"
          >
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#FE8E2A]">
              <Coffee size={14} />
              <span>WHERE GOOD TIMES HAPPEN</span>
            </div>

            <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#2B1408] font-serif leading-tight">
              A Warm Space Designed for Everyone
            </h3>

            <p className="text-xs sm:text-sm lg:text-base text-[#7A5C4A] leading-relaxed">
              At Tryit Cafe &amp; Kitchen, we serve freshly brewed coffee, refreshing beverages, delicious fast food, crunchy snacks, thick shakes, and wholesome meals in a clean, comfortable, and friendly atmosphere.
            </p>

            <p className="text-xs sm:text-sm text-[#7A5C4A] leading-relaxed">
              Whether you are meeting friends, spending time with family, working on projects, or simply looking for a relaxing place to enjoy good food and great coffee, we are here to make every visit memorable.
            </p>

            {/* Motto Badge */}
            <div className="p-3 rounded-xl bg-[#FFFBF7] border border-[#EEDDCC] inline-flex items-center gap-2 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#FE8E2A]" />
              <span className="text-xs font-extrabold text-[#2B1408] tracking-wide">
                &ldquo;Try It Once. Come Back Again!&rdquo;
              </span>
            </div>

            <div className="pt-1">
              <button
                onClick={handleScrollToLocation}
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-[#FE8E2A] hover:text-[#E67616] transition-colors cursor-pointer group"
              >
                <span>Find our cafe location</span>
                <ArrowUpRight size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </motion.div>
        </div>

        {/* ========================================================== */}
        {/* 3. WHY PEOPLE CHOOSE TRYIT (4 Highlights Grid)            */}
        {/* ========================================================== */}
        <div className="mb-8 sm:mb-10">
          <div className="text-center mb-4 sm:mb-5">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#FE8E2A] px-3 py-1 rounded-full bg-[#FE8E2A]/10 border border-[#FE8E2A]/20">
              WHY PEOPLE CHOOSE TRYIT
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            {highlights.map((item, idx) => {
              const Icon = item.icon;
              return (
                <RevealCard
                  key={idx}
                  delay={idx * 0.08}
                  yOffset={25}
                  scaleInitial={0.97}
                  enableHover={false}
                  className="h-full"
                >
                  <motion.div
                    whileHover={shouldReduceMotion ? undefined : { y: -4, scale: 1.015 }}
                    className="p-4 sm:p-5 rounded-2xl bg-[#FFFBF7] border border-[#EEDDCC] shadow-xs hover:shadow-md hover:border-[#FE8E2A]/40 transition-all duration-300 flex flex-col justify-between h-full cursor-default"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-xl bg-[#FDF6EE] border border-[#EEDDCC] text-[#FE8E2A] flex items-center justify-center shrink-0 mb-3">
                        <Icon size={18} />
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-[#2B1408] font-display">
                        {item.title}
                      </h4>
                      <p className="text-xs text-[#7A5C4A] mt-1 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </motion.div>
                </RevealCard>
              );
            })}
          </div>
        </div>

        {/* ========================================================== */}
        {/* 4. CLOSING STORY & BUSINESS INFORMATION                   */}
        {/* ========================================================== */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="rounded-2xl sm:rounded-3xl bg-[#FFFBF7] border border-[#EEDDCC] p-5 sm:p-7 shadow-sm relative overflow-hidden"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-center">
            {/* Closing Brand Note (6 cols) */}
            <div className="lg:col-span-6 space-y-3">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FE8E2A]">
                ALWAYS WELCOMING
              </span>
              <h4 className="text-xl sm:text-3xl font-extrabold text-[#2B1408] font-display leading-tight">
                Try It Once. Come Back Again!
              </h4>
              <p className="text-xs sm:text-sm text-[#7A5C4A] leading-relaxed max-w-lg">
                Visit us today in Gandi Maisamma and experience great taste, quality, and warm hospitality. Whether for morning brews, lunch combos, or evening hangout sessions, every visit is made special.
              </p>
            </div>

            {/* Compact Business Info Blocks (6 cols) */}
            <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Location */}
              <RevealCard index={0} delay={0.1} yOffset={20} scaleInitial={0.97} enableHover={false}>
                <button
                  type="button"
                  onClick={handleScrollToLocation}
                  className="w-full h-full p-4 rounded-2xl bg-[#FDF6EE] border border-[#EEDDCC] hover:border-[#FE8E2A]/40 hover:-translate-y-1 transition-all text-left group cursor-pointer active:scale-98"
                >
                  <div className="flex items-center gap-1.5 text-[#FE8E2A] mb-1.5">
                    <MapPin size={15} />
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">
                      LOCATION
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[#2B1408] block leading-tight">
                    Gandi Maisamma
                  </span>
                  <span className="text-[11px] text-[#7A5C4A] block mt-0.5">
                    Hyderabad, Telangana
                  </span>
                </button>
              </RevealCard>

              {/* Hours */}
              <RevealCard index={1} delay={0.18} yOffset={20} scaleInitial={0.97} enableHover={false}>
                <div className="w-full h-full p-4 rounded-2xl bg-[#FDF6EE] border border-[#EEDDCC] text-left">
                  <div className="flex items-center gap-1.5 text-[#FE8E2A] mb-1.5">
                    <Clock size={15} />
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">
                      DAILY HOURS
                    </span>
                  </div>
                  <span className="text-xs font-bold text-[#2B1408] block leading-tight">
                    {hoursText}
                  </span>
                  <span className="text-[11px] text-[#7A5C4A] block mt-0.5">
                    Open 7 Days
                  </span>
                </div>
              </RevealCard>

              {/* WhatsApp Ordering */}
              <RevealCard index={2} delay={0.26} yOffset={20} scaleInitial={0.97} enableHover={false}>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-full p-4 rounded-2xl bg-[#FDF6EE] border border-[#EEDDCC] hover:border-[#FE8E2A]/40 hover:-translate-y-1 transition-all text-left group cursor-pointer active:scale-98 block"
                >
                  <div className="flex items-center gap-1.5 text-[#FE8E2A] mb-1.5">
                    <MessageCircle size={15} />
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">
                      ORDER AHEAD
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#2B1408] block leading-tight">
                      WhatsApp
                    </span>
                    <ArrowUpRight size={13} className="text-[#FE8E2A] opacity-70 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-[11px] text-[#7A5C4A] block mt-0.5">
                    Direct Kitchen Chat
                  </span>
                </a>
              </RevealCard>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
