-- =====================================================
-- Migration 004: Trip Cost Center - Expense Fields
-- =====================================================

ALTER TABLE viagens ADD COLUMN IF NOT EXISTS custo_combustivel NUMERIC DEFAULT 0;
ALTER TABLE viagens ADD COLUMN IF NOT EXISTS custo_pedagio NUMERIC DEFAULT 0;
ALTER TABLE viagens ADD COLUMN IF NOT EXISTS custo_manutencao NUMERIC DEFAULT 0;
ALTER TABLE viagens ADD COLUMN IF NOT EXISTS custo_outros NUMERIC DEFAULT 0;

-- Constraints
ALTER TABLE viagens ADD CONSTRAINT chk_viagens_custo_combustivel CHECK (custo_combustivel >= 0);
ALTER TABLE viagens ADD CONSTRAINT chk_viagens_custo_pedagio CHECK (custo_pedagio >= 0);
ALTER TABLE viagens ADD CONSTRAINT chk_viagens_custo_manutencao CHECK (custo_manutencao >= 0);
ALTER TABLE viagens ADD CONSTRAINT chk_viagens_custo_outros CHECK (custo_outros >= 0);
