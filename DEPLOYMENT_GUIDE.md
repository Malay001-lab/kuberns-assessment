# Kuberns Full Stack - Deployment Guide

## Local Development Setup

### Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.8+** - [Download](https://www.python.org/downloads/)
- **Node.js 16+** - [Download](https://nodejs.org/)
- **PostgreSQL 12+** - [Download](https://www.postgresql.org/download/)
- **Redis 6+** - [Download](https://redis.io/download) or use WSL on Windows
- **Git** - [Download](https://git-scm.com/download/)

### Quick Start (Automated)

#### Linux/macOS:

```bash
chmod +x setup.sh
./setup.sh
```

#### Windows:

```batch
setup.bat
```

### Manual Setup

#### 1. Database Setup

**PostgreSQL**

```sql
-- Open psql
psql -U postgres

-- Create database
CREATE DATABASE kuberns;

-- Create user
CREATE USER kuberns_user WITH PASSWORD 'kuberns123';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE kuberns TO kuberns_user;

-- Verify
\l
\du
```

**Redis**

```bash
# Start Redis server
redis-server

# In another terminal, verify
redis-cli ping
# Should output: PONG
```

#### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Verify setup
python manage.py check
```

#### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Verify installation
npm run build

# Or start dev server
npm run dev
```

---

## Running the Application

### Terminal 1: Backend Server

```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
python manage.py runserver 0.0.0.0:8000
```

Expected output:

```
Starting development server at http://127.0.0.1:8000/
Quit the server with CONTROL-C.
```

### Terminal 2: Celery Worker

```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
celery -A kuberns worker -l info
```

Expected output:

```
 ---------- celery@hostname v5.3.4 (emerald-rush)
--- ***** -----
-- ******* ----
- *** --- * ---
- ** ---------- [config]
- ** ---------- .broker: 'redis://localhost:6379/0'
- ** ---------- .loader: 'django.setup'
- *** --- * --- .concurrency: 8 (prefork)
```

### Terminal 3: Frontend Dev Server

```bash
cd frontend
npm run dev
```

Expected output:

```
  VITE v5.0.0  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  Press q to close
```

### Terminal 4: Redis (if not running as service)

```bash
redis-server
```

Expected output:

```
* Ready to accept connections
```

---

## Accessing the Application

| Component | URL                               | Notes              |
| --------- | --------------------------------- | ------------------ |
| Frontend  | http://localhost:5173             | React application  |
| API Base  | http://localhost:8000/api         | REST API           |
| API Docs  | http://localhost:8000/api/docs/   | Swagger UI         |
| Schema    | http://localhost:8000/api/schema/ | OpenAPI schema     |
| Admin     | http://localhost:8000/admin       | Django admin panel |
| Redis     | localhost:6379                    | Redis broker       |

---

## Common Issues & Solutions

### Issue: "psycopg2" error

**Solution:**

```bash
pip install psycopg2-binary
```

### Issue: Database connection refused

**Check PostgreSQL status:**

```bash
# macOS
brew services list

# Linux
sudo systemctl status postgresql

# Windows
# Check Services app or start PostgreSQL manually
```

### Issue: Redis connection refused

**Verify Redis is running:**

```bash
redis-cli ping
```

If not running, start it:

```bash
redis-server
```

### Issue: Port already in use

**Find and kill process:**

```bash
# Find process using port 8000
lsof -i :8000  # macOS/Linux
netstat -ano | findstr :8000  # Windows

# Kill process
kill -9 <PID>  # macOS/Linux
taskkill /PID <PID> /F  # Windows
```

### Issue: "No module named 'kuberns'"

**Solution:** Ensure you're in the backend directory and virtual environment is activated:

```bash
cd backend
source venv/bin/activate
python manage.py runserver
```

### Issue: "ModuleNotFoundError: No module named 'django'"

**Solution:** Reinstall requirements:

```bash
pip install -r requirements.txt
```

### Issue: Frontend can't connect to backend (CORS error)

**Solution:** Verify:

1. Backend is running on http://localhost:8000
2. Frontend is running on http://localhost:5173
3. CORS settings in `backend/kuberns/settings.py` include both origins

---

## Development Workflow

### Making Changes

#### Backend Changes:

```bash
# Make changes to Python files
# Changes auto-reload if using runserver

# If you add new models:
python manage.py makemigrations
python manage.py migrate

# If you change settings.py:
# Restart the server (Ctrl+C, then run again)
```

#### Frontend Changes:

```bash
# Make changes to React components
# Hot reload automatically applies changes

# Build for production:
npm run build

# Preview production build:
npm run preview
```

#### Database Changes:

```bash
# Create migration for model changes
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# View migration status
python manage.py showmigrations
```

### Testing Endpoints

#### Using curl:

```bash
# Get all webapps
curl http://localhost:8000/api/webapps/

# Get specific webapp
curl http://localhost:8000/api/webapps/{id}/

# Create new webapp
curl -X POST http://localhost:8000/api/webapps/ \
  -H "Content-Type: application/json" \
  -d '{"name":"test","region":"us-east-1","template":"react","plan":"starter","organization":"test","repo":"test","branch":"main","database_enabled":false,"database_type":"none","environment":{"port":3001,"environment_variables":{}}}'
```

#### Using Postman:

1. Open Postman
2. Import `postman/kuberns-api.postman_collection.json`
3. Set `{{base_url}}` to `http://localhost:8000`
4. Test endpoints

---

## Production Deployment

### Environment Variables

**Backend (.env):**

```bash
DEBUG=False
SECRET_KEY=your-secure-secret-key-here
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
DB_HOST=your-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
CELERY_BROKER_URL=redis://your-redis-host:6379/0
```

### Using Gunicorn + Nginx

```bash
# Install Gunicorn
pip install gunicorn

# Run with Gunicorn
gunicorn --workers=4 --threads=2 --worker-class=gthread --bind 0.0.0.0:8000 kuberns.wsgi:application

# Nginx configuration example
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /static/ {
        alias /path/to/backend/staticfiles/;
    }
}
```

### Docker Deployment

**Dockerfile (Backend):**

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "kuberns.wsgi:application"]
```

**docker-compose.yml:**

```yaml
version: "3.8"

services:
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: kuberns
      POSTGRES_USER: kuberns_user
      POSTGRES_PASSWORD: kuberns123
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine

  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      DB_HOST: db
      DB_USER: kuberns_user
      DB_PASSWORD: kuberns123
      CELERY_BROKER_URL: redis://redis:6379/0
    depends_on:
      - db
      - redis

  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
    environment:
      VITE_API_BASE_URL: http://localhost:8000/api

volumes:
  postgres_data:
```

**Deploy with Docker:**

```bash
docker-compose up -d
```

---

## Monitoring & Logging

### Django Logs

Configure in `backend/kuberns/settings.py`:

```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': '/var/log/django/app.log',
        },
    },
    'root': {
        'handlers': ['file'],
        'level': 'INFO',
    },
}
```

### Celery Monitoring

```bash
# Monitor Celery tasks
celery -A kuberns events

