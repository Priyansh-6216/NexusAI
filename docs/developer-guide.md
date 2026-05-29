# Developer Setup and Contributing Guide

## Prerequisites

Before setting up NexusAI for development, ensure you have:

### Required Tools

- **Docker & Docker Compose** (v20.10+)
  ```bash
  docker --version  # Docker version 20.10.0 or higher
  docker compose version  # Docker Compose version 2.0 or higher
  ```

- **Git** (v2.30+)
  ```bash
  git --version
  ```

- **Node.js & npm** (v18+) - For frontend development
  ```bash
  node --version  # v18.0.0 or higher
  npm --version
  ```

- **Java JDK** (v17+) - For backend services
  ```bash
  java -version  # OpenJDK 17 or higher
  ```

- **Python** (v3.10+) - For AI services
  ```bash
  python3 --version
  ```

### Optional Tools

- **Maven** (v3.8+) - For building Java services locally
- **IDE**: VS Code, IntelliJ IDEA, or similar
- **Postman/Insomnia** - For API testing
- **git-lfs** - For large file support

---

## Local Setup

### 1. Clone Repository

```bash
git clone https://github.com/Priyansh-6216/NexusAI.git
cd NexusAI
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and configure:

```env
# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8080

# Backend Services
GATEWAY_PORT=8080
AUTH_SERVICE_PORT=8081
MONITORING_SERVICE_PORT=8082
INCIDENT_SERVICE_PORT=8083
CODE_REVIEW_SERVICE_PORT=8084
REPO_INTELLIGENCE_SERVICE_PORT=8085
LLM_ROUTER_SERVICE_PORT=8086
AI_AGENT_SERVICE_PORT=8087
AI_SERVICES_PORT=8000

# Databases
DB_HOST=postgres
DB_PORT=5432
DB_NAME=nexusai
DB_USER=nexusai
DB_PASSWORD=nexusai_dev_password

REDIS_HOST=redis
REDIS_PORT=6379

QDRANT_HOST=qdrant
QDRANT_PORT=6333

# Kafka
KAFKA_BROKER=kafka:9092
KAFKA_ZOOKEEPER=zookeeper:2181

# LLM Keys (optional, leave empty for local development)
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
```

### 3. Start Development Stack

```bash
docker compose up --build
```

This starts:
- Frontend (Nginx) on `http://localhost:3000`
- API Gateway on `http://localhost:8080`
- All microservices on ports 8081-8087
- AI Services on `http://localhost:8000`
- PostgreSQL, Redis, Qdrant, Kafka

**First-time setup takes ~5-10 minutes**. Subsequent starts are faster.

### 4. Verify Services

Check all services are running:

```bash
curl http://localhost:8080/gateway/status
```

Expected response:
```json
{
  "status": "healthy",
  "services": { ... }
}
```

### 5. Initialize Demo Data (Optional)

```bash
# Load sample repositories and incidents
docker compose exec postgres psql -U nexusai -d nexusai -f /docker-entrypoint-initdb.d/seed-data.sql
```

---

## Development Workflows

### Frontend Development

```bash
# Start frontend in watch mode
cd frontend
npm install
npm run dev
```

Accessible at `http://localhost:3000`

**Key Commands:**
- `npm run build` - Production build
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript checks
- `npm run test` - Run tests

### Backend Service Development

#### Option 1: Using Docker (Recommended)

```bash
docker compose up --build
```

Services auto-reload on code changes.

#### Option 2: Local Development

Build and run a service locally:

```bash
cd auth-service
mvn clean install
mvn spring-boot:run
```

The service starts on its configured port (e.g., 8081 for Auth Service).

**Backend requires:**
- Running PostgreSQL (from Docker)
- Running Redis (from Docker)
- Gateway running (or direct service calls)

### AI Services Development

```bash
cd ai-services
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

---

## Testing

### Frontend Tests

```bash
cd frontend
npm run test                 # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage report
```

### Backend Tests

```bash
cd auth-service  # or any service
mvn test                    # Run all tests
mvn test -Dtest=UserTest    # Run specific test
mvn clean test -Pintegration  # Integration tests
```

### AI Services Tests

```bash
cd ai-services
pytest                      # Run all tests
pytest -v                   # Verbose output
pytest --cov               # Coverage report
```

### Integration Tests

```bash
# Run full integration test suite
docker compose up --build
docker compose exec api-gateway mvn verify -Pintegration
```

---

## Debugging

### View Service Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f api-gateway

# Last 100 lines
docker compose logs --tail=100 auth-service
```

### Connect Debugger

#### Java Services (IntelliJ)

1. Add debug JVM options to Docker:
   ```yaml
   environment:
     JAVA_TOOL_OPTIONS: "-agentlib:jdwp=transport=dt_socket,server=y,suspend=n,address=*:5005"
   ports:
     - "5005:5005"
   ```

