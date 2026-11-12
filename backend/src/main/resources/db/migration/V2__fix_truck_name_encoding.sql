
-- Corregir el nombre del tipo de equipo TRUCK
UPDATE equipment_types
SET name = U&'Cami\00F3n'
WHERE code = 'TRUCK';
