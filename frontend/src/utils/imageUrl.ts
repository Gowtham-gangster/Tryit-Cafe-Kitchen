/**
 * Centralized Image Optimization & Cloudinary Transformation Engine
 *
 * Automatically provides format negotiation (AVIF/WebP), quality compression,
 * and responsive dimensional scaling according to standardized display presets.
 */

export type ImagePreset =
  | 'hero'
  | 'menuCard'
  | 'menuDetail'
  | 'gallery'
  | 'galleryLightbox'
  | 'offerBanner'
  | 'ownerThumbnail'
  | 'avatar';

interface TransformOptions {
  width?: number;
  height?: number;
  quality?: 'auto' | 'auto:good' | 'auto:eco' | 'auto:low' | number;
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  crop?: 'limit' | 'fill' | 'scale' | 'thumb' | 'fit';
  preset?: ImagePreset;
}

const PRESET_CONFIGS: Record<ImagePreset, TransformOptions> = {
  hero: { width: 1280, quality: 'auto:good', format: 'auto', crop: 'limit' },
  menuCard: { width: 480, quality: 'auto:good', format: 'auto', crop: 'limit' },
  menuDetail: { width: 720, quality: 'auto:good', format: 'auto', crop: 'limit' },
  gallery: { width: 640, quality: 'auto:good', format: 'auto', crop: 'limit' },
  galleryLightbox: { width: 1200, quality: 'auto:good', format: 'auto', crop: 'limit' },
  offerBanner: { width: 840, quality: 'auto:good', format: 'auto', crop: 'limit' },
  ownerThumbnail: { width: 240, height: 240, quality: 'auto:eco', format: 'auto', crop: 'fill' },
  avatar: { width: 120, height: 120, quality: 'auto:good', format: 'auto', crop: 'fill' },
};

/**
 * Normalizes an image URL to ensure it is publicly reachable across
 * localhost, network IP, and CDNs.
 */
export const normalizeImageUrl = (url?: string | null): string => {
  if (!url || !url.trim()) return '';
  let trimmed = url.trim();

  // If local frontend public asset, preserve as-is
  if (
    trimmed.startsWith('/Hero.jpg') ||
    trimmed === 'Hero.jpg' ||
    trimmed.startsWith('/Logo.jpeg') ||
    trimmed === 'Logo.jpeg' ||
    trimmed.startsWith('/assets/') ||
    trimmed.startsWith('/favicon') ||
    trimmed.startsWith('/icons') ||
    trimmed.startsWith('data:')
  ) {
    return trimmed.startsWith('/') || trimmed.startsWith('data:') ? trimmed : `/${trimmed}`;
  }

  // Enforce HTTPS for Cloudinary URLs
  if (trimmed.startsWith('http://res.cloudinary.com')) {
    trimmed = trimmed.replace('http://res.cloudinary.com', 'https://res.cloudinary.com');
  }

  // If already absolute HTTP/HTTPS
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    // Cloudinary or other external CDN URLs: return directly without modifying
    if (trimmed.includes('res.cloudinary.com') || trimmed.includes('cloudinary.com')) {
      return trimmed;
    }

    if (
      typeof window !== 'undefined' &&
      window.location.hostname &&
      window.location.hostname !== 'localhost' &&
      window.location.hostname !== '127.0.0.1'
    ) {
      const targetProtocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
      return trimmed
        .replace(/^http:\/\/localhost:8088/, `${targetProtocol}//${window.location.hostname}:8088`)
        .replace(/^http:\/\/127.0.0.1:8088/, `${targetProtocol}//${window.location.hostname}:8088`)
        .replace('localhost', window.location.hostname)
        .replace('127.0.0.1', window.location.hostname);
    }
    return trimmed;
  }

  // If relative path from backend (e.g., /api/v1/public/media/...)
  const envApiUrl = import.meta.env.VITE_API_BASE_URL;
  if (envApiUrl && envApiUrl.startsWith('https://')) {
    const apiOrigin = new URL(envApiUrl).origin;
    return `${apiOrigin}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
  }

  const hostname =
    typeof window !== 'undefined' && window.location.hostname ? window.location.hostname : 'localhost';
  const backendBase = `http://${hostname}:8088`;
  return `${backendBase}${trimmed.startsWith('/') ? '' : '/'}${trimmed}`;
};

/**
 * Applies Cloudinary transformations (f_auto, q_auto, width, height, crop)
 * or falls back to normalized original URL.
 */
export const getOptimizedImageUrl = (
  rawUrl?: string | null,
  optionsOrPreset: ImagePreset | TransformOptions = 'menuCard'
): string => {
  const normalized = normalizeImageUrl(rawUrl);
  if (!normalized) return '';

  const opts: TransformOptions =
    typeof optionsOrPreset === 'string'
      ? PRESET_CONFIGS[optionsOrPreset] || PRESET_CONFIGS.menuCard
      : {
          ...(optionsOrPreset.preset ? PRESET_CONFIGS[optionsOrPreset.preset] : {}),
          ...optionsOrPreset,
        };

  // Only apply Cloudinary transformations if hosted on res.cloudinary.com
  if (normalized.includes('res.cloudinary.com') && normalized.includes('/upload/')) {
    const parts = normalized.split('/upload/');
    if (parts.length === 2) {
      const transformDirectives: string[] = [];

      // Format & Quality optimization
      const format = opts.format || 'auto';
      const quality = opts.quality || 'auto';
      transformDirectives.push(`f_${format}`);
      transformDirectives.push(`q_${quality}`);

      // Dimensions & cropping
      if (opts.width) {
        transformDirectives.push(`w_${opts.width}`);
      }
      if (opts.height) {
        transformDirectives.push(`h_${opts.height}`);
      }
      if (opts.crop) {
        transformDirectives.push(`c_${opts.crop}`);
      }

      // Check if after /upload/ there are already existing transforms or version tag
      const remainingPath = parts[1];
      const joinedTransform = transformDirectives.join(',');

      // If the remaining path already has some transformations (not starting with v1234 or direct folder)
      return `${parts[0]}/upload/${joinedTransform}/${remainingPath}`;
    }
  }

  return normalized;
};

/**
 * Builds responsive srcset string for Cloudinary images.
 */
export const getOptimizedSrcSet = (
  rawUrl?: string | null,
  widths: number[] = [360, 480, 720, 1080],
  crop: 'limit' | 'fill' = 'limit'
): string => {
  const normalized = normalizeImageUrl(rawUrl);
  if (!normalized || !normalized.includes('res.cloudinary.com')) {
    return '';
  }

  return widths
    .map((w) => `${getOptimizedImageUrl(rawUrl, { width: w, crop, format: 'auto', quality: 'auto' })} ${w}w`)
    .join(', ');
};
