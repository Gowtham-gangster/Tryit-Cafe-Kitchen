import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Home, Briefcase, Package, ChevronRight, Plus, Check } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useToastStore } from '../../store/useToastStore';
import { CustomerLocation } from '../../types';

interface DeliveryLocationSectionProps {
  onOpenProfileLocations?: () => void;
}

export const DeliveryLocationSection: React.FC<DeliveryLocationSectionProps> = ({
  onOpenProfileLocations,
}) => {
  const {
    user,
    isAuthenticated,
    locations,
    defaultLocation,
    selectedLocationId,
    setSelectedLocationId,
    openAuthModal,
  } = useAuthStore();
  const { success } = useToastStore();

  const [isPickerOpen, setIsPickerOpen] = useState(false);

  if (!isAuthenticated || !user || user.role !== 'ROLE_CUSTOMER') {
    return null;
  }

  // Active selected location or fallback to default
  const activeLocation: CustomerLocation | null =
    locations.find((l) => l.id === selectedLocationId) ||
    defaultLocation ||
    (locations.length > 0 ? locations[0] : null);

  const getLocationIcon = (label: string) => {
    switch (label?.toLowerCase()) {
      case 'work':
        return <Briefcase size={16} className="text-[#2B1408] shrink-0" />;
      case 'other':
        return <Package size={16} className="text-[#7A5C4A] shrink-0" />;
      case 'home':
      default:
        return <Home size={16} className="text-[#FE8E2A] shrink-0" />;
    }
  };

  const handleSelectLocation = (locId: string) => {
    setSelectedLocationId(locId);
    setIsPickerOpen(false);
    success('Delivery location updated!');
  };

  return (
    <div className="bg-[#FDF6EE] py-3.5 sm:py-4 border-b border-[#EEDDCC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#FFFBF7] rounded-2xl sm:rounded-3xl border border-[#EEDDCC] p-3.5 sm:p-4 shadow-sm hover:border-[#FE8E2A]/50 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Left: Location Information */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#FBEFE1] text-[#FE8E2A] border border-[#FE8E2A]/20 flex items-center justify-center shrink-0">
                <MapPin size={20} className="stroke-[2.2]" />
              </div>

              <div className="min-w-0 flex-1">
                {activeLocation ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-[#FE8E2A] bg-[#FBEFE1] px-2 py-0.5 rounded-md border border-[#EEDDCC]">
                        Delivering To
                      </span>
                      <div className="flex items-center gap-1 font-bold text-xs text-[#2B1408]">
                        {getLocationIcon(activeLocation.label)}
                        <span>{activeLocation.label}</span>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-[#7A5C4A] truncate mt-0.5 font-medium">
                      {activeLocation.address}
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#FE8E2A]">
                        Add Delivery Location
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-[#7A5C4A] truncate mt-0.5 font-medium">
                      Save your address for faster checkout & distance fee calculation.
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              {locations.length > 0 ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsPickerOpen((prev) => !prev)}
                    className="px-3.5 py-2 rounded-xl bg-[#FDF6EE] hover:bg-[#F2E5D6] text-[#2B1408] border border-[#EEDDCC] text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Change</span>
                    <ChevronRight
                      size={14}
                      className={`transition-transform duration-200 ${
                        isPickerOpen ? 'rotate-90' : ''
                      }`}
                    />
                  </button>

                  {/* Quick Dropdown Picker */}
                  {isPickerOpen && (
                    <div className="absolute right-0 top-full mt-2 w-72 sm:w-80 bg-[#FFFBF7] rounded-2xl border border-[#EEDDCC] shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="px-3 py-2 border-b border-[#EEDDCC] text-xs font-bold text-[#2B1408] flex items-center justify-between">
                        <span>Select Delivery Address</span>
                        {onOpenProfileLocations && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsPickerOpen(false);
                              onOpenProfileLocations();
                            }}
                            className="text-[11px] text-[#FE8E2A] hover:text-[#E67616] font-bold"
                          >
                            Manage
                          </button>
                        )}
                      </div>

                      <div className="space-y-1 my-1 max-h-56 overflow-y-auto">
                        {locations.map((loc) => {
                          const isSelected =
                            activeLocation && activeLocation.id === loc.id;
                          return (
                            <button
                              key={loc.id}
                              type="button"
                              onClick={() => handleSelectLocation(loc.id)}
                              className={`w-full p-2 rounded-xl text-left flex items-start justify-between gap-2 transition cursor-pointer ${
                                isSelected
                                  ? 'bg-[#FBEFE1] text-[#2B1408] font-semibold border border-[#EEDDCC]'
                                  : 'hover:bg-[#FDF6EE] text-[#7A5C4A]'
                              }`}
                            >
                              <div className="flex items-start gap-2 min-w-0">
                                <div className="mt-0.5">{getLocationIcon(loc.label)}</div>
                                <div className="truncate">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-[#2B1408]">{loc.label}</span>
                                    {loc.isDefault && (
                                      <span className="text-[9px] bg-[#FBEFE1] text-[#FE8E2A] font-extrabold px-1 rounded border border-[#EEDDCC]">
                                        Default
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[11px] text-[#7A5C4A] truncate leading-tight mt-0.5">
                                    {loc.address}
                                  </p>
                                </div>
                              </div>
                              {isSelected && (
                                <Check size={14} className="text-[#FE8E2A] shrink-0 mt-1" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {onOpenProfileLocations && (
                        <div className="pt-1 border-t border-[#EEDDCC]">
                          <button
                            type="button"
                            onClick={() => {
                              setIsPickerOpen(false);
                              onOpenProfileLocations();
                            }}
                            className="w-full py-1.5 px-3 rounded-lg text-[#FE8E2A] hover:bg-[#FBEFE1] text-xs font-bold flex items-center justify-center gap-1"
                          >
                            <Plus size={13} />
                            <span>Add New Address</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={onOpenProfileLocations}
                  className="px-3.5 py-2 rounded-xl bg-[#FE8E2A] hover:bg-[#E67616] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus size={14} />
                  <span>Add Location</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
