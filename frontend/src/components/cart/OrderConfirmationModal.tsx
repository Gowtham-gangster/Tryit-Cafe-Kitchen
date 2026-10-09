import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageCircle,
  AlertCircle,
  Edit3,
  MapPin,
  Home,
  Briefcase,
  Package,
  Plus,
  Truck,
  CheckCircle2,
  Loader2,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  Store,
} from 'lucide-react';
import { CartItem, OrderPreviewResponse, OrderType, User } from '../../types';
import { Modal } from '../common/Modal';
import { dispatchWhatsAppOrder } from '../../utils/whatsapp';
import { FoodTypeBadge } from '../common/FoodTypeBadge';
import { OrderItemRow } from './OrderItemRow';
import { WhatsAppIcon } from '../common/BrandIcons';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useAuthStore } from '../../store/useAuthStore';
import { useMenuStore } from '../../store/useMenuStore';
import { customerApi } from '../../api/customerApi';
import {
  calculateDeliveryCharge,
  calculateHaversineDistanceKm,
  formatDeliveryFee,
  formatDistance,
  DEFAULT_CAFE_LATITUDE,
  DEFAULT_CAFE_LONGITUDE,
  DEFAULT_FREE_DELIVERY_DISTANCE_KM,
  DEFAULT_DELIVERY_RATE_PER_KM,
} from '../../services/distanceService';
import { useToastStore } from '../../store/useToastStore';
import { DeliveryLocationPicker, ConfirmedLocationData } from '../location/DeliveryLocationPicker';

export type CheckoutStep = 'orderType' | 'location' | 'review';

const DEFAULT_CAFE_ADDRESS =
  'Back side Union Bank, H No 3-127/2, Hyderabad – Narsapur Rd, Gandi Maisamma, Hyderabad';

