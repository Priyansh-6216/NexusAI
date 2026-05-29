# NexusAI API Reference

Complete API reference for all NexusAI backend services. All endpoints require JWT authentication via `Authorization: Bearer {token}` header unless otherwise noted.

**Base URL (Local Dev)**: `http://localhost:8080`  
**Base URL (Production)**: `https://api.nexusai.com`

---

## API Gateway

### Health Check

Get gateway and all downstream services health status.

```http
GET /gateway/status HTTP/1.1
Host: localhost:8080
```

**Response** (200 OK):
```json
{
  "status": "healthy",
  "timestamp": "2026-05-29T15:15:39Z",
  "services": {
    "auth": { "status": "healthy", "responseTime": 12 },
    "monitoring": { "status": "healthy", "responseTime": 8 },
    "incidents": { "status": "healthy", "responseTime": 15 },
    "reviews": { "status": "healthy", "responseTime": 45 },
    "repos": { "status": "healthy", "responseTime": 23 },
    "llm": { "status": "healthy", "responseTime": 18 },
    "agents": { "status": "healthy", "responseTime": 10 }
  },
  "uptime_seconds": 864000
}
```

---

## Auth Service

### Register User

Create a new user account.

```http
POST /api/auth/register HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "display_name": "John Doe"
}
```

**Response** (201 Created):
```json
{
  "user_id": 42,
  "email": "user@example.com",
  "display_name": "John Doe",
  "created_at": "2026-05-29T15:15:39Z"
}
```

**Error** (400 Bad Request):
```json
{
  "error": "email_already_exists",
  "message": "Email already registered"
}
```

### Login

Authenticate and receive JWT tokens.

```http
POST /api/auth/login HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "token_type": "Bearer",
  "user": {
    "user_id": 42,
    "email": "user@example.com",
    "display_name": "John Doe",
    "roles": ["user", "developer"]
  }
}
```

### Refresh Token

Get a new access token using refresh token.

```http
POST /api/auth/refresh HTTP/1.1
Host: localhost:8080
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "token_type": "Bearer"
}
```

### Get Current User

Get profile of authenticated user.

```http
GET /api/auth/me HTTP/1.1
Host: localhost:8080
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "user_id": 42,
  "email": "user@example.com",
  "display_name": "John Doe",
  "roles": ["user", "developer"],
  "permissions": ["read:repos", "write:reviews", "read:incidents"],
  "created_at": "2026-05-29T14:00:00Z",
  "last_login": "2026-05-29T15:10:00Z"
}
```

### Get User Capabilities

Get available actions for authenticated user.

```http
GET /api/auth/capabilities HTTP/1.1
Host: localhost:8080
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "capabilities": {
    "can_review": true,
    "can_manage_incidents": false,
    "can_configure_repos": true,
    "can_manage_users": false,
    "can_view_metrics": true
  },
  "rate_limits": {
    "reviews_per_hour": 50,
    "incidents_per_hour": 100,
    "api_calls_per_minute": 1000
  }
}
```

### Logout

Invalidate current session.

```http
POST /api/auth/logout HTTP/1.1
Host: localhost:8080
Authorization: Bearer {token}
```

**Response** (204 No Content)

---

## Monitoring Service

### Health Check

```http
GET /api/monitoring/health HTTP/1.1
Host: localhost:8080
```

