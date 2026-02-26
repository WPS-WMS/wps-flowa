# Inicia backend e frontend em janelas separadas (em paralelo, sem espera)
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$backendDir = Join-Path $root "backend"
$frontendDir = Join-Path $root "frontend"

Write-Host "Iniciando backend e frontend..." -ForegroundColor Green
Write-Host "  Backend:  http://127.0.0.1:4000" -ForegroundColor Cyan
Write-Host "  Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""

Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backendDir'; npm run dev" -WindowStyle Normal
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$frontendDir'; npm run dev" -WindowStyle Normal

Write-Host "Duas janelas abertas. Feche-as para encerrar os servidores." -ForegroundColor Yellow
