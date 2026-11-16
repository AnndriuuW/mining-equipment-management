package com.mining.backend;

import com.mining.backend.entity.Equipment;
import com.mining.backend.entity.EquipmentType;
import com.mining.backend.service.MaintenanceService;
import com.mining.backend.repository.EquipmentRepository;
import com.mining.backend.repository.EquipmentTypeRepository;
import com.mining.backend.repository.MaintenanceHistoryRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class BackendApplicationTests {

	@Autowired
	private EquipmentTypeRepository equipmentTypeRepository;

	@Autowired
	private EquipmentRepository equipmentRepository;

	@Autowired
	private MaintenanceHistoryRepository maintenanceHistoryRepository;

	@Autowired
	private MaintenanceService maintenanceService;

	@Test
	void contextLoads() {
	}

	@Test
	void registeringMaintenancePersistsItAndUpdatesCountEndpoint() throws Exception {
		EquipmentType type = new EquipmentType();
		type.setCode("TEST");
		type.setName("Tipo de prueba");
		type.setMaintenanceIntervalHours(new BigDecimal("250.00"));
		type = equipmentTypeRepository.save(type);

		Equipment equipment = new Equipment();
		equipment.setCode("TEST-001");
		equipment.setType(type);
		equipment.setHourMeter(new BigDecimal("852.00"));
		equipment.setLastMaintenanceHourMeter(new BigDecimal("602.00"));
		equipment = equipmentRepository.save(equipment);

		assertEquals(0L, maintenanceService.countMaintenanceRecords());

		maintenanceService.registerMaintenance(equipment.getId(), "Cambio de aceite");

		assertEquals(1L, maintenanceHistoryRepository.count());
		assertEquals(1L, maintenanceService.countMaintenanceRecords());
	}

}
