import React, { useState } from 'react';
import { User, Lock, Phone, Save, ShieldCheck, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';

export const OwnerProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuthStore();
  const { success, error: toastError } = useToastStore();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword && newPassword !== confirmPassword) {
      toastError('New passwords do not match');
      return;
    }

    setIsSaving(true);
    try {
      const ok = await updateProfile({
        fullName: fullName.trim() || undefined,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });

      if (ok) {
        success('Owner profile updated successfully!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toastError('Failed to update profile');
      }
    } catch (err: any) {
      toastError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2B1408] font-serif">
          Owner Profile & Security
        </h1>
        <p className="text-xs sm:text-sm text-[#7A5C4A] mt-1">
          Manage your owner credentials and password.
        </p>
      </div>

      <div className="bg-[#FFFBF7] p-6 sm:p-8 rounded-3xl border border-[#EEDDCC] shadow-sm space-y-6">
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#FBEFE1] border border-[#FE8E2A]/30">
          <div className="w-12 h-12 rounded-2xl bg-[#FE8E2A] text-white flex items-center justify-center font-bold text-lg shadow-sm">
            {fullName ? fullName.charAt(0).toUpperCase() : 'O'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[#2B1408]">{fullName || 'Owner'}</span>
              <span className="px-2 py-0.5 rounded-full bg-[#FE8E2A] text-white text-[10px] font-bold uppercase flex items-center gap-1 shadow-sm">
                <ShieldCheck size={10} />
                <span>ROLE_OWNER</span>
              </span>
            </div>
            <span className="text-xs text-[#7A5C4A] font-mono">{user?.phone}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-[#2B1408] block mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3.5 top-3 w-4 h-4 text-[#7A5C4A]" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FDF6EE] border border-[#EEDDCC] text-xs font-medium text-[#2B1408] focus:outline-none focus:ring-2 focus:ring-[#FE8E2A]/30 focus:border-[#FE8E2A]"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-[#2B1408] block mb-1">Primary Login Phone (Permanent)</label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-3 w-4 h-4 text-[#7A5C4A]" />
              <input
                type="text"
                value={user?.phone || ''}
                disabled
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FBEFE1]/60 border border-[#EEDDCC] text-xs font-mono text-[#7A5C4A]"
              />
            </div>
          </div>



          <div className="pt-4 border-t border-[#EEDDCC]/60 space-y-3">
            <h3 className="text-xs font-bold text-[#2B1408] uppercase tracking-wider">Change Password</h3>

            <div>
              <label className="text-xs font-bold text-[#2B1408] block mb-1">Current Password</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 top-3 w-4 h-4 text-[#7A5C4A]" />
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="Enter current password to authorize change"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#FDF6EE] border border-[#EEDDCC] text-xs font-medium text-[#2B1408] focus:outline-none focus:ring-2 focus:ring-[#FE8E2A]/30 focus:border-[#FE8E2A]"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  tabIndex={-1}
                  aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                  className="absolute right-3 p-1 rounded-lg text-[#8A6E5C] hover:text-[#2B1408] transition-colors cursor-pointer focus:outline-none"
                >
                  {showCurrentPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[#2B1408] block mb-1">New Password</label>
                <div className="relative flex items-center">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="At least 6 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-[#FDF6EE] border border-[#EEDDCC] text-xs font-medium text-[#2B1408] focus:outline-none focus:ring-2 focus:ring-[#FE8E2A]/30 focus:border-[#FE8E2A]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((prev) => !prev)}
                    tabIndex={-1}
                    aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                    className="absolute right-3 p-1 rounded-lg text-[#8A6E5C] hover:text-[#2B1408] transition-colors cursor-pointer focus:outline-none"
                  >
                    {showNewPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#2B1408] block mb-1">Confirm New Password</label>
                <div className="relative flex items-center">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-type new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-[#FDF6EE] border border-[#EEDDCC] text-xs font-medium text-[#2B1408] focus:outline-none focus:ring-2 focus:ring-[#FE8E2A]/30 focus:border-[#FE8E2A]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    tabIndex={-1}
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    className="absolute right-3 p-1 rounded-lg text-[#8A6E5C] hover:text-[#2B1408] transition-colors cursor-pointer focus:outline-none"
                  >
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-3 rounded-2xl bg-[#FE8E2A] hover:bg-[#E67616] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-[#FE8E2A]/20 active:scale-95 transition-all disabled:opacity-50 cursor-pointer min-h-[44px]"
            >
              <Save size={16} />
              <span>{isSaving ? 'Updating Profile...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
