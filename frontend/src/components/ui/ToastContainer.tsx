import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToastStore, ToastItem } from '../../store/useToastStore';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();
  const visibleToasts = toasts.filter((toast) => toast.type !== 'success');

  const getIcon = (type: ToastItem['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={18} className="text-emerald-500 shrink-0" />;
      case 'error':
        return <AlertCircle size={18} className="text-red-500 shrink-0" />;
      case 'warning':
        return <AlertTriangle size={18} className="text-amber-500 shrink-0" />;
      case 'info':
      default:
        return <Info size={18} className="text-blue-500 shrink-0" />;
    }
  };

  const getBg = (type: ToastItem['type']) => {
    switch (type) {
      case 'success':
        return 'bg-white/95 border-emerald-200/80 text-stone-900 shadow-emerald-500/10';
      case 'error':
        return 'bg-white/95 border-red-200/80 text-stone-900 shadow-red-500/10';
      case 'warning':
        return 'bg-white/95 border-amber-200/80 text-stone-900 shadow-amber-500/10';
      case 'info':
      default:
        return 'bg-white/95 border-blue-200/80 text-stone-900 shadow-blue-500/10';
    }
  };

  return (
    <div className="fixed top-4 left-4 right-4 sm:left-auto sm:right-4 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
      <AnimatePresence>
        {visibleToasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -25, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, y: -15, transition: { duration: 0.18 } }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className={`relative overflow-hidden pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-xl backdrop-blur-xl ${getBg(
              toast.type
            )}`}
          >
            {getIcon(toast.type)}
            <div className="flex-1 min-w-0">
              {toast.title && (
                <h4 className="text-xs font-bold font-display leading-tight">{toast.title}</h4>
              )}
              <p className="text-xs font-medium text-stone-600 mt-0.5 leading-relaxed">
                {toast.message}
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => removeToast(toast.id)}
              className="text-stone-400 hover:text-stone-700 p-1 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
              aria-label="Close notification"
            >
              <X size={14} />
            </motion.button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

