@echo off
echo Het spel start. Sluit dit venster om te stoppen.
start "" /min powershell -NoProfile -Command "Start-Sleep 2; Start-Process 'http://localhost:8765/game/index.html?laag=50-jaar&test'"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0game\lokale-server.ps1"
