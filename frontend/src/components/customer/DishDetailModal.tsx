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

              {selectedDishModal.isNew && (
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

        {/* Quantity and Actions */}
        <div className="pt-6 border-t border-[#EEDDCC] flex items-center justify-between gap-4">
          <div className="flex items-center bg-[#FDF6EE] rounded-2xl p-1 border border-[#EEDDCC]">
            <button
              disabled={!orderingOpen}
              onClick={() => setLocalQty(Math.max(1, localQty - 1))}
              className="w-10 h-10 rounded-xl bg-white text-[#2B1408] flex items-center justify-center shadow-xs hover:bg-[#FBEFE1] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Minus size={16} />
            </button>
            <span className="w-12 text-center text-sm font-bold text-[#2B1408]">
              {localQty}
            </span>
            <button
              disabled={!orderingOpen}
              onClick={() => setLocalQty(localQty + 1)}
              className="w-10 h-10 rounded-xl bg-white text-[#2B1408] flex items-center justify-center shadow-xs hover:bg-[#FBEFE1] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={16} />
            </button>
          </div>

          {!orderingOpen ? (
            <button
              type="button"
              disabled
              aria-disabled="true"
              className="flex-1 py-3.5 px-6 rounded-2xl bg-[#EEDDCC] text-[#7A5C4A] font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-not-allowed select-none"
            >
              <span className="w-2 h-2 rounded-full bg-red-500 shrink-0 inline-block" />
              <span>Online Ordering Closed</span>
            </button>
          ) : (
            <button
              onClick={handleAddToCart}
              className="flex-1 py-3.5 px-6 rounded-2xl bg-[#FE8E2A] hover:bg-[#E67616] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#FE8E2A]/20 transition-all active:scale-95 cursor-pointer"
            >
              <ShoppingBag size={18} />
              <span>Add to Cart • ₹{effectivePrice * localQty}</span>
            </button>
          )}
        </div>
      </div>
    </Modal>
  );
};
