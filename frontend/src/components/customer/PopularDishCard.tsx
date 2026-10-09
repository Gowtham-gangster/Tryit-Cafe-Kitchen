import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Plus, Minus, Flame, Sparkles, Check } from 'lucide-react';
import { MenuItem } from '../../types';
import { FoodTypeBadge } from '../common/FoodTypeBadge';
import { FoodImage } from '../common/FoodImage';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import { useMenuStore } from '../../store/useMenuStore';
import { useSettingsStore } from '../../store/useSettingsStore';

interface PopularDishCardProps {
  item: MenuItem;
  idx: number;
  isActive?: boolean;
}

export const PopularDishCard: React.FC<PopularDishCardProps> = ({
  item,
  idx,
  isActive = false,
}) => {
  const { isAuthenticated, openAuthModal } = useAuthStore();
  const { items, addItem, updateQuantity, setPendingAction } = useCartStore();
  const { setSelectedDishModal } = useMenuStore();
  const { isOnlineOrderingOpen } = useSettingsStore();

  const orderingOpen = isOnlineOrderingOpen();
  const [justAdded, setJustAdded] = useState(false);

  const cartItem = items.find((ci) => ci.item.id === item.id);
  const quantity = cartItem?.quantity || 0;

  const effectivePrice = item.effectivePrice ?? item.price;
  const hasDiscount = item.discountEnabled && effectivePrice < item.price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!orderingOpen) return;

    if (!isAuthenticated) {
      setPendingAction({ item, quantity: 1 });
      openAuthModal('login', `Sign in to add "${item.name}" to your cart.`);
      return;
    }

    setJustAdded(true);
    addItem(item, 1);

    setTimeout(() => {
      setJustAdded(false);
    }, 700);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!orderingOpen) return;
    updateQuantity(item.id, 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!orderingOpen) return;
    updateQuantity(item.id, -1);
  };

  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      whileHover={
        shouldReduceMotion
          ? undefined
          : {
              y: -4,
              scale: 1.01,
              transition: { duration: 0.22, ease: 'easeOut' },
            }
      }
      whileTap={
        shouldReduceMotion
          ? undefined
          : {
              scale: 0.99,
              transition: { duration: 0.12 },
            }
      }
      onClick={() => setSelectedDishModal(item)}
      className="group relative bg-[#FFFBF7] rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-[#EEDDCC] hover:border-[#FE8E2A]/50 shadow-[0_2px_12px_-3px_rgba(43,20,8,0.06)] hover:shadow-[0_10px_28px_-4px_rgba(43,20,8,0.14)] transition-all duration-300 flex flex-col justify-between cursor-pointer h-full select-none overflow-hidden"
    >
      {/* Subtle One-time Light Highlight Sweep across Card */}
      {!shouldReduceMotion && (
        <div
          className="absolute inset-0 z-[1] overflow-hidden pointer-events-none select-none rounded-2xl sm:rounded-3xl"
          aria-hidden="true"
        >
          <motion.div
            className="absolute top-0 bottom-0 w-3/5"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(254, 142, 42, 0.02) 25%, rgba(254, 142, 42, 0.08) 50%, rgba(254, 142, 42, 0.02) 75%, transparent 100%)',
              transform: 'skewX(-20deg)',
            }}
            initial={{ left: '-80%', opacity: 0 }}
            whileInView={{
              left: ['-80%', '160%'],
              opacity: [0, 1, 0],
            }}
            viewport={{ once: true }}
            transition={{
              duration: 1.8,
              ease: 'easeInOut',
              delay: idx * 0.15 + 0.2,
            }}
          />
        </div>
      )}

      {/* Top Image & Badges */}
      <div>
        <div className="relative aspect-[16/10] w-full rounded-xl sm:rounded-2xl overflow-hidden mb-2.5 bg-[#FDF6EE]">
          <FoodImage
            src={item.imageUrl}
            alt={item.name}
            categoryName={item.categoryName}
            preset="menuCard"
            sizes="(max-width: 640px) 70vw, (max-width: 1024px) 40vw, 320px"
          />

          {/* Top Overlays: Badges */}
          <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none z-10 gap-1.5">
            <div className="flex flex-wrap gap-1.5 items-center">
              <FoodTypeBadge type={item.foodType} size="sm" variant="pill" />

              {item.bestseller && (
                <span className="px-2 py-0.5 rounded-full bg-[#FE8E2A] text-white text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-xs">
                  <Flame size={10} className="fill-white" />
                  <span>Bestseller</span>
                </span>
              )}

              {item.isNew && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-xs">
                  <Sparkles size={10} className="fill-white" />
                  <span>New</span>
                </span>
              )}
            </div>

            {/* Discount Badge */}
            {hasDiscount && (
              <span className="px-2 py-0.5 rounded-full bg-[#FE8E2A] text-white text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-xs shrink-0">
                <span>
                  {item.discountType === 'PERCENTAGE'
                    ? `${item.discountValue}% OFF`
                    : `₹${item.discountValue} OFF`}
                </span>
              </span>
            )}
          </div>

          {!item.available && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center">
              <span className="px-3 py-1 rounded-full bg-red-600 text-white text-xs font-black uppercase tracking-wider shadow-lg">
                Currently Unavailable
              </span>
            </div>
          )}
        </div>

        {/* Dish Title, Category & Description */}
        <h3 className="font-display font-bold text-[17px] sm:text-lg lg:text-[20px] text-[#2B1408] line-clamp-1 group-hover:text-[#FE8E2A] transition-colors">
          {item.name}
        </h3>

        {item.categoryName && (
          <span className="text-[11px] sm:text-xs font-bold text-[#7A5C4A]/80 uppercase tracking-wider block mt-0.5">
            {item.categoryName}
          </span>
        )}

        <p className="text-xs sm:text-[13px] text-[#7A5C4A] line-clamp-2 mt-1 leading-snug min-h-[32px]">
          {item.description ||
            'Deliciously prepared with fresh kitchen ingredients and spices.'}
        </p>
      </div>

      {/* Pricing & Add / Quantity Stepper - Compact Horizontal Bar (NO Prep Time) */}
      <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-[#EEDDCC]">
        <div>
          <span className="text-[10px] text-[#7A5C4A] font-bold uppercase tracking-wider block">
            Price
          </span>
          {hasDiscount ? (
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-base sm:text-lg font-extrabold text-[#FE8E2A] font-serif">
                ₹{effectivePrice}
              </span>
              <span className="text-xs text-[#A89A90] line-through font-semibold">
                ₹{item.price}
              </span>
            </div>
          ) : (
            <span className="text-base sm:text-lg font-extrabold text-[#FE8E2A] font-serif">
              ₹{item.price}
            </span>
          )}
        </div>

        {/* Cart Action Button */}
        {!orderingOpen ? (
          <button
            type="button"
            disabled
            aria-disabled="true"
            aria-label="Online ordering is currently closed"
            onClick={(e) => e.stopPropagation()}
            className="h-11 min-h-[44px] px-3 rounded-xl bg-[#FDF6EE] border border-[#EEDDCC] text-[#7A5C4A] font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1.5 cursor-not-allowed select-none transition-all opacity-90"
          >
            <span
              className="w-2 h-2 rounded-full bg-red-500 shrink-0 inline-block"
              aria-hidden="true"
            />
            <span className="text-red-700">CLOSED</span>
          </button>
        ) : item.available ? (
          quantity > 0 && !justAdded ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="h-11 min-h-[44px] flex items-center bg-[#FE8E2A] text-white rounded-xl p-1 shadow-md shadow-[#FE8E2A]/20"
            >
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={handleDecrement}
                className="w-8 h-8 rounded-lg bg-[#E67616] hover:bg-[#C65A08] flex items-center justify-center transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus size={14} className="stroke-[3]" />
              </motion.button>
              <span className="px-2.5 text-xs font-black select-none">
                {quantity}
              </span>
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={handleIncrement}
                className="w-8 h-8 rounded-lg bg-[#E67616] hover:bg-[#C65A08] flex items-center justify-center transition-colors"
                aria-label="Increase quantity"
              >
                <Plus size={14} className="stroke-[3]" />
              </motion.button>
            </motion.div>
          ) : (
            <motion.button
              whileHover={
                shouldReduceMotion
                  ? undefined
                  : {
                      y: -1,
                      scale: 1.01,
                      transition: { duration: 0.15 },
                    }
              }
              whileTap={
                shouldReduceMotion
                  ? undefined
                  : {
                      scale: 0.96,
                      transition: { duration: 0.12 },
                    }
              }
              onClick={handleAddToCart}
              className={`h-11 min-h-[44px] px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md ${
                justAdded
                  ? 'bg-emerald-600 shadow-emerald-600/30'
                  : 'bg-[#FE8E2A] hover:bg-[#E67616] shadow-[#FE8E2A]/20'
              }`}
              aria-label={`Add ${item.name} to cart`}
            >
              <AnimatePresence mode="wait">
                {justAdded ? (
                  <motion.span
                    key="added"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="flex items-center gap-1"
                  >
                    <Check size={14} className="stroke-[3]" />
                    <span>ADDED</span>
                  </motion.span>
                ) : (
                  <motion.span
                    key="add"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="flex items-center gap-1"
                  >
                    <Plus size={14} className="stroke-[2.5]" />
                    <span>ADD</span>
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          )
        ) : (
          <span className="text-[11px] text-[#7A5C4A] font-bold uppercase tracking-wider">
            Sold Out
          </span>
        )}
      </div>
    </motion.div>
  );
};
