import { apiClient } from './client';
import { ApiResponse, BusinessHours, BusinessSettings, Category, DashboardSummary, GalleryItem, MenuItem, Offer, Review, ReviewStatus } from '../types';

export const ownerApi = {
  // Dashboard
  getSummary: async () => {
    const res = await apiClient.get<ApiResponse<DashboardSummary>>('/owner/summary');
    return res.data.data;
  },

  // Categories
  getCategories: async () => {
    const res = await apiClient.get<ApiResponse<Category[]>>('/owner/categories');
    return res.data.data;
  },
  createCategory: async (payload: { name: string; description?: string; displayOrder?: number; active?: boolean }) => {
    const res = await apiClient.post<ApiResponse<Category>>('/owner/categories', payload);
    return res.data.data;
  },
  updateCategory: async (id: string, payload: { name: string; description?: string; displayOrder?: number; active?: boolean }) => {
    const res = await apiClient.put<ApiResponse<Category>>(`/owner/categories/${id}`, payload);
    return res.data.data;
  },
  deleteCategory: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<void>>(`/owner/categories/${id}`);
    return res.data.data;
  },

  // Menu Items
  getMenuItems: async () => {
    const res = await apiClient.get<ApiResponse<MenuItem[]>>('/owner/menu');
    return res.data.data;
  },
  createMenuItem: async (payload: Partial<MenuItem>) => {
    const res = await apiClient.post<ApiResponse<MenuItem>>('/owner/menu', payload);
    return res.data.data;
  },
  updateMenuItem: async (id: string, payload: Partial<MenuItem>) => {
    const res = await apiClient.put<ApiResponse<MenuItem>>(`/owner/menu/${id}`, payload);
    return res.data.data;
  },
  toggleAvailability: async (id: string) => {
    const res = await apiClient.patch<ApiResponse<MenuItem>>(`/owner/menu/${id}/availability`);
    return res.data.data;
  },
  togglePopular: async (id: string, popular?: boolean, displayOrder?: number) => {
    const params = new URLSearchParams();
    if (popular !== undefined) params.append('popular', String(popular));
    if (displayOrder !== undefined) params.append('displayOrder', String(displayOrder));
    const qs = params.toString() ? `?${params.toString()}` : '';
    const res = await apiClient.patch<ApiResponse<MenuItem>>(`/owner/menu/${id}/popular${qs}`);
    return res.data.data;
  },
  deleteMenuItem: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<void>>(`/owner/menu/${id}`);
    return res.data.data;
  },

  // Offers
  getOffers: async () => {
    const res = await apiClient.get<ApiResponse<Offer[]>>('/owner/offers');
    return res.data.data;
  },
  createOffer: async (payload: Partial<Offer>) => {
    const res = await apiClient.post<ApiResponse<Offer>>('/owner/offers', payload);
    return res.data.data;
  },
  updateOffer: async (id: string, payload: Partial<Offer>) => {
    const res = await apiClient.put<ApiResponse<Offer>>(`/owner/offers/${id}`, payload);
    return res.data.data;
  },
  toggleOfferStatus: async (id: string) => {
    const res = await apiClient.patch<ApiResponse<Offer>>(`/owner/offers/${id}/status`);
    return res.data.data;
  },
  deleteOffer: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<void>>(`/owner/offers/${id}`);
    return res.data.data;
  },

  // Gallery
  getGalleryItems: async () => {
    const res = await apiClient.get<ApiResponse<GalleryItem[]>>('/owner/gallery');
    return res.data.data;
  },
  addGalleryItem: async (payload: Partial<GalleryItem>) => {
    const res = await apiClient.post<ApiResponse<GalleryItem>>('/owner/gallery', payload);
    return res.data.data;
  },
  updateGalleryItem: async (id: string, payload: Partial<GalleryItem>) => {
    const res = await apiClient.put<ApiResponse<GalleryItem>>(`/owner/gallery/${id}`, payload);
    return res.data.data;
  },
  deleteGalleryItem: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<void>>(`/owner/gallery/${id}`);
    return res.data.data;
  },

  // Media Upload (Cloudinary via backend)
  uploadMedia: async (file: File, folder: string = 'dishes') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const res = await apiClient.post<ApiResponse<{ url: string; publicId: string }>>(
      '/owner/upload-media',
      formData,
      {
        headers: {
          'Content-Type': undefined,
        },
      }
    );
    return res.data.data;
  },

  // Reviews Moderation
  getReviews: async () => {
    const res = await apiClient.get<ApiResponse<Review[]>>('/owner/reviews');
    return res.data.data;
  },
  updateReviewStatus: async (id: string, status: ReviewStatus) => {
    const res = await apiClient.patch<ApiResponse<Review>>(`/owner/reviews/${id}/status`, { status });
    return res.data.data;
  },
  deleteReview: async (id: string) => {
    const res = await apiClient.delete<ApiResponse<void>>(`/owner/reviews/${id}`);
    return res.data.data;
  },

  // Settings & Hours
  getSettings: async () => {
    const res = await apiClient.get<ApiResponse<BusinessSettings>>('/owner/settings');
    return res.data.data;
  },
  updateSettings: async (payload: Partial<BusinessSettings>) => {
    const res = await apiClient.put<ApiResponse<BusinessSettings>>('/owner/settings', payload);
    return res.data.data;
  },
  updateBusinessHours: async (hours: BusinessHours[]) => {
    const res = await apiClient.put<ApiResponse<BusinessHours[]>>('/owner/business-hours', { hours });
    return res.data.data;
  },

  // Online Ordering Control
  getOnlineOrderingStatus: async () => {
    const res = await apiClient.get<ApiResponse<{ onlineOrderingEnabled: boolean; closureMessage?: string; nextOpeningTime?: string }>>('/owner/business/online-ordering');
    return res.data.data;
  },
  updateOnlineOrderingStatus: async (payload: { enabled: boolean; closureMessage?: string; nextOpeningTime?: string }) => {
    const res = await apiClient.put<ApiResponse<{ onlineOrderingEnabled: boolean; closureMessage?: string; nextOpeningTime?: string }>>('/owner/business/online-ordering', payload);
    return res.data;
  },
};
