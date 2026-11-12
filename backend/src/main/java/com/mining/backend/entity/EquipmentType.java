package com.mining.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "equipment_types")
public class EquipmentType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String code;

    @Column(nullable = false, length = 80)
    private String name;

    @Column(name = "maintenance_interval_hours", nullable = false, precision = 12, scale = 2)
    private BigDecimal maintenanceIntervalHours;

    public EquipmentType() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public BigDecimal getMaintenanceIntervalHours() {
        return maintenanceIntervalHours;
    }

    public void setMaintenanceIntervalHours(BigDecimal maintenanceIntervalHours) {
        this.maintenanceIntervalHours = maintenanceIntervalHours;
    }
}
