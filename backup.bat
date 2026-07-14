@echo off
title FuelTrack - Backup dos dados
cd /d "%~dp0"

echo ============================================
echo    FuelTrack - Backup dos seus dados
echo ============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERRO] Node.js nao instalado. Baixe em https://nodejs.org
  pause
  exit /b
)

if not exist "backend\.env" (
  echo [ERRO] Configure o sistema primeiro rodando o iniciar.bat uma vez.
  pause
  exit /b
)

if not exist "backend\node_modules" (
  echo Instalando componentes... ^(so na primeira vez^)
  pushd backend
  call npm install
  popd
)

cd backend
node scripts/backup.js

echo.
echo Seus dados foram salvos na pasta "backups" dentro do projeto.
echo Dica: copie essa pasta para um pen-drive ou Google Drive de vez em quando.
echo.
pause
