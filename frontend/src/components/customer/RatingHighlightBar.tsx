import React from 'react';
import { Star, ShieldCheck, Flame, IndianRupee } from 'lucide-react';
import { useSettingsStore } from '../../store/useSettingsStore';

export const RatingHighlightBar: React.FC = () => {
  const { settings } = useSettingsStore();

  const rating = settings?.displayRating ? Number(settings.displayRating).toFixed(1) : '4.9';
  const reviewCount = settings?.displayReviewCount || 50;
  const priceRange = settings?.priceRangeText || '₹1–200 per person';

  return (
    <section className="bg-[#2B1408] border-y border-[#FE8E2A]/20 py-4 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
        {/* Rating Metric */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#FE8E2A]/20 text-[#FE8E2A] shrink-0">
            <Star className="w-5 h-5 fill-[#FE8E2A]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-white font-bold text-base">{rating}</span>
              <span className="text-[#FE8E2A] text-xs">★★★★★</span>
            </div>
            <p className="text-[#D8C7BC] text-[11px]">{reviewCount}+ Google Reviews</p>
          </div>
        </div>

        {/* Price Range */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#FE8E2A]/20 text-[#FE8E2A] shrink-0">
            <IndianRupee className="w-5 h-5 text-[#FE8E2A]" />
          </div>
          <div>
            <p className="text-white font-bold text-xs sm:text-sm">{priceRange}</p>
            <p className="text-[#D8C7BC] text-[11px]">Budget friendly cafe</p>
          </div>
        </div>

        {/* Freshly Prepared */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#FE8E2A]/20 text-[#FE8E2A] shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <p className="text-white font-bold text-xs sm:text-sm">100% Made to Order</p>
            <p className="text-[#D8C7BC] text-[11px]">Piping hot & fresh</p>
          </div>
        </div>

        {/* Safe & Hygienic */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/10">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#FE8E2A]/20 text-[#FE8E2A] shrink-0">
            <ShieldCheck className="w-5 h-5 text-[#FE8E2A]" />
          </div>
          <div>
            <p className="text-white font-bold text-xs sm:text-sm">Clean Open Kitchen</p>
            <p className="text-[#D8C7BC] text-[11px]">Highest hygiene rating</p>
          </div>
        </div>
      </div>
    </section>
  );
};
