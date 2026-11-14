package com.mining.backend.service;

import com.mining.backend.entity.Equipment;
import com.mining.backend.entity.EquipmentType;
import com.mining.backend.repository.EquipmentRepository;
import com.mining.backend.repository.EquipmentTypeRepository;
import com.mining.backend.repository.MaintenanceHistoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EquipmentServiceTest {

    @Mock
    private EquipmentRepository equipmentRepository;

    @Mock
    private EquipmentTypeRepository equipmentTypeRepository;

    @Mock
    private MaintenanceHistoryRepository maintenanceHistoryRepository;

    private EquipmentService equipmentService;
    private Equipment equipment;

    @BeforeEach
    void setUp() {
        equipmentService = new EquipmentService(
                equipmentRepository,
                equipmentTypeRepository,
                maintenanceHistoryRepository
        );

        EquipmentType type = new EquipmentType();
        type.setId(1L);
        type.setCode("TRUCK");
        type.setName("Camión");
        type.setMaintenanceIntervalHours(new BigDecimal("250.00"));

        equipment = new Equipment();
        equipment.setId(1L);
        equipment.setCode("TRUCK-001");
        equipment.setType(type);
        equipment.setLastMaintenanceHourMeter(new BigDecimal("852.00"));
    }

    @Test
    void requiresMaintenanceWhenTheIntervalIsReached() {
        equipment.setHourMeter(new BigDecimal("1102.00"));
        when(equipmentRepository.findById(1L)).thenReturn(Optional.of(equipment));

        assertTrue(equipmentService.findById(1L).requiresMaintenance());
    }

    @Test
    void doesNotRequireMaintenanceBeforeTheIntervalIsReached() {
        equipment.setHourMeter(new BigDecimal("1101.99"));
        when(equipmentRepository.findById(1L)).thenReturn(Optional.of(equipment));

        assertFalse(equipmentService.findById(1L).requiresMaintenance());
    }

    @Test
    void refusesToDeleteEquipmentThatHasMaintenanceHistory() {
        when(equipmentRepository.findById(1L)).thenReturn(Optional.of(equipment));
        when(maintenanceHistoryRepository.existsByEquipmentId(1L)).thenReturn(true);

        ResponseStatusException exception = assertThrows(
                ResponseStatusException.class,
                () -> equipmentService.delete(1L)
        );

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        assertEquals(
                "No se puede eliminar el equipo porque tiene mantenimientos registrados en el historial.",
                exception.getReason()
        );
        verify(equipmentRepository, never()).delete(equipment);
    }

    @Test
    void deletesEquipmentWithoutMaintenanceHistory() {
        when(equipmentRepository.findById(1L)).thenReturn(Optional.of(equipment));
        when(maintenanceHistoryRepository.existsByEquipmentId(1L)).thenReturn(false);

        equipmentService.delete(1L);

        verify(equipmentRepository).delete(equipment);
    }
}
