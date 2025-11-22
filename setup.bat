@echo off
REM Kuberns Full Stack - Quick Start Script for Windows

setlocal enabledelayedexpansion

echo.
echo ========================================
echo   Kuberns Full Stack Setup
echo ========================================
echo.

REM Check for Python
python --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo [ERROR] Python not found. Please install Python 3.8 or higher.
    pause
    exit /b 1
)

REM Check for Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo [ERROR] Node.js not found. Please install Node.js 16 or higher.
    pause
    exit /b 1
)

REM Check for PostgreSQL
psql --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo [WARNING] PostgreSQL not found. Please install PostgreSQL 12 or higher.
    echo.
)

REM Check for Redis
redis-cli --version >nul 2>&1
if errorlevel 1 (
    echo.
    echo [WARNING] Redis not found. Please install Redis 6 or higher.
    echo.
)

REM Backend Setup
echo.
echo [*] Setting up Backend...
cd backend

REM Create virtual environment
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing Python dependencies...
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt

REM Run migrations
echo Running database migrations...
python manage.py migrate

echo.
echo [OK] Backend setup complete!
echo.

REM Frontend Setup
echo [*] Setting up Frontend...
cd ..\frontend

REM Install dependencies
if not exist "node_modules" (
    echo Installing Node dependencies...
    call npm install
)

echo.
echo [OK] Frontend setup complete!
echo.

REM Success message
echo.
echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo To start the project, open 4 terminals:
echo.
echo Terminal 1 (Backend):
echo   cd backend
echo   venv\Scripts\activate.bat
echo   python manage.py runserver 0.0.0.0:8000
echo.
echo Terminal 2 (Celery):
echo   cd backend
echo   venv\Scripts\activate.bat
echo   celery -A kuberns worker -l info
echo.
echo Terminal 3 (Frontend):
echo   cd frontend
echo   npm run dev
echo.
echo Terminal 4 (Redis):
echo   redis-server
echo.
echo Access the application:
echo   Frontend: http://localhost:5173
echo   API: http://localhost:8000/api
echo   Swagger: http://localhost:8000/api/docs/
echo   Admin: http://localhost:8000/admin
echo.
echo ========================================
echo.

pause
