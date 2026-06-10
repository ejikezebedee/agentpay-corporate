@echo off
setlocal
cd /d "%~dp0"
"C:\Program Files\nodejs\node.exe" preview-server.mjs > preview-server.log 2>&1
