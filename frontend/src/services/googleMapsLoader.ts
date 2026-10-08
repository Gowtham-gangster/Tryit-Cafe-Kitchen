/**
 * Google Maps JavaScript API Dynamic Loader
 *
 * Provides singleton on-demand loading of the Google Maps JavaScript API
 * using VITE_GOOGLE_MAPS_API_KEY.
 *
 * Listens for load errors and Google Maps auth failure callbacks (gm_authFailure)
 * to provide clean, application-level error states.
 */

declare global {
  interface Window {
    gm_authFailure?: () => void;
  }
}

let loadPromise: Promise<any> | null = null;
let authFailed = false;

// Register global Google Maps authentication failure handler
if (typeof window !== 'undefined') {
  const originalAuthFailure = window.gm_authFailure;
  window.gm_authFailure = () => {
    authFailed = true;
    if (typeof originalAuthFailure === 'function') {
      originalAuthFailure();
    }
  };
}

export function isGoogleMapsLoaded(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.google !== 'undefined' &&
    typeof window.google.maps !== 'undefined'
  );
}

export function loadGoogleMapsApi(): Promise<any> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Window is not defined'));
  }

  if (isGoogleMapsLoaded() && !authFailed) {
    return Promise.resolve(window.google.maps);
  }

  if (authFailed) {
    return Promise.reject(new Error("Map couldn't be loaded (Google Maps authentication failed)"));
  }

  if (loadPromise) {
    return loadPromise;
  }

  const apiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim();

  // If no API key is configured at all
  if (!apiKey) {
    return Promise.reject(
      new Error("Map couldn't be loaded: VITE_GOOGLE_MAPS_API_KEY is not configured in .env")
    );
  }

  loadPromise = new Promise((resolve, reject) => {
    // Check if script tag already exists
    const existingScript = document.getElementById('tryit-google-maps-script') as HTMLScriptElement | null;
    if (existingScript) {
      if (isGoogleMapsLoaded()) {
        resolve(window.google.maps);
        return;
      }
    }

    const script = existingScript || document.createElement('script');
    script.id = 'tryit-google-maps-script';
    script.type = 'text/javascript';
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(
      apiKey
    )}&libraries=places,geometry&v=weekly`;

    script.onload = () => {
      if (authFailed) {
        reject(new Error("Map couldn't be loaded"));
        return;
      }
      if (isGoogleMapsLoaded()) {
        resolve(window.google.maps);
      } else {
        reject(new Error("Map couldn't be loaded"));
      }
    };

    script.onerror = () => {
      loadPromise = null;
      reject(new Error("Map couldn't be loaded"));
    };

    if (!existingScript) {
      document.head.appendChild(script);
    }
  });

  return loadPromise;
}

/**
 * Reset loader state to retry loading (e.g. user clicked "Try Again")
 */
export function resetGoogleMapsLoader(): void {
  loadPromise = null;
  authFailed = false;
  const script = document.getElementById('tryit-google-maps-script');
  if (script && script.parentNode) {
    script.parentNode.removeChild(script);
  }
}
