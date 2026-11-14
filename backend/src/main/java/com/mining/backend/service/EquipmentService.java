
package com.mining.backend.service;

import com.mining.backend.dto.EquipmentResponse;
import com.mining.backend.entity.Equipment;
import com.mining.backend.entity.EquipmentType;
import com.mining.backend.repository.EquipmentRepository;
import com.mining.backend.repository.EquipmentTypeRepository;
import com.mining.backend.repository.MaintenanceHistoryRepository;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

import java.time.LocalDateTime;

@Service
@Transactional
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final EquipmentTypeRepository equipmentTypeRepository;
    private final MaintenanceHistoryRepository maintenanceHistoryRepository;

    public EquipmentService(
            EquipmentRepository equipmentRepository,
            EquipmentTypeRepository equipmentTypeRepository,
            MaintenanceHistoryRepository maintenanceHistoryRepository) {
        this.equipmentRepository = equipmentRepository;
        this.equipmentTypeRepository = equipmentTypeRepository;
        this.maintenanceHistoryRepository = maintenanceHistoryRepository;
    }

    // Listar todos los equipos
    @Transactional(readOnly = true)
    public List<EquipmentResponse> findAll() {
        return equipmentRepository.findAll()
                .stream()
                .map(equipment -> EquipmentResponse.from(
                        equipment,
                        requiresMaintenance(equipment)))
                .toList();
    }

    // Buscar equipo por ID
    @Transactional(readOnly = true)
    public EquipmentResponse findById(Long id) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Equipo no encontrado: " + id));

        return EquipmentResponse.from(
                equipment,
                requiresMaintenance(equipment));
    }

    // Registrar un equipo
    public EquipmentResponse create(Equipment equipment, Long typeId) {

        EquipmentType type = equipmentTypeRepository.findById(typeId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Tipo de equipo no encontrado: " + typeId));

        equipment.setType(type);
        equipment.setLastMaintenanceHourMeter(BigDecimal.ZERO);

        Equipment saved = equipmentRepository.save(equipment);

        return EquipmentResponse.from(
                saved,
                requiresMaintenance(saved));
    }

    // Actualizar un equipo
    public EquipmentResponse update(
            Long id, Equipment updatedEquipment, Long typeId) {

        Equipment existing = equipmentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Equipo no encontrado: " + id));

        EquipmentType type = equipmentTypeRepository.findById(typeId)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Tipo de equipo no encontrado: " + typeId));

        existing.setCode(updatedEquipment.getCode());
        existing.setType(type);
        existing.setHourMeter(updatedEquipment.getHourMeter());
        existing.setUpdatedAt(LocalDateTime.now());

        Equipment saved = equipmentRepository.save(existing);

        return EquipmentResponse.from(
                saved,
                requiresMaintenance(saved));
    }

    // Eliminar un equipo
    public void delete(Long id) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Equipo no encontrado: " + id));

        if (maintenanceHistoryRepository.existsByEquipmentId(id)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "No se puede eliminar el equipo porque tiene mantenimientos registrados en el historial."
            );
        }

        equipmentRepository.delete(equipment);
    }

    // Verificar si requiere mantenimiento
    private boolean requiresMaintenance(Equipment equipment) {

        BigDecimal hoursSinceLastMaintenance =
                equipment.getHourMeter()
                        .subtract(equipment.getLastMaintenanceHourMeter());

        return hoursSinceLastMaintenance.compareTo(
                equipment.getType().getMaintenanceIntervalHours()) >= 0;
    }
}
