#!/bin/bash
# ============================================================
# FrotaPro - Script de Deploy para VPS Ubuntu 24.04
# Uso: bash deploy.sh
# ============================================================

set -e  # Para em caso de erro

echo "======================================"
echo "  FrotaPro - Deploy na VPS"
echo "======================================"

# --- 1. Atualizar sistema ---
echo "[1/8] Atualizando sistema..."
apt update && apt upgrade -y

# --- 2. Instalar Node.js 22 ---
echo "[2/8] Instalando Node.js 22..."
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs
node -v && npm -v

# --- 3. Instalar PM2 e Nginx ---
echo "[3/8] Instalando PM2 e Nginx..."
npm install -g pm2
apt install -y nginx
pm2 -v

# --- 4. Clonar repositório ---
echo "[4/8] Clonando repositório..."
rm -rf /var/www/gestao-frotas
git clone https://github.com/RobertoSoutoJr/gestao-frotas.git /var/www/gestao-frotas
cd /var/www/gestao-frotas

# --- 5. Configurar Backend ---
echo "[5/8] Configurando Backend..."
cd /var/www/gestao-frotas/backend
npm install

# Criar .env do backend
# ATENÇÃO: preencha as variáveis com seus valores reais do Supabase
cat > .env << 'EOF'
SUPABASE_URL=COLOQUE_SUA_SUPABASE_URL
SUPABASE_KEY=COLOQUE_SUA_SUPABASE_KEY
SUPABASE_SERVICE_KEY=COLOQUE_SUA_SUPABASE_SERVICE_KEY
DATABASE_PASSWORD=COLOQUE_SUA_DATABASE_PASSWORD
PORT=3001
NODE_ENV=production
FRONTEND_URL=http://187.77.227.94
EOF

echo ""
echo "⚠️  IMPORTANTE: edite o arquivo .env antes de continuar!"
echo "   nano /var/www/gestao-frotas/backend/.env"
echo ""
read -p "Pressione ENTER após editar o .env para continuar..."

echo "Backend .env configurado."

# --- 6. Build do Frontend ---
echo "[6/8] Fazendo build do Frontend..."
cd /var/www/gestao-frotas/frontend
npm install
npm run build
echo "Frontend build concluído em frontend/dist/"

# --- 7. Configurar Nginx ---
echo "[7/8] Configurando Nginx..."
cp /var/www/gestao-frotas/nginx/frotapro.conf /etc/nginx/sites-available/frotapro
ln -sf /etc/nginx/sites-available/frotapro /etc/nginx/sites-enabled/frotapro
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
systemctl enable nginx

# --- 8. Iniciar Backend com PM2 ---
echo "[8/8] Iniciando Backend com PM2..."
cd /var/www/gestao-frotas
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup systemd -u root --hp /root | tail -1 | bash

echo ""
echo "======================================"
echo "  Deploy concluído com sucesso!"
echo "  Acesse: http://187.77.227.94"
echo "======================================"
