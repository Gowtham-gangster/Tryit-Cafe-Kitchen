package com.tryitcafe.controller;

import com.tryitcafe.model.dto.ApiResponse;
import com.tryitcafe.model.dto.SettingsDtos.OnlineOrderingStatusDto;
import com.tryitcafe.model.dto.SettingsDtos.OnlineOrderingUpdateRequest;
import com.tryitcafe.service.BusinessSettingsService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
public class BusinessDirectController {

    private final BusinessSettingsService businessSettingsService;

    public BusinessDirectController(BusinessSettingsService businessSettingsService) {
        this.businessSettingsService = businessSettingsService;
    }

    /**
     * Public business status endpoint: Returns public information needed by customers:
     * onlineOrderingEnabled, closureMessage, nextOpeningTime.
     * Does NOT expose private owner information.
     */
    @GetMapping(value = {"/api/business/status", "/api/v1/business/status"})
    public ResponseEntity<ApiResponse<OnlineOrderingStatusDto>> getPublicStatus() {
        return ResponseEntity.ok(ApiResponse.ok(businessSettingsService.getOnlineOrderingStatus()));
    }

    /**
     * Direct alias for owner online-ordering management endpoint matching /api/owner/business/online-ordering
     */
    @GetMapping("/api/owner/business/online-ordering")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<OnlineOrderingStatusDto>> getOwnerOrderingStatus() {
        return ResponseEntity.ok(ApiResponse.ok(businessSettingsService.getOnlineOrderingStatus()));
    }

    @PutMapping("/api/owner/business/online-ordering")
    @PreAuthorize("hasRole('OWNER')")
    public ResponseEntity<ApiResponse<OnlineOrderingStatusDto>> updateOwnerOrderingStatus(
            @RequestBody OnlineOrderingUpdateRequest request
    ) {
        OnlineOrderingStatusDto updated = businessSettingsService.updateOnlineOrderingStatus(request);
        String msg = updated.isOnlineOrderingEnabled() ? "Online ordering is now open." : "Online ordering is now closed.";
        return ResponseEntity.ok(ApiResponse.ok(msg, updated));
    }
}
