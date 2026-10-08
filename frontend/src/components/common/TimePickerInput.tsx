import React, { useState } from 'react';
import { Clock, Check, ChevronDown, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  formatTimeTo12Hour,
  parse12HourTo24Hour,
  split24HourTime,
} from '../../utils/timeFormat';

interface TimePickerInputProps {
  value: string; // 24-hour format string, e.g. "10:00", "23:30"
  onChange: (value24: string) => void;
  disabled?: boolean;
  label?: string;
  dayName?: string;
  id?: string;
  ariaLabel?: string;
}

const HOURS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const MINUTES = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

const QUICK_PRESETS = [
  { label: '9:00 AM', value: '09:00' },
  { label: '10:00 AM', value: '10:00' },
  { label: '11:00 AM', value: '11:00' },
  { label: '10:00 PM', value: '22:00' },
  { label: '10:30 PM', value: '22:30' },
  { label: '11:00 PM', value: '23:00' },
  { label: '11:30 PM', value: '23:30' },
  { label: '12:00 AM', value: '00:00' },
];

export const TimePickerInput: React.FC<TimePickerInputProps> = ({
  value,
  onChange,
  disabled = false,
  label = 'Time',
  dayName,
  id,
  ariaLabel,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Temporary selection state when modal is open
  const currentParts = split24HourTime(value || '10:00');
  const [selectedHour, setSelectedHour] = useState<number>(currentParts.hour12);
  const [selectedMinute, setSelectedMinute] = useState<number>(currentParts.minute);
  const [selectedAmPm, setSelectedAmPm] = useState<'AM' | 'PM'>(currentParts.ampm);

  const formattedDisplay = value ? formatTimeTo12Hour(value) : 'Select Time';

  const handleOpen = () => {
    if (disabled) return;
    const parts = split24HourTime(value || '10:00');
    setSelectedHour(parts.hour12);
    setSelectedMinute(parts.minute);
    setSelectedAmPm(parts.ampm);
    setIsOpen(true);
  };

  const handleConfirm = () => {
    const val24 = parse12HourTo24Hour(selectedHour, selectedMinute, selectedAmPm);
    onChange(val24);
    setIsOpen(false);
  };

  const handleApplyPreset = (preset24: string) => {
    const parts = split24HourTime(preset24);
    setSelectedHour(parts.hour12);
    setSelectedMinute(parts.minute);
    setSelectedAmPm(parts.ampm);
  };

  const previewFormatted = formatTimeTo12Hour(
    parse12HourTo24Hour(selectedHour, selectedMinute, selectedAmPm)
  );

  return (
    <div className="relative w-full min-w-0">
      {/* Trigger Button */}
      <button
        type="button"
        id={id}
        onClick={handleOpen}
        disabled={disabled}
        aria-label={ariaLabel || `${label} for ${dayName || 'day'}`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        className={`w-full min-w-0 min-h-[46px] px-3.5 py-2.5 rounded-xl border flex items-center justify-between gap-2.5 transition-all text-left select-none ${
          disabled
            ? 'bg-stone-100/80 border-stone-200 text-stone-400 cursor-not-allowed opacity-60'
            : 'bg-[#FFFBF7] border-[#EEDDCC] hover:bg-[#FDF6EE] hover:border-[#FE8E2A]/50 text-[#2B1408] shadow-xs cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#FE8E2A]/40 focus:border-[#FE8E2A]'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 truncate">
          <Clock
            size={16}
            className={`shrink-0 ${disabled ? 'text-stone-400' : 'text-[#FE8E2A]'}`}
            aria-hidden="true"
          />
          <span
            className={`text-xs sm:text-sm font-bold truncate ${
              disabled ? 'text-stone-400' : 'text-[#2B1408]'
            }`}
          >
            {disabled ? 'Disabled' : formattedDisplay}
          </span>
        </div>
        <ChevronDown
          size={14}
          className={`shrink-0 transition-transform ${
            disabled ? 'text-stone-300' : 'text-[#7A5C4A]'
          } ${isOpen ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {/* Time Picker Modal */}
      <AnimatePresence>
        {isOpen && (
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            role="dialog"
            aria-modal="true"
            aria-label={`Select ${label} for ${dayName || 'day'}`}
          >
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Modal Dialog Card */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.96 }}
              transition={{ type: 'spring', damping: 25, stiffness: 320 }}
              className="relative w-full max-w-sm bg-[#FFFBF7] rounded-t-3xl sm:rounded-3xl border border-[#EEDDCC] shadow-2xl z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#EEDDCC] bg-[#FDF6EE]">
                <div>
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#FE8E2A]">
                    {dayName ? `${dayName} • ` : ''}{label}
                  </div>
                  <h3 className="text-base font-bold text-[#2B1408] font-serif">
                    Select Time (12-Hour)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-full text-[#7A5C4A] hover:text-[#2B1408] hover:bg-[#F2E5D6] transition-colors cursor-pointer"
                  aria-label="Close time picker"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Time Display Preview */}
              <div className="py-4 px-6 text-center bg-white border-b border-[#EEDDCC]/60">
                <span className="text-[11px] font-bold text-[#7A5C4A] uppercase tracking-wider block mb-1">
                  Selected Time
                </span>
                <div className="text-3xl font-extrabold text-[#FE8E2A] tracking-tight font-display">
                  {previewFormatted}
                </div>
              </div>

              {/* Controls Section */}
              <div className="p-5 space-y-4 overflow-y-auto">
                {/* 1. Hour, Minute & AM/PM Selector */}
                <div className="grid grid-cols-3 gap-2.5 items-end">
                  {/* Hour Selector */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#7A5C4A] mb-1">
                      Hour
                    </label>
                    <select
                      value={selectedHour}
                      onChange={(e) => setSelectedHour(Number(e.target.value))}
                      className="w-full h-11 px-3 rounded-xl bg-white border border-[#EEDDCC] text-sm font-bold text-[#2B1408] focus:outline-none focus:ring-2 focus:ring-[#FE8E2A]/40 focus:border-[#FE8E2A] cursor-pointer"
                    >
                      {HOURS.map((h) => (
                        <option key={h} value={h}>
                          {h}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Minute Selector */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#7A5C4A] mb-1">
                      Minute
                    </label>
                    <select
                      value={selectedMinute}
                      onChange={(e) => setSelectedMinute(Number(e.target.value))}
                      className="w-full h-11 px-3 rounded-xl bg-white border border-[#EEDDCC] text-sm font-bold text-[#2B1408] focus:outline-none focus:ring-2 focus:ring-[#FE8E2A]/40 focus:border-[#FE8E2A] cursor-pointer"
                    >
                      {MINUTES.map((m) => (
                        <option key={m} value={m}>
                          {String(m).padStart(2, '0')}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* AM / PM Segmented Control */}
                  <div>
                    <label className="block text-[11px] font-bold text-[#7A5C4A] mb-1">
                      Period
                    </label>
                    <div className="grid grid-cols-2 h-11 p-1 bg-[#FDF6EE] border border-[#EEDDCC] rounded-xl gap-1">
                      <button
                        type="button"
                        onClick={() => setSelectedAmPm('AM')}
                        className={`h-full rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center ${
                          selectedAmPm === 'AM'
                            ? 'bg-[#FE8E2A] text-white shadow-xs'
                            : 'text-[#7A5C4A] hover:text-[#2B1408]'
                        }`}
                      >
                        AM
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedAmPm('PM')}
                        className={`h-full rounded-lg text-xs font-black transition-all cursor-pointer flex items-center justify-center ${
                          selectedAmPm === 'PM'
                            ? 'bg-[#FE8E2A] text-white shadow-xs'
                            : 'text-[#7A5C4A] hover:text-[#2B1408]'
                        }`}
                      >
                        PM
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. Popular Cafe Presets */}
                <div>
                  <span className="block text-[11px] font-bold text-[#7A5C4A] mb-1.5 uppercase tracking-wide">
                    Quick Cafe Presets
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {QUICK_PRESETS.map((p) => {
                      const isActive =
                        parse12HourTo24Hour(selectedHour, selectedMinute, selectedAmPm) ===
                        p.value;
                      return (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() => handleApplyPreset(p.value)}
                          className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition-all cursor-pointer text-center truncate ${
                            isActive
                              ? 'bg-[#FE8E2A] text-white border-[#FE8E2A] shadow-2xs'
                              : 'bg-white hover:bg-[#FDF6EE] text-[#5C3D2E] border-[#EEDDCC]'
                          }`}
                        >
                          {p.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 border-t border-[#EEDDCC] bg-[#FDF6EE] flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 min-h-[44px] py-2.5 px-4 rounded-xl border border-[#EEDDCC] bg-white text-xs font-bold text-[#7A5C4A] hover:bg-[#F2E5D6] hover:text-[#2B1408] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="flex-1 min-h-[44px] py-2.5 px-4 rounded-xl bg-[#FE8E2A] hover:bg-[#E67616] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-[#FE8E2A]/25 transition-all cursor-pointer"
                >
                  <Check size={16} />
                  <span>Done</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
