-- Add latitude/longitude to clientes and fornecedores for pin-based location
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE clientes ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

ALTER TABLE fornecedores ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE fornecedores ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Add route metadata to viagens (real distance/duration from OSRM)
ALTER TABLE viagens ADD COLUMN IF NOT EXISTS rota_distancia_km DOUBLE PRECISION;
ALTER TABLE viagens ADD COLUMN IF NOT EXISTS rota_duracao_min INTEGER;
-- Store encoded route polyline for caching (avoids re-fetching from OSRM)
ALTER TABLE viagens ADD COLUMN IF NOT EXISTS rota_polyline TEXT;
