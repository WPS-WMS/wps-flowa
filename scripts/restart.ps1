# Encerra e reinicia backend e frontend
$ErrorActionPreference = "Stop"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Reiniciando servidores (stop + start)..." -ForegroundColor Cyan
& (Join-Path $scriptDir "stop.ps1")
Start-Sleep -Seconds 2
& (Join-Path $scriptDir "start.ps1")