**Response** (200 OK):
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "uptime_ms": 1234567
}
```

### Platform Summary

Get overview of all monitored systems.

```http
GET /api/monitoring/summary HTTP/1.1
Host: localhost:8080
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "summary": {
    "healthy_services": 8,
    "unhealthy_services": 0,
    "total_services": 8,
    "average_response_time_ms": 45,
    "error_rate_percent": 0.02,
    "cpu_usage_percent": 34.5,
    "memory_usage_percent": 62.1,
    "disk_usage_percent": 45.0
  },
  "last_updated": "2026-05-29T15:15:30Z",
  "next_update": "2026-05-29T15:16:30Z"
}
```

### Get Metrics

Query metrics for services and infrastructure.

```http
GET /api/monitoring/metrics?service=auth&metric=response_time&start=2026-05-29T00:00:00Z&end=2026-05-29T15:15:39Z&interval=1m HTTP/1.1
Host: localhost:8080
Authorization: Bearer {token}
```

**Query Parameters:**
- `service`: Service name or "all" (required)
- `metric`: response_time, error_rate, throughput, cpu, memory (required)
- `start`: ISO 8601 timestamp (required)
- `end`: ISO 8601 timestamp (required)
- `interval`: 1m, 5m, 15m, 1h (optional, default: 5m)

**Response** (200 OK):
```json
{
  "metric": "response_time",
  "service": "auth",
  "datapoints": [
    { "timestamp": "2026-05-29T15:00:00Z", "value": 12.5 },
    { "timestamp": "2026-05-29T15:01:00Z", "value": 13.2 },
    { "timestamp": "2026-05-29T15:02:00Z", "value": 11.8 }
  ],
  "stats": {
    "min": 11.8,
    "max": 13.2,
    "avg": 12.5,
    "p95": 13.1,
    "p99": 13.2
  }
}
```

---

## Incident Service

### Health Check

```http
GET /api/incidents/health HTTP/1.1
Host: localhost:8080
```

**Response** (200 OK):
```json
{
  "status": "healthy",
  "version": "1.0.0"
}
```

### Get Incidents

List incidents with optional filtering.

```http
GET /api/incidents?status=open&severity=high&limit=50&offset=0 HTTP/1.1
Host: localhost:8080
Authorization: Bearer {token}
```

**Query Parameters:**
- `status`: open, in_progress, resolved, closed
- `severity`: critical, high, medium, low
- `limit`: Max results (default: 20, max: 100)
- `offset`: Pagination offset (default: 0)

**Response** (200 OK):
```json
{
  "incidents": [
    {
      "incident_id": 1001,
      "title": "Database connection timeout",
      "description": "Auth service unable to connect to PostgreSQL",
      "severity": "critical",
      "status": "open",
      "detected_at": "2026-05-29T15:00:00Z",
      "detected_by": "monitoring_service",
      "assigned_to": null,
      "tags": ["database", "connectivity"]
    }
  ],
  "total": 5,
  "limit": 50,
  "offset": 0
}
```

### Create Incident

Manually create an incident.

```http
POST /api/incidents HTTP/1.1
Host: localhost:8080
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "API Gateway latency spike",
  "description": "Response times elevated for 15 minutes",
  "severity": "high",
  "tags": ["performance", "gateway"]
}
```

**Response** (201 Created):
```json
{
  "incident_id": 1002,
  "title": "API Gateway latency spike",
  "description": "Response times elevated for 15 minutes",
  "severity": "high",
  "status": "open",
  "detected_at": "2026-05-29T15:15:39Z",
  "created_by": 42,
  "tags": ["performance", "gateway"]
}
```

### Get Incident Root Cause

Analyze incident with AI root cause analysis.

```http
GET /api/incidents/{incident_id}/root-cause HTTP/1.1
Host: localhost:8080
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "incident_id": 1001,
  "analysis": {
    "root_cause": "PostgreSQL connection pool exhaustion",
    "confidence": 0.92,
    "supporting_evidence": [
      "Auth service showing 100% connection utilization",
      "Query performance degraded 5x at 2026-05-29T15:00:00Z",
      "No recent deployments to database layer"
    ],
    "affected_services": ["auth-service", "monitoring-service"],
    "suggested_remediation": [
      "Increase connection pool size from 20 to 50",
      "Review long-running queries in auth-service",
      "Enable connection timeout monitoring"
    ]
  },
  "analysis_timestamp": "2026-05-29T15:15:39Z"
}
```

### Update Incident

Update incident status or assignment.

```http
PATCH /api/incidents/{incident_id} HTTP/1.1
Host: localhost:8080
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "in_progress",
  "assigned_to": 42
}
```

**Response** (200 OK):
```json
{
  "incident_id": 1001,
  "title": "Database connection timeout",
  "severity": "critical",
  "status": "in_progress",
  "assigned_to": 42,
  "updated_at": "2026-05-29T15:15:39Z"
}
```

---

## Code Review Service

### Health Check

```http
GET /api/reviews/health HTTP/1.1
Host: localhost:8080
```

**Response** (200 OK):
```json
{
  "status": "healthy",
  "version": "1.0.0"
}
```

### Get Capabilities

```http
GET /api/reviews/capabilities HTTP/1.1
Host: localhost:8080
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "capabilities": {
    "security_scanning": true,
    "performance_analysis": true,
    "test_generation": true,
    "architecture_review": true,
    "best_practices": true
  },
  "supported_languages": ["javascript", "python", "java", "go", "rust", "sql"],
  "max_file_size_mb": 10,
  "max_lines_per_review": 5000
}
```

### Analyze Code

Submit code for AI review.

```http
POST /api/reviews/analyze HTTP/1.1
Host: localhost:8080
Authorization: Bearer {token}
Content-Type: application/json

