
package com.mining.backend.service;

import com.mining.backend.entity.Equipment;
import com.mining.backend.entity.MaintenanceHistory;
import com.mining.backend.repository.EquipmentRepository;
import com.mining.backend.repository.MaintenanceHistoryRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

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
    public MaintenanceHistory registerMaintenance(
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

        MaintenanceHistory saved =
                maintenanceHistoryRepository.save(maintenance);

        // Iniciar un nuevo ciclo de mantenimiento
        equipment.setLastMaintenanceHourMeter(equipment.getHourMeter());
        equipmentRepository.save(equipment);

        return saved;
    }

    // Consultar el historial de un equipo
    @Transactional(readOnly = true)
    public List<MaintenanceHistory> findHistoryByEquipment(Long equipmentId) {

        if (!equipmentRepository.existsById(equipmentId)) {
            throw new RuntimeException(
                    "Equipo no encontrado: " + equipmentId);
        }

        return maintenanceHistoryRepository
                .findByEquipmentIdOrderByPerformedAtDesc(equipmentId);
    }
}
