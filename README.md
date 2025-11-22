# Kuberns Full Stack Assessment

A complete full-stack application that replicates the "Create New App" onboarding flow from Kuberns. This application allows users to configure and deploy web applications through a modern wizard-style UI.

## Project Overview

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)               │
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Page 1: App Configuration                       │   │
│  │  - GitHub repository selection                   │   │
│  │  - App details (name, region, framework)        │   │
│  │  - Plan selection                                │   │
│  │  - Database configuration                        │   │
│  └──────────────────────────────────────────────────┘   │
│                           ↓                              │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Page 2: Environment Setup                       │   │
│  │  - Port configuration                            │   │
│  │  - Environment variables builder                 │   │
│  │  - Submit to API                                 │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                           ↓ API
                    (HTTP/REST)
                           ↓
┌─────────────────────────────────────────────────────────┐
│            Backend (Django + DRF)                        │
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │  API Endpoints                                   │   │
│  │  - POST /api/webapps/                            │   │
│  │  - GET /api/webapps/                             │   │
│  │  - GET /api/webapps/<id>/                        │   │
│  │  - GET /api/webapps/<id>/status/                 │   │
│  │  - GET /api/webapps/<id>/logs/                   │   │
│  └──────────────────────────────────────────────────┘   │
│                           ↓                              │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Database Models                                 │   │
│  │  - WebApp, Environment, Instance                 │   │
│  │  - DatabaseConfig, DeploymentLog                 │   │
│  └──────────────────────────────────────────────────┘   │
│                           ↓                              │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Async Tasks (Celery)                            │   │
│  │  - deployment simulation                         │   │
│  │  - EC2 provisioning mock (boto3)                 │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
           ↓ Redis               ↓ PostgreSQL
┌─────────────────────┐   ┌───────────────────┐
│   Redis Cache       │   │  PostgreSQL DB    │
│   - Task Queue      │   │  - App Data       │
│   - Task Results    │   │  - Deployment Log │
└─────────────────────┘   └───────────────────┘
```

## Technology Stack

### Frontend

- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Hook Form** - Form management
- **Zustand** - State management
- **Framer Motion** - Animations
- **Axios** - HTTP client
- **ShadCN UI** - Component library
- **Lucide Icons** - Icon library

### Backend

- **Django 4.2** - Web framework
- **Django REST Framework** - API framework
- **PostgreSQL** - Database
- **Celery** - Task queue
- **Redis** - Message broker & cache
- **boto3** - AWS SDK (mocked)
- **drf-spectacular** - OpenAPI/Swagger documentation

## Setup Instructions

### Prerequisites

- Node.js 16+
- Python 3.8+
- PostgreSQL 12+
- Redis 6+

### Backend Setup

1. **Install Python dependencies:**

   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Create PostgreSQL database:**

   ```bash
   # Using PostgreSQL CLI
   psql -U postgres
   CREATE DATABASE kuberns;
   CREATE USER kuberns_user WITH PASSWORD 'kuberns123';
   GRANT ALL PRIVILEGES ON DATABASE kuberns TO kuberns_user;
   ```

3. **Configure environment:**

   ```bash
   # .env file is already created with defaults
   # Update if needed:
   cat > .env << EOF
   DB_NAME=kuberns
   DB_USER=kuberns_user
   DB_PASSWORD=kuberns123
   DB_HOST=localhost
   DB_PORT=5432
   CELERY_BROKER_URL=redis://localhost:6379/0
   CELERY_RESULT_BACKEND=redis://localhost:6379/0
   DEBUG=True
   SECRET_KEY=django-insecure-test-key-change-in-production
   EOF
   ```

4. **Run migrations:**

   ```bash
   python manage.py migrate
   ```

5. **Create superuser (optional):**

   ```bash
   python manage.py createsuperuser
   ```

6. **Start the development server:**

   ```bash
   python manage.py runserver 0.0.0.0:8000
   ```

7. **In another terminal, start Celery worker:**
   ```bash
   celery -A kuberns worker -l info
   ```

### Frontend Setup

1. **Install Node dependencies:**

   ```bash
   cd frontend
   npm install
   ```

2. **Start development server:**

   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## Database Schema (ER Diagram)

```
┌─────────────────────┐
│      WebApp         │
├─────────────────────┤
│ id (UUID) PK        │
│ owner (FK)          │ ──────┐
│ name                │       │
│ region              │       │
│ template            │       │
│ plan                │       │
│ repo                │       │
│ branch              │       │
│ organization        │       │
│ database_type       │       │
│ database_enabled    │       │
│ created_at          │       │
│ updated_at          │       │
└─────────────────────┘       │
         │ 1                   │
         │                     │
    1:1 ├─────────────────────────────┐
         │                             │
    ┌────┴─────────────┐         ┌────┴──────────────┐
    │  Environment     │         │ DatabaseConfig    │
    ├────────────────┤         ├───────────────────┤
    │ id (UUID) PK   │         │ id (UUID) PK      │
    │ webapp_id (FK) │         │ webapp_id (FK) 1:1│
    │ port           │         │ engine            │
    │ env_variables  │         │ name              │
    │ created_at     │         │ username          │
    │ updated_at     │         │ created_at        │
    └────┬───────────┘         └───────────────────┘
         │ 1
         │
    1:1 │
         │
    ┌────┴──────────────────┐
    │     Instance          │
    ├──────────────────────┤
    │ id (UUID) PK         │
    │ environment_id (FK)  │
    │ cpu                  │
    │ ram                  │
    │ storage              │
    │ status               │
    │ public_ip            │
    │ created_at           │
    │ updated_at           │
    └────┬─────────────────┘
         │ 1
         │
    1:N  │
         │
    ┌────┴──────────────────┐
    │  DeploymentLog        │
    ├──────────────────────┤
    │ id (UUID) PK         │
    │ instance_id (FK)     │
    │ log_text             │
    │ timestamp            │
    └──────────────────────┘
