# Kuberns API Documentation

## Base URL

```
http://localhost:8000/api
```

## Authentication

Current implementation allows anonymous access (AllowAny permission). For production, implement JWT or Token authentication.

## Response Format

### Success Response

```json
{
  "message": "Operation successful",
  "status": "success",
  "data": { ... }
}
```

### Error Response

```json
{
  "error": "Error message",
  "details": { ... }
}
```

---

## WebApp Endpoints

### 1. Create a New WebApp

**Endpoint:** `POST /webapps/`

**Description:** Create a new web application with environment and instance configuration.

**Request Body:**

```json
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
      "API_URL": "https://api.example.com",
      "DEBUG": "false"
    }
  },
  "database_config": {
    "engine": "postgresql",
    "name": "my_awesome_app_db",
    "username": "db_user"
  }
}
```

**Parameters:**

- `name` (string, required): Application name (1-255 characters)
- `region` (string, required): AWS region (us-east-1, us-west-2, eu-central-1)
- `template` (string, required): Framework (react, nextjs, vue, django, node, flask, fastapi)
- `plan` (string, required): Plan type (starter, pro)
- `organization` (string, optional): GitHub organization name
- `repo` (string, required): Repository name
- `branch` (string, required): Branch name
- `database_enabled` (boolean, required): Whether database is required
- `database_type` (string, required): Database type (none, postgresql, mysql)
- `environment` (object, required):
  - `port` (integer): Application port (1024-65535)
  - `environment_variables` (object): Key-value pairs
- `database_config` (object, optional): Required if database_enabled is true
  - `engine` (string): postgresql or mysql
  - `name` (string): Database name
  - `username` (string): Database user

**Response:** `201 Created`

```json
{
  "message": "WebApp created successfully",
  "status": "deployment started",
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "data": {
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
        "API_URL": "https://api.example.com",
        "DEBUG": "false"
      },
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "instance": {
        "id": "770e8400-e29b-41d4-a716-446655440002",
        "cpu": "0.5",
        "ram": "512",
        "storage": "10GB",
        "status": "pending",
        "public_ip": null,
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z",
        "logs": []
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
}
```

**Error Response:** `400 Bad Request`

```json
{
  "error": "Validation error",
  "details": {
    "name": ["This field may not be blank."],
    "environment": ["This field is required."]
  }
}
```

---

### 2. List All WebApps

**Endpoint:** `GET /webapps/`

**Description:** Retrieve a paginated list of all web applications.

**Query Parameters:**

- `page` (integer): Page number (default: 1)
- `page_size` (integer): Items per page (default: 10)

**Response:** `200 OK`

```json
{
  "count": 25,
  "next": "http://localhost:8000/api/webapps/?page=2",
  "previous": null,
  "results": [
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
      "environment": { ... },
      "database_config": { ... }
    },
    ...
  ]
}
```

---

### 3. Get WebApp Details

**Endpoint:** `GET /webapps/{id}/`

**Description:** Retrieve detailed information about a specific web application.

**Path Parameters:**

- `id` (string): WebApp UUID

**Response:** `200 OK`

```json
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
    "updated_at": "2024-01-15T10:30:00Z",
    "instance": {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "cpu": "0.5",
      "ram": "512",
      "storage": "10GB",
      "status": "active",
      "public_ip": "54.123.45.67",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:35:00Z",
      "logs": [
        {
          "id": "990e8400-e29b-41d4-a716-446655440004",
          "log_text": "[INFO] Starting deployment process...",
          "timestamp": "2024-01-15T10:30:00Z"
        },
        {
          "id": "aa0e8400-e29b-41d4-a716-446655440005",
          "log_text": "[INFO] EC2 instance provisioned with IP: 54.123.45.67",
          "timestamp": "2024-01-15T10:30:05Z"
        },
        {
          "id": "bb0e8400-e29b-41d4-a716-446655440006",
          "log_text": "[SUCCESS] Deployment completed successfully!",
          "timestamp": "2024-01-15T10:30:08Z"
        }
      ]
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

**Error Response:** `404 Not Found`

```json
{
  "detail": "Not found."
}
```

---

### 4. Get Deployment Status

**Endpoint:** `GET /webapps/{id}/status/`

**Description:** Get the current deployment status and recent logs.

**Path Parameters:**

- `id` (string): WebApp UUID

**Response:** `200 OK`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "my-awesome-app",
  "instance_status": "active",
  "public_ip": "54.123.45.67",
  "logs": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440004",
      "log_text": "[INFO] Starting deployment process...",
      "timestamp": "2024-01-15T10:30:00Z"
    },
    {
      "id": "aa0e8400-e29b-41d4-a716-446655440005",
      "log_text": "[INFO] EC2 instance provisioned with IP: 54.123.45.67",
      "timestamp": "2024-01-15T10:30:05Z"
    },
    {
      "id": "bb0e8400-e29b-41d4-a716-446655440006",
      "log_text": "[SUCCESS] Deployment completed successfully!",
      "timestamp": "2024-01-15T10:30:08Z"
    }
  ]
}
```

---

### 5. Get Deployment Logs

**Endpoint:** `GET /webapps/{id}/logs/`

**Description:** Retrieve all deployment logs for a web application.

**Path Parameters:**

- `id` (string): WebApp UUID

