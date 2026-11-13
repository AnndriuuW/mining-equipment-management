
package com.mining.backend.controller;

import com.mining.backend.dto.EquipmentResponse;
import com.mining.backend.entity.Equipment;
import com.mining.backend.service.EquipmentService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/equipment")
@Validated
public class EquipmentController {

    private final EquipmentService equipmentService;

    public EquipmentController(EquipmentService equipmentService) {
        this.equipmentService = equipmentService;
    }

    // Listar todos los equipos
    @GetMapping
    public ResponseEntity<List<EquipmentResponse>> findAll() {
        return ResponseEntity.ok(equipmentService.findAll());
    }

    // Buscar equipo por ID
    @GetMapping("/{id}")
    public ResponseEntity<EquipmentResponse> findById(
            @PathVariable Long id) {
        return ResponseEntity.ok(equipmentService.findById(id));
    }

    // Registrar un equipo
    @PostMapping
    public ResponseEntity<EquipmentResponse> create(
            @Valid @RequestBody EquipmentRequest request) {

        Equipment equipment = new Equipment();
        equipment.setCode(request.code());
        equipment.setHourMeter(request.hourMeter());

        EquipmentResponse saved = equipmentService.create(
                equipment, request.typeId());

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // Actualizar un equipo
    @PutMapping("/{id}")
    public ResponseEntity<EquipmentResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody EquipmentRequest request) {

        Equipment equipment = new Equipment();
        equipment.setCode(request.code());
        equipment.setHourMeter(request.hourMeter());

        EquipmentResponse updated = equipmentService.update(
                id, equipment, request.typeId());

        return ResponseEntity.ok(updated);
    }

    // Eliminar un equipo
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        equipmentService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // Datos recibidos desde el frontend
    public record EquipmentRequest(

            @NotBlank(message = "El código es obligatorio")
            @Size(max = 30, message = "El código no puede superar 30 caracteres")
            String code,

            @NotNull(message = "El horómetro es obligatorio")
            @DecimalMin(value = "0.0", message = "El horómetro no puede ser negativo")
            BigDecimal hourMeter,

            @NotNull(message = "El tipo de equipo es obligatorio")
            Long typeId

    ) {}
}
