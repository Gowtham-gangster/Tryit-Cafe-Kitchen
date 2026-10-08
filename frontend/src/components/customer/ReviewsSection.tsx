import React, { useState, useMemo, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Star,
  PenLine,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useMenuStore } from '../../store/useMenuStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { Review } from '../../types';

// Helper to extract customer initials for authentic avatar display
const getCustomerInitials = (name?: string): string => {
  if (!name || !name.trim()) return 'TC';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const ReviewsSection: React.FC = () => {
  const { reviews, setIsReviewModalOpen } = useMenuStore();
  const { settings } = useSettingsStore();
  const shouldReduceMotion = useReducedMotion();

  // Window width tracking for responsive card layout
  const [windowWidth, setWindowWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Carousel measurement & navigation state
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const pauseTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Authoritative cafe rating: backend business settings displayRating (4.9), fallback to 4.9
  const overallRating = useMemo(() => {
    if (settings?.displayRating && typeof settings.displayRating === 'number') {
      return settings.displayRating.toFixed(1);
    }
    return '4.9';
  }, [settings?.displayRating]);

  // Clean list of approved reviews from store
  const rawReviews = useMemo(() => {
    return reviews || [];
  }, [reviews]);

  const totalReviews = rawReviews.length;

  // Responsive visible card count:
  // Desktop (>= 1024px): 4 cards
  // Tablet (>= 640px): 2 cards
  // Mobile (< 640px): 1 card
  const visibleCards = useMemo(() => {
    if (windowWidth >= 1024) return 4;
    if (windowWidth >= 640) return 2;
    return 1;
  }, [windowWidth]);

  const gap = 16; // 16px gap between cards
  const canScroll = totalReviews > visibleCards;

  // Measure carousel container width accurately
  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateWidth();
    const ro = new ResizeObserver(updateWidth);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [canScroll, visibleCards]);

  // Infinite Carousel Cloned Items (only when totalReviews > visibleCards)
  const displayItems = useMemo(() => {
    if (!canScroll || totalReviews === 0) return rawReviews;
    let items = [...rawReviews];
    while (items.length < totalReviews + visibleCards + 1) {
      items = [...items, ...rawReviews];
    }
    return items;
  }, [rawReviews, totalReviews, visibleCards, canScroll]);

  // Exact card width calculation so visibleCards fit the measured container with 0px overflow
  const cardWidth = useMemo(() => {
    if (containerWidth <= 0) return 0;
    return (containerWidth - (visibleCards - 1) * gap) / visibleCards;
  }, [containerWidth, visibleCards, gap]);

  // Translation offset in pixels
  const translateX = canScroll && cardWidth > 0 ? currentIndex * (cardWidth + gap) : 0;

  // Next Slide Handler
  const handleNext = useCallback(() => {
    if (!canScroll) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  }, [canScroll]);

  // Prev Slide Handler
  const handlePrev = useCallback(() => {
    if (!canScroll) return;
    if (currentIndex === 0) {
      setIsTransitioning(false);
      setCurrentIndex(totalReviews);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsTransitioning(true);
          setCurrentIndex(totalReviews - 1);
        });
      });
    } else {
      setIsTransitioning(true);
      setCurrentIndex((prev) => prev - 1);
    }
  }, [canScroll, currentIndex, totalReviews]);

  // Seamless Infinite Loop Reset on Animation Complete
  const handleAnimationComplete = () => {
    if (canScroll && currentIndex >= totalReviews) {
      setIsTransitioning(false);
      setCurrentIndex(0);
    }
  };

  // Autoplay Effect (3.8s interval, 500ms smooth ease transition)
  useEffect(() => {
    if (!canScroll || isPaused || shouldReduceMotion) return;
    const timer = setInterval(() => {
      handleNext();
    }, 3800);
    return () => clearInterval(timer);
  }, [canScroll, isPaused, shouldReduceMotion, handleNext]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (pauseTimeoutRef.current) clearTimeout(pauseTimeoutRef.current);
    setIsPaused(true);
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current !== null) {
      const diff = e.changedTouches[0].clientX - touchStartXRef.current;
      if (Math.abs(diff) > 40) {
        if (diff > 0) {
          handlePrev();
        } else {
          handleNext();
        }
      }
      touchStartXRef.current = null;
    }
    pauseTimeoutRef.current = setTimeout(() => {
      setIsPaused(false);
    }, 2500);
  };

  return (
    <section
      id="reviews"
      className="py-10 sm:py-12 bg-[#FDF6EE] relative overflow-hidden border-t border-[#EEDDCC] scroll-mt-16 sm:scroll-mt-20"
      aria-label="Customer Reviews"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* ========================================================== */}
        {/* 1. COMPACT HEADER: TITLE + OVERALL RATING                  */}
        {/* ========================================================== */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
          {/* Left: Eyebrow + Heading + Subtitle */}
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-[#FE8E2A] mb-1.5 px-3 py-1 rounded-full bg-[#FE8E2A]/10 border border-[#FE8E2A]/20">
              <Star size={11} className="fill-[#FE8E2A] text-[#FE8E2A]" />
              <span>CUSTOMER STORIES</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#2B1408] font-serif tracking-tight leading-tight">
              What Our Customers Say
            </h2>

            <p className="text-xs sm:text-sm text-[#7A5C4A] mt-1.5 leading-relaxed">
              Good food, cozy moments, and plenty of reasons to come back.
            </p>
          </div>

          {/* Right: Overall Rating Display (4.9 OUT OF 5) */}
          <div className="flex items-center gap-3 bg-[#FFFBF7] px-4 py-2.5 rounded-2xl border border-[#EEDDCC] shadow-2xs shrink-0 self-start sm:self-auto">
            <span className="text-2xl sm:text-3xl font-black text-[#2B1408] font-serif leading-none">
              {overallRating}
            </span>
            <div className="flex flex-col">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={13} className="fill-[#FE8E2A] text-[#FE8E2A]" />
                ))}
              </div>
              <span className="text-[10px] font-extrabold text-[#FE8E2A] uppercase tracking-wider mt-0.5">
                OUT OF 5
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================== */}
        {/* 2. SIMPLE, EQUAL-SIZED 4-CARD REVIEW CONTAINER             */}
        {/* ========================================================== */}
        {totalReviews > 0 ? (
          <div>
            {!canScroll ? (
              /* Static Responsive Grid: Exactly 4 equal cards on Desktop */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {rawReviews.map((rev) => (
                  <ReviewCard key={rev.id || rev.customerName} review={rev} />
                ))}
              </div>
            ) : (
              /* Smooth Horizontal Carousel when more than visibleCards exist */
              <div
                ref={containerRef}
                className="overflow-hidden w-full relative"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <motion.div
                  animate={{ x: -translateX }}
                  onAnimationComplete={handleAnimationComplete}
                  transition={
                    !isTransitioning || shouldReduceMotion
                      ? { duration: 0 }
                      : { duration: 0.55, ease: 'easeInOut' }
                  }
                  className="flex"
                  style={{ gap: `${gap}px` }}
                >
                  {displayItems.map((rev, idx) => (
                    <div
                      key={`${rev.id || 'rev'}-${idx}`}
                      className="shrink-0"
                      style={{
                        width: cardWidth > 0 ? `${cardWidth}px` : undefined,
                        flex: `0 0 ${
                          cardWidth > 0
                            ? `${cardWidth}px`
                            : visibleCards === 4
                            ? 'calc((100% - 48px) / 4)'
                            : visibleCards === 2
                            ? 'calc((100% - 16px) / 2)'
                            : '100%'
                        }`,
                      }}
                    >
                      <ReviewCard review={rev} />
                    </div>
                  ))}
                </motion.div>
              </div>
            )}

            {/* ========================================================== */}
            {/* 3. COMPACT WRITE A REVIEW ACTION (WITH PREV/NEXT IF CAN SCROLL) */}
            {/* ========================================================== */}
            <div className="flex items-center justify-center mt-6 sm:mt-7 gap-3">
              {canScroll && (
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Previous review"
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-[#FFFBF7] hover:bg-[#FE8E2A] hover:text-white text-[#2B1408] border border-[#EEDDCC] shadow-2xs transition-colors cursor-pointer active:scale-95"
                >
                  <ChevronLeft size={15} />
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsReviewModalOpen(true)}
                aria-label="Write a review"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#FE8E2A] hover:bg-[#E67616] text-white text-xs sm:text-sm font-extrabold shadow-md shadow-[#FE8E2A]/20 transition-all cursor-pointer hover:scale-[1.02] active:scale-95"
              >
                <PenLine size={14} />
                <span>Write a Review</span>
              </button>

              {canScroll && (
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Next review"
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-[#FFFBF7] hover:bg-[#FE8E2A] hover:text-white text-[#2B1408] border border-[#EEDDCC] shadow-2xs transition-colors cursor-pointer active:scale-95"
                >
                  <ChevronRight size={15} />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Clean Empty State */
          <div className="py-10 text-center rounded-3xl bg-[#FFFBF7] border border-[#EEDDCC] p-6 max-w-md mx-auto shadow-xs">
            <Star size={24} className="fill-[#FE8E2A] text-[#FE8E2A] mx-auto mb-2" />
            <h3 className="text-base font-bold text-[#2B1408]">Be the first to share your experience</h3>
            <p className="text-xs text-[#7A5C4A] mt-1">Dined with us? Tell fellow foodies about your visit!</p>
            <button
              type="button"
              onClick={() => setIsReviewModalOpen(true)}
              className="mt-4 px-5 py-2.5 rounded-full bg-[#FE8E2A] text-white text-xs font-bold hover:bg-[#E67616] transition-colors"
            >
              Write a Review
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

// ==========================================================
// Simple, Equal-Sized Review Card Component
// Content-driven compact height (~175-210px), no empty space,
// no verified badge, no date, only: Rating, Text, Reviewer.
// ==========================================================
interface ReviewCardProps {
  review: Review;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={
        shouldReduceMotion
          ? undefined
          : {
              y: -3,
              transition: { duration: 0.2, ease: 'easeOut' },
            }
      }
      className="min-h-[175px] max-h-[210px] h-full w-full p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#FFFBF7] border border-[#EEDDCC] shadow-2xs hover:border-[#FE8E2A]/40 transition-all flex flex-col justify-between select-none"
    >
      {/* TOP: Rating Stars + Review Text */}
      <div>
        {/* Rating Stars */}
        <div className="flex items-center gap-1 mb-2.5 shrink-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              size={13}
              className={
                i < review.rating
                  ? 'fill-[#FE8E2A] text-[#FE8E2A]'
                  : 'fill-transparent text-[#EEDDCC]'
              }
            />
          ))}
        </div>

        {/* Review Comment: line-clamp-3 */}
        <p className="text-xs sm:text-[13px] text-[#2B1408] leading-relaxed line-clamp-3 font-normal">
          "{review.comment}"
        </p>
      </div>

      {/* BOTTOM: Reviewer Avatar & Name ONLY (No Verified badge, No Date) */}
      <div className="pt-2.5 border-t border-[#EEDDCC]/70 mt-3 flex items-center gap-2.5 shrink-0">
        <div className="w-8 h-8 rounded-full bg-[#FBEFE1] border border-[#EEDDCC] text-[#FE8E2A] font-extrabold text-xs flex items-center justify-center shrink-0">
          {getCustomerInitials(review.customerName)}
        </div>
        <span className="text-xs sm:text-[13px] font-bold text-[#2B1408] font-serif truncate">
          {review.customerName}
        </span>
      </div>
    </motion.div>
  );
};
