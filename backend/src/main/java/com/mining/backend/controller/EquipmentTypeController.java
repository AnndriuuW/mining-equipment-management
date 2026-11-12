
package com.mining.backend.controller;

import com.mining.backend.entity.EquipmentType;
import com.mining.backend.service.EquipmentTypeService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipment-types")
public class EquipmentTypeController {

    private final EquipmentTypeService equipmentTypeService;

    public EquipmentTypeController(
            EquipmentTypeService equipmentTypeService) {
        this.equipmentTypeService = equipmentTypeService;
    }

    // Listar todos los tipos de equipos
    @GetMapping
    public ResponseEntity<List<EquipmentType>> findAll() {
        return ResponseEntity.ok(equipmentTypeService.findAll());
    }

    // Buscar tipo de equipo por ID
    @GetMapping("/{id}")
    public ResponseEntity<EquipmentType> findById(
            @PathVariable Long id) {
        return ResponseEntity.ok(equipmentTypeService.findById(id));
    }
}
