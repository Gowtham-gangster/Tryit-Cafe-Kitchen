package com.tryitcafe.service;

import com.tryitcafe.model.dto.GalleryDtos.GalleryCreateRequest;
import com.tryitcafe.model.dto.GalleryDtos.GalleryItemDto;
import com.tryitcafe.model.entity.GalleryItem;
import com.tryitcafe.model.enums.MediaType;
import com.tryitcafe.repository.GalleryItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class GalleryService {

    private final GalleryItemRepository galleryItemRepository;
    private final CloudinaryService cloudinaryService;

    public GalleryService(GalleryItemRepository galleryItemRepository, CloudinaryService cloudinaryService) {
        this.galleryItemRepository = galleryItemRepository;
        this.cloudinaryService = cloudinaryService;
    }

    public List<GalleryItemDto> getActiveGallery() {
        return galleryItemRepository.findAllByActiveTrueOrderByDisplayOrderAscCreatedAtDesc().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<GalleryItemDto> getAllForOwner() {
        return galleryItemRepository.findAllByOrderByDisplayOrderAscCreatedAtDesc().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public GalleryItemDto addGalleryItem(GalleryCreateRequest request) {
        GalleryItem item = GalleryItem.builder()
                .mediaType(request.getMediaType() != null ? request.getMediaType() : MediaType.IMAGE)
                .mediaUrl(request.getMediaUrl())
                .mediaPublicId(request.getMediaPublicId())
                .thumbnailUrl(request.getThumbnailUrl())
                .title(request.getTitle())
                .caption(request.getCaption())
                .categoryTag(request.getCategoryTag() != null ? request.getCategoryTag().toUpperCase() : "AMBIENCE")
                .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                .active(request.getActive() != null ? request.getActive() : true)
                .build();

        return toDto(galleryItemRepository.save(item));
    }

    @Transactional
    public GalleryItemDto updateGalleryItem(UUID id, GalleryCreateRequest request) {
        GalleryItem item = galleryItemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Gallery item not found with ID: " + id));

        if (request.getMediaUrl() != null && !request.getMediaUrl().trim().isEmpty()) {
            String newMediaUrl = request.getMediaUrl().trim();
            if (item.getMediaPublicId() != null && request.getMediaPublicId() != null
                    && !request.getMediaPublicId().equals(item.getMediaPublicId())) {
                cloudinaryService.deleteFile(item.getMediaPublicId());
            }
            item.setMediaUrl(newMediaUrl);
            if (request.getMediaPublicId() != null) {
                item.setMediaPublicId(request.getMediaPublicId());
            }
        }

        if (request.getMediaType() != null) {
            item.setMediaType(request.getMediaType());
        }
        if (request.getTitle() != null) {
            item.setTitle(request.getTitle().trim());
        }
        if (request.getCaption() != null) {
            item.setCaption(request.getCaption().trim());
        }
        if (request.getCategoryTag() != null) {
            item.setCategoryTag(request.getCategoryTag().toUpperCase());
        }
        if (request.getActive() != null) {
            item.setActive(request.getActive());
        }
        if (request.getDisplayOrder() != null) {
            item.setDisplayOrder(request.getDisplayOrder());
        }

        return toDto(galleryItemRepository.save(item));
    }

    @Transactional
    public void deleteGalleryItem(UUID id) {
        GalleryItem item = galleryItemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Gallery item not found with ID: " + id));
        if (item.getMediaPublicId() != null) {
            cloudinaryService.deleteFile(item.getMediaPublicId());
        }
        galleryItemRepository.delete(item);
    }

    public GalleryItemDto toDto(GalleryItem item) {
        return GalleryItemDto.builder()
                .id(item.getId())
                .mediaType(item.getMediaType())
                .mediaUrl(item.getMediaUrl())
                .mediaPublicId(item.getMediaPublicId())
                .thumbnailUrl(item.getThumbnailUrl())
                .title(item.getTitle())
                .caption(item.getCaption())
                .categoryTag(item.getCategoryTag())
                .displayOrder(item.getDisplayOrder())
                .active(item.isActive())
                .createdAt(item.getCreatedAt())
                .build();
    }
}
