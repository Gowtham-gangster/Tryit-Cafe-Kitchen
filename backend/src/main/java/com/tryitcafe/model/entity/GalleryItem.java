package com.tryitcafe.model.entity;

import com.tryitcafe.model.enums.MediaType;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "gallery_items", indexes = {
    @Index(name = "idx_gallery_active", columnList = "active"),
    @Index(name = "idx_gallery_tag", columnList = "categoryTag")
})
public class GalleryItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MediaType mediaType = MediaType.IMAGE;

    @Column(nullable = false, length = 500)
    private String mediaUrl;

    @Column(length = 200)
    private String mediaPublicId;

    @Column(length = 500)
    private String thumbnailUrl;

    @Column(length = 150)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String caption;

    @Column(length = 50)
    private String categoryTag = "AMBIENCE";

    @Column(nullable = false)
    private Integer displayOrder = 0;

    @Column(nullable = false)
    private boolean active = true;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    public GalleryItem() {}

    public GalleryItem(UUID id, MediaType mediaType, String mediaUrl, String mediaPublicId, String thumbnailUrl,
                       String title, String caption, String categoryTag, Integer displayOrder, boolean active) {
        this.id = id;
        this.mediaType = mediaType != null ? mediaType : MediaType.IMAGE;
        this.mediaUrl = mediaUrl;
        this.mediaPublicId = mediaPublicId;
        this.thumbnailUrl = thumbnailUrl;
        this.title = title;
        this.caption = caption;
        this.categoryTag = categoryTag != null ? categoryTag : "AMBIENCE";
        this.displayOrder = displayOrder != null ? displayOrder : 0;
        this.active = active;
    }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private UUID id;
        private MediaType mediaType = MediaType.IMAGE;
        private String mediaUrl;
        private String mediaPublicId;
        private String thumbnailUrl;
        private String title;
        private String caption;
        private String categoryTag = "AMBIENCE";
        private Integer displayOrder = 0;
        private boolean active = true;

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

        public GalleryItem build() {
            return new GalleryItem(id, mediaType, mediaUrl, mediaPublicId, thumbnailUrl, title, caption, categoryTag, displayOrder, active);
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
