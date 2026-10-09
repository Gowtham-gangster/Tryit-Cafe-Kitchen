import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Coffee, Lock, Phone, AlertCircle, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';

export const OwnerLoginPage: React.FC = () => {
  const { ownerLogin, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const success = await ownerLogin(phone.trim(), password.trim());
    if (success) {
      navigate('/owner/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#FDF6EE] flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-[#EEDDCC] rounded-3xl p-8 shadow-xl space-y-6 text-[#23120B]">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <img
            src="/assets/Logo.jpeg"
            alt="TryIt Cafe & Kitchen"
            className="w-20 h-20 rounded-2xl object-contain bg-white p-1 border border-[#EEDDCC] mx-auto shadow-xs mb-3"
          />
          <h1 className="text-2xl font-serif font-black text-[#2B1408]">
            Owner Portal
          </h1>
          <p className="text-xs text-[#735440]">
            Sign in to manage TryIt Cafe & Kitchen live menu, offers, and settings.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs flex items-center gap-2 font-medium">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#2B1408] block mb-1.5">
              Owner Phone Number
            </label>
            <div className="relative flex items-center">
              <Phone size={16} className="absolute left-3.5 text-[#8A6E5C]" />
              <input
                type="tel"
                placeholder="Enter owner phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-[#EEDDCC] text-[#23120B] text-xs font-medium placeholder:text-[#8A6E5C] focus:outline-none focus:ring-2 focus:ring-[#FE8E2A]/30 focus:border-[#FE8E2A] transition-all"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#2B1408] block mb-1.5">
              Security Password
            </label>
            <div className="relative flex items-center">
              <Lock size={16} className="absolute left-3.5 text-[#8A6E5C]" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-3 rounded-2xl bg-white border border-[#EEDDCC] text-[#23120B] text-xs font-medium placeholder:text-[#8A6E5C] focus:outline-none focus:ring-2 focus:ring-[#FE8E2A]/30 focus:border-[#FE8E2A] transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                tabIndex={-1}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 p-1 rounded-lg text-[#8A6E5C] hover:text-[#2B1408] hover:bg-[#FDF6EE] transition-colors cursor-pointer focus:outline-none"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl bg-[#FE8E2A] hover:bg-[#E67616] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#FE8E2A]/25 active:scale-95 transition-all mt-4 disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>

        <div className="pt-4 border-t border-[#EEDDCC] text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#735440] hover:text-[#FE8E2A] transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to Cafe Customer App</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
