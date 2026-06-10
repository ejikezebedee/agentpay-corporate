@echo off
setlocal
cd /d "%~dp0"
"C:\Program Files\nodejs\node.exe" src\server.js > backend-service.log 2>&1
