/**
 * Google Identity Services (GIS) / OAuth 2.0 Integration Service
 *
 * Implements the official Google Identity Services client SDK for Web:
 * - Loads https://accounts.google.com/gsi/client
 * - Initializes GIS client with VITE_GOOGLE_CLIENT_ID
 * - Dispatches credential (ID Token) to authentication callback
 */

declare global {
  interface Window {
    google?: any;
  }
}

export const getGoogleClientId = (): string => {
  return (import.meta.env.VITE_GOOGLE_CLIENT_ID || '').trim();
};

export const isGoogleAuthConfigured = (): boolean => {
  const clientId = getGoogleClientId();
  return Boolean(clientId && clientId !== 'your_google_client_id_here.apps.googleusercontent.com');
};

let scriptLoadingPromise: Promise<boolean> | null = null;

export const loadGoogleScript = (): Promise<boolean> => {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.google?.accounts?.id) return Promise.resolve(true);

  if (scriptLoadingPromise) return scriptLoadingPromise;

  scriptLoadingPromise = new Promise((resolve) => {
    // Check if already in DOM
    const existing = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(true));
      existing.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.warn('Failed to load Google Identity Services SDK');
      resolve(false);
    };
    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
};

export const initGoogleIdentity = async (
  onCredentialReceived: (credential: string) => void,
  onError?: (errorMsg: string) => void
): Promise<boolean> => {
  const clientId = getGoogleClientId();
  if (!clientId || clientId.includes('your_google_client_id_here')) {
    if (onError) {
      onError('Google Sign-In is not configured yet. Please configure VITE_GOOGLE_CLIENT_ID in your environment.');
    }
    return false;
  }

  const loaded = await loadGoogleScript();
  if (!loaded || !window.google?.accounts?.id) {
    if (onError) {
      onError('Unable to connect to Google authentication services. Please check your network or ad-blocker.');
    }
    return false;
  }

  try {
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: (response: { credential?: string }) => {
        if (response.credential) {
          onCredentialReceived(response.credential);
        } else {
          if (onError) onError('No credential received from Google.');
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });
    return true;
  } catch (err: any) {
    console.error('GIS initialization error:', err);
    if (onError) onError('Failed to initialize Google Sign-In.');
    return false;
  }
};

export const promptGoogleSignIn = (
  onCredentialReceived: (credential: string) => void,
  onError?: (errorMsg: string) => void
) => {
  initGoogleIdentity(onCredentialReceived, onError).then((ready) => {
    if (ready && window.google?.accounts?.id) {
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          const reason = notification.getNotDisplayedReason?.() || notification.getSkippedReason?.();
          console.info('Google prompt note:', reason);
        }
      });
    }
  });
};
