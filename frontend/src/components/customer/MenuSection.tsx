import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  X,
  UtensilsCrossed,
  ArrowUpDown,
  ChevronDown,
  Check,
} from 'lucide-react';
import { useMenuStore } from '../../store/useMenuStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { DishCard } from './DishCard';
import { RevealCard } from '../common/RevealCard';
import { MenuCardSkeleton } from '../ui/Skeleton';

export type MenuSortOption =
  | 'BESTSELLERS'
  | 'PRICE_ASC'
  | 'PRICE_DESC'
  | 'DISCOUNT';

const sortOptions: { label: string; value: MenuSortOption }[] = [
  { label: 'Bestsellers', value: 'BESTSELLERS' },
  { label: 'Price: Low to High', value: 'PRICE_ASC' },
  { label: 'Price: High to Low', value: 'PRICE_DESC' },
  { label: 'Discount Available', value: 'DISCOUNT' },
];

export const MenuSection: React.FC = () => {
  const {
    categories,
    menuItems,
    selectedCategoryId,
    selectedFoodType,
    searchQuery,
    isLoadingMenu,
    setSelectedCategoryId,
    setSelectedFoodType,
    setSearchQuery,
  } = useMenuStore();

  const { isOnlineOrderingOpen } = useSettingsStore();
  const orderingOpen = isOnlineOrderingOpen();

  const [sortBy, setSortBy] = useState<MenuSortOption>('BESTSELLERS');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(target)
      ) {
        setIsSortOpen(false);
      }
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(target)
      ) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const foodTypeOptions = [
    { label: 'All Items', shortLabel: 'All', value: null },
    { label: 'Veg Only', shortLabel: 'Veg', value: 'VEG', dotColor: 'bg-emerald-600' },
    { label: 'Non-Veg', shortLabel: 'Non-Veg', value: 'NON_VEG', dotColor: 'bg-red-600' },
  ];

  // Derived sorted items (preserves original list, never mutates original array)
  const sortedMenuItems = useMemo(() => {
    const list = [...menuItems];
    switch (sortBy) {
      case 'PRICE_ASC':
        return list.sort((a, b) => {
          const priceA = a.effectivePrice ?? a.price;
          const priceB = b.effectivePrice ?? b.price;
          return priceA - priceB;
        });
      case 'PRICE_DESC':
        return list.sort((a, b) => {
          const priceA = a.effectivePrice ?? a.price;
          const priceB = b.effectivePrice ?? b.price;
          return priceB - priceA;
        });
      case 'DISCOUNT':
        return list.sort((a, b) => {
          const hasDiscA = Boolean(
            a.discountEnabled && (a.effectivePrice ?? a.price) < a.price
          );
          const hasDiscB = Boolean(
            b.discountEnabled && (b.effectivePrice ?? b.price) < b.price
          );
          if (hasDiscA && !hasDiscB) return -1;
          if (!hasDiscA && hasDiscB) return 1;
          return 0; // Preserves relative order
        });
      case 'BESTSELLERS':
      default:
        return list.sort((a, b) => {
          const bestA = Boolean(a.bestseller);
          const bestB = Boolean(b.bestseller);
          if (bestA && !bestB) return -1;
          if (!bestA && bestB) return 1;
          return 0; // Preserves relative order
        });
    }
  }, [menuItems, sortBy]);

  const activeCategoryName = useMemo(() => {
    if (selectedCategoryId === null) return 'All Categories';
    return (
      categories.find((c) => c.id === selectedCategoryId)?.name ||
      'Category'
    );
  }, [categories, selectedCategoryId]);

  return (
    <section
      id="menu"
      className="py-8 sm:py-10 lg:py-12 bg-[#FDF6EE] scroll-mt-16 sm:scroll-mt-20"
    >
      <div className="max-w-7xl mx-auto px-3 min-[390px]:px-4 sm:px-6 lg:px-8">
        {/* Section Header with Staggered Entrance */}
        <div className="text-center max-w-2xl mx-auto mb-4 sm:mb-6">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FBEFE1] border border-[#EEDDCC] text-[#2B1408] text-xs font-bold uppercase tracking-wider mb-2"
          >
            <UtensilsCrossed size={14} className="text-[#FE8E2A]" />
            <span>TRYIT KITCHEN MENU</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, ease: 'easeOut', delay: 0.08 }}
            className="text-[28px] min-[390px]:text-[32px] sm:text-4xl font-extrabold text-[#2B1408] font-serif tracking-tight leading-tight"
          >
            Explore Our Digital Menu
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, ease: 'easeOut', delay: 0.16 }}
            className="text-xs min-[390px]:text-sm text-[#7A5C4A] mt-1 font-medium leading-relaxed"
          >
            Freshly prepared favorites, made for every craving.
          </motion.p>
        </div>

        {/* Online Ordering Closed Notice if applicable */}
        {!orderingOpen && (
          <div className="max-w-2xl mx-auto mb-4 p-2.5 sm:p-3 rounded-2xl bg-[#FBEFE1] border border-[#EEDDCC] text-[#2B1408] flex items-center justify-between gap-3 text-xs shadow-2xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#FE8E2A] animate-pulse shrink-0" />
              <span className="font-bold">Online ordering is paused.</span>
              <span className="hidden sm:inline text-[#7A5C4A]">
                You can still browse dishes and prices!
              </span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider bg-[#FFFBF7] px-2 py-0.5 rounded text-[#2B1408] border border-[#EEDDCC] shrink-0">
              Browse Mode
            </span>
          </div>
        )}

        {/*
          ==================================================
          STICKY MENU TOOLBAR
          - Sticks below the mobile top navbar (top-16 = 64px on mobile, top-20 on desktop)
          - Translucent warm cream background with subtle blur & divider
          - High z-index (z-30) so search & filters stay always accessible
          ==================================================
        */}
        <div className="sticky top-16 sm:top-20 z-30 bg-[#FFF8F0]/96 backdrop-blur-md py-2.5 -mx-3 min-[390px]:-mx-4 sm:mx-0 px-3 min-[390px]:px-4 sm:px-0 mb-4 sm:mb-6 border-b border-[#EEDDCC] shadow-2xs transition-all">
          {/* MOBILE VIEW (< sm): 3-Row Compact Toolbar */}
          <div className="block sm:hidden space-y-2">
            {/* ROW 1: Search Bar */}
            <div className="relative flex items-center">
              <Search className="absolute left-3 text-[#7A5C4A]" size={16} />
              <input
                type="text"
                placeholder="Search dishes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-white border border-[#EEDDCC] shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#FE8E2A]/40 focus:border-[#FE8E2A] text-xs font-medium text-[#23120B] placeholder:text-[#7A5C4A]/60 h-10 min-h-[40px] transition-all"
                aria-label="Search dishes"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 p-1 rounded-full text-[#7A5C4A] hover:text-[#2B1408] hover:bg-[#F2E5D6] transition-colors cursor-pointer"
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* ROW 2: All Categories Dropdown + Sort Dropdown */}
            <div className="grid grid-cols-2 gap-2">
              {/* Category Dropdown Control */}
              <div className="relative w-full" ref={categoryDropdownRef}>
                <button
                  type="button"
                  aria-label="Select menu category"
                  aria-haspopup="listbox"
                  aria-expanded={isCategoryOpen}
                  onClick={() => {
                    setIsCategoryOpen(!isCategoryOpen);
                    setIsSortOpen(false);
                  }}
                  className={`w-full px-2.5 py-2 rounded-xl border text-xs font-bold flex items-center justify-between gap-1 transition-all cursor-pointer shadow-2xs h-10 min-h-[40px] ${
                    selectedCategoryId !== null || isCategoryOpen
                      ? 'bg-[#FE8E2A] text-white border-[#FE8E2A]'
                      : 'bg-[#FFFBF7] text-[#2B1408] border-[#EEDDCC] hover:bg-[#FBEFE1]'
                  }`}
                >
                  <span className="truncate">{activeCategoryName}</span>
                  <ChevronDown
                    size={14}
                    className={`shrink-0 transition-transform duration-200 ${
                      isCategoryOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isCategoryOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.98 }}
                      transition={{ duration: 0.16, ease: 'easeOut' }}
                      className="absolute left-0 top-full mt-1.5 w-64 max-w-[calc(100vw-32px)] max-h-60 overflow-y-auto bg-[#FFFBF7] rounded-2xl border border-[#EEDDCC] shadow-xl p-1.5 z-50 space-y-0.5 no-scrollbar"
                      role="listbox"
                      aria-label="Categories"
                    >
                      <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#7A5C4A]">
                        Select Category
                      </div>
                      <button
                        type="button"
                        role="option"
                        aria-selected={selectedCategoryId === null}
                        onClick={() => {
                          setSelectedCategoryId(null);
                          setIsCategoryOpen(false);
                        }}
                        className={`w-full px-2.5 py-2 rounded-xl text-left text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                          selectedCategoryId === null
                            ? 'bg-[#FBEFE1] text-[#FE8E2A]'
                            : 'text-[#2B1408] hover:bg-[#FDF6EE]'
                        }`}
                      >
                        <span>All Categories</span>
                        {selectedCategoryId === null && (
                          <Check size={14} className="stroke-[3] text-[#FE8E2A]" />
                        )}
                      </button>
                      {categories.map((cat) => {
                        const isSelected = selectedCategoryId === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => {
                              setSelectedCategoryId(cat.id);
                              setIsCategoryOpen(false);
                            }}
                            className={`w-full px-2.5 py-2 rounded-xl text-left text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-[#FBEFE1] text-[#FE8E2A]'
                                : 'text-[#2B1408] hover:bg-[#FDF6EE]'
                            }`}
                          >
                            <span className="truncate">{cat.name}</span>
                            {isSelected && (
                              <Check
                                size={14}
                                className="stroke-[3] text-[#FE8E2A]"
                              />
                            )}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Sort Dropdown Control */}
              <div className="relative w-full" ref={sortDropdownRef}>
                <button
                  type="button"
                  aria-label="Sort menu items"
                  aria-haspopup="listbox"
                  aria-expanded={isSortOpen}
                  onClick={() => {
                    setIsSortOpen(!isSortOpen);
                    setIsCategoryOpen(false);
                  }}
                  className="w-full px-2.5 py-2 rounded-xl bg-[#FFFBF7] hover:bg-[#FBEFE1] border border-[#EEDDCC] hover:border-[#FE8E2A]/50 text-[#2B1408] text-xs font-bold flex items-center justify-between gap-1 transition-all cursor-pointer shadow-2xs h-10 min-h-[40px]"
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <ArrowUpDown size={12} className="text-[#FE8E2A] shrink-0" />
                    <span className="truncate">
                      {sortOptions.find((o) => o.value === sortBy)?.label ||
                        'Sort'}
                    </span>
                  </div>
                  <ChevronDown
                    size={14}
                    className={`shrink-0 text-[#7A5C4A] transition-transform duration-200 ${
                      isSortOpen ? 'rotate-180 text-[#FE8E2A]' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isSortOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -4, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -4, scale: 0.98 }}
                      transition={{ duration: 0.16, ease: 'easeOut' }}
                      className="absolute right-0 top-full mt-1.5 w-52 max-w-[calc(100vw-32px)] bg-[#FFFBF7] rounded-2xl border border-[#EEDDCC] shadow-xl p-1.5 z-50 space-y-0.5"
                      role="listbox"
                      aria-label="Sort options"
                    >
                      <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[#7A5C4A]">
                        Sort By
                      </div>
                      {sortOptions.map((opt) => {
                        const isSelected = sortBy === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => {
                              setSortBy(opt.value);
                              setIsSortOpen(false);
                            }}
                            className={`w-full px-2.5 py-2 rounded-xl text-left text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-[#FBEFE1] text-[#FE8E2A]'
                                : 'text-[#2B1408] hover:bg-[#FDF6EE]'
                            }`}
                          >
                            <span>{opt.label}</span>
                            {isSelected && (
                              <Check
                                size={14}
                                className="stroke-[3] text-[#FE8E2A]"
                              />
                            )}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* ROW 3: Compact Segmented Veg / Non-Veg Filter (Fits 360px without scroll) */}
            <div
              className="grid grid-cols-3 p-1 rounded-xl bg-[#F5E8D8] border border-[#EEDDCC] text-center"
              role="radiogroup"
              aria-label="Filter food type"
            >
              {foodTypeOptions.map((opt, idx) => {
                const isSelected = selectedFoodType === opt.value;
                return (
                  <button
                    key={idx}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    aria-label={`Filter ${opt.label}`}
                    onClick={() => setSelectedFoodType(opt.value)}
                    className={`py-1.5 px-2 rounded-lg text-[11px] min-[390px]:text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer min-h-[34px] ${
                      isSelected
                        ? 'bg-[#FFFBF7] text-[#2B1408] shadow-xs'
                        : 'text-[#7A5C4A] hover:text-[#2B1408]'
                    }`}
                  >
                    {opt.dotColor && (
                      <span
                        className={`w-2 h-2 rounded-full ${opt.dotColor} shrink-0`}
                      />
                    )}
                    <span className="truncate">{opt.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* DESKTOP VIEW (sm+): Wide Search + Category Tabs + Filters */}
          <div className="hidden sm:block">
            {/* Desktop Search Bar */}
            <div className="max-w-md mx-auto mb-3">
              <div className="relative flex items-center">
                <Search className="absolute left-3.5 text-[#7A5C4A]" size={17} />
                <input
                  type="text"
                  placeholder="Search dishes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white border border-[#EEDDCC] shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#FE8E2A]/40 focus:border-[#FE8E2A] text-xs sm:text-sm font-medium text-[#23120B] placeholder:text-[#7A5C4A]/60 transition-all"
                  aria-label="Search dishes"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 p-1 rounded-full text-[#7A5C4A] hover:text-[#2B1408] hover:bg-[#F2E5D6] transition-colors cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>

            {/* Desktop Category Tabs Container */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 max-w-full">
              <motion.button
                whileHover={{ y: -1, scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategoryId(null)}
                className={`whitespace-nowrap px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 ${
                  selectedCategoryId === null
                    ? 'bg-[#FE8E2A] text-white shadow-md shadow-[#FE8E2A]/20'
                    : 'bg-[#FFFBF7] text-[#2B1408] hover:bg-[#FBEFE1] border border-[#EEDDCC] hover:border-[#FE8E2A]/40'
                }`}
              >
                All Categories
              </motion.button>

              {categories.map((cat) => (
                <motion.button
                  key={cat.id}
                  whileHover={{ y: -1, scale: 1.02 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`whitespace-nowrap px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer shrink-0 ${
                    selectedCategoryId === cat.id
                      ? 'bg-[#FE8E2A] text-white shadow-md shadow-[#FE8E2A]/20'
                      : 'bg-[#FFFBF7] text-[#2B1408] hover:bg-[#FBEFE1] border border-[#EEDDCC] hover:border-[#FE8E2A]/40'
                  }`}
                >
                  {cat.name}
                </motion.button>
              ))}
            </div>

            {/* Desktop Filters & Sort Row */}
            <div className="flex items-center justify-between gap-3 mt-3 pt-2.5 border-t border-[#EEDDCC]/60">
              <div className="flex items-center gap-2">
                {foodTypeOptions.map((opt, idx) => (
                  <motion.button
                    key={idx}
                    whileHover={{ y: -1, scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedFoodType(opt.value)}
                    className={`whitespace-nowrap px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 min-h-[36px] ${
                      selectedFoodType === opt.value
                        ? 'bg-[#2B1408] text-[#FFFBF7] shadow-xs'
                        : 'bg-[#FFFBF7] text-[#7A5C4A] hover:bg-[#FBEFE1] border border-[#EEDDCC] hover:border-[#FE8E2A]/40'
                    }`}
                  >
                    {opt.dotColor && (
                      <span className={`w-2 h-2 rounded-full ${opt.dotColor}`} />
                    )}
                    <span>{opt.label}</span>
                  </motion.button>
                ))}
              </div>

              {/* Desktop Sort Dropdown Control */}
              <div className="relative" ref={sortDropdownRef}>
                <button
                  type="button"
                  aria-label="Sort menu items"
                  aria-haspopup="listbox"
                  aria-expanded={isSortOpen}
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="px-3.5 py-2 rounded-xl bg-[#FFFBF7] hover:bg-[#FBEFE1] border border-[#EEDDCC] hover:border-[#FE8E2A]/50 text-[#2B1408] text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-2xs min-h-[38px]"
                >
                  <ArrowUpDown size={13} className="text-[#FE8E2A]" />
                  <span className="text-[#7A5C4A]">Sort:</span>
                  <span className="text-[#2B1408]">
                    {sortOptions.find((o) => o.value === sortBy)?.label}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-[#7A5C4A] transition-transform duration-200 ${
                      isSortOpen ? 'rotate-180 text-[#FE8E2A]' : ''
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {isSortOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-1.5 w-52 bg-[#FFFBF7] rounded-2xl border border-[#EEDDCC] shadow-xl p-1.5 z-50 space-y-0.5"
                      role="listbox"
                      aria-label="Sort options"
                    >
                      <div className="px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#7A5C4A]">
                        Sort By
                      </div>
                      {sortOptions.map((opt) => {
                        const isSelected = sortBy === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => {
                              setSortBy(opt.value);
                              setIsSortOpen(false);
                            }}
                            className={`w-full px-2.5 py-2 rounded-xl text-left text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-[#FBEFE1] text-[#FE8E2A]'
                                : 'text-[#2B1408] hover:bg-[#FDF6EE]'
                            }`}
                          >
                            <span>{opt.label}</span>
                            {isSelected && (
                              <Check
                                size={14}
                                className="stroke-[3] text-[#FE8E2A]"
                              />
                            )}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        {/*
          ==================================================
          RESPONSIVE MENU GRID
          - Mobile: TWO COLUMNS (grid-cols-2) using minmax(0, 1fr)
          - Tablet: 2 columns (sm:grid-cols-2)
          - Desktop: 3 columns (lg:grid-cols-3) or 4 columns (xl:grid-cols-4)
          - pb-24 ensures clear clearance above fixed mobile bottom nav
          ==================================================
        */}
        {isLoadingMenu ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 min-[390px]:gap-3 sm:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <MenuCardSkeleton key={i} />
            ))}
          </div>
        ) : sortedMenuItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-10 sm:py-14 bg-[#FFFBF7] rounded-3xl border border-[#EEDDCC] max-w-lg mx-auto p-6 sm:p-8 shadow-xs"
          >
            <div className="w-14 h-14 rounded-3xl bg-[#FBEFE1] text-[#FE8E2A] flex items-center justify-center mx-auto mb-3">
              <UtensilsCrossed size={28} />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#2B1408] mb-1 font-serif">
              No Dishes Found
            </h3>
            <p className="text-xs sm:text-sm text-[#7A5C4A] mb-5">
              Try another search or adjust your filters.
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedCategoryId(null);
                setSelectedFoodType(null);
                setSearchQuery('');
                setSortBy('BESTSELLERS');
              }}
              className="px-5 py-2.5 rounded-xl bg-[#FE8E2A] hover:bg-[#E67616] text-white font-bold text-xs transition-colors shadow-md cursor-pointer"
            >
              Reset Filters
            </motion.button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 min-[390px]:gap-3 sm:gap-5">
            {sortedMenuItems.map((dish, idx) => (
              <RevealCard key={dish.id} index={idx} enableHover={false}>
                <DishCard dish={dish} />
              </RevealCard>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
