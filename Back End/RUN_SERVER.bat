@echo off
title Laravel Backend Server - E-Kost Manager
color 0A

echo ================================================
echo    STARTING LARAVEL BACKEND SERVER
echo ================================================
echo.

REM Navigate to the correct directory
cd /d "%~dp0"
echo Current directory: %CD%
echo.

REM Check if artisan exists
if not exist "artisan" (
    echo ERROR: artisan file not found!
    echo Please make sure you're in the correct directory.
    echo Current directory: %CD%
    echo.
    pause
    exit /b 1
)

echo Found artisan file. Starting server...
echo.

REM Run migrations first
echo [1/2] Running migrations...
call php artisan migrate --force
if errorlevel 1 (
    echo.
    echo WARNING: Migration failed. Continuing anyway...
    echo.
)
echo.

REM Start the server
echo [2/2] Starting server on port 8080...
echo.
echo ================================================
echo    Server running at: http://localhost:8080
echo    API endpoint: http://localhost:8080/api
echo ================================================
echo.
echo Press Ctrl+C to stop the server
echo.

call php artisan serve --port=8080


