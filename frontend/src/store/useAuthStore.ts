import { create } from 'zustand';
import { CustomerLocation, GoogleAuthPayload, GoogleAuthResponse, MenuItem, User } from '../types';
import { authApi, RegisterPayload, UpdateProfilePayload } from '../api/authApi';
import { customerApi, CreateLocationPayload, UpdateLocationPayload } from '../api/customerApi';
import { apiClient } from '../api/client';

export interface PendingCartAction {
  item: MenuItem;
  quantity: number;
  specialInstruction?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isOwner: boolean;
  isLoading: boolean;
  error: string | null;

  // Saved Locations
  locations: CustomerLocation[];
  defaultLocation: CustomerLocation | null;
  selectedLocationId: string | null;

  // Interception & Resumption
  pendingCartAction: PendingCartAction | null;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  authModalReason: string | null;

  login: (phone: string, pass: string) => Promise<boolean>;
  ownerLogin: (phone: string, pass: string) => Promise<boolean>;
  register: (
    phone: string,
    fullName: string,
    email: string | undefined,
    pass: string,
    locationData?: { label?: string; address: string; latitude: number; longitude: number }
  ) => Promise<boolean>;
  googleSignIn: (payload: GoogleAuthPayload) => Promise<GoogleAuthResponse | null>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateProfile: (payload: UpdateProfilePayload) => Promise<boolean>;
  clearError: () => void;

  // Location Management
  fetchLocations: () => Promise<void>;
  addLocation: (payload: CreateLocationPayload) => Promise<CustomerLocation | null>;
  editLocation: (id: string, payload: UpdateLocationPayload) => Promise<boolean>;
  deleteLocation: (id: string) => Promise<boolean>;
  setDefaultLocation: (id: string) => Promise<boolean>;
  setSelectedLocationId: (id: string | null) => void;

  setPendingCartAction: (action: PendingCartAction | null) => void;
  openAuthModal: (mode?: 'login' | 'register', reason?: string, pendingAction?: PendingCartAction) => void;
  closeAuthModal: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
  const isOwnerRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/owner');
  const savedOwnerToken = typeof localStorage !== 'undefined' ? localStorage.getItem('tryit_owner_token') : null;
  const savedOwnerUser = typeof localStorage !== 'undefined' ? localStorage.getItem('tryit_owner_user') : null;
  const savedToken = typeof localStorage !== 'undefined' ? localStorage.getItem('tryit_auth_token') : null;
  const savedUser = typeof localStorage !== 'undefined' ? localStorage.getItem('tryit_user') : null;

  const activeToken = isOwnerRoute ? (savedOwnerToken || savedToken) : (savedToken || savedOwnerToken);
  const activeUserStr = isOwnerRoute ? (savedOwnerUser || savedUser) : (savedUser || savedOwnerUser);

  let initialUser: User | null = null;
  try {
    if (activeUserStr) initialUser = JSON.parse(activeUserStr);
  } catch (e) {
    initialUser = null;
  }

