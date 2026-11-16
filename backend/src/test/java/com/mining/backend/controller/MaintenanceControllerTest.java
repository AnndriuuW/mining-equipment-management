package com.mining.backend.controller;

import com.mining.backend.service.MaintenanceService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class MaintenanceControllerTest {

    @Mock
    private MaintenanceService maintenanceService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(new MaintenanceController(maintenanceService))
                .build();
    }

    @Test
    void countReturnsTotalMaintenanceRecords() throws Exception {
        when(maintenanceService.countMaintenanceRecords()).thenReturn(12L);

        mockMvc.perform(get("/api/maintenance/count"))
                .andExpect(status().isOk())
                .andExpect(content().string("12"));

        verify(maintenanceService).countMaintenanceRecords();
    }
}
