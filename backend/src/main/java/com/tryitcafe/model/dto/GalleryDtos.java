package com.tryitcafe.model.dto;

import com.tryitcafe.model.enums.MediaType;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;
import java.util.UUID;

public class GalleryDtos {

    public static class GalleryItemDto {
        private UUID id;
        private MediaType mediaType;
        private String mediaUrl;
        private String mediaPublicId;
        private String thumbnailUrl;
        private String title;
        private String caption;
        private String categoryTag;
        private Integer displayOrder;
        private boolean active;
        private LocalDateTime createdAt;

        public GalleryItemDto() {}

        public GalleryItemDto(UUID id, MediaType mediaType, String mediaUrl, String mediaPublicId, String thumbnailUrl,
                              String title, String caption, String categoryTag, Integer displayOrder, boolean active,
                              LocalDateTime createdAt) {
            this.id = id;
            this.mediaType = mediaType;
            this.mediaUrl = mediaUrl;
            this.mediaPublicId = mediaPublicId;
            this.thumbnailUrl = thumbnailUrl;
            this.title = title;
            this.caption = caption;
            this.categoryTag = categoryTag;
            this.displayOrder = displayOrder;
            this.active = active;
            this.createdAt = createdAt;
        }

        public static Builder builder() { return new Builder(); }

        public static class Builder {
            private UUID id;
            private MediaType mediaType;
            private String mediaUrl;
            private String mediaPublicId;
            private String thumbnailUrl;
            private String title;
            private String caption;
            private String categoryTag;
            private Integer displayOrder;
            private boolean active;
            private LocalDateTime createdAt;

            public Builder id(UUID id) { this.id = id; return this; }
            public Builder mediaType(MediaType mediaType) { this.mediaType = mediaType; return this; }
            public Builder mediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; return this; }
            public Builder mediaPublicId(String mediaPublicId) { this.mediaPublicId = mediaPublicId; return this; }
            public Builder thumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; return this; }
            public Builder title(String title) { this.title = title; return this; }
            public Builder caption(String caption) { this.caption = caption; return this; }
            public Builder categoryTag(String categoryTag) { this.categoryTag = categoryTag; return this; }
            public Builder displayOrder(Integer displayOrder) { this.displayOrder = displayOrder; return this; }
            public Builder active(boolean active) { this.active = active; return this; }
            public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

            public GalleryItemDto build() {
                return new GalleryItemDto(id, mediaType, mediaUrl, mediaPublicId, thumbnailUrl, title, caption, categoryTag, displayOrder, active, createdAt);
            }
        }

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }

        public MediaType getMediaType() { return mediaType; }
        public void setMediaType(MediaType mediaType) { this.mediaType = mediaType; }

        public String getMediaUrl() { return mediaUrl; }
        public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }

        public String getMediaPublicId() { return mediaPublicId; }
        public void setMediaPublicId(String mediaPublicId) { this.mediaPublicId = mediaPublicId; }

        public String getThumbnailUrl() { return thumbnailUrl; }
        public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getCaption() { return caption; }
        public void setCaption(String caption) { this.caption = caption; }

        public String getCategoryTag() { return categoryTag; }
        public void setCategoryTag(String categoryTag) { this.categoryTag = categoryTag; }

        public Integer getDisplayOrder() { return displayOrder; }
        public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }

        public boolean isActive() { return active; }
        public void setActive(boolean active) { this.active = active; }

        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    }

    public static class GalleryCreateRequest {
        private MediaType mediaType;
        @NotBlank(message = "Media URL is required")
        private String mediaUrl;
        private String mediaPublicId;
        private String thumbnailUrl;
        private String title;
        private String caption;
        private String categoryTag;
        private Integer displayOrder;
        private Boolean active;

        public GalleryCreateRequest() {}

        public MediaType getMediaType() { return mediaType; }
        public void setMediaType(MediaType mediaType) { this.mediaType = mediaType; }

        public String getMediaUrl() { return mediaUrl; }
        public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }

        public String getMediaPublicId() { return mediaPublicId; }
        public void setMediaPublicId(String mediaPublicId) { this.mediaPublicId = mediaPublicId; }

        public String getThumbnailUrl() { return thumbnailUrl; }
        public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getCaption() { return caption; }
        public void setCaption(String caption) { this.caption = caption; }

        public String getCategoryTag() { return categoryTag; }
        public void setCategoryTag(String categoryTag) { this.categoryTag = categoryTag; }

        public Integer getDisplayOrder() { return displayOrder; }
        public void setDisplayOrder(Integer displayOrder) { this.displayOrder = displayOrder; }

        public Boolean getActive() { return active; }
        public void setActive(Boolean active) { this.active = active; }
    }
}
