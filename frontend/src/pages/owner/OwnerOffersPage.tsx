import React, { useEffect, useRef, useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Tag,
  Sparkles,
  Upload,
  X,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  Check,
  Percent,
  IndianRupee,
  Eye,
} from 'lucide-react';
import { DiscountType, Offer } from '../../types';
import { ownerApi } from '../../api/ownerApi';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { useToastStore } from '../../store/useToastStore';
import { useMenuStore } from '../../store/useMenuStore';
import { normalizeImageUrl, getOptimizedImageUrl } from '../../utils/imageUrl';

export const OwnerOffersPage: React.FC = () => {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { success, error: toastError } = useToastStore();
  const { fetchAllPublicData } = useMenuStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);

  // Delete Confirmation State
  const [deleteTargetOffer, setDeleteTargetOffer] = useState<Offer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [badgeText, setBadgeText] = useState('SPECIAL DEAL');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<DiscountType>('FLAT_AMOUNT');
  const [discountValue, setDiscountValue] = useState<number | string>(50);
  const [minOrderAmount, setMinOrderAmount] = useState<number | string>(300);
  const [bannerImageUrl, setBannerImageUrl] = useState('');
  const [bannerPublicId, setBannerPublicId] = useState('');
  const [active, setActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(1);

  // Upload & Drag State
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form Submission & Inline Validation
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadOffers = async () => {
    setIsLoading(true);
    try {
      const data = await ownerApi.getOffers();
      setOffers(data);
    } catch (e) {
      console.error(e);
      toastError('Failed to load promotional offers.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const openAddModal = () => {
    setEditingOffer(null);
    setTitle('');
    setBadgeText('SPECIAL COMBO');
    setDescription('');
    setDiscountType('FLAT_AMOUNT');
    setDiscountValue(50);
    setMinOrderAmount(250);
    setBannerImageUrl('');
    setBannerPublicId('');
    setActive(true);
    setDisplayOrder(offers.length + 1);
    setImageError(null);
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (o: Offer) => {
    setEditingOffer(o);
    setTitle(o.title);
    setBadgeText((o.badgeText || 'SPECIAL DEAL').toUpperCase());
    setDescription(o.description || '');
    setDiscountType(
      o.discountType === 'PERCENTAGE' ? 'PERCENTAGE' : 'FLAT_AMOUNT'
    );
    setDiscountValue(o.discountValue ?? 50);
    setMinOrderAmount(o.minOrderAmount ?? 0);
    setBannerImageUrl(o.bannerImageUrl || '');
    setBannerPublicId(o.bannerPublicId || '');
    setActive(o.active);
    setDisplayOrder(o.displayOrder);
    setImageError(null);
    setErrors({});
    setIsModalOpen(true);
  };

  // Image Selection & Validation
  const handleFileChange = async (file?: File) => {
    if (!file) return;
    setImageError(null);

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      setImageError('Unsupported image format. Allowed formats: JPG, PNG, WebP.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setImageError('Image must be smaller than 10 MB.');
      return;
    }

    setIsUploadingImage(true);
    try {
      const res = await ownerApi.uploadMedia(file, 'offers');
      setBannerImageUrl(res.url);
      setBannerPublicId(res.publicId);
      success('Banner image uploaded successfully!');
    } catch (err: any) {
      setImageError(err.response?.data?.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setBannerImageUrl('');
    setBannerPublicId('');
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Form Validation
  const validateForm = () => {
    const errs: { [key: string]: string } = {};

    if (!title.trim()) {
      errs.title = 'Offer title cannot be empty.';
    }

    if (!description.trim()) {
      errs.description = 'Description cannot be empty.';
    }

    const val = Number(discountValue);
    if (discountValue === '' || isNaN(val)) {
      errs.discountValue = 'Please enter a valid discount value.';
    } else if (val <= 0) {
      errs.discountValue = 'Discount value must be greater than 0.';
    } else if (discountType === 'PERCENTAGE' && val > 100) {
      errs.discountValue = 'Percentage discount cannot exceed 100%.';
    }

    const minOrder = Number(minOrderAmount);
    if (minOrderAmount !== '' && !isNaN(minOrder) && minOrder < 0) {
      errs.minOrderAmount = 'Minimum order value cannot be negative.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const payload: Partial<Offer> = {
        title: title.trim(),
        badgeText: badgeText.trim().toUpperCase() || undefined,
        description: description.trim(),
        discountType,
        discountValue: Number(discountValue),
        minOrderAmount: Number(minOrderAmount) || 0,
        bannerImageUrl: bannerImageUrl.trim() || '',
        bannerPublicId: bannerPublicId.trim() || '',
        active,
        displayOrder: Number(displayOrder),
      };

      if (editingOffer) {
        await ownerApi.updateOffer(editingOffer.id, payload);
        success(`"${title}" offer updated successfully!`);
      } else {
        await ownerApi.createOffer(payload);
        success(`"${title}" offer created and published!`);
      }

      setIsModalOpen(false);
      await loadOffers();
      fetchAllPublicData(true);
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to save offer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (id: string, offerTitle: string) => {
    try {
      const updated = await ownerApi.toggleOfferStatus(id);
      success(`"${offerTitle}" is now ${updated.active ? 'Active' : 'Paused'}.`);
      await loadOffers();
      fetchAllPublicData(true);
    } catch (e) {
      toastError('Failed to update status');
    }
  };

  const confirmDelete = async () => {
    if (!deleteTargetOffer) return;
    setIsDeleting(true);
    try {
      await ownerApi.deleteOffer(deleteTargetOffer.id);
      success(`"${deleteTargetOffer.title}" deleted successfully.`);
      setDeleteTargetOffer(null);
      if (isModalOpen && editingOffer?.id === deleteTargetOffer.id) {
        setIsModalOpen(false);
      }
      await loadOffers();
      fetchAllPublicData(true);
    } catch (e) {
      toastError('Failed to delete offer.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Normalized discount badge string for live previews
  const previewDiscountBadge =
    discountType === 'PERCENTAGE'
      ? `${Number(discountValue) || 0}% OFF`
      : `₹${Number(discountValue) || 0} OFF`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2B1408] font-serif">
            Promotions & Offers
          </h1>
          <p className="text-xs sm:text-sm text-[#7A5C4A] mt-1">
            Create discount deals and promotional banners displayed on the customer landing page.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#FE8E2A] hover:bg-[#E67616] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-[#FE8E2A]/20 active:scale-95 transition-all min-h-[48px] sm:min-h-[44px] cursor-pointer"
        >
          <Plus size={16} />
          <span>Add New Offer</span>
        </button>
      </div>

      {/* Offers Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="p-6 rounded-3xl bg-[#FFFBF7] border border-[#EEDDCC] animate-pulse space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="w-24 h-5 rounded-full bg-amber-200/50" />
                <div className="w-16 h-5 rounded-full bg-amber-200/50" />
              </div>
              <div className="w-48 h-6 rounded-md bg-amber-200/50" />
              <div className="w-full h-10 rounded-md bg-amber-200/30" />
              <div className="w-full h-6 rounded-md bg-amber-200/40" />
            </div>
          ))}
        </div>
      ) : offers.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-[#FFFBF7] border border-[#EEDDCC] space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-[#FE8E2A]/10 text-[#FE8E2A] flex items-center justify-center">
            <Tag size={26} />
          </div>
          <h3 className="font-serif font-bold text-lg text-[#2B1408]">No Promotions Yet</h3>
          <p className="text-xs text-[#7A5C4A] max-w-sm mx-auto">
            Create combo deals, weekend specials, or percentage discounts to attract customers.
          </p>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FE8E2A] hover:bg-[#E67616] text-white text-xs font-bold shadow-md shadow-[#FE8E2A]/20 active:scale-95 transition-all cursor-pointer min-h-[44px]"
          >
            <Plus size={16} />
            <span>Create First Offer</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {offers.map((offer) => {
            const displayDiscount =
              offer.discountType === 'PERCENTAGE'
                ? `${offer.discountValue}% OFF`
                : `₹${offer.discountValue} OFF`;

            return (
              <div
                key={offer.id}
                className="p-5 sm:p-6 rounded-3xl bg-[#FFFBF7] border border-[#EEDDCC] shadow-xs flex flex-col justify-between hover:shadow-md hover:border-[#FE8E2A]/40 transition-all relative overflow-hidden group"
              >
                {/* Banner Thumbnail (if available) */}
                {offer.bannerImageUrl && (
                  <div className="mb-4 aspect-[16/7] w-full rounded-2xl overflow-hidden bg-[#2B1408] border border-[#EEDDCC] relative shadow-2xs">
                    <img
                      src={getOptimizedImageUrl(offer.bannerImageUrl, 'offerBanner')}
                      alt={offer.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute bottom-2.5 left-3 text-white text-xs font-extrabold flex items-center gap-1.5 drop-shadow-sm">
                      <span className="px-2 py-0.5 rounded-md bg-[#FE8E2A] text-white text-[11px] font-black">
                        {displayDiscount}
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="px-3 py-1 rounded-full bg-[#FBEFE1] text-[#2B1408] border border-[#EEDDCC] text-[10px] font-extrabold tracking-wider uppercase flex items-center gap-1">
                      <Sparkles size={11} className="text-[#FE8E2A]" />
                      <span>{offer.badgeText || 'SPECIAL DEAL'}</span>
                    </span>

                    <button
                      onClick={() => handleToggleStatus(offer.id, offer.title)}
                      className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase transition-colors cursor-pointer ${
                        offer.active
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-stone-100 text-stone-500 border border-stone-200'
                      }`}
                    >
                      {offer.active ? '● Active' : '○ Paused'}
                    </button>
                  </div>

                  <h3 className="font-serif font-bold text-lg text-[#2B1408] mb-1 leading-snug">
                    {offer.title}
                  </h3>
                  <p className="text-xs text-[#7A5C4A] leading-relaxed mb-4 line-clamp-2">
                    {offer.description || 'No description provided.'}
                  </p>

                  <div className="flex items-center justify-between text-xs font-semibold text-[#7A5C4A] py-2.5 border-y border-[#EEDDCC]/70">
                    <span>
                      {offer.minOrderAmount && offer.minOrderAmount > 0 ? (
                        <>Min Order: <strong className="text-[#2B1408]">₹{offer.minOrderAmount}</strong></>
                      ) : (
                        'No Min Order'
                      )}
                    </span>
                    <span className="text-[#FE8E2A] font-bold font-serif text-sm">
                      {displayDiscount}
                    </span>
                  </div>
                </div>

                <div className="pt-4 mt-2 flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => openEditModal(offer)}
                    className="p-2.5 rounded-xl text-[#7A5C4A] hover:text-[#2B1408] hover:bg-[#FBEFE1] active:bg-[#EBDBC9] transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
                    aria-label={`Edit ${offer.title}`}
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => setDeleteTargetOffer(offer)}
                    className="p-2.5 rounded-xl text-red-500 hover:text-red-700 hover:bg-red-50 active:bg-red-100 transition-colors cursor-pointer min-w-[40px] min-h-[40px] flex items-center justify-center"
                    aria-label={`Delete ${offer.title}`}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================== */}
      {/* PROMOTION ADD / EDIT MODAL                                     */}
      {/* ============================================================== */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        maxWidth="lg"
        title={editingOffer ? 'Edit Promotion' : 'Create New Promotion'}
      >
        <form onSubmit={handleSave} className="space-y-4 sm:space-y-5">
          {/* Section: Basic Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Offer Title */}
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-[#2B1408] block mb-1">
                Offer Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Combo Craving Deal"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl bg-white border text-xs font-medium text-[#2B1408] focus:outline-none focus:ring-2 focus:ring-[#FE8E2A]/30 ${
                  errors.title ? 'border-red-400' : 'border-[#EEDDCC]'
                }`}
                required
              />
              <p className="text-[11px] text-[#7A5C4A]/80 mt-1">
                Main title displayed to customers on banners and offer cards.
              </p>
              {errors.title && (
                <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.title}
                </p>
              )}
            </div>

            {/* Offer Badge */}
            <div>
              <label className="text-xs font-bold text-[#2B1408] block mb-1">
                Offer Badge
              </label>
              <input
                type="text"
                placeholder="e.g. SPECIAL COMBO, LIMITED TIME"
                value={badgeText}
                onChange={(e) => setBadgeText(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EEDDCC] text-xs font-medium uppercase tracking-wider text-[#2B1408] focus:outline-none focus:ring-2 focus:ring-[#FE8E2A]/30"
              />
              <p className="text-[11px] text-[#7A5C4A]/80 mt-1">
                Short pill label shown on top of the offer card (automatically converted to uppercase).
              </p>
            </div>

            {/* Discount Type */}
            <div>
              <label className="text-xs font-bold text-[#2B1408] block mb-1">
                Discount Type *
              </label>
              <select
                value={discountType}
                onChange={(e) => {
                  const newType = e.target.value as DiscountType;
                  setDiscountType(newType);
                  if (newType === 'PERCENTAGE' && Number(discountValue) > 100) {
                    setDiscountValue(10);
                  }
                  if (errors.discountValue) {
                    setErrors((prev) => ({ ...prev, discountValue: '' }));
                  }
                }}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EEDDCC] text-xs font-medium text-[#2B1408] focus:outline-none focus:ring-2 focus:ring-[#FE8E2A]/30"
              >
                <option value="FLAT_AMOUNT">Flat Amount (₹)</option>
                <option value="PERCENTAGE">Percentage (%)</option>
              </select>
              <p className="text-[11px] text-[#7A5C4A]/80 mt-1">
                {discountType === 'PERCENTAGE'
                  ? 'Percentage: Customer gets a % discount on order subtotal.'
                  : 'Flat Amount: Customer gets a fixed rupee discount.'}
              </p>
            </div>

            {/* Discount Value */}
            <div>
              <label className="text-xs font-bold text-[#2B1408] block mb-1">
                Discount Value *
              </label>
              <div className="relative">
                {discountType === 'FLAT_AMOUNT' && (
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#7A5C4A]">
                    ₹
                  </span>
                )}
                <input
                  type="number"
                  min="0"
                  max={discountType === 'PERCENTAGE' ? 100 : undefined}
                  step="1"
                  placeholder={discountType === 'PERCENTAGE' ? '10' : '50'}
                  value={discountValue}
                  onChange={(e) => {
                    setDiscountValue(e.target.value);
                    if (errors.discountValue) {
                      setErrors((prev) => ({ ...prev, discountValue: '' }));
                    }
                  }}
                  className={`w-full py-2.5 rounded-xl bg-white border text-xs font-bold text-[#2B1408] focus:outline-none focus:ring-2 focus:ring-[#FE8E2A]/30 ${
                    discountType === 'FLAT_AMOUNT' ? 'pl-8 pr-3.5' : 'pl-3.5 pr-8'
                  } ${errors.discountValue ? 'border-red-400' : 'border-[#EEDDCC]'}`}
                  required
                />
                {discountType === 'PERCENTAGE' && (
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#7A5C4A]">
                    %
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#7A5C4A]/80 mt-1">
                {discountType === 'PERCENTAGE'
                  ? 'Enter discount percentage between 1% and 100%.'
                  : 'Enter fixed rupee discount amount.'}
              </p>
              {errors.discountValue && (
                <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.discountValue}
                </p>
              )}
            </div>

            {/* Minimum Order */}
            <div>
              <label className="text-xs font-bold text-[#2B1408] block mb-1">
                Minimum Order (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#7A5C4A]">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="300"
                  value={minOrderAmount}
                  onChange={(e) => {
                    setMinOrderAmount(e.target.value);
                    if (errors.minOrderAmount) {
                      setErrors((prev) => ({ ...prev, minOrderAmount: '' }));
                    }
                  }}
                  className={`w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-white border text-xs font-medium text-[#2B1408] focus:outline-none focus:ring-2 focus:ring-[#FE8E2A]/30 ${
                    errors.minOrderAmount ? 'border-red-400' : 'border-[#EEDDCC]'
                  }`}
                />
              </div>
              <p className="text-[11px] text-[#7A5C4A]/80 mt-1">
                Minimum cart value required to apply this offer (0 for no minimum).
              </p>
              {errors.minOrderAmount && (
                <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.minOrderAmount}
                </p>
              )}
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-[#2B1408] block mb-1">
                Description *
              </label>
              <textarea
                rows={2}
                placeholder="e.g. Get Flat ₹50 OFF on any 2 Pastas or Rice Bowls ordered together!"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (errors.description) {
                    setErrors((prev) => ({ ...prev, description: '' }));
                  }
                }}
                className={`w-full p-3 rounded-xl bg-white border text-xs font-medium text-[#2B1408] focus:outline-none focus:ring-2 focus:ring-[#FE8E2A]/30 ${
                  errors.description ? 'border-red-400' : 'border-[#EEDDCC]'
                }`}
                required
              />
              <p className="text-[11px] text-[#7A5C4A]/80 mt-1">
                Explain the promotion terms clearly to customers.
              </p>
              {errors.description && (
                <p className="text-xs text-red-600 font-semibold mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.description}
                </p>
              )}
            </div>
          </div>

          {/* Section: Banner Image Upload & Preview (No Raw URLs shown) */}
          <div className="pt-2 border-t border-[#EEDDCC]/70">
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#2B1408]">
                Banner Image
              </label>
              <span className="text-[11px] text-[#7A5C4A]">JPG, PNG or WebP · Max 5MB</span>
            </div>

            {bannerImageUrl ? (
              /* Image Preview Mode */
              <div className="space-y-2.5">
                <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden border border-[#EEDDCC] bg-[#1E0D05] shadow-xs group">
                  <img
                    src={normalizeImageUrl(bannerImageUrl)}
                    alt="Offer Banner Preview"
                    className="w-full h-full object-cover"
                  />
                  {/* Quick Remove Button Overlay */}
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/60 hover:bg-black/85 text-white flex items-center justify-center transition-colors cursor-pointer"
                    title="Remove banner image"
                    aria-label="Remove banner image"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingImage}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#FBEFE1] border border-[#EEDDCC] text-xs font-bold text-[#2B1408] flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 min-h-[38px]"
                  >
                    <Upload size={14} className="text-[#FE8E2A]" />
                    <span>{isUploadingImage ? 'Uploading...' : 'Replace Image'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={isUploadingImage}
                    className="px-3.5 py-2 rounded-xl bg-red-50 hover:bg-red-100 border border-red-200 text-xs font-bold text-red-600 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 min-h-[38px]"
                  >
                    <Trash2 size={14} />
                    <span>Remove Image</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Dropzone Upload Mode */
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  const file = e.dataTransfer.files?.[0];
                  if (file) handleFileChange(file);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`p-6 sm:p-7 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
                  isDragging
                    ? 'border-[#FE8E2A] bg-[#FE8E2A]/5'
                    : 'border-[#EEDDCC] bg-[#FFFBF7] hover:border-[#FE8E2A]/50 hover:bg-[#FDF6EE]'
                } ${isUploadingImage ? 'pointer-events-none opacity-60' : ''}`}
              >
                <div className="w-11 h-11 rounded-2xl bg-[#FE8E2A]/10 text-[#FE8E2A] flex items-center justify-center mb-2 shadow-2xs">
                  {isUploadingImage ? (
                    <RefreshCw size={20} className="animate-spin text-[#FE8E2A]" />
                  ) : (
                    <Upload size={20} />
                  )}
                </div>

                <p className="text-xs sm:text-sm font-bold text-[#2B1408]">
                  {isUploadingImage ? 'Uploading image to storage...' : 'Upload Banner Image'}
                </p>
                <p className="text-[11px] text-[#7A5C4A] mt-0.5">
                  Click to select file or drag and drop image here
                </p>
                <p className="text-[10px] text-[#A89284] mt-1 font-mono">
                  JPG, PNG or WebP · Max 5MB
                </p>
              </div>
            )}

            {/* Hidden native file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileChange(file);
              }}
              accept="image/*,.jpg,.jpeg,.png,.webp,.gif,.avif,.heic"
              className="hidden"
            />

            {imageError && (
              <p className="text-xs text-red-600 font-semibold mt-1.5 flex items-center gap-1">
                <AlertCircle size={13} />
                <span>{imageError}</span>
              </p>
            )}
          </div>

          {/* Section: Live Customer Preview */}
          <div className="pt-2 border-t border-[#EEDDCC]/70">
            <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-[#2B1408]">
              <Eye size={14} className="text-[#FE8E2A]" />
              <span>Customer Live Preview</span>
            </div>

            <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-[#2B1408] via-[#381B0E] to-[#1E0D05] border border-[#FE8E2A]/30 text-white p-4 sm:p-5 relative shadow-md">
              {bannerImageUrl && (
                <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
                  <img
                    src={normalizeImageUrl(bannerImageUrl)}
                    alt=""
                    className="w-full h-full object-cover opacity-20"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#1E0D05]/95 via-[#2B1408]/85 to-[#1E0D05]/95" />
                </div>
              )}

              <div className="relative z-10 flex items-center justify-between gap-2 mb-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/15 text-[#FFFBF7] text-[10.5px] font-extrabold uppercase tracking-wider backdrop-blur-md border border-white/15">
                  <Sparkles size={11} className="text-[#FE8E2A]" />
                  <span>{badgeText.trim() || 'SPECIAL DEAL'}</span>
                </span>

                <span className="px-2.5 py-0.5 rounded-lg bg-gradient-to-r from-[#FE8E2A] to-[#E67616] text-white text-xs font-black shadow-sm">
                  {previewDiscountBadge}
                </span>
              </div>

              {/* Customer Live Preview Dedicated Banner */}
              {bannerImageUrl && (
                <div className="relative z-10 mb-2.5 aspect-[16/8] sm:aspect-[16/7] w-full rounded-xl overflow-hidden bg-[#1E0D05] border border-white/10 shadow-xs shrink-0">
                  <img
                    src={normalizeImageUrl(bannerImageUrl)}
                    alt={title.trim() || 'Offer Banner'}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                </div>
              )}

              <div className="relative z-10 mb-2">
                <h4 className="font-serif font-bold text-base sm:text-lg text-white leading-tight">
                  {title.trim() || 'Your Offer Title'}
                </h4>
                <p className="text-xs text-[#E5D5C5] mt-1 line-clamp-2 leading-relaxed">
                  {description.trim() || 'Offer description will appear here as you type...'}
                </p>
              </div>

              <div className="relative z-10 flex items-center justify-between gap-2 pt-2.5 border-t border-white/15 text-xs">
                <span className="text-[#D8C7BC] font-medium text-[11px]">
                  {Number(minOrderAmount) > 0 ? (
                    <>Min Order: <strong className="text-white">₹{minOrderAmount}</strong></>
                  ) : (
                    'Valid on all orders'
                  )}
                </span>

                <span className="px-3 py-1 rounded-lg bg-[#FE8E2A] text-white text-[11px] font-bold inline-flex items-center gap-1 shadow-xs opacity-90 select-none">
                  <span>Order Now</span>
                  <ArrowRight size={12} />
                </span>
              </div>
            </div>
          </div>

          {/* Active Promotion Checkbox */}
          <div className="pt-2 border-t border-[#EEDDCC]/70">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs font-bold text-[#2B1408]">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="w-4 h-4 rounded text-[#FE8E2A] focus:ring-[#FE8E2A] mt-0.5 cursor-pointer"
              />
              <div>
                <span>Active Promotion</span>
                <p className="text-[11px] text-[#7A5C4A] font-normal mt-0.5 leading-normal">
                  Show this offer to customers on the landing page. Unchecking stores it as a draft without deleting it.
                </p>
              </div>
            </label>
          </div>

          {/* Modal Actions Footer */}
          <div className="pt-4 border-t border-[#EEDDCC] flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
            {editingOffer ? (
              <button
                type="button"
                onClick={() => setDeleteTargetOffer(editingOffer)}
                className="px-4 py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer min-h-[44px]"
              >
                <Trash2 size={14} />
                <span>Delete Offer</span>
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center justify-end gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-[#7A5C4A] hover:bg-[#F2E5D6] text-xs font-bold transition-colors cursor-pointer min-h-[44px] flex items-center justify-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isUploadingImage}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[#FE8E2A] hover:bg-[#E67616] text-white text-xs font-bold shadow-md shadow-[#FE8E2A]/20 active:scale-95 transition-all cursor-pointer disabled:opacity-50 min-h-[44px] flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw size={14} className="animate-spin" />
                    <span>{editingOffer ? 'Updating...' : 'Creating...'}</span>
                  </>
                ) : (
                  <span>{editingOffer ? 'Update Offer' : 'Create Offer'}</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTargetOffer}
        title="Delete this offer?"
        message={`Are you sure you want to delete "${deleteTargetOffer?.title}"? This action will permanently remove this promotion from the cafe.`}
        confirmText="Delete Offer"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTargetOffer(null)}
      />
    </div>
  );
};
