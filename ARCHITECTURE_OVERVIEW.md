# 📊 Project Architecture & Visual Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         User Browser                                │
├─────────────────────────────────────────────────────────────────────┤
│  Frontend Application (React + Vite + Tailwind)                     │
│  ├── Wizard Container                                               │
│  │   ├── Page 1: App Configuration                                  │
│  │   │   ├── GitHub Connection Mock                                 │
│  │   │   ├── Repository Selection                                   │
│  │   │   ├── App Details Form                                       │
│  │   │   ├── Plan Selection                                         │
│  │   │   └── Database Configuration                                 │
│  │   │                                                              │
│  │   └── Page 2: Environment Setup                                  │
│  │       ├── Port Configuration                                     │
│  │       ├── Environment Variables                                  │
│  │       └── Form Submission                                        │
│  │                                                                  │
│  ├── Zustand Store (State Management)                               │
│  ├── Axios Client (API Communication)                               │
│  └── Tailwind CSS + Framer Motion (Styling & Animations)            │
│                                                                      │
│  http://localhost:5173                                             │
└────────────────────────┬────────────────────────────────────────────┘
                         │ HTTP/REST API (JSON)
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│            Backend API Server (Django + DRF)                        │
├─────────────────────────────────────────────────────────────────────┤
│  REST Endpoints:                                                    │
│  ├── POST   /api/webapps/                 → Create WebApp           │
│  ├── GET    /api/webapps/                 → List WebApps           │
│  ├── GET    /api/webapps/{id}/            → Get WebApp Details     │
│  ├── GET    /api/webapps/{id}/status/     → Deployment Status      │
│  ├── GET    /api/webapps/{id}/logs/       → Deployment Logs        │
│  ├── GET    /api/environments/            → List Environments      │
│  ├── GET    /api/instances/               → List Instances         │
│  └── GET    /api/logs/                    → Deployment Logs        │
│                                                                      │
│  ViewSets & Serializers:                                            │
│  ├── WebAppViewSet (CRUD + Custom Actions)                          │
│  ├── Nested Serializers (Environment, Instance, Logs)              │
│  └── Proper Error Handling & Validation                             │
│                                                                      │
│  http://localhost:8000/api                                         │
│  Swagger: http://localhost:8000/api/docs/                          │
└────────┬──────────────────┬──────────────────────┬───────────────────┘
         │                  │                      │
         │ Django ORM       │ Task Queue           │ Cache
         │                  │                      │
         ▼                  ▼                      ▼
    ┌─────────┐      ┌──────────────┐      ┌──────────────┐
    │ Database│      │   Celery     │      │    Redis     │
    │         │      │   Worker     │      │    Broker    │
    │PostgreSQL      │              │      │              │
    │         │      │ Async Tasks: │      │ Message      │
    │ - WebApp│      │ - deploy_    │      │ Queue        │
    │ - Env   │      │   instance() │      │ - Results    │
    │ - Inst  │      │              │      │ - Cache      │
    │ - Logs  │      │ Status:      │      │              │
    │         │      │ PENDING →    │      │ localhost:   │
    │localhst │      │ DEPLOYING →  │      │ 6379         │
    │:5432    │      │ ACTIVE       │      │              │
    └─────────┘      └──────────────┘      └──────────────┘
```

---

## Data Flow Diagram

```
User Interaction Flow:

User Opens App
    │
    ▼
Form Page 1: App Configuration
├─ Input: name, region, framework, plan, repo, branch
├─ Optional: database config
└─ Action: "Set up environment variables"
    │
    ▼
Form Page 2: Environment Setup
├─ Input: port, environment variables
└─ Action: "Finish My Setup" → POST /api/webapps/
    │
    ▼
Backend Processing:
├─ Validate inputs
├─ Create WebApp object
├─ Create nested Environment object
├─ Create nested Instance object (status: PENDING)
└─ Trigger Celery task
    │
    ▼
Celery Async Task:
├─ T+0s: Update status to DEPLOYING
├─ T+5s: Mock EC2 provisioning
│        Generate fake public IP
├─ T+8s: Update status to ACTIVE
└─ Log each step
    │
    ▼
Frontend Polling:
├─ GET /api/webapps/{id}/status/
├─ Display status and logs
├─ Update UI in real-time
└─ Show completion message
    │
    ▼
