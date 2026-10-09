import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink, Navigation } from 'lucide-react';
import { loadGoogleMapsApi } from '../../services/googleMapsLoader';

/**
 * Official Google Maps embed URL supplied for TryIt Cafe & Kitchen (Gandi Maisamma, Hyderabad).
 * Used as high-reliability fallback if JavaScript API fails or is offline.
 */
export const GOOGLE_MAP_EMBED_URL =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3615.355248458839!2d78.42005183478837!3d17.57651209843505!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb8fea4ccf6b03%3A0xa4f2b954bdf0d4df!2sTryit%20cafe%26%20kichen!5e1!3m2!1sen!2sin!4v1787115650386!5m2!1sen!2sin';

export const DEFAULT_MAP_LATITUDE = 17.576512;
export const DEFAULT_MAP_LONGITUDE = 78.420052;

interface GoogleMapProps {
  /** Optional override for embed URL if customized in backend */
  src?: string;
  height?: number | string;
  title?: string;
  className?: string;
  latitude?: number;
  longitude?: number;
  googleMapsLink?: string;
}

export const GoogleMap: React.FC<GoogleMapProps> = ({
  src,
  height = '100%',
  title = 'TryIt Cafe & Kitchen location on Google Maps',
  className = '',
  latitude,
  longitude,
  googleMapsLink = 'https://maps.app.goo.gl/swbv6jctCUrmXMsq7',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [useFallbackIframe, setUseFallbackIframe] = useState<boolean>(false);
  const [isJsMapReady, setIsJsMapReady] = useState<boolean>(false);

  const finalLat = typeof latitude === 'number' && !isNaN(latitude) ? latitude : DEFAULT_MAP_LATITUDE;
  const finalLng = typeof longitude === 'number' && !isNaN(longitude) ? longitude : DEFAULT_MAP_LONGITUDE;

  useEffect(() => {
    let isCancelled = false;

    const initMap = async () => {
      if (!mapContainerRef.current) return;

      try {
        const maps = await loadGoogleMapsApi();
        if (isCancelled || !mapContainerRef.current) return;

        // Initialize Google Maps instance with gestureHandling: 'greedy' for single-finger mobile moving
        const map = new maps.Map(mapContainerRef.current, {
          center: { lat: finalLat, lng: finalLng },
          zoom: 17,
          mapTypeId: 'hybrid', // Matches hybrid/satellite view with road names
          gestureHandling: 'greedy', // Enables 1-finger drag/move on mobile screens without requiring two fingers!
          zoomControl: true,
          zoomControlOptions: {
            position: maps.ControlPosition.RIGHT_BOTTOM,
          },
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          rotateControl: false,
          scaleControl: true,
        });

        mapInstanceRef.current = map;

        // Add pin for TryIt Cafe & Kitchen
        const marker = new maps.Marker({
          position: { lat: finalLat, lng: finalLng },
          map,
          title: 'TryIt Cafe & Kitchen',
          animation: maps.Animation.DROP,
        });

        // Add info bubble on pin click
        const infoWindow = new maps.InfoWindow({
          content: `
            <div style="font-family: inherit; font-size: 12px; padding: 4px 6px; color: #2B1408; max-width: 220px;">
              <strong style="font-size: 13px; color: #FE8E2A; display: block; margin-bottom: 2px;">☕ TryIt Cafe & Kitchen</strong>
              <span style="font-size: 11px; color: #7A5C4A; display: block; line-height: 1.3;">Gandi Maisamma, Hyderabad</span>
              <a href="${googleMapsLink}" target="_blank" rel="noopener noreferrer" style="display: inline-block; margin-top: 6px; font-size: 11px; font-weight: bold; color: #FE8E2A; text-decoration: underline;">
                Open in Google Maps ↗
              </a>
            </div>
          `,
        });

        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });

        if (!isCancelled) {
          setIsJsMapReady(true);
        }
      } catch {
        if (!isCancelled) {
          // Gracefully fallback to official Google Maps iframe embed
          setUseFallbackIframe(true);
        }
      }
    };

    initMap();

    return () => {
      isCancelled = true;
    };
  }, [finalLat, finalLng, googleMapsLink]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo({ lat: finalLat, lng: finalLng });
      mapInstanceRef.current.setZoom(17);
    }
  };

  // If JS API failed to load, render standard fallback iframe
  if (useFallbackIframe) {
    const rawEmbedUrl = src && src.trim().length > 0 ? src.trim() : GOOGLE_MAP_EMBED_URL;
    const embedUrl = rawEmbedUrl.replace('!5e0!', '!5e1!');

    return (
      <div
        className={`w-full h-full overflow-hidden rounded-3xl border border-[#EEDDCC] bg-[#FFFBF7] shadow-sm relative ${className}`}
      >
        <iframe
          src={embedUrl}
          width="100%"
          height={height}
          style={{
            border: 0,
            display: 'block',
            width: '100%',
            height: '100%',
            minHeight: '240px',
          }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          title={title}
        />
      </div>
    );
  }

  return (
    <div
      className={`w-full h-full overflow-hidden rounded-3xl border border-[#EEDDCC] bg-[#1e232a] shadow-sm relative ${className}`}
    >
      {/* Interactive Google Map container */}
      <div
        ref={mapContainerRef}
        style={{ width: '100%', height: '100%', minHeight: '240px' }}
        className="w-full h-full"
        title={title}
      />

      {/* "Open in Maps" Quick Badge (matches native embed style) */}
      <a
        href={googleMapsLink}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute top-3 left-3 z-10 px-2.5 py-1.5 rounded-xl bg-white/95 hover:bg-white active:scale-95 text-[#2B1408] hover:text-[#FE8E2A] text-xs font-bold shadow-md border border-[#EEDDCC] flex items-center gap-1.5 transition-all select-none backdrop-blur-xs"
        aria-label="Open TryIt Cafe location in Google Maps"
      >
        <span>Open in Maps</span>
        <ExternalLink size={12} className="text-[#FE8E2A]" />
      </a>

      {/* Recenter Button when moved around */}
      {isJsMapReady && (
        <button
          type="button"
          onClick={handleRecenter}
          className="absolute bottom-4 left-3 z-10 px-2.5 py-1.5 rounded-xl bg-white/95 hover:bg-white active:scale-95 text-[#2B1408] hover:text-[#FE8E2A] text-xs font-bold shadow-md border border-[#EEDDCC] flex items-center gap-1.5 transition-all cursor-pointer backdrop-blur-xs select-none"
          title="Recenter map to TryIt Cafe"
          aria-label="Recenter map to TryIt Cafe"
        >
          <Navigation size={12} className="text-[#FE8E2A]" />
          <span>Recenter</span>
        </button>
      )}
    </div>
  );
};
