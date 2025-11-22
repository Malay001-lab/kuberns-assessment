# Quick Reference Guide

## 🚀 Quick Start (Choose One)

### Option 1: Automated Setup

```bash
# macOS/Linux
chmod +x setup.sh && ./setup.sh

# Windows
setup.bat
```

### Option 2: Manual Setup

See `DEPLOYMENT_GUIDE.md` for detailed instructions

---

## 📋 Prerequisites

- Python 3.8+
- Node.js 16+
- PostgreSQL 12+
- Redis 6+

---

## ▶️ Running the Application

### Terminal 1: Backend

```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python manage.py runserver 0.0.0.0:8000
```

### Terminal 2: Celery

```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
celery -A kuberns worker -l info
```

### Terminal 3: Frontend

```bash
cd frontend
npm run dev
```

### Terminal 4: Redis

```bash
redis-server
```

---

## 🌐 Access Points

| Component | URL                             |
| --------- | ------------------------------- |
| Frontend  | http://localhost:5173           |
| API       | http://localhost:8000/api       |
| Docs      | http://localhost:8000/api/docs/ |
| Admin     | http://localhost:8000/admin     |

---

## 📁 Project Structure

```
kuberns-fullstack-assessment/
├── backend/                    # Django backend
│   ├── kuberns/               # Project config
│   ├── apps/core/             # Main app
│   ├── manage.py              # Django CLI
│   ├── requirements.txt        # Python packages
│   └── .env                   # Environment vars
│
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── store/             # Zustand state
│   │   ├── api/               # API client
│   │   └── index.css          # Styles
│   ├── package.json           # Dependencies
│   └── vite.config.js         # Vite config
│
├── postman/                    # API collection
├── README.md                   # Main docs
├── API_DOCUMENTATION.md        # API reference
├── DEPLOYMENT_GUIDE.md         # Setup guide
├── PROJECT_SUMMARY.md          # Project overview
└── QUICK_REFERENCE.md          # This file

```

---

## 🛠️ Common Commands

### Backend

```bash
# Activate virtual environment
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows

# Run migrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser

# Run tests
python manage.py test

# Collect static files
python manage.py collectstatic --noinput

# Django shell
python manage.py shell

# Check setup
python manage.py check
```

### Frontend

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Format code
npm run lint
```

---

## 📡 API Examples

### Create WebApp

```bash
curl -X POST http://localhost:8000/api/webapps/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "my-app",
    "region": "us-east-1",
    "template": "react",
    "plan": "starter",
    "organization": "acme",
    "repo": "my-repo",
    "branch": "main",
    "database_enabled": false,
    "database_type": "none",
    "environment": {
      "port": 3001,
      "environment_variables": {}
    }
  }'
```

### Get Status

```bash
curl http://localhost:8000/api/webapps/{id}/status/
```

### Get Logs

```bash
curl http://localhost:8000/api/webapps/{id}/logs/
```

### List Apps

```bash
curl http://localhost:8000/api/webapps/
```

---

## 🔧 Environment Setup

### Backend (.env)

```
DB_NAME=kuberns
DB_USER=kuberns_user
DB_PASSWORD=kuberns123
DB_HOST=localhost
DB_PORT=5432
CELERY_BROKER_URL=redis://localhost:6379/0
CELERY_RESULT_BACKEND=redis://localhost:6379/0
DEBUG=True
SECRET_KEY=your-secret-key
```

### Frontend (.env.local)

```
VITE_API_BASE_URL=http://localhost:8000/api
```

---

## 🐛 Troubleshooting

### Database Connection Error

```bash
# Check PostgreSQL
psql -U postgres

# Or check service
sudo systemctl status postgresql
```

### Redis Connection Error

```bash
# Check Redis
redis-cli ping
# Should output: PONG
```

### Port Already in Use

```bash
# Find process
lsof -i :8000         # macOS/Linux
netstat -ano | grep :8000  # Windows

# Kill process
kill -9 <PID>         # macOS/Linux
taskkill /PID <PID>   # Windows
```

### "No module named" Error

```bash
# Reinstall packages
pip install -r requirements.txt

# Or upgrade pip
pip install --upgrade pip
```

---

## 📊 Database Schema

```
WebApp (1:1) Environment (1:1) Instance (1:N) DeploymentLog
  │
  └─(0:1)─ DatabaseConfig
```

---

## 🔄 Deployment Workflow

```
Form Submission
    ↓
POST /api/webapps/ (creates WebApp, Environment, Instance)
    ↓
Celery Task Triggered
    ↓
Status: PENDING → DEPLOYING → ACTIVE
    ↓
Logs Generated at Each Step
    ↓
Public IP Assigned (mocked)
    ↓
Client Polls /status/ for Updates
```

---

## 📚 Full Documentation

- **README.md** - Project overview and features
- **API_DOCUMENTATION.md** - Complete API reference
- **DEPLOYMENT_GUIDE.md** - Setup and deployment
- **PROJECT_SUMMARY.md** - Detailed summary

---

## ✅ Testing Checklist

- [ ] Backend starts without errors
- [ ] Database migrations run successfully
- [ ] Celery worker is running
- [ ] Redis is connected
- [ ] Frontend loads at localhost:5173
- [ ] Can navigate between pages
- [ ] Form validation works
- [ ] Can submit form
- [ ] Celery task executes
- [ ] Status updates from pending→active
- [ ] Can view logs
- [ ] API docs load at /api/docs/
- [ ] Admin panel accessible

---

## 🚀 Production Deployment

### Using Gunicorn + Nginx

1. Install Gunicorn: `pip install gunicorn`
2. Collect static files: `python manage.py collectstatic`
3. Run: `gunicorn --workers=4 kuberns.wsgi:application`
4. Configure Nginx as reverse proxy

### Using Docker

```bash
docker-compose up -d
```

See DEPLOYMENT_GUIDE.md for full instructions

---

## 📞 Support

- Check logs in terminal
- Review documentation in README.md
- Check API docs at http://localhost:8000/api/docs/
- Use Postman collection for API testing
- Check Django admin at http://localhost:8000/admin

---

## 📝 Key Files to Edit

### Backend Configuration

- `backend/kuberns/settings.py` - Django settings
- `backend/.env` - Environment variables
- `backend/apps/core/models.py` - Database models
- `backend/apps/core/views.py` - API views

### Frontend Configuration

- `frontend/src/store/wizardStore.js` - State management
- `frontend/src/api/webappAPI.js` - API client
- `frontend/src/components/wizard/Page1.jsx` - First page
- `frontend/src/components/wizard/Page2.jsx` - Second page

---

## 🎯 Next Steps

1. ✅ Setup complete
2. ✅ Review documentation
3. ✅ Test the application
4. ✅ Customize as needed
5. ✅ Deploy to production

---

Generated: 2024 | Kuberns Full Stack Assessment
