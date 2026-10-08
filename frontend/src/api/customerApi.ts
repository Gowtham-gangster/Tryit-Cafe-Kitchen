import { apiClient } from './client';
import { ApiResponse, CustomerLocation, OrderPreviewRequest, OrderPreviewResponse, User } from '../types';

export interface CreateLocationPayload {
  label: string;
  address: string;
  latitude: number;
  longitude: number;
  isDefault?: boolean;
  houseFlat?: string;
  buildingName?: string;
  street?: string;
  area?: string;
  landmark?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

export interface UpdateLocationPayload {
  label?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
  houseFlat?: string;
  buildingName?: string;
  street?: string;
  area?: string;
  landmark?: string;
  city?: string;
  state?: string;
  postalCode?: string;
}

export const customerApi = {
  getProfile: async (): Promise<User> => {
    const res = await apiClient.get<ApiResponse<User>>('/customer/profile');
    return res.data.data;
  },

  updateProfile: async (payload: { fullName: string; email?: string }): Promise<User> => {
    const res = await apiClient.put<ApiResponse<User>>('/customer/profile', payload);
    return res.data.data;
  },

  getLocations: async (): Promise<CustomerLocation[]> => {
    const res = await apiClient.get<ApiResponse<CustomerLocation[]>>('/customer/locations');
    return res.data.data;
  },

  createLocation: async (payload: CreateLocationPayload): Promise<CustomerLocation> => {
    const res = await apiClient.post<ApiResponse<CustomerLocation>>('/customer/locations', payload);
    return res.data.data;
  },

  updateLocation: async (id: string, payload: UpdateLocationPayload): Promise<CustomerLocation> => {
    const res = await apiClient.put<ApiResponse<CustomerLocation>>(`/customer/locations/${id}`, payload);
    return res.data.data;
  },

  deleteLocation: async (id: string): Promise<void> => {
    await apiClient.delete<ApiResponse<void>>(`/customer/locations/${id}`);
  },

  setDefaultLocation: async (id: string): Promise<CustomerLocation> => {
    const res = await apiClient.put<ApiResponse<CustomerLocation>>(`/customer/locations/${id}/default`);
    return res.data.data;
  },

  previewOrder: async (payload: OrderPreviewRequest): Promise<OrderPreviewResponse> => {
    const res = await apiClient.post<ApiResponse<OrderPreviewResponse>>('/customer/orders/preview', payload);
    return res.data.data;
  },

  submitReview: async (payload: { rating: number; comment: string }): Promise<any> => {
    const res = await apiClient.post<ApiResponse<any>>('/customer/reviews', payload);
    return res.data.data;
  },
};
