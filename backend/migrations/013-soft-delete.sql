-- 013: Add soft delete (deleted_at) to main entities
-- Instead of hard deleting records, we mark them with a timestamp

ALTER TABLE caminhoes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE motoristas ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE abastecimentos ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE manutencoes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE viagens ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE fornecedores ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE oficinas ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE postos ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Partial indexes for efficient filtering of active records
CREATE INDEX IF NOT EXISTS idx_caminhoes_active ON caminhoes(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_motoristas_active ON motoristas(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_abastecimentos_active ON abastecimentos(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_manutencoes_active ON manutencoes(user_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_viagens_active ON viagens(user_id) WHERE deleted_at IS NULL;