**Response:** `200 OK`

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "logs": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440004",
      "log_text": "[INFO] Starting deployment process...",
      "timestamp": "2024-01-15T10:30:00Z"
    },
    {
      "id": "aa0e8400-e29b-41d4-a716-446655440005",
      "log_text": "[INFO] EC2 instance provisioned with IP: 54.123.45.67",
      "timestamp": "2024-01-15T10:30:05Z"
    },
    {
      "id": "bb0e8400-e29b-41d4-a716-446655440006",
      "log_text": "[SUCCESS] Deployment completed successfully!",
      "timestamp": "2024-01-15T10:30:08Z"
    }
  ]
}
```

---

## Environment Endpoints

### Get All Environments

**Endpoint:** `GET /environments/`

**Response:** `200 OK`

```json
{
  "count": 10,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "port": 3001,
      "environment_variables": { ... },
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z",
      "instance": { ... }
    }
  ]
}
```

### Get Environment Details

**Endpoint:** `GET /environments/{id}/`

**Path Parameters:**

- `id` (string): Environment UUID

---

## Instance Endpoints

### Get All Instances

**Endpoint:** `GET /instances/`

**Response:** `200 OK`

```json
{
  "count": 10,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "cpu": "0.5",
      "ram": "512",
      "storage": "10GB",
      "status": "active",
      "public_ip": "54.123.45.67",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:35:00Z",
      "logs": [ ... ]
    }
  ]
}
```

### Get Instance Details

**Endpoint:** `GET /instances/{id}/`

**Path Parameters:**

- `id` (string): Instance UUID

---

## Deployment Log Endpoints

### Get All Logs

**Endpoint:** `GET /logs/`

**Query Parameters:**

- `page` (integer): Page number
- `page_size` (integer): Items per page

**Response:** `200 OK`

```json
{
  "count": 50,
  "next": "http://localhost:8000/api/logs/?page=2",
  "previous": null,
  "results": [
    {
      "id": "990e8400-e29b-41d4-a716-446655440004",
      "log_text": "[INFO] Starting deployment process...",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### Get Log Details

**Endpoint:** `GET /logs/{id}/`

---

## Status Codes

| Code | Description                             |
| ---- | --------------------------------------- |
| 200  | OK - Request successful                 |
| 201  | Created - Resource created successfully |
| 204  | No Content - Successful deletion        |
| 400  | Bad Request - Invalid parameters        |
| 404  | Not Found - Resource not found          |
| 500  | Server Error - Internal server error    |

---

## Deployment Status Lifecycle

```
PENDING → DEPLOYING → ACTIVE
   ↓         ↓
FAILED   FAILED
```

**Status Descriptions:**

- `PENDING`: Initial state, waiting for deployment
- `DEPLOYING`: Deployment in progress
- `ACTIVE`: Deployment successful, instance running
- `FAILED`: Deployment failed
- `STOPPED`: Instance stopped

---

## Error Handling

### Common Errors

**Missing Required Field:**

```json
{
  "field_name": ["This field is required."]
}
```

**Invalid Choice:**

```json
{
  "plan": ["\"invalid\" is not a valid choice. Valid choices are: starter, pro"]
}
```

**Database Integrity Error:**

```json
{
  "error": "Database integrity error",
  "details": "Details about the error"
}
```

---

## Rate Limiting

Currently not implemented. Production deployment should include rate limiting.

## Pagination

Default page size: 10 items per page

Response includes:

- `count`: Total number of items
- `next`: URL for next page
- `previous`: URL for previous page
- `results`: Array of items

---

## CORS Headers

The API includes CORS headers for the following origins:

- http://localhost:5173
- http://localhost:3000
- http://127.0.0.1:5173
- http://127.0.0.1:3000

---

## Examples

### Create App with curl

```bash
curl -X POST http://localhost:8000/api/webapps/ \
  -H "Content-Type: application/json" \
  -d '{
    "name": "test-app",
    "region": "us-east-1",
    "template": "react",
    "plan": "starter",
    "organization": "my-org",
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

### Check Status

```bash
curl http://localhost:8000/api/webapps/550e8400-e29b-41d4-a716-446655440000/status/
```

### Get Logs

```bash
curl http://localhost:8000/api/webapps/550e8400-e29b-41d4-a716-446655440000/logs/
```

---

## Integration with Frontend

The frontend uses Zustand store and makes async requests:

```javascript
const response = await webAppAPI.createWebApp(formData);
// Returns: { message, status, id, data }
```

Polling for status updates:

```javascript
const status = await webAppAPI.getDeploymentStatus(id);
// Returns: { id, name, instance_status, public_ip, logs }
```

---

## Troubleshooting

### Connection Refused

- Ensure backend is running: `python manage.py runserver`
- Check port 8000 is not blocked

### CORS Error

- Verify frontend origin in CORS_ALLOWED_ORIGINS
- Ensure request includes proper headers

### 500 Internal Error

- Check backend logs for detailed error
- Verify database is running and migrations applied
- Ensure Celery worker is running for async tasks

---

## Future Enhancements

- [ ] JWT/Token authentication
- [ ] Rate limiting
- [ ] Caching with Redis
- [ ] Webhook notifications
- [ ] Real AWS integration
- [ ] Deployment rollback
- [ ] Load balancing
- [ ] Auto-scaling
