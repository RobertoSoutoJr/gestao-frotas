-- =====================================================
-- Migration 003: Smart Alerts - New Fields
-- =====================================================

-- ===================
-- 1. MOTORISTAS: CNH fields
-- ===================
ALTER TABLE motoristas ADD COLUMN IF NOT EXISTS numero_cnh TEXT;
ALTER TABLE motoristas ADD COLUMN IF NOT EXISTS validade_cnh DATE;

-- ===================
-- 2. CAMINHOES: Licensing & revision fields
-- ===================
ALTER TABLE caminhoes ADD COLUMN IF NOT EXISTS data_licenciamento DATE;
ALTER TABLE caminhoes ADD COLUMN IF NOT EXISTS km_proxima_revisao INTEGER DEFAULT 0;

-- ===================
-- 3. MANUTENCOES: Status field
-- ===================
ALTER TABLE manutencoes ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'concluida';

ALTER TABLE manutencoes DROP CONSTRAINT IF EXISTS chk_manutencoes_status;
ALTER TABLE manutencoes ADD CONSTRAINT chk_manutencoes_status
  CHECK (status IN ('pendente', 'em_andamento', 'concluida'));
