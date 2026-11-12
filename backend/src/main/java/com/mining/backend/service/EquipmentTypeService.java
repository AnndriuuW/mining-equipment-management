
package com.mining.backend.service;

import com.mining.backend.entity.EquipmentType;
import com.mining.backend.repository.EquipmentTypeRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class EquipmentTypeService {

    private final EquipmentTypeRepository equipmentTypeRepository;

    public EquipmentTypeService(
            EquipmentTypeRepository equipmentTypeRepository) {
        this.equipmentTypeRepository = equipmentTypeRepository;
    }

    // Listar todos los tipos de equipos
    public List<EquipmentType> findAll() {
        return equipmentTypeRepository.findAll();
    }

    // Buscar un tipo de equipo por ID
    public EquipmentType findById(Long id) {
        return equipmentTypeRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException(
                                "Tipo de equipo no encontrado: " + id));
    }
}
