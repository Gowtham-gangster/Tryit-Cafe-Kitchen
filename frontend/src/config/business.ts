/**
 * Centralized Public Business Contact & Social Configuration
 *
 * Sourced strictly from frontend environment variables (VITE_CAFE_*),
 * with backward-compatible fallbacks and safe validation.
 *
 * DO NOT hardcode phone numbers, WhatsApp numbers, email addresses,
 * or social links inside React components.
 */

const env = import.meta.env;

const rawWhatsApp = (
  env.VITE_CAFE_WHATSAPP_NUMBER ||
  env.VITE_WHATSAPP_NUMBER ||
  ''
).trim();

const rawPhone = (env.VITE_CAFE_PHONE_NUMBER || '').trim();

const rawEmail = (
  env.VITE_CAFE_EMAIL ||
  env.VITE_SUPPORT_EMAIL ||
  ''
).trim();

const rawInstagramUrl = (env.VITE_CAFE_INSTAGRAM_URL || '').trim();
const rawInstagramHandle = (env.VITE_CAFE_INSTAGRAM_HANDLE || '').trim();

/**
 * Normalizes phone/whatsapp numbers to international wa.me digits.
 * If 10 digits are provided without a country code, prepends India's '91'.
 */
function normalizeWhatsAppDigits(raw: string): string | null {
  if (!raw) return null;
  const digits = raw.replace(/[^0-9]/g, '');
  if (!digits || digits.length < 10 || digits.length > 15) return null;
  if (/^0+$/.test(digits)) return null;

  // If 10 digits given, assume Indian country code (91)
  if (digits.length === 10) {
    return `91${digits}`;
  }
  return digits;
}

/**
 * Normalizes a phone number for tel: links.
 */
function normalizeTel(raw: string): string | null {
  if (!raw) return null;
  // Keep leading + if present, strip all spaces, hyphens, brackets
  const hasPlus = raw.startsWith('+');
  const digits = raw.replace(/[^0-9]/g, '');
  if (!digits || digits.length < 7) return null;
  return hasPlus ? `+${digits}` : digits;
}

/**
 * Validates an email string.
 */
function isValidEmail(val: string): boolean {
  if (!val || val.length < 5) return false;
  if (val.startsWith('[') || val.endsWith(']')) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
}

/**
 * Validates a web URL.
 */
function isValidUrl(val: string): boolean {
  if (!val) return false;
  return /^https?:\/\/[^\s$.?#].[^\s]*$/i.test(val);
}

export const cafeConfig = {
  /** Raw configured environment values */
  whatsappNumber: rawWhatsApp,
  phoneNumber: rawPhone,
  email: rawEmail,
  instagramUrl: rawInstagramUrl,
  instagramHandle: rawInstagramHandle || '@tryit.cafe_kitchen',

  /**
   * Returns normalized digits for WhatsApp business ordering.
   * Priority: Environment variable -> Provided fallback -> null
   */
  getWhatsAppNumber(fallbackNumber?: string): string | null {
    const candidate = rawWhatsApp || (fallbackNumber || '').trim();
    return normalizeWhatsAppDigits(candidate);
  },

  /**
   * Generates a wa.me URL with an optional pre-filled message.
   * Returns null if no valid WhatsApp number is configured.
   */
  getWhatsAppUrl(
    customMessage: string = 'Hi Tryit Cafe! I would like to visit or place an order.',
    fallbackNumber?: string
  ): string | null {
    const num = this.getWhatsAppNumber(fallbackNumber);
    if (!num) return null;
    const text = encodeURIComponent(customMessage);
    return `https://wa.me/${num}?text=${text}`;
  },

  /**
   * Checks if WhatsApp ordering is available.
   */
  isWhatsAppAvailable(fallbackNumber?: string): boolean {
    return this.getWhatsAppNumber(fallbackNumber) !== null;
  },

  /**
   * Returns a valid tel: URL for calling the cafe.
   * Priority: Environment variable -> Provided fallback -> null
   */
  getPhoneUrl(fallbackNumber?: string): string | null {
    const candidate = rawPhone || (fallbackNumber || '').trim();
    const tel = normalizeTel(candidate);
    return tel ? `tel:${tel}` : null;
  },

  /**
   * Returns human-readable phone display text.
   */
  getDisplayPhone(fallbackNumber?: string): string {
    const candidate = rawPhone || (fallbackNumber || '').trim();
    return candidate;
  },

  /**
   * Checks if phone calling is available.
   */
  isPhoneAvailable(fallbackNumber?: string): boolean {
    return this.getPhoneUrl(fallbackNumber) !== null;
  },

  /**
   * Returns a validated email address.
   * Priority: Environment variable -> Provided fallback -> null
   */
  getEmail(fallbackEmail?: string): string | null {
    const candidate = rawEmail || (fallbackEmail || '').trim();
    return isValidEmail(candidate) ? candidate : null;
  },

  /**
   * Returns a valid mailto: URL for contacting the cafe.
   */
  getEmailUrl(fallbackEmail?: string): string | null {
    const valid = this.getEmail(fallbackEmail);
    return valid ? `mailto:${valid}` : null;
  },

  /**
   * Checks if email contact is available.
   */
  isEmailAvailable(fallbackEmail?: string): boolean {
    return this.getEmail(fallbackEmail) !== null;
  },

  /**
   * Returns the official Instagram profile URL.
   * Priority: Environment variable -> Provided fallback -> default profile URL
   */
  getInstagramUrl(fallbackUrl?: string): string | null {
    const candidate = rawInstagramUrl || (fallbackUrl || '').trim();
    if (!candidate) return null;
    if (isValidUrl(candidate)) return candidate;
    // If handle provided instead of full URL
    const cleanHandle = candidate.replace(/^@/, '');
    return `https://instagram.com/${cleanHandle}`;
  },

  /**
   * Checks if Instagram link is available.
   */
  isInstagramAvailable(fallbackUrl?: string): boolean {
    return this.getInstagramUrl(fallbackUrl) !== null;
  },
} as const;

export default cafeConfig;
