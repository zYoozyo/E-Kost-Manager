@echo off
title Laravel Backend - Fixed Port
color 0E

echo ================================================
echo    FIX: Port 8000 already in use
echo ================================================
echo.

cd /d "%~dp0"

echo Trying port 8080...
php artisan serve --port=8080

if errorlevel 1 (
    echo.
    echo Port 8080 also in use. Trying port 8081...
    php artisan serve --port=8081
)

pause


