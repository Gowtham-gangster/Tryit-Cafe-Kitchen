import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  Home,
  Briefcase,
  Package,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  LogOut,
  AlertTriangle,
  X,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';
import { authApi } from '../api/authApi';
import { CustomerLocation } from '../types';
import { getCurrentBrowserLocation, reverseGeocodeCoordinates } from '../services/reverseGeocodeService';
import { DeliveryLocationPicker, ConfirmedLocationData } from '../components/location/DeliveryLocationPicker';

export const CustomerProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const actionParam = searchParams.get('action');
  const editIdParam = searchParams.get('id');

  const {
    user,
    isAuthenticated,
    locations,
    updateProfile,
    deleteAccount,
    addLocation,
    editLocation,
    deleteLocation,
    setDefaultLocation,
    logout,
    openAuthModal,
    isLoading,
    clearError,
  } = useAuthStore();

  const { success, error: toastError } = useToastStore();

  // Viewport detection for responsive mobile vs desktop view
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Personal Info Form State
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');

  // Password Management State
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Forgot Password from Profile State
  const [isSendingResetEmail, setIsSendingResetEmail] = useState(false);
  const [resetEmailSentNotice, setResetEmailSentNotice] = useState<string | null>(null);

  // Location Management State
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

  // Permanent Delete Modal State
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = 'My Profile — Tryit Cafe & Kitchen';

    if (user) {
      setFullName(user.fullName || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
    clearError();
  }, [user]);

  // Synchronize URL search params with editing state if present
  useEffect(() => {
    if (actionParam === 'edit-address' && editIdParam) {
      const found = locations.find((l) => l.id === editIdParam);
      if (found) {
        setEditingLocationId(found.id);
        setLocationLabel((found.label as any) || 'Home');
        setLocationAddress(found.address);
        setLocationLatitude(found.latitude);
        setLocationLongitude(found.longitude);
        setLocationIsDefault(found.isDefault);
        setIsLocationFormOpen(true);
      }
    } else if (actionParam === 'add-address') {
      setEditingLocationId(null);
      setLocationLabel('Home');
      setLocationAddress('');
      setLocationLatitude(null);
      setLocationLongitude(null);
      setLocationIsDefault(locations.length === 0);
      setIsLocationFormOpen(true);
    }
  }, [actionParam, editIdParam, locations]);

  // If user is not authenticated, show sign-in prompt
  if (!isAuthenticated || !user || user.role === 'ROLE_OWNER') {
    return (
      <main className="min-h-[80vh] flex items-center justify-center p-4 bg-[#FAF6F0]">
        <div className="max-w-md w-full bg-white border border-[#EEDDCC] rounded-3xl p-8 text-center shadow-xl space-y-4">
          <div className="w-16 h-16 bg-[#FFF0DF] text-[#FE8E2A] rounded-2xl flex items-center justify-center mx-auto border border-[#EEDDCC]">
            <User size={32} />
          </div>
          <h2 className="text-2xl font-serif font-black text-[#2B1408]">Customer Account</h2>
          <p className="text-xs sm:text-sm text-[#735440] leading-relaxed">
            Please sign in to manage your personal profile, saved delivery addresses, and preferences.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              type="button"
              onClick={() => openAuthModal('login', 'Sign in to access your customer profile')}
              className="w-full py-3.5 px-4 rounded-xl bg-[#FE8E2A] hover:bg-[#E67616] text-white font-bold text-sm shadow-md transition cursor-pointer"
            >
              Sign In to Your Account
            </button>
            <Link
              to="/"
              className="w-full py-2.5 px-4 rounded-xl border border-[#EEDDCC] hover:bg-[#FAF6F0] text-[#735440] text-xs font-semibold transition"
            >
              Return to Homepage
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // Handle Personal Details Update (Name, Email, Phone)
  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toastError('Full name cannot be blank.');
      return;
    }

    const cleanPhone = phone.replace(/\s+/g, '');
    if (cleanPhone && !/^[0-9+]{8,15}$/.test(cleanPhone)) {
      toastError('Please enter a valid mobile number (8-15 digits).');
      return;
    }

    const ok = await updateProfile({
      fullName: fullName.trim(),
      email: email.trim() || undefined,
      phone: cleanPhone || undefined,
    });

    if (ok) {
      success('Personal details updated successfully!');
      setIsEditingPersonal(false);
    }
  };

  // Handle Password Update
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!currentPassword) {
      setPasswordError('Please enter your current password.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match. Please verify.');
      return;
    }

    setIsUpdatingPassword(true);

    try {
      const ok = await updateProfile({
        currentPassword,
        newPassword,
      });

      if (ok) {
        success('Password updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setIsChangingPassword(false);
      } else {
        setPasswordError('Current password does not match.');
      }
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Send Password Reset Link to Email
  const handleForgotPassword = async () => {
    const targetEmail = (user?.email || email || '').trim();
    const targetPhone = user?.phone;

    if (!targetEmail && !targetPhone) {
      toastError('Please enter your email address first so we can send the reset link.');
      return;
    }

    setIsSendingResetEmail(true);
    setResetEmailSentNotice(null);

    try {
      const sentTarget = targetEmail || targetPhone || '';
      const msg = await authApi.forgotPassword(sentTarget);
      success(msg || `Password reset link sent to ${targetEmail || 'your email'}!`);
      setResetEmailSentNotice(
        `Reset link dispatched to ${targetEmail || 'your email'}. Check your inbox or spam folder (valid for 15 mins).`
      );
    } catch (err: any) {
      toastError(
        err.response?.data?.message ||
          err.message ||
          'Failed to send reset email. Please ensure your email is saved.'
      );
    } finally {
      setIsSendingResetEmail(false);
    }
  };

  // Open Location: On mobile opens dedicated full-screen screen via URL param; on desktop opens inline
  const handleOpenAddLocation = () => {
    setEditingLocationId(null);
    setLocationLabel('Home');
    setLocationAddress('');
    setLocationLatitude(null);
    setLocationLongitude(null);
    setLocationIsDefault(locations.length === 0);
    setLocationError(null);

    if (isMobile) {
      navigate('/profile?action=add-address');
    } else {
      setIsLocationFormOpen(true);
    }
  };

  // Open Location for Edit: On mobile opens dedicated full-screen screen via URL param; on desktop opens inline
  const handleOpenEditLocation = (loc: CustomerLocation) => {
    setEditingLocationId(loc.id);
    setLocationLabel((loc.label as any) || 'Home');
    setLocationAddress(loc.address);
    setLocationLatitude(loc.latitude);
    setLocationLongitude(loc.longitude);
    setLocationIsDefault(loc.isDefault);
    setLocationError(null);

    if (isMobile) {
      navigate(`/profile?action=edit-address&id=${loc.id}`);
    } else {
      setIsLocationFormOpen(true);
    }
  };

  // Close Mobile Dedicated Screen without saving
  const handleCloseMobileAddress = () => {
    navigate('/profile', { replace: true });
    setIsLocationFormOpen(false);
    setEditingLocationId(null);
    setLocationError(null);
  };

  // Save Confirmed Location from DeliveryLocationPicker (Add Flow)
  const handleSaveLocationConfirmed = async (data: ConfirmedLocationData) => {
    setIsSavingLoc(true);
    setLocationError(null);
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
        setEditingLocationId(null);
        if (actionParam) {
          navigate('/profile', { replace: true });
        }
      } else {
        setLocationError('Unable to save location. Please try again.');
      }
    } catch (_err) {
      setLocationError('Unable to save location. Please try again.');
    } finally {
      setIsSavingLoc(false);
    }
  };

  // GPS Detection for Edit Form
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

  // Save Location for Edit Form (Create or Update)
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
          setEditingLocationId(null);
          if (actionParam) {
            navigate('/profile', { replace: true });
          }
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
          if (actionParam) {
            navigate('/profile', { replace: true });
          }
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
    if (confirm('Are you sure you want to remove this saved delivery location?')) {
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
    navigate('/');
  };

  const handleConfirmDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      const ok = await deleteAccount();
      if (ok) {
        success('Your account and saved data have been permanently deleted.');
        navigate('/');
      } else {
        toastError('Failed to delete account. Please try again.');
      }
    } catch (err: any) {
      toastError(err.message || 'Failed to delete account.');
    } finally {
      setIsDeletingAccount(false);
      setIsDeleteModalOpen(false);
    }
  };

  const getLocationIcon = (label: string) => {
    switch (label?.toLowerCase()) {
      case 'work':
        return <Briefcase size={16} className="text-blue-600" />;
      case 'other':
        return <Package size={16} className="text-purple-600" />;
      case 'home':
      default:
        return <Home size={16} className="text-[#FE8E2A]" />;
    }
  };

  // Reusable Edit Address Form
  const renderEditForm = (isMobileView = false) => (
    <form onSubmit={handleSaveLocation} className="space-y-4">
      <div>
        <label className="text-xs font-bold text-[#2B1408] block mb-1.5">
          Address Label
        </label>
        <div className="flex gap-2">
          {(['Home', 'Work', 'Other'] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLocationLabel(l)}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                locationLabel === l
                  ? 'bg-[#FE8E2A] text-white border-[#FE8E2A] shadow-xs'
                  : 'bg-white text-[#735440] border-[#EEDDCC] hover:bg-stone-50'
              }`}
            >
              {l === 'Home' && <Home size={14} />}
              {l === 'Work' && <Briefcase size={14} />}
              {l === 'Other' && <Package size={14} />}
              <span>{l}</span>
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={handleDetectLocation}
        disabled={isDetectingGps || isSavingLoc}
        className="w-full py-2.5 px-3 rounded-xl border border-[#FE8E2A]/50 bg-[#FFF0DF] hover:bg-[#FFE4CC] text-[#2B1408] text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition disabled:opacity-60"
      >
        {isDetectingGps ? (
          <>
            <Loader2 size={14} className="animate-spin text-[#FE8E2A]" />
            <span>Detecting GPS Location...</span>
          </>
        ) : (
          <>
            <MapPin size={15} className="text-[#FE8E2A]" />
            <span>Use My Current GPS Location</span>
          </>
        )}
      </button>

      {/* Coordinates status badge */}
      {locationLatitude != null && locationLongitude != null && (
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
          <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
          <span>
            GPS Coordinates captured ({locationLatitude.toFixed(4)}, {locationLongitude.toFixed(4)})
          </span>
        </div>
      )}

      {locationError && (
        <p className="text-xs text-red-700 bg-red-50 border border-red-200 p-2.5 rounded-xl font-medium">
          {locationError}
        </p>
      )}

      <div>
        <label className="text-xs font-bold text-[#2B1408] block mb-1">
          Full Street Address
        </label>
        <textarea
          rows={3}
          value={locationAddress}
          onChange={(e) => {
            setLocationAddress(e.target.value);
            if (locationError) setLocationError(null);
          }}
          placeholder="Flat/House No., Building Name, Street, Landmark, Area..."
          required
          className="w-full p-3 rounded-xl bg-white border border-[#EEDDCC] text-xs focus:ring-1 focus:ring-[#FE8E2A] focus:outline-none"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={isMobileView ? 'locDefaultMobile' : 'locDefaultDesktop'}
          checked={locationIsDefault}
          onChange={(e) => setLocationIsDefault(e.target.checked)}
          className="rounded text-[#FE8E2A] focus:ring-[#FE8E2A]"
        />
        <label
          htmlFor={isMobileView ? 'locDefaultMobile' : 'locDefaultDesktop'}
          className="text-xs text-[#2B1408] font-medium cursor-pointer"
        >
          Set as default delivery address
        </label>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          disabled={isSavingLoc}
          onClick={() => {
            if (isMobileView) {
              handleCloseMobileAddress();
            } else {
              setIsLocationFormOpen(false);
              setEditingLocationId(null);
              if (actionParam) navigate('/profile', { replace: true });
            }
          }}
          className="flex-1 py-2.5 rounded-xl text-[#735440] text-xs font-bold hover:bg-[#FDF6EE] border border-[#EEDDCC]"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSavingLoc || isDetectingGps}
          className="flex-1 py-2.5 rounded-xl bg-[#FE8E2A] hover:bg-[#E67616] text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5"
        >
          {isSavingLoc ? (
            <>
              <Loader2 size={14} className="animate-spin text-white" />
              <span>Saving...</span>
            </>
          ) : (
            <span>Save Address</span>
          )}
        </button>
      </div>
    </form>
  );

  // States for determining whether mobile full-screen or desktop inline form is active
  const isMobileDedicatedOpen =
    isMobile && (actionParam === 'add-address' || actionParam === 'edit-address');
  const isFormOpenDesktop =
    !isMobile && (isLocationFormOpen || actionParam === 'add-address' || actionParam === 'edit-address');

  return (
    <main className="py-6 sm:py-10 pb-24 lg:pb-16 bg-[#FAF6F0] min-h-[85vh] text-[#2B1408]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#FE8E2A] hover:text-[#E67616] transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Menu &amp; Ordering</span>
          </Link>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300">
            <ShieldCheck size={14} className="text-emerald-700" />
            <span>Verified Customer</span>
          </div>
        </div>

        {/* Page Title & Subtitle */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-serif text-[#2B1408] tracking-tight">
            Customer Profile
          </h1>
          <p className="text-xs sm:text-sm text-[#735440] mt-1">
            Manage your personal profile, delivery addresses, and account security credentials.
          </p>
        </div>

        {/* ======================================================== */}
        {/* 1. PROFILE INFORMATION AND ACCOUNT DETAILS               */}
        {/* ======================================================== */}
        <section aria-label="Profile Details" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* 1A. Profile Hero & Avatar Card (5 cols on lg) */}
            <div className="lg:col-span-5">
              <div className="bg-[#FFFDF9] border border-[#EEDDCC] rounded-3xl p-6 shadow-sm relative overflow-hidden h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-4">
                    {/* Avatar Display */}
                    <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-[#FE8E2A]/40 bg-[#FFF0DF] flex items-center justify-center shadow-sm shrink-0">
                      {user.profileImageUrl ? (
                        <img
                          src={user.profileImageUrl}
                          alt={user.fullName}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : user.fullName?.trim() ? (
                        <span className="text-2xl font-black text-[#FE8E2A]">
                          {user.fullName.trim().charAt(0).toUpperCase()}
                        </span>
                      ) : (
                        <User size={32} className="text-[#FE8E2A]" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2 className="text-lg font-bold font-serif text-[#2B1408] truncate">
                        {user.fullName}
                      </h2>
                      <p className="text-xs text-[#735440] truncate mt-0.5">
                        {user.email || 'No email attached'}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#8A6E5C] bg-[#FDF6EE] border border-[#EEDDCC] px-2.5 py-0.5 rounded-lg">
                          📞 {user.phone || 'Phone not set'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 1B. Personal Information Card (7 cols on lg) */}
            <div className="lg:col-span-7">
              <div className="bg-[#FFFDF9] border border-[#EEDDCC] rounded-3xl p-6 shadow-sm space-y-4 h-full">
                <div className="flex items-center justify-between pb-3 border-b border-[#EEDDCC]">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#2B1408] uppercase tracking-wider">
                    <User size={15} className="text-[#FE8E2A]" />
                    <span>Personal Details</span>
                  </div>
                  {!isEditingPersonal && (
                    <button
                      type="button"
                      onClick={() => setIsEditingPersonal(true)}
                      className="text-xs font-bold text-[#FE8E2A] hover:text-[#E67616] flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 size={13} />
                      <span>Edit</span>
                    </button>
                  )}
                </div>

                {isEditingPersonal ? (
                  <form onSubmit={handleSavePersonal} className="space-y-3.5">
                    <div>
                      <label className="text-xs font-bold text-[#2B1408] block mb-1">
                        Full Name
                      </label>
                      <div className="relative flex items-center">
                        <User size={14} className="absolute left-3 text-[#8A6E5C]" />
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          required
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-[#EEDDCC] text-xs focus:ring-1 focus:ring-[#FE8E2A] focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#2B1408] block mb-1">
                        Mobile Phone Number
                      </label>
                      <div className="relative flex items-center">
                        <Phone size={14} className="absolute left-3 text-[#8A6E5C]" />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="e.g. 9876543210"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-[#EEDDCC] text-xs focus:ring-1 focus:ring-[#FE8E2A] focus:outline-none"
                        />
                      </div>
                      <span className="text-[10px] text-[#8A6E5C] mt-1 block">
                        Used for WhatsApp dispatch and delivery updates.
                      </span>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-[#2B1408] block mb-1">
                        Email Address
                      </label>
                      <div className="relative flex items-center">
                        <Mail size={14} className="absolute left-3 text-[#8A6E5C]" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-[#EEDDCC] text-xs focus:ring-1 focus:ring-[#FE8E2A] focus:outline-none"
                        />
                      </div>
                      <span className="text-[10px] text-[#8A6E5C] mt-1 block">
                        Used for order receipts and password reset links.
                      </span>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setFullName(user.fullName || '');
                          setEmail(user.email || '');
                          setPhone(user.phone || '');
                          setIsEditingPersonal(false);
                        }}
                        className="flex-1 py-2.5 rounded-xl border border-[#EEDDCC] text-xs font-bold text-[#735440] hover:bg-[#FDF6EE]"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 py-2.5 rounded-xl bg-[#FE8E2A] hover:bg-[#E67616] text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5"
                      >
                        {isLoading && <Loader2 size={13} className="animate-spin" />}
                        <span>Save Changes</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-3 text-xs">
                    <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EEDDCC]/70 space-y-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A6E5C]">
                        Full Name
                      </span>
                      <p className="font-bold text-[#2B1408] text-sm">{user.fullName}</p>
                    </div>

                    <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EEDDCC]/70 space-y-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A6E5C]">
                        Mobile Phone
                      </span>
                      <p className="font-semibold text-[#2B1408] text-sm flex items-center gap-1.5">
                        <span>📞</span>
                        <span>{user.phone || 'Not provided'}</span>
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-[#FAF8F5] border border-[#EEDDCC]/70 space-y-0.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A6E5C]">
                        Email Address
                      </span>
                      <p className="font-semibold text-[#2B1408] text-sm flex items-center gap-1.5">
                        <span>✉️</span>
                        <span>{user.email || 'Not provided'}</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 2. SAVED ADDRESSES SECTION                               */}
        {/* ======================================================== */}
        <section
          aria-label="Saved Delivery Locations"
          className="bg-[#FFFDF9] border border-[#EEDDCC] rounded-3xl p-6 shadow-sm space-y-5"
        >
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3 className="text-lg font-bold font-serif text-[#2B1408] flex items-center gap-2">
                <MapPin size={18} className="text-[#FE8E2A]" />
                <span>Saved Delivery Locations</span>
              </h3>
              <p className="text-xs text-[#735440] mt-0.5">
                Your addresses for accurate distance calculation and seamless doorstep checkout.
              </p>
            </div>

            {!isFormOpenDesktop && (
              <button
                type="button"
                onClick={handleOpenAddLocation}
                className="px-4 py-2.5 rounded-xl bg-[#FE8E2A] hover:bg-[#E67616] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer active:scale-98"
              >
                <Plus size={15} />
                <span>Add New Address</span>
              </button>
            )}
          </div>

          {/* Desktop-Only Inline Add / Edit Address Form */}
          {isFormOpenDesktop && (
            <div className="p-5 rounded-3xl border border-[#FE8E2A]/40 bg-[#FFFDF9] shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#EEDDCC] pb-3">
                <span className="text-sm font-bold font-serif text-[#2B1408]">
                  {editingLocationId ? 'Edit Delivery Address' : 'Add New Delivery Address'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsLocationFormOpen(false);
                    setEditingLocationId(null);
                    if (actionParam) navigate('/profile', { replace: true });
                  }}
                  className="p-1 rounded-lg text-[#8A6E5C] hover:text-[#2B1408] hover:bg-[#FAF6F0]"
                >
                  <X size={16} />
                </button>
              </div>

              {!editingLocationId ? (
                <DeliveryLocationPicker
                  onLocationConfirmed={handleSaveLocationConfirmed}
                  onCancel={() => {
                    setIsLocationFormOpen(false);
                    if (actionParam) navigate('/profile', { replace: true });
                  }}
                  isSaving={isSavingLoc}
                />
              ) : (
                renderEditForm(false)
              )}
            </div>
          )}

          {/* List of Saved Locations */}
          {locations.length === 0 ? (
            <div className="p-8 rounded-3xl border border-dashed border-[#EEDDCC] bg-[#FAF8F5] text-center space-y-3">
              <div className="w-12 h-12 bg-[#FFF0DF] rounded-2xl flex items-center justify-center mx-auto text-2xl">
                📍
              </div>
              <h4 className="text-sm font-bold text-[#2B1408]">No delivery addresses saved yet</h4>
              <p className="text-xs text-[#735440] max-w-sm mx-auto leading-relaxed">
                Add your home, office, or custom address for instant delivery distance calculation and rapid checkout.
              </p>
              <button
                type="button"
                onClick={handleOpenAddLocation}
                className="px-4 py-2.5 rounded-xl bg-[#FE8E2A] hover:bg-[#E67616] text-white text-xs font-bold shadow-xs cursor-pointer active:scale-98"
              >
                + Add Your First Address
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {locations.map((loc) => (
                <div
                  key={loc.id}
                  className="p-4 rounded-2xl border border-[#EEDDCC] bg-[#FAF8F5] hover:border-[#FE8E2A]/50 transition-all shadow-xs flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="p-2.5 rounded-xl bg-[#FFF0DF] border border-[#EEDDCC] shrink-0 mt-0.5">
                      {getLocationIcon(loc.label)}
                    </div>
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-[#2B1408]">{loc.label}</span>
                        {loc.isDefault ? (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider">
                            Default Address
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSetDefault(loc.id)}
                            className="text-[11px] text-[#8A6E5C] hover:text-[#FE8E2A] font-bold cursor-pointer"
                          >
                            Set as Default
                          </button>
                        )}
                      </div>
                      <p className="text-xs text-[#6B5344] leading-relaxed break-words">
                        {loc.address}
                      </p>
                      {loc.latitude != null && loc.longitude != null && (
                        <span className="text-[10px] text-[#8A6E5C] font-mono block">
                          GPS: {loc.latitude.toFixed(4)}, {loc.longitude.toFixed(4)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenEditLocation(loc)}
                      title="Edit address"
                      className="p-2 rounded-xl text-[#8A6E5C] hover:text-[#2B1408] hover:bg-[#FFFDF9] transition cursor-pointer"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteLocation(loc.id)}
                      title="Delete address"
                      className="p-2 rounded-xl text-[#8A6E5C] hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ======================================================== */}
        {/* 3. RESET / CHANGE PASSWORD ACTION                        */}
        {/* ======================================================== */}
        <section
          aria-label="Security and Password"
          className="bg-[#FFFDF9] border border-[#EEDDCC] rounded-3xl p-6 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#EEDDCC]">
            <div className="flex items-center gap-2 text-xs font-bold text-[#2B1408] uppercase tracking-wider">
              <Lock size={15} className="text-[#FE8E2A]" />
              <span>Security &amp; Password</span>
            </div>
            {!isChangingPassword && (
              <button
                type="button"
                onClick={() => {
                  setIsChangingPassword(true);
                  setPasswordError(null);
                }}
                className="text-xs font-bold text-[#FE8E2A] hover:text-[#E67616] flex items-center gap-1 cursor-pointer"
              >
                <KeyRound size={13} />
                <span>Change Password</span>
              </button>
            )}
          </div>

          {/* Password Reset Notice */}
          {resetEmailSentNotice && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
              <span>{resetEmailSentNotice}</span>
            </div>
          )}

          {isChangingPassword ? (
            <form onSubmit={handleUpdatePassword} className="space-y-3.5 max-w-xl">
              {passwordError && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                  {passwordError}
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-[#2B1408]">Current Password</label>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={isSendingResetEmail}
                    className="text-[11px] font-bold text-[#FE8E2A] hover:text-[#E67616] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    {isSendingResetEmail ? (
                      <>
                        <Loader2 size={11} className="animate-spin" />
                        <span>Sending link...</span>
                      </>
                    ) : (
                      <span>Forgot Password?</span>
                    )}
                  </button>
                </div>
                <div className="relative flex items-center">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    required
                    className="w-full pl-3 pr-9 py-2.5 rounded-xl bg-white border border-[#EEDDCC] text-xs focus:ring-1 focus:ring-[#FE8E2A] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword((prev) => !prev)}
                    tabIndex={-1}
                    className="absolute right-2.5 p-1 text-[#8A6E5C] hover:text-[#2B1408] cursor-pointer"
                  >
                    {showCurrentPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#2B1408] block mb-1">
                  New Password
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    className="w-full pl-3 pr-9 py-2.5 rounded-xl bg-white border border-[#EEDDCC] text-xs focus:ring-1 focus:ring-[#FE8E2A] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    tabIndex={-1}
                    className="absolute right-2.5 p-1 text-[#8A6E5C] hover:text-[#2B1408] cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#2B1408] block mb-1">
                  Confirm New Password
                </label>
                <div className="relative flex items-center">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                    className="w-full pl-3 pr-9 py-2.5 rounded-xl bg-white border border-[#EEDDCC] text-xs focus:ring-1 focus:ring-[#FE8E2A] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    tabIndex={-1}
                    className="absolute right-2.5 p-1 text-[#8A6E5C] hover:text-[#2B1408] cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setPasswordError(null);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-[#EEDDCC] text-xs font-bold text-[#735440] hover:bg-[#FDF6EE]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="flex-1 py-2.5 rounded-xl bg-[#FE8E2A] hover:bg-[#E67616] text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5"
                >
                  {isUpdatingPassword && <Loader2 size={13} className="animate-spin" />}
                  <span>Save Password</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs pt-1">
              <div className="text-[#735440]">
                <span>Password is configured and protected with secure salted BCrypt hashing.</span>
              </div>
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={isSendingResetEmail}
                className="text-xs font-bold text-[#FE8E2A] hover:text-[#E67616] hover:underline cursor-pointer shrink-0 inline-flex items-center gap-1.5"
              >
                {isSendingResetEmail ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <span>Send Reset Link to Email</span>
                )}
              </button>
            </div>
          )}
        </section>

        {/* ======================================================== */}
        {/* 4 & 5. ACCOUNT ACTIONS: LOGOUT & DELETE ACCOUNT          */}
        {/* ======================================================== */}
        <section aria-label="Account Actions" className="pt-2 space-y-4">
          <div className="flex items-center justify-between pb-1 border-b border-[#EEDDCC]/70">
            <h3 className="text-xs font-bold text-[#8A6E5C] uppercase tracking-wider">
              Account Actions
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
            {/* 4. Logout action */}
            <div className="bg-[#FFFDF9] border border-[#EEDDCC] rounded-3xl p-5 shadow-sm flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <h4 className="text-sm font-bold font-serif text-[#2B1408] flex items-center gap-2">
                  <LogOut size={16} className="text-[#FE8E2A]" />
                  <span>Sign Out</span>
                </h4>
                <p className="text-xs text-[#735440]">
                  Sign out of your Tryit Cafe &amp; Kitchen customer session on this browser.
                </p>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-stone-50 text-[#735440] hover:text-[#2B1408] font-bold text-xs flex items-center justify-center gap-2 border border-[#EEDDCC] transition cursor-pointer shadow-2xs active:scale-98"
              >
                <LogOut size={15} />
                <span>Log Out of Account</span>
              </button>
            </div>

            {/* 5. Delete Account action */}
            <div className="p-5 rounded-3xl bg-red-50/60 border border-red-200/80 space-y-3 flex flex-col justify-between shadow-2xs">
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-red-900">
                  <ShieldAlert size={16} className="text-red-600" />
                  <span>Permanent Account Deletion</span>
                </div>
                <p className="text-[11px] text-red-700 leading-relaxed">
                  Permanently delete your profile, saved delivery addresses, and customer records from our database.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                className="w-full py-3 px-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition cursor-pointer shadow-xs active:scale-98 flex items-center justify-center gap-2"
              >
                <Trash2 size={15} />
                <span>Delete Account Permanently</span>
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ======================================================== */}
      {/* MOBILE DEDICATED FULL-SCREEN ADDRESS SCREEN             */}
      {/* ======================================================== */}
      {isMobileDedicatedOpen && (
        <div className="fixed inset-0 z-50 bg-[#FAF6F0] flex flex-col overflow-y-auto overscroll-contain">
          {/* Top Bar with Back Button & Screen Title */}
          <header className="sticky top-0 z-30 bg-[#FFFDF9]/95 backdrop-blur-md border-b border-[#EEDDCC] px-4 py-3.5 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCloseMobileAddress}
                className="p-2 -ml-2 rounded-xl text-[#2B1408] hover:bg-[#FAF6F0] transition active:scale-95 cursor-pointer"
                aria-label="Back to profile"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-base font-bold font-serif text-[#2B1408]">
                  {actionParam === 'edit-address' ? 'Edit Delivery Address' : 'Add Delivery Address'}
                </h1>
                <p className="text-[11px] text-[#735440]">Tryit Cafe &amp; Kitchen</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCloseMobileAddress}
              className="text-xs font-bold text-[#8A6E5C] hover:text-[#2B1408] px-2.5 py-1.5 rounded-lg border border-[#EEDDCC] bg-white cursor-pointer shadow-2xs"
            >
              Cancel
            </button>
          </header>

          {/* Dedicated Screen Body */}
          <div className="flex-1 p-4 pb-28 max-w-xl mx-auto w-full">
            {locationError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                {locationError}
              </div>
            )}

            {actionParam === 'edit-address' && editingLocationId ? (
              <div className="bg-[#FFFDF9] border border-[#EEDDCC] rounded-3xl p-5 shadow-sm">
                {renderEditForm(true)}
              </div>
            ) : (
              <DeliveryLocationPicker
                onLocationConfirmed={handleSaveLocationConfirmed}
                onCancel={handleCloseMobileAddress}
                isSaving={isSavingLoc}
              />
            )}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* PERMANENT DELETE ACCOUNT CONFIRMATION MODAL             */}
      {/* ======================================================== */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDeleteModalOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-md bg-white border border-red-200 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 text-[#2B1408] space-y-4"
            >
              <div className="w-14 h-14 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle size={28} />
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-xl font-bold font-serif text-red-900">
                  Permanently Delete Account?
                </h3>
                <p className="text-xs text-[#735440] leading-relaxed">
                  Are you absolutely sure? This will permanently remove your profile, contact details, and all saved delivery locations from our database.
                </p>
              </div>

              <div className="p-3 bg-red-50 border border-red-200 rounded-2xl text-[11px] text-red-800 leading-snug">
                ⚠️ <strong>This action cannot be undone.</strong> Once deleted, you will be logged out and will need to register as a new customer to place orders.
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  disabled={isDeletingAccount}
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-3 rounded-xl border border-[#EEDDCC] text-xs font-bold text-[#735440] hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeletingAccount}
                  onClick={handleConfirmDeleteAccount}
                  className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5"
                >
                  {isDeletingAccount ? (
                    <>
                      <Loader2 size={14} className="animate-spin text-white" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Yes, Delete Account</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
};
