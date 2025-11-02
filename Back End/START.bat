@echo off
echo Starting Laravel Backend...
echo.
echo IMPORTANT: Make sure Laragon is running!
echo.
echo Running migrations...
php artisan migrate
echo.
echo Starting server on port 8080...
php artisan serve --port=8080
pause