{
  "repository_id": 1,
  "pull_request_number": 42,
  "base_branch": "main",
  "head_branch": "feature/auth-refresh",
  "focus_areas": ["security", "performance", "testing"]
}
```

**Response** (202 Accepted):
```json
{
  "review_job_id": "rev_abc123def456",
  "status": "queued",
  "repository_id": 1,
  "pull_request_number": 42,
  "created_at": "2026-05-29T15:15:39Z",
  "estimated_completion": "2026-05-29T15:20:00Z"
}
```

### Get Review Results

Get AI review feedback for a PR.

```http
GET /api/reviews/jobs/{review_job_id} HTTP/1.1
Host: localhost:8080
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "review_job_id": "rev_abc123def456",
  "status": "completed",
  "repository_id": 1,
  "pull_request_number": 42,
  "summary": "Good PR overall. Consider improving error handling in refresh token flow.",
  "findings": [
    {
      "file": "src/auth/refresh.ts",
      "line": 42,
      "type": "security",
      "severity": "medium",
      "message": "Token refresh not invalidating old tokens",
      "suggestion": "Implement token revocation list in Redis"
    },
    {
      "file": "src/auth/jwt.ts",
      "line": 15,
      "type": "performance",
      "severity": "low",
      "message": "Missing caching for public keys",
      "suggestion": "Cache RSA public keys for 24 hours"
    }
  ],
  "test_suggestions": [
    "Test concurrent token refresh requests",
    "Test refresh with expired tokens",
    "Test token revocation propagation"
  ],
  "completed_at": "2026-05-29T15:17:23Z"
}
```

---

## Repository Intelligence Service

### Health Check

```http
GET /api/repos/health HTTP/1.1
Host: localhost:8080
```

**Response** (200 OK):
```json
{
  "status": "healthy",
  "version": "1.0.0"
}
```

### Get Capabilities

```http
GET /api/repos/capabilities HTTP/1.1
Host: localhost:8080
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "capabilities": {
    "github_integration": true,
    "semantic_search": true,
    "dependency_analysis": true,
    "architecture_visualization": true,
    "code_generation": true
  },
  "max_repo_size_gb": 5,
  "supported_vcs": ["github"]
}
```

### Index Repository

Begin indexing a GitHub repository.

```http
POST /api/repos/index HTTP/1.1
Host: localhost:8080
Authorization: Bearer {token}
Content-Type: application/json

