package com.tryitcafe.model.entity;

import jakarta.persistence.*;

import java.time.LocalTime;
import java.util.UUID;

@Entity
@Table(name = "business_hours")
public class BusinessHours {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "business_settings_id")
    private BusinessSettings businessSettings;

    @Column(nullable = false, length = 20)
    private String dayOfWeek;

    private LocalTime openTime;
    private LocalTime closeTime;

    @Column(nullable = false)
    private boolean closed = false;

    @Column(nullable = false)
    private Integer dayOrder = 0;

    public BusinessHours() {}

    public BusinessHours(UUID id, BusinessSettings businessSettings, String dayOfWeek, LocalTime openTime,
                         LocalTime closeTime, boolean closed, Integer dayOrder) {
        this.id = id;
        this.businessSettings = businessSettings;
        this.dayOfWeek = dayOfWeek;
        this.openTime = openTime;
        this.closeTime = closeTime;
        this.closed = closed;
        this.dayOrder = dayOrder != null ? dayOrder : 0;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private UUID id;
        private BusinessSettings businessSettings;
        private String dayOfWeek;
        private LocalTime openTime;
        private LocalTime closeTime;
        private boolean closed = false;
        private Integer dayOrder = 0;

        public Builder id(UUID id) { this.id = id; return this; }
        public Builder businessSettings(BusinessSettings businessSettings) { this.businessSettings = businessSettings; return this; }
        public Builder dayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; return this; }
        public Builder openTime(LocalTime openTime) { this.openTime = openTime; return this; }
        public Builder closeTime(LocalTime closeTime) { this.closeTime = closeTime; return this; }
        public Builder closed(boolean closed) { this.closed = closed; return this; }
        public Builder dayOrder(Integer dayOrder) { this.dayOrder = dayOrder; return this; }

        public BusinessHours build() {
            return new BusinessHours(id, businessSettings, dayOfWeek, openTime, closeTime, closed, dayOrder);
        }
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public BusinessSettings getBusinessSettings() { return businessSettings; }
    public void setBusinessSettings(BusinessSettings businessSettings) { this.businessSettings = businessSettings; }

    public String getDayOfWeek() { return dayOfWeek; }
    public void setDayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; }

    public LocalTime getOpenTime() { return openTime; }
    public void setOpenTime(LocalTime openTime) { this.openTime = openTime; }

    public LocalTime getCloseTime() { return closeTime; }
    public void setCloseTime(LocalTime closeTime) { this.closeTime = closeTime; }

    public boolean isClosed() { return closed; }
    public void setClosed(boolean closed) { this.closed = closed; }

    public Integer getDayOrder() { return dayOrder; }
    public void setDayOrder(Integer dayOrder) { this.dayOrder = dayOrder; }
}
