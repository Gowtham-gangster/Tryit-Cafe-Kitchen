import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Trash2, UtensilsCrossed } from 'lucide-react';
import { FoodType, MenuItem } from '../../types';
import { FoodTypeBadge } from '../common/FoodTypeBadge';
import { getOptimizedImageUrl } from '../../utils/imageUrl';

export interface OrderItemRowProps {
  item: MenuItem;
  quantity: number;
  variant?: 'cart' | 'checkout' | 'review' | 'compact';
  onIncrement?: () => void;
  onDecrement?: () => void;
  onRemove?: () => void;
  isOrderingOpen?: boolean;
  className?: string;
}

interface FoodThumbnailProps {
  src?: string;
  name: string;
  sizeClass: string;
  roundedClass?: string;
}

/**
 * Branded food thumbnail with zero-layout-shift and clean branded SVG placeholder fallback
 */
export const FoodThumbnail: React.FC<FoodThumbnailProps> = ({
  src,
  name,
  sizeClass,
  roundedClass = 'rounded-xl',
}) => {
  const [hasError, setHasError] = useState(false);

  const cleanSrc =
    src &&
    src.trim().length > 0 &&
    src.trim() !== '/Hero.jpg' &&
    src.trim() !== 'Hero.jpg' &&
    src.trim() !== '/assets/Hero.jpg'
      ? src.trim()
      : null;

  return (
    <div
      className={`${sizeClass} ${roundedClass} bg-[#FDF6EE] border border-[#EEDDCC]/80 shrink-0 overflow-hidden relative flex items-center justify-center select-none shadow-2xs`}
      style={{ aspectRatio: '1 / 1' }}
      title={name}
    >
      {cleanSrc && !hasError ? (
        <img
          src={getOptimizedImageUrl(cleanSrc, 'avatar')}
          alt={name}
          loading="lazy"
          decoding="async"
          onError={() => setHasError(true)}
          className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div
          className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#FDF6EE] to-[#F7E7D5] text-[#C49B7A]"
          aria-label={`${name} (No photo available)`}
        >
          <UtensilsCrossed size={18} className="opacity-70 text-[#C49B7A]" />
          <span className="text-[8px] font-bold text-[#A88264] mt-0.5 tracking-tight uppercase">
            TryIt
          </span>
        </div>
      )}
    </div>
  );
};

