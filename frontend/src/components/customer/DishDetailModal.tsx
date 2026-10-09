import React, { useState } from 'react';
import { Plus, Minus, Flame, Sparkles, ShoppingBag } from 'lucide-react';
import { Modal } from '../common/Modal';
import { FoodTypeBadge } from '../common/FoodTypeBadge';
import { useMenuStore } from '../../store/useMenuStore';
import { useCartStore } from '../../store/useCartStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { FoodImage } from '../common/FoodImage';

export const DishDetailModal: React.FC = () => {
  const { selectedDishModal, setSelectedDishModal, openAuthModal } = useMenuStore();
  const { items, addItem, updateQuantity, setPendingAction } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const { isOnlineOrderingOpen } = useSettingsStore();

  const orderingOpen = isOnlineOrderingOpen();

  const [localQty, setLocalQty] = useState(1);

  if (!selectedDishModal) return null;

  const effectivePrice = selectedDishModal.effectivePrice ?? selectedDishModal.price;
  const hasDiscount =
    selectedDishModal.discountEnabled && effectivePrice < selectedDishModal.price;

  const cartItem = items.find((ci) => ci.item.id === selectedDishModal.id);
  const currentCartQty = cartItem?.quantity || 0;

  const handleAddToCart = () => {
    if (!orderingOpen) return;
    if (!isAuthenticated) {
      setPendingAction({ item: selectedDishModal, quantity: localQty });
      setSelectedDishModal(null);
      openAuthModal(
        'login',
        `Please sign in or register to add ${selectedDishModal.name} to your order.`
      );
      return;
    }

    addItem(selectedDishModal, localQty);
    setSelectedDishModal(null);
  };

  return (
    <Modal
      isOpen={!!selectedDishModal}
      onClose={() => setSelectedDishModal(null)}
      maxWidth="lg"
      showCloseButton={true}
    >
      <div className="-mt-6 -mx-6 mb-6">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-stone-100">
          <FoodImage
            src={selectedDishModal.imageUrl}
            alt={selectedDishModal.name}
            categoryName={selectedDishModal.categoryName}
            preset="menuDetail"
          />

          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <FoodTypeBadge type={selectedDishModal.foodType} size="md" variant="pill" />

              {selectedDishModal.bestseller && (
                <span className="px-3 py-1 rounded-full bg-amber-500 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                  <Flame size={13} className="fill-white" />
                  <span>Bestseller</span>
                </span>
              )}

              {(selectedDishModal.isNew || (selectedDishModal as any).new || (selectedDishModal as any).is_new) && (
                <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                  <Sparkles size={13} className="fill-white" />
                  <span>New</span>
                </span>
              )}
            </div>

            {hasDiscount && (
              <span className="px-3 py-1 rounded-full bg-[#FE8E2A] text-white text-xs font-extrabold uppercase tracking-wider shadow-md">
                {selectedDishModal.discountType === 'PERCENTAGE'
                  ? `${selectedDishModal.discountValue}% OFF`
                  : `₹${selectedDishModal.discountValue} OFF`}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-xl sm:text-2xl font-bold text-[#2B1408] font-display">
              {selectedDishModal.name}
            </h2>
            <div className="text-right">
              {hasDiscount ? (
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-black text-[#FE8E2A] font-display">
                    ₹{effectivePrice}
                  </span>
                  <span className="text-sm font-bold text-[#A89A90] line-through">
                    ₹{selectedDishModal.price}
                  </span>
                </div>
              ) : (
                <span className="text-2xl font-black text-[#FE8E2A] font-display">
                  ₹{selectedDishModal.price}
                </span>
              )}
            </div>
          </div>

          <div className="mt-2 flex items-center gap-2 flex-wrap">
            {selectedDishModal.categoryName && (
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-[#FBEFE1] text-[#2B1408] border border-[#EEDDCC] text-xs font-semibold">
                {selectedDishModal.categoryName}
              </span>
            )}
          </div>
        </div>

        <p className="text-sm text-[#7A5C4A] leading-relaxed pt-2 border-t border-[#EEDDCC]">
          {selectedDishModal.description ||
            'Prepared with fresh locally sourced ingredients and spices, designed to offer an authentic gourmet flavor experience.'}
        </p>

        {/* Quantity and Actions: Cohesive, compact, and non-wrapping on all screen sizes */}
        <div className="pt-4 sm:pt-5 border-t border-[#EEDDCC] flex items-center justify-between gap-2.5 sm:gap-3.5">
          {/* Integrated Quantity Stepper */}
          <div className="flex items-center rounded-xl bg-[#FFF0DF] border border-[#FE8E2A]/35 h-11 sm:h-12 shrink-0 overflow-hidden shadow-2xs">
            <button
              type="button"
              disabled={!orderingOpen}
              onClick={() => setLocalQty(Math.max(1, localQty - 1))}
              className="w-9 sm:w-10 h-full flex items-center justify-center text-[#FE8E2A] hover:bg-[#FFE4CB] active:bg-[#FED1A5] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Decrease quantity"
            >
              <Minus size={15} className="stroke-[2.5]" />
            </button>
            <span className="px-2 min-w-[30px] sm:min-w-[34px] text-center text-sm sm:text-base font-extrabold text-[#2B1408] select-none tabular-nums">
              {localQty}
            </span>
            <button
              type="button"
              disabled={!orderingOpen}
              onClick={() => setLocalQty(localQty + 1)}
              className="w-9 sm:w-10 h-full flex items-center justify-center text-[#FE8E2A] hover:bg-[#FFE4CB] active:bg-[#FED1A5] transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Increase quantity"
            >
              <Plus size={15} className="stroke-[2.5]" />
            </button>
          </div>

          {/* Add To Cart or Closed Status Button */}
          {!orderingOpen ? (
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="flex-1 h-11 sm:h-12 px-3 rounded-xl bg-[#EEDDCC] text-[#7A5C4A] font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed select-none"
            >
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 inline-block" />
              <span className="truncate">Ordering Paused</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex-1 h-11 sm:h-12 px-3 sm:px-4.5 rounded-xl bg-[#FE8E2A] hover:bg-[#E67616] active:scale-[0.98] text-white font-bold text-xs sm:text-sm flex items-center justify-between gap-2 shadow-md shadow-[#FE8E2A]/25 transition-all cursor-pointer overflow-hidden group select-none min-w-0"
              aria-label={`Add to cart for ₹${effectivePrice * localQty}`}
            >
              <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                  <ShoppingBag size={13} className="text-white" />
                </div>
                <span className="whitespace-nowrap font-extrabold tracking-wide truncate">Add to Cart</span>
              </div>
              <span className="text-xs sm:text-sm font-black bg-black/15 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg tabular-nums shrink-0 whitespace-nowrap">
                ₹{effectivePrice * localQty}
              </span>
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
