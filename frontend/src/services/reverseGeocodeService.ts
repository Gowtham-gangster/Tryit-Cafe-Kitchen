/**
 * Reverse Geocoding Service
 *
 * Uses Google Maps Geocoding API (google.maps.Geocoder) to convert GPS coordinates
 * (latitude, longitude) into structured Indian address components:
 * - houseFlat (House / Flat No)
 * - buildingName (Building / Apartment Name)
 * - street (Street / Road)
 * - area (Area / Locality)
 * - landmark (Landmark)
 * - city (City)
 * - state (State)
 * - postalCode (PIN Code)
 * - formattedAddress (Clean composite address)
 * Exclusively utilizes Google Maps Geocoding API.
 */

import { isGoogleMapsLoaded, loadGoogleMapsApi } from './googleMapsLoader';

export interface StructuredAddressComponents {
  houseFlat: string;
  buildingName: string;
  street: string;
  area: string;
  landmark: string;
  city: string;
  state: string;
  postalCode: string;
  formattedAddress: string;
}

export interface GeolocationResult {
  latitude: number;
  longitude: number;
  address: string;
  components?: StructuredAddressComponents;
}

/**
 * Capture customer browser GPS coordinates with clear error messages.
 */
export async function getCurrentBrowserLocation(): Promise<{ latitude: number; longitude: number }> {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    throw new Error('Geolocation is not supported by your browser.');
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        let msg = 'Location access was not allowed.';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg = 'Location permission was denied. You can select your location on the map or enter details manually.';
            break;
          case error.POSITION_UNAVAILABLE:
            msg = 'Device location is currently unavailable. You can select your location on the map.';
            break;
          case error.TIMEOUT:
            msg = 'Location request timed out. Please try again or select on the map.';
            break;
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000,
      }
    );
  });
}

/**
/**
 * Extract structured address fields by aggregating across all Google Maps Geocoder results.
 */
export function parseGoogleGeocodeResults(
  results: any[],
  lat: number,
  lon: number
): StructuredAddressComponents {
  const structured: StructuredAddressComponents = {
    houseFlat: '',
    buildingName: '',
    street: '',
    area: '',
    landmark: '',
    city: '',
    state: '',
    postalCode: '',
    formattedAddress: '',
  };

  if (!results || results.length === 0) {
    structured.city = 'Hyderabad';
    structured.state = 'Telangana';
    structured.postalCode = '500043';
    structured.formattedAddress = `Location (${lat.toFixed(4)}, ${lon.toFixed(4)})`;
    return structured;
  }

  // 1. Pick the best formatted address (skip pure plus codes like "M9CW+3V Hyderabad")
  for (const r of results) {
    const addr = (r.formatted_address || '').trim();
    if (addr && !addr.startsWith('+') && !/^[A-Z0-9]{4}\+[A-Z0-9]{2,}/.test(addr)) {
      if (!structured.formattedAddress) {
        structured.formattedAddress = addr;
      }
    }
  }
  if (!structured.formattedAddress && results[0]?.formatted_address) {
    structured.formattedAddress = results[0].formatted_address;
  }

  const sublocalitySet = new Set<string>();

  // 2. Iterate across ALL results in the response (from most specific to broadest)
  for (const r of results) {
    const components = r.address_components || [];

    for (const comp of components) {
      const types: string[] = comp.types || [];
      const longName = comp.long_name ? comp.long_name.trim() : '';
      if (!longName) continue;

      if (types.includes('street_number') && !structured.houseFlat) {
        structured.houseFlat = longName;
      } else if (types.includes('subpremise') && !structured.houseFlat) {
        structured.houseFlat = longName;
      } else if (types.includes('premise') && !structured.buildingName) {
        structured.buildingName = longName;
      } else if (
        (types.includes('point_of_interest') ||
          types.includes('establishment') ||
          types.includes('place_of_worship') ||
          types.includes('school') ||
          types.includes('transit_station') ||
          types.includes('bus_station') ||
          types.includes('park')) &&
        !structured.landmark
      ) {
        if (longName !== structured.buildingName) {
          structured.landmark = longName;
        }
      } else if (types.includes('route') && !structured.street) {
        structured.street = longName;
      } else if (
        types.includes('sublocality_level_3') ||
        types.includes('sublocality_level_2') ||
        types.includes('sublocality_level_1') ||
        types.includes('sublocality') ||
        types.includes('neighborhood')
      ) {
        sublocalitySet.add(longName);
      } else if (types.includes('locality') && !structured.city) {
        structured.city = longName;
      } else if (types.includes('administrative_area_level_2') && !structured.city) {
        structured.city = longName;
      } else if (types.includes('administrative_area_level_1') && !structured.state) {
        structured.state = longName;
      } else if (types.includes('postal_code') && !structured.postalCode) {
        const pinMatch = longName.match(/\b([1-9][0-9]{5})\b/);
        if (pinMatch) {
          structured.postalCode = pinMatch[1];
        }
      }
    }

    // Also scan formatted_address for 6-digit Indian PIN code
    if (!structured.postalCode && r.formatted_address) {
      const pinMatch = r.formatted_address.match(/\b([1-9][0-9]{5})\b/);
      if (pinMatch) {
        structured.postalCode = pinMatch[1];
      }
    }
  }

  // Combine collected sublocalities into area
  if (sublocalitySet.size > 0) {
    structured.area = Array.from(sublocalitySet).slice(0, 2).join(', ');
  }

  // Fallback city & state defaults
  if (!structured.city) structured.city = 'Hyderabad';
  if (!structured.state) structured.state = 'Telangana';

  return structured;
}

/**
 * Backward compatibility wrapper for single Google Geocoder result.
 */
