import { create } from 'zustand';
import { Category, GalleryItem, MenuItem, Offer, Review } from '../types';
import { publicApi } from '../api/publicApi';
import { useCartStore } from './useCartStore';

interface MenuState {
  categories: Category[];
  allMenuItems: MenuItem[];
  menuItems: MenuItem[];
  offers: Offer[];
  gallery: GalleryItem[];
  reviews: Review[];

  selectedCategoryId: string | null;
  selectedFoodType: string | null; // 'VEG', 'NON_VEG', 'EGG', or null for all
  searchQuery: string;

  selectedDishModal: MenuItem | null;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  authPromptReason: string | null;
  isReviewModalOpen: boolean;

  isLoadingMenu: boolean;
  isLoadingInitial: boolean;
  error: string | null;

  fetchAllPublicData: (force?: boolean) => Promise<void>;
  invalidateCache: () => void;
  filterMenu: () => Promise<void>;
  setSelectedCategoryId: (id: string | null) => void;
  setSelectedFoodType: (type: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedDishModal: (dish: MenuItem | null) => void;
  openAuthModal: (mode?: 'login' | 'register', reason?: string) => void;
  closeAuthModal: () => void;
  setIsReviewModalOpen: (open: boolean) => void;
}

// In-flight request deduplication and timestamp caching
let inFlightPublicDataPromise: Promise<void> | null = null;
let lastPublicDataFetchTime = 0;
const PUBLIC_DATA_CACHE_TTL_MS = 180_000; // 3 minutes cache

export const useMenuStore = create<MenuState>((set, get) => ({
  categories: [],
  allMenuItems: [],
  menuItems: [],
  offers: [],
  gallery: [],
  reviews: [],

  selectedCategoryId: null,
  selectedFoodType: null,
  searchQuery: '',

  selectedDishModal: null,
  isAuthModalOpen: false,
  authModalMode: 'login',
  authPromptReason: null,
  isReviewModalOpen: false,

  isLoadingMenu: false,
  isLoadingInitial: true,
  error: null,

  invalidateCache: () => {
    lastPublicDataFetchTime = 0;
    inFlightPublicDataPromise = null;
  },

  fetchAllPublicData: async (force = false) => {
    if (force) {
      lastPublicDataFetchTime = 0;
      inFlightPublicDataPromise = null;
    }

    // Reuse cached data if fresh and populated
    const { allMenuItems, categories } = get();
    if (!force && allMenuItems.length > 0 && categories.length > 0 && Date.now() - lastPublicDataFetchTime < PUBLIC_DATA_CACHE_TTL_MS) {
      set({ isLoadingInitial: false });
      return;
    }

    // Deduplicate in-flight simultaneous requests
    if (inFlightPublicDataPromise) {
      return inFlightPublicDataPromise;
    }

    set({ isLoadingInitial: true, error: null });

    inFlightPublicDataPromise = (async () => {
      try {
        const [cats, items, offers, gallery, reviews] = await Promise.all([
          publicApi.getCategories(),
          publicApi.getMenu(),
          publicApi.getOffers(),
          publicApi.getGallery(),
          publicApi.getReviews(),
        ]);

        lastPublicDataFetchTime = Date.now();

        set({
          categories: cats,
          allMenuItems: items,
          menuItems: items,
          offers,
          gallery,
          reviews,
          isLoadingInitial: false,
        });

        // Synchronize cart items with the active database IDs
        useCartStore.getState().syncWithMenuItems(items);
      } catch (err: any) {
        set({
          error: 'Failed to load menu data. Please check your connection.',
          isLoadingInitial: false,
        });
      } finally {
        inFlightPublicDataPromise = null;
      }
    })();

    return inFlightPublicDataPromise;
  },

  filterMenu: async () => {
    const { selectedCategoryId, selectedFoodType, searchQuery, allMenuItems } = get();

    // Fast in-memory filtering for instant zero-latency UI response
    if (allMenuItems && allMenuItems.length > 0) {
      let filtered = [...allMenuItems];

      if (selectedCategoryId) {
        filtered = filtered.filter(
          (i) => i.categoryId === selectedCategoryId || (i as any).category?.id === selectedCategoryId
        );
      }

      if (selectedFoodType) {
        filtered = filtered.filter((i) => i.foodType === selectedFoodType);
      }

      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        filtered = filtered.filter(
          (i) =>
            i.name.toLowerCase().includes(q) ||
            (i.description && i.description.toLowerCase().includes(q))
        );
      }

      set({ menuItems: filtered, isLoadingMenu: false });
      return;
    }

    // Fallback to server search if memory cache not yet available
    set({ isLoadingMenu: true });
    try {
      const items = await publicApi.getMenu({
        categoryId: selectedCategoryId || undefined,
        foodType: selectedFoodType || undefined,
        search: searchQuery ? searchQuery.trim() : undefined,
      });
      set({ menuItems: items, isLoadingMenu: false });
    } catch (e) {
      set({ isLoadingMenu: false });
    }
  },

  setSelectedCategoryId: (id) => {
    set({ selectedCategoryId: id });
    get().filterMenu();
  },

  setSelectedFoodType: (type) => {
    set({ selectedFoodType: type });
    get().filterMenu();
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
    get().filterMenu();
  },

  setSelectedDishModal: (dish) => set({ selectedDishModal: dish }),

  openAuthModal: (mode = 'login', reason) => {
    set({
      isAuthModalOpen: true,
      authModalMode: mode,
      authPromptReason: reason || null,
    });
  },

  closeAuthModal: () => {
    set({ isAuthModalOpen: false, authPromptReason: null });
  },

  setIsReviewModalOpen: (isReviewModalOpen) => set({ isReviewModalOpen }),
}));
