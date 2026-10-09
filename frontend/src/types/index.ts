export type FoodType = 'VEG' | 'NON_VEG' | 'EGG';
export type ReviewStatus = 'PENDING' | 'APPROVED' | 'HIDDEN';
export type MediaType = 'IMAGE' | 'VIDEO';
export type DiscountType = 'PERCENTAGE' | 'FLAT_AMOUNT' | 'PROMO_TEXT';
export type UserRole = 'ROLE_CUSTOMER' | 'ROLE_OWNER';

export interface User {
  id: string;
  phone: string;
  fullName: string;
  email?: string;
  role: UserRole;
  profileImageUrl?: string;
}

export interface AuthResponse {
  token: string;
  userId: string;
  phone: string;
  fullName: string;
  email?: string;
  role: UserRole;
  profileImageUrl?: string;
}

export interface GoogleAuthPayload {
  idToken: string;
  phone?: string;
  fullName?: string;
  locationLabel?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

export interface GoogleAuthResponse {
  needsProfileCompletion: boolean;
  googleSubject?: string;
  email?: string;
  fullName?: string;
  profileImageUrl?: string;
  authResponse?: AuthResponse;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  displayOrder: number;
  active: boolean;
  itemCount?: number;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  categoryName?: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  foodType: FoodType;
  imageUrl?: string;
  imagePublicId?: string;
  available: boolean;
  bestseller: boolean;
  isNew: boolean;
  new?: boolean;
  is_new?: boolean;
  isPopular?: boolean;
  popular?: boolean;
  popularDisplayOrder?: number;
  displayOrder: number;
  // Discount & Pricing
  discountEnabled?: boolean;
  discountType?: 'PERCENTAGE' | 'FIXED' | 'FLAT_AMOUNT';
  discountValue?: number;
  discountAmount?: number;
  effectivePrice?: number;
}

export interface Offer {
  id: string;
  title: string;
  badgeText?: string;
  description?: string;
  discountType: DiscountType;
  discountValue?: number;
  minOrderAmount?: number;
  bannerImageUrl?: string;
  bannerPublicId?: string;
  startDate?: string;
  endDate?: string;
  active: boolean;
  displayOrder: number;
}

export interface GalleryItem {
  id: string;
  mediaType: MediaType;
  mediaUrl: string;
  mediaPublicId?: string;
  thumbnailUrl?: string;
  title?: string;
  caption?: string;
  categoryTag: string; // AMBIENCE, FOOD, KITCHEN, EVENTS
  displayOrder: number;
  active: boolean;
  createdAt?: string;
}

export interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  createdAt?: string;
}

export interface BusinessHours {
  id: string;
  dayOfWeek: string;
  openTime: string;
  closeTime: string;
  closed: boolean;
  dayOrder: number;
}

export interface BusinessSettings {
  id: string;
  cafeName: string;
  tagline: string;
  aboutText: string;
  heroHeading: string;
  heroSubheading: string;
  heroMediaUrl?: string;
  heroMediaType?: string;
  heroMediaPublicId?: string;
  phoneNumber: string;
  whatsappNumber: string;
  email: string;
  instagramUrl: string;
  address: string;
  plusCode?: string;
  googleMapsEmbedUrl?: string;
  googleMapsLink?: string;
  displayRating?: number;
  displayReviewCount?: number;
  priceRangeText?: string;
  onlineOrderingEnabled: boolean;
  closureMessage?: string;
  nextOpeningTime?: string;
  cafeLatitude?: number;
  cafeLongitude?: number;
  freeDeliveryDistanceKm?: number;
  deliveryRatePerKm?: number;
  businessHours: BusinessHours[];
}

export interface CustomerLocation {
  id: string;
  customerId: string;
  label: string;
  address: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
  houseFlat?: string;
  buildingName?: string;
  street?: string;
  area?: string;
  landmark?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type OrderType = 'DELIVERY' | 'TAKEAWAY';

export interface OrderPreviewItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  itemTotal: number;
  imageUrl?: string;
  foodType?: FoodType;
}

export interface OrderPreviewRequest {
  orderType: OrderType;
  locationId?: string;
  items: {
    menuItemId: string;
    quantity: number;
  }[];
  instructions?: string;
  cravingText?: string;
}

export interface OrderPreviewResponse {
  orderType: OrderType;
  subtotal: number;
  distanceKm: number;
  deliveryCharge: number;
  total: number;
  freeDeliveryDistanceKm: number;
  deliveryRatePerKm: number;
  location?: CustomerLocation | null;
  items: OrderPreviewItem[];
}

export interface OnlineOrderingStatus {
  onlineOrderingEnabled: boolean;
  closureMessage?: string;
  nextOpeningTime?: string;
}

export interface DashboardSummary {
  totalMenuItems: number;
  availableMenuItems: number;
  totalCategories: number;
  activeOffers: number;
  totalReviews: number;
  pendingReviews: number;
  approvedReviews: number;
  averageRating: number;
}

export interface CartItem {
  item: MenuItem;
  quantity: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