2. In IntelliJ: Run → Edit Configurations → Remote
3. Set host: `localhost`, port: `5005`

#### Frontend (Chrome DevTools)

- Open `http://localhost:3000` in Chrome
- Press `F12` to open DevTools
- Use Console, Network, and Debugger tabs

#### Python Services

```bash
docker compose up -d
docker compose exec ai-services python -m pdb main.py
```

---

## Database Management

### Access PostgreSQL

```bash
docker compose exec postgres psql -U nexusai -d nexusai
```

Common commands:
```sql
\dt                          -- List tables
\d tablename                 -- Describe table
SELECT * FROM users LIMIT 5; -- Query data
```

### Reset Database

```bash
# Remove all data, reset to initial state
docker compose down -v
docker compose up --build
```

### Backup Database

```bash
docker compose exec postgres pg_dump -U nexusai nexusai > backup.sql
```

### Restore Database

```bash
cat backup.sql | docker compose exec -T postgres psql -U nexusai nexusai
```

### Redis CLI

```bash
docker compose exec redis redis-cli
```

Common commands:
```
KEYS *                       -- List all keys
GET key                      -- Get value
FLUSHDB                      -- Clear database
```

---

## Contributing

### Workflow

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/my-feature
   ```

2. **Make Changes**
   - Follow code style guidelines (see below)
   - Add tests for new functionality
   - Update documentation

3. **Run Tests Locally**
   ```bash
   # For your service
   mvn test  # Java
   pytest    # Python
   npm test  # JavaScript
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: Add new feature"
   ```

   Use conventional commits:
   - `feat:` - New feature
   - `fix:` - Bug fix
   - `docs:` - Documentation
   - `style:` - Code style (formatting)
   - `test:` - Add/update tests
   - `refactor:` - Code refactoring
   - `perf:` - Performance improvement

5. **Push and Create PR**
   ```bash
   git push origin feature/my-feature
   ```

6. **Address PR Feedback**
   - Make requested changes
   - Push updates (auto-updates PR)
   - Request re-review

7. **Merge**
   - PR approved by 2 reviewers
   - All CI checks pass
   - Squash and merge to main

### Code Style

#### Java (Spring Boot)

- **IDE**: Use IntelliJ IDEA formatting
- **Convention**: Google Java Style Guide
- **Naming**: camelCase for methods/variables
- **Imports**: Organize and remove unused

#### Python (FastAPI)

- **Formatter**: `black`
- **Linter**: `pylint`
- **Style**: PEP 8
- **Type hints**: Required

```bash
# Format code
black ai-services/

# Lint code
pylint ai-services/
```

#### JavaScript/TypeScript

- **Formatter**: Prettier
- **Linter**: ESLint
- **Convention**: Airbnb style guide
- **Imports**: Absolute imports preferred

```bash
# Format code
npm run format

# Lint code
npm run lint
```

### Documentation

Update docs when:
- **Adding API endpoints** → Update `docs/api-reference.md`
- **Changing configuration** → Update `docs/configuration.md`
- **Adding new service** → Update `docs/service-details.md`
- **Architecture changes** → Update `docs/diagrams.md`

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests added
- [ ] Integration tests added
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally
```

---

## Performance Optimization Tips

### Frontend

- Enable browser caching: `npm run build`
- Optimize images (use Next.js Image component)
- Code splitting: Use dynamic imports
- Lazy load components

### Backend

- Add database indexes for query optimization
- Use Redis for frequently accessed data
- Implement query pagination
- Profile slow endpoints with actuator

### Databases

- Run `ANALYZE` on PostgreSQL to optimize query planner
- Monitor slow queries: Enable log_min_duration_statement
- Index frequently queried columns
- Archive old data periodically

---

## Troubleshooting

### Service won't start

```bash
# Check logs
docker compose logs service-name

# Check port conflicts
lsof -i :8080

# Rebuild everything
docker compose down -v
docker compose up --build
```

### Out of memory

```bash
# Increase Docker memory limit
docker compose up -d

# Or edit docker-compose.yml:
# services:
#   api-gateway:
#     environment:
#       JAVA_OPTS: "-Xmx512m"
```

### Database connection errors

```bash
# Verify PostgreSQL is running
docker compose ps postgres

# Check credentials in .env
# Reset database
docker compose down -v && docker compose up postgres
```

### Network issues between services

```bash
# Check Docker network
docker network ls
docker network inspect nexusai_default

# Services must use service names (from docker-compose.yml)
# Not localhost, use: postgres, redis, etc.
```

---

## Deployment

For production deployment, see `docs/deployment.md`.

For Kubernetes deployment, see `kubernetes/README.md`.

