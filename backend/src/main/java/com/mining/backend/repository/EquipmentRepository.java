
package com.mining.backend.repository;

import com.mining.backend.entity.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface EquipmentRepository extends JpaRepository<Equipment, Long> {

    Optional<Equipment> findByCode(String code);

    List<Equipment> findByTypeId(Long typeId);
}
