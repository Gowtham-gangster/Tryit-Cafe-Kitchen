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
        {/* Section Header - Focused, High-Impact & Compact Mobile Spacing */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="text-center max-w-xl mx-auto mb-6 sm:mb-8"
        >
          {/* Eyebrow Badge (12-14px) */}
          <div className="inline-flex items-center gap-1.5 text-xs sm:text-[13px] font-extrabold uppercase tracking-widest text-[#FE8E2A] mb-2.5 px-3 py-1 rounded-full bg-[#FE8E2A]/10 border border-[#FE8E2A]/25 shadow-2xs">
            <Sparkles size={13} className="text-[#FE8E2A]" />
            <span>SPECIAL PROMOTIONS</span>
          </div>

          {/* Heading (30-36px mobile, serif, tracking-tight) */}
          <h2 className="text-[1.85rem] min-[390px]:text-[2.1rem] sm:text-4xl lg:text-5xl font-extrabold text-[#2B1408] font-serif tracking-tight leading-tight mb-2">
            Today&apos;s Cafe Deals &amp; Offers
          </h2>

          {/* Subtitle (14-16px) */}
          <p className="text-sm min-[390px]:text-[15px] sm:text-base text-[#7A5C4A] max-w-md mx-auto leading-relaxed">
            Good food tastes even better with a great deal.
          </p>
        </motion.div>

        {/*
          Offers Cards Container:
          - Mobile (<sm): 100% width vertical single-column stack, natural page scrolling (NO horizontal carousel)
          - Tablet / Desktop (sm+): Balanced multi-column grid
        */}
        <div
          className={`w-full flex flex-col gap-4 min-[390px]:gap-4.5 sm:grid sm:gap-5 lg:gap-6 ${offers.length === 1
              ? 'max-w-lg mx-auto sm:grid-cols-1'
              : offers.length === 2
                ? 'max-w-4xl mx-auto sm:grid-cols-2'
                : 'max-w-6xl mx-auto sm:grid-cols-2 lg:grid-cols-3'
            }`}
        >
          {offers.map((offer, idx) => (
            /* Outer Wrapper: Handles Staggered Entrance Animation without conflicting with continuous floating */
            <motion.div
              key={offer.id}
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 20, scale: 0.98 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{
                duration: shouldReduceMotion ? 0 : 0.5,
                delay: shouldReduceMotion ? 0 : Math.min(idx * 0.1, 0.4),
                ease: 'easeOut',
              }}
              className="w-full"
            >
              {/* Inner Card: Gentle Floating Effect (±3px), Shadow Breathing, Border Highlight, Desktop Hover, & Mobile Tap */}
              <motion.div
                animate={
                  shouldReduceMotion
                    ? undefined
                    : {
                      y: [0, -3, 0, 3, 0],
                      borderColor: [
                        'rgba(254, 142, 42, 0.30)',
                        'rgba(254, 142, 42, 0.52)',
                        'rgba(254, 142, 42, 0.30)',
                        'rgba(254, 142, 42, 0.38)',
                        'rgba(254, 142, 42, 0.30)',
                      ],
                      boxShadow: [
                        '0 10px 24px -8px rgba(43, 20, 8, 0.35)',
                        '0 15px 32px -8px rgba(43, 20, 8, 0.44), 0 0 16px -4px rgba(254, 142, 42, 0.16)',
                        '0 10px 24px -8px rgba(43, 20, 8, 0.35)',
                        '0 8px 20px -8px rgba(43, 20, 8, 0.30)',
                        '0 10px 24px -8px rgba(43, 20, 8, 0.35)',
                      ],
                    }
                }
                transition={
                  shouldReduceMotion
                    ? undefined
                    : {
                      duration: 6,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: idx * 1.0,
                    }
                }
                whileHover={
                  shouldReduceMotion
                    ? undefined
                    : {
                      y: -5,
                      scale: 1.01,
                      boxShadow: '0 18px 38px -10px rgba(43, 20, 8, 0.48), 0 0 24px -6px rgba(254, 142, 42, 0.28)',
                      borderColor: 'rgba(254, 142, 42, 0.70)',
                      transition: { duration: 0.22, ease: 'easeOut' },
                    }
                }
                whileTap={
                  shouldReduceMotion
                    ? undefined
                    : {
                      scale: 0.99,
                      transition: { duration: 0.14 },
                    }
                }
                className="w-full relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#2B1408] via-[#381B0E] to-[#1E0D05] border border-[#FE8E2A]/30 text-white p-4.5 min-[390px]:p-5 sm:p-6 shadow-md flex flex-col justify-between group transition-colors duration-300 min-h-[190px] min-[390px]:min-h-[200px]"
              >
                {/* Layer 1: Background Banner Image with Subtle Hover Depth (1.00 -> 1.015) & Dark Legibility Overlay */}
                {offer.bannerImageUrl && (
                  <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none" aria-hidden="true">
                    <img
                      src={getOptimizedImageUrl(offer.bannerImageUrl, 'offerBanner')}
                      alt=""
                      className="w-full h-full object-cover opacity-15 group-hover:opacity-22 group-hover:scale-[1.015] group-active:scale-[1.015] transition-all duration-500 ease-out"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#1E0D05]/95 via-[#2B1408]/85 to-[#1E0D05]/95" />
                  </div>
                )}

                {/* Layer 2: Orange Light Sweep (Above background, Below text content) */}
                {!shouldReduceMotion && (
                  <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none select-none" aria-hidden="true">
                    <motion.div
                      className="absolute top-0 bottom-0 w-3/5"
                      style={{
                        background:
                          'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.04) 25%, rgba(254, 142, 42, 0.14) 50%, rgba(255, 255, 255, 0.04) 75%, transparent 100%)',
                        transform: 'skewX(-20deg)',
                      }}
                      animate={{
                        left: ['-80%', '160%', '160%', '-80%'],
                        opacity: [0, 1, 0, 0],
                      }}
                      transition={{
                        duration: 6,
                        times: [0, 0.24, 0.28, 1],
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: idx * 1.5,
                      }}
                    />
                  </div>
                )}

                {/* Layer 3: Offer Header: Category Badge + Soft Pulsing Discount Badge */}
                <div className="relative z-10 flex items-center justify-between gap-2 mb-2.5 sm:mb-3">
                  <motion.div
                    initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, x: -5 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: shouldReduceMotion ? 0 : 0.35,
                      delay: shouldReduceMotion ? 0 : idx * 0.1 + 0.1,
                      ease: 'easeOut',
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 min-[390px]:px-3 min-[390px]:py-1 rounded-full bg-white/12 text-[#FFFBF7] text-[10.5px] min-[390px]:text-[11px] font-extrabold tracking-wider uppercase backdrop-blur-md border border-white/15"
                  >
                    <Sparkles size={11} className="text-[#FE8E2A]" />
                    <span>{offer.badgeText || 'SPECIAL DEAL'}</span>
                  </motion.div>

                  {offer.discountValue && (
                    <motion.div
                      animate={
                        shouldReduceMotion
                          ? undefined
                          : {
                            opacity: [1, 0.93, 1],
                            boxShadow: [
                              '0 2px 8px -2px rgba(254, 142, 42, 0.35)',
                              '0 4px 16px 0px rgba(254, 142, 42, 0.65)',
                              '0 2px 8px -2px rgba(254, 142, 42, 0.35)',
                            ],
                          }
                      }
                      transition={
                        shouldReduceMotion
                          ? undefined
                          : {
                            duration: 3,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: idx * 0.8,
                          }
                      }
                      className="px-2.5 py-0.5 min-[390px]:px-3 min-[390px]:py-1 rounded-lg min-[390px]:rounded-xl bg-gradient-to-r from-[#FE8E2A] to-[#E67616] text-white text-[11.5px] min-[390px]:text-xs sm:text-sm font-black shadow-sm tracking-tight border border-white/20 whitespace-nowrap"
                    >
                      {offer.discountType === 'PERCENTAGE'
                        ? `${offer.discountValue}% OFF`
                        : `₹${offer.discountValue} OFF`}
                    </motion.div>
                  )}
                </div>

                {/* Layer 3: Dedicated Banner Image (Uploaded by Owner) */}
                {offer.bannerImageUrl && (
                  <div className="relative z-10 mb-3.5 sm:mb-4 aspect-[16/8] sm:aspect-[16/7] w-full rounded-xl sm:rounded-2xl overflow-hidden bg-[#1E0D05] border border-white/10 shadow-xs group/img shrink-0">
                    <img
                      src={getOptimizedImageUrl(offer.bannerImageUrl, 'offerBanner')}
                      alt={offer.title}
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        (e.currentTarget.parentElement as HTMLElement)?.classList.add('hidden');
                      }}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                  </div>
                )}

                {/* Layer 3: Main Content: Prominent Title & Clear Readable Description */}
                <div className="relative z-10">
                  <h3 className="text-[1.25rem] min-[390px]:text-[1.38rem] sm:text-2xl font-bold mb-1.5 sm:mb-2 font-serif text-white tracking-tight group-hover:text-[#FFA857] transition-colors leading-snug">
                    {offer.title}
                  </h3>
                  <p className="text-[13px] min-[390px]:text-[14px] sm:text-[15px] text-[#E5D5C5] leading-[1.45] font-normal mb-3 sm:mb-4">
                    {offer.description}
                  </p>
                </div>

                {/* Layer 3: Footer Row: Minimum Order Details + Compact Order Action Button with Tap/Hover Feedback */}
                <div className="relative z-10 flex items-center justify-between gap-2 pt-3 border-t border-white/15 mt-auto">
                  <div className="min-w-0 flex-1">
                    {offer.minOrderAmount ? (
                      <span className="text-[11.5px] min-[390px]:text-xs text-[#D8C7BC] font-medium block leading-tight">
                        Min Order: <strong className="text-white font-semibold">₹{offer.minOrderAmount}</strong>
                      </span>
                    ) : (
                      <span className="text-[11.5px] min-[390px]:text-xs text-[#D8C7BC] font-medium block leading-tight">
                        Valid on all orders
                      </span>
                    )}
                  </div>

                  <motion.button
                    type="button"
                    whileHover={
                      shouldReduceMotion
                        ? undefined
                        : {
                          y: -1,
                          scale: 1.02,
                          boxShadow: '0 6px 18px -2px rgba(254, 142, 42, 0.45)',
                          transition: { duration: 0.18 },
                        }
                    }
                    whileTap={
                      shouldReduceMotion
                        ? undefined
                        : {
                          scale: 0.97,
                          transition: { duration: 0.12 },
                        }
                    }
                    onClick={scrollToMenu}
                    className="h-11 px-4 sm:px-5 rounded-xl bg-[#FE8E2A] hover:bg-[#E67616] active:bg-[#C65A08] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-colors shadow-sm shadow-[#FE8E2A]/25 cursor-pointer shrink-0 select-none group/btn"
                    aria-label={`Order Now for ${offer.title}`}
                  >
                    <span>Order Now</span>
                    <ArrowRight size={14} className="group-hover/btn:translate-x-0.5 transition-transform duration-200" />
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
