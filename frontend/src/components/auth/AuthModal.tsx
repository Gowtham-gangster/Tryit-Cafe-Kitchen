import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Lock,
  Phone,
  User,
  Mail,
  Utensils,
  AlertCircle,
  MapPin,
  Navigation,
  CheckCircle2,
  ArrowLeft,
  ShieldCheck,
  Loader2,
  Edit3,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import { useToastStore } from '../../store/useToastStore';
import { authApi } from '../../api/authApi';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { modalBackdrop, modalContent } from '../../utils/animations';
import { getCurrentBrowserLocation, reverseGeocodeCoordinates } from '../../services/reverseGeocodeService';
import { getGoogleClientId, loadGoogleScript } from '../../services/googleAuthService';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" className="shrink-0" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    authModalMode,
    authModalReason,
    login,
    register,
    googleSignIn,
    isLoading,
    error,
    clearError,
    closeAuthModal,
  } = useAuthStore();

  const {
    pendingAction,
    resumePendingAction,
    pendingCheckout,
    setPendingCheckout,
    setIsCartOpen,
    setIsCheckoutOpen,
  } = useCartStore();
  const { addToast } = useToastStore();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot-password'>(authModalMode);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [localError, setLocalError] = useState<string | null>(null);

  // Forgot Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [isSendingForgot, setIsSendingForgot] = useState(false);
  const [forgotSentSuccess, setForgotSentSuccess] = useState(false);

  // Google Authentication State
  const [isGoogleSigningIn, setIsGoogleSigningIn] = useState(false);
  const [isCompletingGoogleProfile, setIsCompletingGoogleProfile] = useState(false);
  const [pendingGoogleToken, setPendingGoogleToken] = useState<string | null>(null);
  const [googleProfile, setGoogleProfile] = useState<{
    email: string;
    fullName: string;
    profileImageUrl?: string;
  } | null>(null);

  const hiddenGoogleBtnRef = useRef<HTMLDivElement | null>(null);

  // Delivery Location State for Google Onboarding
  const [isLocating, setIsLocating] = useState(false);
  const [locationDeniedNotice, setLocationDeniedNotice] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    label: string;
    address: string;
    latitude: number;
    longitude: number;
  } | null>(null);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [manualAddress, setManualAddress] = useState('');

  // Sync mode with store when opened
  useEffect(() => {
    setMode(authModalMode);
    clearError();
    setLocalError(null);
    setFormErrors({});
    setIsCompletingGoogleProfile(false);
    setPendingGoogleToken(null);
    setGoogleProfile(null);
    setSelectedLocation(null);
    setForgotSentSuccess(false);
    setForgotEmail('');
  }, [authModalMode, isAuthModalOpen]);

  // Pre-load Google Identity Services script
  useEffect(() => {
    if (isAuthModalOpen) {
      loadGoogleScript();
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const validate = () => {
    const errors: { [key: string]: string } = {};
    const cleanPhone = phone.replace(/\s+/g, '');

    if (!cleanPhone) {
      errors.phone = 'Phone number is required';
    } else if (!/^[0-9+]{8,15}$/.test(cleanPhone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (mode === 'register') {
      if (!fullName.trim()) {
        errors.fullName = 'Full name is required';
      }
      if (!email.trim()) {
        errors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.email = 'Please enter a valid email address';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    let success = false;
    if (mode === 'login') {
      success = await login(phone, password);
    } else {
      success = await register(phone, fullName, email || undefined, password);
    }

    if (success) {
      if (pendingAction) {
        addToast({
          type: 'success',
          title: 'Added to Cart!',
          message: `${pendingAction.item.name} has been added to your cart.`,
        });
        resumePendingAction();
      } else {
        addToast({
          type: 'success',
          title: mode === 'login' ? 'Welcome Back!' : 'Account Created!',
          message: 'You are now logged in.',
        });
      }

      // Automatic Checkout Gating Resumption
      if (pendingCheckout) {
        setPendingCheckout(false);
        setIsCartOpen(false);
        setIsCheckoutOpen(true);
      }

      closeAuthModal();
    }
  };

  const processGoogleCredential = async (credential: string) => {
    setIsGoogleSigningIn(true);
    setLocalError(null);
    clearError();

    try {
      const resp = await googleSignIn({ idToken: credential });
      if (!resp) return;

      if (resp.needsProfileCompletion) {
        // Brand-new Google user needing phone and location
        setPendingGoogleToken(credential);
        setGoogleProfile({
          email: resp.email || '',
          fullName: resp.fullName || '',
          profileImageUrl: resp.profileImageUrl,
        });
        setFullName(resp.fullName || '');
        setEmail(resp.email || '');
        setIsCompletingGoogleProfile(true);
      } else {
        // Existing user logged in
        if (pendingAction) {
          addToast({
            type: 'success',
            title: 'Welcome Back!',
            message: `${pendingAction.item.name} has been added to your cart.`,
          });
          resumePendingAction();
        } else {
          addToast({
            type: 'success',
            title: 'Welcome Back!',
            message: 'You are now signed in with Google.',
          });
        }

        // Automatic Checkout Gating Resumption
        if (pendingCheckout) {
          setPendingCheckout(false);
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }

        closeAuthModal();
      }
    } catch (err: any) {
      setLocalError(err.message || 'Unable to sign in with Google. Please try again.');
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  const handleGoogleSignInClick = async () => {
    setLocalError(null);
    clearError();

    const clientId = getGoogleClientId();
    if (!clientId || clientId.includes('your_google_client_id_here')) {
      setLocalError('Google Sign-In is not configured yet. Please configure VITE_GOOGLE_CLIENT_ID in your environment.');
      return;
    }

    setIsGoogleSigningIn(true);
    const loaded = await loadGoogleScript();
    if (!loaded || !window.google?.accounts?.id) {
      setIsGoogleSigningIn(false);
      setLocalError('Google Sign-In is temporarily unavailable. Please check your network or try again.');
      return;
    }

    try {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: { credential?: string }) => {
          if (response.credential) {
            processGoogleCredential(response.credential);
          } else {
            setIsGoogleSigningIn(false);
            setLocalError('No credential received from Google.');
          }
        },
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Render hidden button in container to trigger popup
      if (hiddenGoogleBtnRef.current) {
        hiddenGoogleBtnRef.current.innerHTML = '';
        window.google.accounts.id.renderButton(hiddenGoogleBtnRef.current, {
          type: 'standard',
          size: 'large',
        });
        const buttonEl = hiddenGoogleBtnRef.current.querySelector('div[role="button"]') as HTMLElement;
        if (buttonEl) {
          buttonEl.click();
          return;
        }
      }

      // Fallback prompt
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setIsGoogleSigningIn(false);
        }
      });
    } catch (err: any) {
      console.error('Google Sign-In initialization error:', err);
      setIsGoogleSigningIn(false);
      setLocalError(err.message || 'Unable to initialize Google Sign-In.');
    }
  };

  const handleDetectLocation = async () => {
    setIsLocating(true);
    setLocationDeniedNotice(null);
    try {
      const coords = await getCurrentBrowserLocation();
      const addressText = await reverseGeocodeCoordinates(coords.latitude, coords.longitude);
      setSelectedLocation({
        label: 'Current Location',
        address: addressText,
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      setManualAddress(addressText);
    } catch (err: any) {
      console.warn('Geolocation notice:', err.message);
      setLocationDeniedNotice(
        'Location permission was denied or unavailable. You can enter your delivery address manually below.'
      );
    } finally {
      setIsLocating(false);
    }
  };

  const handleCompleteGoogleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingGoogleToken) return;

    const cleanPhone = phone.replace(/\s+/g, '');
    if (!cleanPhone || !/^[0-9+]{8,15}$/.test(cleanPhone)) {
      setLocalError('Please enter a valid 10-digit mobile phone number');
      return;
    }

    setIsGoogleSigningIn(true);
    setLocalError(null);
    clearError();

    try {
      const finalAddress = isEditingAddress ? manualAddress.trim() : selectedLocation?.address || '';
      const resp = await googleSignIn({
        idToken: pendingGoogleToken,
        phone: cleanPhone,
        address: finalAddress || undefined,
        latitude: selectedLocation?.latitude,
        longitude: selectedLocation?.longitude,
        locationLabel: selectedLocation?.label || 'Default',
      });

      if (resp && !resp.needsProfileCompletion) {
        addToast({
          type: 'success',
          title: 'Account Created!',
          message: 'Welcome to TryIt Cafe & Kitchen!',
        });
        if (pendingAction) {
          resumePendingAction();
        }

        // Automatic Checkout Gating Resumption
        if (pendingCheckout) {
          setPendingCheckout(false);
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }

        closeAuthModal();
      }
    } catch (err: any) {
      setLocalError(err.message || 'Failed to complete registration.');
    } finally {
      setIsGoogleSigningIn(false);
    }
  };

  const handleSendForgotPassword = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = forgotEmail.trim();
    if (!query) {
      setLocalError('Please enter your registered email address or phone number');
      return;
    }

    setIsSendingForgot(true);
    setLocalError(null);
    clearError();

    try {
      const msg = await authApi.forgotPassword(query);
      setForgotSentSuccess(true);
      addToast({
        type: 'success',
        title: 'Reset Link Sent',
        message: msg || 'Please check your email inbox for the reset link.',
      });
    } catch (err: any) {
      setLocalError(
        err.response?.data?.message ||
          err.message ||
          'Failed to send password reset link. Please verify your details.'
      );
    } finally {
      setIsSendingForgot(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          variants={modalBackdrop}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={closeAuthModal}
          className="fixed inset-0 bg-black/75 backdrop-blur-md"
        />

        {/* Modal Dialog */}
        <motion.div
          variants={modalContent}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="relative w-full max-w-md bg-[#FFFBF7] border border-[#EEDDCC] rounded-3xl p-6 sm:p-8 shadow-2xl z-10 max-h-[92vh] overflow-y-auto text-[#23120B]"
        >
          {/* Hidden container for GIS button trigger */}
          <div ref={hiddenGoogleBtnRef} className="hidden" aria-hidden="true" />

          {/* Close Button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={closeAuthModal}
            className="absolute top-4 right-4 p-2 text-[#735440] hover:text-[#2B1408] rounded-xl hover:bg-[#FDF6EE] transition cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </motion.button>

          {isCompletingGoogleProfile ? (
            /* ========================================================= */
            /* VIEW A: COMPLETE YOUR PROFILE (NEW GOOGLE CUSTOMER)       */
            /* ========================================================= */
            <div>
              {/* Back to normal view */}
              <div className="flex items-center gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setIsCompletingGoogleProfile(false)}
                  className="p-1 rounded-lg text-[#735440] hover:text-[#2B1408] hover:bg-[#FDF6EE] transition cursor-pointer"
                  aria-label="Back"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h3 className="text-xl font-serif font-black text-[#2B1408]">Complete Your Profile</h3>
                  <p className="text-xs text-[#735440]">
                    Just add your phone number and delivery location.
                  </p>
                </div>
              </div>

              {/* Google Verified Identity Badge */}
              <div className="p-3 rounded-2xl bg-[#FFF0DF] border border-[#EEDDCC] mb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 truncate">
                  {googleProfile?.profileImageUrl ? (
                    <img
                      src={googleProfile.profileImageUrl}
                      alt="Google avatar"
                      className="w-9 h-9 rounded-full object-cover shrink-0 border border-[#FE8E2A]/30"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#FE8E2A] text-white font-bold flex items-center justify-center shrink-0 text-sm">
                      G
                    </div>
                  )}
                  <div className="truncate">
                    <span className="font-bold text-[#2B1408] text-xs block truncate">
                      {googleProfile?.fullName || 'Google Customer'}
                    </span>
                    <span className="text-[11px] text-[#735440] block truncate">
                      {googleProfile?.email}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full shrink-0">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Verified</span>
                </div>
              </div>

              {/* Error Feedback */}
              {(error || localError) && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-2.5 text-red-500 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error || localError}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleCompleteGoogleRegistration} className="space-y-4">
                <Input
                  label="Full Name"
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  icon={<User className="w-4 h-4 text-[#8A6E5C]" />}
                />

                <Input
                  label="Verified Email"
                  type="email"
                  value={email}
                  disabled
                  readOnly
                  icon={<span className="text-sm">✉️</span>}
                  className="opacity-70 cursor-not-allowed bg-[#FDF6EE]"
                />

                <div>
                  <Input
                    label="Phone Number (Required)"
                    placeholder="e.g. 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    icon={<span className="text-sm">📞</span>}
                    required
                  />
                  <span className="text-[10px] text-[#8A6E5C] mt-1 block">
                    Used for WhatsApp order updates and delivery coordination.
                  </span>
                </div>

                {/* Delivery Location Section */}
                <div className="pt-1">
                  <label className="text-xs font-bold text-[#2B1408] block mb-1.5 flex items-center justify-between">
                    <span>Delivery Location</span>
                    {selectedLocation && (
                      <button
                        type="button"
                        onClick={() => setIsEditingAddress(!isEditingAddress)}
                        className="text-[11px] text-[#FE8E2A] hover:text-[#E67616] flex items-center gap-1 font-semibold cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>{isEditingAddress ? 'Keep GPS Address' : 'Edit Manually'}</span>
                      </button>
                    )}
                  </label>

                  {/* Geolocation Button */}
                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={isLocating}
                    className="w-full py-2.5 px-3.5 rounded-xl border border-dashed border-[#FE8E2A]/50 bg-[#FFF0DF] hover:bg-[#FFE4CC] text-[#2B1408] text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                  >
                    {isLocating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-[#FE8E2A]" />
                        <span>Detecting your delivery location...</span>
                      </>
                    ) : (
                      <>
                        <span className="text-sm">📍</span>
                        <span>Use My Current Location</span>
                      </>
                    )}
                  </button>

                  {locationDeniedNotice && (
                    <p className="text-[11px] text-[#FE8E2A] mt-1.5 leading-snug">
                      {locationDeniedNotice}
                    </p>
                  )}

                  {selectedLocation && !isEditingAddress && (
                    <div className="mt-2.5 p-3 rounded-xl bg-white border border-[#EEDDCC] text-xs text-[#23120B] flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-[#FE8E2A] shrink-0 mt-0.5" />
                      <div className="truncate">
                        <span className="font-semibold text-[#2B1408] block">Detected Delivery Location</span>
                        <p className="text-[11px] text-[#735440] line-clamp-2">{selectedLocation.address}</p>
                      </div>
                    </div>
                  )}

                  {isEditingAddress && (
                    <div className="mt-2">
                      <textarea
                        rows={2}
                        placeholder="Flat / House No., Landmark, Area..."
                        value={manualAddress}
                        onChange={(e) => setManualAddress(e.target.value)}
                        className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#EEDDCC] text-xs text-[#23120B] placeholder-[#8A6E5C] focus:outline-none focus:border-[#FE8E2A] focus:ring-2 focus:ring-[#FE8E2A]/30 resize-none"
                      />
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full mt-4 font-bold cursor-pointer"
                  isLoading={isGoogleSigningIn || isLoading}
                >
                  Complete Registration & Order
                </Button>
              </form>
            </div>
          ) : mode === 'forgot-password' ? (
            /* ========================================================= */
            /* VIEW C: FORGOT PASSWORD REQUEST                           */
            /* ========================================================= */
            <div>
              {/* Back to sign in */}
              <div className="flex items-center gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setLocalError(null);
                    clearError();
                  }}
                  className="p-1 rounded-lg text-[#735440] hover:text-[#2B1408] hover:bg-[#FDF6EE] transition cursor-pointer"
                  aria-label="Back to Sign In"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h3 className="text-xl font-serif font-black text-[#2B1408]">Reset Password</h3>
                  <p className="text-xs text-[#735440]">
                    We will send a reset link to your registered email
                  </p>
                </div>
              </div>

              {/* Error Alert */}
              {(error || localError) && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-2.5 text-red-500 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error || localError}</span>
                </div>
              )}

              {forgotSentSuccess ? (
                <div className="space-y-4 text-center py-2">
                  <div className="w-14 h-14 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                    <CheckCircle2 size={30} />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-[#2B1408]">Reset Link Sent!</h4>
                    <p className="text-xs text-[#735440] mt-1.5 leading-relaxed">
                      We've dispatched a password reset link to the email on file for <strong className="text-[#2B1408]">{forgotEmail}</strong>.
                    </p>
                  </div>
                  <div className="p-3.5 bg-[#FDF6EE] border border-[#EEDDCC] rounded-2xl text-[11px] text-[#8A6E5C] text-left space-y-1.5">
                    <p className="font-bold text-[#2B1408]">What to do next:</p>
                    <p>• Check your inbox and spam/junk folder for the email.</p>
                    <p>• Click the <strong>Reset My Password</strong> button in the email.</p>
                    <p>• The reset link is valid for <strong>15 minutes</strong>.</p>
                  </div>
                  <div className="pt-2 space-y-2">
                    <Button
                      type="button"
                      variant="primary"
                      size="lg"
                      onClick={() => {
                        setMode('login');
                        setForgotSentSuccess(false);
                      }}
                      className="w-full font-bold cursor-pointer"
                    >
                      Back to Sign In
                    </Button>
                    <button
                      type="button"
                      onClick={() => handleSendForgotPassword()}
                      disabled={isSendingForgot}
                      className="text-xs text-[#8A6E5C] hover:text-[#FE8E2A] underline cursor-pointer"
                    >
                      {isSendingForgot ? 'Resending...' : "Didn't receive email? Send Again"}
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSendForgotPassword} className="space-y-4">
                  <p className="text-xs text-[#735440] leading-relaxed">
                    Enter your registered email address or mobile phone number. We'll send a password recovery link directly to your email inbox.
                  </p>

                  <Input
                    label="Email Address or Phone Number"
                    placeholder="e.g. name@example.com or 9876543210"
                    value={forgotEmail}
                    onChange={(e) => {
                      setForgotEmail(e.target.value);
                      setLocalError(null);
                    }}
                    icon={<Mail className="w-4 h-4 text-[#8A6E5C]" />}
                    required
                  />

                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-full font-bold cursor-pointer mt-2"
                    isLoading={isSendingForgot}
                  >
                    Send Password Reset Link
                  </Button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('login');
                        setLocalError(null);
                      }}
                      className="text-xs font-semibold text-[#8A6E5C] hover:text-[#2B1408] transition cursor-pointer"
                    >
                      Remember your password? <span className="text-[#FE8E2A] underline">Sign In</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* ========================================================= */
            /* VIEW B: STANDARD LOGIN / REGISTER + CONTINUE WITH GOOGLE  */
            /* ========================================================= */
            <>
              {/* Modal Header */}
              <div className="text-center mb-6">
                <img
                  src="/assets/Logo.jpeg"
                  alt="TryIt Cafe & Kitchen"
                  className="w-16 h-16 rounded-2xl object-contain bg-white p-1 border border-[#EEDDCC] mx-auto shadow-xs mb-3"
                />
                <h3 className="text-2xl font-serif font-black text-[#2B1408]">
                  {mode === 'login' ? 'Welcome Back' : 'Create an Account'}
                </h3>
                <p className="text-xs sm:text-sm text-[#735440] mt-1">
                  {authModalReason ||
                    (pendingAction
                      ? `Sign in to add ${pendingAction.item.name} to your cart.`
                      : 'Experience lightning-fast ordering at TryIt Cafe.')}
                </p>
              </div>

              {/* Animated Tabs */}
              <div className="flex bg-[#F2E5D6] p-1.5 rounded-2xl mb-5 border border-[#EEDDCC] relative">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    clearError();
                    setLocalError(null);
                  }}
                  className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all relative z-10 cursor-pointer ${
                    mode === 'login' ? 'text-white' : 'text-[#735440] hover:text-[#2B1408]'
                  }`}
                >
                  {mode === 'login' && (
                    <motion.div
                      layoutId="activeAuthTab"
                      className="absolute inset-0 bg-[#FE8E2A] rounded-xl shadow-md -z-10"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    clearError();
                    setLocalError(null);
                  }}
                  className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-xl transition-all relative z-10 cursor-pointer ${
                    mode === 'register' ? 'text-white' : 'text-[#735440] hover:text-[#2B1408]'
                  }`}
                >
                  {mode === 'register' && (
                    <motion.div
                      layoutId="activeAuthTab"
                      className="absolute inset-0 bg-[#FE8E2A] rounded-xl shadow-md -z-10"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  New Customer
                </button>
              </div>

              {/* Backend or Local Error Alert */}
              {(error || localError) && (
                <motion.div
                  animate={{ x: [-6, 6, -4, 4, 0] }}
                  transition={{ duration: 0.3 }}
                  className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-2.5 text-red-500 text-xs font-semibold"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error || localError}</span>
                </motion.div>
              )}

              {/* ------------------------------------------------------------- */}
              {/* GOOGLE SIGN-IN BUTTON (VISIBLE ON BOTH LOGIN & REGISTRATION)  */}
              {/* ------------------------------------------------------------- */}
              <div className="mb-4">
                <button
                  type="button"
                  id="google-signin-btn"
                  onClick={handleGoogleSignInClick}
                  disabled={isGoogleSigningIn || isLoading}
                  className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-[#FDF6EE] text-[#2B1408] border border-[#EEDDCC] hover:border-[#FE8E2A] text-xs sm:text-sm font-bold flex items-center justify-center gap-3 transition-all shadow-xs active:scale-[0.99] cursor-pointer disabled:opacity-50 min-h-[44px]"
                >
                  {isGoogleSigningIn ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#735440]" />
                      <span>Signing in with Google...</span>
                    </>
                  ) : (
                    <>
                      <GoogleIcon />
                      <span>Continue with Google</span>
                    </>
                  )}
                </button>
              </div>

              {/* ---------------- Divider: OR ---------------- */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#EEDDCC]" />
                </div>
                <div className="relative flex justify-center text-[10px] sm:text-xs uppercase">
                  <span className="bg-[#FFFBF7] px-3 text-[#8A6E5C] font-bold tracking-wider">
                    OR
                  </span>
                </div>
              </div>

              {/* Email / Phone & Password Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'register' && (
                  <Input
                    label="Full Name"
                    placeholder="e.g. Priya Sharma"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    error={formErrors.fullName}
                    icon={<User className="w-4 h-4 text-stone-400" />}
                  />
                )}

                <Input
                  label="Phone Number"
                  placeholder="e.g. 9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  error={formErrors.phone}
                  icon={<span className="text-sm">📞</span>}
                />

                {mode === 'register' && (
                  <Input
                    label="Email"
                    type="email"
                    placeholder="e.g. priya@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={formErrors.email}
                    icon={<span className="text-sm">✉️</span>}
                    required
                  />
                )}

                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  error={formErrors.password}
                  icon={<Lock className="w-4 h-4 text-stone-400" />}
                />

                {mode === 'login' && (
                  <div className="flex justify-end -mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMode('forgot-password');
                        setForgotSentSuccess(false);
                        setForgotEmail(phone || '');
                        setLocalError(null);
                        clearError();
                      }}
                      className="text-xs font-semibold text-[#FE8E2A] hover:text-[#E67616] hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full mt-3 font-bold cursor-pointer"
                  isLoading={isLoading}
                >
                  {mode === 'login' ? 'Sign In & Continue' : 'Create Account & Order'}
                </Button>
              </form>

              {/* Footer Note */}
              <p className="text-center text-[11px] text-stone-500 mt-5 font-medium">
                🔒 By continuing, you agree to TryIt Cafe's friendly ordering policy.
              </p>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