User Sees Success
```

---

## Database Schema

```
┌─────────────────────────────────────────────────────┐
│                 WebApp Table                        │
├─────────────────────────────────────────────────────┤
│ id (UUID, PK)                                       │
│ name (VARCHAR)                                      │
│ organization (VARCHAR)                              │
│ repo (VARCHAR)                                      │
│ branch (VARCHAR)                                    │
│ region (CHAR)                                       │
│ template (CHAR) [react, nextjs, django, etc]       │
│ plan (CHAR) [starter, pro]                          │
│ database_enabled (BOOLEAN)                          │
│ database_type (CHAR) [none, postgresql, mysql]     │
│ owner_id (FK to User, nullable)                     │
│ created_at (DATETIME)                               │
│ updated_at (DATETIME)                               │
└────────────────┬──────────────────────────────────┬─┘
                 │ 1:1                               │ 0:1
                 ▼                                   ▼
    ┌────────────────────────────┐    ┌──────────────────────────┐
    │  Environment Table         │    │ DatabaseConfig Table     │
    ├────────────────────────────┤    ├──────────────────────────┤
    │ id (UUID, PK)              │    │ id (UUID, PK)            │
    │ webapp_id (FK)             │    │ webapp_id (FK, Unique)   │
    │ port (INTEGER)             │    │ engine (CHAR)            │
    │ environment_variables      │    │ name (VARCHAR)           │
    │   (JSON)                   │    │ username (VARCHAR)       │
    │ created_at (DATETIME)      │    │ created_at (DATETIME)    │
    │ updated_at (DATETIME)      │    │                          │
    └───────────┬────────────────┘    └──────────────────────────┘
                │ 1:1
                ▼
    ┌────────────────────────────┐
    │     Instance Table         │
    ├────────────────────────────┤
    │ id (UUID, PK)              │
    │ environment_id (FK)        │
    │ cpu (VARCHAR)              │
    │ ram (VARCHAR)              │
    │ storage (VARCHAR)          │
    │ status (CHAR)              │ [pending, deploying, active, failed, stopped]
    │ public_ip (CHAR, nullable) │
    │ created_at (DATETIME)      │
    │ updated_at (DATETIME)      │
    └───────────┬────────────────┘
                │ 1:N
                ▼
    ┌────────────────────────────┐
    │ DeploymentLog Table        │
    ├────────────────────────────┤
    │ id (UUID, PK)              │
    │ instance_id (FK)           │
    │ log_text (TEXT)            │
    │ timestamp (DATETIME)       │
    └────────────────────────────┘
```

---

## Component Tree (Frontend)

```
App
├── ToastContainer (react-toastify)
└── Wizard
    ├── Header
    │   ├── Title: "Create New App"
    │   └── Subtitle
    ├── Progress Indicator
    │   └── Steps 1-2
    ├── Content Area (AnimatePresence)
    │   ├── Page1
    │   │   ├── Card: GitHub Connection
    │   │   │   └── Button: "Connect GitHub"
    │   │   ├── Card: Repository Selection
    │   │   │   ├── Select: Organization
    │   │   │   ├── Select: Repository
    │   │   │   └── Select: Branch
    │   │   ├── Card: App Details
    │   │   │   ├── Input: App Name
    │   │   │   ├── Select: Region
    │   │   │   └── Select: Framework
    │   │   ├── Plan Selection
    │   │   │   ├── PlanCard: Starter
    │   │   │   └── PlanCard: Pro
    │   │   ├── Card: Database
    │   │   │   ├── Toggle: Enable Database
    │   │   │   └── Select: Database Type (conditional)
    │   │   └── Navigation
    │   │       └── Button: "Set up environment variables"
    │   │
    │   └── Page2
    │       ├── Card: Port Configuration
    │       │   ├── Input: Port
    │       │   └── Button: "Suggest"
    │       ├── Card: Environment Variables
    │       │   ├── EnvVarRow[]
    │       │   │   ├── Input: KEY
    │       │   │   ├── Input: VALUE
    │       │   │   └── Button: Remove
    │       │   └── Button: "Add Variable"
    │       ├── Card: Deployment Summary
    │       │   ├── Text: App details
    │       │   └── Text: Configuration summary
    │       └── Navigation
    │           ├── Button: "Back"
    │           └── Button: "Finish My Setup" (submit)
    │
    └── Footer
        └── "Powered by Kuberns"