{
  "owner": "microsoft",
  "repository": "typescript",
  "github_token": "ghp_..."
}
```

**Response** (202 Accepted):
```json
{
  "index_job_id": "idx_xyz789abc123",
  "owner": "microsoft",
  "repository": "typescript",
  "status": "started",
  "created_at": "2026-05-29T15:15:39Z",
  "estimated_completion": "2026-05-29T15:45:00Z"
}
```

### Semantic Search

Search repository using natural language.

```http
POST /api/repos/{repo_id}/search HTTP/1.1
Host: localhost:8080
Authorization: Bearer {token}
Content-Type: application/json

{
  "query": "How is authentication handled?",
  "limit": 10,
  "threshold": 0.7
}
```

**Response** (200 OK):
```json
{
  "repository_id": 1,
  "query": "How is authentication handled?",
  "results": [
    {
      "file": "src/auth/jwt.ts",
      "lines": "12-34",
      "relevance": 0.95,
      "preview": "export function verifyJWT(token: string): User { ... }"
    },
    {
      "file": "src/middleware/auth.ts",
      "lines": "1-50",
      "relevance": 0.88,
      "preview": "export const authMiddleware = (req, res, next) => { ... }"
    }
  ],
  "search_time_ms": 234
}
```

### Get Repository Insights

Analyze repository structure and dependencies.

```http
GET /api/repos/{repo_id}/insights HTTP/1.1
Host: localhost:8080
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "repository_id": 1,
  "owner": "microsoft",
  "name": "typescript",
  "insights": {
    "total_files": 1203,
    "total_lines": 250000,
    "languages": {
      "typescript": 85.2,
      "javascript": 10.1,
      "json": 4.7
    },
    "dependencies": {
      "direct": 42,
      "transitive": 1203,
      "outdated": 3
    },
    "code_metrics": {
      "average_function_complexity": 3.2,
      "duplicate_code_percent": 1.1,
      "test_coverage_percent": 78.5
    }
  },
  "last_updated": "2026-05-29T15:15:00Z"
}
```

---

## LLM Router Service

### Health Check

```http
GET /api/llm/health HTTP/1.1
Host: localhost:8080
```

**Response** (200 OK):
```json
{
  "status": "healthy",
  "version": "1.0.0"
}
```

### Get Available Models

```http
GET /api/llm/models HTTP/1.1
Host: localhost:8080
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "models": [
    {
      "id": "gpt-4",
      "provider": "openai",
      "capabilities": ["reasoning", "code", "multimodal"],
      "cost_per_1k_tokens": 0.03,
      "latency_ms_avg": 2500,
      "availability_percent": 99.9
    },
    {
      "id": "claude-3-opus",
      "provider": "anthropic",
      "capabilities": ["reasoning", "code", "long_context"],
      "cost_per_1k_tokens": 0.015,
      "latency_ms_avg": 1800,
      "availability_percent": 99.95
    },
    {
      "id": "llama-2-70b",
      "provider": "together",
      "capabilities": ["code", "general"],
      "cost_per_1k_tokens": 0.001,
      "latency_ms_avg": 800,
      "availability_percent": 95.0
    }
  ]
}
```

### Get Routing Policies

```http
GET /api/llm/policies HTTP/1.1
Host: localhost:8080
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "policies": {
    "code_review": {
      "primary": "gpt-4",
      "secondary": "claude-3-opus",
      "fallback": "llama-2-70b",
      "criteria": "highest_accuracy"
    },
    "incident_analysis": {
      "primary": "claude-3-opus",
      "secondary": "gpt-4",
      "fallback": "llama-2-70b",
      "criteria": "best_latency"
    },
    "repo_summarization": {
      "primary": "claude-3-opus",
      "secondary": "gpt-4",
      "criteria": "cost_optimized"
    }
  }
}
```

### Invoke Model

Send prompt to router for model selection and inference.

```http
POST /api/llm/invoke HTTP/1.1
Host: localhost:8080
Authorization: Bearer {token}
Content-Type: application/json

