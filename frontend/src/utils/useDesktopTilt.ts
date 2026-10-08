import { useRef, useCallback, useEffect, useState } from 'react';

interface TiltOptions {
  maxTilt?: number;      // Maximum degrees tilt (typically 1.5 - 2deg)
  perspective?: number;  // Perspective distance (e.g. 1000 - 1200px)
  scale?: number;        // Scale on hover (e.g. 1.015 - 1.02)
  disabled?: boolean;
}

export function useDesktopTilt<T extends HTMLElement = HTMLDivElement>({
  maxTilt = 2,
  perspective = 1000,
  scale = 1.015,
  disabled = false,
}: TiltOptions = {}) {
  const ref = useRef<T | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(typeof window !== 'undefined' && window.innerWidth >= 1024);
    };

    if (typeof window !== 'undefined') {
      const mediaReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaReduced.matches);

      const onMediaChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaReduced.addEventListener('change', onMediaChange);

      checkDesktop();
      window.addEventListener('resize', checkDesktop, { passive: true });

      return () => {
        window.removeEventListener('resize', checkDesktop);
        mediaReduced.removeEventListener('change', onMediaChange);
      };
    }
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent<T>) => {
    if (!isDesktop || prefersReducedMotion || disabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    ref.current.style.transform = `perspective(${perspective}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, 1)`;
  }, [isDesktop, prefersReducedMotion, disabled, maxTilt, perspective, scale]);

  const onMouseLeave = useCallback(() => {
    if (!ref.current || !isDesktop || prefersReducedMotion) return;
    ref.current.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  }, [isDesktop, prefersReducedMotion, perspective]);

  return { ref, onMouseMove, onMouseLeave, isDesktop, prefersReducedMotion };
}
