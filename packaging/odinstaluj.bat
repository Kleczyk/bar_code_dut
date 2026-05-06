@echo off
chcp 65001 >nul 2>&1
setlocal enabledelayedexpansion

echo ============================================
echo  Generator identyfikatorow - Odinstalowanie
echo ============================================
echo.
echo Ten skrypt usunie wszystkie slady aplikacji
echo z tego komputera.
echo.
echo Co zostanie usuniete:
echo   1. Pliki tymczasowe PyInstaller (_MEI...)
echo   2. Pliki tymczasowe aplikacji (tmp*.png/jpg/svg)
echo   3. Plik EXE (GeneratorIdentyfikatorow.exe)
echo   4. Ten skrypt (odinstaluj.bat)
echo.
echo Dane w przegladarce (localStorage) musisz
echo usunac recznie:
echo   - Otworz przegladarke
echo   - Wejdz na http://127.0.0.1:8000
echo   - F12 ^> Application ^> Local Storage ^> Clear
echo.

set /p CONFIRM="Czy kontynuowac? (T/N): "
if /i not "%CONFIRM%"=="T" (
    echo Anulowano.
    pause
    exit /b 0
)

echo.

:: ---- 1. Pliki tymczasowe PyInstaller ----

echo [1/4] Czyszczenie plikow tymczasowych PyInstaller...
set COUNT=0
for /d %%D in ("%TEMP%\_MEI*") do (
    echo   Usuwanie: %%D
    rmdir /s /q "%%D" 2>nul
    set /a COUNT+=1
)
if %COUNT%==0 (
    echo   Brak plikow _MEI do usuniecia.
) else (
    echo   Usunieto %COUNT% katalogow _MEI.
)
echo.

:: ---- 2. Pliki tymczasowe aplikacji ----

echo [2/4] Czyszczenie plikow tymczasowych aplikacji...
set COUNT=0
for %%E in (png jpg jpeg svg) do (
    for %%F in ("%TEMP%\tmp*.%%E") do (
        if exist "%%F" (
            echo   Usuwanie: %%F
            del /f /q "%%F" 2>nul
            set /a COUNT+=1
        )
    )
)
if %COUNT%==0 (
    echo   Brak plikow tymczasowych do usuniecia.
) else (
    echo   Usunieto %COUNT% plikow tymczasowych.
)
echo.

:: ---- 3. Plik EXE ----

echo [3/4] Usuwanie pliku EXE...
set SCRIPT_DIR=%~dp0
set EXE_PATH=%SCRIPT_DIR%GeneratorIdentyfikatorow.exe
if exist "%EXE_PATH%" (
    del /f /q "%EXE_PATH%"
    echo   Usunieto: %EXE_PATH%
) else (
    echo   Plik EXE nie znaleziony w: %SCRIPT_DIR%
    echo   Jesli EXE jest w innym miejscu, usun go recznie.
)
echo.

:: ---- 4. Usun ten skrypt ----

echo [4/4] Usuwanie skryptu odinstalowania...
echo.
echo ============================================
echo  GOTOWE - aplikacja zostala odinstalowana
echo ============================================
echo.
echo Pamietaj o wyczyszczeniu localStorage w przegladarce
echo jesli korzystales z zapisu projektow.
echo.
pause

:: Samousuwanie skryptu
(goto) 2>nul & del "%~f0"
