package com.tryitcafe.model.dto;

public class DashboardSummaryDto {
    private long totalMenuItems;
    private long availableMenuItems;
    private long totalCategories;
    private long activeOffers;
    private long totalReviews;
    private long pendingReviews;
    private long approvedReviews;
    private double averageRating;

    public DashboardSummaryDto() {}

    public DashboardSummaryDto(long totalMenuItems, long availableMenuItems, long totalCategories, long activeOffers,
                               long totalReviews, long pendingReviews, long approvedReviews, double averageRating) {
        this.totalMenuItems = totalMenuItems;
        this.availableMenuItems = availableMenuItems;
        this.totalCategories = totalCategories;
        this.activeOffers = activeOffers;
        this.totalReviews = totalReviews;
        this.pendingReviews = pendingReviews;
        this.approvedReviews = approvedReviews;
        this.averageRating = averageRating;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private long totalMenuItems;
        private long availableMenuItems;
        private long totalCategories;
        private long activeOffers;
        private long totalReviews;
        private long pendingReviews;
        private long approvedReviews;
        private double averageRating;

        public Builder totalMenuItems(long totalMenuItems) { this.totalMenuItems = totalMenuItems; return this; }
        public Builder availableMenuItems(long availableMenuItems) { this.availableMenuItems = availableMenuItems; return this; }
        public Builder totalCategories(long totalCategories) { this.totalCategories = totalCategories; return this; }
        public Builder activeOffers(long activeOffers) { this.activeOffers = activeOffers; return this; }
        public Builder totalReviews(long totalReviews) { this.totalReviews = totalReviews; return this; }
        public Builder pendingReviews(long pendingReviews) { this.pendingReviews = pendingReviews; return this; }
        public Builder approvedReviews(long approvedReviews) { this.approvedReviews = approvedReviews; return this; }
        public Builder averageRating(double averageRating) { this.averageRating = averageRating; return this; }

        public DashboardSummaryDto build() {
            return new DashboardSummaryDto(totalMenuItems, availableMenuItems, totalCategories, activeOffers,
                    totalReviews, pendingReviews, approvedReviews, averageRating);
        }
    }

    public long getTotalMenuItems() { return totalMenuItems; }
    public void setTotalMenuItems(long totalMenuItems) { this.totalMenuItems = totalMenuItems; }

    public long getAvailableMenuItems() { return availableMenuItems; }
    public void setAvailableMenuItems(long availableMenuItems) { this.availableMenuItems = availableMenuItems; }

    public long getTotalCategories() { return totalCategories; }
    public void setTotalCategories(long totalCategories) { this.totalCategories = totalCategories; }

    public long getActiveOffers() { return activeOffers; }
    public void setActiveOffers(long activeOffers) { this.activeOffers = activeOffers; }

    public long getTotalReviews() { return totalReviews; }
    public void setTotalReviews(long totalReviews) { this.totalReviews = totalReviews; }

    public long getPendingReviews() { return pendingReviews; }
    public void setPendingReviews(long pendingReviews) { this.pendingReviews = pendingReviews; }

    public long getApprovedReviews() { return approvedReviews; }
    public void setApprovedReviews(long approvedReviews) { this.approvedReviews = approvedReviews; }

    public double getAverageRating() { return averageRating; }
    public void setAverageRating(double averageRating) { this.averageRating = averageRating; }
}