interface OrderConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  instructions: string;
  cravingText?: string;
  customer: User | null;
  whatsappNumber?: string;
  cafeName: string;
  onOrderPlaced: () => void;
  onBackToCart?: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  isOpen,
  onClose,
  items,
  instructions: initialInstructions,
  cravingText = '',
  customer,
  whatsappNumber,
  cafeName,
  onOrderPlaced,
  onBackToCart,
}) => {
  const { settings, isOnlineOrderingOpen, getClosureMessage } = useSettingsStore();
  const { locations, defaultLocation, addLocation, openAuthModal, isAuthenticated, fetchLocations } =
    useAuthStore();
  const { success, error: toastError } = useToastStore();

  const orderingOpen = isOnlineOrderingOpen();
  const closureMessage = getClosureMessage();

  // Active step in checkout workflow: orderType -> location -> review
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('orderType');

  // Order type: DELIVERY vs TAKEAWAY (Pickup)
  const [orderType, setOrderType] = useState<OrderType>('DELIVERY');

  // Selected Location ID
  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);

  // Authoritative Backend Preview State
  const [preview, setPreview] = useState<OrderPreviewResponse | null>(null);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Special instructions (editable in review step)
  const [instructions, setInstructions] = useState(initialInstructions);

  // Inline Add Location State (when user clicks "+ Add New Address")
  const [isAddLocationOpen, setIsAddLocationOpen] = useState(false);
  const [isSavingLocation, setIsSavingLocation] = useState(false);

  // Reset state whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('orderType');
      setIsAddLocationOpen(false);
      setPreviewError(null);
      setInstructions(initialInstructions);
      if (isAuthenticated && locations.length === 0) {
        fetchLocations();
      }
    }
  }, [isOpen, isAuthenticated, fetchLocations, locations.length, initialInstructions]);

  // Auto-select default or first saved location
  useEffect(() => {
    if (isSavingLocation) return;
    if (locations.length > 0) {
      if (!selectedLocationId || !locations.some((l) => l.id === selectedLocationId)) {
        const initialLoc = defaultLocation || locations[0];
        setSelectedLocationId(initialLoc.id);
      }
    } else {
      setSelectedLocationId(null);
    }
  }, [locations, defaultLocation, isOpen, isSavingLocation, selectedLocationId]);

  // Selected Location Object
  const selectedLocation = locations.find((l) => l.id === selectedLocationId) || null;

  // Cafe Coordinates & Delivery Rule from business configuration
  const cafeLat = settings?.cafeLatitude ?? DEFAULT_CAFE_LATITUDE;
  const cafeLon = settings?.cafeLongitude ?? DEFAULT_CAFE_LONGITUDE;
  const freeDist = settings?.freeDeliveryDistanceKm ?? DEFAULT_FREE_DELIVERY_DISTANCE_KM;
  const ratePerKm = settings?.deliveryRatePerKm ?? DEFAULT_DELIVERY_RATE_PER_KM;
  const cafeAddress = settings?.address?.trim() || DEFAULT_CAFE_ADDRESS;
  const directionsUrl =
    settings?.googleMapsLink ||
    `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      'Tryit Cafe & Kitchen Gandi Maisamma Hyderabad'
    )}`;

  // Local fallback calculation for immediate UI reactivity
  const localDistanceKm =
    orderType === 'DELIVERY' && selectedLocation
      ? calculateHaversineDistanceKm(cafeLat, cafeLon, selectedLocation.latitude, selectedLocation.longitude)
      : 0;

  const localDeliveryCharge =
    orderType === 'DELIVERY' ? calculateDeliveryCharge(localDistanceKm, freeDist, ratePerKm) : 0;

  const subtotal = items.reduce((sum, ci) => {
    const price = ci.item.effectivePrice ?? ci.item.price;
    return sum + price * ci.quantity;
  }, 0);
  const totalCount = items.reduce((sum, ci) => sum + ci.quantity, 0);

  // Fetch Authoritative Backend Order Preview
  const fetchBackendPreview = async (overrideLocationId?: string, overrideOrderType?: OrderType) => {
    if (!isAuthenticated) return;
    const activeOrderType = overrideOrderType ?? orderType;
    const activeLocId = overrideLocationId !== undefined ? overrideLocationId : selectedLocationId;

    if (activeOrderType === 'DELIVERY' && !activeLocId) return;

    setIsLoadingPreview(true);
    setPreviewError(null);

    try {
      // Resolve item IDs against live menu to protect against stale dev database UUIDs
      const liveMenuItems = useMenuStore.getState().menuItems;
      const previewItems = items.map((ci) => {
        const liveMatch = liveMenuItems.find(
          (m) =>
            m.id === ci.item.id ||
            (m.slug && ci.item.slug && m.slug === ci.item.slug) ||
            m.name.trim().toLowerCase() === ci.item.name.trim().toLowerCase()
        );
        return {
          menuItemId: liveMatch ? liveMatch.id : ci.item.id,
          quantity: ci.quantity,
        };
      });

      const resp = await customerApi.previewOrder({
        orderType: activeOrderType,
        locationId: activeOrderType === 'DELIVERY' ? activeLocId || undefined : undefined,
        items: previewItems,
        instructions,
        cravingText,
      });
      setPreview(resp);
    } catch (err: any) {
      const status = err.response?.status;
      const errorMsg = err.response?.data?.message || err.message;
      if (status === 401 || status === 403) {
        setPreviewError('Your session has expired. Please sign in again to continue.');
      } else if (
        errorMsg &&
        (errorMsg.includes('unavailable') ||
          errorMsg.includes('closed') ||
          errorMsg.includes('Cart cannot be empty'))
      ) {
        setPreviewError(errorMsg);
      } else {
        // Log sync warning without showing confusing delivery fee error when local delivery calculation already succeeded
        console.warn('Backend order preview sync warning:', errorMsg);
        setPreviewError(null);
      }
    } finally {
      setIsLoadingPreview(false);
    }
  };

  useEffect(() => {
    if (isOpen && orderingOpen) {
      fetchBackendPreview();
    }
  }, [isOpen, orderType, selectedLocationId, items.length]);

  // Handle Location Confirmed from DeliveryLocationPicker
  const handleLocationConfirmed = async (data: ConfirmedLocationData) => {
    if (isSavingLocation) return;

    if (!isAuthenticated) {
      openAuthModal('login', 'Sign in to continue with your order');
      return;
    }

    setIsSavingLocation(true);

    try {
      const created = await addLocation({
        label: data.label,
        address: data.address,
        latitude: data.latitude,
        longitude: data.longitude,
        houseFlat: data.houseFlat,
        buildingName: data.buildingName,
        street: data.street,
        area: data.area,
        landmark: data.landmark,
        city: data.city,
        state: data.state,
        postalCode: data.postalCode,
        isDefault: locations.length === 0,
      });

      if (created) {
        success('Delivery address saved!');
        setSelectedLocationId(created.id);
        setIsAddLocationOpen(false);

        // Fetch backend preview and advance directly to Order Review
        setPreview(null);
        await fetchBackendPreview(created.id, 'DELIVERY');
        setCurrentStep('review');
      } else {
        const errorMsg =
          useAuthStore.getState().error ||
          "We couldn't save this address. Please try again.";
        toastError(errorMsg);
      }
    } catch (err: any) {
      toastError("We couldn't save this address. Please try again.");
    } finally {
      setIsSavingLocation(false);
    }
  };

  // Determine effective numbers for display
  const isPreviewMatchingSelected =
    orderType === 'TAKEAWAY' || preview?.location?.id === selectedLocation?.id;

  const effectiveDistance =
    isPreviewMatchingSelected && preview?.distanceKm !== undefined
      ? preview.distanceKm
      : localDistanceKm;

  const effectiveDeliveryCharge =
    orderType === 'DELIVERY'
      ? isPreviewMatchingSelected && preview?.deliveryCharge !== undefined
        ? preview.deliveryCharge
        : localDeliveryCharge
      : 0;

  const effectiveSubtotal =
    isPreviewMatchingSelected && preview?.subtotal !== undefined
      ? preview.subtotal
      : subtotal;

  const effectiveTotal =
    isPreviewMatchingSelected && preview?.total !== undefined
      ? preview.total
      : effectiveSubtotal + (orderType === 'DELIVERY' ? effectiveDeliveryCharge : 0);

  // Dispatch to WhatsApp
  const handleContinueToWhatsApp = () => {
    if (!orderingOpen) return;

    if (!isAuthenticated) {
      openAuthModal('login', 'Sign in to continue with your order');
      return;
    }

    if (orderType === 'DELIVERY' && !selectedLocation) {
      setPreviewError('Please select a valid delivery address before proceeding.');
      return;
    }

    const finalLocation = orderType === 'DELIVERY' ? selectedLocation : null;
    const finalDist = orderType === 'DELIVERY' ? effectiveDistance : 0;
    const finalDeliveryCharge = orderType === 'DELIVERY' ? effectiveDeliveryCharge : 0;
    const finalSubtotal = effectiveSubtotal;
    const finalTotal = effectiveTotal;

    const result = dispatchWhatsAppOrder({
      items,
      instructions,
      cravingText,
      customer,
      whatsappNumber,
      cafeName,
      onlineOrderingEnabled: orderingOpen,
      orderType,
      location: finalLocation,
      distanceKm: finalDist,
      deliveryCharge: finalDeliveryCharge,
      authoritativeSubtotal: finalSubtotal,
      authoritativeTotal: finalTotal,
    });

    if (!result.success) {
      toastError(
        result.error || 'WhatsApp ordering is temporarily unavailable. Please try again later.'
      );
      return;
    }

    onOrderPlaced();
    onClose();
  };

  const getLocationIcon = (lbl: string) => {
    switch (lbl?.toLowerCase()) {
      case 'work':
        return <Briefcase size={15} className="text-[#2B1408]" />;
      case 'other':
        return <Package size={15} className="text-[#7A5C4A]" />;
      case 'home':
      default:
        return <Home size={15} className="text-[#FE8E2A]" />;
    }
  };

  const handleBackNavigation = () => {
    if (currentStep === 'review') {
      setCurrentStep('location');
    } else if (currentStep === 'location') {
      if (isAddLocationOpen && locations.length > 0) {
        setIsAddLocationOpen(false);
      } else {
        setCurrentStep('orderType');
      }
    } else if (currentStep === 'orderType') {
      if (onBackToCart) {
        onBackToCart();
      } else {
        onClose();
      }
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      maxWidth="4xl"
      fullHeightMobile={true}
      bodyClassName="p-4 sm:p-6 overflow-y-auto flex-1 min-h-0"
      title={
        <div className="flex items-center gap-2">
          <span className="font-serif font-black text-[#2B1408] text-base sm:text-lg">
            Checkout
          </span>
          <span className="text-[11px] font-bold text-[#7A5C4A] bg-[#FBEFE1] px-2 py-0.5 rounded-full">
            {totalCount} {totalCount === 1 ? 'item' : 'items'}
          </span>
        </div>
      }
    >
      <div className="space-y-4">
        {/* ====================================================== */}
        {/* PROGRESS STEPPER (✓ Cart -> Order Type -> Location -> Review) */}
        {/* ====================================================== */}
        <div className="flex items-center justify-between px-3 py-2.5 rounded-2xl bg-[#FBEFE1]/70 border border-[#EEDDCC] text-xs">
          {/* Step 1: Cart (Always Completed) */}
          <button
            type="button"
            onClick={onBackToCart}
            className="flex items-center gap-1.5 font-bold text-emerald-700 hover:text-emerald-800 transition cursor-pointer shrink-0"
            title="Return to Cart"
          >
            <div className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-[10px] text-emerald-700 font-extrabold">
              ✓
            </div>
            <span className="text-[11px] sm:text-xs">Cart</span>
          </button>

          <ChevronRight size={13} className="text-[#A89284] shrink-0" />

          {/* Step 2: Order Type */}
          <button
            type="button"
            onClick={() => setCurrentStep('orderType')}
            className={`flex items-center gap-1.5 font-bold transition shrink-0 ${
              currentStep === 'orderType'
                ? 'text-[#FE8E2A] cursor-default'
                : 'text-emerald-700 hover:text-emerald-800 cursor-pointer'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                currentStep === 'orderType'
                  ? 'bg-[#FE8E2A] text-white shadow-xs'
                  : 'bg-emerald-100 border border-emerald-300 text-emerald-700'
              }`}
            >
              {currentStep !== 'orderType' ? '✓' : '2'}
            </div>
            <span className="text-[11px] sm:text-xs">Order Type</span>
          </button>

          <ChevronRight size={13} className="text-[#A89284] shrink-0" />

          {/* Step 3: Location / Pickup */}
          <button
            type="button"
            disabled={currentStep === 'orderType'}
            onClick={() => {
              if (currentStep === 'review') setCurrentStep('location');
            }}
            className={`flex items-center gap-1.5 font-bold transition shrink-0 ${
              currentStep === 'location'
                ? 'text-[#FE8E2A] cursor-default'
                : currentStep === 'review'
                ? 'text-emerald-700 hover:text-emerald-800 cursor-pointer'
                : 'text-[#A89284] cursor-not-allowed opacity-75'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                currentStep === 'location'
                  ? 'bg-[#FE8E2A] text-white shadow-xs'
                  : currentStep === 'review'
                  ? 'bg-emerald-100 border border-emerald-300 text-emerald-700'
                  : 'bg-[#EEDDCC] text-[#7A5C4A]'
              }`}
            >
              {currentStep === 'review' ? '✓' : '3'}
            </div>
            <span className="text-[11px] sm:text-xs">
              {orderType === 'DELIVERY' ? 'Location' : 'Pickup'}
            </span>
          </button>

          <ChevronRight size={13} className="text-[#A89284] shrink-0" />

          {/* Step 4: Review */}
          <div
            className={`flex items-center gap-1.5 font-bold shrink-0 ${
              currentStep === 'review' ? 'text-[#FE8E2A]' : 'text-[#A89284] opacity-75'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-extrabold ${
                currentStep === 'review'
                  ? 'bg-[#FE8E2A] text-white shadow-xs'
                  : 'bg-[#EEDDCC] text-[#7A5C4A]'
              }`}
            >
              4
            </div>
            <span className="text-[11px] sm:text-xs">Review</span>
          </div>
        </div>

        {/* Global Online Ordering Closed Notice */}
        {!orderingOpen && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-950 space-y-1">
            <span className="font-bold flex items-center gap-1.5 text-rose-900">
              <AlertCircle size={15} className="text-rose-600" />
              Online Ordering is Currently Closed
            </span>
            <p className="text-rose-800 leading-tight text-[11px]">
              {closureMessage || "We'll be back soon! Orders cannot be dispatched at this moment."}
            </p>
          </div>
        )}

        {/* ====================================================== */}
        {/* STEP 1: ORDER TYPE UI (Delivery vs Pickup)             */}
        {/* ====================================================== */}
        {currentStep === 'orderType' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="space-y-4"
          >
            <div className="text-center sm:text-left">
              <h3 className="text-base sm:text-lg font-black text-[#2B1408] font-serif">
                How would you like to receive your order?
              </h3>
              <p className="text-xs text-[#7A5C4A] mt-0.5">
                Choose delivery to your address or collect directly from Tryit Cafe & Kitchen.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Delivery Option */}
              <button
                type="button"
                onClick={() => setOrderType('DELIVERY')}
                className={`p-4 rounded-2xl border-2 text-left flex items-start gap-3.5 transition cursor-pointer relative ${
                  orderType === 'DELIVERY'
                    ? 'border-[#FE8E2A] bg-[#FBEFE1] shadow-xs'
                    : 'border-[#EEDDCC] hover:border-[#FE8E2A]/50 bg-white hover:bg-[#FFFDFB]'
                }`}
              >
                <div
                  className={`p-3 rounded-2xl shrink-0 transition-colors ${
                    orderType === 'DELIVERY'
                      ? 'bg-[#FE8E2A] text-white shadow-xs'
                      : 'bg-[#FDF6EE] text-[#FE8E2A]'
                  }`}
                >
                  <Truck size={24} />
                </div>
                <div className="flex-1 min-w-0 pr-6">
                  <span className="text-sm font-extrabold text-[#2B1408] block">
                    DELIVERY
                  </span>
                  <span className="text-xs text-[#7A5C4A] leading-relaxed block mt-1">
                    Delivered to your doorstep
                  </span>
                  <span className="inline-block mt-2.5 text-[10px] font-bold text-[#FE8E2A] bg-white px-2.5 py-0.5 rounded-full border border-[#EEDDCC]">
                    Direct to doorstep
                  </span>
                </div>

                {/* Orange Selected Indicator */}
                <div className="absolute top-4 right-4">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      orderType === 'DELIVERY'
                        ? 'border-[#FE8E2A] bg-[#FE8E2A] text-white'
                        : 'border-[#EEDDCC] bg-white'
                    }`}
                  >
                    {orderType === 'DELIVERY' && <span className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </div>
              </button>

              {/* Pickup Option */}
              <button
                type="button"
                onClick={() => setOrderType('TAKEAWAY')}
                className={`p-4 rounded-2xl border-2 text-left flex items-start gap-3.5 transition cursor-pointer relative ${
                  orderType === 'TAKEAWAY'
                    ? 'border-[#FE8E2A] bg-[#FBEFE1] shadow-xs'
                    : 'border-[#EEDDCC] hover:border-[#FE8E2A]/50 bg-white hover:bg-[#FFFDFB]'
                }`}
              >
                <div
                  className={`p-3 rounded-2xl shrink-0 transition-colors ${
                    orderType === 'TAKEAWAY'
                      ? 'bg-[#FE8E2A] text-white shadow-xs'
                      : 'bg-[#FDF6EE] text-[#FE8E2A]'
                  }`}
                >
                  <Store size={24} />
                </div>
                <div className="flex-1 min-w-0 pr-6">
                  <span className="text-sm font-extrabold text-[#2B1408] block">
                    PICKUP
                  </span>
                  <span className="text-xs text-[#7A5C4A] leading-relaxed block mt-1">
                    I'll collect it from the cafe
                  </span>
                  <span className="inline-block mt-2.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    ₹0 Delivery Fee
                  </span>
                </div>

                {/* Orange Selected Indicator */}
                <div className="absolute top-4 right-4">
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      orderType === 'TAKEAWAY'
                        ? 'border-[#FE8E2A] bg-[#FE8E2A] text-white'
                        : 'border-[#EEDDCC] bg-white'
                    }`}
                  >
                    {orderType === 'TAKEAWAY' && <span className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </div>
              </button>
            </div>

            {/* Step 1 Actions */}
            <div className="pt-2 flex flex-col-reverse sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={handleBackNavigation}
                className="w-full sm:w-1/3 py-3 rounded-2xl text-[#7A5C4A] hover:bg-[#F2E5D6] font-bold text-xs transition cursor-pointer min-h-[48px] flex items-center justify-center gap-1.5"
              >
                <ArrowLeft size={15} />
                <span>Back to Cart</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (orderType === 'DELIVERY') {
                    setCurrentStep('location');
                  } else {
                    setCurrentStep('review');
                  }
                }}
                className="w-full sm:w-2/3 py-3.5 rounded-2xl bg-[#FE8E2A] hover:bg-[#E67616] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#FE8E2A]/25 active:scale-98 transition cursor-pointer min-h-[48px]"
              >
                <span>
                  {orderType === 'DELIVERY'
                    ? 'Continue to Delivery Location →'
                    : 'Continue to Order Review →'}
                </span>
              </button>
            </div>
          </motion.div>
        )}

        {/* ====================================================== */}
        {/* STEP 2: LOCATION METHOD & DELIVERY ADDRESS FLOW        */}
        {/* ====================================================== */}
        {currentStep === 'location' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="space-y-4"
          >
            {orderType === 'DELIVERY' ? (
              <div>
                {/* CASE A: No saved addresses OR user clicked "+ Add New Address" */}
                {locations.length === 0 || isAddLocationOpen ? (
                  <div className="p-3 sm:p-4 rounded-2xl border border-[#EEDDCC] bg-white shadow-xs">
                    <DeliveryLocationPicker
                      cafeLatitude={cafeLat}
                      cafeLongitude={cafeLon}
                      freeDeliveryDistanceKm={freeDist}
                      deliveryRatePerKm={ratePerKm}
                      onLocationConfirmed={handleLocationConfirmed}
                      onCancel={() => {
                        if (locations.length > 0) {
                          setIsAddLocationOpen(false);
                        } else {
                          setCurrentStep('orderType');
                        }
                      }}
                      isSaving={isSavingLocation}
                    />
                  </div>
                ) : (
                  /* CASE B: Returning customer with saved addresses */
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm sm:text-base font-black text-[#2B1408] font-serif flex items-center gap-1.5">
                          <MapPin size={16} className="text-[#FE8E2A]" />
                          <span>Saved Addresses</span>
                        </h3>
                        <p className="text-[11px] text-[#7A5C4A]">
                          Select your delivery address or add a new one.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setIsAddLocationOpen(true)}
                        className="px-3 py-1.5 rounded-xl bg-[#FE8E2A]/10 hover:bg-[#FE8E2A]/20 text-[#FE8E2A] font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                      >
                        <Plus size={13} />
                        <span>+ Add New Address</span>
                      </button>
                    </div>

                    {/* Active Selected Location Summary Card */}
                    {selectedLocation && (
                      <div className="p-3.5 rounded-2xl bg-[#FFFDFB] border-2 border-[#FE8E2A]/60 shadow-xs space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-[#2B1408] flex items-center gap-1.5">
                            <CheckCircle2 size={15} className="text-emerald-600" />
                            <span>Selected Delivery Address</span>
                          </span>
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#FBEFE1] text-[#FE8E2A] border border-[#EEDDCC]">
                            {formatDistance(effectiveDistance)} away
                          </span>
                        </div>

                        <div className="p-3 rounded-xl bg-white border border-[#EEDDCC] flex items-start justify-between gap-2.5">
                          <div className="flex items-start gap-2.5 flex-1 min-w-0">
                            <div className="p-2 rounded-xl bg-[#FDF6EE] shrink-0 mt-0.5 border border-[#EEDDCC]">
                              {getLocationIcon(selectedLocation.label)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-xs font-extrabold text-[#2B1408] block">
                                {selectedLocation.label || 'Home'}
                              </span>
                              <p className="text-xs text-[#7A5C4A] mt-1 leading-snug">
                                {selectedLocation.address}
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsAddLocationOpen(true)}
                            className="text-xs font-bold text-[#FE8E2A] hover:underline p-1 shrink-0 cursor-pointer"
                          >
                            Edit
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Saved Addresses Cards */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#7A5C4A] block">
                        Saved Addresses ({locations.length})
                      </span>
                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {locations.map((loc) => {
                          const isSelected = selectedLocationId === loc.id;
                          const locDist = calculateHaversineDistanceKm(cafeLat, cafeLon, loc.latitude, loc.longitude);
                          const locCharge = calculateDeliveryCharge(locDist, freeDist, ratePerKm);

                          return (
                            <div
                              key={loc.id}
                              onClick={() => {
                                setSelectedLocationId(loc.id);
                                setPreview(null);
                              }}
                              className={`p-3 rounded-2xl border text-left flex items-start justify-between gap-3 transition cursor-pointer ${
                                isSelected
                                  ? 'border-[#FE8E2A] bg-[#FBEFE1] shadow-xs ring-1 ring-[#FE8E2A]/30'
                                  : 'border-[#EEDDCC] hover:border-[#FE8E2A]/40 bg-white'
                              }`}
                            >
                              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                                <div className="p-2 rounded-xl bg-[#FDF6EE] shrink-0 mt-0.5 border border-[#EEDDCC]/60">
                                  {getLocationIcon(loc.label)}
                                </div>
                                <div className="truncate flex-1 min-w-0">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-extrabold text-[#2B1408]">
                                      {loc.label || 'Home'}
                                    </span>
                                    {loc.isDefault && (
                                      <span className="px-1.5 py-0.5 rounded bg-amber-100 text-[10px] font-black text-amber-800">
                                        Default
                                      </span>
                                    )}
                                    <span className="text-[10px] font-medium text-[#7A5C4A]">
                                      • {formatDistance(locDist)} away
                                    </span>
                                  </div>
                                  <p className="text-xs text-[#7A5C4A] line-clamp-2 mt-1 leading-snug">
                                    {loc.address}
                                  </p>
                                </div>
                              </div>

                              <div className="pt-1 shrink-0">
                                <div
                                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                    isSelected ? 'border-[#FE8E2A] bg-[#FE8E2A] text-white' : 'border-[#EEDDCC]'
                                  }`}
                                >
                                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Step 2 Actions for Saved Address */}
                    <div className="pt-2 flex flex-col-reverse sm:flex-row items-center gap-2.5">
                      <button
                        type="button"
                        onClick={handleBackNavigation}
                        className="w-full sm:w-1/3 py-3 rounded-2xl text-[#7A5C4A] hover:bg-[#F2E5D6] font-bold text-xs transition cursor-pointer min-h-[48px] flex items-center justify-center gap-1.5"
                      >
                        <ArrowLeft size={15} />
                        <span>Back to Order Type</span>
                      </button>

                      <button
                        type="button"
                        disabled={!selectedLocation}
                        onClick={() => setCurrentStep('review')}
                        className="w-full sm:w-2/3 py-3.5 rounded-2xl bg-[#FE8E2A] hover:bg-[#E67616] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#FE8E2A]/25 active:scale-98 transition cursor-pointer min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span>Continue to Order Review</span>
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* PICKUP FLOW: CAFE LOCATION SUMMARY */
              <div className="space-y-3.5">
                <div className="text-center sm:text-left">
                  <h3 className="text-base font-black text-[#2B1408] font-serif flex items-center gap-2">
                    <Store size={18} className="text-[#FE8E2A]" />
                    <span>Pickup from Tryit Cafe & Kitchen</span>
                  </h3>
                  <p className="text-xs text-[#7A5C4A] mt-0.5">
                    Your order will be prepared fresh and packed for collection at the cafe counter.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#EEDDCC] shadow-xs space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-[#FBEFE1] text-[#FE8E2A] shrink-0 mt-0.5 border border-[#EEDDCC]">
                      <MapPin size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-extrabold text-[#2B1408] block mb-0.5">
                        Cafe Address
                      </span>
                      <p className="text-xs text-[#7A5C4A] leading-relaxed">
                        {cafeAddress}
                      </p>
                      <span className="inline-block mt-2 text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Delivery Fee: ₹0 (FREE)
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#EEDDCC]/70">
                    <a
                      href={directionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-4 rounded-xl bg-[#FDF6EE] hover:bg-[#FBEFE1] text-[#FE8E2A] font-bold text-xs flex items-center justify-center gap-1.5 border border-[#EEDDCC] transition min-h-[42px]"
                    >
                      <ExternalLink size={14} />
                      <span>Get Directions</span>
                    </a>
                  </div>
                </div>

                <div className="pt-2 flex flex-col-reverse sm:flex-row items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleBackNavigation}
                    className="w-full sm:w-1/3 py-3 rounded-2xl text-[#7A5C4A] hover:bg-[#F2E5D6] font-bold text-xs transition cursor-pointer min-h-[48px] flex items-center justify-center gap-1.5"
                  >
                    <ArrowLeft size={15} />
                    <span>Back to Order Type</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setCurrentStep('review')}
                    className="w-full sm:w-2/3 py-3.5 rounded-2xl bg-[#FE8E2A] hover:bg-[#E67616] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#FE8E2A]/25 active:scale-98 transition cursor-pointer min-h-[48px]"
                  >
                    <span>Continue to Order Review</span>
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ====================================================== */}
        {/* STEP 3: ORDER REVIEW & WHATSAPP ORDER DISPATCH         */}
        {/* ====================================================== */}
        {currentStep === 'review' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-[#2B1408] font-serif">
                  Review Your Order
                </h3>
                <p className="text-[11px] text-[#7A5C4A]">
                  Review items, delivery details, and send via WhatsApp
                </p>
              </div>
            </div>

            {/* Destination Summary Card with [Change] button */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#EEDDCC] flex items-start justify-between gap-3 shadow-xs">
              <div className="flex items-start gap-2.5 flex-1 min-w-0">
                <div className="p-2 rounded-xl bg-[#FBEFE1] text-[#FE8E2A] shrink-0 mt-0.5 border border-[#EEDDCC]">
                  {orderType === 'DELIVERY' ? <Truck size={17} /> : <Store size={17} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-[#FE8E2A] bg-[#FBEFE1] px-2 py-0.5 rounded">
                      {orderType === 'DELIVERY' ? 'DELIVERY' : 'PICKUP'}
                    </span>
                    {orderType === 'DELIVERY' && selectedLocation && (
                      <span className="text-xs font-bold text-[#2B1408]">
                        [{selectedLocation.label || 'Home'}]
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#7A5C4A] mt-1 leading-snug">
                    {orderType === 'DELIVERY'
                      ? selectedLocation?.address
                      : cafeAddress}
                  </p>
                  {orderType === 'DELIVERY' && selectedLocation && (
                    <p className="text-[11px] font-bold text-[#2B1408] mt-1">
                      {formatDistance(effectiveDistance)} away •{' '}
                      <span className={effectiveDeliveryCharge === 0 ? 'text-emerald-700' : 'text-[#FE8E2A]'}>
                        {effectiveDeliveryCharge === 0 ? '✓ Free delivery' : `Delivery fee: ${formatDeliveryFee(effectiveDeliveryCharge)}`}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* Change button only available for DELIVERY (Pickup address is fixed at the cafe) */}
              {orderType === 'DELIVERY' && (
                <button
                  type="button"
                  onClick={() => setCurrentStep('location')}
                  className="text-xs font-bold text-[#FE8E2A] hover:text-[#E67616] p-1.5 rounded-lg hover:bg-[#FDF6EE] transition cursor-pointer shrink-0"
                >
                  Change
                </button>
              )}
            </div>

            {/* Selected Items Breakdown */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs font-bold text-[#2B1408]">
                <span className="uppercase tracking-wider text-[#7A5C4A] text-[11px]">
                  Order Items
                </span>
                <span>
                  {totalCount} {totalCount === 1 ? 'Item' : 'Items'}
                </span>
              </div>

              <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                {items.map((ci) => (
                  <OrderItemRow
                    key={ci.item.id}
                    item={ci.item}
                    quantity={ci.quantity}
                    variant="review"
                  />
                ))}
              </div>
            </div>

            {/* Special Instructions Note */}
            <div className="p-3 rounded-2xl bg-white border border-[#EEDDCC] space-y-1.5">
              <label className="font-bold text-[#2B1408] flex items-center gap-1.5 text-xs">
                <Edit3 size={13} className="text-[#FE8E2A]" />
                <span>Special Instructions</span>
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Any instructions for your order? Optional (e.g. Less spicy, Call when you arrive)"
                rows={2}
                className="w-full p-2.5 rounded-xl bg-[#FFFDFB] border border-[#EEDDCC] text-xs text-[#2B1408] focus:outline-none focus:ring-2 focus:ring-[#FE8E2A]/50 placeholder:text-[#A89284] resize-none"
              />
            </div>

            {/* Price Calculation Summary */}
            <div className="bg-[#FDF6EE] p-4 rounded-2xl border border-[#EEDDCC] space-y-2 text-xs">
              <div className="flex items-center justify-between text-[#7A5C4A]">
                <span>Items Subtotal</span>
                <span className="font-bold text-[#2B1408]">₹{effectiveSubtotal.toFixed(2)}</span>
              </div>

              {orderType === 'DELIVERY' && selectedLocation && (
                <>
                  <div className="flex items-center justify-between text-[#7A5C4A]">
                    <span className="flex items-center gap-1">
                      <span>Delivery Distance</span>
                      {isLoadingPreview && <Loader2 size={11} className="animate-spin text-[#7A5C4A]" />}
                    </span>
                    <span className="font-bold text-[#2B1408]">{formatDistance(effectiveDistance)}</span>
                  </div>

                  <div className="flex items-center justify-between text-[#7A5C4A]">
                    <span>Delivery Fee</span>
                    <span
                      className={`font-black ${
                        effectiveDeliveryCharge <= 0 ? 'text-emerald-600' : 'text-[#2B1408]'
                      }`}
                    >
                      {effectiveDeliveryCharge <= 0 ? 'FREE' : formatDeliveryFee(effectiveDeliveryCharge)}
                    </span>
                  </div>
                </>
              )}

              {orderType === 'TAKEAWAY' && (
                <div className="flex items-center justify-between text-[#7A5C4A]">
                  <span>Delivery Fee</span>
                  <span className="font-bold text-emerald-600">FREE</span>
                </div>
              )}

              <div className="pt-2 border-t border-[#EEDDCC] flex items-center justify-between text-[#2B1408]">
                <span className="text-sm font-extrabold">Total Estimate</span>
                <span className="text-xl font-black text-[#FE8E2A] font-serif">
                  ₹{effectiveTotal.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Error Feedback if any */}
            {previewError && (
              <p className="text-xs text-rose-800 bg-rose-50 p-2.5 rounded-xl border border-rose-200 font-medium">
                {previewError}
              </p>
            )}

            {/* Final Order Button */}
            <div className="pt-2 flex flex-col-reverse sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={handleBackNavigation}
                className="w-full sm:w-1/3 py-3 rounded-2xl text-[#7A5C4A] hover:bg-[#F2E5D6] font-bold text-xs transition cursor-pointer min-h-[48px] flex items-center justify-center gap-1.5"
              >
                <ArrowLeft size={15} />
                <span>Back</span>
              </button>

              {orderingOpen ? (
                <button
                  type="button"
                  disabled={orderType === 'DELIVERY' && !selectedLocation}
                  onClick={handleContinueToWhatsApp}
                  className="w-full sm:w-2/3 py-3.5 rounded-2xl bg-[#FE8E2A] hover:bg-[#E67616] text-white font-extrabold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-[#FE8E2A]/25 active:scale-98 transition cursor-pointer min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <WhatsAppIcon size={20} className="text-white shrink-0" />
                  <span>Order on WhatsApp →</span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled
                  aria-disabled="true"
                  className="w-full sm:w-2/3 py-3.5 rounded-2xl bg-[#EEDDCC] text-[#7A5C4A] font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed select-none min-h-[48px]"
                >
                  <AlertCircle size={16} className="text-rose-500" />
                  <span>Ordering Closed</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </Modal>
  );
};
