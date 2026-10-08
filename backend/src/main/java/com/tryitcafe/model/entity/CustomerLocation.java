package com.tryitcafe.model.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "customer_locations", indexes = {
    @Index(name = "idx_customer_location_customer_id", columnList = "customer_id")
})
public class CustomerLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @Column(nullable = false, length = 50)
    private String label = "Home";

    @Column(nullable = false, columnDefinition = "TEXT")
    private String address;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    @Column(nullable = false)
    private boolean isDefault = false;

    @Column(name = "house_flat", length = 150)
    private String houseFlat;

    @Column(name = "building_name", length = 150)
    private String buildingName;

    @Column(length = 200)
    private String street;

    @Column(length = 150)
    private String area;

    @Column(length = 200)
    private String landmark;

    @Column(length = 100)
    private String city;

    @Column(length = 100)
    private String state;

    @Column(name = "postal_code", length = 20)
    private String postalCode;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public CustomerLocation() {}

    public CustomerLocation(UUID id, User customer, String label, String address, Double latitude, Double longitude, boolean isDefault) {
        this.id = id;
        this.customer = customer;
        this.label = label != null ? label : "Home";
        this.address = address;
        this.latitude = latitude;
        this.longitude = longitude;
        this.isDefault = isDefault;
    }

    public CustomerLocation(UUID id, User customer, String label, String address, Double latitude, Double longitude, boolean isDefault,
                            String houseFlat, String buildingName, String street, String area, String landmark, String city, String state, String postalCode) {
        this.id = id;
        this.customer = customer;
        this.label = label != null ? label : "Home";
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
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private UUID id;
        private User customer;
        private String label = "Home";
        private String address;
        private Double latitude;
        private Double longitude;
        private boolean isDefault = false;
        private String houseFlat;
        private String buildingName;
        private String street;
        private String area;
        private String landmark;
        private String city;
        private String state;
        private String postalCode;

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder customer(User customer) { this.customer = customer; return this; }
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

        public CustomerLocation build() {
            return new CustomerLocation(id, customer, label, address, latitude, longitude, isDefault,
                    houseFlat, buildingName, street, area, landmark, city, state, postalCode);
        }
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public User getCustomer() { return customer; }
    public void setCustomer(User customer) { this.customer = customer; }

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