  return {
    token: activeToken,
    user: initialUser,
    isAuthenticated: !!activeToken && !!initialUser,
    isOwner: initialUser?.role === 'ROLE_OWNER',
    isLoading: false,
    error: null,

    locations: [],
    defaultLocation: null,
    selectedLocationId: null,

    pendingCartAction: null,
    isAuthModalOpen: false,
    authModalMode: 'login',
    authModalReason: null,

    login: async (phone, password) => {
      set({ isLoading: true, error: null });
      try {
        const data = await authApi.login({ phone, password });
        const userObj: User = {
          id: data.userId,
          phone: data.phone,
          fullName: data.fullName,
          email: data.email,
          role: data.role,
          profileImageUrl: data.profileImageUrl,
        };
        localStorage.setItem('tryit_auth_token', data.token);
        localStorage.setItem('tryit_user', JSON.stringify(userObj));
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        set({
          token: data.token,
          user: userObj,
          isAuthenticated: true,
          isOwner: data.role === 'ROLE_OWNER',
          isLoading: false,
          isAuthModalOpen: false,
        });

        if (userObj.role === 'ROLE_CUSTOMER') {
          get().fetchLocations();
        }
        return true;
      } catch (err: any) {
        const message = err.response?.data?.message || 'Invalid phone number or password';
        set({ error: message, isLoading: false });
        return false;
      }
    },

    ownerLogin: async (phone, password) => {
      set({ isLoading: true, error: null });
      try {
        const data = await authApi.ownerLogin({ phone, password });
        const userObj: User = {
          id: data.userId,
          phone: data.phone,
          fullName: data.fullName,
          email: data.email,
          role: data.role,
          profileImageUrl: data.profileImageUrl,
        };
        localStorage.setItem('tryit_owner_token', data.token);
        localStorage.setItem('tryit_owner_user', JSON.stringify(userObj));
        localStorage.setItem('tryit_auth_token', data.token);
        localStorage.setItem('tryit_user', JSON.stringify(userObj));
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        set({
          token: data.token,
          user: userObj,
          isAuthenticated: true,
          isOwner: true,
          isLoading: false,
          isAuthModalOpen: false,
        });
        return true;
      } catch (err: any) {
        const message = err.response?.data?.message || 'Invalid owner credentials';
        set({ error: message, isLoading: false });
        return false;
      }
    },

    register: async (phone, fullName, email, password, locationData) => {
      set({ isLoading: true, error: null });
      try {
        const payload: RegisterPayload = {
          phone,
          fullName,
          email,
          password,
        };

        if (locationData && locationData.latitude && locationData.longitude && locationData.address) {
          payload.locationLabel = locationData.label || 'Home';
          payload.address = locationData.address;
          payload.latitude = locationData.latitude;
          payload.longitude = locationData.longitude;
        }

        const data = await authApi.register(payload);
        const userObj: User = {
          id: data.userId,
          phone: data.phone,
          fullName: data.fullName,
          email: data.email,
          role: data.role,
          profileImageUrl: data.profileImageUrl,
        };
        localStorage.setItem('tryit_auth_token', data.token);
        localStorage.setItem('tryit_user', JSON.stringify(userObj));
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        set({
          token: data.token,
          user: userObj,
          isAuthenticated: true,
          isOwner: data.role === 'ROLE_OWNER',
          isLoading: false,
          isAuthModalOpen: false,
        });

        get().fetchLocations();
        return true;
      } catch (err: any) {
        const message = err.response?.data?.message || 'Registration failed. Please try again.';
        set({ error: message, isLoading: false });
        return false;
      }
    },

    googleSignIn: async (payload: GoogleAuthPayload): Promise<GoogleAuthResponse | null> => {
      set({ isLoading: true, error: null });
      try {
        const data = await authApi.googleAuth(payload);

        if (!data.needsProfileCompletion && data.authResponse) {
          const auth = data.authResponse;
          const userObj: User = {
            id: auth.userId,
            phone: auth.phone,
            fullName: auth.fullName,
            email: auth.email,
            role: auth.role,
            profileImageUrl: auth.profileImageUrl,
          };
          localStorage.setItem('tryit_auth_token', auth.token);
          localStorage.setItem('tryit_user', JSON.stringify(userObj));
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${auth.token}`;
          set({
            token: auth.token,
            user: userObj,
            isAuthenticated: true,
            isOwner: false,
            isLoading: false,
            isAuthModalOpen: false,
          });

          // Fetch customer saved locations
          get().fetchLocations();
        } else {
          set({ isLoading: false });
        }

        return data;
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Unable to sign in with Google. Please try again.';
        set({ error: msg, isLoading: false });
        return null;
      }
    },

    logout: () => {
      localStorage.removeItem('tryit_auth_token');
      localStorage.removeItem('tryit_user');
      localStorage.removeItem('tryit_owner_token');
      localStorage.removeItem('tryit_owner_user');
      delete apiClient.defaults.headers.common['Authorization'];
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isOwner: false,
        locations: [],
        defaultLocation: null,
        selectedLocationId: null,
        pendingCartAction: null,
        error: null,
      });
    },

    checkAuth: async () => {
      const { token } = get();
      if (!token) return;
      try {
        const profile = await authApi.getProfile();
        set({
          user: profile,
          isAuthenticated: true,
          isOwner: profile.role === 'ROLE_OWNER',
        });
        localStorage.setItem('tryit_user', JSON.stringify(profile));
        if (profile.role === 'ROLE_CUSTOMER') {
          get().fetchLocations();
        }
      } catch (e) {
        get().logout();
      }
    },

    updateProfile: async (payload: UpdateProfilePayload) => {
      set({ isLoading: true, error: null });
      try {
        const updated = await authApi.updateProfile(payload);
        set({ user: updated, isLoading: false });
        localStorage.setItem('tryit_user', JSON.stringify(updated));
        return true;
      } catch (err: any) {
        const message = err.response?.data?.message || 'Failed to update profile.';
        set({ error: message, isLoading: false });
        return false;
      }
    },

    // -------------------------------------------------------------
    // Location Management Actions
    // -------------------------------------------------------------

    fetchLocations: async (force = false) => {
      const { isAuthenticated, isOwner, locations } = get();
      if (!isAuthenticated || isOwner) return;
      if (!force && locations.length > 0) return;

      try {
        const list = await customerApi.getLocations();
        const def = list.find((l) => l.isDefault) || (list.length > 0 ? list[0] : null);
        set({
          locations: list,
          defaultLocation: def,
          selectedLocationId: get().selectedLocationId || def?.id || null,
        });
      } catch (e) {
        // Silent fail or non-blocking
      }
    },

    addLocation: async (payload: CreateLocationPayload) => {
      set({ isLoading: true, error: null });
      try {
        const created = await customerApi.createLocation(payload);
        const list = await customerApi.getLocations();
        const def = list.find((l) => l.isDefault) || (list.length > 0 ? list[0] : null);
        set({
          locations: list,
          defaultLocation: def,
          selectedLocationId: created.id,
          isLoading: false,
        });
        return created;
      } catch (err: any) {
        let msg = err.response?.data?.message || err.message || 'We couldn\'t save this location. Please try once more.';
        if (
          err.response?.status === 401 ||
          err.response?.status === 403 ||
          msg.toLowerCase().includes('authentication') ||
          msg.toLowerCase().includes('token')
        ) {
          msg = 'Your session has expired. Please sign in again to continue.';
          get().logout();
        }
        set({ error: msg, isLoading: false });
        return null;
      }
    },

    editLocation: async (id: string, payload: UpdateLocationPayload) => {
      set({ isLoading: true, error: null });
      try {
        await customerApi.updateLocation(id, payload);
        await get().fetchLocations();
        set({ isLoading: false });
        return true;
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Failed to update delivery location';
        set({ error: msg, isLoading: false });
        return false;
      }
    },

    deleteLocation: async (id: string) => {
      set({ isLoading: true, error: null });
      try {
        await customerApi.deleteLocation(id);
        const remaining = get().locations.filter((l) => l.id !== id);
        const newSelected = get().selectedLocationId === id ? (remaining[0]?.id || null) : get().selectedLocationId;
        set({ selectedLocationId: newSelected });
        await get().fetchLocations();
        set({ isLoading: false });
        return true;
      } catch (err: any) {
        const msg = err.response?.data?.message || 'Failed to delete location';
        set({ error: msg, isLoading: false });
        return false;
      }
    },

    setDefaultLocation: async (id: string) => {
      try {
        await customerApi.setDefaultLocation(id);
        await get().fetchLocations();
        set({ selectedLocationId: id });
        return true;
      } catch (err: any) {
        return false;
      }
    },

    setSelectedLocationId: (id: string | null) => {
      set({ selectedLocationId: id });
    },

    clearError: () => set({ error: null }),

    setPendingCartAction: (action) => set({ pendingCartAction: action }),

    openAuthModal: (mode = 'login', reason, pendingAction) => {
      set({
        isAuthModalOpen: true,
        authModalMode: mode,
        authModalReason: reason || null,
        pendingCartAction: pendingAction || get().pendingCartAction,
        error: null,
      });
    },

    closeAuthModal: () => {
      set({
        isAuthModalOpen: false,
        authModalReason: null,
        error: null,
      });
    },
  };
});
