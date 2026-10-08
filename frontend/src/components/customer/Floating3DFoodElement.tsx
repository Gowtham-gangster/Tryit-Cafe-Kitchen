import React, { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Sparkles, Coffee, Utensils } from 'lucide-react';

export const Floating3DFoodElement: React.FC = () => {
  const [isHovered, setIsHovered] = useState(false);

  // Mouse tilt tracking
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseX = useSpring(x, { stiffness: 180, damping: 20 });
  const mouseY = useSpring(y, { stiffness: 180, damping: 20 });

  const rotateX = useTransform(mouseY, [-0.5, 0.5], [12, -12]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-12, 12]);
  const translateZ = useTransform(mouseX, [-0.5, 0.5], [-8, 8]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseXPos = (e.clientX - rect.left) / width - 0.5;
    const mouseYPos = (e.clientY - rect.top) / height - 0.5;
    x.set(mouseXPos);
    y.set(mouseYPos);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-[320px] sm:max-w-[360px] mx-auto select-none [perspective:1000px] cursor-pointer"
      aria-hidden="true"
    >
      {/* 3D Container with gentle continuous float */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          z: translateZ,
          transformStyle: 'preserve-3d',
        }}
        animate={{
          y: [-6, 6, -6],
          rotateZ: [-1, 1, -1],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="relative rounded-3xl bg-gradient-to-br from-amber-500/20 via-stone-900/60 to-black/80 backdrop-blur-xl border border-amber-500/30 p-6 shadow-2xl overflow-hidden group"
      >
        {/* Dynamic Glow Spotlight */}
        <div
          className="absolute -inset-2 bg-radial from-amber-500/20 via-transparent to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none"
        />

        {/* Floating Steam Particles */}
        <div className="absolute top-4 right-1/2 translate-x-1/2 flex gap-1.5 opacity-80 pointer-events-none">
          <motion.span
            animate={{ y: [0, -18, -28], opacity: [0, 0.8, 0], scale: [0.8, 1.2, 1.6] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeOut', delay: 0.1 }}
            className="w-1.5 h-4 rounded-full bg-gradient-to-t from-amber-300 to-transparent blur-[1px]"
          />
          <motion.span
            animate={{ y: [0, -22, -34], opacity: [0, 0.9, 0], scale: [0.8, 1.3, 1.8] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeOut', delay: 0.7 }}
            className="w-2 h-5 rounded-full bg-gradient-to-t from-amber-200 to-transparent blur-[1px]"
          />
          <motion.span
            animate={{ y: [0, -16, -26], opacity: [0, 0.7, 0], scale: [0.8, 1.1, 1.5] }}
            transition={{ duration: 2.0, repeat: Infinity, ease: 'easeOut', delay: 1.3 }}
            className="w-1.5 h-3.5 rounded-full bg-gradient-to-t from-amber-300 to-transparent blur-[1px]"
          />
        </div>

        {/* 3D Cafe Plate & Cup Graphic */}
        <div className="relative z-10 flex flex-col items-center text-center space-y-4 py-2">
          {/* Glowing Emblem */}
          <div className="relative">
            <motion.div
              animate={{
                rotate: isHovered ? [0, 8, -8, 0] : 0,
                scale: isHovered ? 1.08 : 1,
              }}
              transition={{ duration: 0.5 }}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 p-0.5 shadow-glow-primary flex items-center justify-center"
            >
              <div className="w-full h-full rounded-[22px] bg-stone-950 flex items-center justify-center text-amber-400">
                <Coffee size={38} className="stroke-[2] drop-shadow-[0_2px_10px_rgba(245,158,11,0.5)]" />
              </div>
            </motion.div>

            <span className="absolute -top-2 -right-2 p-1.5 rounded-xl bg-amber-500 text-stone-950 shadow-md">
              <Sparkles size={14} className="fill-stone-950" />
            </span>
          </div>

          {/* Interactive Badge Info */}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-[10px] font-extrabold uppercase tracking-widest">
              <Utensils size={10} />
              <span>Artisan Food & Brews</span>
            </div>
            <h4 className="text-white font-serif font-extrabold text-base tracking-tight">
              Freshly Prepared To Order
            </h4>
            <p className="text-stone-400 text-xs leading-relaxed max-w-[240px]">
              Gourmet recipes, sizzling starters & handcrafted Italian indulgence.
            </p>
          </div>

          {/* Bottom Floating Pill */}
          <div className="pt-2 flex items-center gap-2 text-[11px] text-amber-300/90 font-bold bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-2xl">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Kitchen Live · Gandi Maisamma</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
