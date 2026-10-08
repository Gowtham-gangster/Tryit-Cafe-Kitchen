import React, { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export interface RevealCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Index in a grid or list to calculate capped sequential stagger delay */
  index?: number;
  /** Explicit delay in seconds (overrides index) */
  delay?: number;
  /** Duration of entrance in seconds (default: 0.55s) */
  duration?: number;
  /** Vertical travel offset in pixels (default: 35) */
  yOffset?: number;
  /** Starting scale (default: 0.96) */
  scaleInitial?: number;
  /** Enable subtle desktop-only hover lift (default: true) */
  enableHover?: boolean;
  /** Enable subtle desktop 3D perspective rotation during entrance (default: true) */
  enable3D?: boolean;
  /** Additional CSS class names */
  className?: string;
  /** Custom onClick handler */
  onClick?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

/**
 * RevealCard — Application-wide premium card entrance & interaction wrapper.
 *
 * Entrance Sequence:
 * - Outside Viewport: opacity: 0, translateY: 35px, scale: 0.96 (desktop: rotateX: 2deg)
 * - Inside Viewport: opacity: 1, translateY: 0, scale: 1, rotateX: 0deg
 * - Timing: 500-650ms smooth cubic bezier curve
 * - Viewport: once: true (no annoying re-triggering on scroll)
 * - Stagger: Capped at ~380ms maximum so large menus stay instantly responsive
 * - Desktop Hover: translateY: -6px, scale: 1.015, soft shadow depth
 * - Mobile: Simplified 2D entrance, zero hover interference
 * - Reduced Motion: Gracefully falls back to simple opacity fade
 */
export const RevealCard: React.FC<RevealCardProps> = ({
  children,
  index,
  delay,
  duration = 0.55,
  yOffset = 35,
  scaleInitial = 0.96,
  enableHover = true,
  enable3D = true,
  className = '',
  onClick,
  style,
  ...rest
}) => {
  const shouldReduceMotion = useReducedMotion();

  // Determine if running on desktop viewport (>= 1024px)
  const isDesktop = useMemo(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth >= 1024;
  }, []);

  // Calculate capped stagger delay:
  // e.g. card 0: 0s, card 1: 0.07s, card 2: 0.14s, card 3: 0.21s...
  // Capped at 0.38s maximum to prevent large menu queues
  const calculatedDelay = useMemo(() => {
    if (typeof delay === 'number') return delay;
    if (typeof index === 'number') {
      return Math.min(index * 0.07, 0.38);
    }
    return 0;
  }, [delay, index]);

  // Reduced motion fallback
  if (shouldReduceMotion) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3, delay: calculatedDelay }}
        className={className}
        onClick={onClick}
        style={style}
        {...(rest as any)}
      >
        {children}
      </motion.div>
    );
  }

  const initialVariants = {
    opacity: 0,
    y: yOffset,
    scale: scaleInitial,
    rotateX: enable3D && isDesktop ? 2 : 0,
  };

  const inViewVariants = {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
  };

  return (
    <div style={{ perspective: enable3D && isDesktop ? 1200 : undefined }} className="h-full">
      <motion.div
        initial={initialVariants}
        whileInView={inViewVariants}
        viewport={{ once: true, margin: '-30px' }}
        transition={{
          duration,
          delay: calculatedDelay,
          ease: [0.22, 1, 0.36, 1], // Premium responsive cubic-bezier
        }}
        whileHover={
          enableHover && isDesktop
            ? {
                y: -6,
                scale: 1.015,
                transition: { duration: 0.22, ease: 'easeOut' },
              }
            : undefined
        }
        whileTap={
          enableHover
            ? {
                scale: 0.98,
                transition: { duration: 0.12 },
              }
            : undefined
        }
        onClick={onClick}
        className={className}
        style={style}
        {...(rest as any)}
      >
        {children}
      </motion.div>
    </div>
  );
};
