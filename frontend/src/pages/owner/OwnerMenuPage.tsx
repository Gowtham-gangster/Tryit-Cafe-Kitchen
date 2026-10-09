import React, { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Upload,
  Sparkles,
  Flame,
  Star,
  ArrowUp,
  ArrowDown,
  X,
} from 'lucide-react';
import { Category, FoodType, MenuItem } from '../../types';
import { ownerApi } from '../../api/ownerApi';
import { FoodTypeBadge } from '../../components/common/FoodTypeBadge';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToastStore } from '../../store/useToastStore';
import { useMenuStore } from '../../store/useMenuStore';
import { getOptimizedImageUrl } from '../../utils/imageUrl';

export const OwnerMenuPage: React.FC = () => {
  const [dishes, setDishes] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const { success, error: toastError } = useToastStore();
  const { fetchAllPublicData } = useMenuStore();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<MenuItem | null>(null);

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState<MenuItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState<number | string>(100);
  const [discountEnabled, setDiscountEnabled] = useState(false);
  const [discountType, setDiscountType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState<number | string>(10);
  const [foodType, setFoodType] = useState<FoodType>('VEG');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePublicId, setImagePublicId] = useState('');
  const [available, setAvailable] = useState(true);
  const [bestseller, setBestseller] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [isPopular, setIsPopular] = useState(false);
  const [popularDisplayOrder, setPopularDisplayOrder] = useState<number>(1);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updatingPopularId, setUpdatingPopularId] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [dishesData, catsData] = await Promise.all([
        ownerApi.getMenuItems(),
        ownerApi.getCategories(),
      ]);
      setDishes(dishesData);
      setCategories(catsData);
    } catch (e) {
      console.error(e);
      toastError('Failed to load menu dishes.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const popularDishes = dishes
    .filter((d) => d.isPopular || d.popular)
    .sort((a, b) => (a.popularDisplayOrder ?? 999) - (b.popularDisplayOrder ?? 999));

  const openAddModal = () => {
    setEditingDish(null);
    setName('');
    setCategoryId(categories.length > 0 ? categories[0].id : '');
    setPrice(120);
    setDiscountEnabled(false);
    setDiscountType('PERCENTAGE');
    setDiscountValue(10);
    setFoodType('VEG');
    setDescription('');
    setImageUrl('');
    setImagePublicId('');
    setAvailable(true);
    setBestseller(false);
    setIsNew(false);
    setIsPopular(false);
    setPopularDisplayOrder(popularDishes.length + 1);
    setIsModalOpen(true);
  };

  const openEditModal = (dish: MenuItem) => {
    setEditingDish(dish);
    setName(dish.name);
    setCategoryId(dish.categoryId);
    setPrice(dish.price);
    setDiscountEnabled(Boolean(dish.discountEnabled));
    setDiscountType(
      dish.discountType === 'FIXED' || dish.discountType === 'FLAT_AMOUNT'
        ? 'FIXED'
        : 'PERCENTAGE'
    );
    setDiscountValue(dish.discountValue ?? 10);
    setFoodType(dish.foodType);
    setDescription(dish.description || '');
    setImageUrl(dish.imageUrl || '');
    setImagePublicId(dish.imagePublicId || '');
    setAvailable(dish.available);
    setBestseller(dish.bestseller);
    setIsNew(dish.isNew);
    setIsPopular(!!(dish.isPopular || dish.popular));
    setPopularDisplayOrder(dish.popularDisplayOrder || 1);
    setIsModalOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toastError('Image size exceeds 10MB limit. Please choose a smaller image.');
      return;
    }

    setIsUploading(true);
    try {
      const uploadRes = await ownerApi.uploadMedia(file, 'dishes');
      setImageUrl(uploadRes.url);
      setImagePublicId(uploadRes.publicId);
      success('Image uploaded successfully to Cloudinary!');
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.message ||
        err?.message ||
        'Image upload failed. Please try again.';
      toastError(errMsg);
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleSaveDish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !categoryId) {
      toastError('Please provide a dish name and category.');
      return;
    }

    if (isPopular && !editingDish?.isPopular && popularDishes.length >= 6) {
      toastError('You can feature up to 6 dishes on the homepage.');
      return;
    }

    if (discountEnabled) {
      const dVal = Number(discountValue);
      const pVal = Number(price);
      if (isNaN(dVal) || dVal < 0) {
        toastError('Discount cannot be negative.');
        return;
      }
      if (discountType === 'PERCENTAGE') {
        if (dVal <= 0 || dVal > 100) {
          toastError('Percentage discount cannot exceed 100%.');
          return;
        }
      } else {
        if (dVal >= pVal) {
          toastError('Discount amount must be less than the item price.');
          return;
        }
      }
    }

    setIsSubmitting(true);
    try {
      const payload: Partial<MenuItem> = {
        name: name.trim(),
        categoryId,
        price: Number(price),
        discountEnabled,
        discountType: discountEnabled ? discountType : undefined,
        discountValue: discountEnabled ? Number(discountValue) : undefined,
        foodType,
        description: description.trim(),
        imageUrl: imageUrl.trim() || undefined,
        imagePublicId: imagePublicId || undefined,
        available,
        bestseller,
        isNew,
        isPopular,
        popularDisplayOrder: isPopular ? Number(popularDisplayOrder) : 0,
      };

      if (editingDish) {
        await ownerApi.updateMenuItem(editingDish.id, payload);
        success(`"${name}" updated successfully!`);
      } else {
        await ownerApi.createMenuItem(payload);
        success(`"${name}" added to menu!`);
      }

      setIsModalOpen(false);
      await loadData();
      fetchAllPublicData(true); // Update customer cache instantly!
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to save menu dish.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteDish = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await ownerApi.deleteMenuItem(deleteTarget.id);
      success(`"${deleteTarget.name}" removed from menu.`);
      setDeleteTarget(null);
      await loadData();
      fetchAllPublicData(true);
    } catch (err: any) {
      toastError('Failed to delete dish.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleAvailability = async (id: string, currentDishName: string) => {
    try {
      const updated = await ownerApi.toggleAvailability(id);
      success(`"${currentDishName}" is now ${updated.available ? 'Available' : 'Sold Out'}.`);
      await loadData();
      fetchAllPublicData(true);
    } catch (e) {
      toastError('Failed to update availability.');
    }
  };

  const handleTogglePopular = async (dish: MenuItem) => {
    if (updatingPopularId) return; // Prevent double clicks
    const isAdding = !(dish.isPopular || dish.popular);
    if (isAdding && popularDishes.length >= 6) {
      toastError('You can feature up to 6 dishes on the homepage. Remove one before adding another.');
      return;
    }

    setUpdatingPopularId(dish.id);
    try {
      const nextOrder = isAdding ? popularDishes.length + 1 : 0;
      await ownerApi.togglePopular(dish.id, isAdding, nextOrder);
      success(
        `"${dish.name}" ${
          isAdding ? 'is now featured in Popular at Tryit' : 'removed from Popular at Tryit'
        }.`
      );
      await loadData();
      fetchAllPublicData(true);
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Could not update Popular status. Please try again.');
    } finally {
      setUpdatingPopularId(null);
    }
  };

  const handleMovePopularOrder = async (dish: MenuItem, direction: 'up' | 'down') => {
    const idx = popularDishes.findIndex((d) => d.id === dish.id);
    if (idx < 0) return;
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= popularDishes.length) return;

    const targetDish = popularDishes[targetIdx];
    const dishOrder = dish.popularDisplayOrder ?? idx + 1;
    const targetOrder = targetDish.popularDisplayOrder ?? targetIdx + 1;

    try {
      await Promise.all([
        ownerApi.togglePopular(dish.id, true, targetOrder),
        ownerApi.togglePopular(targetDish.id, true, dishOrder),
      ]);
      success('Popular item order updated!');
      await loadData();
      fetchAllPublicData(true);
    } catch (err) {
      toastError('Failed to reorder items.');
    }
  };

  const filteredDishes = dishes.filter((d) => {
    const matchSearch =
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      (d.description && d.description.toLowerCase().includes(search.toLowerCase()));
    const matchCat = filterCat === 'ALL' || d.categoryId === filterCat;
    const matchStatus =
      filterStatus === 'ALL'
        ? true
        : filterStatus === 'POPULAR'
        ? (d.isPopular || d.popular)
        : filterStatus === 'BESTSELLER'
        ? d.bestseller
        : filterStatus === 'AVAILABLE'
        ? d.available
        : !d.available;
    return matchSearch && matchCat && matchStatus;
  });

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* 1. Page Header & Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl 2xl:text-3xl font-extrabold text-[#2B1408] font-serif">
            Menu Dishes Management
          </h1>
          <p className="text-xs sm:text-sm text-[#7A5C4A] mt-0.5">
            Manage your dishes, pricing, discounts, bestseller badges, and featured homepage items.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-[#FE8E2A] hover:bg-[#E67616] active:bg-[#C65A08] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm shadow-[#FE8E2A]/25 transition-all cursor-pointer min-h-[44px]"
        >
          <Plus size={16} />
          <span>Add New Dish</span>
        </button>
      </div>

      {/* 2. Dedicated Homepage Popular Management Bar (Compact Horizontal Grid) */}
      <div className="bg-[#FFFBF7] p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl border border-[#EEDDCC] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <Star size={15} className="text-[#FE8E2A] fill-[#FE8E2A]" />
            <h2 className="text-xs sm:text-sm font-bold text-[#2B1408] font-serif">
              Homepage "Popular at Tryit" Dishes
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-[#FE8E2A]/15 text-[#FE8E2A] text-[10px] sm:text-xs font-black">
              {popularDishes.length} / 6 Featured
            </span>
          </div>
          <p className="text-[10px] sm:text-[11px] text-[#7A5C4A]">
            Independent of Bestsellers. Displayed on homepage in this exact order.
          </p>
        </div>

        {popularDishes.length === 0 ? (
          <div className="py-4 px-3 rounded-xl bg-[#FDF6EE] border border-dashed border-[#EEDDCC] text-center">
            <p className="text-xs font-bold text-[#2B1408]">No popular items selected</p>
            <p className="text-[10px] sm:text-[11px] text-[#7A5C4A] mt-0.5">
              Click <span className="font-bold text-[#FE8E2A]">+ Pop</span> on any dish below to feature it on the customer landing page.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5">
            {popularDishes.map((dish, index) => (
              <div
                key={dish.id}
                className="flex items-center justify-between p-2 rounded-xl sm:rounded-2xl bg-[#FDF6EE] border border-[#EEDDCC] gap-2 hover:border-[#FE8E2A]/40 transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-5 h-5 rounded-full bg-[#2B1408] text-[#FE8E2A] text-[10px] font-black flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg overflow-hidden bg-white shrink-0">
                    <img
                      src={
                        getOptimizedImageUrl(dish.imageUrl, 'ownerThumbnail') ||
                        '/Hero.jpg'
                      }
                      alt={dish.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-[#2B1408] truncate leading-tight">{dish.name}</p>
                    <p className="text-[10px] text-[#7A5C4A] truncate mt-0.5">
                      ₹{dish.effectivePrice ?? dish.price}{' '}
                      {dish.bestseller && <span className="text-[#FE8E2A] font-bold">• Bestseller</span>}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-0.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMovePopularOrder(dish, 'up')}
                    disabled={index === 0}
                    className="p-1 rounded-lg text-[#7A5C4A] hover:text-[#2B1408] hover:bg-[#F2E5D6] disabled:opacity-20 cursor-pointer min-h-[30px] min-w-[30px] flex items-center justify-center"
                    title="Move up"
                    aria-label={`Move ${dish.name} up in popular order`}
                  >
                    <ArrowUp size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMovePopularOrder(dish, 'down')}
                    disabled={index === popularDishes.length - 1}
                    className="p-1 rounded-lg text-[#7A5C4A] hover:text-[#2B1408] hover:bg-[#F2E5D6] disabled:opacity-20 cursor-pointer min-h-[30px] min-w-[30px] flex items-center justify-center"
                    title="Move down"
                    aria-label={`Move ${dish.name} down in popular order`}
                  >
                    <ArrowDown size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTogglePopular(dish)}
                    disabled={updatingPopularId === dish.id}
                    className="p-1 rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer disabled:opacity-40 min-h-[30px] min-w-[30px] flex items-center justify-center"
                    title="Remove from Popular"
                    aria-label={`Remove ${dish.name} from popular`}
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Filter & Search Controls (Responsive Row on Desktop, Stacked on Mobile) */}
      <div className="bg-[#FFFBF7] p-3 sm:p-3.5 rounded-2xl sm:rounded-3xl border border-[#EEDDCC] shadow-xs flex flex-col md:flex-row items-stretch md:items-center gap-2.5 sm:gap-3">
        <div className="relative flex-1 w-full min-w-0">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A5C4A] pointer-events-none" />
          <input
            type="text"
            placeholder="Search dishes by name or ingredients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 sm:py-2.5 rounded-xl bg-white border border-[#EEDDCC] text-xs font-medium text-[#23120B] focus:outline-none focus:ring-2 focus:ring-[#FE8E2A]/30 min-h-[42px]"
            aria-label="Search dishes"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 shrink-0">
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2 sm:py-2.5 rounded-xl bg-white border border-[#EEDDCC] text-xs font-bold text-[#2B1408] focus:outline-none focus:ring-2 focus:ring-[#FE8E2A]/30 min-h-[42px] cursor-pointer"
            aria-label="Filter by category"
          >
            <option value="ALL">All Categories ({categories.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full sm:w-auto px-3.5 py-2 sm:py-2.5 rounded-xl bg-white border border-[#EEDDCC] text-xs font-bold text-[#2B1408] focus:outline-none focus:ring-2 focus:ring-[#FE8E2A]/30 min-h-[42px] cursor-pointer"
            aria-label="Filter by dish status"
          >
            <option value="ALL">All Dishes ({dishes.length})</option>
            <option value="POPULAR">⭐ Popular on Homepage ({popularDishes.length}/6)</option>
            <option value="BESTSELLER">🔥 Bestsellers</option>
            <option value="AVAILABLE">● Available</option>
            <option value="UNAVAILABLE">○ Sold Out</option>
          </select>
        </div>
      </div>

      {/* 4. Dish Management Grid: 4 columns on desktop / 2-3 on tablet / 1 on mobile */}
      {isLoading ? (
        /* Loading Skeleton matching 4-column layout */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-3.5 sm:gap-4 xl:gap-4 2xl:gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-[#FFFBF7] rounded-2xl sm:rounded-3xl p-3 sm:p-3.5 border border-[#EEDDCC] shadow-xs animate-pulse space-y-2.5"
            >
              <div className="aspect-[16/10] w-full rounded-xl sm:rounded-2xl bg-[#EEDDCC]/50" />
              <div className="h-4 w-3/4 rounded-lg bg-[#EEDDCC]/60" />
              <div className="h-3 w-1/2 rounded-lg bg-[#EEDDCC]/40" />
              <div className="h-8 w-full rounded-lg bg-[#EEDDCC]/30" />
              <div className="h-4 w-1/4 rounded-lg bg-[#EEDDCC]/50" />
              <div className="pt-2 border-t border-[#EEDDCC]/50 flex justify-between">
                <div className="h-7 w-20 rounded-xl bg-[#EEDDCC]/60" />
                <div className="h-7 w-14 rounded-xl bg-[#EEDDCC]/60" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredDishes.length === 0 ? (
        /* Empty State with Clear Filters button */
        <div className="py-12 px-6 bg-[#FFFBF7] rounded-3xl border border-[#EEDDCC] text-center max-w-md mx-auto shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-[#FE8E2A]/10 text-[#FE8E2A] flex items-center justify-center mx-auto mb-3">
            <Search size={22} />
          </div>
          <h3 className="text-base font-bold text-[#2B1408] font-serif">No dishes found</h3>
          <p className="text-xs text-[#7A5C4A] mt-1 mb-4 leading-relaxed">
            No dishes match your active filter or search query.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearch('');
              setFilterCat('ALL');
              setFilterStatus('ALL');
            }}
            className="px-4 py-2 rounded-xl bg-[#FE8E2A] hover:bg-[#E67616] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        /* Dense, Responsive 4-Column Desktop Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-3.5 sm:gap-4 xl:gap-4 2xl:gap-5">
          {filteredDishes.map((dish) => {
            const effectivePrice =
              dish.effectivePrice ??
              (dish.discountEnabled && dish.discountValue
                ? dish.discountType === 'PERCENTAGE'
                  ? Math.max(0, Math.round(dish.price * (1 - dish.discountValue / 100)))
                  : Math.max(0, Math.round(dish.price - dish.discountValue))
                : dish.price);
            const isDiscounted = dish.discountEnabled && effectivePrice < dish.price;
            const isItemPopular = Boolean(dish.isPopular || dish.popular);

            return (
              <div
                key={dish.id}
                className="bg-[#FFFBF7] rounded-2xl sm:rounded-3xl p-3 sm:p-3.5 border border-[#EEDDCC] shadow-xs flex flex-col justify-between hover:shadow-md hover:border-[#FE8E2A]/50 hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <div>
                  {/* Compact Food Image (16:10 aspect ratio) */}
                  <div className="relative aspect-[16/10] w-full rounded-xl sm:rounded-2xl overflow-hidden mb-2.5 bg-[#FDF6EE]">
                    <img
                      src={
                        getOptimizedImageUrl(dish.imageUrl, 'menuCard') ||
                        '/Hero.jpg'
                      }
                      alt={dish.name}
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                      loading="lazy"
                      decoding="async"
                    />

                    {/* Compact Overlay Badges */}
                    <div className="absolute top-2 left-2 flex flex-wrap items-center gap-1 max-w-[calc(100%-16px)]">
                      <div className="bg-white/95 backdrop-blur-xs p-0.5 rounded shadow-xs">
                        <FoodTypeBadge type={dish.foodType} size="sm" />
                      </div>
                      {dish.bestseller && (
                        <span className="px-1.5 py-0.5 rounded bg-[#FE8E2A] text-white text-[9px] sm:text-[9.5px] font-black uppercase flex items-center gap-0.5 shadow-xs">
                          <Flame size={9} className="fill-white" />
                          <span>Bestseller</span>
                        </span>
                      )}
                      {isItemPopular && (
                        <span className="px-1.5 py-0.5 rounded bg-[#2B1408] text-[#FE8E2A] border border-[#FE8E2A]/40 text-[9px] sm:text-[9.5px] font-black uppercase flex items-center gap-0.5 shadow-xs">
                          <Star size={9} className="fill-[#FE8E2A]" />
                          <span>#{dish.popularDisplayOrder || 1} Pop</span>
                        </span>
                      )}
                      {dish.isNew && (
                        <span className="px-1.5 py-0.5 rounded bg-emerald-600 text-white text-[9px] sm:text-[9.5px] font-bold uppercase flex items-center gap-0.5 shadow-xs">
                          <Sparkles size={9} className="fill-white" />
                          <span>New</span>
                        </span>
                      )}
                      {isDiscounted && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-600 text-white text-[9px] sm:text-[9.5px] font-black uppercase shadow-xs">
                          {dish.discountType === 'PERCENTAGE'
                            ? `${dish.discountValue}% OFF`
                            : `₹${dish.discountValue} OFF`}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dish Details */}
                  <div>
                    <h3 className="font-serif font-bold text-sm sm:text-[14.5px] 2xl:text-base text-[#2B1408] line-clamp-1 leading-snug">
                      {dish.name}
                    </h3>

                    <div className="flex items-center gap-1.5 text-[10.5px] sm:text-[11px] text-[#7A5C4A] font-medium truncate mt-0.5">
                      <span className="truncate">{dish.categoryName}</span>
                    </div>

                    {/* Price & Discount Row */}
                    <div className="flex items-baseline gap-1.5 mt-1.5">
                      {isDiscounted ? (
                        <>
                          <span className="text-[15px] sm:text-base font-extrabold text-[#FE8E2A] font-serif">
                            ₹{effectivePrice}
                          </span>
                          <span className="text-[11px] text-[#A89A90] line-through font-semibold">
                            ₹{dish.price}
                          </span>
                          <span className="px-1 py-0.2 rounded bg-[#FE8E2A]/15 text-[#FE8E2A] font-black text-[9px]">
                            {dish.discountType === 'PERCENTAGE'
                              ? `${dish.discountValue}% OFF`
                              : `₹${dish.discountValue} OFF`}
                          </span>
                        </>
                      ) : (
                        <span className="text-[15px] sm:text-base font-extrabold text-[#FE8E2A] font-serif">
                          ₹{dish.price}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-[#7A5C4A] line-clamp-2 mt-1 leading-relaxed">
                      {dish.description || 'No description added.'}
                    </p>
                  </div>
                </div>

                {/* Compact Card Action Footer */}
                <div className="pt-2.5 mt-2.5 border-t border-[#EEDDCC]/70 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1 min-w-0">
                    {/* Available Status Pill */}
                    <button
                      type="button"
                      onClick={() => handleToggleAvailability(dish.id, dish.name)}
                      className={`px-2 py-1 rounded-lg text-[10.5px] font-bold transition-colors cursor-pointer min-h-[32px] shrink-0 ${
                        dish.available
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60'
                          : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/60'
                      }`}
                      aria-label={`Toggle availability for ${dish.name}. Currently ${
                        dish.available ? 'Available' : 'Sold Out'
                      }`}
                    >
                      {dish.available ? '● Available' : '○ Sold Out'}
                    </button>

                    {/* Popular Toggle Button */}
                    <button
                      type="button"
                      disabled={updatingPopularId === dish.id}
                      onClick={() => handleTogglePopular(dish)}
                      className={`px-2 py-1 rounded-lg text-[10.5px] font-bold flex items-center gap-0.5 transition-all cursor-pointer min-h-[32px] shrink-0 disabled:opacity-60 ${
                        isItemPopular
                          ? 'bg-[#2B1408] text-[#FE8E2A] border border-[#FE8E2A]/50 hover:bg-[#381B0E]'
                          : 'bg-white hover:bg-[#F2E5D6]/70 text-[#7A5C4A] border border-[#EEDDCC]'
                      }`}
                      title={
                        isItemPopular
                          ? 'Remove from Homepage Popular'
                          : 'Feature in Homepage Popular'
                      }
                      aria-label={`Toggle popular status for ${dish.name}`}
                    >
                      {updatingPopularId === dish.id ? (
                        <span className="text-[9.5px]">...</span>
                      ) : isItemPopular ? (
                        <>
                          <Star size={10} className="fill-[#FE8E2A] text-[#FE8E2A]" />
                          <span>Popular</span>
                        </>
                      ) : (
                        <>
                          <Star size={10} className="text-[#7A5C4A]" />
                          <span>+ Pop</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Edit & Delete Action Buttons */}
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditModal(dish)}
                      className="w-8 h-8 rounded-lg text-[#7A5C4A] hover:text-[#2B1408] hover:bg-[#F2E5D6] transition-colors flex items-center justify-center cursor-pointer min-h-[32px] min-w-[32px]"
                      title="Edit Dish"
                      aria-label={`Edit ${dish.name}`}
                    >
                      <Edit2 size={13.5} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(dish)}
                      className="w-8 h-8 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors flex items-center justify-center cursor-pointer min-h-[32px] min-w-[32px]"
                      title="Delete Dish"
                      aria-label={`Delete ${dish.name}`}
                    >
                      <Trash2 size={13.5} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Dish Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="lg"
        title={editingDish ? 'Edit Menu Dish' : 'Add New Menu Dish'}
      >
        <form onSubmit={handleSaveDish} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#2B1408] block mb-1">Dish Name *</label>
              <input
                type="text"
                placeholder="e.g. Alfredo Pasta (Chicken)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EEDDCC] text-xs font-medium text-[#23120B] focus:outline-none focus:ring-2 focus:ring-[#FE8E2A]/30"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#2B1408] block mb-1">Category *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EEDDCC] text-xs font-medium text-[#23120B] focus:outline-none focus:ring-2 focus:ring-[#FE8E2A]/30"
                required
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#2B1408] block mb-1">Price (₹) *</label>
              <input
                type="number"
                step="1"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EEDDCC] text-xs font-medium text-[#23120B] focus:outline-none focus:ring-2 focus:ring-[#FE8E2A]/30"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#2B1408] block mb-1">Food Type *</label>
              <select
                value={foodType}
                onChange={(e) => setFoodType(e.target.value as FoodType)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EEDDCC] text-xs font-medium text-[#23120B] focus:outline-none focus:ring-2 focus:ring-[#FE8E2A]/30"
              >
                <option value="VEG">🟢 Veg</option>
                <option value="NON_VEG">🔴 Non-Veg</option>
                <option value="EGG">🟠 Egg</option>
              </select>
            </div>
          </div>

          {/* Item Promotional Discount Section */}
          <div className="p-3.5 rounded-2xl bg-[#FDF6EE] border border-[#EEDDCC] space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-extrabold text-[#2B1408]">
                  <input
                    type="checkbox"
                    checked={discountEnabled}
                    onChange={(e) => setDiscountEnabled(e.target.checked)}
                    className="w-4 h-4 rounded text-[#FE8E2A] focus:ring-[#FE8E2A]"
                  />
                  <span>Dish Discount</span>
                </label>
                <p className="text-[11px] text-[#7A5C4A] mt-0.5 ml-6">
                  Offer a percentage or fixed amount discount on this menu item.
                </p>
              </div>
              <span
                className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-wider uppercase ${
                  discountEnabled
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-[#F2E5D6] text-[#7A5C4A]'
                }`}
              >
                {discountEnabled ? 'ON' : 'OFF'}
              </span>
            </div>

            {discountEnabled && (
              <div className="pt-3 border-t border-[#EEDDCC] space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#2B1408] block mb-1">
                      Discount Type
                    </label>
                    <select
                      value={discountType}
                      onChange={(e) => setDiscountType(e.target.value as 'PERCENTAGE' | 'FIXED')}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#EEDDCC] text-xs font-semibold text-[#23120B] focus:outline-none focus:ring-2 focus:ring-[#FE8E2A]/30"
                    >
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FIXED">Fixed Amount (₹)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-[#2B1408] block mb-1">
                      {discountType === 'PERCENTAGE' ? 'Discount Percentage (%)' : 'Discount Amount (₹)'}
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={discountType === 'PERCENTAGE' ? 100 : Number(price) - 1}
                      value={discountValue}
                      onChange={(e) => setDiscountValue(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-[#EEDDCC] text-xs font-bold text-[#23120B] focus:outline-none focus:ring-2 focus:ring-[#FE8E2A]/30"
                    />
                  </div>
                </div>

                {/* Live Price Preview */}
                {(() => {
                  const base = Number(price) || 0;
                  const val = Number(discountValue) || 0;
                  const discountAmt =
                    discountType === 'PERCENTAGE'
                      ? Math.round(((base * val) / 100) * 100) / 100
                      : val;
                  const finalPrice = Math.max(0, Math.round((base - discountAmt) * 100) / 100);
                  return (
                    <div className="p-2.5 sm:p-3 rounded-xl bg-[#FFFBF7] border border-[#EEDDCC] flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1.5">
                      <span className="font-bold text-[#7A5C4A]">Discount Preview:</span>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[#7A5C4A]">
                          Original: <span className="line-through text-[#A89A90] font-semibold">₹{base}</span>
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                          You Save: ₹{discountAmt} ({discountType === 'PERCENTAGE' ? `${val}%` : `₹${val}`})
                        </span>
                        <span className="text-sm font-black text-[#FE8E2A] font-serif">
                          Final Price: ₹{finalPrice}
                        </span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </div>

          <div>
            <label className="text-xs font-bold text-[#2B1408] block mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Describe the flavors, ingredients, sauces, and cooking style..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-xl bg-white border border-[#EEDDCC] text-xs font-medium text-[#23120B] focus:outline-none focus:ring-2 focus:ring-[#FE8E2A]/30"
            />
          </div>

          {/* Image Upload & URL */}
          <div>
            <label className="text-xs font-bold text-[#2B1408] block mb-1">
              Dish Photo (Upload to Cloudinary or Paste URL)
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                placeholder="Paste image URL or upload file below"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full sm:flex-1 px-3.5 py-2.5 rounded-xl bg-white border border-[#EEDDCC] text-xs font-medium text-[#23120B] focus:outline-none focus:ring-2 focus:ring-[#FE8E2A]/30"
              />

              <label className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#FDF6EE] hover:bg-[#F2E5D6] text-[#2B1408] border border-[#EEDDCC] text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shrink-0">
                <Upload size={14} />
                <span>{isUploading ? 'Uploading...' : 'Upload File'}</span>
                <input
                  type="file"
                  accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.avif,.heic"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>
            </div>
            {imageUrl && (
              <div className="mt-2 flex items-center gap-3">
                <div className="w-20 h-16 rounded-lg overflow-hidden border border-[#EEDDCC] bg-[#FDF6EE]">
                  <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setImageUrl('');
                    setImagePublicId('');
                  }}
                  className="text-xs text-red-600 hover:text-red-700 font-bold hover:underline"
                >
                  Remove Photo
                </button>
              </div>
            )}
          </div>

          {/* Toggles */}
          <div className="pt-2 border-t border-[#EEDDCC] space-y-3">
            <div className="flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#2B1408]">
                <input
                  type="checkbox"
                  checked={available}
                  onChange={(e) => setAvailable(e.target.checked)}
                  className="w-4 h-4 rounded text-[#FE8E2A] focus:ring-[#FE8E2A]"
                />
                <span>Available in Menu</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#2B1408]">
                <input
                  type="checkbox"
                  checked={bestseller}
                  onChange={(e) => setBestseller(e.target.checked)}
                  className="w-4 h-4 rounded text-[#FE8E2A] focus:ring-[#FE8E2A]"
                />
                <span>Mark as Bestseller (Menu Badge)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#2B1408]">
                <input
                  type="checkbox"
                  checked={isNew}
                  onChange={(e) => setIsNew(e.target.checked)}
                  className="w-4 h-4 rounded text-[#FE8E2A] focus:ring-[#FE8E2A]"
                />
                <span>Mark as New Item</span>
              </label>
            </div>

            {/* Homepage Popular Section Control */}
            <div className="p-3.5 rounded-2xl bg-[#FDF6EE] border border-[#EEDDCC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-extrabold text-[#2B1408]">
                  <input
                    type="checkbox"
                    checked={isPopular}
                    onChange={(e) => {
                      if (
                        e.target.checked &&
                        dishes.filter((d) => d.isPopular && d.id !== editingDish?.id).length >= 6
                      ) {
                        toastError('You can feature up to 6 dishes on the homepage.');
                        return;
                      }
                      setIsPopular(e.target.checked);
                    }}
                    className="w-4 h-4 rounded text-[#FE8E2A] focus:ring-[#FE8E2A]"
                  />
                  <Star size={13} className="text-[#FE8E2A] fill-[#FE8E2A]" />
                  <span>Feature in "Popular at Tryit" (Homepage)</span>
                </label>
                <p className="text-[11px] text-[#7A5C4A] mt-0.5 ml-6">
                  Independent of bestseller badge. Controls placement on customer homepage (max 6).
                </p>
              </div>

              {isPopular && (
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <label className="text-xs font-bold text-[#2B1408] whitespace-nowrap">
                    Display Order:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="6"
                    value={popularDisplayOrder}
                    onChange={(e) => setPopularDisplayOrder(Number(e.target.value))}
                    className="w-16 px-2.5 py-1.5 rounded-xl bg-white border border-[#EEDDCC] text-xs font-bold text-center text-[#23120B] focus:outline-none focus:ring-2 focus:ring-[#FE8E2A]/30"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#EEDDCC] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-xl text-[#7A5C4A] hover:bg-[#F2E5D6] text-xs font-bold cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="px-6 py-2.5 rounded-xl bg-[#FE8E2A] hover:bg-[#E67616] text-white text-xs font-bold shadow-md shadow-[#FE8E2A]/20 active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Saving...' : editingDish ? 'Update Dish' : 'Create Dish'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Remove Dish from Menu"
        message={`Are you sure you want to remove "${deleteTarget?.name}"? It will no longer appear on the customer menu or popular section.`}
        confirmText="Remove Dish"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDeleteDish}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};
