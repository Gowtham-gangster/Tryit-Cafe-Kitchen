import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  maxStars?: number;
  interactive?: boolean;
  onRatingChange?: (newRating: number) => void;
  size?: number;
}

export const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxStars = 5,
  interactive = false,
  onRatingChange,
  size = 18,
}) => {
  return (
    <div
      className="flex items-center gap-1 select-none"
      role={interactive ? undefined : 'img'}
      aria-label={`Rated ${rating} out of ${maxStars} stars`}
    >
      {Array.from({ length: maxStars }).map((_, index) => {
        const starValue = index + 1;
        const fillPercentage = Math.max(0, Math.min(1, rating - index));

        if (interactive) {
          const isFilled = starValue <= rating;
          return (
            <button
              key={index}
              type="button"
              onClick={() => onRatingChange && onRatingChange(starValue)}
              className="cursor-pointer hover:scale-115 active:scale-95 transition-transform focus:outline-none p-0.5"
              aria-label={`Rate ${starValue} stars`}
            >
              <Star
                size={size}
                className={`${
                  isFilled
                    ? 'fill-[#FE8E2A] text-[#FE8E2A]'
                    : 'fill-[#EEDDCC] text-[#EEDDCC]'
                } transition-colors`}
              />
            </button>
          );
        }

        // Display mode with fractional fill support (e.g. 4.8 rating)
        return (
          <div
            key={index}
            className="relative flex items-center justify-center"
            style={{ width: size, height: size }}
          >
            {/* Background Empty Star */}
            <Star
              size={size}
              className="fill-[#EEDDCC] text-[#EEDDCC] transition-colors"
            />

            {/* Foreground Partially or Fully Filled Star */}
            {fillPercentage > 0 && (
              <div
                className="absolute top-0 left-0 h-full overflow-hidden pointer-events-none"
                style={{ width: `${Math.round(fillPercentage * 100)}%` }}
              >
                <Star
                  size={size}
                  className="fill-[#FE8E2A] text-[#FE8E2A] shrink-0"
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
