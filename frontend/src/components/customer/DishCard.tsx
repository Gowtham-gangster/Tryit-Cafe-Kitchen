import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Plus, Minus, Flame, Sparkles, Check } from 'lucide-react';
import { MenuItem } from '../../types';
import { FoodTypeBadge } from '../common/FoodTypeBadge';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import { useMenuStore } from '../../store/useMenuStore';
import { useToastStore } from '../../store/useToastStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { FoodImage } from '../common/FoodImage';

interface DishCardProps {
  item?: MenuItem;
  dish?: MenuItem;
  hoverEffect?: 'default' | 'zoomOnly';
}

export const DishCard: React.FC<DishCardProps> = ({
  item,
  dish,
  hoverEffect = 'default',
}) => {
  const currentDish = item || dish;
  const { isAuthenticated, openAuthModal } = useAuthStore();
  const { items, addItem, updateQuantity, setPendingAction } = useCartStore();
  const { setSelectedDishModal } = useMenuStore();
  const { success } = useToastStore();
  const { isOnlineOrderingOpen } = useSettingsStore();

  const orderingOpen = isOnlineOrderingOpen();
  const [justAdded, setJustAdded] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  if (!currentDish) return null;

  const cartItem = items.find((ci) => ci.item.id === currentDish.id);
  const quantity = cartItem?.quantity || 0;

  const effectivePrice = currentDish.effectivePrice ?? currentDish.price;
  const hasDiscount =
    currentDish.discountEnabled && effectivePrice < currentDish.price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!orderingOpen) return;

    // Authentication Guard Check
    if (!isAuthenticated) {
      setPendingAction({ item: currentDish, quantity: 1 });
      openAuthModal(
        'login',
        `Sign in to add "${currentDish.name}" to your cart.`
      );
      return;
    }

    setJustAdded(true);
    addItem(currentDish, 1);
    success(`${currentDish.name} added to cart!`);

    setTimeout(() => {
      setJustAdded(false);
    }, 700);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!orderingOpen) return;
    updateQuantity(currentDish.id, 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!orderingOpen) return;
    updateQuantity(currentDish.id, -1);
  };

  return (
    <motion.div
      whileHover={
        shouldReduceMotion
          ? undefined
          : hoverEffect === 'zoomOnly'
          ? { scale: 1.02, transition: { duration: 0.22, ease: 'easeOut' } }
          : { y: -4, scale: 1.01, transition: { duration: 0.22, ease: 'easeOut' } }
      }
      whileTap={shouldReduceMotion ? undefined : { scale: 0.99, transition: { duration: 0.12 } }}
      onClick={() => setSelectedDishModal(currentDish)}
      className="group relative bg-[#FFFBF7] rounded-2xl sm:rounded-3xl p-2.5 min-[390px]:p-3 sm:p-4 border border-[#EEDDCC] hover:border-[#FE8E2A]/50 shadow-[0_2px_12px_-3px_rgba(43,20,8,0.06)] hover:shadow-[0_10px_26px_-4px_rgba(43,20,8,0.14)] transition-all duration-300 flex flex-col justify-between cursor-pointer h-full select-none overflow-hidden"
    >
      {/* Subtle One-time Light Highlight Sweep on Card Entrance */}
      {!shouldReduceMotion && (
        <div
          className="absolute inset-0 z-[1] overflow-hidden pointer-events-none select-none rounded-2xl sm:rounded-3xl"
          aria-hidden="true"
        >
          <motion.div
            className="absolute top-0 bottom-0 w-3/5"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(254, 142, 42, 0.02) 25%, rgba(254, 142, 42, 0.07) 50%, rgba(254, 142, 42, 0.02) 75%, transparent 100%)',
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
              delay: 0.25,
            }}
          />
        </div>
      )}

      {/* Top Image & Badges */}
      <div className="flex-1 flex flex-col">
        <div className="relative aspect-[1/0.82] sm:aspect-[4/3] w-full rounded-[14px] sm:rounded-2xl overflow-hidden mb-2 min-[390px]:mb-2.5 sm:mb-3 bg-[#FDF6EE] shrink-0">
          <FoodImage
            src={currentDish.imageUrl}
            alt={currentDish.name}
            categoryName={currentDish.categoryName}
            preset="menuCard"
            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 240px"
          />

          {/* Top Overlays */}
          <div className="absolute top-1.5 left-1.5 right-1.5 min-[390px]:top-2 min-[390px]:left-2 min-[390px]:right-2 sm:top-2.5 sm:left-2.5 sm:right-2.5 flex items-center justify-between pointer-events-none z-10 gap-1">
            <div className="flex flex-wrap gap-1 items-center max-w-[80%]">
              <FoodTypeBadge type={currentDish.foodType} size="sm" variant="pill" />

              {currentDish.bestseller && (
                <span className="px-1.5 min-[390px]:px-2 py-0.5 rounded-full bg-[#FE8E2A] text-white text-[9px] min-[390px]:text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-0.5 sm:gap-1 shadow-2xs">
                  <Flame size={10} className="fill-white" />
                  <span className="hidden min-[360px]:inline">Bestseller</span>
                </span>
              )}

              {currentDish.isNew && (
                <span className="px-1.5 min-[390px]:px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] min-[390px]:text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-0.5 sm:gap-1 shadow-2xs">
                  <Sparkles size={10} className="fill-white" />
                  <span>New</span>
                </span>
              )}
            </div>

            {/* Discount Badge */}
            {hasDiscount && (
              <span className="px-1.5 min-[390px]:px-2 py-0.5 rounded-full bg-[#FE8E2A] text-white text-[9px] min-[390px]:text-[10px] font-extrabold uppercase tracking-wider shadow-2xs shrink-0">
                <span>
                  {currentDish.discountType === 'PERCENTAGE'
                    ? `${currentDish.discountValue}%`
                    : `₹${currentDish.discountValue}`}
                </span>
              </span>
            )}
          </div>

          {!currentDish.available && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 text-center">
              <span className="px-2 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider shadow-md">
                Unavailable
              </span>
            </div>
          )}
        </div>

        {/* Dish Title, Category & Description */}
        <h3 className="font-display font-bold text-[14px] min-[390px]:text-[15px] sm:text-base text-[#2B1408] line-clamp-1 group-hover:text-[#FE8E2A] transition-colors leading-tight">
          {currentDish.name}
        </h3>

        {currentDish.categoryName && (
          <span className="text-[10px] min-[390px]:text-[11px] font-bold text-[#7A5C4A]/80 uppercase tracking-wider block mt-0.5 truncate">
            {currentDish.categoryName}
          </span>
        )}

        <p className="text-[11px] min-[390px]:text-xs text-[#7A5C4A] line-clamp-2 mt-1 leading-snug min-h-[28px] min-[390px]:min-h-[32px]">
          {currentDish.description ||
            'Deliciously prepared with fresh kitchen ingredients and spices.'}
        </p>
      </div>

      {/* Pricing & Add / Quantity Stepper (No Prep Time) */}
      <div className="flex items-center justify-between pt-2 sm:pt-3 mt-2 sm:mt-3 border-t border-[#EEDDCC] gap-1 shrink-0">
        <div className="min-w-0">
          <span className="text-[9px] min-[390px]:text-[10px] text-[#7A5C4A] font-bold uppercase tracking-wider block leading-none mb-0.5">
            Price
          </span>
          {hasDiscount ? (
            <div className="flex items-baseline gap-1 flex-wrap">
              <span className="text-[15px] min-[390px]:text-base sm:text-lg font-extrabold text-[#FE8E2A] font-serif leading-tight">
                ₹{effectivePrice}
              </span>
              <span className="text-[10px] min-[390px]:text-xs text-[#A89A90] line-through font-semibold leading-tight">
                ₹{currentDish.price}
              </span>
            </div>
          ) : (
            <span className="text-[15px] min-[390px]:text-base sm:text-lg font-extrabold text-[#FE8E2A] font-serif leading-tight">
              ₹{currentDish.price}
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
            className="h-9 min-[390px]:h-10 px-2 sm:px-3 rounded-xl bg-[#FDF6EE] border border-[#EEDDCC] text-[#7A5C4A] font-extrabold text-[10px] sm:text-[11px] uppercase tracking-wider flex items-center justify-center gap-1 cursor-not-allowed select-none opacity-90 shrink-0"
          >
            <span
              className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"
              aria-hidden="true"
            />
            <span className="text-red-700">CLOSED</span>
          </button>
        ) : currentDish.available ? (
          quantity > 0 && !justAdded ? (
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="h-9 min-[390px]:h-10 flex items-center bg-[#FE8E2A] text-white rounded-xl p-0.5 sm:p-1 shadow-md shadow-[#FE8E2A]/20 shrink-0"
            >
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={handleDecrement}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#E67616] hover:bg-[#C65A08] flex items-center justify-center transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus size={13} className="stroke-[3]" />
              </motion.button>
              <span className="px-1.5 min-[390px]:px-2 text-xs font-black select-none">
                {quantity}
              </span>
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={handleIncrement}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#E67616] hover:bg-[#C65A08] flex items-center justify-center transition-colors"
                aria-label="Increase quantity"
              >
                <Plus size={13} className="stroke-[3]" />
              </motion.button>
            </motion.div>
          ) : (
            <motion.button
              whileHover={
                shouldReduceMotion
                  ? undefined
                  : { y: -1, scale: 1.01, transition: { duration: 0.15 } }
              }
              whileTap={
                shouldReduceMotion
                  ? undefined
                  : { scale: 0.95, transition: { duration: 0.12 } }
              }
              onClick={handleAddToCart}
              className={`h-9 min-[390px]:h-10 px-2.5 min-[390px]:px-3.5 sm:px-4 rounded-xl text-white font-bold text-[11px] min-[390px]:text-xs flex items-center justify-center gap-1 transition-all shadow-md shrink-0 ${
                justAdded
                  ? 'bg-emerald-600 shadow-emerald-600/30'
                  : 'bg-[#FE8E2A] hover:bg-[#E67616] shadow-[#FE8E2A]/20'
              }`}
              aria-label={`Add ${currentDish.name} to cart`}
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
                    <Check size={13} className="stroke-[3]" />
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
                    <Plus size={13} className="stroke-[2.5]" />
                    <span>ADD</span>
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          )
        ) : (
          <span className="text-[10px] min-[390px]:text-[11px] text-[#7A5C4A] font-bold uppercase tracking-wider shrink-0">
            Sold Out
          </span>
        )}
      </div>
    </motion.div>
  );
};
