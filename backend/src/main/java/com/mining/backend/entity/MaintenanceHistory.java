
package com.mining.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "maintenance_history")
public class MaintenanceHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "equipment_id", nullable = false)
    private Equipment equipment;

    @Column(name = "hour_meter", nullable = false, precision = 12, scale = 2)
    private BigDecimal hourMeter;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "performed_at", insertable = false, updatable = false)
    private LocalDateTime performedAt;

    public MaintenanceHistory() {
    }

    public Long getId() {
        return id;
    }

    public Equipment getEquipment() {
        return equipment;
    }

    public void setEquipment(Equipment equipment) {
        this.equipment = equipment;
    }

    public BigDecimal getHourMeter() {
        return hourMeter;
    }

    public void setHourMeter(BigDecimal hourMeter) {
        this.hourMeter = hourMeter;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public LocalDateTime getPerformedAt() {
        return performedAt;
    }
}
