@echo off
setlocal enabledelayedexpansion
title FuelTrack - Iniciando
cd /d "%~dp0"

echo ============================================
echo    FuelTrack - Sistema de Gestao de Frotas
echo ============================================
echo.

REM --- 1. Verifica se o Node.js esta instalado ---
where node >nul 2>nul
if errorlevel 1 (
  echo [ERRO] O Node.js nao esta instalado nesta maquina.
  echo.
  echo Baixe e instale em: https://nodejs.org  ^(botao "LTS"^)
  echo Depois de instalar, feche e abra este atalho de novo.
  echo.
  pause
  exit /b
)

REM --- 2. Primeira configuracao: cria o backend\.env se nao existir ---
if not exist "backend\.env" goto CONFIGURAR
goto INSTALAR

:CONFIGURAR
echo Parece que e a primeira vez. Vamos configurar o acesso ao banco.
echo ^(Voce pega esses valores no supabase.com -^> seu projeto -^> Settings -^> API^)
echo.
set /p SUPAURL="Cole a URL do projeto (https://xxxx.supabase.co): "
set /p SUPAPUB="Cole a publishable key (sb_publishable_...): "
set /p SUPASECRET="Cole a secret key (sb_secret_...): "
(
  echo SUPABASE_URL=!SUPAURL!
  echo SUPABASE_KEY=!SUPAPUB!
  echo SUPABASE_SERVICE_KEY=!SUPASECRET!
  echo JWT_SECRET=fueltrack-local-chave-fixa-troque-se-quiser-9f83ac21
  echo PORT=3001
) > "backend\.env"
echo.
echo Configuracao salva! Isso so acontece uma vez.
echo.

:INSTALAR
REM --- 3. Cria o frontend\.env (sem segredo) se nao existir ---
if not exist "frontend\.env" (
  echo VITE_API_URL=http://localhost:3001> "frontend\.env"
)

REM --- 4. Instala dependencias na primeira execucao ---
if not exist "backend\node_modules" (
  echo Instalando componentes do servidor... ^(so na primeira vez, pode demorar alguns minutos^)
  pushd backend
  call npm install
  popd
)
if not exist "frontend\node_modules" (
  echo Instalando componentes da tela... ^(so na primeira vez^)
  pushd frontend
  call npm install
  popd
)

REM --- 5. Liga o servidor e a tela em janelas separadas ---
echo.
echo Iniciando o sistema...
start "FuelTrack API" cmd /k "cd /d "%~dp0backend" && npm start"
start "FuelTrack Web" cmd /k "cd /d "%~dp0frontend" && npm run dev"

REM --- 6. Espera subir e abre o navegador ---
echo Aguardando o sistema ficar pronto...
timeout /t 8 /nobreak >nul
start "" http://localhost:5173

echo.
echo ============================================
echo  Pronto! O sistema abriu no seu navegador:
echo     http://localhost:5173
echo.
echo  Para DESLIGAR: feche as duas janelas pretas
echo  ^("FuelTrack API" e "FuelTrack Web"^) ou rode parar.bat
echo ============================================
echo.
pause
