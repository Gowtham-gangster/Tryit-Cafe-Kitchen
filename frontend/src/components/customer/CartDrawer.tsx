import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  Edit3,
  UtensilsCrossed,
  ArrowRight,
} from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useAuthStore } from '../../store/useAuthStore';
import { FoodTypeBadge } from '../common/FoodTypeBadge';
import { modalBackdrop, bottomSheetVariants } from '../../utils/animations';
import { OrderItemRow } from '../cart/OrderItemRow';

export const CartDrawer: React.FC = () => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const {
    items,
    instructions,
    cravingText,
    isCartOpen,
    setIsCartOpen,
    setIsCheckoutOpen,
    setPendingCheckout,
    updateQuantity,
    removeItem,
    clearCart,
    setInstructions,
    getTotalCount,
    getSubtotal,
  } = useCartStore();

  const { settings, isOnlineOrderingOpen, getClosureMessage, getNextOpeningTime } =
    useSettingsStore();
  const { user, isAuthenticated, openAuthModal } = useAuthStore();
  const shouldReduceMotion = useReducedMotion();

  const orderingOpen = isOnlineOrderingOpen();
  const closureMessage = getClosureMessage();
  const nextOpeningTime = getNextOpeningTime();

  const totalCount = getTotalCount();
  const subtotal = getSubtotal();

  const handleOpenConfirmation = () => {
    if (!orderingOpen) return;
    if (items.length === 0) return;
    if (!isAuthenticated || !user || user.role === 'ROLE_OWNER') {
      setPendingCheckout(true);
      openAuthModal('login', 'Sign in to continue with your order');
      return;
    }
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleExploreMenu = () => {
    setIsCartOpen(false);
    const menuEl = document.getElementById('menu');
    if (menuEl) {
      menuEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Slide-up Bottom Sheet / Slide-over Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end">
            {/* Backdrop */}
            <motion.div
              variants={modalBackdrop}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => {
                setShowClearConfirm(false);
                setIsCartOpen(false);
              }}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Drawer Container */}
            <motion.div
              variants={bottomSheetVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              role="dialog"
              aria-modal="true"
              aria-label="Shopping Cart"
              className="relative w-full sm:max-w-md h-[90vh] sm:h-full sm:max-h-[88vh] bg-[#FFFBF7] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col z-10 overflow-hidden sm:mr-6 border border-[#EEDDCC]"
            >
              {/* Native App Pull Handle (Mobile) */}
              <div className="w-12 h-1.5 rounded-full bg-[#EEDDCC] mx-auto my-2.5 sm:hidden shrink-0" />

              {/* ====================================================== */}
              {/* 1. COMPACT HEADER                                      */}
              {/* ====================================================== */}
              <div className="px-5 sm:px-6 py-4 border-b border-[#EEDDCC] bg-[#FDF6EE] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#FBEFE1] border border-[#EEDDCC] text-[#FE8E2A] flex items-center justify-center shrink-0">
                    <ShoppingBag size={18} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-serif font-extrabold text-base sm:text-lg text-[#2B1408] leading-tight truncate">
                      Your Order Cart
                    </h3>
                    <span className="text-[11px] text-[#7A5C4A] font-semibold block">
                      {totalCount} {totalCount === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {items.length > 0 && (
                    showClearConfirm ? (
                      <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200 px-2 py-1 rounded-xl animate-in fade-in duration-150">
                        <button
                          type="button"
                          onClick={() => {
                            clearCart();
                            setShowClearConfirm(false);
                          }}
                          className="text-[11px] font-bold text-white bg-rose-500 hover:bg-rose-600 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                          aria-label="Confirm clear cart"
                        >
                          Clear
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowClearConfirm(false)}
                          className="text-[11px] font-semibold text-[#7A5C4A] hover:text-[#2B1408] px-1.5 py-1 rounded-lg transition-colors cursor-pointer"
                          aria-label="Cancel clear cart"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setShowClearConfirm(true)}
                        className="text-xs font-semibold text-[#7A5C4A] hover:text-rose-600 hover:bg-rose-50/70 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer min-h-[36px] flex items-center"
                        aria-label="Clear all items from cart"
                      >
                        Clear
                      </button>
                    )
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setShowClearConfirm(false);
                      setIsCartOpen(false);
                    }}
                    className="w-9 h-9 rounded-full text-[#7A5C4A] hover:text-[#2B1408] hover:bg-[#F2E5D6] flex items-center justify-center transition-colors cursor-pointer"
                    aria-label="Close cart"
                  >
                    <X size={19} />
                  </button>
                </div>
              </div>

              {/* ====================================================== */}
              {/* 2. SCROLLABLE CART ITEMS AREA                          */}
              {/* ====================================================== */}
              <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 pb-6 space-y-3.5">
                {/* Ordering Closed Alert Notice Banner */}
                {!orderingOpen && (
                  <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 space-y-1">
                    <div className="flex items-center gap-2 font-bold text-xs text-rose-900">
                      <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" aria-hidden="true" />
                      <span>Online ordering is currently closed</span>
                    </div>
                    <p className="text-xs text-rose-800 leading-relaxed font-medium">
                      You can review your saved cart items, but checkout is paused until ordering reopens.
                    </p>
                    {closureMessage && (
                      <p className="text-[11px] text-rose-700 italic">
                        "{closureMessage}"
                      </p>
                    )}
                    {nextOpeningTime && (
                      <p className="text-[11px] font-bold text-rose-900 pt-0.5">
                        Opens at {nextOpeningTime}
                      </p>
                    )}
                  </div>
                )}

                {/* EMPTY CART STATE */}
                {items.length === 0 ? (
                  <div className="text-center py-12 px-4 flex flex-col items-center justify-center my-auto">
                    <div className="w-16 h-16 rounded-3xl bg-[#FBEFE1] border border-[#EEDDCC] text-[#FE8E2A] flex items-center justify-center mx-auto mb-3.5 shadow-xs">
                      <ShoppingBag size={28} />
                    </div>
                    <h4 className="font-serif font-extrabold text-lg text-[#2B1408] mb-1">
                      Your cart is empty
                    </h4>
                    <p className="text-xs sm:text-sm text-[#7A5C4A] max-w-xs mx-auto mb-6 leading-relaxed">
                      Add something delicious from our menu to begin your order.
                    </p>
                    <button
                      type="button"
                      onClick={handleExploreMenu}
                      className="px-5 py-2.5 rounded-xl bg-[#FE8E2A] hover:bg-[#E67616] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md shadow-[#FE8E2A]/20 transition-all cursor-pointer min-h-[44px] active:scale-95"
                    >
                      <UtensilsCrossed size={15} />
                      <span>Explore Menu</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                ) : (
                  /* CART ITEM CARDS */
                  <div className="space-y-3">
                    <AnimatePresence initial={false}>
                      {items.map((ci, index) => (
                        <motion.div
                          key={ci.item.id}
                          initial={
                            shouldReduceMotion
                              ? { opacity: 0 }
                              : { opacity: 0, y: 8 }
                          }
                          animate={{ opacity: 1, y: 0 }}
                          exit={
                            shouldReduceMotion
                              ? { opacity: 0 }
                              : { opacity: 0, scale: 0.94, height: 0, marginBottom: 0 }
                          }
                          transition={{
                            duration: 0.22,
                            delay: shouldReduceMotion ? 0 : Math.min(index * 0.05, 0.3),
                            ease: [0.22, 1, 0.36, 1],
                          }}
                        >
                          <OrderItemRow
                            item={ci.item}
                            quantity={ci.quantity}
                            variant="cart"
                            isOrderingOpen={orderingOpen}
                            onIncrement={() => orderingOpen && updateQuantity(ci.item.id, 1)}
                            onDecrement={() => orderingOpen && updateQuantity(ci.item.id, -1)}
                            onRemove={() => removeItem(ci.item.id)}
                          />
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {/* Special Instructions (Clean & Compact) */}
                    <div className="pt-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#2B1408] mb-1">
                        <Edit3 size={13} className="text-[#FE8E2A]" />
                        <span>Special Instructions</span>
                      </div>
                      <textarea
                        placeholder="e.g. Extra spicy, less oil, pack sauce separately..."
                        rows={2}
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        className="w-full p-2.5 sm:p-3 rounded-xl bg-white border border-[#EEDDCC] text-xs font-medium text-[#23120B] placeholder:text-[#A89284] focus:outline-none focus:ring-2 focus:ring-[#FE8E2A]/40 resize-none transition-all shadow-2xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* ====================================================== */}
              {/* 3. STICKY SUMMARY & CHECKOUT CTA                       */}
              {/* ====================================================== */}
              {items.length > 0 && (
                <div className="p-5 sm:p-6 border-t border-[#EEDDCC] bg-[#FDF6EE] space-y-3.5 shrink-0">
                  {/* Subtotal Summary (Delivery calculated at checkout) */}
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-extrabold text-sm sm:text-base text-[#2B1408] block leading-tight">
                        Items Subtotal
                      </span>
                      <span className="text-[11px] text-[#7A5C4A] font-medium block mt-0.5">
                        Delivery charges will be calculated at checkout
                      </span>
                    </div>
                    <span className="text-[#FE8E2A] font-serif text-lg sm:text-xl font-black">
                      ₹{subtotal.toFixed(2)}
                    </span>
                  </div>

                  {/* Primary Review Order & Checkout CTA */}
                  {orderingOpen ? (
                    <button
                      type="button"
                      onClick={handleOpenConfirmation}
                      className="w-full py-3.5 sm:py-4 px-6 rounded-2xl bg-[#FE8E2A] hover:bg-[#E67616] active:bg-[#C65A08] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg shadow-[#FE8E2A]/25 transition-all min-h-[48px] cursor-pointer group active:scale-98"
                    >
                      <ShoppingBag size={18} className="group-hover:scale-105 transition-transform" />
                      <span>Review Order & Checkout</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled
                      aria-disabled="true"
                      className="w-full py-3.5 sm:py-4 rounded-2xl bg-[#EEDDCC] text-[#7A5C4A] font-extrabold text-sm flex items-center justify-center gap-2 cursor-not-allowed select-none min-h-[48px]"
                    >
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0 inline-block" />
                      <span>Ordering Closed — Cannot Checkout</span>
                    </button>
                  )}

                  <p className="text-[11px] text-center text-[#7A5C4A] font-medium">
                    {orderingOpen
                      ? 'Direct WhatsApp ordering · No advance online payment needed'
                      : 'Online ordering is temporarily closed. Your cart items are preserved.'}
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};


