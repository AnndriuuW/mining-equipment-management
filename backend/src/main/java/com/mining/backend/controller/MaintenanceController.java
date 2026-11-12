
package com.mining.backend.controller;

import com.mining.backend.entity.MaintenanceHistory;
import com.mining.backend.service.MaintenanceService;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    public MaintenanceController(MaintenanceService maintenanceService) {
        this.maintenanceService = maintenanceService;
    }

    // Registrar mantenimiento de un equipo
    @PostMapping("/equipment/{equipmentId}")
    public ResponseEntity<MaintenanceHistory> registerMaintenance(
            @PathVariable Long equipmentId,
            @Valid @RequestBody MaintenanceRequest request) {

        MaintenanceHistory maintenance =
                maintenanceService.registerMaintenance(
                        equipmentId,
                        request.description()
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(maintenance);
    }

    // Consultar historial de mantenimiento de un equipo
    @GetMapping("/equipment/{equipmentId}/history")
    public ResponseEntity<List<MaintenanceHistory>> findHistory(
            @PathVariable Long equipmentId) {

        return ResponseEntity.ok(
                maintenanceService.findHistoryByEquipment(equipmentId)
        );
    }

    // Datos recibidos desde el frontend
    public record MaintenanceRequest(
            @Size(max = 1000, message = "La descripción no puede superar 1000 caracteres")
            String description
    ) {}
}
