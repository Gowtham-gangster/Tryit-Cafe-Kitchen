package com.tryitcafe.model.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.UUID;

public class CustomerLocationDtos {

    public static class CustomerLocationDto {
        private UUID id;
        private UUID customerId;
        private String label;
        private String address;
        private Double latitude;
        private Double longitude;
        private boolean isDefault;
        private String houseFlat;
        private String buildingName;
        private String street;
        private String area;
        private String landmark;
        private String city;
        private String state;
        private String postalCode;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public CustomerLocationDto() {}

        public CustomerLocationDto(UUID id, UUID customerId, String label, String address, Double latitude, Double longitude, boolean isDefault,
                                   String houseFlat, String buildingName, String street, String area, String landmark, String city, String state, String postalCode,
                                   LocalDateTime createdAt, LocalDateTime updatedAt) {
            this.id = id;
            this.customerId = customerId;
            this.label = label;
            this.address = address;
            this.latitude = latitude;
            this.longitude = longitude;
            this.isDefault = isDefault;
            this.houseFlat = houseFlat;
            this.buildingName = buildingName;
            this.street = street;
            this.area = area;
            this.landmark = landmark;
            this.city = city;
            this.state = state;
            this.postalCode = postalCode;
            this.createdAt = createdAt;
            this.updatedAt = updatedAt;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private UUID id;
            private UUID customerId;
            private String label;
            private String address;
            private Double latitude;
            private Double longitude;
            private boolean isDefault;
            private String houseFlat;
            private String buildingName;
            private String street;
            private String area;
            private String landmark;
            private String city;
            private String state;
            private String postalCode;
            private LocalDateTime createdAt;
            private LocalDateTime updatedAt;

            public Builder id(UUID id) { this.id = id; return this; }
            public Builder customerId(UUID customerId) { this.customerId = customerId; return this; }
            public Builder label(String label) { this.label = label; return this; }
            public Builder address(String address) { this.address = address; return this; }
            public Builder latitude(Double latitude) { this.latitude = latitude; return this; }
            public Builder longitude(Double longitude) { this.longitude = longitude; return this; }
            public Builder isDefault(boolean isDefault) { this.isDefault = isDefault; return this; }
            public Builder houseFlat(String houseFlat) { this.houseFlat = houseFlat; return this; }
            public Builder buildingName(String buildingName) { this.buildingName = buildingName; return this; }
            public Builder street(String street) { this.street = street; return this; }
            public Builder area(String area) { this.area = area; return this; }
            public Builder landmark(String landmark) { this.landmark = landmark; return this; }
            public Builder city(String city) { this.city = city; return this; }
            public Builder state(String state) { this.state = state; return this; }
            public Builder postalCode(String postalCode) { this.postalCode = postalCode; return this; }
            public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
            public Builder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

            public CustomerLocationDto build() {
                return new CustomerLocationDto(id, customerId, label, address, latitude, longitude, isDefault,
                        houseFlat, buildingName, street, area, landmark, city, state, postalCode, createdAt, updatedAt);
            }
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }

        public UUID getCustomerId() { return customerId; }
        public void setCustomerId(UUID customerId) { this.customerId = customerId; }

        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }

        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }

        public Double getLatitude() { return latitude; }
        public void setLatitude(Double latitude) { this.latitude = latitude; }

        public Double getLongitude() { return longitude; }
        public void setLongitude(Double longitude) { this.longitude = longitude; }

        public boolean isDefault() { return isDefault; }
        public void setDefault(boolean isDefault) { this.isDefault = isDefault; }

        public String getHouseFlat() { return houseFlat; }
        public void setHouseFlat(String houseFlat) { this.houseFlat = houseFlat; }

        public String getBuildingName() { return buildingName; }
        public void setBuildingName(String buildingName) { this.buildingName = buildingName; }

        public String getStreet() { return street; }
        public void setStreet(String street) { this.street = street; }

        public String getArea() { return area; }
        public void setArea(String area) { this.area = area; }

        public String getLandmark() { return landmark; }
        public void setLandmark(String landmark) { this.landmark = landmark; }

        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }

        public String getState() { return state; }
        public void setState(String state) { this.state = state; }

        public String getPostalCode() { return postalCode; }
        public void setPostalCode(String postalCode) { this.postalCode = postalCode; }

        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

        public LocalDateTime getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    }

    public static class CreateLocationRequest {
        private String label = "Home";

        private String address;

        private String houseFlat;
        private String buildingName;
        private String street;
        private String area;
        private String landmark;
        private String city;
        private String state;
        private String postalCode;

        @NotNull(message = "Latitude is required")
        @DecimalMin(value = "-90.0", message = "Latitude must be >= -90")
        @DecimalMax(value = "90.0", message = "Latitude must be <= 90")
        private Double latitude;

        @NotNull(message = "Longitude is required")
        @DecimalMin(value = "-180.0", message = "Longitude must be >= -180")
        @DecimalMax(value = "180.0", message = "Longitude must be <= 180")
        private Double longitude;

        private Boolean isDefault = false;

        public CreateLocationRequest() {}

        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }

        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }

        public String getHouseFlat() { return houseFlat; }
        public void setHouseFlat(String houseFlat) { this.houseFlat = houseFlat; }

        public String getBuildingName() { return buildingName; }
        public void setBuildingName(String buildingName) { this.buildingName = buildingName; }

        public String getStreet() { return street; }
        public void setStreet(String street) { this.street = street; }

        public String getArea() { return area; }
        public void setArea(String area) { this.area = area; }

        public String getLandmark() { return landmark; }
        public void setLandmark(String landmark) { this.landmark = landmark; }

        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }

        public String getState() { return state; }
        public void setState(String state) { this.state = state; }

        public String getPostalCode() { return postalCode; }
        public void setPostalCode(String postalCode) { this.postalCode = postalCode; }

        public Double getLatitude() { return latitude; }
        public void setLatitude(Double latitude) { this.latitude = latitude; }

        public Double getLongitude() { return longitude; }
        public void setLongitude(Double longitude) { this.longitude = longitude; }

        public Boolean getIsDefault() { return isDefault; }
        public void setIsDefault(Boolean isDefault) { this.isDefault = isDefault; }
    }

    public static class UpdateLocationRequest {
        private String label;
        private String address;
        private String houseFlat;
        private String buildingName;
        private String street;
        private String area;
        private String landmark;
        private String city;
        private String state;
        private String postalCode;
        private Double latitude;
        private Double longitude;
        private Boolean isDefault;

        public UpdateLocationRequest() {}

        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }

        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }

        public String getHouseFlat() { return houseFlat; }
        public void setHouseFlat(String houseFlat) { this.houseFlat = houseFlat; }

        public String getBuildingName() { return buildingName; }
        public void setBuildingName(String buildingName) { this.buildingName = buildingName; }

        public String getStreet() { return street; }
        public void setStreet(String street) { this.street = street; }

        public String getArea() { return area; }
        public void setArea(String area) { this.area = area; }

        public String getLandmark() { return landmark; }
        public void setLandmark(String landmark) { this.landmark = landmark; }

        public String getCity() { return city; }
        public void setCity(String city) { this.city = city; }

        public String getState() { return state; }
        public void setState(String state) { this.state = state; }

        public String getPostalCode() { return postalCode; }
        public void setPostalCode(String postalCode) { this.postalCode = postalCode; }

        public Double getLatitude() { return latitude; }
        public void setLatitude(Double latitude) { this.latitude = latitude; }

        public Double getLongitude() { return longitude; }
        public void setLongitude(Double longitude) { this.longitude = longitude; }

        public Boolean getIsDefault() { return isDefault; }
        public void setIsDefault(Boolean isDefault) { this.isDefault = isDefault; }
    }
}
