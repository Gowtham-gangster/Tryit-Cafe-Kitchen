package com.tryitcafe.repository;

import com.tryitcafe.model.entity.CustomerLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CustomerLocationRepository extends JpaRepository<CustomerLocation, UUID> {

    List<CustomerLocation> findByCustomerIdOrderByIsDefaultDescCreatedAtDesc(UUID customerId);

    Optional<CustomerLocation> findByIdAndCustomerId(UUID id, UUID customerId);

    Optional<CustomerLocation> findByCustomerIdAndIsDefaultTrue(UUID customerId);

    List<CustomerLocation> findByCustomerId(UUID customerId);

    long countByCustomerId(UUID customerId);

    @Modifying
    @Query("UPDATE CustomerLocation c SET c.isDefault = false WHERE c.customer.id = :customerId")
    void clearDefaultLocation(@Param("customerId") UUID customerId);
}
