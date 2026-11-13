
package com.mining.backend.dto;

import com.mining.backend.entity.MaintenanceHistory;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record MaintenanceResponse(
        Long id,
        Long equipmentId,
        String equipmentCode,
        BigDecimal hourMeter,
        String description,
        LocalDateTime performedAt
) {
    public static MaintenanceResponse from(MaintenanceHistory maintenance) {
        return new MaintenanceResponse(
                maintenance.getId(),
                maintenance.getEquipment().getId(),
                maintenance.getEquipment().getCode(),
                maintenance.getHourMeter(),
                maintenance.getDescription(),
                maintenance.getPerformedAt()
        );
    }
}