```

## API Endpoints

### WebApp Management

#### Create WebApp (with nested Environment and Instance)

```
POST /api/webapps/
Content-Type: application/json

{
  "name": "my-awesome-app",
  "region": "us-east-1",
  "template": "react",
  "plan": "starter",
  "organization": "acme-corp",
  "repo": "my-app",
  "branch": "main",
  "database_enabled": true,
  "database_type": "postgresql",
  "environment": {
    "port": 3001,
    "environment_variables": {
      "NODE_ENV": "production",
      "API_URL": "https://api.example.com"
    }
  },
  "database_config": {
    "engine": "postgresql",
    "name": "my_awesome_app_db",
    "username": "db_user"
  }
}

Response: 201 Created
{
  "message": "WebApp created successfully",
  "status": "deployment started",
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "data": { ... }
}
```

#### List All WebApps

```
GET /api/webapps/

Response: 200 OK
{
  "count": 5,
  "next": "http://api.example.com/api/webapps/?page=2",
  "previous": null,
  "results": [ ... ]
}
```

#### Get WebApp Details

```
GET /api/webapps/{id}/

Response: 200 OK
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "my-awesome-app",
  "region": "us-east-1",
  "template": "react",
  "plan": "starter",
  "organization": "acme-corp",
  "repo": "my-app",
  "branch": "main",
  "database_enabled": true,
  "database_type": "postgresql",
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:30:00Z",
  "environment": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "port": 3001,
    "environment_variables": {
      "NODE_ENV": "production",
      "API_URL": "https://api.example.com"
    },
    "created_at": "2024-01-15T10:30:00Z",
    "instance": {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "cpu": "0.5",
      "ram": "512",
      "storage": "10GB",
      "status": "active",
      "public_ip": "54.123.45.67",
      "created_at": "2024-01-15T10:30:00Z",
      "logs": [ ... ]
    }
  },
  "database_config": {
    "id": "880e8400-e29b-41d4-a716-446655440003",
    "engine": "postgresql",
    "name": "my_awesome_app_db",
    "username": "db_user",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

#### Get Deployment Status

```
GET /api/webapps/{id}/status/

Response: 200 OK
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "my-awesome-app",
  "instance_status": "active",
  "public_ip": "54.123.45.67",
  "logs": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440004",
      "log_text": "[SUCCESS] Deployment completed successfully!",
      "timestamp": "2024-01-15T10:35:00Z"
    },
    ...
  ]
}
```

#### Get Deployment Logs

```
GET /api/webapps/{id}/logs/

Response: 200 OK
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "logs": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440004",
      "log_text": "[INFO] Starting deployment process...",
      "timestamp": "2024-01-15T10:30:00Z"
    },
    ...
  ]
}
```

## Deployment Workflow

The deployment process is asynchronous and follows this workflow:

1. **User submits form** → Frontend sends POST to `/api/webapps/`
2. **WebApp created** → Backend creates WebApp + Environment + Instance with status "pending"
3. **Celery task triggered** → `deploy_instance` task starts
4. **Status update: DEPLOYING** → Task updates Instance status to "deploying"
5. **EC2 provisioning mock** → `provision_ec2_instance` generates fake public IP
6. **Deployment logs** → DeploymentLog entries added at each step
7. **Status update: ACTIVE** → Final status set to "active" with public IP
8. **Frontend polling** → Can call `/api/webapps/{id}/status/` to check progress

### Simulated Timeline:

- T+0s: PENDING
- T+5s: DEPLOYING (provisioning)
- T+8s: ACTIVE (deployment complete)

## Admin Interface

Access Django admin at `http://localhost:8000/admin/`

- Username: (created via `createsuperuser` command)
- Manage WebApps, Environments, Instances, and Deployment Logs
- View deployment history and status

## API Documentation

### Swagger UI

```
http://localhost:8000/api/docs/
```

### OpenAPI Schema

```
http://localhost:8000/api/schema/
```

## Testing

### Example curl requests:

**Create WebApp:**

```bash
curl -X POST http://localhost:8000/api/webapps/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "test-app",
    "region": "us-east-1",
    "template": "react",
    "plan": "starter",
    "organization": "test-org",
    "repo": "test-repo",
    "branch": "main",
    "database_enabled": false,
    "database_type": "none",
    "environment": {
      "port": 3001,
      "environment_variables": {}
    }
  }'
```

**Get Status:**

```bash
curl http://localhost:8000/api/webapps/{id}/status/
```

## Postman Collection

A Postman collection is available in the `postman/` directory. Import it into Postman for easy API testing.

### How to use:

1. Open Postman
2. Click "Import"
3. Select `kuberns-api.postman_collection.json`
4. Update the `{{base_url}}` variable if needed
5. Start testing endpoints

## Features Implemented

### Frontend

- ✅ 2-page wizard UI with smooth transitions
- ✅ GitHub repository selection (mocked)
- ✅ App configuration form with validation
- ✅ Plan selection with visual cards
- ✅ Optional database configuration
- ✅ Environment variables builder
- ✅ Port configuration with suggestion
- ✅ Responsive design (mobile-first)
- ✅ Loading states and error handling
- ✅ Zustand state management
- ✅ Tailwind CSS + ShadCN components
- ✅ Framer Motion animations
- ✅ Form validation with react-hook-form

### Backend

- ✅ Django models (WebApp, Environment, Instance, DeploymentLog, DatabaseConfig)
- ✅ Nested serializers for complex object creation
- ✅ RESTful API endpoints
- ✅ Celery async task queue
- ✅ Redis message broker
- ✅ Deployment simulation workflow
- ✅ boto3 mock for EC2 provisioning
- ✅ PostgreSQL database
- ✅ Django admin interface
- ✅ OpenAPI/Swagger documentation
- ✅ CORS enabled for frontend communication
- ✅ Comprehensive error handling

## Troubleshooting

### PostgreSQL Connection Error

```bash
# Check if PostgreSQL is running
psql -U postgres -h localhost

# Or check via service
sudo systemctl status postgresql
```

### Redis Connection Error

```bash
# Check if Redis is running
redis-cli ping
# Should output: PONG
```

### Celery Not Processing Tasks

```bash
# Ensure Celery worker is running
celery -A kuberns worker -l info

# Check if Redis is accessible
redis-cli
> INFO
```

### CORS Error in Frontend

- Ensure backend is running on `http://localhost:8000`
- Frontend on `http://localhost:5173`
- CORS is already configured in Django settings

## Production Deployment

For production:

1. **Set secure SECRET_KEY** in settings.py
2. **Use environment variables** for sensitive data
3. **Enable HTTPS** with SSL certificates
4. **Use production database** (managed PostgreSQL)
5. **Use production Redis** (AWS ElastiCache or similar)
6. **Deploy with Gunicorn** and Nginx
7. **Use AWS IAM** for boto3 credentials
8. **Enable database backups**
9. **Set up monitoring** with tools like Sentry
10. **Configure logging** appropriately

## License

This project is part of the Kuberns Full Stack Assessment.

## Support

For issues or questions, please refer to the documentation or create an issue in the repository.
# kuberns-assessment-fullstack--app
# kuberns-assessment
# kuberns-assessment
# kuberns-assessment
