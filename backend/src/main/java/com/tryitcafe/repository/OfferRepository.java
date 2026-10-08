package com.tryitcafe.repository;

import com.tryitcafe.model.entity.Offer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OfferRepository extends JpaRepository<Offer, UUID> {
    List<Offer> findAllByActiveTrueOrderByDisplayOrderAsc();
    List<Offer> findAllByOrderByDisplayOrderAsc();
    long countByActiveTrue();
}
