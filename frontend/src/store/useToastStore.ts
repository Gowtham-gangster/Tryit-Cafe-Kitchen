import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastState {
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, 'id'>) => void;
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

export const useToastStore = create<ToastState>((set) => {
  const showToast = (toast: Omit<ToastItem, 'id'>) => {
    // Suppress all success toasts across mobile and desktop as requested
    if (toast.type === 'success') {
      return;
    }

    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastItem = { ...toast, id };
    set((state) => ({ toasts: [...state.toasts, newToast] }));

    const duration = toast.duration || 4000;
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, duration);
  };

  return {
    toasts: [],
    showToast,
    addToast: showToast,
    removeToast: (id) =>
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
    success: () => {
      // Intentionally suppressed: top success messages disabled for all actions
    },
    error: (message, title) =>
      showToast({ type: 'error', message, title }),
    warning: (message, title) =>
      showToast({ type: 'warning', message, title }),
    info: (message, title) =>
      showToast({ type: 'info', message, title }),
  };
});
