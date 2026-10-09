import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../store/useAuthStore';
import { useToastStore } from '../store/useToastStore';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const { openAuthModal } = useAuthStore();
  const { addToast } = useToastStore();

  const [isVerifying, setIsVerifying] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userFullName, setUserFullName] = useState<string | null>(null);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = 'Reset Password — Tryit Cafe & Kitchen';

    if (!token) {
      setIsVerifying(false);
      setIsValidToken(false);
      return;
    }

    const verify = async () => {
      try {
        const resp = await authApi.verifyResetToken(token);
        if (resp && resp.valid) {
          setIsValidToken(true);
          setUserEmail(resp.email || null);
          setUserFullName(resp.fullName || null);
        } else {
          setIsValidToken(false);
        }
      } catch (err) {
        setIsValidToken(false);
      } finally {
        setIsVerifying(false);
      }
    };

    verify();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!newPassword) {
      setErrorMsg('Please enter your new password.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please ensure both fields are identical.');
      return;
    }

    setIsSubmitting(true);

    try {
      await authApi.resetPassword(token!, newPassword);
      setIsSuccess(true);
      addToast({
        type: 'success',
        title: 'Password Updated!',
        message: 'Your password has been updated successfully.',
      });
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message ||
          err.message ||
          'Failed to reset password. The link may have expired.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenLogin = () => {
    navigate('/');
    setTimeout(() => {
      openAuthModal('login', 'Please sign in with your new password.');
    }, 100);
  };

  return (
    <main className="py-12 sm:py-20 bg-[#FAF6F0] min-h-[85vh] flex items-center justify-center px-4 text-[#2B1408]">
      <div className="w-full max-w-md">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#FE8E2A] hover:text-[#E67616] transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Card Container */}
        <div className="bg-[#FFFDF9] border border-[#EEDDCC] rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          {/* Header Branding */}
          <div className="text-center mb-6">
            <img
              src="/assets/Logo.jpeg"
              alt="Tryit Cafe & Kitchen"
              className="w-16 h-16 rounded-2xl object-contain bg-white p-1 border border-[#EEDDCC] mx-auto shadow-xs mb-3"
            />
            <h1 className="text-2xl font-serif font-black text-[#2B1408]">
              {isSuccess
                ? 'Password Updated!'
                : !isValidToken && !isVerifying
                ? 'Link Invalid or Expired'
                : 'Reset Your Password'}
            </h1>
            <p className="text-xs sm:text-sm text-[#735440] mt-1">
              {isSuccess
                ? 'Your password has been changed successfully.'
                : !isValidToken && !isVerifying
                ? 'This password reset link is invalid or has expired.'
                : 'Enter and confirm your new secure password below.'}
            </p>
          </div>

          {/* 1. VERIFYING STATE */}
          {isVerifying && (
            <div className="py-12 text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-[#FE8E2A] mx-auto" />
              <p className="text-xs font-semibold text-[#8A6E5C]">
                Verifying your secure password reset link...
              </p>
            </div>
          )}

          {/* 2. INVALID / EXPIRED TOKEN STATE */}
          {!isVerifying && !isValidToken && !isSuccess && (
            <div className="space-y-5 text-center">
              <div className="w-14 h-14 bg-red-50 border border-red-200 text-red-500 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle size={28} />
              </div>

              <div className="p-4 bg-red-50/60 border border-red-200/70 rounded-2xl text-xs text-red-800 text-left space-y-1.5 leading-relaxed">
                <p className="font-bold flex items-center gap-1.5 text-red-900">
                  <span>Why did this happen?</span>
                </p>
                <ul className="list-disc pl-4 space-y-1 text-red-700 text-[11px]">
                  <li>Password reset links are valid for <strong>15 minutes</strong>.</li>
                  <li>The link may have already been used to change your password.</li>
                  <li>The URL might be incomplete or copied incorrectly.</li>
                </ul>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    navigate('/');
                    setTimeout(() => {
                      openAuthModal('login', 'Click "Forgot Password?" to receive a new link.');
                    }, 100);
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-[#FE8E2A] hover:bg-[#E67616] text-white text-xs sm:text-sm font-bold shadow-md transition cursor-pointer"
                >
                  Request a New Reset Link
                </button>
                <Link
                  to="/"
                  className="block w-full py-2.5 px-4 rounded-xl border border-[#EEDDCC] hover:bg-[#FDF6EE] text-[#735440] text-xs font-semibold transition"
                >
                  Return to Home
                </Link>
              </div>
            </div>
          )}

          {/* 3. SUCCESS STATE */}
          {isSuccess && (
            <div className="space-y-5 text-center">
              <div className="w-16 h-16 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 size={36} />
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 leading-relaxed">
                <p className="font-bold text-emerald-950 mb-1">
                  Ready to Sign In!
                </p>
                <p className="text-[11px] text-emerald-800">
                  Your new password is now active. You can log in immediately and continue ordering your favorite dishes.
                </p>
              </div>

              <button
                type="button"
                onClick={handleOpenLogin}
                className="w-full py-3.5 px-4 rounded-xl bg-[#FE8E2A] hover:bg-[#E67616] text-white text-sm font-bold shadow-md transition cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Sign In to Your Account</span>
                <ShieldCheck size={16} />
              </button>
            </div>
          )}

          {/* 4. RESET FORM STATE (TOKEN VALID) */}
          {!isVerifying && isValidToken && !isSuccess && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* User greeting if available */}
              {(userFullName || userEmail) && (
                <div className="p-3 bg-[#FDF6EE] border border-[#EEDDCC] rounded-2xl flex items-center gap-2.5 text-xs">
                  <div className="w-8 h-8 rounded-full bg-[#FE8E2A] text-white font-bold flex items-center justify-center text-xs shrink-0">
                    {userFullName ? userFullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="truncate">
                    <span className="font-bold text-[#2B1408] block truncate">
                      {userFullName || 'Account'}
                    </span>
                    <span className="text-[11px] text-[#735440] block truncate">
                      {userEmail}
                    </span>
                  </div>
                </div>
              )}

              {/* Error Banner */}
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center gap-2.5 text-red-600 text-xs font-semibold"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </motion.div>
              )}

              {/* New Password */}
              <div>
                <label className="text-xs font-bold text-[#2B1408] block mb-1">
                  New Password
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-[#8A6E5C]">
                    <Lock size={15} />
                  </div>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white border border-[#EEDDCC] text-xs sm:text-sm text-[#23120B] placeholder-[#A89284] focus:outline-none focus:border-[#FE8E2A] focus:ring-2 focus:ring-[#FE8E2A]/20 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    tabIndex={-1}
                    className="absolute right-3 text-[#8A6E5C] hover:text-[#2B1408] transition cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="text-xs font-bold text-[#2B1408] block mb-1">
                  Confirm New Password
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-3 text-[#8A6E5C]">
                    <KeyRound size={15} />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your new password"
                    required
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white border border-[#EEDDCC] text-xs sm:text-sm text-[#23120B] placeholder-[#A89284] focus:outline-none focus:border-[#FE8E2A] focus:ring-2 focus:ring-[#FE8E2A]/20 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    tabIndex={-1}
                    className="absolute right-3 text-[#8A6E5C] hover:text-[#2B1408] transition cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Password Match Indicator */}
              {newPassword && confirmPassword && (
                <div className="text-[11px] flex items-center gap-1.5 font-medium">
                  {newPassword === confirmPassword ? (
                    <span className="text-emerald-700 flex items-center gap-1">
                      <Check size={12} /> Passwords match
                    </span>
                  ) : (
                    <span className="text-amber-700 flex items-center gap-1">
                      <AlertCircle size={12} /> Passwords do not match
                    </span>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3 px-4 rounded-xl bg-[#FE8E2A] hover:bg-[#E67616] text-white text-xs sm:text-sm font-bold shadow-md transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
};
