-- =====================================================
-- Migration 009: Viagem Custos - Itemized Trip Costs
-- =====================================================

CREATE TABLE IF NOT EXISTS viagem_custos (
  id SERIAL PRIMARY KEY,
  viagem_id INTEGER NOT NULL REFERENCES viagens(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id),
  tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('combustivel', 'pedagio', 'manutencao', 'alimentacao', 'hospedagem', 'multa', 'outros')),
  descricao VARCHAR(255),
  valor NUMERIC NOT NULL CHECK (valor > 0),
  data DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_viagem_custos_viagem_id ON viagem_custos(viagem_id);
CREATE INDEX idx_viagem_custos_user_id ON viagem_custos(user_id);

ALTER TABLE viagem_custos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "viagem_custos_user_policy" ON viagem_custos
  FOR ALL USING (
    user_id IN (
      SELECT id FROM users WHERE id = user_id
      UNION
      SELECT id FROM users WHERE owner_id = user_id
    )
  );

CREATE POLICY "viagem_custos_service_role" ON viagem_custos
  FOR ALL TO service_role USING (true) WITH CHECK (true);
