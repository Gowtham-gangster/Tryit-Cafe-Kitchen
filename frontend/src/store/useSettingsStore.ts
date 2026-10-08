import { create } from 'zustand';
import { BusinessSettings } from '../types';
import { publicApi } from '../api/publicApi';

interface SettingsState {
  settings: BusinessSettings | null;
  isLoading: boolean;
  error: string | null;
  fetchSettings: (force?: boolean) => Promise<void>;
  updateLocalOrderingStatus: (enabled: boolean, closureMessage?: string, nextOpeningTime?: string) => void;
  isOnlineOrderingOpen: () => boolean;
  getClosureMessage: () => string;
  getNextOpeningTime: () => string;
}

// In-flight request deduplication and timestamp caching
let inFlightSettingsPromise: Promise<void> | null = null;
let lastSettingsFetchTime = 0;
const SETTINGS_CACHE_TTL_MS = 30_000; // 30 seconds fresh cache

export const useSettingsStore = create<SettingsState>((set, get) => {
  // Focus auto-refresh only when stale
  if (typeof window !== 'undefined') {
    window.addEventListener('focus', () => {
      if (Date.now() - lastSettingsFetchTime > SETTINGS_CACHE_TTL_MS) {
        get().fetchSettings(true);
      }
    });
  }

  return {
    settings: null,
    isLoading: false,
    error: null,

    fetchSettings: async (force = false) => {
      if (force) {
        lastSettingsFetchTime = 0;
        inFlightSettingsPromise = null;
      }

      // Reuse fresh cache if available and not forced
      if (!force && get().settings && Date.now() - lastSettingsFetchTime < SETTINGS_CACHE_TTL_MS) {
        return;
      }

      // Deduplicate simultaneous concurrent requests
      if (inFlightSettingsPromise) {
        return inFlightSettingsPromise;
      }

      set({ isLoading: true, error: null });

      inFlightSettingsPromise = (async () => {
        try {
          const data = await publicApi.getSettings();
          lastSettingsFetchTime = Date.now();
          set({ settings: data, isLoading: false });
        } catch (e: any) {
          set({ error: 'Failed to load cafe settings', isLoading: false });
        } finally {
          inFlightSettingsPromise = null;
        }
      })();

      return inFlightSettingsPromise;
    },

    updateLocalOrderingStatus: (enabled, closureMessage, nextOpeningTime) => {
      const current = get().settings;
      if (current) {
        set({
          settings: {
            ...current,
            onlineOrderingEnabled: enabled,
            closureMessage: closureMessage !== undefined ? closureMessage : current.closureMessage,
            nextOpeningTime: nextOpeningTime !== undefined ? nextOpeningTime : current.nextOpeningTime,
          },
        });
      }
    },

    isOnlineOrderingOpen: () => {
      const s = get().settings;
      return s ? s.onlineOrderingEnabled !== false : true;
    },

    getClosureMessage: () => {
      const s = get().settings;
      return s?.closureMessage && s.closureMessage.trim().length > 0
        ? s.closureMessage.trim()
        : "Online ordering is currently closed. We'll be back soon!";
    },

    getNextOpeningTime: () => {
      return get().settings?.nextOpeningTime || '';
    },
  };
});
