
package com.mining.backend.service;

import com.mining.backend.entity.Equipment;
import com.mining.backend.entity.EquipmentType;
import com.mining.backend.repository.EquipmentRepository;
import com.mining.backend.repository.EquipmentTypeRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@Transactional
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final EquipmentTypeRepository equipmentTypeRepository;

    public EquipmentService(
            EquipmentRepository equipmentRepository,
            EquipmentTypeRepository equipmentTypeRepository) {
        this.equipmentRepository = equipmentRepository;
        this.equipmentTypeRepository = equipmentTypeRepository;
    }

    // Listar todos los equipos
    @Transactional(readOnly = true)
    public List<Equipment> findAll() {
        return equipmentRepository.findAll();
    }

    // Buscar equipo por ID
    @Transactional(readOnly = true)
    public Equipment findById(Long id) {
        return equipmentRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Equipo no encontrado: " + id));
    }

    // Registrar un equipo
    public Equipment create(Equipment equipment, Long typeId) {

        EquipmentType type = equipmentTypeRepository.findById(typeId)
                .orElseThrow(() ->
                        new RuntimeException("Tipo de equipo no encontrado: " + typeId));

        equipment.setType(type);
        equipment.setLastMaintenanceHourMeter(BigDecimal.ZERO);

        return equipmentRepository.save(equipment);
    }

    // Actualizar un equipo
    public Equipment update(Long id, Equipment updatedEquipment, Long typeId) {

        Equipment existing = findById(id);

        EquipmentType type = equipmentTypeRepository.findById(typeId)
                .orElseThrow(() ->
                        new RuntimeException("Tipo de equipo no encontrado: " + typeId));

        existing.setCode(updatedEquipment.getCode());
        existing.setType(type);
        existing.setHourMeter(updatedEquipment.getHourMeter());

        return equipmentRepository.save(existing);
    }

    // Eliminar un equipo
    public void delete(Long id) {
        Equipment equipment = findById(id);
        equipmentRepository.delete(equipment);
    }

    // Verificar si requiere mantenimiento
    @Transactional(readOnly = true)
    public boolean requiresMaintenance(Equipment equipment) {

        BigDecimal hoursSinceLastMaintenance =
                equipment.getHourMeter()
                        .subtract(equipment.getLastMaintenanceHourMeter());

        return hoursSinceLastMaintenance.compareTo(
                equipment.getType().getMaintenanceIntervalHours()) >= 0;
    }
}
