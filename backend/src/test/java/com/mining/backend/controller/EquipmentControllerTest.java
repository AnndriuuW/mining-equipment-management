package com.mining.backend.controller;

import com.mining.backend.service.EquipmentService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.server.ResponseStatusException;

import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class EquipmentControllerTest {

    private static final String HISTORY_CONFLICT_MESSAGE =
            "No se puede eliminar el equipo porque tiene mantenimientos registrados en el historial.";

    @Mock
    private EquipmentService equipmentService;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .standaloneSetup(new EquipmentController(equipmentService))
                .build();
    }

    @Test
    void deleteReturnsConflictAndClearMessageWhenEquipmentHasHistory() throws Exception {
        doThrow(new ResponseStatusException(
                HttpStatus.CONFLICT,
                HISTORY_CONFLICT_MESSAGE
        )).when(equipmentService).delete(7L);

        mockMvc.perform(delete("/api/equipment/7"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value(HISTORY_CONFLICT_MESSAGE));

        verify(equipmentService).delete(7L);
    }

    @Test
    void deleteReturnsNoContentWhenServiceAllowsIt() throws Exception {
        mockMvc.perform(delete("/api/equipment/7"))
                .andExpect(status().isNoContent());

        verify(equipmentService).delete(7L);
    }
}
