package com.mining.backend.service;

import com.mining.backend.dto.MaintenanceResponse;
import com.mining.backend.entity.Equipment;
import com.mining.backend.entity.MaintenanceHistory;
import com.mining.backend.repository.EquipmentRepository;
import com.mining.backend.repository.MaintenanceHistoryRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MaintenanceServiceTest {

    @Mock
    private EquipmentRepository equipmentRepository;

    @Mock
    private MaintenanceHistoryRepository maintenanceHistoryRepository;

    @Test
    void recordsCurrentHourMeterAndResetsMaintenanceCycle() {
        Equipment equipment = new Equipment();
        equipment.setId(7L);
        equipment.setCode("TRUCK-001");
        equipment.setHourMeter(new BigDecimal("852.00"));
        equipment.setLastMaintenanceHourMeter(new BigDecimal("602.00"));
        when(equipmentRepository.findById(7L)).thenReturn(Optional.of(equipment));
        when(maintenanceHistoryRepository.save(any(MaintenanceHistory.class)))
                .thenAnswer(invocation -> {
                    MaintenanceHistory saved = invocation.getArgument(0);
                    ReflectionTestUtils.setField(
                            saved,
                            "performedAt",
                            LocalDateTime.of(2026, 11, 14, 0, 45, 29)
                    );
                    return saved;
                });

        MaintenanceService maintenanceService = new MaintenanceService(
                equipmentRepository,
                maintenanceHistoryRepository
        );
        MaintenanceResponse response = maintenanceService.registerMaintenance(
                7L,
                "Cambio de aceite"
        );

        ArgumentCaptor<MaintenanceHistory> historyCaptor =
                ArgumentCaptor.forClass(MaintenanceHistory.class);
        verify(maintenanceHistoryRepository).save(historyCaptor.capture());
        verify(equipmentRepository).save(equipment);

        assertEquals(new BigDecimal("852.00"), historyCaptor.getValue().getHourMeter());
        assertEquals("Cambio de aceite", historyCaptor.getValue().getDescription());
        assertEquals(new BigDecimal("852.00"), equipment.getLastMaintenanceHourMeter());
        assertEquals(Instant.parse("2026-11-14T00:45:29Z"), response.performedAt());
    }
}
