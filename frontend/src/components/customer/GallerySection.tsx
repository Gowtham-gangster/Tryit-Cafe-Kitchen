import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  useMotionValue,
  useSpring,
  useTransform,
} from 'framer-motion';
import {
  Camera,
  X,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Play,
} from 'lucide-react';
import { useMenuStore } from '../../store/useMenuStore';
import { GalleryItem } from '../../types';
import { normalizeImageUrl, getOptimizedImageUrl, getOptimizedSrcSet } from '../../utils/imageUrl';

// Category definitions
const CATEGORIES = ['All', 'Ambience', 'Food', 'Kitchen'] as const;
type CategoryType = (typeof CATEGORIES)[number];

// Reusable Image with Skeleton & Graceful Fallback
interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

const SafeImage: React.FC<SafeImageProps> = ({ src, alt, className = '', priority = false }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#F6EADB]">
      {/* Warm Cream Shimmer Skeleton while loading */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#F6EADB] via-[#FFF8F0] to-[#F6EADB] animate-pulse" />
      )}

      {/* Graceful Fallback when image fails */}
      {hasError ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FDF6EE] p-4 text-center border border-[#EEDDCC]">
          <div className="w-12 h-12 rounded-full bg-[#FBEFE1] text-[#FE8E2A] flex items-center justify-center mb-2">
            <Camera size={22} />
          </div>
          <span className="text-xs font-bold text-[#2B1408] font-display">Tryit Cafe Moment</span>
          <span className="text-[11px] text-[#7A5C4A] mt-0.5">Image unavailable</span>
        </div>
      ) : (
        <img
          src={getOptimizedImageUrl(src, 'gallery')}
          srcSet={getOptimizedSrcSet(src, [360, 540, 720]) || undefined}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          alt={alt}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`${className} ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } transition-opacity duration-300`}
        />
      )}
    </div>
  );
};

