import { CartItem, CustomerLocation, OrderType, User } from '../types';
import { useSettingsStore } from '../store/useSettingsStore';
import { buildCustomerGoogleMapsUrl, formatDistance } from '../services/distanceService';

/**
 * Normalizes and validates the configured WhatsApp business number.
 *
 * Source Priority:
 * 1. import.meta.env.VITE_WHATSAPP_NUMBER (Frontend Environment Variable)
 * 2. fallbackNumber (e.g. from backend business settings)
 *
 * Normalization & Validation Rules:
 * - Strips any non-digit characters (+, spaces, hyphens, parentheses).
 * - Must adhere to wa.me international digits-only format: e.g. '91XXXXXXXXXX'.
 * - Discards obvious placeholder values (e.g. 'YOUR_WHATSAPP_NUMBER', 'XXXXXXXXXX').
 * - Validates international phone digit length (10 to 15 digits).
 * - Returns null if the number is missing or invalid.
 */
import { cafeConfig } from '../config/business';

export function getWhatsAppBusinessNumber(fallbackNumber?: string): string | null {
  return cafeConfig.getWhatsAppNumber(fallbackNumber);
}

/**
 * Checks if WhatsApp ordering is currently available based on environment configuration.
 */
export function isWhatsAppOrderingAvailable(fallbackNumber?: string): boolean {
  return getWhatsAppBusinessNumber(fallbackNumber) !== null;
}

export interface WhatsAppOrderParams {
  items: CartItem[];
  instructions?: string;
  cravingText?: string;
  customer?: User | null;
  whatsappNumber?: string;
  cafeName?: string;
  onlineOrderingEnabled?: boolean;
  orderType: OrderType;
  location?: CustomerLocation | null;
  distanceKm?: number;
  deliveryCharge?: number;
  authoritativeSubtotal?: number;
  authoritativeTotal?: number;
}

export interface WhatsAppDispatchResult {
  success: boolean;
  error?: string;
  url?: string;
}

export function generateWhatsAppMessage({
  items,
  instructions,
  cravingText,
  customer,
  cafeName = 'TryIt Cafe & Kitchen',
  onlineOrderingEnabled,
  orderType,
  location,
  distanceKm,
  deliveryCharge = 0,
  authoritativeSubtotal,
  authoritativeTotal,
}: Omit<WhatsAppOrderParams, 'whatsappNumber'>): string {
  // If store is closed, do not generate order message
  const isOpen =
    onlineOrderingEnabled !== undefined
      ? onlineOrderingEnabled
      : useSettingsStore.getState().isOnlineOrderingOpen();
  if (!isOpen) {
    return '';
  }

  const subtotal =
    authoritativeSubtotal !== undefined
      ? authoritativeSubtotal
      : items.reduce((sum, ci) => sum + (ci.item.effectivePrice ?? ci.item.price) * ci.quantity, 0);

  const total =
    authoritativeTotal !== undefined
      ? authoritativeTotal
      : subtotal + (orderType === 'DELIVERY' ? deliveryCharge : 0);

  const isDelivery = orderType === 'DELIVERY';

  let msg = `${cafeName.toUpperCase()}\n`;
  msg += `====================\n\n`;
  msg += `NEW ORDER\n\n`;

  msg += `Customer Details\n`;
  msg += `Name: ${customer?.fullName || 'Customer'}\n`;
  msg += `Phone: ${customer?.phone || 'Provided via WhatsApp'}\n`;
  if (customer?.email) {
    msg += `Email: ${customer.email}\n`;
  }
  msg += `\n`;

  msg += `Order Type: ${isDelivery ? 'Delivery' : 'Pickup'}\n\n`;

  // Delivery Location Section (DELIVERY only)
  if (isDelivery && location) {
    msg += `Delivery Location\n`;
    msg += `-----------------\n`;
    msg += `Location: ${location.label || 'Home'}\n`;
    msg += `Address: ${location.address}\n\n`;

    msg += `Customer Coordinates:\n`;
    msg += `Latitude: ${location.latitude}\n`;
    msg += `Longitude: ${location.longitude}\n\n`;

    msg += `📍 Customer Location:\n`;
    msg += `${buildCustomerGoogleMapsUrl(location.latitude, location.longitude)}\n\n`;

    if (distanceKm !== undefined) {
      msg += `Distance from Cafe: ${formatDistance(distanceKm)}\n`;
    }
    msg += `Delivery Charge: ${deliveryCharge <= 0 ? 'FREE' : `₹${deliveryCharge.toFixed(2)}`}\n\n`;
  }

  // Order Items Section
  msg += `Order Items\n`;
  msg += `-----------\n`;

  items.forEach((ci, idx) => {
    const unitPrice = ci.item.effectivePrice ?? ci.item.price;
    const itemTotal = unitPrice * ci.quantity;
    const discountInfo =
      ci.item.discountEnabled && unitPrice < ci.item.price
        ? ` (Orig: ₹${ci.item.price})`
        : '';
    msg += `${idx + 1}. ${ci.item.name} × ${ci.quantity}\n   ₹${unitPrice.toFixed(2)} each = ₹${itemTotal.toFixed(2)}${discountInfo}\n\n`;
  });

  // Totals Section
  msg += `-----------------\n`;
  msg += `Subtotal: ₹${subtotal.toFixed(2)}\n`;
  if (isDelivery) {
    msg += `Delivery: ${deliveryCharge <= 0 ? 'FREE' : `₹${deliveryCharge.toFixed(2)}`}\n`;
  }
  msg += `TOTAL: ₹${total.toFixed(2)}\n`;
  msg += `-----------------\n\n`;

  if (cravingText && cravingText.trim()) {
    msg += `Custom Craving Request:\n"${cravingText.trim()}"\n\n`;
  }

  if (instructions && instructions.trim()) {
    msg += `Special Instructions:\n"${instructions.trim()}"\n\n`;
  }

  msg += `Please confirm this order.`;

  return msg;
}

/**
 * Builds the wa.me URL for the order or returns null if WhatsApp number is unconfigured.
 */
export function buildWhatsAppOrderUrl(params: WhatsAppOrderParams): string | null {
  const cleanPhone = getWhatsAppBusinessNumber(params.whatsappNumber);
  if (!cleanPhone) {
    return null;
  }

  const message = generateWhatsAppMessage(params);
  if (!message) {
    return null;
  }

  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

/**
 * Dispatches the WhatsApp order by opening wa.me in a new window.
 * Returns a result object indicating success or user-friendly error.
 */
export function dispatchWhatsAppOrder(params: WhatsAppOrderParams): WhatsAppDispatchResult {
  const isOpen =
    params.onlineOrderingEnabled !== undefined
      ? params.onlineOrderingEnabled
      : useSettingsStore.getState().isOnlineOrderingOpen();

  if (!isOpen) {
    console.warn('Blocked WhatsApp order dispatch: online ordering is currently closed.');
    return {
      success: false,
      error: 'Online ordering is currently closed.',
    };
  }

  const cleanPhone = getWhatsAppBusinessNumber(params.whatsappNumber);
  if (!cleanPhone) {
    console.warn(
      'VITE_WHATSAPP_NUMBER is not configured or invalid in environment. WhatsApp ordering disabled.'
    );
    return {
      success: false,
      error: 'WhatsApp ordering is temporarily unavailable. Please try again later.',
    };
  }

  const message = generateWhatsAppMessage(params);
  if (!message) {
    return {
      success: false,
      error: 'Could not generate order details.',
    };
  }

  const encodedText = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedText}`;

  if (typeof window !== 'undefined') {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  }

  return {
    success: true,
    url: whatsappUrl,
  };
}
