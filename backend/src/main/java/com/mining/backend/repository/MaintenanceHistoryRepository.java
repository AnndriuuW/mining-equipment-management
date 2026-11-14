
package com.mining.backend.repository;

import com.mining.backend.entity.MaintenanceHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MaintenanceHistoryRepository extends JpaRepository<MaintenanceHistory, Long> {

    boolean existsByEquipmentId(Long equipmentId);

    List<MaintenanceHistory> findByEquipmentIdOrderByPerformedAtDesc(Long equipmentId);
}
