#!/bin/bash

# Kuberns Full Stack - Quick Start Script
# This script sets up the entire project for local development

set -e

echo "🚀 Starting Kuberns Full Stack Setup..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
echo -e "${BLUE}📋 Checking prerequisites...${NC}"

if ! command -v python3 &> /dev/null; then
    echo -e "${YELLOW}⚠️  Python 3 not found. Please install Python 3.8 or higher.${NC}"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠️  Node.js not found. Please install Node.js 16 or higher.${NC}"
    exit 1
fi

if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️  PostgreSQL not found. Please install PostgreSQL 12 or higher.${NC}"
    exit 1
fi

if ! command -v redis-cli &> /dev/null; then
    echo -e "${YELLOW}⚠️  Redis not found. Please install Redis 6 or higher.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All prerequisites found!${NC}\n"

# Backend Setup
echo -e "${BLUE}🔧 Setting up Backend...${NC}"

cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip setuptools wheel
pip install -r requirements.txt

# Run migrations
echo "Running database migrations..."
python manage.py migrate

echo -e "${GREEN}✅ Backend setup complete!${NC}\n"

# Frontend Setup
echo -e "${BLUE}🎨 Setting up Frontend...${NC}"

cd ../frontend

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing Node dependencies..."
    npm install
fi

echo -e "${GREEN}✅ Frontend setup complete!${NC}\n"

# Success message
echo -e "${GREEN}✅ All setup complete!${NC}\n"

echo -e "${BLUE}📚 To start the project:${NC}"
echo ""
echo -e "${YELLOW}Terminal 1 (Backend):${NC}"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  python manage.py runserver 0.0.0.0:8000"
echo ""
echo -e "${YELLOW}Terminal 2 (Celery):${NC}"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  celery -A kuberns worker -l info"
echo ""
echo -e "${YELLOW}Terminal 3 (Frontend):${NC}"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo -e "${YELLOW}Terminal 4 (Redis - if not running as service):${NC}"
echo "  redis-server"
echo ""
echo -e "${BLUE}🌐 Access the application:${NC}"
echo "  Frontend: http://localhost:5173"
echo "  API: http://localhost:8000/api"
echo "  Swagger Docs: http://localhost:8000/api/docs/"
echo "  Admin Panel: http://localhost:8000/admin"
echo ""
