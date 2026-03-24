@echo off
echo Starting Innovative AI Project...
echo.

echo Starting Backend Server...
start "Backend" cmd /k "cd /d Backend && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
start "Frontend" cmd /k "cd /d Frontend && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:4001
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit...
pause >nul