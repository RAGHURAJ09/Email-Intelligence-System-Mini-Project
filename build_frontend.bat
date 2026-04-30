@echo off
echo ==============================================
echo Customer Email AI - Frontend Builder
echo ==============================================
echo Building the frontend to be served by the backend...
echo.

cd frontend
call npm install
call npm run build

echo.
echo ==============================================
echo Build complete! The frontend is now updated.
echo You can run the project using run_app.bat
echo ==============================================
pause
