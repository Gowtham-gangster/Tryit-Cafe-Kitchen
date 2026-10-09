import React, { useEffect, useState } from 'react';
import {
  UtensilsCrossed,
  Tag,
  Star,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { DashboardSummary, MenuItem } from '../../types';
import { ownerApi } from '../../api/ownerApi';
import { FoodTypeBadge } from '../../components/common/FoodTypeBadge';
import { OnlineOrderingControl } from '../../components/owner/OnlineOrderingControl';
import { Link } from 'react-router-dom';
import { getOptimizedImageUrl } from '../../utils/imageUrl';
import { useMenuStore } from '../../store/useMenuStore';
import { FoodImage } from '../../components/common/FoodImage';

export const OwnerDashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [dishes, setDishes] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingDishId, setUpdatingDishId] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [sumData, menuData] = await Promise.all([
        ownerApi.getSummary(),
        ownerApi.getMenuItems(),
      ]);
      setSummary(sumData);
      setDishes(menuData);
    } catch (e) {
      console.error('Failed to load dashboard data', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleAvailability = async (id: string) => {
    setUpdatingDishId(id);
    try {
      const updated = await ownerApi.toggleAvailability(id);
      setDishes((prev) => prev.map((d) => (d.id === id ? updated : d)));
      await loadData();
      useMenuStore.getState().fetchAllPublicData(true);
    } catch (e) {
      alert('Failed to update dish availability');
    } finally {
      setUpdatingDishId(null);
    }
  };

  const totalItems = summary?.totalMenuItems || dishes.length;
  const availableItems = summary?.availableMenuItems || dishes.filter((d) => d.available).length;
  const unavailableItems = totalItems - availableItems;
  const pendingReviews = summary?.pendingReviews || 0;
  const activeOffers = summary?.activeOffers || 0;

  const statCards = [
    {
      title: 'Total Menu Dishes',
      value: totalItems,
      subtitle: `${availableItems} live for ordering`,
      icon: UtensilsCrossed,
      color: 'bg-[#FE8E2A] text-white',
    },
    {
      title: 'Available Items',
      value: availableItems,
      subtitle: 'In stock & ordering enabled',
      icon: CheckCircle,
      color: 'bg-emerald-600 text-white',
    },
    {
      title: 'Unavailable Items',
      value: unavailableItems,
      subtitle: 'Temporarily sold out',
      icon: AlertCircle,
      color: 'bg-red-600 text-white',
    },
    {
      title: 'Pending Reviews',
      value: pendingReviews,
      subtitle: 'Awaiting owner approval',
      icon: Star,
      color: 'bg-[#2B1408] text-white',
    },
    {
      title: 'Active Offers',
      value: activeOffers,
      subtitle: 'Active promotional deals',
      icon: Tag,
      color: 'bg-[#E67616] text-white',
    },
  ];

  return (
    <div className="space-y-5 sm:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-[#2B1408] font-display">
          Cafe Management Overview
        </h1>
        <p className="text-xs sm:text-sm text-[#7A5C4A] mt-1">
          Real-time metrics on menu dishes, stock availability, review queue, and promotional deals.
        </p>
      </div>

      {/* Prominent Global Online Ordering Control */}
      <OnlineOrderingControl />

      {/* KPI Stats Grid: 2 columns on mobile, 2-3 on tablet, 5 on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-[#FFFBF7] border border-[#EEDDCC] shadow-xs flex flex-col justify-between min-h-[145px] sm:min-h-[160px] lg:min-h-0 hover:border-[#FE8E2A]/40 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                <p className="text-[11px] sm:text-xs font-bold text-[#7A5C4A] uppercase tracking-wider leading-snug line-clamp-2">
                  {stat.title}
                </p>
                <div
                  className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl ${stat.color} flex items-center justify-center shrink-0 shadow-2xs`}
                >
                  <Icon className="w-4 h-4 sm:w-[18px] sm:h-[18px]" />
                </div>
              </div>

              <div className="mt-auto">
                <h3 className="text-2xl sm:text-3xl font-black text-[#2B1408] font-display tracking-tight leading-none">
                  {stat.value}
                </h3>
                <p className="text-[11px] sm:text-xs text-[#7A5C4A] mt-1 sm:mt-1.5 font-medium leading-snug line-clamp-2">
                  {stat.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Dish Availability Switcher */}
      <div className="bg-[#FFFBF7] rounded-3xl border border-[#EEDDCC] p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 sm:pb-4 border-b border-[#EEDDCC]">
          <div>
            <h3 className="font-display font-bold text-base sm:text-lg text-[#2B1408]">
              Quick Menu Availability Control
            </h3>
            <p className="text-xs text-[#7A5C4A]">
              Toggle dish availability in real time if an ingredient runs out in the kitchen.
            </p>
          </div>
          <Link
            to="/owner/menu"
            className="text-xs font-bold text-[#FE8E2A] hover:text-[#E67616] self-start sm:self-auto inline-flex items-center gap-1"
          >
            Manage All Dishes & Pricing →
          </Link>
        </div>

        {isLoading ? (
          <div className="py-12 text-center text-xs text-[#7A5C4A]">Loading menu status...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {dishes.slice(0, 9).map((dish) => (
              <div
                key={dish.id}
                className="p-3 sm:p-3.5 rounded-2xl bg-[#FDF6EE] border border-[#EEDDCC] hover:border-[#FE8E2A]/40 transition-all flex items-center justify-between gap-2.5 sm:gap-3 group"
              >
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                  {/* Dish Thumbnail */}
                  <div className="w-12 h-12 min-[380px]:w-14 min-[380px]:h-14 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-[#F5E6D3] shrink-0 border border-[#EEDDCC]/80 shadow-2xs relative">
                    <FoodImage
                      src={getOptimizedImageUrl(dish.imageUrl, 'ownerThumbnail')}
                      alt={dish.name}
                      foodType={dish.foodType}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Dish Info */}
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5">
                      <FoodTypeBadge type={dish.foodType} size="sm" />
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-[#2B1408] line-clamp-2 leading-tight">
                      {dish.name}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-xs sm:text-sm font-extrabold text-[#2B1408]">
                        ₹{dish.effectivePrice ?? dish.price}
                      </span>
                      {dish.discountEnabled && dish.effectivePrice && dish.effectivePrice < dish.price && (
                        <span className="text-[10px] text-[#A0826D] line-through">₹{dish.price}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status / Availability Toggle */}
                <button
                  type="button"
                  onClick={() => handleToggleAvailability(dish.id)}
                  disabled={updatingDishId === dish.id}
                  className={`px-3 py-1.5 rounded-full text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer shrink-0 min-h-[38px] flex items-center justify-center shadow-2xs ${
                    dish.available
                      ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300/70'
                      : 'bg-red-100 text-red-800 hover:bg-red-200 border border-red-300/70'
                  }`}
                  aria-label={`Toggle availability for ${dish.name}, currently ${
                    dish.available ? 'Available' : 'Sold Out'
                  }`}
                >
                  {updatingDishId === dish.id ? (
                    <span className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    dish.available ? 'Available' : 'Sold Out'
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
