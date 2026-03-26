@echo off
echo Stopping any broken global Anaconda servers...
taskkill /F /IM uvicorn.exe /T 2>nul
taskkill /F /IM python.exe /FI "WINDOWTITLE eq uvicorn" 2>nul

echo.
echo Starting the CORRECT Virtual Environment Server...
.\venv\Scripts\uvicorn.exe src.main:app --reload --host 127.0.0.1 --port 8000
pause
