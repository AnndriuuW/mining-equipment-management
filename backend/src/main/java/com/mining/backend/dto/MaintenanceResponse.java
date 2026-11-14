
package com.mining.backend.dto;

import com.mining.backend.entity.MaintenanceHistory;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.ZoneOffset;

public record MaintenanceResponse(
        Long id,
        Long equipmentId,
        String equipmentCode,
        BigDecimal hourMeter,
        String description,
        Instant performedAt
) {
    public static MaintenanceResponse from(MaintenanceHistory maintenance) {
        return new MaintenanceResponse(
                maintenance.getId(),
                maintenance.getEquipment().getId(),
                maintenance.getEquipment().getCode(),
                maintenance.getHourMeter(),
                maintenance.getDescription(),
                // The database stores this timestamp as UTC without an offset.
                maintenance.getPerformedAt().toInstant(ZoneOffset.UTC)
        );
    }
}
