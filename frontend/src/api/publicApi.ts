import { apiClient } from './client';
import { ApiResponse, BusinessSettings, Category, GalleryItem, MenuItem, Offer, Review, OnlineOrderingStatus } from '../types';

export const publicApi = {
  getSettings: async () => {
    const res = await apiClient.get<ApiResponse<BusinessSettings>>('/public/settings');
    return res.data.data;
  },

  getOnlineOrderingStatus: async () => {
    const res = await apiClient.get<ApiResponse<OnlineOrderingStatus>>('/public/business/status');
    return res.data.data;
  },

  getCategories: async () => {
    const res = await apiClient.get<ApiResponse<Category[]>>('/public/categories');
    return res.data.data;
  },

  getMenu: async (params?: { categoryId?: string; foodType?: string; bestseller?: boolean; search?: string }) => {
    const res = await apiClient.get<ApiResponse<MenuItem[]>>('/public/menu', { params });
    return res.data.data;
  },

  getMenuItemBySlug: async (slug: string) => {
    const res = await apiClient.get<ApiResponse<MenuItem>>(`/public/menu/${slug}`);
    return res.data.data;
  },

  getOffers: async () => {
    const res = await apiClient.get<ApiResponse<Offer[]>>('/public/offers');
    return res.data.data;
  },

  getGallery: async () => {
    const res = await apiClient.get<ApiResponse<GalleryItem[]>>('/public/gallery');
    return res.data.data;
  },

  getReviews: async () => {
    const res = await apiClient.get<ApiResponse<Review[]>>('/public/reviews');
    return res.data.data;
  },
};
