import { apiClient } from './client';
import { ApiResponse, AuthResponse, GoogleAuthPayload, GoogleAuthResponse, User } from '../types';

export interface UpdateProfilePayload {
  fullName?: string;
  phone?: string;
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

  forgotPassword: async (emailOrPhone: string) => {
    const res = await apiClient.post<ApiResponse<void>>('/auth/forgot-password', { email: emailOrPhone });
    return res.data.message || 'Password reset link sent to your registered email';
  },

  verifyResetToken: async (token: string) => {
    const res = await apiClient.get<ApiResponse<{ valid: boolean; email?: string; fullName?: string }>>(
      `/auth/verify-reset-token?token=${encodeURIComponent(token)}`
    );
    return res.data.data;
  },

  resetPassword: async (token: string, newPassword: string) => {
    const res = await apiClient.post<ApiResponse<void>>('/auth/reset-password', { token, newPassword });
    return res.data.message || 'Password reset successfully';
  },

  deleteAccount: async () => {
    const res = await apiClient.delete<ApiResponse<void>>('/auth/account');
    return res.data.message || 'Account permanently deleted';
  },
};
