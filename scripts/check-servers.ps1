# Script para verificar status do backend e frontend

$ErrorActionPreference = 'Continue'

Write-Host '=== Verificando Status dos Servidores ===' -ForegroundColor Cyan
Write-Host ''

# Backend (porta 4000)
$backendRunning = $false
try {
  $resp = Invoke-WebRequest -Uri 'http://127.0.0.1:4000/health' -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
  if ($resp.StatusCode -eq 200) {
    Write-Host '[OK] Backend esta rodando na porta 4000' -ForegroundColor Green
    $backendRunning = $true
  } else {
    Write-Host ('[ERRO] Backend respondeu status ' + $resp.StatusCode) -ForegroundColor Red
  }
} catch {
  Write-Host '[ERRO] Backend NAO esta rodando na porta 4000' -ForegroundColor Red
  Write-Host ('  Erro: ' + $_.Exception.Message) -ForegroundColor Yellow
}

# Frontend (porta 3000)
$frontendRunning = $false
try {
  $resp = Invoke-WebRequest -Uri 'http://localhost:3000' -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
  if ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 400) {
    Write-Host '[OK] Frontend esta rodando na porta 3000' -ForegroundColor Green
    $frontendRunning = $true
  } else {
    Write-Host ('[ERRO] Frontend respondeu status ' + $resp.StatusCode) -ForegroundColor Red
  }
} catch {
  Write-Host '[ERRO] Frontend NAO esta rodando na porta 3000' -ForegroundColor Red
  Write-Host ('  Erro: ' + $_.Exception.Message) -ForegroundColor Yellow
}

Write-Host ''
Write-Host '=== Resumo ===' -ForegroundColor Cyan
if ($backendRunning -and $frontendRunning) {
  Write-Host '[OK] Ambos os servidores estao rodando' -ForegroundColor Green
  Write-Host ''
  Write-Host 'Acesse: http://localhost:3000' -ForegroundColor Cyan
} else {
  Write-Host '[ATENCAO] Alguns servidores nao estao rodando' -ForegroundColor Yellow
  Write-Host ''
  Write-Host 'Para iniciar os servidores, execute:' -ForegroundColor Yellow
  Write-Host '  npm run servers:start' -ForegroundColor White
  Write-Host 'ou' -ForegroundColor White
  Write-Host '  npm run servers:start:ps1' -ForegroundColor White
}
