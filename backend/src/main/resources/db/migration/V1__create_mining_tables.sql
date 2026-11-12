
-- 1. Tipos de equipos e intervalos de mantenimiento
CREATE TABLE equipment_types (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(80) NOT NULL,
    maintenance_interval_hours NUMERIC(12, 2) NOT NULL,
    CONSTRAINT chk_maintenance_interval
        CHECK (maintenance_interval_hours > 0)
);

-- 2. Registro de equipos
CREATE TABLE equipment (
    id BIGSERIAL PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,
    type_id BIGINT NOT NULL,
    hour_meter NUMERIC(12, 2) NOT NULL DEFAULT 0,
    last_maintenance_hour_meter NUMERIC(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_equipment_type
        FOREIGN KEY (type_id) REFERENCES equipment_types(id),

    CONSTRAINT chk_equipment_hour_meter
        CHECK (hour_meter >= 0),

    CONSTRAINT chk_last_maintenance_hour_meter
        CHECK (
            last_maintenance_hour_meter >= 0
            AND last_maintenance_hour_meter <= hour_meter
        )
);

-- 3. Historial de mantenimientos
CREATE TABLE maintenance_history (
    id BIGSERIAL PRIMARY KEY,
    equipment_id BIGINT NOT NULL,
    hour_meter NUMERIC(12, 2) NOT NULL,
    description TEXT,
    performed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_maintenance_equipment
        FOREIGN KEY (equipment_id) REFERENCES equipment(id),

    CONSTRAINT chk_maintenance_hour_meter
        CHECK (hour_meter >= 0)
);

-- 4. Tipos de equipos iniciales
INSERT INTO equipment_types (code, name, maintenance_interval_hours)
VALUES
    ('TRUCK', 'Camión', 250),
    ('EXCAVATOR', 'Excavadora', 200),
    ('DRILL', 'Perforadora', 150);

-- Índice para consultar rápidamente el historial de un equipo
CREATE INDEX idx_maintenance_equipment_id
    ON maintenance_history(equipment_id);

-- equipment_types Define camiones, excavadoras y perforadoras, junto con sus intervalos.
-- equipment    Guarda el horómetro actual y el punto de partida del ciclo de mantenimiento.
-- maintenance_history  Conserva cada mantenimiento realizado.

