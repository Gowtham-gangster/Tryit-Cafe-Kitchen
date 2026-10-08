import React from 'react';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Heart,
  Phone,
  MessageCircle,
  Mail,
  MapPin,
  Navigation,
  ArrowUpRight,
  ArrowRight,
} from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useToastStore } from '../../store/useToastStore';
import { cafeConfig } from '../../config/business';
import { useCustomerNavigation } from '../../utils/navigation';
import { prefetchLegalPages } from '../../routes/routePrefetch';

// Clean standard SVG Instagram icon matching Lucide style
const InstagramIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 20,
  className = '',
}) => (
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
      id: 'whatsapp',
      label: 'WhatsApp Orders',
      icon: (
        <MessageCircle
          size={16}
          className="text-[#FE8E2A] group-hover:scale-[1.05] transition-transform shrink-0"
        />
      ),
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
      icon: (
        <InstagramIcon
          size={16}
          className="text-[#FE8E2A] group-hover:scale-[1.05] transition-transform shrink-0"
        />
      ),
      href: instagramUrl,
      external: true,
      ariaLabel: 'Visit Tryit Cafe on Instagram',
      available: true,
    },
    {
      id: 'call',
      label: 'Call Cafe',
      icon: (
        <Phone
          size={16}
          className="text-[#FE8E2A] group-hover:scale-[1.05] transition-transform shrink-0"
        />
      ),
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
      id: 'email',
      label: 'Email Us',
      icon: (
        <Mail
          size={16}
          className="text-[#FE8E2A] group-hover:scale-[1.05] transition-transform shrink-0"
        />
      ),
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

            <p className="text-xs sm:text-sm text-[#C7B5A7] max-w-sm leading-relaxed">
              Good food, cozy moments, and a place worth coming back to.
            </p>

            <div className="inline-flex items-center gap-2 text-xs font-bold text-[#A89284]">
              <MapPin size={14} className="text-[#FE8E2A] shrink-0" />
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
          {/* C. VISIT US (3 Cols on Desktop)                            */}
          {/* ========================================================== */}
          <div className="lg:col-span-3 space-y-3.5 pt-4 sm:pt-0 border-t border-[#3B1E12]/50 md:border-t-0">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#FE8E2A] block">
              VISIT US
            </span>

            <div className="space-y-1">
              <p className="text-xs sm:text-sm font-bold text-white">
                {cafeName}
              </p>
              <p className="text-xs text-[#C7B5A7]">
                Gandi Maisamma
              </p>
              <p className="text-xs text-[#C7B5A7]">
                Hyderabad, Telangana
              </p>
            </div>

            <div className="pt-1">
              <a
                href={googleMapsLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-[#FE8E2A]/15 border border-white/10 hover:border-[#FE8E2A]/40 text-xs font-bold text-[#FE8E2A] transition-all group cursor-pointer min-h-[44px]"
                aria-label="Get directions to TryIt Cafe on Google Maps"
              >
                <Navigation size={13} className="text-[#FE8E2A] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                <span>Get Directions</span>
                <ArrowUpRight size={13} className="opacity-70 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
          </div>

          {/* ========================================================== */}
          {/* D. CONNECT WITH US (Compact Touch-Friendly Action Rows)    */}
          {/* ========================================================== */}
          <div className="lg:col-span-3 space-y-3 pt-4 sm:pt-0 border-t border-[#3B1E12]/50 md:border-t-0">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#FE8E2A] block">
              CONNECT WITH US
            </span>

            <div className="flex flex-col gap-1.5 sm:gap-2">
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
                      className="w-full flex items-center justify-between min-h-[40px] sm:min-h-[42px] px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-[0.985] border border-white/10 hover:border-[#FE8E2A]/40 transition-all duration-200 cursor-pointer group text-left"
                      aria-label={action.ariaLabel}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                          {action.icon}
                        </div>
                        <span className="text-xs sm:text-[13px] font-semibold text-white group-hover:text-[#FE8E2A] transition-colors truncate">
                          {action.label}
                        </span>
                      </div>
                      <div className="w-5 h-5 rounded-md flex items-center justify-center text-[#A89284] group-hover:text-[#FE8E2A] transition-colors shrink-0">
                        <ArrowRight
                          size={14}
                          className="group-hover:translate-x-0.5 transition-transform duration-200"
                          aria-hidden="true"
                        />
                      </div>
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={action.onUnavailable}
                      className="w-full flex items-center justify-between min-h-[40px] sm:min-h-[42px] px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 active:scale-[0.985] border border-white/10 hover:border-[#FE8E2A]/40 transition-all duration-200 cursor-pointer group text-left"
                      aria-label={action.ariaLabel}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                          {action.icon}
                        </div>
                        <span className="text-xs sm:text-[13px] font-semibold text-white group-hover:text-[#FE8E2A] transition-colors truncate">
                          {action.label}
                        </span>
                      </div>
                      <div className="w-5 h-5 rounded-md flex items-center justify-center text-[#A89284] group-hover:text-[#FE8E2A] transition-colors shrink-0">
                        <ArrowRight
                          size={14}
                          className="group-hover:translate-x-0.5 transition-transform duration-200"
                          aria-hidden="true"
                        />
                      </div>
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
            <Heart size={13} className="text-[#FE8E2A] fill-[#FE8E2A] shrink-0" aria-label="love" />
            <span>for food lovers.</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
