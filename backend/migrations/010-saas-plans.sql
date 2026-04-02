-- =====================================================
-- Migration 010: SaaS Plans
-- =====================================================

-- Plano do usuário (free é o padrão)
ALTER TABLE users ADD COLUMN IF NOT EXISTS plano VARCHAR(20) DEFAULT 'free' CHECK (plano IN ('free', 'pro', 'enterprise'));

-- Data de início do plano (para controle de período)
ALTER TABLE users ADD COLUMN IF NOT EXISTS plano_inicio TIMESTAMP WITH TIME ZONE DEFAULT NOW();
