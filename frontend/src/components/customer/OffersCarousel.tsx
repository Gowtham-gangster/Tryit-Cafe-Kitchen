import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useMenuStore } from '../../store/useMenuStore';
import { normalizeImageUrl, getOptimizedImageUrl } from '../../utils/imageUrl';

export const OffersCarousel: React.FC = () => {
  const { offers } = useMenuStore();
  const shouldReduceMotion = useReducedMotion();

  const scrollToMenu = () => {
    const el = document.getElementById('menu');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Graceful empty state
  if (!offers || offers.length === 0) {
    return (
      <section
        id="offers"
        className="w-full py-10 sm:py-14 bg-[#FDF6EE] border-b border-[#EEDDCC] relative overflow-hidden scroll-mt-16 sm:scroll-mt-20"
        aria-label="Today's Cafe Deals & Offers"
      >
        <div className="max-w-xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-widest text-[#FE8E2A] mb-3 px-3 py-1 rounded-full bg-[#FE8E2A]/10 border border-[#FE8E2A]/25">
            <Sparkles size={13} className="text-[#FE8E2A]" />
            <span>SPECIAL PROMOTIONS</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2B1408] font-serif tracking-tight mb-2">
            Today&apos;s Cafe Deals &amp; Offers
          </h2>
          <p className="text-sm text-[#7A5C4A] leading-relaxed">
            No special offers right now.<br />Check back soon for something delicious.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      id="offers"
      className="w-full py-10 sm:py-12 lg:py-14 bg-[#FDF6EE] border-b border-[#EEDDCC] relative overflow-hidden scroll-mt-16 sm:scroll-mt-20"
      aria-label="Today's Cafe Deals & Offers"
    >
      {/* Subtle brand ambient glow accents contained to strictly avoid horizontal document overflow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[340px] bg-[#FE8E2A]/5 rounded-full blur-3xl" />
        <div className="absolute top-0 right-10 w-64 h-64 bg-[#FE8E2A]/4 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-10 w-64 h-64 bg-[#FE8E2A]/4 rounded-full blur-2xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="text-center max-w-xl mx-auto mb-6 sm:mb-8"
        >
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#FE8E2A] mb-2 px-3 py-1 rounded-full bg-[#FE8E2A]/10 border border-[#FE8E2A]/25">
            <Sparkles size={13} className="text-[#FE8E2A]" />
            <span>SPECIAL PROMOTIONS</span>
          </div>

          {/* Heading: Refined 32-40px */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2B1408] font-serif tracking-tight leading-tight mb-2">
            Today&apos;s Cafe Deals &amp; Offers
          </h2>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm lg:text-base text-[#7A5C4A] max-w-md mx-auto leading-relaxed">
            Good food tastes even better with a great deal.
          </p>
        </motion.div>

        {/* Offers Cards Grid */}
        <div
          className={`w-full flex flex-col gap-4 sm:grid sm:gap-5 lg:gap-6 ${
            offers.length === 1
              ? 'max-w-lg mx-auto sm:grid-cols-1'
              : offers.length === 2
                ? 'max-w-4xl mx-auto sm:grid-cols-2'
                : 'max-w-6xl mx-auto sm:grid-cols-2 lg:grid-cols-3'
          }`}
        >
          {offers.map((offer, idx) => {
            const cleanBadge =
              offer.badgeText && !offer.badgeText.toLowerCase().includes('demo')
                ? offer.badgeText
                : 'Special Offer';

            return (
              <motion.div
                key={offer.id}
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: shouldReduceMotion ? 0 : 0.45,
                  delay: shouldReduceMotion ? 0 : Math.min(idx * 0.08, 0.3),
                  ease: 'easeOut',
                }}
                className="w-full h-full"
              >
                <motion.div
                  whileHover={
                    shouldReduceMotion
                      ? undefined
                      : {
                          y: -3,
                          transition: { duration: 0.2, ease: 'easeOut' },
                        }
                  }
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.99 }}
                  className="w-full h-full relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#FFFBF7] border border-[#EEDDCC] hover:border-[#FE8E2A]/60 p-4.5 sm:p-5 shadow-[0_3px_14px_-3px_rgba(43,20,8,0.06)] hover:shadow-[0_8px_24px_-4px_rgba(43,20,8,0.12)] flex flex-col justify-between group transition-all duration-200"
                >
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FE8E2A]/10 text-[#FE8E2A] text-[11px] font-bold uppercase tracking-wider border border-[#FE8E2A]/20">
                      <Sparkles size={11} className="text-[#FE8E2A]" />
                      <span>{cleanBadge}</span>
                    </span>

                    {offer.discountValue && (
                      <span className="px-2.5 py-0.5 rounded-lg bg-[#FE8E2A] text-white text-xs sm:text-[13px] font-bold shadow-2xs whitespace-nowrap">
                        {offer.discountType === 'PERCENTAGE'
                          ? `${offer.discountValue}% OFF`
                          : `₹${offer.discountValue} OFF`}
                      </span>
                    )}
                  </div>

                  {/* Optional Banner Image */}
                  {offer.bannerImageUrl && (
                    <div className="mb-3 aspect-[16/8] sm:aspect-[16/7] w-full rounded-xl overflow-hidden bg-[#FDF6EE] border border-[#EEDDCC] shrink-0">
                      <img
                        src={getOptimizedImageUrl(offer.bannerImageUrl, 'offerBanner')}
                        alt={offer.title}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          (e.currentTarget.parentElement as HTMLElement)?.classList.add('hidden');
                        }}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300 ease-out"
                      />
                    </div>
                  )}

                  {/* Main Content */}
                  <div className="flex-1">
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold mb-1.5 font-serif text-[#2B1408] tracking-tight group-hover:text-[#FE8E2A] transition-colors leading-snug">
                      {offer.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#7A5C4A] leading-relaxed line-clamp-2 mb-4">
                      {offer.description}
                    </p>
                  </div>

                  {/* Footer Action Row */}
                  <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#EEDDCC] mt-auto">
                    <div className="min-w-0 flex-1">
                      {offer.minOrderAmount ? (
                        <span className="text-xs text-[#7A5C4A] font-medium block leading-tight">
                          Min Order: <strong className="text-[#2B1408] font-bold">₹{offer.minOrderAmount}</strong>
                        </span>
                      ) : (
                        <span className="text-xs text-[#7A5C4A] font-medium block leading-tight">
                          Valid on all orders
                        </span>
                      )}
                    </div>

                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.97 }}
                      onClick={scrollToMenu}
                      className="h-9 sm:h-10 px-3.5 sm:px-4 rounded-xl bg-[#FE8E2A] hover:bg-[#E67616] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors shadow-2xs cursor-pointer shrink-0"
                      aria-label={`Order Now for ${offer.title}`}
                    >
                      <span>Order Now</span>
                      <ArrowRight size={14} />
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
