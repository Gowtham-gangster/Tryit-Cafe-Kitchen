package com.tryitcafe.service;

import com.tryitcafe.exception.BadRequestException;
import com.tryitcafe.exception.ResourceNotFoundException;
import com.tryitcafe.model.dto.CustomerLocationDtos.*;
import com.tryitcafe.model.entity.CustomerLocation;
import com.tryitcafe.model.entity.User;
import com.tryitcafe.repository.CustomerLocationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class CustomerLocationService {

    private final CustomerLocationRepository customerLocationRepository;

    public CustomerLocationService(CustomerLocationRepository customerLocationRepository) {
        this.customerLocationRepository = customerLocationRepository;
    }

    public List<CustomerLocationDto> getLocationsForUser(User user) {
        return customerLocationRepository.findByCustomerIdOrderByIsDefaultDescCreatedAtDesc(user.getId())
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public CustomerLocationDto getLocationByIdAndUser(UUID locationId, User user) {
        CustomerLocation location = customerLocationRepository.findByIdAndCustomerId(locationId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Location", "id", locationId));
        return toDto(location);
    }

    @Transactional
    public CustomerLocationDto createLocation(User user, CreateLocationRequest request) {
        if (request.getLatitude() == null || request.getLongitude() == null) {
            throw new BadRequestException("Latitude and longitude are mandatory for delivery location");
        }

        if (request.getLatitude() < -90.0 || request.getLatitude() > 90.0 ||
                request.getLongitude() < -180.0 || request.getLongitude() > 180.0) {
            throw new BadRequestException("GPS coordinates are out of valid range");
        }

        String effectiveAddress = request.getAddress() != null ? request.getAddress().trim() : "";
        if (effectiveAddress.isBlank()) {
            effectiveAddress = buildCompositeAddress(
                    request.getHouseFlat(), request.getBuildingName(),
                    request.getStreet(), request.getLandmark(),
                    request.getArea(), request.getCity(),
                    request.getState(), request.getPostalCode()
            );
        }

        if (effectiveAddress.isBlank()) {
            throw new BadRequestException("Address or delivery location details are required");
        }

        long existingCount = customerLocationRepository.countByCustomerId(user.getId());
        boolean shouldBeDefault = existingCount == 0 || Boolean.TRUE.equals(request.getIsDefault());

        if (shouldBeDefault && existingCount > 0) {
            customerLocationRepository.clearDefaultLocation(user.getId());
        }

        CustomerLocation location = CustomerLocation.builder()
                .customer(user)
                .label(request.getLabel() != null && !request.getLabel().isBlank() ? request.getLabel().trim() : "Home")
                .address(effectiveAddress)
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .isDefault(shouldBeDefault)
                .houseFlat(trimOrNull(request.getHouseFlat()))
                .buildingName(trimOrNull(request.getBuildingName()))
                .street(trimOrNull(request.getStreet()))
                .area(trimOrNull(request.getArea()))
                .landmark(trimOrNull(request.getLandmark()))
                .city(trimOrNull(request.getCity()))
                .state(trimOrNull(request.getState()))
                .postalCode(trimOrNull(request.getPostalCode()))
                .build();

        CustomerLocation saved = customerLocationRepository.save(location);
        return toDto(saved);
    }

    @Transactional
    public CustomerLocationDto updateLocation(User user, UUID locationId, UpdateLocationRequest request) {
        CustomerLocation location = customerLocationRepository.findByIdAndCustomerId(locationId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Saved delivery location not found or unauthorized"));

        if (request.getLabel() != null && !request.getLabel().isBlank()) {
            location.setLabel(request.getLabel().trim());
        }
        if (request.getHouseFlat() != null) location.setHouseFlat(trimOrNull(request.getHouseFlat()));
        if (request.getBuildingName() != null) location.setBuildingName(trimOrNull(request.getBuildingName()));
        if (request.getStreet() != null) location.setStreet(trimOrNull(request.getStreet()));
        if (request.getArea() != null) location.setArea(trimOrNull(request.getArea()));
        if (request.getLandmark() != null) location.setLandmark(trimOrNull(request.getLandmark()));
        if (request.getCity() != null) location.setCity(trimOrNull(request.getCity()));
        if (request.getState() != null) location.setState(trimOrNull(request.getState()));
        if (request.getPostalCode() != null) location.setPostalCode(trimOrNull(request.getPostalCode()));

        if (request.getAddress() != null && !request.getAddress().isBlank()) {
            location.setAddress(request.getAddress().trim());
        } else if (location.getHouseFlat() != null || location.getArea() != null) {
            String composite = buildCompositeAddress(
                    location.getHouseFlat(), location.getBuildingName(),
                    location.getStreet(), location.getLandmark(),
                    location.getArea(), location.getCity(),
                    location.getState(), location.getPostalCode()
            );
            if (!composite.isBlank()) {
                location.setAddress(composite);
            }
        }

        if (request.getLatitude() != null) {
            location.setLatitude(request.getLatitude());
        }
        if (request.getLongitude() != null) {
            location.setLongitude(request.getLongitude());
        }

        if (Boolean.TRUE.equals(request.getIsDefault())) {
            customerLocationRepository.clearDefaultLocation(user.getId());
            location.setDefault(true);
        }

        CustomerLocation saved = customerLocationRepository.save(location);
        return toDto(saved);
    }

    @Transactional
    public void deleteLocation(User user, UUID locationId) {
        CustomerLocation location = customerLocationRepository.findByIdAndCustomerId(locationId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Saved delivery location not found or unauthorized"));

        boolean wasDefault = location.isDefault();
        customerLocationRepository.delete(location);

        if (wasDefault) {
            // Pick next available location and promote to default
            List<CustomerLocation> remaining = customerLocationRepository.findByCustomerIdOrderByIsDefaultDescCreatedAtDesc(user.getId());
            if (!remaining.isEmpty()) {
                CustomerLocation nextDefault = remaining.get(0);
                nextDefault.setDefault(true);
                customerLocationRepository.save(nextDefault);
            }
        }
    }

    @Transactional
    public CustomerLocationDto setDefaultLocation(User user, UUID locationId) {
        CustomerLocation location = customerLocationRepository.findByIdAndCustomerId(locationId, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Saved delivery location not found or unauthorized"));

        customerLocationRepository.clearDefaultLocation(user.getId());
        location.setDefault(true);
        CustomerLocation saved = customerLocationRepository.save(location);
        return toDto(saved);
    }

    public static String buildCompositeAddress(String houseFlat, String buildingName, String street,
                                               String landmark, String area, String city,
                                               String state, String postalCode) {
        java.util.List<String> parts = new java.util.ArrayList<>();
        if (houseFlat != null && !houseFlat.isBlank()) parts.add(houseFlat.trim());
        if (buildingName != null && !buildingName.isBlank()) parts.add(buildingName.trim());
        if (street != null && !street.isBlank()) parts.add(street.trim());
        if (landmark != null && !landmark.isBlank()) parts.add(landmark.trim());
        if (area != null && !area.isBlank()) parts.add(area.trim());
        if (city != null && !city.isBlank()) parts.add(city.trim());
        if (state != null && !state.isBlank() && postalCode != null && !postalCode.isBlank()) {
            parts.add(state.trim() + " - " + postalCode.trim());
        } else {
            if (state != null && !state.isBlank()) parts.add(state.trim());
            if (postalCode != null && !postalCode.isBlank()) parts.add(postalCode.trim());
        }
        return String.join(", ", parts);
    }

    private static String trimOrNull(String str) {
        return (str != null && !str.isBlank()) ? str.trim() : null;
    }

    public CustomerLocationDto toDto(CustomerLocation entity) {
        if (entity == null) return null;
        return CustomerLocationDto.builder()
                .id(entity.getId())
                .customerId(entity.getCustomer() != null ? entity.getCustomer().getId() : null)
                .label(entity.getLabel())
                .address(entity.getAddress())
                .latitude(entity.getLatitude())
                .longitude(entity.getLongitude())
                .isDefault(entity.isDefault())
                .houseFlat(entity.getHouseFlat())
                .buildingName(entity.getBuildingName())
                .street(entity.getStreet())
                .area(entity.getArea())
                .landmark(entity.getLandmark())
                .city(entity.getCity())
                .state(entity.getState())
                .postalCode(entity.getPostalCode())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }
}