const OrderItemRowComponent: React.FC<OrderItemRowProps> = ({
  item,
  quantity,
  variant = 'review',
  onIncrement,
  onDecrement,
  onRemove,
  isOrderingOpen = true,
  className = '',
}) => {
  const itemPrice = item.price;
  const hasDiscount =
    item.discountEnabled && (item.effectivePrice ?? itemPrice) < itemPrice;
  const unitPrice = hasDiscount ? (item.effectivePrice ?? itemPrice) : itemPrice;
  const lineTotal = unitPrice * quantity;

  // =========================================================================
  // 1. CART DRAWER VARIANT (Mobile-first clear Unit Price & Line Total hierarchy)
  // =========================================================================
  if (variant === 'cart') {
    return (
      <div
        className={`p-2.5 sm:p-3 rounded-2xl bg-white border border-[#EEDDCC] shadow-xs hover:border-[#FE8E2A]/35 transition-all flex flex-col gap-2 ${className}`}
      >
        {/* Top Header: Image + Badge + Title + Unit Price + Top-Right Delete */}
        <div className="flex items-start gap-2.5 sm:gap-3">
          <FoodThumbnail
            src={item.imageUrl}
            name={item.name}
            sizeClass="w-16 h-16 sm:w-[68px] sm:h-[68px]"
            roundedClass="rounded-xl"
          />

          <div className="flex-1 min-w-0 pt-0.5">
            {/* Top row: Category Badge & Top-Right Delete Button */}
            <div className="flex items-center justify-between gap-1 mb-1">
              <FoodTypeBadge type={item.foodType} size="sm" />

              {onRemove && (
                <button
                  type="button"
                  onClick={onRemove}
                  aria-label={`Remove ${item.name} from cart`}
                  className="w-8 h-8 -mr-1 -mt-1 rounded-lg text-[#A89A90] hover:text-rose-600 hover:bg-rose-50 active:bg-rose-100 active:text-rose-700 flex items-center justify-center transition-all cursor-pointer shrink-0"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>

            {/* Item Name (Primary Text Hierarchy: 15-16px, Bold) */}
            <h4 className="text-[15px] sm:text-base font-bold text-[#2B1408] leading-tight line-clamp-2">
              {item.name}
            </h4>

            {/* Explicit Unit Price: "₹180 each" (Muted, 12-13px) */}
            <div className="mt-1 flex items-center gap-1.5 flex-wrap">
              {hasDiscount ? (
                <>
                  <span className="text-xs font-bold text-[#FE8E2A]">
                    ₹{unitPrice} each
                  </span>
                  <span className="text-[10px] text-[#A89A90] line-through">
                    ₹{itemPrice}
                  </span>
                </>
              ) : (
                <span className="text-xs font-medium text-[#7A5C4A]">
                  ₹{unitPrice} each
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Controls Bar: Stepper (Left) + Line Total (Right) */}
        <div className="pt-2 border-t border-[#EEDDCC]/50 flex items-center justify-between gap-3">
          {/* Quantity Stepper (Compact 36-40px height) */}
          <div className="flex items-center bg-[#FDF6EE] border border-[#EEDDCC] rounded-xl h-9 sm:h-10 px-0.5 shadow-2xs">
            <button
              type="button"
              onClick={onDecrement}
              disabled={!isOrderingOpen}
              aria-label={`Decrease quantity of ${item.name}`}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#7A5C4A] hover:text-[#2B1408] hover:bg-white active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Minus size={13} />
            </button>
            <motion.span
              key={quantity}
              initial={{ opacity: 0.6, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.15 }}
              className="w-7 sm:w-8 text-center font-bold text-xs sm:text-sm text-[#2B1408] select-none"
              aria-live="polite"
            >
              {quantity}
            </motion.span>
            <button
              type="button"
              onClick={onIncrement}
              disabled={!isOrderingOpen}
              aria-label={`Increase quantity of ${item.name}`}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#FE8E2A] hover:text-white hover:bg-[#FE8E2A] active:scale-95 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus size={13} />
            </button>
          </div>

          {/* Line Total (Right side, bold and prominent) */}
          <div className="text-right">
            <motion.span
              key={lineTotal}
              initial={{ opacity: 0.6, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="font-serif font-bold text-[17px] sm:text-[19px] text-[#2B1408] tracking-tight leading-none inline-block"
            >
              ₹{lineTotal.toFixed(0)}
            </motion.span>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // 2. CHECKOUT & REVIEW VARIANT (Compact thumbnail with price line)
  // =========================================================================
  return (
    <div
      className={`p-2.5 sm:p-3 rounded-2xl bg-white border border-[#EEDDCC] shadow-2xs hover:border-[#FE8E2A]/30 transition-all flex items-center justify-between gap-3 ${className}`}
    >
      {/* Left: Thumbnail & Details */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <FoodThumbnail
          src={item.imageUrl}
          name={item.name}
          sizeClass="w-14 h-14 sm:w-16 sm:h-16"
          roundedClass="rounded-xl"
        />

        <div className="min-w-0 flex-1">
          <h4 className="text-xs sm:text-sm font-extrabold text-[#2B1408] leading-snug line-clamp-2">
            {item.name}
          </h4>

          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            <FoodTypeBadge type={item.foodType} size="sm" />
            <span className="text-[11px] font-semibold text-[#7A5C4A]">
              • ₹{unitPrice} × {quantity}
            </span>
          </div>
        </div>
      </div>

      {/* Right: Line Total */}
      <div className="text-right shrink-0 pl-1">
        <span className="font-bold text-sm sm:text-base text-[#2B1408] font-serif">
          ₹{lineTotal.toFixed(0)}
        </span>
      </div>
    </div>
  );
};

export const OrderItemRow = React.memo<OrderItemRowProps>(
  OrderItemRowComponent,
  (prev, next) =>
    prev.item.id === next.item.id &&
    prev.item.price === next.item.price &&
    prev.item.effectivePrice === next.item.effectivePrice &&
    prev.quantity === next.quantity &&
    prev.variant === next.variant &&
    prev.isOrderingOpen === next.isOrderingOpen
);
