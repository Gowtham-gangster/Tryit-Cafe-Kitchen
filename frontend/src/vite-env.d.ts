/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_GOOGLE_CLIENT_ID?: string;
  readonly VITE_GOOGLE_MAPS_API_KEY?: string;
  readonly VITE_GOOGLE_MAPS_EMBED_URL?: string;

  // Public Cafe Contact & Social Configuration
  readonly VITE_CAFE_WHATSAPP_NUMBER?: string;
  readonly VITE_CAFE_PHONE_NUMBER?: string;
  readonly VITE_CAFE_EMAIL?: string;
  readonly VITE_CAFE_INSTAGRAM_URL?: string;
  readonly VITE_CAFE_INSTAGRAM_HANDLE?: string;

  // Legacy Aliases
  readonly VITE_WHATSAPP_NUMBER?: string;
  readonly VITE_SUPPORT_EMAIL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
