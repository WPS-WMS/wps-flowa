# Encerra backend (porta 4000) e frontend (porta 3000)
Write-Host "Encerrando servidores..." -ForegroundColor Yellow

$ports = @(4000, 3000)
foreach ($port in $ports) {
    $conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($conn) {
        $pids = $conn | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($pid in $pids) {
            try {
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                Write-Host "  Porta $port`: processo $pid encerrado" -ForegroundColor Green
            } catch {
                Write-Host "  Porta $port`: nao foi possivel encerrar" -ForegroundColor Red
            }
        }
    } else {
        Write-Host "  Porta $port`: nenhum processo encontrado" -ForegroundColor Gray
    }
}

Write-Host "Concluido." -ForegroundColor Green
