package com.tryitcafe.service;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class DistanceService {

    private static final double EARTH_RADIUS_KM = 6371.0;

    /**
     * Calculates the great-circle distance between two points on Earth using the Haversine formula.
     *
     * @param lat1 Latitude of point 1
     * @param lon1 Longitude of point 1
     * @param lat2 Latitude of point 2
     * @param lon2 Longitude of point 2
     * @return Distance in kilometers
     */
    public double calculateHaversineDistanceKm(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double radLat1 = Math.toRadians(lat1);
        double radLat2 = Math.toRadians(lat2);

        double a = Math.sin(dLat / 2.0) * Math.sin(dLat / 2.0)
                + Math.sin(dLon / 2.0) * Math.sin(dLon / 2.0) * Math.cos(radLat1) * Math.cos(radLat2);

        double c = 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a));

        return EARTH_RADIUS_KM * c;
    }

    /**
     * Calculates delivery charge strictly according to business rule:
     * - If distance <= freeDistanceKm (e.g. 3.0 km): delivery charge = 0
     * - If distance > freeDistanceKm: delivery charge = total distance * ratePerKm (e.g. 5.0)
     * Rate applies to the ENTIRE distance once exceeding the free radius threshold.
     *
     * @param distanceKm Full calculated distance in km
     * @param freeDistanceKm Free delivery radius limit in km (e.g. 3.0)
     * @param ratePerKm Delivery rate per km (e.g. ₹5.00)
     * @return Calculated delivery charge in INR, rounded to 2 decimal places
     */
    public BigDecimal calculateDeliveryCharge(double distanceKm, double freeDistanceKm, BigDecimal ratePerKm) {
        if (distanceKm <= freeDistanceKm) {
            return BigDecimal.ZERO.setScale(2, RoundingMode.HALF_UP);
        }

        BigDecimal dist = BigDecimal.valueOf(distanceKm);
        BigDecimal rate = ratePerKm != null ? ratePerKm : new BigDecimal("5.00");
        return dist.multiply(rate).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Rounds distance in km to 2 decimal places for clean, standardized display.
     */
    public double roundDistance(double distanceKm) {
        return BigDecimal.valueOf(distanceKm).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }
}