# Or using Flower
pip install flower
celery -A kuberns -l info --broker=redis://localhost:6379/0 flower

# Access at http://localhost:5555
```

### Application Performance

- Use Django Debug Toolbar in development
- Set up error tracking with Sentry
- Monitor database queries with django-silk

---

## Backup & Recovery

### Database Backup

```bash
# PostgreSQL backup
pg_dump -U kuberns_user kuberns > backup.sql

# PostgreSQL restore
psql -U kuberns_user kuberns < backup.sql
```

### Redis Backup

```bash
# Redis automatic saves to dump.rdb
# Or manual save
redis-cli SAVE
```

---

## Performance Optimization

### Backend

- Use database indexing
- Enable caching with Redis
- Use database connection pooling
- Profile with django-silk

### Frontend

- Build optimization: `npm run build`
- Image optimization
- Code splitting
- Lazy loading

### General

- Use CDN for static files
- Enable GZIP compression
- Set up caching headers
- Monitor with tools like New Relic

---

## Security Checklist

- [ ] Change SECRET_KEY in production
- [ ] Set DEBUG=False in production
- [ ] Use HTTPS/SSL certificates
- [ ] Configure ALLOWED_HOSTS
- [ ] Use environment variables for secrets
- [ ] Enable CSRF protection
- [ ] Implement rate limiting
- [ ] Use strong database passwords
- [ ] Keep dependencies updated
- [ ] Set up automated backups
- [ ] Enable audit logging
- [ ] Use Web Application Firewall (WAF)

---

## Support & Troubleshooting

### Useful Commands

```bash
# Check Django setup
python manage.py check

# Run tests
python manage.py test

# Collect static files
python manage.py collectstatic --noinput

# Create admin user
python manage.py createsuperuser

# Check migrations
python manage.py showmigrations

# Reset migrations (development only!)
python manage.py migrate zero --plan
```

### Documentation Links

- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [Celery Documentation](https://docs.celeryproject.org/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

---

## Contact & Support

For issues or questions:

1. Check this guide
2. Review logs in terminal
3. Check Django admin panel at http://localhost:8000/admin
4. Review API documentation at http://localhost:8000/api/docs/
