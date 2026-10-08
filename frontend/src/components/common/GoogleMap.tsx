import React from 'react';

/**
 * Official Google Maps embed URL supplied for TryIt Cafe & Kitchen (Gandi Maisamma, Hyderabad).
 * Does not require or use an API key.
 */
export const GOOGLE_MAP_EMBED_URL =
  'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3615.355248458839!2d78.42005183478837!3d17.57651209843505!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb8fea4ccf6b03%3A0xa4f2b954bdf0d4df!2sTryit%20cafe%26%20kichen!5e1!3m2!1sen!2sin!4v1787115650386!5m2!1sen!2sin';

interface GoogleMapProps {
  /** Optional override for embed URL if customized in backend */
  src?: string;
  height?: number | string;
  title?: string;
  className?: string;
}

export const GoogleMap: React.FC<GoogleMapProps> = ({
  src,
  height = '100%',
  title = 'TryIt Cafe & Kitchen location on Google Maps',
  className = '',
}) => {
  // Ensure we fallback to the official embed URL if src is undefined, null, or empty string
  const rawEmbedUrl = src && src.trim().length > 0 ? src.trim() : GOOGLE_MAP_EMBED_URL;
  // Ensure satellite/hybrid view (!5e1) is the default view as requested
  const embedUrl = rawEmbedUrl.replace('!5e0!', '!5e1!');

  return (
    <div
      className={`w-full h-full overflow-hidden rounded-3xl border border-[#EEDDCC] bg-[#FFFBF7] shadow-sm ${className}`}
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
};
