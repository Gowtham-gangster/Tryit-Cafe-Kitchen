import { apiClient } from './client';
import { ApiResponse, AuthResponse, GoogleAuthPayload, GoogleAuthResponse, User } from '../types';

export interface UpdateProfilePayload {
  fullName?: string;
  email?: string;
  profileImageUrl?: string;
  currentPassword?: string;
  newPassword?: string;
}

export interface RegisterPayload {
  phone: string;
  fullName: string;
  email?: string;
  password: string;
  locationLabel?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

export const authApi = {
  register: async (payload: RegisterPayload) => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', payload);
    return res.data.data;
  },

  login: async (payload: { phone: string; password: string }) => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', payload);
    return res.data.data;
  },

  ownerLogin: async (payload: { phone: string; password: string }) => {
    const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/owner-login', payload);
    return res.data.data;
  },

  getProfile: async () => {
    const res = await apiClient.get<ApiResponse<User>>('/auth/me');
    return res.data.data;
  },

  updateProfile: async (payload: UpdateProfilePayload) => {
    const res = await apiClient.put<ApiResponse<User>>('/auth/profile', payload);
    return res.data.data;
  },

  googleAuth: async (payload: GoogleAuthPayload) => {
    const res = await apiClient.post<ApiResponse<GoogleAuthResponse>>('/auth/google', payload);
    return res.data.data;
  },
};
