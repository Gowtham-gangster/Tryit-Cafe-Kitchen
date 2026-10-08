import React from 'react';
import { FoodType } from '../../types';

interface FoodTypeBadgeProps {
  type: FoodType;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'pill' | 'square';
  className?: string;
}

export const FoodTypeBadge: React.FC<FoodTypeBadgeProps> = ({
  type,
  showLabel = true,
  size = 'sm',
  variant = 'pill',
  className = '',
}) => {
  const ariaLabel =
    type === 'VEG'
      ? 'Vegetarian'
      : type === 'NON_VEG'
      ? 'Non-vegetarian'
      : 'Contains egg';

  const label =
    type === 'VEG'
      ? 'Veg'
      : type === 'NON_VEG'
      ? 'Non-Veg'
      : 'Egg';

  if (variant === 'pill') {
    const pillStyles = {
      VEG: 'bg-emerald-50 text-emerald-800 border-emerald-200/90',
      NON_VEG: 'bg-red-50 text-red-800 border-red-200/90',
      EGG: 'bg-amber-50 text-amber-800 border-amber-200/90',
    }[type];

    const dotStyles = {
      VEG: 'bg-emerald-600',
      NON_VEG: 'bg-red-600',
      EGG: 'bg-amber-600',
    }[type];

    const sizeClasses = {
      sm: 'px-2 py-0.5 text-[10px]',
      md: 'px-2.5 py-0.5 text-xs',
      lg: 'px-3 py-1 text-xs',
    }[size];

    return (
      <span
        role="status"
        aria-label={ariaLabel}
        className={`inline-flex items-center gap-1.5 rounded-full border font-bold shadow-xs select-none backdrop-blur-xs ${pillStyles} ${sizeClasses} ${className}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${dotStyles}`} aria-hidden="true" />
        <span>{label}</span>
      </span>
    );
  }

  // Fallback square icon variant for compact list items
  const sizeMap = {
    sm: 'w-3.5 h-3.5 p-0.5',
    md: 'w-4 h-4 p-0.5',
    lg: 'w-5 h-5 p-1',
  };

  const dotSizeMap = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5',
  };

  const getBorderColor = () => {
    switch (type) {
      case 'VEG':
        return 'border-emerald-600';
      case 'NON_VEG':
        return 'border-red-600';
      case 'EGG':
        return 'border-amber-600';
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'VEG':
        return 'bg-emerald-600';
      case 'NON_VEG':
        return 'bg-red-600';
      case 'EGG':
        return 'bg-amber-600';
    }
  };

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`} aria-label={ariaLabel}>
      <div
        className={`border-[1.5px] rounded-[3px] flex items-center justify-center bg-white ${getBorderColor()} ${sizeMap[size]}`}
        title={ariaLabel}
      >
        {type === 'NON_VEG' ? (
          <div className="w-0 h-0 border-l-[3.5px] border-l-transparent border-r-[3.5px] border-r-transparent border-b-[6px] border-b-red-600" />
        ) : (
          <div className={`rounded-full ${getBgColor()} ${dotSizeMap[size]}`} />
        )}
      </div>
      {showLabel && (
        <span
          className={`text-xs font-semibold uppercase tracking-wider ${
            type === 'VEG'
              ? 'text-emerald-700'
              : type === 'NON_VEG'
              ? 'text-red-700'
              : 'text-amber-700'
          }`}
        >
          {label}
        </span>
      )}
    </div>
  );
};
