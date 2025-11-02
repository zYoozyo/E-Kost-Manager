@echo off
title E-Kost Manager - Backend Server
color 0A

cls
echo.
echo ================================================
echo    E-KOST MANAGER - BACKEND SERVER
echo ================================================
echo.

REM Navigate to backend folder
cd /d "%~dp0"

echo [1] Checking artisan file...
if not exist "artisan" (
    echo ERROR: artisan not found in %CD%
    echo.
    pause
    exit
)
echo OK: artisan found!
echo.

echo [2] Running migrations...
call php artisan migrate --force
echo.

echo [3] Starting server on PORT 8080...
echo.
echo ================================================
echo    SERVER: http://localhost:8080
echo    API:    http://localhost:8080/api
echo ================================================
echo.
echo Frontend harus connect ke:
echo VITE_API_URL=http://localhost:8080/api
echo.
echo Press Ctrl+C to stop
echo ================================================
echo.

php artisan serve --port=8080

pause


