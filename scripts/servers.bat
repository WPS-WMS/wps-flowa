@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0.."
set "ROOT=%cd%"
set "BACKEND=%ROOT%\backend"
set "FRONTEND=%ROOT%\frontend"

if "%1"=="start" goto start
if "%1"=="stop" goto stop
if "%1"=="restart" goto restart

echo Uso: servers.bat [start^|stop^|restart]
echo.
echo   start   - Inicia backend e frontend em janelas separadas
echo   stop    - Encerra backend e frontend
echo   restart - Encerra e inicia novamente
goto end

:start
echo Iniciando backend e frontend...
echo.
start "Backend - 4000" cmd /k "cd /d "%BACKEND%" && (npm run dev || echo. && echo Backend encerrou com erro. Pressione uma tecla. && pause)"
start "Frontend - 3000" cmd /k "cd /d "%FRONTEND%" && (npm run dev || echo. && echo Frontend encerrou com erro. Pressione uma tecla. && pause)"
echo.
echo   Backend:  http://127.0.0.1:4000
echo   Frontend: http://localhost:3000
echo.
echo Duas janelas foram abertas. Feche-as para encerrar os servidores.
goto end

:stop
echo Encerrando servidores...
rem LISTENING (EN) e ESCUTANDO (PT) para funcionar em qualquer idioma do Windows
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":4000" ^| findstr /I "LISTENING ESCUTANDO"') do (taskkill /F /PID %%a 2>nul)
for /f "tokens=5" %%a in ('netstat -ano 2^>nul ^| findstr ":3000" ^| findstr /I "LISTENING ESCUTANDO"') do (taskkill /F /PID %%a 2>nul)
echo Concluido.
goto end

:restart
call :stop
timeout /t 3 /nobreak >nul
call :start
goto end

:end
endlocal