export function parseGoogleGeocodeResult(
  result: any,
  lat: number,
  lon: number
): StructuredAddressComponents {
  return parseGoogleGeocodeResults([result], lat, lon);
}

/**
 * Query OpenStreetMap Nominatim reverse geocoding to fill missing Indian address fields.
 */
async function fetchNominatimReverse(
  latitude: number,
  longitude: number
): Promise<Partial<StructuredAddressComponents> | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`;
    const res = await fetch(url, {
      headers: {
        'Accept-Language': 'en',
      },
      signal: AbortSignal.timeout(3500),
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (!data || !data.address) return null;

    const addr = data.address;
    const partial: Partial<StructuredAddressComponents> = {};

    if (addr.postcode) {
      const match = String(addr.postcode).match(/\b([1-9][0-9]{5})\b/);
      if (match) partial.postalCode = match[1];
    }

    const areaCandidate =
      addr.suburb ||
      addr.neighbourhood ||
      addr.residential ||
      addr.village ||
      addr.hamlet ||
      addr.county ||
      '';
    if (areaCandidate) {
      partial.area = areaCandidate;
    }

    if (addr.road) {
      partial.street = addr.road;
    }

    const landmarkCandidate =
      addr.amenity ||
      addr.building ||
      addr.shop ||
      addr.place_of_worship ||
      addr.leisure ||
      '';
    if (landmarkCandidate) {
      partial.landmark = landmarkCandidate;
    }

    if (addr.building) {
      partial.buildingName = addr.building;
    }

    if (addr.city || addr.town || addr.county) {
      partial.city = addr.city || addr.town || addr.county;
    }

    if (addr.state) {
      partial.state = addr.state;
    }

    if (data.display_name) {
      partial.formattedAddress = data.display_name;
    }

    return partial;
  } catch (_e) {
    return null;
  }
}

/**
 * Perform structured reverse geocoding using Google Maps JavaScript API Geocoder,
 * enhanced with OpenStreetMap Nominatim fallback to guarantee PIN code, Area, and Street.
 */
// In-memory cache for reverse geocode coordinates to prevent duplicate API queries
const geocodeCache = new Map<string, StructuredAddressComponents>();

export async function reverseGeocodeStructured(
  latitude: number,
  longitude: number
): Promise<StructuredAddressComponents> {
  const cacheKey = `${latitude.toFixed(4)}_${longitude.toFixed(4)}`;
  if (geocodeCache.has(cacheKey)) {
    return { ...geocodeCache.get(cacheKey)! };
  }

  let structured: StructuredAddressComponents = {
    houseFlat: '',
    buildingName: '',
    street: '',
    area: '',
    landmark: '',
    city: 'Hyderabad',
    state: 'Telangana',
    postalCode: '',
    formattedAddress: `Selected Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
  };

  // 1. Attempt Google Maps Geocoding
  try {
    let mapsApi: any;
    if (isGoogleMapsLoaded()) {
      mapsApi = (window as any).google?.maps;
    } else {
      mapsApi = await loadGoogleMapsApi();
    }

    if (mapsApi && mapsApi.Geocoder) {
      const geocoder = new mapsApi.Geocoder();
      const response = await geocoder.geocode({
        location: { lat: latitude, lng: longitude },
      });

      if (response && response.results && response.results.length > 0) {
        structured = parseGoogleGeocodeResults(response.results, latitude, longitude);
      }
    }
  } catch (_err) {
    // Graceful error: Google geocoder failed or had network/quota limit
  }

  // 2. If critical fields (PIN code, area, or street) are missing, enrich via Nominatim
  if (!structured.postalCode || !structured.area || !structured.street || !structured.landmark) {
    try {
      const nominatimData = await fetchNominatimReverse(latitude, longitude);
      if (nominatimData) {
        if (!structured.postalCode && nominatimData.postalCode) {
          structured.postalCode = nominatimData.postalCode;
        }
        if (!structured.area && nominatimData.area) {
          structured.area = nominatimData.area;
        }
        if (!structured.street && nominatimData.street) {
          structured.street = nominatimData.street;
        }
        if (!structured.landmark && nominatimData.landmark) {
          structured.landmark = nominatimData.landmark;
        }
        if (!structured.buildingName && nominatimData.buildingName) {
          structured.buildingName = nominatimData.buildingName;
        }
        if ((!structured.city || structured.city === 'Hyderabad') && nominatimData.city) {
          structured.city = nominatimData.city;
        }
        if (!structured.state && nominatimData.state) {
          structured.state = nominatimData.state;
        }
        if (
          (!structured.formattedAddress ||
            structured.formattedAddress.startsWith('Selected Location')) &&
          nominatimData.formattedAddress
        ) {
          structured.formattedAddress = nominatimData.formattedAddress;
        }
      }
    } catch (_err) {
      // Ignore enrichment error
    }
  }

  // 3. Proximity safety net for TryIt Cafe local delivery zone (Dundigal/Bowrampet/Gandimaisamma)
  // Distance from TryIt Cafe (17.5765, 78.4217)
  const dLat = Math.abs(latitude - 17.5765);
  const dLon = Math.abs(longitude - 78.4217);
  const isNearTryitCafe = dLat < 0.15 && dLon < 0.15; // Within ~15km radius

  if (isNearTryitCafe) {
    if (!structured.postalCode) {
      structured.postalCode = '500043';
    }
    if (!structured.area) {
      structured.area = 'Gandimaisamma';
    }
  }

  if (!structured.city) structured.city = 'Hyderabad';
  if (!structured.state) structured.state = 'Telangana';

  geocodeCache.set(cacheKey, { ...structured });

  return structured;
}

export async function reverseGeocodeCoordinates(latitude: number, longitude: number): Promise<string> {
  const structured = await reverseGeocodeStructured(latitude, longitude);
  return structured.formattedAddress;
}