```

---

## API Endpoint Map

```
/api/
├── webapps/
│   ├── POST          → Create WebApp
│   ├── GET           → List WebApps (paginated)
│   ├── GET {id}/
│   │   ├── GET       → WebApp details
│   │   ├── status/
│   │   │   └── GET   → Deployment status
│   │   └── logs/
│   │       └── GET   → Deployment logs
│   └── [PATCH, PUT, DELETE auto-generated]
│
├── environments/
│   ├── GET           → List environments
│   └── GET {id}/     → Environment details
│
├── instances/
│   ├── GET           → List instances
│   └── GET {id}/     → Instance details
│
└── logs/
    ├── GET           → List logs (paginated)
    └── GET {id}/     → Log details
```

---

## State Management (Zustand)

```
wizardStore
├── Page Navigation
│   └── currentPage: 1 | 2
│
├── Page 1 State
│   ├── organization: string
│   ├── repository: string
│   ├── branch: string
│   ├── appName: string
│   ├── region: string
│   ├── framework: string
│   ├── planType: 'starter' | 'pro'
│   ├── databaseType: string
│   └── databaseEnabled: boolean
│
├── Page 2 State
│   ├── port: number
│   └── environmentVariables: Array<{key, value}>
│
├── UI State
│   ├── isLoading: boolean
│   ├── error: string | null
│   ├── success: boolean
│   └── deploymentId: string | null
│
└── Actions
    ├── setCurrentPage()
    ├── setOrganization(), setRepository(), setBranch()
    ├── setAppName(), setRegion(), setFramework()
    ├── setPlanType(), setDatabaseType(), setDatabaseEnabled()
    ├── setPort(), setEnvironmentVariables()
    ├── setIsLoading(), setError(), setSuccess()
    ├── setDeploymentId()
    └── resetForm()
```

---

## Request/Response Flow

```
Frontend Submit
    │
    ├─ Validate form
    └─ POST /api/webapps/
       │
       Headers:
       ├─ Content-Type: application/json
       └─ (Optional: Authorization)
       │
       Body:
       ├─ name: "my-app"
       ├─ region: "us-east-1"
       ├─ template: "react"
       ├─ plan: "starter"
       ├─ organization: "acme"
       ├─ repo: "my-repo"
       ├─ branch: "main"
       ├─ database_enabled: false
       ├─ database_type: "none"
       └─ environment:
          ├─ port: 3001
          └─ environment_variables: {...}
       │
       ▼
Backend Processing
    │
    ├─ Validate input
    ├─ Create WebApp
    ├─ Create Environment
    ├─ Create Instance
    ├─ Trigger Celery task
    │
    └─ Response 201 Created
       │
       Body:
       ├─ message: "WebApp created successfully"
       ├─ status: "deployment started"
       ├─ id: "uuid"
       └─ data: {...full object...}
       │
       ▼
Frontend Receives
    │
    ├─ Save deployment ID
    ├─ Show success message
    ├─ Start polling for status
    │
    └─ GET /api/webapps/{id}/status/
       (every 3-5 seconds)
       │
       Response:
       ├─ instance_status: "pending|deploying|active"
       ├─ public_ip: "54.x.x.x"
       └─ logs: [...]
       │
       ▼
Frontend Updates UI
    │
    ├─ Update status indicator
    ├─ Display logs
    └─ Show public IP when ready
```

---

## Celery Task Execution

```
Task Trigger: deploy_instance(instance_id)
    │
    ├─ T+0s: Status = PENDING
    │         Log: "[INFO] Starting deployment..."
    │         Commit to database
    │
    │ (simulated delay: 5 seconds)
    │
    ├─ T+5s: Status = DEPLOYING
    │         Generate mock public_ip: "54.x.x.x"
    │         Log: "[INFO] EC2 provisioned..."
    │         Commit to database
    │
    │ (simulated delay: 3 seconds)
    │
    └─ T+8s: Status = ACTIVE
             Set public_ip
             Log: "[SUCCESS] Deployment complete!"
             Commit to database
             Return result
```

---

## File Dependencies

```
Frontend Dependencies:
Page1.jsx
├── wizardStore (Zustand)
├── Button, Input, Select, Card, Toggle (UI)
├── react-hook-form (validation)
├── framer-motion (animations)
└── lucide-react (icons)

