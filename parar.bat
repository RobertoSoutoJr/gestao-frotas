@echo off
title FuelTrack - Desligando
echo Desligando o FuelTrack...
taskkill /FI "WINDOWTITLE eq FuelTrack API*" /T /F >nul 2>nul
taskkill /FI "WINDOWTITLE eq FuelTrack Web*" /T /F >nul 2>nul
echo Pronto. Sistema desligado.
timeout /t 2 /nobreak >nul
