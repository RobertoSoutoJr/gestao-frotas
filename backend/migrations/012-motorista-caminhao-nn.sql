-- Relação N:N entre motoristas e caminhões
-- Substitui o campo caminhao_id direto na tabela motoristas

CREATE TABLE IF NOT EXISTS motorista_caminhao (
  id SERIAL PRIMARY KEY,
  motorista_id INTEGER NOT NULL REFERENCES motoristas(id) ON DELETE CASCADE,
  caminhao_id INTEGER NOT NULL REFERENCES caminhoes(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(motorista_id, caminhao_id)
);

CREATE INDEX IF NOT EXISTS idx_mc_motorista ON motorista_caminhao(motorista_id);
CREATE INDEX IF NOT EXISTS idx_mc_caminhao ON motorista_caminhao(caminhao_id);
CREATE INDEX IF NOT EXISTS idx_mc_user ON motorista_caminhao(user_id);

-- Migrar dados existentes do campo caminhao_id para a nova tabela
INSERT INTO motorista_caminhao (motorista_id, caminhao_id, user_id)
SELECT m.id, m.caminhao_id, m.user_id
FROM motoristas m
WHERE m.caminhao_id IS NOT NULL
  AND m.deleted_at IS NULL
ON CONFLICT DO NOTHING;

-- Enable RLS
ALTER TABLE motorista_caminhao ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY motorista_caminhao_select ON motorista_caminhao FOR SELECT USING (true);
CREATE POLICY motorista_caminhao_insert ON motorista_caminhao FOR INSERT WITH CHECK (true);
CREATE POLICY motorista_caminhao_delete ON motorista_caminhao FOR DELETE USING (true);
