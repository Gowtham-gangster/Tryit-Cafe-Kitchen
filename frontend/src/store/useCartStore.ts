import { create } from 'zustand';
import { CartItem, MenuItem } from '../types';

interface CartState {
  items: CartItem[];
  instructions: string;
  cravingText: string;
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  pendingCheckout: boolean;
  pendingAction: { item: MenuItem; quantity: number } | null;

  addItem: (item: MenuItem, quantity?: number) => void;
  updateQuantity: (itemId: string, delta: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  setInstructions: (text: string) => void;
  setCravingText: (text: string) => void;
  setIsCartOpen: (open: boolean) => void;
  setIsCheckoutOpen: (open: boolean) => void;
  setPendingCheckout: (pending: boolean) => void;
  setPendingAction: (action: { item: MenuItem; quantity: number } | null) => void;
  resumePendingAction: () => void;

  getTotalCount: () => number;
  getSubtotal: () => number;
  syncWithMenuItems: (menuItems: MenuItem[]) => void;
}

export const useCartStore = create<CartState>((set, get) => {
  const savedCart = localStorage.getItem('tryit_cart_items');
  const initialItems: CartItem[] = savedCart ? JSON.parse(savedCart) : [];

  const persist = (items: CartItem[]) => {
    localStorage.setItem('tryit_cart_items', JSON.stringify(items));
  };

  return {
    items: initialItems,
    instructions: '',
    cravingText: '',
    isCartOpen: false,
    isCheckoutOpen: false,
    pendingCheckout: false,
    pendingAction: null,

    addItem: (item, quantity = 1) => {
      const current = get().items;
      const existingIndex = current.findIndex((ci) => ci.item.id === item.id);

      let updated: CartItem[];
      if (existingIndex > -1) {
        updated = [...current];
        updated[existingIndex].quantity += quantity;
      } else {
        updated = [...current, { item, quantity }];
      }

      set({ items: updated });
      persist(updated);
    },

    updateQuantity: (itemId, delta) => {
      const current = get().items;
      const updated = current
        .map((ci) => {
          if (ci.item.id === itemId) {
            const newQty = ci.quantity + delta;
            return newQty > 0 ? { ...ci, quantity: newQty } : null;
          }
          return ci;
        })
        .filter(Boolean) as CartItem[];

      set({ items: updated });
      persist(updated);
    },

    removeItem: (itemId) => {
      const updated = get().items.filter((ci) => ci.item.id !== itemId);
      set({ items: updated });
      persist(updated);
    },

    clearCart: () => {
      set({ items: [], instructions: '', cravingText: '' });
      localStorage.removeItem('tryit_cart_items');
    },

    setInstructions: (instructions) => set({ instructions }),
    setCravingText: (cravingText) => set({ cravingText }),
    setIsCartOpen: (isCartOpen) => set({ isCartOpen }),
    setIsCheckoutOpen: (isCheckoutOpen) => set({ isCheckoutOpen }),
    setPendingCheckout: (pendingCheckout) => set({ pendingCheckout }),
    setPendingAction: (pendingAction) => set({ pendingAction }),

    resumePendingAction: () => {
      const { pendingAction, addItem } = get();
      if (pendingAction) {
        addItem(pendingAction.item, pendingAction.quantity);
        set({ pendingAction: null, isCartOpen: true });
      }
    },

    getTotalCount: () => {
      return get().items.reduce((total, ci) => total + ci.quantity, 0);
    },

    getSubtotal: () => {
      return get().items.reduce(
        (total, ci) => total + (ci.item.effectivePrice ?? ci.item.price) * ci.quantity,
        0
      );
    },

    syncWithMenuItems: (menuItems: MenuItem[]) => {
      if (!menuItems || menuItems.length === 0) return;
      const current = get().items;
      let hasChanges = false;
      const updated = current.map((ci) => {
        const matched = menuItems.find(
          (m) =>
            m.id === ci.item.id ||
            (m.slug && ci.item.slug && m.slug === ci.item.slug) ||
            m.name.trim().toLowerCase() === ci.item.name.trim().toLowerCase()
        );
        if (matched) {
          if (matched.id !== ci.item.id || matched.price !== ci.item.price || matched.effectivePrice !== ci.item.effectivePrice) {
            hasChanges = true;
            return { ...ci, item: matched };
          }
        }
        return ci;
      });

      if (hasChanges) {
        set({ items: updated });
        persist(updated);
      }
    },
  };
});
