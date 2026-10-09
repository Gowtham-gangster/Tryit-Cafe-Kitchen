import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Navigation,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Home,
  Briefcase,
  Package,
  ArrowLeft,
  ArrowRight,
  Crosshair,
  RefreshCw,
  Layers,
} from 'lucide-react';
import { loadGoogleMapsApi, resetGoogleMapsLoader } from '../../services/googleMapsLoader';
import {
  getCurrentBrowserLocation,
  reverseGeocodeStructured,
  StructuredAddressComponents,
} from '../../services/reverseGeocodeService';
import {
  calculateHaversineDistanceKm,
  calculateDeliveryCharge,
  formatDistance,
  formatDeliveryFee,
  DEFAULT_CAFE_LATITUDE,
  DEFAULT_CAFE_LONGITUDE,
  DEFAULT_FREE_DELIVERY_DISTANCE_KM,
  DEFAULT_DELIVERY_RATE_PER_KM,
} from '../../services/distanceService';

export interface ConfirmedLocationData {
  label: 'Home' | 'Work' | 'Other';
  address: string;
  latitude: number;
  longitude: number;
  houseFlat: string;
  buildingName: string;
  street: string;
  area: string;
  landmark: string;
  city: string;
  state: string;
  postalCode: string;
}

interface DeliveryLocationPickerProps {
  initialLatitude?: number | null;
  initialLongitude?: number | null;
  initialLabel?: 'Home' | 'Work' | 'Other';
  cafeLatitude?: number;
  cafeLongitude?: number;
  freeDeliveryDistanceKm?: number;
  deliveryRatePerKm?: number;
  onLocationConfirmed: (data: ConfirmedLocationData) => Promise<void> | void;
  onCancel?: () => void;
  isSaving?: boolean;
}

// 3 clear, distinct sub-steps:
// 1. method: Choose GPS vs Map
// 2. map: Dedicated Google Map with draggable pin and distance
// 3. address: Structured address form (House/Flat, Landmark, etc.)
type LocationFlowStep = 'method' | 'map' | 'address';

// Modern, high-contrast customer delivery pin for satellite and street views
const createCustomerPinIcon = (maps: any): any => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="44" height="56" viewBox="0 0 44 56">
      <defs>
        <filter id="customerShadow" x="-30%" y="-20%" width="160%" height="150%">
          <feDropShadow dx="0" dy="4" stdDeviation="3.5" flood-color="rgba(0,0,0,0.55)"/>
        </filter>
        <linearGradient id="customerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#FF9800"/>
          <stop offset="100%" stop-color="#E65100"/>
        </linearGradient>
      </defs>
      <!-- Pin Needle Body -->
      <path d="M22 2 C10.95 2 2 10.95 2 22 C2 36.5 22 53 22 53 C22 53 42 36.5 42 22 C42 10.95 33.05 2 22 2 Z" fill="url(#customerGrad)" stroke="#FFFFFF" stroke-width="3" filter="url(#customerShadow)"/>
      <!-- Inner White Disc -->
      <circle cx="22" cy="22" r="10" fill="#FFFFFF"/>
      <!-- Inner Target Ring -->
      <circle cx="22" cy="22" r="5" fill="#E65100"/>
      <!-- Pinpoint Center Dot -->
      <circle cx="22" cy="22" r="1.5" fill="#FFFFFF"/>
    </svg>
  `;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.trim())}`,
    scaledSize: new maps.Size(44, 56),
    anchor: new maps.Point(22, 53),
  };
};

// Distinct TryIt Cafe origin pin with coffee cup badge
const createCafePinIcon = (maps: any): any => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="44" height="54" viewBox="0 0 44 54">
      <defs>
        <filter id="cafeShadow" x="-30%" y="-20%" width="160%" height="150%">
          <feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="rgba(0,0,0,0.6)"/>
        </filter>
        <linearGradient id="cafeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#3D1C06"/>
          <stop offset="100%" stop-color="#1A0A02"/>
        </linearGradient>
      </defs>
      <!-- Cafe Marker Pin -->
      <path d="M22 2 C11.5 2 3 10.5 3 21 C3 34.5 22 51 22 51 C22 51 41 34.5 41 21 C41 10.5 32.5 2 22 2 Z" fill="url(#cafeGrad)" stroke="#FE8E2A" stroke-width="2.5" filter="url(#cafeShadow)"/>
      <!-- Orange Inner Disc -->
      <circle cx="22" cy="21" r="11" fill="#FE8E2A"/>
      <!-- White Coffee Cup Silhouette -->
      <path d="M16 17 h10 v6 a4 4 0 0 1 -4 4 h-2 a4 4 0 0 1 -4 -4 v-6 z" fill="#FFFFFF"/>
      <path d="M26 18 h2 a2 2 0 0 1 2 2 v1 a2 2 0 0 1 -2 2 h-2" fill="none" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round"/>
      <line x1="14" y1="29" x2="28" y2="29" stroke="#FFFFFF" stroke-width="1.8" stroke-linecap="round"/>
    </svg>
  `;
  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg.trim())}`,
    scaledSize: new maps.Size(44, 54),
    anchor: new maps.Point(22, 51),
  };
};