export const GallerySection: React.FC = () => {
  const { gallery } = useMenuStore();
  const [activeCategory, setActiveCategory] = useState<CategoryType>('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const shouldReduceMotion = useReducedMotion();
  const touchStartXRef = useRef<number | null>(null);

  // Filter gallery items based on active category
  const filteredGallery = useMemo(() => {
    if (!gallery || gallery.length === 0) return [];
    if (activeCategory === 'All') return gallery;
    return gallery.filter(
      (item) => item.categoryTag.toUpperCase() === activeCategory.toUpperCase()
    );
  }, [gallery, activeCategory]);

  // Current item being displayed in the lightbox
  const activeLightboxItem =
    lightboxIndex !== null && filteredGallery[lightboxIndex]
      ? filteredGallery[lightboxIndex]
      : null;

  // Lock body scroll when lightbox is open
  useEffect(() => {
    if (lightboxIndex !== null) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [lightboxIndex]);

  // Keyboard navigation for Lightbox (Esc, Left Arrow, Right Arrow)
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxIndex(null);
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) =>
          prev !== null ? (prev === 0 ? filteredGallery.length - 1 : prev - 1) : null
        );
      } else if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) =>
          prev !== null ? (prev === filteredGallery.length - 1 ? 0 : prev + 1) : null
        );
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, filteredGallery.length]);

  // Touch swipe support for Lightbox
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchEndX - touchStartXRef.current;

    // Minimum swipe threshold: 50px
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swiped right -> go to previous
        setLightboxIndex((prev) =>
          prev !== null ? (prev === 0 ? filteredGallery.length - 1 : prev - 1) : null
        );
      } else {
        // Swiped left -> go to next
        setLightboxIndex((prev) =>
          prev !== null ? (prev === filteredGallery.length - 1 ? 0 : prev + 1) : null
        );
      }
    }
    touchStartXRef.current = null;
  };

  // Lightbox arrow navigation click handlers
  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIndex((prev) =>
      prev !== null ? (prev === 0 ? filteredGallery.length - 1 : prev - 1) : null
    );
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIndex((prev) =>
      prev !== null ? (prev === filteredGallery.length - 1 ? 0 : prev + 1) : null
    );
  };

  // If there are no gallery items in database at all, do not render an empty section
  if (!gallery || gallery.length === 0) return null;

  // Split items for editorial composition:
  // The first item is the Featured centerpiece; remaining items are supporting.
  const featuredItem = filteredGallery[0] || null;
  const supportingItems = filteredGallery.slice(1);

  return (
    <section
      id="gallery"
      className="py-8 sm:py-10 lg:py-12 bg-[#FDF6EE] border-t border-[#EEDDCC] relative overflow-hidden scroll-mt-16 sm:scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-5 sm:mb-6 gap-4"
        >
          <div>
            {/* Small Eyebrow */}
            <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-[#FE8E2A] mb-2 px-3 py-1 rounded-full bg-[#FE8E2A]/10 border border-[#FE8E2A]/20">
              <Camera size={13} className="text-[#FE8E2A]" />
              <span>A PEEK INSIDE TRYIT</span>
            </div>

            {/* Large Heading */}
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-[#2B1408] font-display tracking-tight">
              Vibes at Tryit Cafe
            </h2>

            {/* Supporting Copy */}
            <p className="text-xs sm:text-sm lg:text-base text-[#7A5C4A] mt-2 max-w-xl leading-relaxed">
              Good food, cozy corners, and moments worth staying for.
            </p>
          </div>

          {/* Category Filter Pills (Mobile Horizontal Scroll, Desktop Inline) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
            {CATEGORIES.map((category) => {
              const isActive = activeCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-200 whitespace-nowrap cursor-pointer select-none ${
                    isActive
                      ? 'bg-[#FE8E2A] text-white shadow-sm shadow-[#FE8E2A]/30 border border-[#FE8E2A]'
                      : 'bg-[#FFFBF7] text-[#2B1408] hover:bg-[#FBEFE1] border border-[#EEDDCC] hover:border-[#FE8E2A]/30'
                  }`}
                  aria-pressed={isActive}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Gallery Content Area with Smooth Filter Transition */}
        <AnimatePresence mode="wait">
          {filteredGallery.length === 0 ? (
            /* Clean Empty State when a category has 0 items */
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="py-16 sm:py-24 text-center rounded-3xl bg-[#FFFBF7] border border-[#EEDDCC] p-8 max-w-lg mx-auto"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#FDF6EE] text-[#FE8E2A] flex items-center justify-center mx-auto mb-3 border border-[#EEDDCC]">
                <Camera size={26} />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#2B1408] font-display">
                No moments here yet.
              </h3>
              <p className="text-xs sm:text-sm text-[#7A5C4A] mt-1 max-w-xs mx-auto">
                Check back soon or explore our other cafe categories!
              </p>
              <button
                onClick={() => setActiveCategory('All')}
                className="mt-4 px-4 py-2 rounded-xl bg-[#FE8E2A] text-white text-xs font-bold hover:bg-[#E67616] transition-colors cursor-pointer"
              >
                View All Photos
              </button>
            </motion.div>
          ) : (
            <motion.div
              key={activeCategory}
              initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="space-y-6"
            >
              {/* ==================================================== */}
              {/* DESKTOP / TABLET EDITORIAL GALLERY (Hidden on Mobile) */}
              {/* ==================================================== */}
              <div className="hidden md:block">
                {/* 1. Single Image Edge Case */}
                {filteredGallery.length === 1 && featuredItem && (
                  <div className="max-w-3xl mx-auto">
                    <EditorialCard
                      item={featuredItem}
                      index={0}
                      isFeatured={true}
                      aspectClass="aspect-[16/10]"
                      onOpen={() => setLightboxIndex(0)}
                    />
                  </div>
                )}

                {/* 2. Exactly 2 Images: Balanced 7-to-5 Composition */}
                {filteredGallery.length === 2 && featuredItem && (
                  <div className="grid grid-cols-12 gap-5 items-stretch">
                    <div className="col-span-7">
                      <EditorialCard
                        item={featuredItem}
                        index={0}
                        isFeatured={true}
                        aspectClass="h-[420px]"
                        onOpen={() => setLightboxIndex(0)}
                      />
                    </div>
                    <div className="col-span-5">
                      <EditorialCard
                        item={supportingItems[0]}
                        index={1}
                        isFeatured={false}
                        aspectClass="h-[420px]"
                        onOpen={() => setLightboxIndex(1)}
                      />
                    </div>
                  </div>
                )}

                {/* 3. Exactly 3 Images: 7-Col Featured + 2 Stacked Cards */}
                {filteredGallery.length === 3 && featuredItem && (
                  <div className="grid grid-cols-12 gap-5 items-stretch">
                    <div className="col-span-7">
                      <EditorialCard
                        item={featuredItem}
                        index={0}
                        isFeatured={true}
                        aspectClass="h-[460px]"
                        onOpen={() => setLightboxIndex(0)}
                      />
                    </div>
                    <div className="col-span-5 grid grid-rows-2 gap-5 h-[460px]">
                      <EditorialCard
                        item={supportingItems[0]}
                        index={1}
                        isFeatured={false}
                        aspectClass="h-full"
                        onOpen={() => setLightboxIndex(1)}
                      />
                      <EditorialCard
                        item={supportingItems[1]}
                        index={2}
                        isFeatured={false}
                        aspectClass="h-full"
                        onOpen={() => setLightboxIndex(2)}
                      />
                    </div>
                  </div>
                )}

                {/* 4. 4 or More Images (Editorial Hero + Supporting Grid) */}
                {filteredGallery.length >= 4 && featuredItem && (
                  <div className="space-y-5">
                    {/* Top Hero Composition: ~58% Featured Centerpiece + 2 Stacked Supporting */}
                    <div className="grid grid-cols-12 gap-5 items-stretch">
                      <div className="col-span-7">
                        <EditorialCard
                          item={featuredItem}
                          index={0}
                          isFeatured={true}
                          aspectClass="h-[480px]"
                          onOpen={() => setLightboxIndex(0)}
                        />
                      </div>
                      <div className="col-span-5 grid grid-rows-2 gap-5 h-[480px]">
                        <EditorialCard
                          item={supportingItems[0]}
                          index={1}
                          isFeatured={false}
                          aspectClass="h-full"
                          onOpen={() => setLightboxIndex(1)}
                        />
                        <EditorialCard
                          item={supportingItems[1]}
                          index={2}
                          isFeatured={false}
                          aspectClass="h-full"
                          onOpen={() => setLightboxIndex(2)}
                        />
                      </div>
                    </div>

                    {/* Secondary Row for Remaining Items (Varied Editorial Sizing) */}
                    {supportingItems.length > 2 && (
                      <div
                        className={`grid gap-5 ${
                          supportingItems.length - 2 === 1
                            ? 'grid-cols-1 max-w-xl mx-auto'
                            : supportingItems.length - 2 === 2
                            ? 'grid-cols-2'
                            : 'grid-cols-3'
                        }`}
                      >
                        {supportingItems.slice(2).map((item, idx) => (
                          <EditorialCard
                            key={item.id}
                            item={item}
                            index={idx + 3}
                            isFeatured={false}
                            aspectClass="h-60 lg:h-64"
                            onOpen={() => setLightboxIndex(idx + 3)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* ==================================================== */}
              {/* MOBILE COMPOSITION (< 768px): Dedicated Thumb Layout */}
              {/* ==================================================== */}
              <div className="block md:hidden space-y-4">
                {/* 1. Large 100% Width Featured Centerpiece */}
                {featuredItem && (
                  <motion.div
                    initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    onClick={() => setLightboxIndex(0)}
                    className="group relative rounded-2xl overflow-hidden aspect-[4/3] bg-stone-200 shadow-sm border border-[#EEDDCC] active:scale-[0.99] transition-transform cursor-pointer"
                  >
                    <SafeImage
                      src={featuredItem.mediaUrl}
                      alt={featuredItem.title || 'Tryit Cafe'}
                      priority={true}
                      className="w-full h-full object-cover"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#2B1408]/85 via-[#2B1408]/30 to-transparent p-4 flex flex-col justify-end text-white">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FE8E2A] px-2 py-0.5 rounded-full bg-[#2B1408]/70 border border-[#FE8E2A]/30">
                          {featuredItem.categoryTag}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                          <span>View</span>
                          <ArrowUpRight size={12} />
                        </span>
                      </div>
                      {featuredItem.title && (
                        <h4 className="text-sm font-bold font-display text-white mt-1.5 line-clamp-1">
                          {featuredItem.title}
                        </h4>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* 2. Horizontal Snap Carousel for Supporting Images */}
                {supportingItems.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <div className="flex items-center justify-between px-0.5">
                      <span className="text-xs font-bold text-[#2B1408]">More Moments</span>
                      <span className="text-[11px] text-[#7A5C4A]/80 font-medium">
                        Swipe to browse →
                      </span>
                    </div>

                    <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 no-scrollbar pb-2 -mx-4 px-4">
                      {supportingItems.map((item, idx) => (
                        <motion.div
                          key={item.id}
                          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.95 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true, amount: 0.2 }}
                          transition={{ duration: 0.45, delay: Math.min(idx * 0.06, 0.24), ease: 'easeOut' }}
                          onClick={() => setLightboxIndex(idx + 1)}
                          className="w-[230px] shrink-0 snap-start aspect-[4/3] rounded-2xl overflow-hidden relative shadow-sm border border-[#EEDDCC] bg-stone-200 active:scale-[0.98] transition-transform cursor-pointer"
                        >
                          <SafeImage
                            src={item.mediaUrl}
                            alt={item.title || 'Tryit Cafe photo'}
                            priority={false}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-[#2B1408]/85 via-transparent to-transparent p-3 flex flex-col justify-end text-white">
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#FE8E2A] px-1.5 py-0.5 rounded-full bg-[#2B1408]/70 border border-[#FE8E2A]/30">
                                {item.categoryTag}
                              </span>
                              <ArrowUpRight size={13} className="text-white/80" />
                            </div>
                            {item.title && (
                              <h5 className="text-xs font-bold text-white mt-1 line-clamp-1">
                                {item.title}
                              </h5>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ==================================================== */}
      {/* IMAGE LIGHTBOX FULLSCREEN MODAL */}
      {/* ==================================================== */}
      <AnimatePresence>
        {activeLightboxItem && lightboxIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={() => setLightboxIndex(null)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="fixed inset-0 z-50 bg-black/92 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 select-none"
            role="dialog"
            aria-modal="true"
            aria-label="Image gallery lightbox"
          >
            {/* Top Bar: Category, Counter & Close Button */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-5xl flex items-center justify-between z-20 pt-2"
            >
              {/* Category Pill & Filtered Count */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold uppercase tracking-widest text-[#FE8E2A] px-3 py-1 rounded-full bg-white/10 border border-white/15 backdrop-blur-md">
                  {activeLightboxItem.categoryTag}
                </span>
                <span className="text-xs font-bold text-white/80 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10">
                  {lightboxIndex + 1} / {filteredGallery.length}
                </span>
              </div>

              {/* Close Button (Thumb-Friendly 44px min target) */}
              <button
                onClick={() => setLightboxIndex(null)}
                aria-label="Close gallery"
                className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white flex items-center justify-center transition-all cursor-pointer border border-white/15"
              >
                <X size={20} />
              </button>
            </div>

            {/* Central Media Container & Nav Arrows */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl flex-1 flex items-center justify-center my-3 sm:my-4"
            >
              {/* Previous Image Button (Visible on all viewports, min 44px) */}
              {filteredGallery.length > 1 && (
                <button
                  onClick={handlePrevImage}
                  aria-label="Previous image"
                  className="absolute left-1 sm:left-4 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/40 sm:bg-white/10 hover:bg-white/25 active:scale-90 text-white flex items-center justify-center transition-all cursor-pointer border border-white/20 backdrop-blur-md"
                >
                  <ChevronLeft size={24} />
                </button>
              )}

              {/* Main Lightbox Image */}
              <motion.div
                key={activeLightboxItem.id}
                initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="max-h-[66vh] sm:max-h-[75vh] w-auto max-w-full flex items-center justify-center"
              >
                {activeLightboxItem.mediaType === 'VIDEO' ? (
                  <video
                    src={activeLightboxItem.mediaUrl}
                    controls
                    autoPlay
                    playsInline
                    className="max-h-[66vh] sm:max-h-[75vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl border border-white/10"
                  />
                ) : (
                  <img
                    src={getOptimizedImageUrl(activeLightboxItem.mediaUrl, 'galleryLightbox')}
                    alt={activeLightboxItem.title || 'Tryit Cafe photo'}
                    className="max-h-[66vh] sm:max-h-[75vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl border border-white/10"
                  />
                )}
              </motion.div>

              {/* Next Image Button (Visible on all viewports, min 44px) */}
              {filteredGallery.length > 1 && (
                <button
                  onClick={handleNextImage}
                  aria-label="Next image"
                  className="absolute right-1 sm:right-4 z-20 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-black/40 sm:bg-white/10 hover:bg-white/25 active:scale-90 text-white flex items-center justify-center transition-all cursor-pointer border border-white/20 backdrop-blur-md"
                >
                  <ChevronRight size={24} />
                </button>
              )}
            </div>

            {/* Bottom Caption & Info (Only show if present, no fake captions) */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl text-center pb-2 z-20"
            >
              {activeLightboxItem.title && (
                <h3 className="text-sm sm:text-base font-bold text-white font-display">
                  {activeLightboxItem.title}
                </h3>
              )}
              {activeLightboxItem.caption && (
                <p className="text-xs text-white/70 mt-1 max-w-lg mx-auto leading-relaxed">
                  {activeLightboxItem.caption}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

// ==========================================================
// Editorial Gallery Card Component for Desktop
// ==========================================================
interface EditorialCardProps {
  item: GalleryItem;
  index: number;
  isFeatured?: boolean;
  aspectClass?: string;
  onOpen: () => void;
}

const EditorialCard: React.FC<EditorialCardProps> = ({
  item,
  index,
  isFeatured = false,
  aspectClass = 'aspect-[4/3]',
  onOpen,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(typeof window !== 'undefined' && window.innerWidth >= 1024);
    };
    checkDesktop();
    window.addEventListener('resize', checkDesktop, { passive: true });
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth spring physics for 3D tilt
  const springConfig = { stiffness: 220, damping: 24 };
  const mouseXSpring = useSpring(x, springConfig);
  const mouseYSpring = useSpring(y, springConfig);

  // Maximum rotation: X: ±3deg, Y: ±3deg for featured, ±2deg for smaller cards
  const maxTilt = isFeatured ? 3.0 : 2.0;
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], [maxTilt, -maxTilt]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], [-maxTilt, maxTilt]);

  // Subtle image parallax: 5px (featured), 3px (smaller cards)
  const maxParallax = isFeatured ? 5 : 3;
  const imageX = useTransform(mouseXSpring, [-0.5, 0.5], [-maxParallax, maxParallax]);
  const imageY = useTransform(mouseYSpring, [-0.5, 0.5], [-maxParallax, maxParallax]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDesktop || shouldReduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    if (width === 0 || height === 0) return;

    const mouseX = (e.clientX - rect.left) / width - 0.5;
    const mouseY = (e.clientY - rect.top) / height - 0.5;
    x.set(mouseX);
    y.set(mouseY);

    setGlarePos({
      x: ((e.clientX - rect.left) / width) * 100,
      y: ((e.clientY - rect.top) / height) * 100,
    });
  };

  const handleMouseEnter = () => {
    if (isDesktop && !shouldReduceMotion) {
      setIsHovered(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  const staggerDelay = shouldReduceMotion ? 0 : Math.min(index * 0.08, 0.32);

  return (
    <motion.div
      initial={
        shouldReduceMotion
          ? { opacity: 0 }
          : { opacity: 0, scale: 0.94, y: 20 }
      }
      whileInView={{
        opacity: 1,
        scale: 1,
        y: 0,
      }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.55,
        delay: staggerDelay,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{
        perspective: isDesktop && !shouldReduceMotion ? 1200 : undefined,
      }}
      className="w-full h-full"
    >
      <motion.div
        onClick={onOpen}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          rotateX: isDesktop && !shouldReduceMotion ? rotateX : 0,
          rotateY: isDesktop && !shouldReduceMotion ? rotateY : 0,
          transformStyle: 'preserve-3d',
        }}
        className={`group relative rounded-3xl overflow-hidden ${aspectClass} bg-stone-200 border border-[#EEDDCC] shadow-sm hover:shadow-xl transition-shadow duration-300 cursor-pointer w-full select-none`}
      >
        {/* Parallax & Zoom Image Container */}
        <motion.div
          style={{
            x: isDesktop && !shouldReduceMotion ? imageX : 0,
            y: isDesktop && !shouldReduceMotion ? imageY : 0,
            scale: isDesktop && !shouldReduceMotion && isHovered ? 1.04 : 1.01,
          }}
          transition={{
            scale: { duration: 0.5, ease: 'easeOut' },
          }}
          className="w-full h-full will-change-transform"
        >
          {item.mediaType === 'VIDEO' ? (
            <video
              src={item.mediaUrl}
              muted
              playsInline
              loop
              autoPlay
              className="w-full h-full object-cover"
            />
          ) : (
            <SafeImage
              src={item.mediaUrl}
              alt={item.title || 'Tryit Cafe photo'}
              priority={isFeatured}
              className="w-full h-full object-cover"
            />
          )}
        </motion.div>

        {/* Subtle Cursor-Following Warm Radial Light (Desktop Only) */}
        {isDesktop && !shouldReduceMotion && (
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            style={{
              opacity: isHovered ? 1 : 0,
              background: `radial-gradient(circle 280px at ${glarePos.x}% ${glarePos.y}%, rgba(254, 142, 42, 0.12) 0%, rgba(255, 240, 223, 0.05) 40%, transparent 80%)`,
            }}
          />
        )}

        {/* Bottom Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#2B1408]/85 via-[#2B1408]/20 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300 p-5 sm:p-6 flex flex-col justify-end text-white pointer-events-none">
          <div className="flex items-center justify-between">
            {/* Category Pill with optional Video Play Icon */}
            <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-[#FE8E2A] px-2.5 py-1 rounded-full bg-[#2B1408]/75 backdrop-blur-sm border border-[#FE8E2A]/30 transition-transform duration-300 group-hover:-translate-y-0.5 inline-flex items-center gap-1.5">
              {item.mediaType === 'VIDEO' && <Play size={10} className="fill-[#FE8E2A]" />}
              <span>{item.categoryTag}</span>
            </span>

            {/* Interactive "View" Button Badge */}
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-white/95 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/25 opacity-90 group-hover:opacity-100 group-hover:bg-[#FE8E2A] group-hover:border-[#FE8E2A] group-hover:scale-[1.04] transition-all duration-300">
              <span>{item.mediaType === 'VIDEO' ? 'Watch' : 'View'}</span>
              <ArrowUpRight size={13} className="group-hover:translate-x-1 transition-transform duration-200" />
            </span>
          </div>

          {/* Real Title & Caption (if exists in item data) */}
          {item.title && (
            <h4
              className={`${
                isFeatured ? 'text-base sm:text-xl' : 'text-sm sm:text-base'
              } font-bold font-display text-white mt-2 transition-transform duration-300 group-hover:-translate-y-0.5 line-clamp-1`}
            >
              {item.title}
            </h4>
          )}
          {item.caption && (
            <p className="text-xs text-stone-200 mt-1 line-clamp-2 opacity-90 transition-transform duration-300 group-hover:-translate-y-0.5">
              {item.caption}
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
