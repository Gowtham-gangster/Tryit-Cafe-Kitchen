import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Flame } from 'lucide-react';
import { useMenuStore } from '../../store/useMenuStore';
import { PopularDishCard } from './PopularDishCard';

export const FeaturedDishesSection: React.FC = () => {
  const { menuItems } = useMenuStore();
  const shouldReduceMotion = useReducedMotion();
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  // Popular at Tryit is OWNER-MANAGED via item.isPopular (independent of bestseller)
  const popularItems = menuItems
    .filter((item) => item.isPopular || item.popular)
    .sort((a, b) => (a.popularDisplayOrder ?? 999) - (b.popularDisplayOrder ?? 999))
    .slice(0, 6);

  // Scroll listener to update active index based on card closest to center
  const handleScroll = useCallback(() => {
    const container = carouselRef.current;
    if (!container) return;

    const scrollLeft = container.scrollLeft;
    const containerWidth = container.clientWidth;
    const centerPoint = scrollLeft + containerWidth / 2;

    let closestIndex = 0;
    let minDistance = Infinity;

    const children = container.children;
    for (let i = 0; i < popularItems.length; i++) {
      const child = children[i] as HTMLElement;
      if (!child) continue;
      const childCenter = child.offsetLeft + child.offsetWidth / 2;
      const distance = Math.abs(centerPoint - childCenter);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
    }

    if (closestIndex !== activeIndex) {
      setActiveIndex(closestIndex);
    }
  }, [popularItems.length, activeIndex]);

  useEffect(() => {
    const container = carouselRef.current;
    if (!container) return;

    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, [handleScroll]);

  const scrollToIndex = (index: number) => {
    const container = carouselRef.current;
    if (!container) return;
    const child = container.children[index] as HTMLElement;
    if (child) {
      const containerWidth = container.clientWidth;
      const targetScroll =
        child.offsetLeft - (containerWidth - child.offsetWidth) / 2;
      container.scrollTo({
        left: Math.max(0, targetScroll),
        behavior: 'smooth',
      });
      setActiveIndex(index);
    }
  };

  // Gracefully hide the section if no items are marked as popular
  if (popularItems.length === 0) return null;

  return (
    <section
      id="popular"
      className="py-10 sm:py-12 lg:py-14 bg-[#FDF6EE] text-[#2B1408] border-b border-[#EEDDCC] overflow-hidden scroll-mt-16 sm:scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Staggered Entrance Animation */}
        <div className="text-center max-w-2xl mx-auto mb-6 sm:mb-8">
          {/* Badge: 0ms delay, translateY 10px -> 0, opacity 0 -> 1, duration 400-550ms */}
          <motion.div
            initial={
              shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }
            }
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: 'easeOut', delay: 0 }}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1 rounded-full bg-[#FBEFE1] border border-[#EEDDCC] text-[#2B1408] text-xs sm:text-[13px] font-bold uppercase tracking-wider mb-2.5 sm:mb-3"
          >
            <Flame size={14} className="text-[#FE8E2A] fill-[#FE8E2A]" />
            <span>Customer Favorites</span>
          </motion.div>

          {/* Heading */}
          <motion.h2
            initial={
              shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }
            }
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: 0.5,
              ease: 'easeOut',
              delay: shouldReduceMotion ? 0 : 0.08,
            }}
            className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif text-[#2B1408] tracking-tight mb-2 leading-tight"
          >
            Popular at Tryit
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={
              shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }
            }
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{
              duration: 0.5,
              ease: 'easeOut',
              delay: shouldReduceMotion ? 0 : 0.16,
            }}
            className="text-xs sm:text-sm lg:text-base text-[#7A5C4A] max-w-md mx-auto leading-relaxed"
          >
            Handpicked favorites our customers keep coming back for.
          </motion.p>
        </div>

        {/*
          Responsive Layout:
          - Mobile (<sm): Compact horizontal snap carousel with peek discoverability (86-90% width, no page overflow)
          - Tablet / Desktop (sm+): Balanced multi-column grid
        */}
        <div
          ref={carouselRef}
          className={`-mx-4 px-4 sm:mx-0 sm:px-0 flex sm:grid gap-3 sm:gap-5 lg:gap-6 overflow-x-auto sm:overflow-visible pb-3 sm:pb-0 no-scrollbar snap-x snap-mandatory scroll-pl-4 sm:scroll-pl-0 ${
            popularItems.length === 1
              ? 'max-w-md mx-auto sm:grid-cols-1'
              : popularItems.length === 2
              ? 'max-w-3xl mx-auto sm:grid-cols-2'
              : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          }`}
        >
          {popularItems.map((item, idx) => {
            const staggerDelay = shouldReduceMotion
              ? 0
              : Math.min(idx * 0.1, 0.4);

            return (
              <div
                key={item.id}
                className="snap-center shrink-0 w-[84vw] max-w-[370px] min-[360px]:w-[300px] min-[375px]:w-[315px] min-[390px]:w-[330px] min-[412px]:w-[350px] min-[430px]:w-[365px] sm:w-auto sm:shrink sm:snap-align-none h-full"
              >
                <motion.div
                  initial={
                    shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }
                  }
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{
                    duration: 0.5,
                    ease: 'easeOut',
                    delay: staggerDelay,
                  }}
                  className="h-full will-change-transform"
                >
                  <PopularDishCard
                    item={item}
                    idx={idx}
                    isActive={idx === activeIndex}
                  />
                </motion.div>
              </div>
            );
          })}
        </div>

        {/* Mobile Carousel Indicators (● ○ ○ ○ ○) */}
        {popularItems.length > 1 && (
          <div
            className="flex sm:hidden items-center justify-center gap-1.5 mt-4"
            aria-label="Popular dishes carousel pagination"
          >
            {popularItems.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => scrollToIndex(i)}
                aria-label={`Go to popular dish ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? 'w-5 bg-[#FE8E2A]'
                    : 'w-1.5 bg-[#D4C3B3] hover:bg-[#BCA998]'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
