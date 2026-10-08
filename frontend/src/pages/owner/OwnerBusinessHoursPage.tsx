import React, { useEffect, useState, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Clock, Save, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { BusinessHours } from '../../types';
import { ownerApi } from '../../api/ownerApi';
import { useToastStore } from '../../store/useToastStore';
import { useMenuStore } from '../../store/useMenuStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { TimePickerInput } from '../../components/common/TimePickerInput';
import { formatTimeTo12Hour } from '../../utils/timeFormat';

const DAY_ORDER = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export const OwnerBusinessHoursPage: React.FC = () => {
  const [hours, setHours] = useState<BusinessHours[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  const { success, error: toastError } = useToastStore();
  const { fetchAllPublicData } = useMenuStore();
  const { fetchSettings } = useSettingsStore();
  const shouldReduceMotion = useReducedMotion();

  // Identify today's day for helpful highlight
  const todayName = useMemo(() => {
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    return days[new Date().getDay()];
  }, []);

  const loadHours = async () => {
    setIsLoading(true);
    try {
      const data = await ownerApi.getSettings();
      const rawHours = data.businessHours || [];

      // Sort by canonical week order (Monday -> Sunday)
      const sortedHours = [...rawHours].sort((a, b) => {
        const idxA = DAY_ORDER.indexOf(a.dayOfWeek);
        const idxB = DAY_ORDER.indexOf(b.dayOfWeek);
        return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
      });

      setHours(sortedHours);
    } catch (e) {
      console.error(e);
      toastError('Failed to load business hours. Please try refreshing.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHours();
  }, []);

  const handleHourChange = (
    index: number,
    field: keyof BusinessHours,
    value: any
  ) => {
    const updated = [...hours];
    updated[index] = { ...updated[index], [field]: value };
    setHours(updated);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    setIsSaving(true);
    try {
      await ownerApi.updateBusinessHours(hours);

      // Invalidate & refresh both customer settings and menu store data
      await Promise.all([loadHours(), fetchSettings(true)]);
      fetchAllPublicData(true);

      success('Operating schedule updated successfully!');
      setSaveSuccessNotice(true);
      setTimeout(() => setSaveSuccessNotice(false), 4000);
    } catch (e) {
      toastError('Could not update business hours. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#FFFBF7] border border-[#EEDDCC] shadow-xs text-xs font-bold text-[#7A5C4A]">
          <Clock size={16} className="text-[#FE8E2A] animate-spin" />
          <span>Loading operating schedule...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto w-full min-w-0">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-[#FE8E2A] mb-1 px-2.5 py-0.5 rounded-full bg-[#FE8E2A]/10 border border-[#FE8E2A]/20">
            <Calendar size={12} />
            <span>CAFE SCHEDULE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#2B1408] font-serif tracking-tight">
            Operating Schedule & Business Hours
          </h1>
          <p className="text-xs sm:text-sm text-[#7A5C4A] mt-1 max-w-2xl leading-relaxed">
            Set your daily opening and closing hours. Changes sync immediately to
            the customer website and location section.
          </p>
        </div>

        {saveSuccessNotice && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="self-start sm:self-auto px-3.5 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 shadow-xs shrink-0"
          >
            <CheckCircle size={16} className="text-emerald-600 shrink-0" />
            <span>Changes synced to website</span>
          </motion.div>
        )}
      </div>

      {/* Main Schedule Form */}
      <form onSubmit={handleSave} className="space-y-4 w-full min-w-0">
        <div className="space-y-3.5 w-full min-w-0">
          {hours.map((h, idx) => {
            const isToday =
              h.dayOfWeek?.trim().toLowerCase() === todayName.toLowerCase();

            return (
              <motion.div
                key={h.id || h.dayOfWeek || idx}
                initial={
                  shouldReduceMotion
                    ? { opacity: 1 }
                    : { opacity: 0, y: 12 }
                }
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.28,
                  delay: shouldReduceMotion ? 0 : idx * 0.035,
                  ease: 'easeOut',
                }}
                className={`p-4 sm:p-5 rounded-2xl sm:rounded-3xl border transition-all duration-200 w-full min-w-0 shadow-xs ${
                  h.closed
                    ? 'bg-rose-50/40 border-rose-200/70'
                    : isToday
                    ? 'bg-[#FFFBF7] border-[#FE8E2A]/50 ring-1 ring-[#FE8E2A]/20'
                    : 'bg-[#FFFBF7] border-[#EEDDCC]'
                }`}
              >
                {/* Card Top: Day Title & Closed Checkbox */}
                <div className="flex items-center justify-between gap-3 pb-3.5 mb-3.5 border-b border-[#EEDDCC]/60 flex-wrap">
                  <div className="flex items-center gap-2">
                    <h2 className="font-extrabold text-sm sm:text-base text-[#2B1408] font-serif">
                      {h.dayOfWeek}
                    </h2>
                    {isToday && (
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FE8E2A] text-white shadow-2xs">
                        TODAY
                      </span>
                    )}
                    {h.closed && (
                      <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 border border-rose-200">
                        CLOSED
                      </span>
                    )}
                  </div>

                  {/* Mark as Closed Toggle */}
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none py-1 px-2 rounded-xl hover:bg-black/5 transition-colors">
                    <input
                      type="checkbox"
                      checked={h.closed}
                      onChange={(e) =>
                        handleHourChange(idx, 'closed', e.target.checked)
                      }
                      className="w-4 h-4 rounded text-[#FE8E2A] focus:ring-[#FE8E2A] border-[#D1BFA8] cursor-pointer"
                      aria-label={`Mark ${h.dayOfWeek} as closed`}
                    />
                    <span
                      className={`text-xs font-bold transition-colors ${
                        h.closed ? 'text-rose-700 font-extrabold' : 'text-[#7A5C4A]'
                      }`}
                    >
                      {h.closed ? 'Marked as Closed' : 'Mark as Closed'}
                    </span>
                  </label>
                </div>

                {/* Time Pickers Layout:
                    - Mobile (<sm): Vertical stack, 100% width, no overflow
                    - Tablet/Desktop (>=sm): 2 columns side-by-side
                */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 w-full min-w-0">
                  {/* Opening Time */}
                  <div className="w-full min-w-0 space-y-1.5">
                    <label
                      htmlFor={`open-time-${idx}`}
                      className="block text-xs font-bold text-[#7A5C4A]"
                    >
                      Opening Time
                    </label>
                    <TimePickerInput
                      id={`open-time-${idx}`}
                      value={h.openTime || '10:00'}
                      onChange={(val24) =>
                        handleHourChange(idx, 'openTime', val24)
                      }
                      disabled={h.closed}
                      label="Opening Time"
                      dayName={h.dayOfWeek}
                      ariaLabel={`Opening time for ${h.dayOfWeek}`}
                    />
                  </div>

                  {/* Closing Time */}
                  <div className="w-full min-w-0 space-y-1.5">
                    <label
                      htmlFor={`close-time-${idx}`}
                      className="block text-xs font-bold text-[#7A5C4A]"
                    >
                      Closing Time
                    </label>
                    <TimePickerInput
                      id={`close-time-${idx}`}
                      value={h.closeTime || '23:30'}
                      onChange={(val24) =>
                        handleHourChange(idx, 'closeTime', val24)
                      }
                      disabled={h.closed}
                      label="Closing Time"
                      dayName={h.dayOfWeek}
                      ariaLabel={`Closing time for ${h.dayOfWeek}`}
                    />
                  </div>
                </div>

                {/* Subtext info for closed state */}
                {h.closed && (
                  <p className="text-[11px] font-medium text-rose-600/90 mt-2.5 flex items-center gap-1.5">
                    <AlertCircle size={12} className="shrink-0" />
                    <span>
                      Customers will see &quot;Closed&quot; for {h.dayOfWeek}. Time inputs are disabled.
                    </span>
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Sticky/Bottom Save Action Bar */}
        <div className="sticky bottom-4 z-20 pt-4 pb-2">
          <div className="p-4 rounded-2xl bg-[#FFFBF7]/95 backdrop-blur-md border border-[#EEDDCC] shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-[#7A5C4A] text-center sm:text-left">
              <span className="font-bold text-[#2B1408]">Single Source of Truth:</span>{' '}
              Saving immediately synchronizes customer-facing opening hours.
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#FE8E2A] hover:bg-[#E67616] text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md shadow-[#FE8E2A]/25 active:scale-98 transition-all disabled:opacity-50 min-h-[48px] cursor-pointer"
            >
              <Save size={18} />
              <span>{isSaving ? 'Saving Schedule...' : 'Save Operating Hours'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
