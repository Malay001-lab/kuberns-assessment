# Developer Cheat Sheet

## 🎯 Common Tasks

### Adding a New Environment Variable

**Backend:**

1. Add to `.env`:

   ```
   NEW_VAR=value
   ```

2. Access in `settings.py`:
   ```python
   NEW_VAR = os.getenv('NEW_VAR', 'default_value')
   ```

**Frontend:**

1. Add to `.env.local`:

   ```
   VITE_NEW_VAR=value
   ```

2. Access in code:
   ```javascript
   const newVar = import.meta.env.VITE_NEW_VAR;
   ```

---

### Adding a New API Endpoint

**Backend Steps:**

1. **Add model method** in `models.py`:

   ```python
   class WebApp(models.Model):
       # ... existing fields

       def get_deployment_info(self):
           return {
               'status': self.environment.instance.status,
               'logs': self.environment.instance.logs.count()
           }
   ```

2. **Add serializer** in `serializers.py`:

   ```python
   class NewSerializer(serializers.ModelSerializer):
       class Meta:
           model = WebApp
           fields = ['id', 'name', 'new_field']
   ```

3. **Add ViewSet method** in `views.py`:

   ```python
   class WebAppViewSet(viewsets.ModelViewSet):
       @action(detail=True, methods=['get'])
       def new_action(self, request, pk=None):
           webapp = self.get_object()
           data = webapp.get_deployment_info()
           return Response(data)
   ```

4. **URL is auto-generated** (no need to edit `urls.py`)

**Frontend Usage:**

1. **Add API method** in `webappAPI.js`:

   ```javascript
   getNewEndpoint: async (id) => {
     try {
       const response = await apiClient.get(`/webapps/${id}/new_action/`);
       return response.data;
     } catch (error) {
       throw error.response?.data || error.message;
     }
   };
   ```

2. **Use in component**:
   ```javascript
   const response = await webAppAPI.getNewEndpoint(id);
   ```

---

### Adding a New Form Field

**Page 1 (App Configuration):**

1. **Add to store** in `wizardStore.js`:

   ```javascript
   newField: '',
   setNewField: (value) => set({ newField: value }),
   ```

2. **Add to form** in `Page1.jsx`:

   ```javascript
   <Controller
     name="newField"
     control={control}
     rules={{ required: "Field is required" }}
     render={({ field }) => (
       <Input {...field} label="New Field" error={errors.newField?.message} />
     )}
   />
   ```

3. **Pass to API** in `Page2.jsx`:
   ```javascript
   formData.new_field = store.newField;
   ```

---

### Running Database Migrations

```bash
# Create migration for new model
python manage.py makemigrations

# View pending migrations
python manage.py showmigrations

# Apply migrations
python manage.py migrate

# Undo last migration (development only)
python manage.py migrate zero

# Show SQL for a migration
python manage.py sqlmigrate apps.core 0001
```

---

### Debugging Tips

**Backend Debugging:**

```python
# Print statements in views
print(f"Debug: {variable}")

# Use Python debugger
import pdb; pdb.set_trace()

# Django shell
python manage.py shell

# View logs
python manage.py runserver  # Logs appear in terminal
```

**Frontend Debugging:**

```javascript
// Console logging
console.log("Debug:", variable);

// Browser DevTools
// F12 in browser

// React DevTools
// Extension for Chrome/Firefox

// Source mapping
// All source maps available in dev mode
```

**Celery Debugging:**

```bash
# Celery logs appear in worker terminal
celery -A kuberns worker -l debug  # More verbose

# Test task directly
python manage.py shell
>>> from apps.core.tasks import deploy_instance
>>> result = deploy_instance.delay('instance-id')
>>> result.status
>>> result.result
```

---

### Database Queries

**Django ORM Examples:**

```python
# Get all webapps
webapps = WebApp.objects.all()

# Filter
active_apps = WebApp.objects.filter(plan='starter')

# Get single
app = WebApp.objects.get(id='some-id')

# Create
app = WebApp.objects.create(name='test', ...)

# Update
app.name = 'new_name'
app.save()

# Delete
app.delete()

# Related objects
environment = app.environment
instance = app.environment.instance
logs = app.environment.instance.logs.all()

# Count
count = WebApp.objects.count()

# Aggregate
from django.db.models import Count
by_plan = WebApp.objects.values('plan').annotate(count=Count('id'))
```

---

### Common Errors & Fixes

**"RelatedObjectDoesNotExist"**

- Cause: Accessing related object that doesn't exist
- Fix: Use `.get()` with try/except or check existence first

**"IntegrityError"**

- Cause: Duplicate or invalid data
- Fix: Check unique constraints and foreign key relationships

**"ValidationError"**

- Cause: Serializer validation failed
- Fix: Check all required fields and field types

**"Port Already in Use"**

- Cause: Another process using port
- Fix: Kill process or use different port

**"Database Connection Error"**

- Cause: PostgreSQL not running or wrong credentials
- Fix: Check `.env` and start PostgreSQL

---

### Frontend Component Template

