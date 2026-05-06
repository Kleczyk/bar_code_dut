@echo off
cd /d "%~dp0"
if exist "dist\GeneratorIdentyfikatorow.exe" (
    start "" "dist\GeneratorIdentyfikatorow.exe"
) else (
    echo Najpierw uruchom build.bat
    pause
)
