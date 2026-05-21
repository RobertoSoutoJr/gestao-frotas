-- Vincular motorista a um caminhão fixo
ALTER TABLE motoristas ADD COLUMN IF NOT EXISTS caminhao_id INTEGER REFERENCES caminhoes(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_motoristas_caminhao ON motoristas(caminhao_id);
