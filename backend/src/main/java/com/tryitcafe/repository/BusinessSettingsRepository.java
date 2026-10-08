package com.tryitcafe.repository;

import com.tryitcafe.model.entity.BusinessHours;
import com.tryitcafe.model.entity.BusinessSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface BusinessSettingsRepository extends JpaRepository<BusinessSettings, UUID> {
}
