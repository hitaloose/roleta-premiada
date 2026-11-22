@echo off
setlocal

set "PORT=4173"
set "URL=http://localhost:%PORT%"

cd /d "%~dp0"

echo ============================================
echo   Roleta Premiada - Build e Start do Evento
echo ============================================
echo.
echo Tema, itens da roleta e CPF: Ctrl+Shift+K na tela inicial (PIN da equipe).
echo.
echo IMPORTANTE: feche todas as janelas do Chrome
echo antes de continuar, senao o modo kiosk pode
echo nao abrir corretamente (o Chrome reaproveita
echo a janela ja aberta).
echo.
pause

echo.
echo [1/3] Instalando dependencias...
call npm install
if errorlevel 1 (
  echo.
  echo ERRO ao instalar dependencias. Abortando.
  pause
  exit /b 1
)

echo.
echo [2/3] Buildando o projeto...
call npm run build
if errorlevel 1 (
  echo.
  echo ERRO no build. Abortando.
  pause
  exit /b 1
)

echo.
echo [3/3] Iniciando servidor local em %URL% ...
start "Roleta Premiada - Servidor (nao feche esta janela)" cmd /k npm run preview

echo Aguardando o servidor subir...
timeout /t 5 /nobreak >nul

echo Procurando o Chrome instalado...
set "CHROME="
if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set "CHROME=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not defined CHROME if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" set "CHROME=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if not defined CHROME if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" set "CHROME=%LocalAppData%\Google\Chrome\Application\chrome.exe"

if not defined CHROME (
  echo.
  echo Nao encontrei o Chrome nos caminhos padrao.
  echo Abra o Chrome manualmente em modo kiosk apontando para %URL%
  pause
  exit /b 1
)

echo Abrindo o Chrome em modo kiosk (perfil padrao)...
start "" "%CHROME%" --kiosk "%URL%" --no-first-run --disable-session-crashed-bubble --noerrdialogs

endlocal