Page2.jsx
├── wizardStore (Zustand)
├── webappAPI (API calls)
├── Button, Input, Card (UI)
├── react-hook-form (validation)
├── framer-motion (animations)
└── lucide-react (icons)

Backend Dependencies:
views.py
├── models (WebApp, Instance, etc.)
├── serializers (All serializers)
├── tasks (Celery tasks)
└── DRF ViewSets

serializers.py
└── models (All models)

tasks.py
└── models (Instance, DeploymentLog)
```

---

## Deployment Timeline

```
┌──────────────────────────────────────────────────────┐
│         Deployment Workflow Timeline                 │
└──────────────────────────────────────────────────────┘

User Action:
    │ Fills form and clicks "Finish My Setup"
    ▼
T+0.0s: API Request
    │ POST /api/webapps/ receives request
    ▼
T+0.1s: Object Creation
    │ WebApp, Environment, Instance created
    │ Status: PENDING
    ▼
T+0.2s: Task Queue
    │ Celery task: deploy_instance() queued
    │ Redis receives task
    ▼
T+0.3s: Response to Frontend
    │ 201 Created returned
    │ Frontend starts polling
    ▼
T+1.0s: Worker Picks Up Task
    │ Celery worker processes task
    │ Status → DEPLOYING
    ▼
T+1-5s: Deployment Simulation
    │ Waiting... simulating deployment
    ▼
T+5.0s: Mock EC2 Provisioning
    │ Generate fake public IP
    │ Log EC2 info
    ▼
T+5-8s: Deployment Progress
    │ Continuing simulation
    ▼
T+8.0s: Deployment Complete
    │ Status → ACTIVE
    │ Public IP assigned
    │ Final log entry
    ▼
Polling: Status Updated
    │ Frontend receives updated status
    │ UI shows success
    ▼
User Success
```

---

## Technology Stack Diagram

```
┌─────────────────────────────────────────────┐
│           Frontend Layer                    │
├─────────────────────────────────────────────┤
│  React 18         (UI Framework)            │
│  Vite 5           (Build Tool)              │
│  Tailwind CSS 3   (Styling)                 │
│  React Hook Form  (Form Management)         │
│  Zustand          (State Management)        │
│  Framer Motion    (Animations)              │
│  Axios            (HTTP Client)             │
│  Lucide Icons     (Icons)                   │
│  React Toastify   (Notifications)           │
└────────┬──────────────────────────┬─────────┘
         │ HTTP/REST               │ WebSocket
         │                         │ (optional)
┌────────▼─────────────────────────▼─────────┐
│          API Layer (Backend)                │
├─────────────────────────────────────────────┤
│  Django 4.2       (Web Framework)           │
│  DRF 3.14         (API Framework)           │
│  drf-spectacular  (OpenAPI/Swagger)         │
│  CORS             (Cross-Origin)            │
├─────────────────────────────────────────────┤
│       Application Logic Layer                │
├─────────────────────────────────────────────┤
│  Models           (Database schema)         │
│  Serializers      (Data transformation)     │
│  ViewSets         (API endpoints)           │
│  Tasks            (Celery async)            │
│  Admin            (Management interface)    │
└────────┬──────────────────────────┬─────────┘
         │ ORM                      │ Task Queue
         │                         │
┌────────▼──────────┬──────────────▼──────────┐
│ Database Layer    │  Message Broker         │
├───────────────────┼─────────────────────────┤
│ PostgreSQL 12+    │ Redis 6+                │
│ - Users           │ - Task Queue            │
│ - WebApps         │ - Results Cache         │
│ - Environments    │ - Session Cache         │
│ - Instances       │                         │
│ - DeploymentLogs  │                         │
│ - DatabaseConfigs │                         │
└───────────────────┴─────────────────────────┘
         ▲                         ▲
         │ SQL                     │ Commands
         │                         │
    ┌────┴────────────────────────┴────┐
    │    Infrastructure Layer           │
    ├──────────────────────────────────┤
    │ Celery Worker (Async Processing) │
    │ Redis Server (Message Broker)    │
    │ PostgreSQL Server (Database)     │
    │ Node.js Runtime (Frontend build) │
    │ Python Runtime (Backend)         │
    └──────────────────────────────────┘
```

---

This visual overview shows how all components of the Kuberns application work together!