```javascript
import React from "react";
import { motion } from "framer-motion";

export default function NewComponent() {
  const [state, setState] = React.useState(null);

  React.useEffect(() => {
    // Setup code
    return () => {
      // Cleanup code
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h1>Component Title</h1>
      {/* Component content */}
    </motion.div>
  );
}
```

---

### Backend View Template

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from .models import MyModel
from .serializers import MySerializer

class MyViewSet(viewsets.ModelViewSet):
    queryset = MyModel.objects.all()
    serializer_class = MySerializer
    permission_classes = [AllowAny]

    @action(detail=True, methods=['get', 'post'])
    def custom_action(self, request, pk=None):
        obj = self.get_object()
        # Do something
        return Response({'status': 'success'})
```

---

### Useful Git Commands

```bash
# Clone repository
git clone <repo-url>

# Create new branch
git checkout -b feature/new-feature

# Stage changes
git add .

# Commit changes
git commit -m "Add new feature"

# Push changes
git push origin feature/new-feature

# Create pull request
# (On GitHub website)

# Update from main
git fetch origin
git merge origin/main

# View changes
git diff
git log --oneline

# Undo changes
git checkout -- file.txt
git reset --soft HEAD~1
```

---

### Testing API Manually

**Using curl:**

```bash
# GET request
curl http://localhost:8000/api/webapps/

# POST request
curl -X POST http://localhost:8000/api/webapps/ \
  -H "Content-Type: application/json" \
  -d '{"name":"test"}'

# With authentication
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:8000/api/webapps/

# Save output to file
curl http://localhost:8000/api/webapps/ > response.json
```

**Using Postman:**

1. Import collection
2. Set variables
3. Use environment
4. Send requests
5. View responses
6. Save examples

**Using Python:**

```python
import requests

response = requests.get('http://localhost:8000/api/webapps/')
print(response.json())

response = requests.post('http://localhost:8000/api/webapps/', json={
    'name': 'test',
    'region': 'us-east-1'
})
print(response.status_code)
```

---

### Performance Tips

**Backend:**

- Use `select_related()` for foreign keys
- Use `prefetch_related()` for reverse relations
- Add database indexes on frequently queried fields
- Cache with Redis
- Use pagination

**Frontend:**

- Lazy load components
- Memoize expensive computations
- Optimize images
- Code splitting with Vite
- Minimize dependencies

---

### Security Best Practices

1. **Never commit sensitive data**:

   - Use `.env` files
   - Add to `.gitignore`
   - Use environment variables

2. **Validate all inputs**:

   - Backend: DRF serializers
   - Frontend: React Hook Form

3. **Use HTTPS in production**:

   - SSL certificates
   - Redirect HTTP to HTTPS

4. **Protect sensitive routes**:

   - Add authentication
   - Check permissions
   - Log access

5. **Keep dependencies updated**:
   - Regular security updates
   - Review vulnerabilities
   - Use tools like Snyk

---

### File Templates

**New Model:**

```python
class NewModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    # Add fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"NewModel: {self.id}"

    class Meta:
        ordering = ['-created_at']
```

**New Serializer:**

```python
class NewSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewModel
        fields = ['id', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
```

---

### Useful Tools

| Tool         | Purpose         | Command                       |
| ------------ | --------------- | ----------------------------- |
| Django Shell | Test code       | `python manage.py shell`      |
| pgAdmin      | Database GUI    | Visit `pgAdmin` web interface |
| Postman      | API testing     | `postman`                     |
| VS Code      | Code editor     | `code .`                      |
| Git          | Version control | `git` commands                |
| pip          | Package manager | `pip install`                 |
| npm          | Package manager | `npm install`                 |
| Redis CLI    | Redis testing   | `redis-cli`                   |

---

### Environment Setup Checklist

- [ ] Python virtual environment created and activated
- [ ] Backend requirements installed
- [ ] Frontend dependencies installed
- [ ] PostgreSQL running and configured
- [ ] Redis running
- [ ] `.env` files created with correct values
- [ ] Migrations applied
- [ ] Admin user created (optional)
- [ ] Backend server starts without errors
- [ ] Celery worker connects to Redis
- [ ] Frontend builds without errors

---

### Quick Links

| Resource        | Link                                   |
| --------------- | -------------------------------------- |
| Django Docs     | https://docs.djangoproject.com/        |
| DRF Docs        | https://www.django-rest-framework.org/ |
| React Docs      | https://react.dev                      |
| Vite Docs       | https://vitejs.dev                     |
| Tailwind CSS    | https://tailwindcss.com                |
| Celery Docs     | https://docs.celeryproject.org/        |
| Redis Docs      | https://redis.io/documentation         |
| PostgreSQL Docs | https://www.postgresql.org/docs/       |

---

### Project Root Locations

```
Backend:     /backend
Frontend:    /frontend
Postman:     /postman/kuberns-api.postman_collection.json
Docs:        /README.md, /API_DOCUMENTATION.md, etc.
Setup:       /setup.sh (Linux/macOS), /setup.bat (Windows)
```

---

**Happy Coding! 🚀**
