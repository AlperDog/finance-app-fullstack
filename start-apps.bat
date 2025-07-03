@echo off
REM Uygulamaları başlat
start cmd /k "npm start"

REM Frontend portunu aç
start http://localhost:5173

REM Backend portunu aç
start http://localhost:3000 