{
  "task": "code_review",
  "prompt": "Review this function for security issues: ...",
  "max_tokens": 1000,
  "temperature": 0.2
}
```

**Response** (200 OK):
```json
{
  "task": "code_review",
  "model_used": "gpt-4",
  "provider": "openai",
  "completion": "The function has a potential SQL injection vulnerability...",
  "tokens_used": 245,
  "cost": 0.0073,
  "latency_ms": 2341
}
```

---

## AI Agent Service

### Health Check

```http
GET /api/agents/health HTTP/1.1
Host: localhost:8080
```

**Response** (200 OK):
```json
{
  "status": "healthy",
  "version": "1.0.0"
}
```

### Get Agent Registry

List available AI agents.

```http
GET /api/agents/registry HTTP/1.1
Host: localhost:8080
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "agents": [
    {
      "agent_id": "incident_analyzer",
      "name": "Incident Root Cause Analyzer",
      "description": "Analyzes incidents and suggests remediation",
      "capabilities": ["analyze_logs", "query_metrics", "suggest_fixes"],
      "tools_available": 15,
      "success_rate": 0.87
    },
    {
      "agent_id": "code_quality_bot",
      "name": "Code Quality Bot",
      "description": "Analyzes code and suggests improvements",
      "capabilities": ["analyze_code", "suggest_tests", "check_standards"],
      "tools_available": 8,
      "success_rate": 0.92
    }
  ]
}
```

### Execute Agent Task

Run an AI agent to complete a task.

```http
POST /api/agents/execute HTTP/1.1
Host: localhost:8080
Authorization: Bearer {token}
Content-Type: application/json

{
  "agent_id": "incident_analyzer",
  "incident_id": 1001,
  "task": "Analyze the database timeout incident and suggest fixes"
}
```

**Response** (202 Accepted):
```json
{
  "task_id": "task_def789ghi123",
  "agent_id": "incident_analyzer",
  "status": "in_progress",
  "created_at": "2026-05-29T15:15:39Z"
}
```

### Get Task Results

Retrieve results of an agent task.

```http
GET /api/agents/tasks/{task_id} HTTP/1.1
Host: localhost:8080
Authorization: Bearer {token}
```

**Response** (200 OK):
```json
{
  "task_id": "task_def789ghi123",
  "agent_id": "incident_analyzer",
  "status": "completed",
  "result": {
    "root_cause": "PostgreSQL connection pool exhaustion due to slow queries in auth service",
    "confidence": 0.92,
    "remediation_steps": [
      "1. Increase connection pool from 20 to 50",
      "2. Add query timeout of 30 seconds",
      "3. Implement connection pooling with PgBouncer"
    ],
    "estimated_resolution_time": "15 minutes"
  },
  "completed_at": "2026-05-29T15:18:45Z",
  "execution_time_ms": 186000
}
```

---

## Error Responses

All endpoints use standard HTTP status codes and return error details in JSON:

```json
{
  "error": "error_code",
  "message": "Human-readable error message",
  "details": {},
  "request_id": "req_abc123",
  "timestamp": "2026-05-29T15:15:39Z"
}
```

### Common Error Codes

| Status | Code | Description |
| --- | --- | --- |
| 400 | validation_error | Request validation failed |
| 401 | unauthorized | Authentication required or failed |
| 403 | forbidden | User lacks required permissions |
| 404 | not_found | Resource not found |
| 409 | conflict | Resource already exists or state conflict |
| 429 | rate_limited | Too many requests |
| 500 | internal_error | Server error |
| 503 | service_unavailable | Service temporarily unavailable |

---

## Rate Limiting

All endpoints enforce rate limiting:

- **Default**: 1000 requests/minute per user
- **Auth endpoints**: 10 requests/minute per IP
- **Review/Agent endpoints**: 50 requests/minute per user

Rate limit headers in responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1622308539
```

---

## Pagination

List endpoints support pagination:

```http
GET /api/incidents?limit=20&offset=0 HTTP/1.1
```

**Response includes**:
```json
{
  "items": [...],
  "total": 100,
  "limit": 20,
  "offset": 0
}
```

