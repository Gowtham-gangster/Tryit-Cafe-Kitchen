/**
 * Distance & Delivery Fee Calculation Service
 *
 * Implements the TryIt Cafe business rules:
 * - Origin: TryIt Cafe & Kitchen coordinates (centralized from business settings)
 * - Haversine straight-line distance formula
 * - Delivery fee rule:
 *     IF distance <= 3 km: delivery charge = ₹0 (FREE)
 *     IF distance > 3 km: delivery charge = total distance * ₹5
 * - ₹5 rate applies to the ENTIRE distance once > 3 km.
 * - For Takeaway: delivery charge = ₹0.
 */

const EARTH_RADIUS_KM = 6371.0;

export const DEFAULT_CAFE_LATITUDE = 17.576477671138843;
export const DEFAULT_CAFE_LONGITUDE = 78.42169701534337;
export const DEFAULT_FREE_DELIVERY_DISTANCE_KM = 3.0;
export const DEFAULT_DELIVERY_RATE_PER_KM = 5.0;

/**
 * Builds a direct, clickable Google Maps URL pointing to the customer's delivery coordinates.
 * Generates: https://www.google.com/maps?q=<LATITUDE>,<LONGITUDE>
 */
export function buildCustomerGoogleMapsUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

/**
 * Calculates straight-line distance in kilometers using the Haversine formula.
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const toRad = (angle: number) => (angle * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const radLat1 = toRad(lat1);
  const radLat2 = toRad(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(radLat1) * Math.cos(radLat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

/**
 * Calculates delivery charge based on distance and business pricing rules.
 */
export function calculateDeliveryCharge(
  distanceKm: number,
  freeDistanceKm: number = DEFAULT_FREE_DELIVERY_DISTANCE_KM,
  ratePerKm: number = DEFAULT_DELIVERY_RATE_PER_KM
): number {
  if (distanceKm <= freeDistanceKm) {
    return 0;
  }
  // Formula: entire distance * rate
  const rawFee = distanceKm * ratePerKm;
  return Math.round((rawFee + Number.EPSILON) * 100) / 100;
}

/**
 * Formats distance in km (1-2 decimal places).
 */
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 0.1) return '< 0.1 km';
  return `${distanceKm.toFixed(distanceKm >= 10 ? 1 : 2)} km`;
}

/**
 * Formats delivery fee in Indian Rupees.
 */
export function formatDeliveryFee(fee: number): string {
  if (fee <= 0) return 'FREE';
  return `₹${fee.toFixed(2)}`;
}
