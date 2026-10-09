import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Phone,
  Mail,
  LogOut,
  MapPin,
  Home,
  Briefcase,
  Package,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Navigation,
  Loader2,
  ShieldCheck,
  Check,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { CustomerLocation } from '../../types';
import { getCurrentBrowserLocation, reverseGeocodeCoordinates } from '../../services/reverseGeocodeService';
import { DeliveryLocationPicker } from '../location/DeliveryLocationPicker';

interface CustomerProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerProfileModal: React.FC<CustomerProfileModalProps> = ({ isOpen, onClose }) => {
  const {
    user,
    locations,
    updateProfile,
    addLocation,
    editLocation,
    deleteLocation,
    setDefaultLocation,
    logout,
    isLoading,
    clearError,
  } = useAuthStore();
  const { success, error: toastError } = useToastStore();

  // Personal Info Edit state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Add / Edit Location Sub-Panel State
  const [isLocationFormOpen, setIsLocationFormOpen] = useState(false);
  const [editingLocationId, setEditingLocationId] = useState<string | null>(null);
  const [locationLabel, setLocationLabel] = useState<'Home' | 'Work' | 'Other'>('Home');
  const [locationAddress, setLocationAddress] = useState('');
  const [locationLatitude, setLocationLatitude] = useState<number | null>(null);
  const [locationLongitude, setLocationLongitude] = useState<number | null>(null);
  const [locationIsDefault, setLocationIsDefault] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [isSavingLoc, setIsSavingLoc] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setEmail(user.email || '');
    }
    clearError();
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  // Handle Profile Update
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    if (newPassword && newPassword.length < 6) {
      toastError('New password must be at least 6 characters');
      return;
    }
    if (newPassword && !currentPassword) {
      toastError('Please enter current password to set a new password');
      return;
    }

    const ok = await updateProfile({
      fullName: fullName.trim(),
      email: email.trim() || undefined,
      currentPassword: currentPassword || undefined,
      newPassword: newPassword || undefined,
    });

    if (ok) {
      success('Personal information updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setIsEditingProfile(false);
    }
  };

  // Open Location Modal for New
  const handleOpenAddLocation = () => {
    setEditingLocationId(null);
    setLocationLabel('Home');
    setLocationAddress('');
    setLocationLatitude(null);
    setLocationLongitude(null);
    setLocationIsDefault(locations.length === 0);
    setLocationError(null);
    setIsLocationFormOpen(true);
  };

  // Open Location Modal for Edit
  const handleOpenEditLocation = (loc: CustomerLocation) => {
    setEditingLocationId(loc.id);
    setLocationLabel((loc.label as any) || 'Home');
    setLocationAddress(loc.address);
    setLocationLatitude(loc.latitude);
    setLocationLongitude(loc.longitude);
    setLocationIsDefault(loc.isDefault);
    setLocationError(null);
    setIsLocationFormOpen(true);
  };

  // GPS Detection for Location Form
  const handleDetectLocation = async () => {
    setIsDetectingGps(true);
    setLocationError(null);

    try {
      const coords = await getCurrentBrowserLocation();
      const address = await reverseGeocodeCoordinates(coords.latitude, coords.longitude);
      setLocationLatitude(coords.latitude);
      setLocationLongitude(coords.longitude);
      setLocationAddress(address);
    } catch (err: any) {
      setLocationError(
        err.message || 'Unable to access GPS location. Please check browser permissions.'
      );
    } finally {
      setIsDetectingGps(false);
    }
  };

  // Save Location (Create or Update)
  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocationError(null);

    const trimmed = locationAddress.trim();
    if (!trimmed) {
      setLocationError('Address is required');
      return;
    }

    if (
      locationLatitude == null ||
      locationLongitude == null ||
      isNaN(locationLatitude) ||
      isNaN(locationLongitude) ||
      locationLatitude < -90 ||
      locationLatitude > 90 ||
      locationLongitude < -180 ||
      locationLongitude > 180
    ) {
      setLocationError('Please select or detect a valid delivery location.');
      return;
    }

    setIsSavingLoc(true);

    try {
      if (editingLocationId) {
        const ok = await editLocation(editingLocationId, {
          label: locationLabel,
          address: trimmed,
          latitude: locationLatitude,
          longitude: locationLongitude,
          isDefault: locationIsDefault,
        });
        if (ok) {
          success('Delivery location updated successfully!');
          setIsLocationFormOpen(false);
        } else {
          setLocationError('Unable to update location. Please try again.');
        }
      } else {
        const res = await addLocation({
          label: locationLabel,
          address: trimmed,
          latitude: locationLatitude,
          longitude: locationLongitude,
          isDefault: locationIsDefault,
        });
        if (res) {
          success('New delivery location saved!');
          setIsLocationFormOpen(false);
        } else {
          setLocationError('Unable to save location. Please try again.');
        }
      }
    } catch (err: any) {
      setLocationError(err.message || 'Unable to save delivery location.');
    } finally {
      setIsSavingLoc(false);
    }
  };

  const handleDeleteLocation = async (id: string) => {
    if (confirm('Are you sure you want to remove this saved location?')) {
      const ok = await deleteLocation(id);
      if (ok) success('Location removed.');
    }
  };

  const handleSetDefault = async (id: string) => {
    const ok = await setDefaultLocation(id);
    if (ok) success('Default delivery location updated.');
  };

  const handleLogout = () => {
    logout();
    success('You have been logged out.');
    onClose();
  };

  const getLocationIcon = (label: string) => {
    switch (label?.toLowerCase()) {
      case 'work':
        return <Briefcase size={16} className="text-blue-500" />;
      case 'other':
        return <Package size={16} className="text-purple-500" />;
      case 'home':
      default:
        return <Home size={16} className="text-amber-600" />;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-[#FFFBF7] border border-[#EEDDCC] rounded-3xl shadow-2xl z-10 text-[#23120B] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#EEDDCC] bg-[#FDF6EE]">
            <div className="flex items-center gap-3">
              <img
                src="/assets/Logo.jpeg"
                alt="TryIt Cafe"
                className="w-10 h-10 rounded-2xl object-contain bg-white p-0.5 border border-[#EEDDCC] shadow-xs"
              />
              <div>
                <h3 className="text-base sm:text-lg font-bold font-serif text-[#2B1408] leading-tight">
                  Customer Profile
                </h3>
                <p className="text-xs text-[#735440] font-medium">
                  Manage your personal details & saved delivery locations
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-[#735440] hover:text-[#2B1408] hover:bg-white rounded-xl transition cursor-pointer"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body: Two-column on desktop (Section 41), Single-column on mobile */}
          <div className="p-6 overflow-y-auto flex-1 space-y-6 md:space-y-0 md:grid md:grid-cols-12 md:gap-8">
            {/* LEFT COLUMN: Personal Info & Account Status (5 cols) */}
            <div className="md:col-span-5 space-y-5">
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.35, delay: 0.05 }}
                className="p-5 rounded-2xl bg-[#FAF8F5] border border-stone-200/80 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                    <User size={14} />
                    <span>Personal Details</span>
                  </span>
                  {!isEditingProfile && (
                    <button
                      type="button"
                      onClick={() => setIsEditingProfile(true)}
                      className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1"
                    >
                      <Edit3 size={13} />
                      <span>Edit</span>
                    </button>
                  )}
                </div>

                {isEditingProfile ? (
                  <form onSubmit={handleUpdateProfile} className="space-y-3">
                    <div>
                      <label className="text-[11px] font-bold text-stone-700 block mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="w-full p-2.5 rounded-xl bg-white border border-stone-300 text-xs focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-stone-700 block mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Optional for receipts"
                        className="w-full p-2.5 rounded-xl bg-white border border-stone-300 text-xs focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    <div className="pt-2 border-t border-stone-200/60 space-y-2">
                      <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                        Change Password (Optional)
                      </span>
                      <div>
                        <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                          Current Password
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type={showCurrentPassword ? 'text' : 'password'}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="Enter current password"
                            className="w-full pl-3 pr-9 py-2 rounded-xl bg-white border border-stone-300 text-xs focus:ring-1 focus:ring-amber-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword((prev) => !prev)}
                            tabIndex={-1}
                            aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                            className="absolute right-2.5 p-1 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer focus:outline-none"
                          >
                            {showCurrentPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                          New Password
                        </label>
                        <div className="relative flex items-center">
                          <input
                            type={showNewPassword ? 'text' : 'password'}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="At least 6 characters"
                            className="w-full pl-3 pr-9 py-2 rounded-xl bg-white border border-stone-300 text-xs focus:ring-1 focus:ring-amber-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword((prev) => !prev)}
                            tabIndex={-1}
                            aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                            className="absolute right-2.5 p-1 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer focus:outline-none"
                          >
                            {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="flex-1 py-2 rounded-xl text-stone-600 text-xs font-semibold hover:bg-stone-200 border border-stone-200"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1"
                      >
                        {isLoading && <Loader2 size={13} className="animate-spin" />}
                        <span>Save</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center gap-3 pb-2 border-b border-stone-200/60">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#FE8E2A]/30 bg-[#FFF0DF] flex items-center justify-center shrink-0 shadow-2xs">
                        {user.profileImageUrl ? (
                          <img
                            src={user.profileImageUrl}
                            alt={user.fullName}
                            className="w-full h-full object-cover rounded-full"
                            referrerPolicy="no-referrer"
                          />
                        ) : user.fullName?.trim() ? (
                          <span className="text-lg font-black text-[#FE8E2A]">
                            {user.fullName.trim().charAt(0).toUpperCase()}
                          </span>
                        ) : (
                          <User size={22} className="text-[#FE8E2A]" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-stone-900 text-sm block truncate">{user.fullName}</span>
                        <span className="text-[11px] text-stone-500 font-medium">Customer Account</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-bold">
                        Full Name
                      </span>
                      <span className="font-bold text-stone-900 text-sm">{user.fullName}</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-bold">
                        Phone Number
                      </span>
                      <span className="font-semibold text-stone-800 flex items-center gap-1.5 mt-0.5">
                        <span>📞</span>
                        {user.phone || 'Provided via WhatsApp'}
                      </span>
                    </div>

                    {user.email && (
                      <div>
                        <span className="text-[10px] text-stone-400 uppercase tracking-wider block font-bold">
                          Email
                        </span>
                        <span className="font-semibold text-stone-800 flex items-center gap-1.5 mt-0.5">
                          <span>✉️</span>
                          {user.email}
                        </span>
                      </div>
                    )}

                    <div className="pt-2 flex items-center gap-1.5 text-emerald-700 text-[11px] font-bold">
                      <ShieldCheck size={14} className="text-emerald-600" />
                      <span>Verified Customer Account</span>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Sign Out Card */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full py-3 px-4 rounded-2xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs flex items-center justify-center gap-2 border border-red-200 transition cursor-pointer"
                >
                  <LogOut size={16} />
                  <span>Log Out of Account</span>
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: Saved Delivery Locations (7 cols) */}
            <div className="md:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-stone-900 font-serif">
                    Saved Delivery Locations
                  </h4>
                  <p className="text-[11px] text-stone-500">
                    Your saved addresses for fast distance & delivery charge calculation
                  </p>
                </div>

                {!isLocationFormOpen && (
                  <button
                    type="button"
                    onClick={handleOpenAddLocation}
                    className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition cursor-pointer"
                  >
                    <Plus size={13} />
                    <span>Add New</span>
                  </button>
                )}
              </div>

              {/* Inline Location Add / Edit Sub-form */}
              {isLocationFormOpen && (
                <div className="p-4 rounded-2xl border border-amber-300 bg-amber-50/60 space-y-3">
                  <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                    <span className="text-xs font-bold text-amber-950 font-serif">
                      {editingLocationId ? 'Edit Delivery Location' : 'Add Delivery Location'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsLocationFormOpen(false)}
                      className="text-stone-400 hover:text-stone-700"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {!editingLocationId ? (
                    <DeliveryLocationPicker
                      onLocationConfirmed={async (data) => {
                        setIsSavingLoc(true);
                        try {
                          const res = await addLocation({
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
                          if (res) {
                            success('Delivery location added successfully!');
                            setIsLocationFormOpen(false);
                          } else {
                            setLocationError('Unable to save location. Please try again.');
                          }
                        } catch (_err) {
                          setLocationError('Unable to save location. Please try again.');
                        } finally {
                          setIsSavingLoc(false);
                        }
                      }}
                      onCancel={() => setIsLocationFormOpen(false)}
                      isSaving={isSavingLoc}
                    />
                  ) : (
                    <form onSubmit={handleSaveLocation} className="space-y-3">
                      <div className="flex gap-2">
                        {(['Home', 'Work', 'Other'] as const).map((l) => (
                          <button
                            key={l}
                            type="button"
                            onClick={() => setLocationLabel(l)}
                            className={`flex-1 py-1.5 px-2 rounded-xl text-[11px] font-bold border transition cursor-pointer ${
                              locationLabel === l
                                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                                : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                            }`}
                          >
                            {l}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={handleDetectLocation}
                        disabled={isDetectingGps || isSavingLoc}
                        className="w-full py-2.5 px-3 rounded-xl border border-amber-300 bg-white hover:bg-amber-100 text-amber-900 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-60"
                      >
                        {isDetectingGps ? (
                          <>
                            <Loader2 size={14} className="animate-spin text-amber-700" />
                            <span>Detecting GPS Location...</span>
                          </>
                        ) : (
                          <>
                            <span>📍</span>
                            <span>Use Current Location</span>
                          </>
                        )}
                      </button>

                      {/* Coordinates status badge */}
                      {locationLatitude != null && locationLongitude != null && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-medium">
                          <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                          <span>GPS Coordinates captured ({locationLatitude.toFixed(4)}, {locationLongitude.toFixed(4)})</span>
                        </div>
                      )}

                      {locationError && (
                        <p className="text-[11px] text-red-700 bg-red-50 border border-red-200 p-2.5 rounded-xl font-medium">
                          {locationError}
                        </p>
                      )}

                      <div>
                        <textarea
                          rows={2}
                          value={locationAddress}
                          onChange={(e) => {
                            setLocationAddress(e.target.value);
                            if (locationError) setLocationError(null);
                          }}
                          placeholder="Enter full formatted street address..."
                          required
                          className="w-full p-2.5 rounded-xl bg-white border border-stone-300 text-xs focus:ring-1 focus:ring-amber-500"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="locDefault"
                          checked={locationIsDefault}
                          onChange={(e) => setLocationIsDefault(e.target.checked)}
                          className="rounded text-amber-600 focus:ring-amber-500"
                        />
                        <label htmlFor="locDefault" className="text-xs text-stone-700 font-medium">
                          Set as default delivery address
                        </label>
                      </div>

                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          disabled={isSavingLoc}
                          onClick={() => setIsLocationFormOpen(false)}
                          className="flex-1 py-2.5 rounded-xl text-stone-600 text-xs font-semibold hover:bg-stone-100 border border-stone-200"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isSavingLoc || isDetectingGps}
                          className="flex-1 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5"
                        >
                          {isSavingLoc ? (
                            <>
                              <Loader2 size={13} className="animate-spin text-white" />
                              <span>Saving...</span>
                            </>
                          ) : (
                            <span>Save Location</span>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Locations List */}
              {locations.length === 0 ? (
                <div className="p-6 rounded-2xl border border-dashed border-stone-300 bg-stone-50/60 text-center space-y-2">
                  <span className="text-3xl block text-center mx-auto">📍</span>
                  <p className="text-xs font-bold text-stone-700">No delivery locations saved yet.</p>
                  <p className="text-[11px] text-stone-500">
                    Add your home or work address for seamless delivery distance calculation.
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenAddLocation}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-xs"
                  >
                    + Add Your First Location
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {locations.map((loc, idx) => (
                    <motion.div
                      key={loc.id}
                      initial={{ opacity: 0, y: 12, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.28, delay: idx * 0.05 }}
                      className="p-3.5 rounded-2xl border border-stone-200 bg-white hover:border-stone-300 transition flex items-start justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="p-2 rounded-xl bg-stone-100 shrink-0 mt-0.5">
                          {getLocationIcon(loc.label)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-stone-900">{loc.label}</span>
                            {loc.isDefault ? (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                                Default
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleSetDefault(loc.id)}
                                className="text-[11px] text-stone-400 hover:text-amber-700 font-bold"
                              >
                                Set as Default
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-stone-600 mt-1 line-clamp-2 leading-relaxed">
                            {loc.address}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 pt-0.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditLocation(loc)}
                          title="Edit"
                          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteLocation(loc.id)}
                          title="Delete"
                          className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
