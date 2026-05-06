@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo ============================================
echo  Generator identyfikatorow - Budowanie EXE
echo ============================================
echo.

:: ---- Sprawdzenie wymaganych narzedzi ----

echo [0/5] Sprawdzanie wymaganych narzedzi...

where python >nul 2>&1
if errorlevel 1 (
    echo BLAD: Python nie jest zainstalowany lub nie jest w PATH.
    echo Pobierz z: https://www.python.org/downloads/
    echo Podczas instalacji zaznacz "Add Python to PATH".
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('python --version 2^>^&1') do set PYVER=%%v
echo   Python: %PYVER%

where node >nul 2>&1
if errorlevel 1 (
    echo BLAD: Node.js nie jest zainstalowany lub nie jest w PATH.
    echo Pobierz z: https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%v in ('node --version 2^>^&1') do set NODEVER=%%v
echo   Node.js: %NODEVER%

where npm >nul 2>&1
if errorlevel 1 (
    echo BLAD: npm nie jest dostepny.
    pause
    exit /b 1
)
echo   npm: OK
echo.

:: ---- Instalacja zaleznosci Python ----

echo [1/5] Instalacja zaleznosci Python...
pip install -r requirements.txt --quiet
if errorlevel 1 (
    echo BLAD: pip install nie powiodl sie.
    echo Sprobuj: pip install -r requirements.txt
    pause
    exit /b 1
)

pip install pyinstaller --quiet
if errorlevel 1 (
    echo BLAD: Instalacja PyInstaller nie powiodla sie.
    pause
    exit /b 1
)
echo   Zaleznosci Python: OK
echo.

:: ---- Instalacja i budowanie frontendu ----

echo [2/5] Instalacja zaleznosci frontendu...
cd "..\app\frontend"
call npm install --silent
if errorlevel 1 (
    echo BLAD: npm install nie powiodl sie.
    pause
    exit /b 1
)
echo   npm install: OK
echo.

echo [3/5] Budowanie frontendu (npm run build)...
call npm run build
if errorlevel 1 (
    echo BLAD: npm run build nie powiodl sie.
    pause
    exit /b 1
)
echo   Frontend: OK
echo.
cd "..\..\packaging"

:: ---- Budowanie EXE ----

echo [4/5] Budowanie EXE (PyInstaller)...
pyinstaller --noconfirm pyinstaller.spec
if errorlevel 1 (
    echo BLAD: PyInstaller nie powiodl sie.
    pause
    exit /b 1
)
echo   PyInstaller: OK
echo.

:: ---- Kopiowanie do folderu release ----

echo [5/5] Przygotowanie folderu release...
if not exist "release" mkdir "release"
if exist "dist\GeneratorIdentyfikatorow.exe" (
    copy /y "dist\GeneratorIdentyfikatorow.exe" "release\GeneratorIdentyfikatorow.exe" >nul
) else (
    echo UWAGA: Plik EXE nie zostal znaleziony w dist\
    pause
    exit /b 1
)

echo.
echo ============================================
echo  GOTOWE!
echo ============================================
echo.
echo  EXE: %cd%\release\GeneratorIdentyfikatorow.exe
echo.
echo  Skopiuj ten plik na pendrive i uruchom
echo  na dowolnym komputerze z Windows.
echo.
echo  Rozmiar:
for %%A in ("release\GeneratorIdentyfikatorow.exe") do echo   %%~zA bajtow (%%~zA bytes)
echo.
pause
