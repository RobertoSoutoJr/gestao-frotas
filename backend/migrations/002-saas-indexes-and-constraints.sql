-- =====================================================
-- Migration 002: SaaS Performance - Indexes & Constraints
-- Applied: 2026-03-23
-- =====================================================

-- ===================
-- 1. FIX UNIQUE CONSTRAINTS (global → per-tenant)
-- ===================

-- Placa: remover UNIQUE global, criar UNIQUE por user_id
ALTER TABLE caminhoes DROP CONSTRAINT IF EXISTS caminhoes_placa_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_caminhoes_user_placa ON caminhoes(user_id, placa);

-- CPF: remover UNIQUE global, criar UNIQUE por user_id
ALTER TABLE motoristas DROP CONSTRAINT IF EXISTS motoristas_cpf_key;
CREATE UNIQUE INDEX IF NOT EXISTS idx_motoristas_user_cpf ON motoristas(user_id, cpf);

-- ===================
-- 2. COMPOSITE INDEXES (user_id + FK mais consultada)
-- ===================

-- Abastecimentos: queries por caminhão e motorista
CREATE INDEX IF NOT EXISTS idx_abastecimentos_user_caminhao ON abastecimentos(user_id, caminhao_id);
CREATE INDEX IF NOT EXISTS idx_abastecimentos_user_motorista ON abastecimentos(user_id, motorista_id);
CREATE INDEX IF NOT EXISTS idx_abastecimentos_caminhao ON abastecimentos(caminhao_id);

-- Manutenções: queries por caminhão
CREATE INDEX IF NOT EXISTS idx_manutencoes_user_caminhao ON manutencoes(user_id, caminhao_id);
CREATE INDEX IF NOT EXISTS idx_manutencoes_caminhao ON manutencoes(caminhao_id);

-- Viagens: queries por caminhão, cliente, fornecedor, status
CREATE INDEX IF NOT EXISTS idx_viagens_user_status ON viagens(user_id, status);
CREATE INDEX IF NOT EXISTS idx_viagens_user_caminhao ON viagens(user_id, caminhao_id);
CREATE INDEX IF NOT EXISTS idx_viagens_caminhao ON viagens(caminhao_id);
CREATE INDEX IF NOT EXISTS idx_viagens_cliente ON viagens(cliente_id);
CREATE INDEX IF NOT EXISTS idx_viagens_fornecedor ON viagens(fornecedor_id);
CREATE INDEX IF NOT EXISTS idx_viagens_motorista ON viagens(motorista_id);
CREATE INDEX IF NOT EXISTS idx_viagens_estoque ON viagens(estoque_id);

-- Estoque: queries por fornecedor
CREATE INDEX IF NOT EXISTS idx_estoque_user_fornecedor ON estoque(user_id, fornecedor_id);
CREATE INDEX IF NOT EXISTS idx_estoque_fornecedor ON estoque(fornecedor_id);

-- Estoque pagamentos e cheques: queries por estoque_id
CREATE INDEX IF NOT EXISTS idx_estoque_pagamentos_estoque ON estoque_pagamentos(estoque_id);
CREATE INDEX IF NOT EXISTS idx_estoque_pagamentos_user ON estoque_pagamentos(user_id);
CREATE INDEX IF NOT EXISTS idx_estoque_cheques_estoque ON estoque_cheques(estoque_id);
CREATE INDEX IF NOT EXISTS idx_estoque_cheques_user ON estoque_cheques(user_id);

-- Email verifications: lookup por email
CREATE INDEX IF NOT EXISTS idx_email_verifications_email ON email_verifications(email);

-- ===================
-- 3. CHECK CONSTRAINTS (validação no banco)
-- ===================

-- Viagens: status válido
ALTER TABLE viagens ADD CONSTRAINT chk_viagens_status
  CHECK (status IN ('cadastrada', 'finalizada'));

-- Viagens: forma de pagamento válida
ALTER TABLE viagens ADD CONSTRAINT chk_viagens_forma_pagamento
  CHECK (forma_pagamento IS NULL OR forma_pagamento IN ('dinheiro', 'pix', 'transferencia', 'boleto', 'cheque', 'cartao', 'a_prazo'));

-- Manutenções: tipo válido
ALTER TABLE manutencoes ADD CONSTRAINT chk_manutencoes_tipo
  CHECK (tipo_manutencao IN ('Preventiva', 'Corretiva', 'Pneus', 'Motor', 'Freios', 'Suspensão', 'Elétrica', 'Outros'));

-- Valores não negativos
ALTER TABLE abastecimentos ADD CONSTRAINT chk_abastecimentos_litros CHECK (litros >= 0);
ALTER TABLE abastecimentos ADD CONSTRAINT chk_abastecimentos_valor CHECK (valor_total >= 0);
ALTER TABLE manutencoes ADD CONSTRAINT chk_manutencoes_valor CHECK (valor_total >= 0);
ALTER TABLE viagens ADD CONSTRAINT chk_viagens_sacas CHECK (quantidade_sacas > 0);
ALTER TABLE estoque ADD CONSTRAINT chk_estoque_sacas CHECK (quantidade_sacas > 0);
ALTER TABLE caminhoes ADD CONSTRAINT chk_caminhoes_km CHECK (km_atual >= 0);

-- ===================
-- 4. CLEANUP: remover tokens/códigos expirados
-- ===================

DELETE FROM user_sessions WHERE expires_at < NOW();
DELETE FROM email_verifications WHERE expires_at < NOW();
