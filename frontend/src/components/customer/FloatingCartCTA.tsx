import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '../../store/useCartStore';

export const FloatingCartCTA: React.FC = () => {
  const { getTotalCount, getSubtotal, setIsCartOpen, isCartOpen, isCheckoutOpen } = useCartStore();
  const shouldReduceMotion = useReducedMotion();

  const totalCount = getTotalCount();
  const subtotal = getSubtotal();
  const isVisible = totalCount > 0 && !isCartOpen && !isCheckoutOpen;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="floating-cart-cta"
          initial={
            shouldReduceMotion
              ? { opacity: 0 }
              : { y: 24, opacity: 0, scale: 0.97 }
          }
          animate={
            shouldReduceMotion
              ? { opacity: 1 }
              : { y: 0, opacity: 1, scale: 1 }
          }
          exit={
            shouldReduceMotion
              ? { opacity: 0 }
              : { y: 24, opacity: 0, scale: 0.97 }
          }
          transition={{ duration: 0.22, ease: 'easeOut' }}
          className="fixed z-40 left-3 right-3 sm:left-auto sm:right-8 bottom-[calc(4.5rem+env(safe-area-inset-bottom,0px))] sm:bottom-6 w-auto sm:w-[380px] max-w-md mx-auto sm:mx-0 pointer-events-auto"
        >
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="w-full py-3 sm:py-3.5 px-4 sm:px-5 bg-[#FE8E2A] hover:bg-[#E67616] active:bg-[#C65A08] text-white rounded-2xl shadow-xl shadow-[#FE8E2A]/25 border border-white/20 flex items-center justify-between gap-3 transition-all duration-200 cursor-pointer min-h-[48px] group select-none"
            aria-label={`View Cart: ${totalCount} ${totalCount === 1 ? 'item' : 'items'}, ₹${subtotal.toFixed(2)}`}
          >
            {/* Left: Icon with item count badge + price info */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md shrink-0">
                <ShoppingBag className="w-5 h-5 text-white" />
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 rounded-full bg-emerald-500 text-white text-[10px] font-black flex items-center justify-center border-2 border-[#2B1408] shadow-xs">
                  {totalCount}
                </span>
              </div>
              <div className="text-left min-w-0">
                <p className="text-[11px] font-extrabold text-amber-100 uppercase tracking-wider truncate">
                  Cart · {totalCount} {totalCount === 1 ? 'Item' : 'Items'}
                </p>
                <p className="text-sm sm:text-base font-black text-white font-serif leading-tight">
                  ₹{subtotal.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Right: View Cart Action Pill */}
            <div className="flex items-center gap-1.5 font-bold text-xs bg-white text-[#2B1408] px-3.5 py-2 rounded-xl group-hover:bg-amber-50 group-active:scale-95 transition-all shadow-xs shrink-0">
              <span>View Cart</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#FE8E2A] group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

