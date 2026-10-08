import React from 'react';

export const RouteLoadingFallback: React.FC = () => {
  return (
    <div
      className="min-h-[60vh] w-full flex flex-col items-center justify-center p-6 bg-[#FDF6EE]/60 animate-pulse"
      role="status"
      aria-label="Loading page content"
    >
      <div className="w-12 h-12 rounded-full border-3 border-[#FE8E2A]/20 border-t-[#FE8E2A] animate-spin mb-4" />
      <div className="h-4 w-36 bg-[#EEDDCC] rounded-full mb-2" />
      <div className="h-3 w-24 bg-[#EEDDCC]/70 rounded-full" />
    </div>
  );
};

export default RouteLoadingFallback;
