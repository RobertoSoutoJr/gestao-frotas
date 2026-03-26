-- Tabela de documentos com vinculo a qualquer entidade
CREATE TABLE IF NOT EXISTS documentos (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entidade_tipo VARCHAR(20) NOT NULL CHECK (entidade_tipo IN ('caminhao', 'motorista', 'manutencao', 'viagem', 'estoque')),
  entidade_id INTEGER NOT NULL,
  tipo_documento VARCHAR(50) NOT NULL,
  nome_original VARCHAR(255) NOT NULL,
  arquivo_url TEXT NOT NULL,
  arquivo_path TEXT NOT NULL,
  tamanho_bytes INTEGER,
  mime_type VARCHAR(100),
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documentos_user ON documentos(user_id);
CREATE INDEX IF NOT EXISTS idx_documentos_entidade ON documentos(entidade_tipo, entidade_id);

-- Bucket publico no Supabase Storage
INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos', 'documentos', true)
ON CONFLICT (id) DO NOTHING;
