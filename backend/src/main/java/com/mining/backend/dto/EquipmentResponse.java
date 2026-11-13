
package com.mining.backend.dto;

import com.mining.backend.entity.Equipment;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record EquipmentResponse(
        Long id,
        String code,
        String typeCode,
        String typeName,
        BigDecimal hourMeter,
        BigDecimal lastMaintenanceHourMeter,
        BigDecimal maintenanceIntervalHours,
        boolean requiresMaintenance,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {

    public static EquipmentResponse from(
            Equipment equipment,
            boolean requiresMaintenance) {

        return new EquipmentResponse(
                equipment.getId(),
                equipment.getCode(),
                equipment.getType().getCode(),
                equipment.getType().getName(),
                equipment.getHourMeter(),
                equipment.getLastMaintenanceHourMeter(),
                equipment.getType().getMaintenanceIntervalHours(),
                requiresMaintenance,
                equipment.getCreatedAt(),
                equipment.getUpdatedAt()
        );
    }
}
