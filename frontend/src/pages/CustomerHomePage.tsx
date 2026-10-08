import React from 'react';
import { HeroSection } from '../components/customer/HeroSection';
import { OffersCarousel } from '../components/customer/OffersCarousel';
import { FeaturedDishesSection } from '../components/customer/FeaturedDishesSection';
import { MenuSection } from '../components/customer/MenuSection';
import { GallerySection } from '../components/customer/GallerySection';
import { ReviewsSection } from '../components/customer/ReviewsSection';
import { AboutCafeSection } from '../components/customer/AboutCafeSection';
import { LocationAndHoursSection } from '../components/customer/LocationAndHoursSection';

export const CustomerHomePage: React.FC = () => {
  return (
    <>
      {/* 1. Hero */}
      <HeroSection />

      {/* 2. Today's Offers */}
      <OffersCarousel />

      {/* 3. Popular at Tryit */}
      <FeaturedDishesSection />

      {/* 4. Digital Menu */}
      <MenuSection />

      {/* 5. Gallery / Vibes at Tryit Cafe */}
      <GallerySection />

      {/* 6. Customer Reviews */}
      <ReviewsSection />

      {/* 7. About Tryit Cafe */}
      <AboutCafeSection />

      {/* 8. Location & Cafe Hours */}
      <LocationAndHoursSection />
    </>
  );
};

