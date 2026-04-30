@echo off
echo ==============================================
echo Customer Email AI - Single Project Runner
echo ==============================================
echo The frontend has been integrated into the backend.
echo Starting the application on http://localhost:5000...
echo.

cd backend

:: Try to activate venv if it exists
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
) else if exist ..\.venv\Scripts\activate.bat (
    call ..\.venv\Scripts\activate.bat
)

:: Run the Flask server
python app.py
pause
