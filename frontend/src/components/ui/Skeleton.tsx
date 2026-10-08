import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-stone-200/70 rounded-2xl ${className}`} />
);

export const MenuCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-3xl p-3 sm:p-4 border border-stone-200/70 shadow-sm flex flex-col justify-between space-y-3">
    <div>
      <div className="relative aspect-[4/3] w-full rounded-2xl bg-stone-200/70 animate-pulse mb-3" />
      <div className="h-4 bg-stone-200/70 rounded-md w-3/4 animate-pulse mb-2" />
      <div className="h-3 bg-stone-200/50 rounded-md w-full animate-pulse mb-1" />
      <div className="h-3 bg-stone-200/50 rounded-md w-1/2 animate-pulse" />
    </div>
    <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
      <div className="h-5 bg-stone-200/70 rounded-md w-14 animate-pulse" />
      <div className="h-8 bg-amber-200/60 rounded-xl w-16 animate-pulse" />
    </div>
  </div>
);

export const OfferSkeleton: React.FC = () => (
  <div className="min-w-[280px] sm:min-w-[340px] rounded-3xl bg-stone-200/70 p-6 animate-pulse h-48 flex flex-col justify-between" />
);

export const GallerySkeleton: React.FC = () => (
  <div className="aspect-square rounded-3xl bg-stone-200/70 animate-pulse" />
);

export const ReviewSkeleton: React.FC = () => (
  <div className="p-6 rounded-3xl bg-white border border-stone-200/70 shadow-sm space-y-3 animate-pulse">
    <div className="flex items-center gap-2">
      <div className="w-10 h-10 rounded-full bg-stone-200" />
      <div className="space-y-1 flex-1">
        <div className="h-3.5 bg-stone-200 rounded w-1/3" />
        <div className="h-2.5 bg-stone-100 rounded w-1/4" />
      </div>
    </div>
    <div className="h-3 bg-stone-200 rounded w-full" />
    <div className="h-3 bg-stone-200 rounded w-4/5" />
  </div>
);
