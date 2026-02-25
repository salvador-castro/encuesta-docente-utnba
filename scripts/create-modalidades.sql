-- =============================================================
-- Script: Crear tabla "modalidades" y migrar datos existentes
-- Ejecutar en: Supabase → SQL Editor
-- =============================================================

-- 1. Crear tabla modalidades
CREATE TABLE IF NOT EXISTS modalidades (
  id     SERIAL PRIMARY KEY,
  nombre TEXT NOT NULL UNIQUE
);

-- 2. Insertar las 4 opciones oficiales
INSERT INTO modalidades (id, nombre) VALUES
  (1, 'Anual'),
  (2, '1er Cuatrimestre'),
  (3, '2do Cuatrimestre'),
  (4, 'Curso de Verano')
ON CONFLICT (id) DO NOTHING;

-- 3. Agregar columna modalidad_id con FK a modalidades
ALTER TABLE encuestas
  ADD COLUMN IF NOT EXISTS modalidad_id INT REFERENCES modalidades(id);

-- 4. Migrar datos existentes (mapear texto viejo → id nuevo)
--    anual            → 1 (Anual)
--    cuatrimestral    → 2 (1er Cuatrimestre)  ← ajustar si corresponde
--    curso_verano     → 4 (Curso de Verano)
UPDATE encuestas SET modalidad_id = 1 WHERE modalidad = 'anual';
UPDATE encuestas SET modalidad_id = 2 WHERE modalidad = 'cuatrimestral';
UPDATE encuestas SET modalidad_id = 4 WHERE modalidad = 'curso_verano';

-- 5. (OPCIONAL — ejecutar DESPUÉS de verificar que todo funciona)
-- ALTER TABLE encuestas DROP COLUMN modalidad;