export const DeliveryLocationPicker: React.FC<DeliveryLocationPickerProps> = ({
  initialLatitude,
  initialLongitude,
  initialLabel = 'Home',
  cafeLatitude = DEFAULT_CAFE_LATITUDE,
  cafeLongitude = DEFAULT_CAFE_LONGITUDE,
  freeDeliveryDistanceKm = DEFAULT_FREE_DELIVERY_DISTANCE_KM,
  deliveryRatePerKm = DEFAULT_DELIVERY_RATE_PER_KM,
  onLocationConfirmed,
  onCancel,
  isSaving = false,
}) => {
  // Current step in the location sub-flow
  const [step, setStep] = useState<LocationFlowStep>(() => {
    return initialLatitude && initialLongitude ? 'map' : 'method';
  });

  // Selected Coordinates
  const [selectedLat, setSelectedLat] = useState<number>(initialLatitude ?? cafeLatitude);
  const [selectedLon, setSelectedLon] = useState<number>(initialLongitude ?? cafeLongitude);

  // GPS Detection State
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  // Google Maps Loading & Error State
  const [isMapLoading, setIsMapLoading] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapType, setMapType] = useState<'hybrid' | 'roadmap'>('hybrid');

  // Toggle between Satellite (Hybrid) and Roadmap views
  const handleToggleMapType = () => {
    const nextType = mapType === 'hybrid' ? 'roadmap' : 'hybrid';
    setMapType(nextType);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setMapTypeId(nextType);
    }
  };

  // Reverse Geocode State
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodedAddress, setGeocodedAddress] = useState<string>('');
  const [geocodeNotice, setGeocodeNotice] = useState<string | null>(null);

  // Address Form Fields
  const [label, setLabel] = useState<'Home' | 'Work' | 'Other'>(initialLabel);
  const [houseFlat, setHouseFlat] = useState('');
  const [buildingName, setBuildingName] = useState('');
  const [street, setStreet] = useState('');
  const [area, setArea] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('Hyderabad');
  const [state, setState] = useState('Telangana');
  const [postalCode, setPostalCode] = useState('');

  // Form Validation & Errors
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Track if user has manually edited fields to prevent overwriting on marker drag/click
  const userEditedFieldsRef = useRef<Set<string>>(new Set());

  // Google Maps DOM & API references
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const customerMarkerRef = useRef<any>(null);
  const cafeMarkerRef = useRef<any>(null);
  const cafeInfoWindowRef = useRef<any>(null);

  // Calculated distance & delivery fee from cafe origin
  const distanceKm = calculateHaversineDistanceKm(cafeLatitude, cafeLongitude, selectedLat, selectedLon);
  const deliveryCharge = calculateDeliveryCharge(distanceKm, freeDeliveryDistanceKm, deliveryRatePerKm);

  // Perform Google Maps Reverse Geocoding and auto-populate available fields
  const performReverseGeocode = useCallback(
    async (lat: number, lon: number) => {
      setIsGeocoding(true);
      setGeocodeNotice(null);

      try {
        const components: StructuredAddressComponents = await reverseGeocodeStructured(lat, lon);
        setGeocodedAddress(components.formattedAddress);

        // Auto-fill available details without overwriting user-edited values
        if (!userEditedFieldsRef.current.has('area') && components.area) {
          setArea(components.area);
        }
        if (!userEditedFieldsRef.current.has('street') && components.street) {
          setStreet(components.street);
        }
        if (!userEditedFieldsRef.current.has('city') && components.city) {
          setCity(components.city);
        }
        if (!userEditedFieldsRef.current.has('state') && components.state) {
          setState(components.state);
        }
        if (!userEditedFieldsRef.current.has('postalCode') && components.postalCode) {
          setPostalCode(components.postalCode);
        }
        if (!userEditedFieldsRef.current.has('houseFlat') && components.houseFlat) {
          setHouseFlat(components.houseFlat);
        }
        if (!userEditedFieldsRef.current.has('buildingName') && components.buildingName) {
          setBuildingName(components.buildingName);
        }
        if (!userEditedFieldsRef.current.has('landmark') && components.landmark) {
          setLandmark(components.landmark);
        }
      } catch (_err) {
        setGeocodeNotice('Location pinned. Please enter or review your address details below.');
        setGeocodedAddress(`Coordinates: ${lat.toFixed(4)}, ${lon.toFixed(4)}`);
      } finally {
        setIsGeocoding(false);
      }
    },
    []
  );

  // Initialize Google Maps instance
  const initGoogleMap = useCallback(async () => {
    if (!mapElementRef.current) return;
    setIsMapLoading(true);
    setMapError(null);

    try {
      const maps = await loadGoogleMapsApi();

      if (!mapElementRef.current) return;

      // Create or reuse Google Maps instance
      if (!mapInstanceRef.current) {
        const map = new maps.Map(mapElementRef.current, {
          center: { lat: selectedLat, lng: selectedLon },
          zoom: 17,
          mapTypeId: mapType,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: false,
          rotateControl: false,
          scaleControl: false,
          gestureHandling: 'greedy',
        });

        // Cafe origin pin
        const cafeMarker = new maps.Marker({
          position: { lat: cafeLatitude, lng: cafeLongitude },
          map,
          icon: createCafePinIcon(maps),
          title: 'TryIt Cafe & Kitchen (Origin)',
        });
        const cafeInfo = new maps.InfoWindow({
          content: `
            <div style="font-family: inherit; font-size: 11px; padding: 2px 4px; color: #2B1408;">
              <strong>☕ TryIt Cafe & Kitchen</strong><br/>
              <span style="color: #7A5C4A; font-size: 10px;">Kitchen & Delivery Origin</span>
            </div>
          `,
        });
        cafeMarker.addListener('click', () => {
          cafeInfo.open(map, cafeMarker);
        });
        cafeMarkerRef.current = cafeMarker;
        cafeInfoWindowRef.current = cafeInfo;

        // Customer delivery pin (draggable)
        const customerMarker = new maps.Marker({
          position: { lat: selectedLat, lng: selectedLon },
          map,
          icon: createCustomerPinIcon(maps),
          draggable: true,
          title: 'Your Delivery Location (Drag or click map to move)',
          animation: maps.Animation.DROP,
        });

        // When marker is dragged
        customerMarker.addListener('dragend', (e: any) => {
          if (e.latLng) {
            const lat = e.latLng.lat();
            const lon = e.latLng.lng();
            setSelectedLat(lat);
            setSelectedLon(lon);
            performReverseGeocode(lat, lon);
          }
        });

        customerMarkerRef.current = customerMarker;

        // When map is clicked anywhere, move marker
        map.addListener('click', (e: any) => {
          if (e.latLng) {
            const lat = e.latLng.lat();
            const lon = e.latLng.lng();
            setSelectedLat(lat);
            setSelectedLon(lon);
            customerMarker.setPosition(e.latLng);
            map.panTo(e.latLng);
            performReverseGeocode(lat, lon);
          }
        });

        mapInstanceRef.current = map;
      } else {
        // Map instance already exists, reposition
        const map = mapInstanceRef.current;
        map.panTo({ lat: selectedLat, lng: selectedLon });
        if (customerMarkerRef.current) {
          customerMarkerRef.current.setPosition({ lat: selectedLat, lng: selectedLon });
        }
      }
    } catch (_err) {
      setMapError("Map couldn't be loaded");
    } finally {
      setIsMapLoading(false);
    }
  }, [selectedLat, selectedLon, cafeLatitude, cafeLongitude, performReverseGeocode]);

  // Load Google Map when in 'map' step
  useEffect(() => {
    if (step === 'map') {
      initGoogleMap();
    } else {
      if (mapInstanceRef.current) {
        mapInstanceRef.current = null;
        customerMarkerRef.current = null;
        cafeMarkerRef.current = null;
      }
    }
  }, [step, initGoogleMap]);

  // Handle GPS "Use Current Location"
  const handleUseCurrentLocation = async () => {
    setIsDetectingGps(true);
    setGpsError(null);
    setGeocodeNotice(null);

    try {
      const coords = await getCurrentBrowserLocation();
      setSelectedLat(coords.latitude);
      setSelectedLon(coords.longitude);

      // Transition to dedicated Google Maps location confirmation screen
      setStep('map');

      // Reverse geocode detected GPS coordinates
      await performReverseGeocode(coords.latitude, coords.longitude);
    } catch (err: any) {
      setGpsError(
        err.message || "Couldn't access your location. You can choose on the map or enter details manually."
      );
    } finally {
      setIsDetectingGps(false);
    }
  };

  // Handle "Choose on Map"
  const handleChooseOnMap = () => {
    setGpsError(null);
    setSelectedLat(cafeLatitude);
    setSelectedLon(cafeLongitude);
    setStep('map');
    performReverseGeocode(cafeLatitude, cafeLongitude);
  };

  // Recenter Google Map on selected delivery pin
  const handleRecenterOnPin = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo({ lat: selectedLat, lng: selectedLon });
      mapInstanceRef.current.setZoom(16);
    }
  };

  // Locate user GPS while inside interactive map view
  const handleLocateMeInMap = async () => {
    setIsDetectingGps(true);
    setGpsError(null);
    try {
      const coords = await getCurrentBrowserLocation();
      setSelectedLat(coords.latitude);
      setSelectedLon(coords.longitude);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.panTo({ lat: coords.latitude, lng: coords.longitude });
        mapInstanceRef.current.setZoom(16);
      }
      if (customerMarkerRef.current) {
        customerMarkerRef.current.setPosition({ lat: coords.latitude, lng: coords.longitude });
      }
      await performReverseGeocode(coords.latitude, coords.longitude);
    } catch (err: any) {
      setGpsError(err.message || 'Unable to access device GPS.');
    } finally {
      setIsDetectingGps(false);
    }
  };

  // Handle Retry Map loading if failed
  const handleRetryMap = () => {
    resetGoogleMapsLoader();
    setMapError(null);
    initGoogleMap();
  };

  // Track field edits to avoid losing manual entries
  const handleFieldChange = (field: string, setter: (val: string) => void, val: string) => {
    userEditedFieldsRef.current.add(field);
    setter(val);
    if (formErrors[field]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Explicitly refresh fields from pinned coordinates
  const handleRefreshFromPin = () => {
    userEditedFieldsRef.current.clear();
    performReverseGeocode(selectedLat, selectedLon);
  };

  // Validate address form (ALL fields are strictly required)
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!houseFlat.trim()) {
      errors.houseFlat = 'House / Flat number is required';
    }
    if (!buildingName.trim()) {
      errors.buildingName = 'Building / Apartment name is required';
    }
    if (!street.trim()) {
      errors.street = 'Street / Road is required';
    }
    if (!area.trim()) {
      errors.area = 'Area / Locality is required';
    }
    if (!landmark.trim()) {
      errors.landmark = 'Nearby location / landmark is required';
    }
    if (!city.trim()) {
      errors.city = 'City is required';
    }
    if (!state.trim()) {
      errors.state = 'State is required';
    }
    if (!postalCode.trim()) {
      errors.postalCode = 'PIN Code is required';
    } else if (!/^\d{6}$/.test(postalCode.trim())) {
      errors.postalCode = 'Please enter a valid 6-digit PIN code';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Build clean composite address string
  const buildFullAddressString = (): string => {
    const parts: string[] = [];
    if (houseFlat.trim()) parts.push(houseFlat.trim());
    if (buildingName.trim()) parts.push(buildingName.trim());
    if (street.trim()) parts.push(street.trim());
    if (landmark.trim()) {
      const lm = landmark.trim();
      parts.push(lm.toLowerCase().startsWith('near') ? lm : `Near ${lm}`);
    }
    if (area.trim()) parts.push(area.trim());
    if (city.trim()) parts.push(city.trim());
    if (state.trim() && postalCode.trim()) {
      parts.push(`${state.trim()} - ${postalCode.trim()}`);
    } else {
      if (state.trim()) parts.push(state.trim());
      if (postalCode.trim()) parts.push(postalCode.trim());
    }
    return parts.join(', ');
  };

  // Final Save & Continue
  const handleSaveAddressAndContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const fullAddress = buildFullAddressString();
    await onLocationConfirmed({
      label,
      address: fullAddress,
      latitude: selectedLat,
      longitude: selectedLon,
      houseFlat: houseFlat.trim(),
      buildingName: buildingName.trim(),
      street: street.trim(),
      area: area.trim(),
      landmark: landmark.trim(),
      city: city.trim(),
      state: state.trim(),
      postalCode: postalCode.trim(),
    });
  };

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {/* ============================================================== */}
        {/* 1. LOCATION METHOD (Use Current Location vs Choose on Map)      */}
        {/* ============================================================== */}
        {step === 'method' && (
          <motion.div
            key="step-method"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="space-y-4 py-1"
          >
            <div className="text-center sm:text-left">
              <h3 className="text-base sm:text-lg font-black text-[#2B1408] font-serif">
                Where should we deliver your order?
              </h3>
              <p className="text-xs text-[#7A5C4A] mt-0.5">
                Choose your delivery location to calculate the delivery fee.
              </p>
            </div>

            {/* Informational card */}
            <div className="p-3 rounded-2xl bg-[#FDF6EE] border border-[#EEDDCC] flex items-center gap-2.5 text-xs text-[#7A5C4A]">
              <MapPin size={16} className="text-[#FE8E2A] shrink-0" />
              <span className="text-[11px] leading-snug">
                Your exact location helps us calculate delivery distance and delivery charges.
              </span>
            </div>

            {/* GPS Error notice if detection failed */}
            {gpsError && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle size={15} className="text-amber-600 shrink-0" />
                  <span className="font-bold text-[11px]">Couldn't access your location</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-tight">
                  Please enable location permissions in your browser, or choose your doorstep location directly on the map.
                </p>
                <div className="flex items-center gap-2 pt-0.5">
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-900 text-xs font-bold shadow-2xs hover:bg-amber-50 cursor-pointer"
                  >
                    Try Again
                  </button>
                  <button
                    type="button"
                    onClick={handleChooseOnMap}
                    className="px-3 py-1.5 rounded-xl bg-[#FE8E2A] text-white text-xs font-bold shadow-2xs hover:bg-[#E67616] cursor-pointer"
                  >
                    Choose on Map
                  </button>
                </div>
              </div>
            )}

            {/* TWO EQUAL SELECTION CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* CARD 1: Use Current Location */}
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={isDetectingGps}
                className="p-4 rounded-2xl border-2 border-[#EEDDCC] hover:border-[#FE8E2A] bg-white hover:bg-[#FDF6EE] text-left transition cursor-pointer flex items-start gap-3.5 shadow-sm hover:shadow active:scale-99 disabled:opacity-60"
              >
                <div className="p-3 rounded-2xl bg-[#FE8E2A] text-white shrink-0 shadow-xs">
                  {isDetectingGps ? (
                    <Loader2 size={22} className="animate-spin" />
                  ) : (
                    <span className="text-xl">📍</span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-extrabold text-[#2B1408] block">
                    Use Current Location
                  </span>
                  <span className="text-xs text-[#7A5C4A] block mt-1 leading-snug">
                    Automatically detect your current location using GPS.
                  </span>
                  <span className="inline-block mt-2.5 text-[10px] font-bold text-[#FE8E2A] bg-[#FBEFE1] px-2.5 py-0.5 rounded-full border border-[#EEDDCC]">
                    Fast GPS detection
                  </span>
                </div>
              </button>

              {/* CARD 2: Choose on Map */}
              <button
                type="button"
                onClick={handleChooseOnMap}
                className="p-4 rounded-2xl border-2 border-[#EEDDCC] hover:border-[#FE8E2A] bg-white hover:bg-[#FDF6EE] text-left transition cursor-pointer flex items-start gap-3.5 shadow-sm hover:shadow active:scale-99"
              >
                <div className="p-3 rounded-2xl bg-[#FDF6EE] text-[#FE8E2A] border border-[#EEDDCC] shrink-0">
                  <MapPin size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-sm font-extrabold text-[#2B1408] block">
                    Choose on Map
                  </span>
                  <span className="text-xs text-[#7A5C4A] block mt-1 leading-snug">
                    Search, move the map, or place the pin exactly where you'd like your order delivered.
                  </span>
                  <span className="inline-block mt-2.5 text-[10px] font-bold text-[#7A5C4A] bg-[#F2E5D6]/50 px-2.5 py-0.5 rounded-full border border-[#EEDDCC]">
                    Interactive pin placement
                  </span>
                </div>
              </button>
            </div>

            {/* Back action */}
            {onCancel && (
              <div className="pt-2 text-center sm:text-left">
                <button
                  type="button"
                  onClick={onCancel}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#7A5C4A] hover:text-[#2B1408] p-2 rounded-xl transition cursor-pointer"
                >
                  <ArrowLeft size={14} />
                  <span>Back to Order Type</span>
                </button>
              </div>
            )}
          </motion.div>
        )}

        {/* ============================================================== */}
        {/* 2. DEDICATED GOOGLE MAP LOCATION CONFIRMATION SCREEN            */}
        {/* ============================================================== */}
        {step === 'map' && (
          <motion.div
            key="step-map"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="space-y-3.5"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#EEDDCC] pb-2.5">
              <button
                type="button"
                onClick={() => setStep('method')}
                className="flex items-center gap-1.5 text-xs font-bold text-[#7A5C4A] hover:text-[#2B1408] p-1 rounded-lg transition cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Back</span>
              </button>
              <div className="text-center">
                <h3 className="text-xs sm:text-sm font-black text-[#2B1408] font-serif">
                  Select Delivery Location
                </h3>
                <p className="text-[10px] text-[#7A5C4A]">
                  Move the pin to your exact doorstep location.
                </p>
              </div>
              <div className="w-12" />
            </div>

            {/* Map error fallback or interactive map */}
            {mapError ? (
              <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto text-amber-700">
                  <AlertCircle size={24} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-extrabold text-[#2B1408]">Map couldn't be loaded</h4>
                  <p className="text-xs text-[#7A5C4A] max-w-sm mx-auto">
                    Unable to load Google Maps. You can try again or proceed to complete your delivery address directly.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleRetryMap}
                    className="px-4 py-2 rounded-xl bg-white border border-[#EEDDCC] hover:bg-[#FDF6EE] text-xs font-bold text-[#2B1408] flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <RefreshCw size={13} />
                    <span>Try Again</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('address')}
                    className="px-4 py-2 rounded-xl bg-[#FE8E2A] text-white text-xs font-extrabold shadow-2xs hover:bg-[#E67616] cursor-pointer"
                  >
                    Enter Address Manually
                  </button>
                </div>
              </div>
            ) : (
              /* DEDICATED MAP CONTAINER (Desktop: 60/40 Split, Mobile: Stacked) */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start">
                {/* MAP AREA (Left: ~7 cols on desktop, full on mobile) */}
                <div className="lg:col-span-7">
                  <div className="relative w-full rounded-2xl overflow-hidden border-2 border-[#EEDDCC] shadow-sm bg-[#FFFDFB]">
                    {/* Google Maps DOM target container */}
                    <div
                      ref={mapElementRef}
                      className="w-full h-64 sm:h-72 lg:h-96 relative z-0"
                      style={{ minHeight: '260px' }}
                    />

                    {/* Loading Overlay */}
                    {isMapLoading && (
                      <div className="absolute inset-0 bg-[#FFFDFB]/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-20">
                        <Loader2 size={26} className="animate-spin text-[#FE8E2A]" />
                        <span className="text-xs font-bold text-[#2B1408]">Loading Google Maps...</span>
                      </div>
                    )}

                    {/* Floating Action Controls (Clean, minimal, useful buttons only) */}
                    <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
                      {/* GPS Locate Me Button */}
                      <button
                        type="button"
                        onClick={handleLocateMeInMap}
                        disabled={isDetectingGps}
                        title="Locate Me (Device GPS)"
                        aria-label="Locate me using device GPS"
                        className="w-10 h-10 rounded-xl bg-white/95 text-[#2B1408] hover:text-[#FE8E2A] shadow-md border border-[#EEDDCC] flex items-center justify-center transition cursor-pointer disabled:opacity-60 active:scale-95"
                      >
                        {isDetectingGps ? (
                          <Loader2 size={17} className="animate-spin text-[#FE8E2A]" />
                        ) : (
                          <Crosshair size={17} />
                        )}
                      </button>

                      {/* Recenter on Selected Pin */}
                      <button
                        type="button"
                        onClick={handleRecenterOnPin}
                        title="Recenter on Selected Pin"
                        aria-label="Recenter map on selected delivery pin"
                        className="w-10 h-10 rounded-xl bg-white/95 text-[#2B1408] hover:text-[#FE8E2A] shadow-md border border-[#EEDDCC] flex items-center justify-center transition cursor-pointer active:scale-95"
                      >
                        <MapPin size={17} className="text-[#FE8E2A]" />
                      </button>

                      {/* Satellite / Road Map Toggle */}
                      <button
                        type="button"
                        onClick={handleToggleMapType}
                        title={mapType === 'hybrid' ? 'Switch to Street Map View' : 'Switch to Satellite View'}
                        aria-label="Toggle Satellite / Normal Map View"
                        className="w-10 h-10 rounded-xl bg-white/95 text-[#2B1408] hover:text-[#FE8E2A] shadow-md border border-[#EEDDCC] flex items-center justify-center transition cursor-pointer active:scale-95"
                      >
                        <Layers size={17} className={mapType === 'hybrid' ? 'text-[#FE8E2A]' : 'text-[#7A5C4A]'} />
                      </button>
                    </div>

                    {/* Helpful Instruction Badge */}
                    <div className="absolute top-3 left-3 z-10 pointer-events-none">
                      <span className="px-2.5 py-1 rounded-xl bg-white/95 backdrop-blur-xs text-[10px] font-bold text-[#2B1408] border border-[#EEDDCC] shadow-xs flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#FE8E2A] animate-pulse" />
                        Tap map or drag pin to adjust
                      </span>
                    </div>
                  </div>
                </div>

                {/* LOCATION CONFIRMATION CARD & ACTIONS (Right: ~5 cols on desktop, bottom on mobile) */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="p-4 rounded-2xl bg-white border border-[#EEDDCC] shadow-xs space-y-3">
                    <div className="flex items-start justify-between gap-2 border-b border-[#EEDDCC]/70 pb-2.5">
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={15} className="text-[#FE8E2A] shrink-0" />
                          <span className="text-xs font-black text-[#2B1408]">Selected Location</span>
                          {isGeocoding && <Loader2 size={11} className="animate-spin text-[#FE8E2A]" />}
                        </div>
                        <p className="text-xs text-[#7A5C4A] line-clamp-2 leading-relaxed pt-1">
                          {geocodedAddress || `Coordinates: ${selectedLat.toFixed(4)}, ${selectedLon.toFixed(4)}`}
                        </p>
                      </div>
                    </div>

                    {/* Distance from Cafe - Enhanced Status Card */}
                    <div className="p-3 rounded-xl bg-[#FDF6EE] border border-[#EEDDCC] flex items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-[#FBEFE1] border border-[#EEDDCC] flex items-center justify-center shrink-0 shadow-2xs">
                          <span className="text-sm">🧭</span>
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-[#7A5C4A] block leading-tight">
                            Distance from Cafe
                          </span>
                          <span className="font-extrabold text-[#2B1408] text-xs sm:text-sm">
                            {formatDistance(distanceKm)}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-900 bg-white px-2.5 py-1 rounded-lg border border-[#EEDDCC] shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#FE8E2A]" />
                          <span>Pin Selected</span>
                        </span>
                      </div>
                    </div>

                    {geocodeNotice && (
                      <p className="text-[10px] text-amber-900 bg-amber-50 border border-amber-200 p-2 rounded-lg">
                        {geocodeNotice}
                      </p>
                    )}

                    {/* Primary Action Button: Confirm This Location -> advances to address details screen */}
                    <div className="pt-1 flex flex-col gap-2">
                      <button
                        type="button"
                        onClick={() => setStep('address')}
                        className="w-full py-3.5 rounded-2xl bg-[#FE8E2A] hover:bg-[#E67616] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#FE8E2A]/25 active:scale-98 transition cursor-pointer min-h-[48px]"
                      >
                        <span>Confirm This Location</span>
                        <ArrowRight size={16} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setStep('method')}
                        className="w-full py-2 text-center text-xs font-bold text-[#7A5C4A] hover:text-[#2B1408] transition cursor-pointer"
                      >
                        ← Change Location
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ============================================================== */}
        {/* 3. COMPLETE YOUR DELIVERY ADDRESS SCREEN                        */}
        {/* ============================================================== */}
        {step === 'address' && (
          <motion.div
            key="step-address"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="space-y-3.5"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-[#EEDDCC] pb-2">
              <button
                type="button"
                onClick={() => setStep('map')}
                className="flex items-center gap-1.5 text-xs font-bold text-[#7A5C4A] hover:text-[#2B1408] p-1 rounded-lg transition cursor-pointer"
              >
                <ArrowLeft size={14} />
                <span>Back to Map</span>
              </button>
              <div className="text-center">
                <h3 className="text-xs sm:text-sm font-black text-[#2B1408] font-serif">
                  Complete Your Delivery Address
                </h3>
                <p className="text-[10px] text-[#7A5C4A]">
                  Add a few details so our delivery team can find you easily.
                </p>
              </div>
              <div className="w-12" />
            </div>

            {/* Pinned Location Card with [Change Location] button */}
            <div className="p-3 rounded-2xl bg-[#FDF6EE] border border-[#EEDDCC] flex items-center justify-between text-xs gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <MapPin size={16} className="text-[#FE8E2A] shrink-0" />
                <div className="min-w-0">
                  <span className="text-[11px] font-bold text-[#2B1408] block truncate">
                    📍 {geocodedAddress || `Pinned Location: ${selectedLat.toFixed(4)}, ${selectedLon.toFixed(4)}`}
                  </span>
                  <span className="text-[10px] text-[#7A5C4A]">
                    {formatDistance(distanceKm)} from TryIt Cafe
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setStep('map')}
                className="text-[11px] font-bold text-[#FE8E2A] hover:underline shrink-0 p-1 cursor-pointer"
              >
                Change Location
              </button>
            </div>

            {/* Structured Address Form */}
            <form onSubmit={handleSaveAddressAndContinue} className="space-y-3">
              {/* Location Type Selector */}
              <div>
                <label className="text-[11px] font-bold text-[#7A5C4A] block mb-1">
                  Location Type <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(
                    [
                      { id: 'Home', icon: Home },
                      { id: 'Work', icon: Briefcase },
                      { id: 'Other', icon: Package },
                    ] as const
                  ).map(({ id, icon: Icon }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setLabel(id)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-1.5 cursor-pointer min-h-[38px] ${
                        label === id
                          ? 'bg-[#FE8E2A] text-white border-[#FE8E2A] shadow-xs'
                          : 'bg-white text-[#7A5C4A] border-[#EEDDCC] hover:bg-[#FDF6EE]'
                      }`}
                    >
                      <Icon size={14} />
                      <span>{id}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* House / Flat No. (Required) & Building / Apartment Name (Optional) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold text-[#7A5C4A] block mb-1">
                    House / Flat No. <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={houseFlat}
                    onChange={(e) => handleFieldChange('houseFlat', setHouseFlat, e.target.value)}
                    placeholder="e.g. Flat 203, H.No 12-34"
                    className={`w-full p-2.5 rounded-xl bg-white border text-xs text-[#2B1408] focus:outline-none focus:ring-2 focus:ring-[#FE8E2A]/50 placeholder:text-[#A89284] ${
                      formErrors.houseFlat ? 'border-rose-400 bg-rose-50/30' : 'border-[#EEDDCC]'
                    }`}
                  />
                  {formErrors.houseFlat && (
                    <p className="text-[10px] text-rose-600 mt-0.5 font-medium">{formErrors.houseFlat}</p>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#7A5C4A] block mb-1">
                    Building / Apartment Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={buildingName}
                    onChange={(e) => handleFieldChange('buildingName', setBuildingName, e.target.value)}
                    placeholder="e.g. Sri Sai Residency / Green Villa"
                    className={`w-full p-2.5 rounded-xl bg-white border text-xs text-[#2B1408] focus:outline-none focus:ring-2 focus:ring-[#FE8E2A]/50 placeholder:text-[#A89284] ${
                      formErrors.buildingName ? 'border-rose-400 bg-rose-50/30' : 'border-[#EEDDCC]'
                    }`}
                  />
                  {formErrors.buildingName && (
                    <p className="text-[10px] text-rose-600 mt-0.5 font-medium">{formErrors.buildingName}</p>
                  )}
                </div>
              </div>

              {/* Street / Road (Required) & Area / Locality (Required) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-[#7A5C4A] block">
                      Street / Road <span className="text-rose-500">*</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => handleFieldChange('street', setStreet, e.target.value)}
                    placeholder="e.g. Dundigal-Bowrampet Road / Main Road"
                    className={`w-full p-2.5 rounded-xl bg-white border text-xs text-[#2B1408] focus:outline-none focus:ring-2 focus:ring-[#FE8E2A]/50 placeholder:text-[#A89284] ${
                      formErrors.street ? 'border-rose-400 bg-rose-50/30' : 'border-[#EEDDCC]'
                    }`}
                  />
                  {formErrors.street && (
                    <p className="text-[10px] text-rose-600 mt-0.5 font-medium">{formErrors.street}</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold text-[#7A5C4A] block">
                      Area / Locality <span className="text-rose-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleRefreshFromPin}
                      disabled={isGeocoding}
                      className="text-[10px] font-bold text-[#FE8E2A] hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      title="Refresh address from pin"
                    >
                      <RefreshCw size={10} className={isGeocoding ? 'animate-spin' : ''} />
                      <span>Refresh address from pin</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => handleFieldChange('area', setArea, e.target.value)}
                    placeholder="e.g. Gandimaisamma"
                    className={`w-full p-2.5 rounded-xl bg-white border text-xs text-[#2B1408] focus:outline-none focus:ring-2 focus:ring-[#FE8E2A]/50 placeholder:text-[#A89284] ${
                      formErrors.area ? 'border-rose-400 bg-rose-50/30' : 'border-[#EEDDCC]'
                    }`}
                  />
                  {formErrors.area && (
                    <p className="text-[10px] text-rose-600 mt-0.5 font-medium">{formErrors.area}</p>
                  )}
                </div>
              </div>

              {/* Nearby Location / Landmark (Required) */}
              <div>
                <label className="text-[11px] font-bold text-[#7A5C4A] block mb-1">
                  Nearby Location / Landmark <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => handleFieldChange('landmark', setLandmark, e.target.value)}
                  placeholder="e.g. Near Pragathi School / Opposite SBI / Behind Temple"
                  className={`w-full p-2.5 rounded-xl bg-white border text-xs text-[#2B1408] focus:outline-none focus:ring-2 focus:ring-[#FE8E2A]/50 placeholder:text-[#A89284] ${
                    formErrors.landmark ? 'border-rose-400 bg-rose-50/30' : 'border-[#EEDDCC]'
                  }`}
                />
                {formErrors.landmark && (
                  <p className="text-[10px] text-rose-600 mt-0.5 font-medium">{formErrors.landmark}</p>
                )}
              </div>

              {/* City, State, PIN Code (All Required) */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-[#7A5C4A] block mb-1">
                    City <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => handleFieldChange('city', setCity, e.target.value)}
                    placeholder="Hyderabad"
                    className={`w-full p-2.5 rounded-xl bg-white border text-xs text-[#2B1408] focus:outline-none focus:ring-2 focus:ring-[#FE8E2A]/50 ${
                      formErrors.city ? 'border-rose-400 bg-rose-50/30' : 'border-[#EEDDCC]'
                    }`}
                  />
                  {formErrors.city && (
                    <p className="text-[10px] text-rose-600 mt-0.5 font-medium">{formErrors.city}</p>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#7A5C4A] block mb-1">
                    State <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => handleFieldChange('state', setState, e.target.value)}
                    placeholder="Telangana"
                    className={`w-full p-2.5 rounded-xl bg-white border text-xs text-[#2B1408] focus:outline-none focus:ring-2 focus:ring-[#FE8E2A]/50 ${
                      formErrors.state ? 'border-rose-400 bg-rose-50/30' : 'border-[#EEDDCC]'
                    }`}
                  />
                  {formErrors.state && (
                    <p className="text-[10px] text-rose-600 mt-0.5 font-medium">{formErrors.state}</p>
                  )}
                </div>

                <div>
                  <label className="text-[11px] font-bold text-[#7A5C4A] block mb-1">
                    PIN Code <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={postalCode}
                    onChange={(e) =>
                      handleFieldChange('postalCode', setPostalCode, e.target.value.replace(/\D/g, ''))
                    }
                    placeholder="500043"
                    className={`w-full p-2.5 rounded-xl bg-white border text-xs text-[#2B1408] focus:outline-none focus:ring-2 focus:ring-[#FE8E2A]/50 placeholder:text-[#A89284] ${
                      formErrors.postalCode ? 'border-rose-400 bg-rose-50/30' : 'border-[#EEDDCC]'
                    }`}
                  />
                  {formErrors.postalCode && (
                    <p className="text-[10px] text-rose-600 mt-0.5 font-medium">{formErrors.postalCode}</p>
                  )}
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="pt-2 flex flex-col-reverse sm:flex-row items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep('map')}
                  className="w-full sm:w-1/3 py-3 rounded-2xl border border-[#EEDDCC] bg-white hover:bg-[#FDF6EE] text-[#7A5C4A] font-bold text-xs min-h-[46px] cursor-pointer"
                >
                  Back to Map
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full sm:w-2/3 py-3.5 rounded-2xl bg-[#FE8E2A] hover:bg-[#E67616] active:bg-[#C65A08] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#FE8E2A]/25 active:scale-98 transition cursor-pointer min-h-[48px] disabled:opacity-60"
                >
                  {isSaving ? (
                    <>
                      <Loader2 size={16} className="animate-spin text-white" />
                      <span>Saving Address...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>Save Address & Continue →</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
