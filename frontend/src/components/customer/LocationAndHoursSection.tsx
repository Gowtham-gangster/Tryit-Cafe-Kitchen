import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  MapPin,
  Phone,
  Clock,
  MessageCircle,
  Navigation,
  ArrowUpRight,
  Compass,
} from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useToastStore } from '../../store/useToastStore';
import { GoogleMap } from '../common/GoogleMap';
import { RevealCard } from '../common/RevealCard';
import { getWhatsAppBusinessNumber } from '../../utils/whatsapp';
import { cafeConfig } from '../../config/business';
import {
  formatTimeTo12Hour,
  formatBusinessHoursRange,
  calculatePhysicalStoreStatus,
} from '../../utils/timeFormat';

export const LocationAndHoursSection: React.FC = () => {
  const { settings } = useSettingsStore();
  const { info: toastInfo } = useToastStore();
  const shouldReduceMotion = useReducedMotion();

  const cafeName = settings?.cafeName || 'TryIt Cafe & Kitchen';
  const phoneUrl = cafeConfig.getPhoneUrl(settings?.phoneNumber);
  const displayPhone = cafeConfig.getDisplayPhone(settings?.phoneNumber);

  const whatsappUrl =
    cafeConfig.getWhatsAppUrl(
      'Hi TryIt Cafe! I would like to visit or place an order.',
      settings?.whatsappNumber
    ) || '';

  const plusCode = settings?.plusCode || '';
  const googleMapsLink =
    settings?.googleMapsLink ||
    'https://maps.app.goo.gl/swbv6jctCUrmXMsq7';
  const hours = settings?.businessHours || [];

  // Determine today's day of week
  const dayNames = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const todayIndex = new Date().getDay();
  const todayName = dayNames[todayIndex];

  // Find today's hours from business settings
  const todayHours = useMemo(() => {
    return hours.find(
      (h) => h.dayOfWeek?.trim().toLowerCase() === todayName.toLowerCase()
    );
  }, [hours, todayName]);

  // Today's formatted hours text
  const todayHoursText = useMemo(() => {
    if (!todayHours) return '10:00 AM – 11:30 PM';
    if (todayHours.closed) return 'Closed Today';
    return formatBusinessHoursRange(
      todayHours.openTime,
      todayHours.closeTime,
      todayHours.closed
    );
  }, [todayHours]);

  // Calculate live physical store open/closed status based on local time
  const physicalStatus = useMemo(() => {
    return calculatePhysicalStoreStatus(todayHours);
  }, [todayHours]);

  // Standard ordered week (Monday -> Sunday)
  const orderedDays = useMemo(() => {
    const weekOrder = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];
    if (!hours || hours.length === 0) {
      return weekOrder.map((day) => ({
        id: day,
        dayOfWeek: day,
        openTime: '10:00',
        closeTime: '23:30',
        closed: false,
      }));
    }
    return [...hours].sort((a, b) => {
      const idxA = weekOrder.indexOf(a.dayOfWeek);
      const idxB = weekOrder.indexOf(b.dayOfWeek);
      return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    });
  }, [hours]);

  // Split weekdays (Monday - Saturday) and Sunday to display Sunday centered
  const weekdays = useMemo(() => {
    return orderedDays.filter(
      (h) => h.dayOfWeek?.trim().toLowerCase() !== 'sunday'
    );
  }, [orderedDays]);

  const sundayDay = useMemo(() => {
    return orderedDays.find(
      (h) => h.dayOfWeek?.trim().toLowerCase() === 'sunday'
    );
  }, [orderedDays]);

  const renderDayItem = (h: (typeof orderedDays)[0]) => {
    const isToday =
      h.dayOfWeek?.trim().toLowerCase() === todayName.toLowerCase();
    return (
      <motion.div
        key={h.dayOfWeek}
        whileHover={shouldReduceMotion ? undefined : { y: -1 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className={`group flex items-center justify-between py-2.5 px-3 rounded-xl border transition-all duration-200 select-none ${
          isToday
            ? 'bg-[#FE8E2A]/10 border-[#FE8E2A]/40 shadow-xs'
            : 'border-b border-[#EEDDCC]/70 border-t-transparent border-l-transparent border-r-transparent hover:bg-[#FE8E2A]/5 hover:border-[#FE8E2A]/30 hover:shadow-xs'
        }`}
      >
        <div className="flex items-center gap-2 shrink-0">
          <span
            className={`text-xs sm:text-sm transition-colors duration-200 ${
              isToday
                ? 'font-extrabold text-[#2B1408]'
                : 'font-semibold text-[#5C3D2E] group-hover:text-[#2B1408]'
            }`}
          >
            {h.dayOfWeek}
          </span>
          {isToday && (
            <span className="text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-md bg-[#FE8E2A] text-white shadow-2xs">
              TODAY
            </span>
          )}
        </div>

        {/* Subtle horizontal connector line */}
        <div
          className={`flex-1 mx-3 border-b transition-colors duration-200 ${
            isToday
              ? 'border-[#FE8E2A]/40'
              : 'border-[#EEDDCC]/60 group-hover:border-[#FE8E2A]/30'
          }`}
        />

        <span
          className={`text-xs sm:text-sm transition-colors duration-200 shrink-0 ${
            isToday
              ? 'font-extrabold text-[#FE8E2A]'
              : 'font-semibold text-[#7A5C4A] group-hover:text-[#FE8E2A]'
          }`}
        >
          {h.closed ? (
            <span className="text-rose-500 font-bold">Closed</span>
          ) : (
            formatBusinessHoursRange(h.openTime, h.closeTime)
          )}
        </span>
      </motion.div>
    );
  };

  return (
    <section
      id="location"
      className="py-8 sm:py-10 lg:py-12 bg-[#FDF6EE] border-t border-[#EEDDCC] relative overflow-hidden scroll-mt-16 sm:scroll-mt-20"
      aria-label="Location and Cafe Hours"
    >
      {/* Subtle brand ambient accents */}
      <div className="absolute top-1/4 -right-32 w-80 h-80 rounded-full bg-[#FE8E2A]/5 pointer-events-none blur-3xl" />
      <div className="absolute bottom-10 -left-32 w-80 h-80 rounded-full bg-[#FE8E2A]/5 pointer-events-none blur-3xl" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* ========================================================== */}
        {/* 1. SECTION HEADER                                          */}
        {/* ========================================================== */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-center max-w-2xl mx-auto mb-6 sm:mb-8"
        >
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-[#FE8E2A] mb-2 px-3 py-1 rounded-full bg-[#FE8E2A]/10 border border-[#FE8E2A]/20">
            <Compass size={13} className="text-[#FE8E2A]" />
            <span>FIND US</span>
          </div>

          {/* Heading */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2B1408] font-serif tracking-tight">
            Come Visit Tryit
          </h2>

          {/* Supporting Text */}
          <p className="text-xs sm:text-sm lg:text-base text-[#7A5C4A] mt-2 max-w-xl mx-auto leading-relaxed">
            Good food is better when shared. Drop by Tryit Cafe &amp; Kitchen or find us easily on the map.
          </p>
        </motion.div>

        {/* ========================================================== */}
        {/* 2. TWO-COLUMN LAYOUT: LOCATION CARD (LEFT) & MAP (RIGHT)   */}
        {/* ========================================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-stretch mb-5 sm:mb-6">
          {/* LEFT: Clean Location & Contact Card */}
          <div className="lg:col-span-6 flex flex-col h-full">
            <RevealCard index={0} yOffset={30} scaleInitial={0.96} enableHover={false} className="h-full">
              <div className="p-5 sm:p-6 rounded-2xl sm:rounded-3xl bg-[#FFFBF7] border border-[#EEDDCC] shadow-sm flex flex-col justify-between h-full space-y-5">
              {/* Address Header */}
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#FE8E2A] mb-3">
                  <MapPin size={15} />
                  <span>LOCATION</span>
                </div>

                {/* Structured Address */}
                <div className="space-y-1">
                  <h3 className="text-xl sm:text-2xl font-bold text-[#2B1408] font-serif leading-tight">
                    {cafeName}
                  </h3>
                  <p className="text-sm sm:text-base font-semibold text-[#FE8E2A]">
                    Gandi Maisamma
                  </p>
                  <p className="text-xs sm:text-sm text-[#7A5C4A] leading-relaxed pt-1">
                    Back side Union Bank,
                    <br />
                    Hyderabad – Narsapur Road
                  </p>
                  <p className="text-xs sm:text-sm text-[#7A5C4A] font-medium">
                    Hyderabad, Telangana 500043
                  </p>
                </div>

                {/* Secondary navigation info (Plus Code, unobtrusive) */}
                {plusCode && (
                  <div className="mt-4 pt-3 border-t border-[#EEDDCC]/70 flex items-center gap-2 text-[11px] text-[#7A5C4A]">
                    <span className="font-semibold text-[#2B1408]">Plus Code:</span>
                    <span className="font-mono bg-[#FDF6EE] px-2 py-0.5 rounded-md border border-[#EEDDCC] select-all">
                      {plusCode}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons: Get Directions (Primary) + Call & WhatsApp (Secondary) */}
              <div className="space-y-3 pt-2">
                {/* Primary Action: Get Directions */}
                <motion.a
                  whileHover={shouldReduceMotion ? undefined : { y: -2, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  href={googleMapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#FE8E2A] hover:bg-[#E67616] active:bg-[#C65A08] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-md shadow-[#FE8E2A]/25 transition-all cursor-pointer min-h-[46px] group"
                  aria-label="Get directions to Tryit Cafe on Google Maps"
                >
                  <Navigation size={17} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                  <span>Get Directions</span>
                  <ArrowUpRight size={15} className="opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                </motion.a>

                {/* Secondary Actions: Call Cafe & WhatsApp */}
                <div className="grid grid-cols-2 gap-3">
                  {phoneUrl ? (
                    <motion.a
                      whileHover={shouldReduceMotion ? undefined : { y: -2, scale: 1.015 }}
                      whileTap={{ scale: 0.98 }}
                      href={phoneUrl}
                      className="py-3 px-4 rounded-2xl bg-[#FDF6EE] hover:bg-[#FBEFE1] border border-[#EEDDCC] hover:border-[#FE8E2A]/40 text-[#2B1408] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px]"
                      aria-label={`Call Tryit Cafe at ${displayPhone}`}
                    >
                      <Phone size={15} className="text-[#FE8E2A] shrink-0" />
                      <span className="truncate">Call Cafe</span>
                    </motion.a>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        toastInfo(
                          'Phone calling is temporarily unavailable. Please reach us via WhatsApp!'
                        )
                      }
                      className="py-3 px-4 rounded-2xl bg-[#FDF6EE] hover:bg-[#FBEFE1] border border-[#EEDDCC] hover:border-[#FE8E2A]/40 text-[#2B1408] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px] active:scale-98"
                      aria-label="Call cafe info"
                    >
                      <Phone size={15} className="text-[#FE8E2A] shrink-0" />
                      <span className="truncate">Call Cafe</span>
                    </button>
                  )}

                  {whatsappUrl ? (
                    <motion.a
                      whileHover={shouldReduceMotion ? undefined : { y: -2, scale: 1.015 }}
                      whileTap={{ scale: 0.98 }}
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-3 px-4 rounded-2xl bg-[#FDF6EE] hover:bg-[#FBEFE1] border border-[#EEDDCC] hover:border-[#FE8E2A]/40 text-[#2B1408] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px]"
                      aria-label="Message Tryit Cafe on WhatsApp"
                    >
                      <MessageCircle size={15} className="text-[#FE8E2A] shrink-0" />
                      <span className="truncate">WhatsApp</span>
                    </motion.a>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        toastInfo('WhatsApp contact is temporarily unavailable.')
                      }
                      className="py-3 px-4 rounded-2xl bg-[#FDF6EE] border border-[#EEDDCC] text-[#7A5C4A] text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all min-h-[44px]"
                      aria-label="WhatsApp unavailable"
                    >
                      <MessageCircle size={15} className="text-[#7A5C4A] shrink-0" />
                      <span className="truncate">WhatsApp</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
            </RevealCard>
          </div>

          {/* RIGHT: Compact Clean Roadmap */}
          <div className="lg:col-span-6 flex flex-col h-full">
            <RevealCard index={1} yOffset={30} scaleInitial={0.96} enableHover={false} className="h-full">
              <div className="h-[250px] sm:h-[280px] lg:h-full lg:min-h-[340px] w-full">
                <GoogleMap
                  src={settings?.googleMapsEmbedUrl}
                  height="100%"
                  title="TryIt Cafe & Kitchen location on Google Maps"
                  className="h-full min-h-[250px] sm:min-h-[280px] lg:min-h-[340px]"
                />
              </div>
            </RevealCard>
          </div>
        </div>

        {/* ========================================================== */}
        {/* 3. OPENING HOURS & LIVE STATUS CARD                        */}
        {/* ========================================================== */}
        {/* ========================================================== */}
        {/* 3. OPENING HOURS & LIVE STATUS CARD                        */}
        {/* ========================================================== */}
        <RevealCard
          index={2}
          yOffset={16}
          duration={0.5}
          scaleInitial={1}
          enableHover={false}
        >
          {/* MOBILE VIEW (< sm): Compact, easy-to-scan, premium cafe app layout */}
          <div
            className="sm:hidden rounded-[20px] bg-[#FFFBF7] border border-[#EEDDCC] p-4 shadow-sm"
            aria-labelledby="opening-hours-title-mobile"
          >
            {/* 1. SECTION TITLE */}
            <div className="flex items-center gap-2 mb-3.5">
              <div className="w-7 h-7 rounded-lg bg-[#FE8E2A]/10 border border-[#FE8E2A]/20 flex items-center justify-center shrink-0 text-[#FE8E2A]">
                <Clock size={15} aria-hidden="true" />
              </div>
              <h3
                id="opening-hours-title-mobile"
                className="text-lg font-bold uppercase tracking-wide text-[#FE8E2A] font-serif"
              >
                Opening Hours
              </h3>
            </div>

            {/* 2. TODAY STATUS CARD */}
            <div
              className={`p-3.5 rounded-2xl border transition-colors flex items-center gap-3.5 ${
                physicalStatus.isOpen
                  ? 'bg-emerald-50/80 border-emerald-200/80'
                  : 'bg-rose-50/80 border-rose-200/80'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-white/90 border border-[#EEDDCC]/70 text-[#FE8E2A] flex items-center justify-center shrink-0 shadow-2xs">
                <Clock size={18} className="text-[#FE8E2A]" aria-hidden="true" />
              </div>
              <div className="flex-1 min-w-0">
                {/* Live Status indicator */}
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2 w-2 items-center justify-center shrink-0">
                    {physicalStatus.isOpen ? (
                      shouldReduceMotion ? (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      ) : (
                        <motion.span
                          animate={{ opacity: [1, 0.55, 1] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                          className="w-2 h-2 rounded-full bg-emerald-500"
                        />
                      )
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                    )}
                  </span>
                  <span
                    className={`text-xs font-black uppercase tracking-wider ${
                      physicalStatus.isOpen
                        ? 'text-emerald-700'
                        : 'text-rose-700'
                    }`}
                  >
                    {physicalStatus.isOpen ? 'OPEN NOW' : 'CLOSED'}
                  </span>
                </div>

                {/* Day name */}
                <div className="text-xs font-semibold text-[#7A5C4A] mt-0.5">
                  Today · {todayName}
                </div>

                {/* Today hours */}
                <div className="text-[17px] font-black text-[#FE8E2A] whitespace-nowrap tracking-tight font-display mt-0.5">
                  {todayHoursText}
                </div>
              </div>
            </div>

            {/* 3. WEEKLY SCHEDULE HEADING */}
            <div className="text-[12px] font-extrabold uppercase tracking-wider text-[#7A5C4A] mt-4 mb-2 px-1">
              WEEKLY HOURS
            </div>

            {/* 4. WEEKLY SCHEDULE ROWS */}
            <div className="rounded-2xl bg-white/80 border border-[#EEDDCC]/80 overflow-hidden divide-y divide-[#EEDDCC]/50">
              {orderedDays.map((h, idx) => {
                const isToday =
                  h.dayOfWeek?.trim().toLowerCase() === todayName.toLowerCase();
                return (
                  <motion.div
                    key={h.dayOfWeek}
                    initial={
                      shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }
                    }
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.4,
                      delay: shouldReduceMotion ? 0 : idx * 0.045,
                      ease: 'easeOut',
                    }}
                    className={`flex items-center justify-between px-3.5 py-2.5 min-h-[46px] transition-colors ${
                      isToday ? 'bg-[#FE8E2A]/10' : ''
                    }`}
                  >
                    {/* Left: Day + TODAY badge */}
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-sm ${
                          isToday
                            ? 'font-bold text-[#2B1408]'
                            : 'font-semibold text-[#5C3D2E]'
                        }`}
                      >
                        {h.dayOfWeek}
                      </span>
                      {isToday && (
                        <motion.span
                          initial={
                            shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }
                          }
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.35 }}
                          className="text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-[#FE8E2A] text-white shadow-2xs"
                        >
                          TODAY
                        </motion.span>
                      )}
                    </div>

                    {/* Right: Hours */}
                    <span
                      className={`text-[13px] sm:text-sm whitespace-nowrap text-right ${
                        isToday
                          ? 'font-bold text-[#FE8E2A]'
                          : h.closed
                          ? 'font-bold text-rose-500'
                          : 'font-medium text-[#7A5C4A]'
                      }`}
                    >
                      {h.closed ? (
                        'Closed'
                      ) : (
                        formatBusinessHoursRange(h.openTime, h.closeTime)
                      )}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* DESKTOP VIEW (sm:block): Retains existing balanced 2-column layout */}
          <div
            className="hidden sm:block rounded-2xl sm:rounded-3xl bg-[#FFFBF7] border border-[#EEDDCC] p-5 sm:p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
            aria-labelledby="opening-hours-title-desktop"
          >
            {/* Card Header: Title & Live Status */}
            <div className="flex items-center justify-between gap-4 pb-5 border-b border-[#EEDDCC]">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#FDF6EE] border border-[#EEDDCC] text-[#FE8E2A] flex items-center justify-center shrink-0">
                  <Clock size={19} />
                </div>
                <div>
                  <span
                    id="opening-hours-title-desktop"
                    className="text-[11px] font-bold uppercase tracking-wider text-[#FE8E2A] block"
                  >
                    Opening Hours
                  </span>
                  <h4 className="text-base sm:text-lg font-bold text-[#2B1408] font-serif flex items-center gap-2">
                    <span>Open Today:</span>
                    <span className="text-[#FE8E2A] font-bold">
                      {todayHoursText}
                    </span>
                  </h4>
                </div>
              </div>

              {/* Live Open / Closed Physical Status Indicator */}
              <div>
                {physicalStatus.isOpen ? (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-extrabold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{physicalStatus.label}</span>
                  </div>
                ) : (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-xs font-extrabold">
                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>{physicalStatus.label}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Clean Weekly Schedule Grid: Monday-Saturday in 2 columns, Sunday centered */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 pt-5">
              {weekdays.map((h) => renderDayItem(h))}

              {/* Sunday centered across both columns */}
              {sundayDay && (
                <div className="col-span-2 flex justify-center pt-1">
                  <div className="w-[calc(50%-16px)]">
                    {renderDayItem(sundayDay)}
                  </div>
                </div>
              )}
            </div>
          </div>
        </RevealCard>
      </div>
    </section>
  );
};
