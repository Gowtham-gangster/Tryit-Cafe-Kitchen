import React, { useState } from 'react';
import { UtensilsCrossed, Coffee } from 'lucide-react';
import { getOptimizedImageUrl, getOptimizedSrcSet, ImagePreset } from '../../utils/imageUrl';

interface FoodImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  categoryName?: string;
  foodType?: string;
  preset?: ImagePreset;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  decoding?: 'async' | 'sync' | 'auto';
}

export const FoodImage: React.FC<FoodImageProps> = ({
  src,
  alt,
  className = 'w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out will-change-transform',
  categoryName,
  foodType,
  preset = 'menuCard',
  sizes,
  loading = 'lazy',
  decoding = 'async',
}) => {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Consider invalid if empty or if it's explicitly set to Hero.jpg
  const isInvalidSrc =
    !src ||
    !src.trim() ||
    src.trim() === '/Hero.jpg' ||
    src.trim() === 'Hero.jpg' ||
    src.trim() === '/assets/Hero.jpg';

  if (isInvalidSrc || hasError) {
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-gradient-to-br from-[#FFFBF7] via-[#F8EFE4] to-[#EFE2D3] border border-[#EEDDCC]/60 select-none"
        role="img"
        aria-label={`${alt} (Culinary presentation)`}
      >
        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#FFFBF7] border border-[#EEDDCC] shadow-2xs flex items-center justify-center mb-1.5 text-[#B8845A]">
          {categoryName?.toLowerCase().includes('drink') ||
          categoryName?.toLowerCase().includes('shake') ||
          categoryName?.toLowerCase().includes('coffee') ? (
            <Coffee size={20} className="stroke-[1.8]" />
          ) : (
            <UtensilsCrossed size={20} className="stroke-[1.8]" />
          )}
        </div>
        <span className="text-[11px] sm:text-xs font-semibold text-[#664632] line-clamp-1 max-w-[90%] leading-tight">
          Tryit Kitchen
        </span>
        <span className="text-[9px] sm:text-[10px] text-[#9A7D69] uppercase tracking-wider font-medium mt-0.5">
          {categoryName || 'Freshly Crafted'}
        </span>
      </div>
    );
  }

  const optimizedSrc = getOptimizedImageUrl(src, preset);
  const optimizedSrcSet = getOptimizedSrcSet(src, [280, 420, 560]) || undefined;

  return (
    <div className="relative w-full h-full overflow-hidden bg-[#F8EFE4]">
      {!isLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#F8EFE4] via-[#FFFBF7] to-[#F8EFE4] animate-pulse" />
      )}
      <img
        src={optimizedSrc}
        srcSet={optimizedSrcSet}
        sizes={sizes}
        alt={alt}
        loading={loading}
        decoding={decoding}
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`${className} ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        } transition-opacity duration-300`}
      />
    </div>
  );
};
