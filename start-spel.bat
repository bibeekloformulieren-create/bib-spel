@echo off
rem Start het spel op je eigen computer en opent het in je browser.
rem Het zwarte/blauwe venster dat opent is de server: laat het open zolang je het spel gebruikt, sluit het daarna.
start "Spel-server (laat open)" powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0game\lokale-server.ps1"
timeout /t 2 /nobreak >nul
start "" http://localhost:8765/
