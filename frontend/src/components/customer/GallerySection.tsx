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

  // Filter gallery items based on active category & prioritize actual photography over logos
  const filteredGallery = useMemo(() => {
    if (!gallery || gallery.length === 0) return [];
    const list =
      activeCategory === 'All'
        ? [...gallery]
        : gallery.filter(
            (item) => item.categoryTag.toUpperCase() === activeCategory.toUpperCase()
          );

    // Prioritize actual photography over cafe logo/branding cards:
    // If an item contains 'logo' in its URL or title, sort it after genuine cafe photos
    return list.sort((a, b) => {
      const isLogoA =
        a.mediaUrl?.toLowerCase().includes('logo') ||
        a.title?.toLowerCase().includes('logo');
      const isLogoB =
        b.mediaUrl?.toLowerCase().includes('logo') ||
        b.title?.toLowerCase().includes('logo');
      if (isLogoA && !isLogoB) return 1;
      if (!isLogoA && isLogoB) return -1;
      return (a.displayOrder ?? 999) - (b.displayOrder ?? 999);
    });
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

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        setLightboxIndex((prev) =>
          prev !== null ? (prev === 0 ? filteredGallery.length - 1 : prev - 1) : null
        );
      } else {
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

  if (!gallery || gallery.length === 0) return null;

  return (
    <section
      id="gallery"
      className="py-8 sm:py-10 lg:py-12 bg-[#FDF6EE] border-t border-[#EEDDCC] relative overflow-hidden scroll-mt-16 sm:scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <motion.div
          initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-8 gap-4"
        >
          <div>
            {/* Small Eyebrow */}
            <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#FE8E2A] mb-2 px-3 py-1 rounded-full bg-[#FE8E2A]/10 border border-[#FE8E2A]/20">
              <Camera size={13} className="text-[#FE8E2A]" />
              <span>A PEEK INSIDE TRYIT</span>
            </div>

            {/* Heading */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#2B1408] font-serif tracking-tight leading-tight">
              Vibes at Tryit Cafe
            </h2>

            {/* Supporting Copy */}
            <p className="text-xs sm:text-sm lg:text-base text-[#7A5C4A] mt-1.5 max-w-xl leading-relaxed">
              Good food, cozy corners, and moments worth staying for.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
            {CATEGORIES.map((category) => {
              const isActive = activeCategory === category;
              return (
                <motion.button
                  key={category}
                  whileHover={shouldReduceMotion ? undefined : { y: -1, scale: 1.02 }}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
                  onClick={() => setActiveCategory(category)}
                  className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 whitespace-nowrap cursor-pointer select-none ${
                    isActive
                      ? 'bg-[#FE8E2A] text-white shadow-2xs'
                      : 'bg-[#FFFBF7] text-[#2B1408] hover:bg-[#FBEFE1] border border-[#EEDDCC] hover:border-[#FE8E2A]/30'
                  }`}
                  aria-pressed={isActive}
                >
                  {category}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Gallery Content Area */}
        <AnimatePresence mode="wait">
          {filteredGallery.length === 0 ? (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.3 }}
              className="py-14 sm:py-20 text-center rounded-3xl bg-[#FFFBF7] border border-[#EEDDCC] p-8 max-w-lg mx-auto"
            >
              <div className="w-12 h-12 rounded-2xl bg-[#FDF6EE] text-[#FE8E2A] flex items-center justify-center mx-auto mb-3 border border-[#EEDDCC]">
                <Camera size={24} />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#2B1408] font-serif">
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
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5"
            >
              {filteredGallery.map((item, idx) => (
                <EditorialCard
                  key={item.id}
                  item={item}
                  index={idx}
                  onOpen={() => setLightboxIndex(idx)}
                />
              ))}
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
// Editorial Gallery Card Component
// ==========================================================
interface EditorialCardProps {
  item: GalleryItem;
  index: number;
  onOpen: () => void;
}

const EditorialCard: React.FC<EditorialCardProps> = ({
  item,
  index,
  onOpen,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const staggerDelay = shouldReduceMotion ? 0 : Math.min(index * 0.05, 0.25);

  return (
    <motion.div
      initial={
        shouldReduceMotion
          ? { opacity: 1 }
          : { opacity: 0, scale: 0.96, y: 18 }
      }
      whileInView={{
        opacity: 1,
        scale: 1,
        y: 0,
      }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{
        duration: 0.5,
        delay: staggerDelay,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={
        shouldReduceMotion
          ? undefined
          : {
              y: -4,
              transition: { duration: 0.22, ease: 'easeOut' },
            }
      }
      className="w-full h-full"
    >
      <div
        onClick={onOpen}
        className="group relative rounded-2xl sm:rounded-3xl overflow-hidden aspect-[4/3] bg-[#FDF6EE] border border-[#EEDDCC] hover:border-[#FE8E2A]/50 shadow-[0_2px_12px_-3px_rgba(43,20,8,0.06)] hover:shadow-[0_10px_28px_-4px_rgba(43,20,8,0.14)] transition-all duration-300 cursor-pointer w-full select-none"
      >
        <div className="w-full h-full overflow-hidden">
          {item.mediaType === 'VIDEO' ? (
            <video
              src={item.mediaUrl}
              muted
              playsInline
              loop
              autoPlay
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out will-change-transform"
            />
          ) : (
            <SafeImage
              src={item.mediaUrl}
              alt={item.title || 'Tryit Cafe moment'}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out will-change-transform"
            />
          )}
        </div>

        {/* Restrained Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#2B1408]/85 via-[#2B1408]/20 to-transparent opacity-85 group-hover:opacity-95 transition-opacity duration-300 p-4 sm:p-5 flex flex-col justify-end text-white pointer-events-none">
          <div className="flex items-center justify-between">
            {/* Category Pill with optional Video Play Icon */}
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#FE8E2A] px-2.5 py-0.5 rounded-full bg-[#2B1408]/80 backdrop-blur-xs border border-[#FE8E2A]/30 inline-flex items-center gap-1.5 transition-transform duration-200 group-hover:-translate-y-0.5">
              {item.mediaType === 'VIDEO' && <Play size={10} className="fill-[#FE8E2A]" />}
              <span>{item.categoryTag}</span>
            </span>

            {/* Interactive "View" Button Badge with Scale & Arrow Float */}
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-white bg-white/20 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/25 group-hover:bg-[#FE8E2A] group-hover:border-[#FE8E2A] group-hover:scale-[1.04] transition-all duration-200">
              <span>{item.mediaType === 'VIDEO' ? 'Watch' : 'View'}</span>
              <ArrowUpRight size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
            </span>
          </div>

          {/* Real Title & Caption with subtle translate */}
          {item.title && (
            <h4 className="text-sm sm:text-base font-bold font-serif text-white mt-2 line-clamp-1 group-hover:-translate-y-0.5 transition-transform duration-200">
              {item.title}
            </h4>
          )}
          {item.caption && (
            <p className="text-xs text-stone-200/90 mt-0.5 line-clamp-2 group-hover:-translate-y-0.5 transition-transform duration-200">
              {item.caption}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};
