-- RBAC: role admin/motorista
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('admin', 'motorista'));
-- owner_id: o admin que criou a conta do motorista (multi-tenant)
ALTER TABLE users ADD COLUMN IF NOT EXISTS owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE;
-- motorista_id: vincula o user motorista ao registro de motorista
ALTER TABLE users ADD COLUMN IF NOT EXISTS motorista_id INTEGER REFERENCES motoristas(id) ON DELETE SET NULL;
