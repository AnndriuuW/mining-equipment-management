
package com.mining.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "equipment")
public class Equipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String code;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "type_id", nullable = false)
    private EquipmentType type;

    @Column(name = "hour_meter", nullable = false, precision = 12, scale = 2)
    private BigDecimal hourMeter;

    @Column(name = "last_maintenance_hour_meter", nullable = false, precision = 12, scale = 2)
    private BigDecimal lastMaintenanceHourMeter;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    public Equipment() {
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

    public EquipmentType getType() {
        return type;
    }

    public void setType(EquipmentType type) {
        this.type = type;
    }

    public BigDecimal getHourMeter() {
        return hourMeter;
    }

    public void setHourMeter(BigDecimal hourMeter) {
        this.hourMeter = hourMeter;
    }

    public BigDecimal getLastMaintenanceHourMeter() {
        return lastMaintenanceHourMeter;
    }

    public void setLastMaintenanceHourMeter(BigDecimal lastMaintenanceHourMeter) {
        this.lastMaintenanceHourMeter = lastMaintenanceHourMeter;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
