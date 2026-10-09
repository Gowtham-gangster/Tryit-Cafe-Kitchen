import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
} from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useToastStore } from '../../store/useToastStore';
import { cafeConfig } from '../../config/business';
import { useCustomerNavigation } from '../../utils/navigation';
import { prefetchLegalPages } from '../../routes/routePrefetch';
import { WhatsAppIcon, InstagramIcon } from '../common/BrandIcons';

export const Footer: React.FC = () => {
  const { settings } = useSettingsStore();
  const { info: toastInfo } = useToastStore();
  const shouldReduceMotion = useReducedMotion();

  const cafeName = settings?.cafeName?.replace(/TryIt/g, 'Tryit') || 'Tryit Cafe & Kitchen';
  const whatsappUrl = cafeConfig.getWhatsAppUrl(
    'Hi Tryit Cafe! I would like to visit or place an order.',
    settings?.whatsappNumber
  );

  const instagramUrl =
    cafeConfig.getInstagramUrl(settings?.instagramUrl) || '#';

  const phoneUrl = cafeConfig.getPhoneUrl(settings?.phoneNumber);
  const displayPhone = cafeConfig.getDisplayPhone(settings?.phoneNumber);

  const emailUrl = cafeConfig.getEmailUrl(settings?.email);
  const displayEmail = cafeConfig.getEmail(settings?.email);

  const contactActions = [
    {
      id: 'call',
      label: 'Call Cafe',
      icon: <span className="text-sm shrink-0" aria-hidden="true">📞</span>,
      href: phoneUrl || undefined,
      external: false,
      ariaLabel: displayPhone ? `Call Tryit Cafe at ${displayPhone}` : 'Call Tryit Cafe',
      available: !!phoneUrl,
      onUnavailable: () =>
        toastInfo(
          'Phone calling is temporarily unavailable. Please message via WhatsApp!'
        ),
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      icon: <WhatsAppIcon size={16} className="text-[#25D366] shrink-0" />,
      href: whatsappUrl || undefined,
      external: true,
      ariaLabel: 'Order via WhatsApp',
      available: !!whatsappUrl,
      onUnavailable: () =>
        toastInfo('WhatsApp ordering is temporarily unavailable.'),
    },
    {
      id: 'instagram',
      label: 'Instagram',
      icon: <InstagramIcon size={16} className="text-[#E1306C] shrink-0" />,
      href: instagramUrl,
      external: true,
      ariaLabel: 'Visit Tryit Cafe on Instagram',
      available: true,
    },
    {
      id: 'email',
      label: 'Email Us',
      icon: <span className="text-sm shrink-0" aria-hidden="true">✉️</span>,
      href: emailUrl || undefined,
      external: false,
      ariaLabel: displayEmail ? `Email Tryit Cafe at ${displayEmail}` : 'Email Tryit Cafe',
      available: !!emailUrl,
      onUnavailable: () =>
        toastInfo(
          'Email contact is temporarily unavailable. Please message via WhatsApp!'
        ),
    },
  ];

  const googleMapsLink =
    settings?.googleMapsLink ||
    'https://maps.app.goo.gl/swbv6jctCUrmXMsq7';

  const currentYear = new Date().getFullYear();

  const { navigateToSection } = useCustomerNavigation();

  // Smooth scroll / page navigation to sections
  const scrollTo = (id: string) => {
    navigateToSection(id);
  };

  const navLinks = [
    { label: 'Home', id: 'home' },
    { label: 'Offers', id: 'offers' },
    { label: 'Popular', id: 'popular' },
    { label: 'Menu', id: 'menu' },
    { label: 'Gallery', id: 'gallery' },
    { label: 'Reviews', id: 'reviews' },
    { label: 'About', id: 'about' },
    { label: 'Location', id: 'location' },
  ];

  return (
    <footer
      id="footer"
      className="w-full bg-[#1A0B04] text-[#D8C7BC] pt-8 sm:pt-10 pb-[calc(68px+env(safe-area-inset-bottom,0px)+1.5rem)] lg:pb-8 border-t border-[#3B1E12] relative overflow-hidden"
      aria-label="Tryit Cafe & Kitchen Footer"
    >
      {/* Top Subtle Brand Gradient Line Accent */}
      <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-[#FE8E2A]/50 to-transparent pointer-events-none" />

      {/* Subtle warm ambient background glow contained to avoid horizontal document overflow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 bg-[#FE8E2A]/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 lg:gap-8 pb-8 sm:pb-10 border-b border-[#3B1E12]"
        >
          {/* ========================================================== */}
          {/* A. BRAND AREA (4 Cols on Desktop)                          */}
          {/* ========================================================== */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <motion.div
                whileHover={shouldReduceMotion ? undefined : { y: -2, scale: 1.03 }}
                transition={{ duration: 0.2 }}
                className="w-12 h-12 rounded-2xl bg-[#2B1408] p-1 border border-white/10 shadow-md flex items-center justify-center shrink-0 overflow-hidden cursor-pointer"
              >
                <img
                  src="/assets/Logo.jpeg"
                  alt={cafeName}
                  className="w-full h-full object-contain rounded-xl"
                  loading="lazy"
                />
              </motion.div>
              <div>
                <span className="font-serif font-extrabold text-xl text-white block leading-tight">
                  {cafeName}
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-[#FE8E2A] block mt-0.5 tracking-wide">
                  Try it until you love it
                </span>
              </div>
            </div>

            <div className="space-y-2 max-w-sm">
              <p className="text-xs sm:text-[13px] text-[#C7B5A7] leading-relaxed">
                At Tryit Cafe & Kitchen, we serve freshly brewed coffee, refreshing beverages, delicious fast food, crunchy snacks, thick shakes, and wholesome meals in a clean, comfortable, and friendly atmosphere.
              </p>
            </div>

            {/* Feature Highlights Badges */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-[#E5D5C5] bg-white/6 border border-white/10 px-2 py-0.5 rounded-lg">
                ☕ Fresh Coffee & Brews
              </span>
              <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-[#E5D5C5] bg-white/6 border border-white/10 px-2 py-0.5 rounded-lg">
                🍔 Snacks & Fast Food
              </span>
              <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-[#E5D5C5] bg-white/6 border border-white/10 px-2 py-0.5 rounded-lg">
                🥤 Shakes & Mocktails
              </span>
              <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold text-[#E5D5C5] bg-white/6 border border-white/10 px-2 py-0.5 rounded-lg">
                ✨ Clean & Cozy Ambience
              </span>
            </div>

            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#A89284] pt-1">
              <span>📍</span>
              <span>Gandi Maisamma, Hyderabad</span>
            </div>
          </div>

          {/* ========================================================== */}
          {/* B. EXPLORE NAVIGATION (2 Cols on Desktop)                  */}
          {/* ========================================================== */}
          <div className="lg:col-span-2 space-y-3 pt-4 sm:pt-0 border-t border-[#3B1E12]/50 md:border-t-0">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#FE8E2A] block">
              EXPLORE
            </span>
            <nav aria-label="Footer Quick Links">
              <ul className="grid grid-cols-2 sm:grid-cols-1 gap-2.5 text-xs sm:text-sm font-medium">
                {navLinks.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => scrollTo(item.id)}
                      className="text-[#C7B5A7] hover:text-[#FE8E2A] transition-all hover:translate-x-1 cursor-pointer flex items-center gap-1.5 py-1 text-left min-h-[36px] group"
                    >
                      <span className="relative pb-0.5 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-[1px] after:bg-[#FE8E2A] group-hover:after:w-full after:transition-all after:duration-200">
                        {item.label}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* ========================================================== */}
          {/* C. VISIT US (Parallel text on left & button on right)      */}
          {/* ========================================================== */}
          <div className="lg:col-span-3 space-y-3 pt-4 sm:pt-0 border-t border-[#3B1E12]/50 md:border-t-0">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#FE8E2A] flex items-center gap-1.5">
              <span>📍</span>
              <span>VISIT US</span>
            </span>

            {/* Mobile: Parallel layout. Desktop (md+): Stacked vertically with button down */}
            <div className="flex flex-row md:flex-col items-center md:items-start justify-between md:justify-start gap-2.5 sm:gap-3 md:gap-3.5">
              <div className="space-y-0.5 min-w-0 flex-1 md:flex-initial text-left">
                <p className="text-xs sm:text-sm font-bold text-white truncate md:whitespace-normal">
                  {cafeName}
                </p>
                <p className="text-xs text-[#C7B5A7]">
                  Gandi Maisamma
                </p>
                <p className="text-xs text-[#C7B5A7]">
                  Hyderabad, Telangana
                </p>
              </div>

              <div className="shrink-0 md:pt-1">
                <a
                  href={googleMapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl bg-white/5 hover:bg-[#FE8E2A]/15 border border-white/10 hover:border-[#FE8E2A]/40 text-xs font-bold text-[#FE8E2A] transition-all group cursor-pointer min-h-[38px] sm:min-h-[40px] shadow-xs active:scale-95 whitespace-nowrap"
                  aria-label="Get directions to TryIt Cafe on Google Maps"
                >
                  <span className="text-sm">🧭</span>
                  <span>Get Directions</span>
                  <span className="text-xs opacity-70 group-hover:opacity-100 transition-opacity">↗</span>
                </a>
              </div>
            </div>
          </div>

          {/* ========================================================== */}
          {/* D. CONNECT WITH US                                         */}
          {/* ========================================================== */}
          <div className="lg:col-span-3 space-y-3 pt-4 sm:pt-0 border-t border-[#3B1E12]/50 md:border-t-0">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#FE8E2A] flex items-center gap-1.5">
              <span>💬</span>
              <span>CONNECT WITH US</span>
            </span>

            {/* Mobile: 2-Column Grid. Desktop (md+): One by one only */}
            <div className="grid grid-cols-2 md:grid-cols-1 gap-2 sm:gap-2.5">
              {contactActions.map((action, idx) => (
                <motion.div
                  key={action.id}
                  initial={
                    shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 6 }
                  }
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.35,
                    delay: shouldReduceMotion ? 0 : idx * 0.04,
                    ease: 'easeOut',
                  }}
                >
                  {action.available && action.href ? (
                    <a
                      href={action.href}
                      target={action.external ? '_blank' : undefined}
                      rel={action.external ? 'noopener noreferrer' : undefined}
                      className="w-full flex items-center justify-between min-h-[40px] px-2.5 sm:px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-[0.985] border border-white/10 hover:border-[#FE8E2A]/40 transition-all duration-200 cursor-pointer group text-left"
                      aria-label={action.ariaLabel}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        {action.icon}
                        <span className="text-xs font-semibold text-white group-hover:text-[#FE8E2A] transition-colors truncate">
                          {action.label}
                        </span>
                      </div>
                      <ArrowRight
                        size={12}
                        className="text-[#A89284] group-hover:text-[#FE8E2A] group-hover:translate-x-0.5 transition-all shrink-0 ml-1"
                        aria-hidden="true"
                      />
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={action.onUnavailable}
                      className="w-full flex items-center justify-between min-h-[40px] px-2.5 sm:px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-[0.985] border border-white/10 hover:border-[#FE8E2A]/40 transition-all duration-200 cursor-pointer group text-left"
                      aria-label={action.ariaLabel}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        {action.icon}
                        <span className="text-xs font-semibold text-white group-hover:text-[#FE8E2A] transition-colors truncate">
                          {action.label}
                        </span>
                      </div>
                      <ArrowRight
                        size={12}
                        className="text-[#A89284] group-hover:text-[#FE8E2A] group-hover:translate-x-0.5 transition-all shrink-0 ml-1"
                        aria-hidden="true"
                      />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ========================================================== */}
        {/* COPYRIGHT & LEGAL NAVIGATION BAR                           */}
        {/* ========================================================== */}
        <div className="pt-5 sm:pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-[#8A7162] gap-3 sm:gap-4 text-center md:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <p>© {currentYear} {cafeName}. All rights reserved.</p>
            <div className="hidden sm:inline-block text-[#4A2B18]">•</div>
            <div className="flex items-center gap-3 font-medium text-[#A89284]">
              <Link
                to="/privacy-policy"
                onMouseEnter={prefetchLegalPages}
                className="hover:text-[#FE8E2A] transition-colors underline-offset-4 hover:underline"
              >
                Privacy Policy
              </Link>
              <span className="text-[#4A2B18]">•</span>
              <Link
                to="/terms-and-conditions"
                onMouseEnter={prefetchLegalPages}
                className="hover:text-[#FE8E2A] transition-colors underline-offset-4 hover:underline"
              >
                Terms &amp; Conditions
              </Link>
            </div>
          </div>

          <p className="flex items-center justify-center gap-1.5 font-medium text-[#A89284]">
            <span>Made with</span>
            <span aria-label="love">🧡</span>
            <span>for food lovers.</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
