/**
 * Centralized Time Formatting and Conversion Utilities
 * Handles 12-hour / 24-hour conversions and store status calculations.
 *
 * Backend format: "HH:mm" (24-hour, e.g. "10:00", "23:30")
 * UI format: "h:mm A" (12-hour, e.g. "10:00 AM", "11:30 PM")
 */

import { BusinessHours } from '../types';

export interface Time12HourParts {
  hour12: number;
  minute: number;
  ampm: 'AM' | 'PM';
}

/**
 * Format a 24-hour time string ("10:00", "23:30", "00:15") to 12-hour display ("10:00 AM", "11:30 PM", "12:15 AM").
 * If the string already has AM/PM, it normalizes it.
 */
export const formatTimeTo12Hour = (timeStr?: string | null): string => {
  if (!timeStr || typeof timeStr !== 'string') return '';
  const trimmed = timeStr.trim();

  // If already formatted like "10:00 AM" or "11:30 PM", ensure clean spacing
  const match12 = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12) {
    const h = parseInt(match12[1], 10);
    const m = match12[2];
    const period = match12[3].toUpperCase();
    return `${h}:${m} ${period}`;
  }

  // Handle 24h format like "23:30", "10:00", "0:15"
  const parts = trimmed.split(':');
  if (parts.length < 2) return timeStr;

  const rawH = parseInt(parts[0], 10);
  const rawM = parseInt(parts[1], 10);

  if (isNaN(rawH) || isNaN(rawM)) return timeStr;

  const ampm: 'AM' | 'PM' = rawH >= 12 ? 'PM' : 'AM';
  const hour12 = rawH % 12 === 0 ? 12 : rawH % 12;
  const minuteFormatted = String(rawM).padStart(2, '0');

  return `${hour12}:${minuteFormatted} ${ampm}`;
};

/**
 * Convert 12-hour components (hour: 1-12, minute: 0-59, ampm: 'AM'|'PM') to 24-hour "HH:mm" string
 */
export const parse12HourTo24Hour = (
  hour12: number,
  minute: number,
  ampm: 'AM' | 'PM'
): string => {
  let normalizedH = hour12 % 12;
  if (ampm === 'PM') {
    normalizedH += 12;
  }
  const hStr = String(normalizedH).padStart(2, '0');
  const mStr = String(Math.max(0, Math.min(59, minute))).padStart(2, '0');
  return `${hStr}:${mStr}`;
};

/**
 * Split a time string ("23:30" or "11:30 PM") into 12-hour parts
 */
export const split24HourTime = (timeStr?: string | null): Time12HourParts => {
  if (!timeStr) {
    return { hour12: 10, minute: 0, ampm: 'AM' };
  }
  const clean = timeStr.trim();

  // Check if string contains AM or PM
  const isPM = /pm/i.test(clean);
  const isAM = /am/i.test(clean);

  const numericParts = clean.replace(/[^\d:]/g, '').split(':');
  const rawH = parseInt(numericParts[0], 10);
  const rawM = numericParts.length > 1 ? parseInt(numericParts[1], 10) : 0;

  if (isNaN(rawH)) {
    return { hour12: 10, minute: 0, ampm: 'AM' };
  }

  const minute = isNaN(rawM) ? 0 : Math.max(0, Math.min(59, rawM));

  if (isPM || isAM) {
    const hour12 = rawH > 12 ? (rawH % 12 || 12) : rawH === 0 ? 12 : rawH;
    const ampm: 'AM' | 'PM' = isPM ? 'PM' : 'AM';
    return { hour12, minute, ampm };
  }

  // Raw 24-hour time
  const ampm: 'AM' | 'PM' = rawH >= 12 ? 'PM' : 'AM';
  const hour12 = rawH % 12 === 0 ? 12 : rawH % 12;

  return { hour12, minute, ampm };
};

/**
 * Format a range of opening and closing hours for display.
 * E.g., "10:00 AM – 11:30 PM" or "Closed"
 */
export const formatBusinessHoursRange = (
  openTime?: string | null,
  closeTime?: string | null,
  closed?: boolean
): string => {
  if (closed) return 'Closed';
  if (!openTime || !closeTime) return '10:00 AM – 11:30 PM';
  const open12 = formatTimeTo12Hour(openTime);
  const close12 = formatTimeTo12Hour(closeTime);
  if (!open12 || !close12) return '10:00 AM – 11:30 PM';
  return `${open12} – ${close12}`;
};

/**
 * Check if the cafe is currently open based on today's operating hours.
 * Supports overnight hours (e.g. 6:00 PM to 1:00 AM) safely.
 */
export const calculatePhysicalStoreStatus = (
  todayHours?: BusinessHours | null,
  referenceDate: Date = new Date()
): { isOpen: boolean; label: string } => {
  if (!todayHours) {
    return { isOpen: true, label: 'OPEN NOW' };
  }
  if (todayHours.closed) {
    return { isOpen: false, label: 'CLOSED TODAY' };
  }

  const parseMinutes = (t?: string | null): number | null => {
    if (!t) return null;
    const [h, m] = t.split(':').map(Number);
    return isNaN(h) || isNaN(m) ? null : h * 60 + m;
  };

  const openMin = parseMinutes(todayHours.openTime) ?? 600; // 10:00 AM fallback
  const closeMin = parseMinutes(todayHours.closeTime) ?? 1410; // 11:30 PM fallback

  const currentMinutes = referenceDate.getHours() * 60 + referenceDate.getMinutes();

  // If closeMin > openMin (Standard same-day hours, e.g. 10:00 AM to 11:30 PM / 600 to 1410)
  // If closeMin <= openMin (Overnight hours, e.g. 6:00 PM to 1:00 AM / 1080 to 60)
  const isOpen =
    closeMin > openMin
      ? currentMinutes >= openMin && currentMinutes < closeMin
      : currentMinutes >= openMin || currentMinutes < closeMin;

  return {
    isOpen,
    label: isOpen ? 'OPEN NOW' : 'CLOSED NOW',
  };
};
