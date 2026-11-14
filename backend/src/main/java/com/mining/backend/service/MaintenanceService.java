
package com.mining.backend.service;

import com.mining.backend.dto.MaintenanceResponse;
import com.mining.backend.entity.Equipment;
import com.mining.backend.entity.MaintenanceHistory;
import com.mining.backend.repository.EquipmentRepository;
import com.mining.backend.repository.MaintenanceHistoryRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Service
@Transactional
public class MaintenanceService {

    private final EquipmentRepository equipmentRepository;
    private final MaintenanceHistoryRepository maintenanceHistoryRepository;

    public MaintenanceService(
            EquipmentRepository equipmentRepository,
            MaintenanceHistoryRepository maintenanceHistoryRepository) {
        this.equipmentRepository = equipmentRepository;
        this.maintenanceHistoryRepository = maintenanceHistoryRepository;
    }

    // Registrar un mantenimiento
    public MaintenanceResponse registerMaintenance(
            Long equipmentId, String description) {

        Equipment equipment = equipmentRepository.findById(equipmentId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Equipo no encontrado: " + equipmentId));

        // Guardar el horómetro actual en el historial
        MaintenanceHistory maintenance = new MaintenanceHistory();
        maintenance.setEquipment(equipment);
        maintenance.setHourMeter(equipment.getHourMeter());
        maintenance.setDescription(description);
        maintenance.setPerformedAt(LocalDateTime.now(ZoneOffset.UTC));

        MaintenanceHistory saved =
                maintenanceHistoryRepository.save(maintenance);

        // Iniciar un nuevo ciclo de mantenimiento
        equipment.setLastMaintenanceHourMeter(equipment.getHourMeter());
        equipmentRepository.save(equipment);

        return MaintenanceResponse.from(saved);
    }

    // Consultar el historial de un equipo
    @Transactional(readOnly = true)
    public List<MaintenanceResponse> findHistoryByEquipment(Long equipmentId) {

        if (!equipmentRepository.existsById(equipmentId)) {
            throw new RuntimeException(
                    "Equipo no encontrado: " + equipmentId);
        }

        return maintenanceHistoryRepository
                .findByEquipmentIdOrderByPerformedAtDesc(equipmentId)
                .stream()
                .map(MaintenanceResponse::from)
                .toList();
    }
}
