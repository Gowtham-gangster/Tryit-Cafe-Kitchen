import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Power,
  Clock,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Save,
} from 'lucide-react';
import { ownerApi } from '../../api/ownerApi';
import { useToastStore } from '../../store/useToastStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { Modal } from '../common/Modal';

interface OnlineOrderingControlProps {
  onStatusChanged?: (enabled: boolean) => void;
}

export const OnlineOrderingControl: React.FC<OnlineOrderingControlProps> = ({ onStatusChanged }) => {
  const { settings, fetchSettings, updateLocalOrderingStatus } = useSettingsStore();
  const { success, error: toastError } = useToastStore();

  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [closureMessage, setClosureMessage] = useState<string>('');
  const [nextOpeningTime, setNextOpeningTime] = useState<string>('');

  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [pendingTargetState, setPendingTargetState] = useState<boolean>(false);
  const [showConfigDrawer, setShowConfigDrawer] = useState<boolean>(false);

  // Synchronize state with settings store
  useEffect(() => {
    if (settings) {
      setIsOpen(settings.onlineOrderingEnabled !== false);
      setClosureMessage(settings.closureMessage || '');
      setNextOpeningTime(settings.nextOpeningTime || '');
    }
  }, [settings]);

  // Load latest settings on mount
  useEffect(() => {
    const loadStatus = async () => {
      try {
        const data = await ownerApi.getOnlineOrderingStatus();
        setIsOpen(data.onlineOrderingEnabled);
        setClosureMessage(data.closureMessage || '');
        setNextOpeningTime(data.nextOpeningTime || '');
      } catch (_e) {
        // Fallback to loaded store settings
        if (settings) {
          setIsOpen(settings.onlineOrderingEnabled !== false);
        }
      }
    };
    loadStatus();
  }, [settings]);

  const handleInitiateToggle = (targetState: boolean) => {
    setPendingTargetState(targetState);
    setShowConfirmModal(true);
  };

  const handleConfirmToggle = async () => {
    setIsUpdating(true);
    try {
      await ownerApi.updateOnlineOrderingStatus({
        enabled: pendingTargetState,
        closureMessage: closureMessage.trim() || undefined,
        nextOpeningTime: nextOpeningTime.trim() || undefined,
      });

      setIsOpen(pendingTargetState);
      updateLocalOrderingStatus(pendingTargetState, closureMessage, nextOpeningTime);
      setShowConfirmModal(false);

      if (pendingTargetState) {
        success('Online ordering is now open.');
      } else {
        success('Online ordering is now closed.');
      }

      if (onStatusChanged) {
        onStatusChanged(pendingTargetState);
      }

      // Re-fetch to ensure complete sync
      fetchSettings(true);
    } catch (err: any) {
      if (err?.response?.status === 403 || err?.response?.status === 401) {
        toastError('Access denied: Owner privileges required. Redirecting to owner login...');
        setTimeout(() => {
          window.location.href = '/owner/login';
        }, 1200);
      } else {
        toastError(err?.response?.data?.message || 'Failed to update online ordering status.');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveMessageSettings = async () => {
    setIsUpdating(true);
    try {
      await ownerApi.updateOnlineOrderingStatus({
        enabled: isOpen,
        closureMessage: closureMessage.trim() || undefined,
        nextOpeningTime: nextOpeningTime.trim() || undefined,
      });
      updateLocalOrderingStatus(isOpen, closureMessage, nextOpeningTime);
      success('Closure message and timings updated successfully.');
      fetchSettings(true);
    } catch (err: any) {
      if (err?.response?.status === 403 || err?.response?.status === 401) {
        toastError('Access denied: Owner privileges required. Redirecting to owner login...');
        setTimeout(() => {
          window.location.href = '/owner/login';
        }, 1200);
      } else {
        toastError(err?.response?.data?.message || 'Failed to save settings.');
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="w-full">
      {/* Main Control Card */}
      <motion.div
        layout
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`relative overflow-hidden rounded-3xl border transition-all duration-300 shadow-md ${
          isOpen
            ? 'bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50 border-emerald-200'
            : 'bg-gradient-to-br from-red-50 via-white to-red-50/50 border-red-200'
        }`}
      >
        {/* Subtle accent glow border on top */}
        <div
          className={`h-1.5 w-full ${
            isOpen
              ? 'bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500'
              : 'bg-gradient-to-r from-red-500 via-rose-500 to-red-600'
          }`}
        />

        <div className="p-4 sm:p-7">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 sm:gap-6">
            {/* Left Column: Status Badge, Title & Explanation */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full text-[11px] sm:text-xs font-black uppercase tracking-wider shadow-xs ${
                    isOpen
                      ? 'bg-emerald-100 text-emerald-900 border border-emerald-300/80'
                      : 'bg-red-100 text-red-900 border border-red-300/80'
                  }`}
                  role="status"
                  aria-live="polite"
                >
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-red-500 animate-pulse'
                    }`}
                  />
                  <span>{isOpen ? '🟢 ONLINE ORDERING OPEN' : '🔴 ONLINE ORDERING CLOSED'}</span>
                </span>

                <span className="text-[11px] font-semibold text-stone-500 hidden sm:inline">
                  (Global Storefront Control)
                </span>
              </div>

              <h2 className="text-lg sm:text-2xl font-black text-stone-900 font-display">
                {isOpen ? 'Customers can place orders.' : 'Customers can browse but cannot order.'}
              </h2>

              <p className="text-xs sm:text-sm text-stone-600 max-w-xl leading-relaxed">
                {isOpen ? (
                  <>
                    Digital menu additions, cart modifications, and WhatsApp order dispatches are currently{' '}
                    <strong className="text-emerald-800">fully operational</strong>.
                  </>
                ) : (
                  <>
                    Menu browsing, offers, and reviews remain active. Cart item additions, modifications, and
                    WhatsApp order dispatches are{' '}
                    <strong className="text-red-700">strictly blocked</strong>.
                  </>
                )}
              </p>

              {/* Show Active Closure Message if closed */}
              {!isOpen && (closureMessage || nextOpeningTime) && (
                <div className="p-3 rounded-2xl bg-red-100/70 border border-red-200 text-xs text-red-900 space-y-1">
                  {closureMessage && (
                    <p className="font-medium">
                      <strong>Customer Notice:</strong> "{closureMessage}"
                    </p>
                  )}
                  {nextOpeningTime && (
                    <p className="text-[11px] font-bold text-red-800 flex items-center gap-1.5">
                      <Clock size={12} />
                      <span>Next Opening Time: {nextOpeningTime}</span>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Action Buttons & Config (stacked on mobile, inline on tablet/desktop) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 shrink-0 w-full md:w-auto">

              {/* Explicit Action Button with exact prompt specifications */}
              {isOpen ? (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleInitiateToggle(false)}
                  disabled={isUpdating}
                  className="w-full sm:w-auto justify-center px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs sm:text-sm tracking-wide shadow-md shadow-red-600/20 flex items-center gap-2 transition-all cursor-pointer min-h-[44px]"
                >
                  <Power size={16} />
                  <span>Close Online Ordering</span>
                </motion.button>
              ) : (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => handleInitiateToggle(true)}
                  disabled={isUpdating}
                  className="w-full sm:w-auto justify-center px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm tracking-wide shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all cursor-pointer min-h-[44px]"
                >
                  <CheckCircle size={16} />
                  <span>Open Online Ordering</span>
                </motion.button>
              )}

              {/* Quick Config Button */}
              <button
                type="button"
                onClick={() => setShowConfigDrawer(!showConfigDrawer)}
                className="w-full sm:w-auto justify-center px-4 py-2.5 sm:py-3 rounded-2xl bg-white border border-stone-200 text-stone-700 hover:text-stone-900 hover:bg-stone-50 transition-colors shadow-2xs flex items-center gap-1.5 text-xs font-bold min-h-[44px]"
                aria-expanded={showConfigDrawer}
                aria-label="Configure closure message and next opening time"
              >
                <MessageSquare size={16} />
                <span>Message & Timings</span>
                {showConfigDrawer ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
          </div>

          {/* Collapsible Configuration Drawer for Closure Message & Timings */}
          <AnimatePresence>
            {showConfigDrawer && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden pt-5 mt-5 border-t border-stone-200/80"
              >
                <div className="bg-white/80 rounded-2xl p-4 sm:p-5 border border-stone-200 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                        <MessageSquare size={14} className="text-amber-600" />
                        <span>Customer Closure Message & Reopening Timing</span>
                      </h4>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        Shown to customers on the website banner and cart drawer when online ordering is closed.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveMessageSettings}
                      disabled={isUpdating}
                      className="px-4 py-2 rounded-xl bg-[#FE8E2A] hover:bg-[#E67616] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                    >
                      <Save size={14} />
                      <span>Save Message</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Closure Message Field */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#2B1408] block">
                        Closure Message (Optional)
                      </label>
                      <input
                        type="text"
                        value={closureMessage}
                        onChange={(e) => setClosureMessage(e.target.value)}
                        placeholder="e.g. Online ordering is currently closed. We'll be back tomorrow!"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EEDDCC] text-xs font-medium text-[#23120B] focus:outline-none focus:ring-2 focus:ring-[#FE8E2A]/30"
                      />
                      <span className="text-[10px] text-[#7A5C4A] block">
                        If left blank, defaults to: "Online ordering is currently closed. We'll be back soon!"
                      </span>
                    </div>

                    {/* Next Opening Time Field */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-[#2B1408] block">
                        Estimated Next Opening Time (Optional)
                      </label>
                      <input
                        type="text"
                        value={nextOpeningTime}
                        onChange={(e) => setNextOpeningTime(e.target.value)}
                        placeholder="e.g. 10:00 AM or Tomorrow 9:00 AM"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-[#EEDDCC] text-xs font-medium text-[#23120B] focus:outline-none focus:ring-2 focus:ring-[#FE8E2A]/30"
                      />
                      <span className="text-[10px] text-[#7A5C4A] block">
                        Displayed to customers so they know when online ordering resumes.
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title={pendingTargetState ? 'Reopen Online Ordering?' : 'Close Online Ordering?'}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div
            className={`p-4 rounded-2xl flex items-start gap-3 ${
              pendingTargetState
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
                : 'bg-red-50 border border-red-200 text-red-900'
            }`}
          >
            {pendingTargetState ? (
              <CheckCircle size={22} className="text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle size={22} className="text-red-600 shrink-0 mt-0.5" />
            )}
            <div className="text-xs leading-relaxed">
              <strong className="block font-bold text-sm mb-1">
                {pendingTargetState
                  ? 'Ready to accept customer orders?'
                  : 'Pause customer ordering temporarily?'}
              </strong>
              {pendingTargetState ? (
                <>
                  Switching to <strong>ONLINE ORDERING OPEN</strong> will immediately enable "Add to Cart", cart
                  quantity modifications, and WhatsApp order submission for customers across all devices.
                </>
              ) : (
                <>
                  Switching to <strong>ONLINE ORDERING CLOSED</strong> will immediately prevent customers from adding
                  dishes or placing orders via WhatsApp. Existing carts will be preserved for review, and your full
                  digital menu remains visible for browsing.
                </>
              )}
            </div>
          </div>

          {!pendingTargetState && (
            <div className="space-y-3 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">Custom Closure Message</label>
                <input
                  type="text"
                  value={closureMessage}
                  onChange={(e) => setClosureMessage(e.target.value)}
                  placeholder="e.g. Online ordering is currently closed. We'll be back tomorrow!"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500/30"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700">Next Opening Time</label>
                <input
                  type="text"
                  value={nextOpeningTime}
                  onChange={(e) => setNextOpeningTime(e.target.value)}
                  placeholder="e.g. 10:00 AM or Tomorrow 9:00 AM"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs font-medium focus:ring-2 focus:ring-amber-500/30"
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={() => setShowConfirmModal(false)}
              className="px-4 py-2.5 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-bold transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirmToggle}
              disabled={isUpdating}
              className={`px-5 py-2.5 rounded-xl text-white text-xs font-extrabold flex items-center gap-2 shadow-md transition-all active:scale-95 cursor-pointer ${
                pendingTargetState
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                  : 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
              }`}
            >
              {isUpdating ? (
                <span>Updating...</span>
              ) : pendingTargetState ? (
                <>
                  <CheckCircle size={15} />
                  <span>Open Online Ordering</span>
                </>
              ) : (
                <>
                  <Power size={15} />
                  <span>Confirm & Close Ordering</span>
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
