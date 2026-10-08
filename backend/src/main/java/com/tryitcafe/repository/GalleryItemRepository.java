package com.tryitcafe.repository;

import com.tryitcafe.model.entity.GalleryItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface GalleryItemRepository extends JpaRepository<GalleryItem, UUID> {
    List<GalleryItem> findAllByActiveTrueOrderByDisplayOrderAscCreatedAtDesc();
    List<GalleryItem> findAllByOrderByDisplayOrderAscCreatedAtDesc();
}
