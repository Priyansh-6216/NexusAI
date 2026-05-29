# Service Architecture and Implementation Details

Deep-dive into each microservice, their responsibilities, and implementation patterns.

---

## API Gateway (Port 8080)

**Framework**: Spring Cloud Gateway  
**Language**: Java (Spring Boot)  
**Database**: PostgreSQL (shared schemas)

### Responsibilities

1. **Request Routing**: Direct API requests to appropriate services
2. **Authentication**: Validate JWT tokens, enforce authentication
3. **Authorization**: Check RBAC roles and permissions
4. **Rate Limiting**: Prevent abuse with token-bucket algorithm
5. **Request/Response**: Log, trace, and aggregate responses
6. **Circuit Breaking**: Fallback when downstream services fail
7. **Health Aggregation**: Check all service health endpoints

### Key Endpoints

```
GET  /gateway/status          - Combined health check
GET  /gateway/metrics         - Gateway performance metrics
GET  /gateway/config          - Current configuration
GET  /gateway/routes          - Available routes
POST /gateway/reload-config   - Reload configuration
```

### Implementation Pattern

```
Client Request
    ↓
Authentication Filter (JWT validation)
    ↓
Authorization Filter (RBAC check)
    ↓
Rate Limiting Filter
    ↓
Route Match (path prefix → service)
    ↓
Circuit Breaker (fallback on failure)
    ↓
Service Call + Tracing
    ↓
Response Aggregation + Logging
    ↓
Client Response
```

### Internal Services

- Built on Spring Cloud Gateway
- Stateless (can scale horizontally)
- Uses Redis for distributed rate limiting and caching
- Includes actuator for operational metrics

---

## Auth Service (Port 8081)

**Framework**: Spring Boot  
**Language**: Java  
**Database**: PostgreSQL (auth schema)

### Responsibilities

1. **User Registration**: Create accounts with password validation
2. **Authentication**: JWT token issuance on successful login
3. **Token Refresh**: Issue new tokens using refresh token
4. **Token Revocation**: Invalidate tokens on logout
5. **RBAC**: Manage roles and permissions
6. **Session Management**: Track active sessions
7. **Password Management**: Secure password hashing and reset
8. **Account Lockout**: Prevent brute force attacks

### Database Schema

```
users
  ├─ user_id (PK)
  ├─ email (UK)
  ├─ password_hash
  ├─ display_name
  ├─ is_active
  ├─ last_login
  └─ created_at

roles
  ├─ role_id (PK)
  ├─ role_name (UK)
  └─ description

user_roles (junction table)
  ├─ user_id (FK)
  └─ role_id (FK)

permissions
  ├─ permission_id (PK)
  ├─ permission_name (UK)
  └─ description

role_permissions (junction table)
  ├─ role_id (FK)
  └─ permission_id (FK)
```

### Default Roles

| Role | Permissions | Use Case |
| --- | --- | --- |
| `admin` | All | Administrative access, system configuration |
| `developer` | read_repos, write_reviews, read_incidents | Developer workflow |
| `reviewer` | read_repos, write_reviews | Code review focus |
| `observer` | read:* | Read-only dashboards and data |

### Security Features

- **Password Hashing**: bcrypt with 12 rounds
- **JWT Signing**: HS256 with 32+ character secret
- **Token Expiry**: 1 hour for access, 7 days for refresh
- **Account Lockout**: 5 failed attempts → 15 min lockout
- **Session Validation**: Checked against database every request
- **HTTPS Only**: TLS/SSL required in production

---

## Monitoring Service (Port 8082)

**Framework**: Spring Boot  
**Language**: Java  
**Database**: PostgreSQL (monitoring schema)

### Responsibilities

1. **Metrics Collection**: Scrape metrics from all services and Kubernetes
2. **Metrics Aggregation**: Store time-series data
3. **Health Status**: Determine overall platform health
4. **Alert Generation**: Trigger alerts on threshold breach
5. **Performance Analysis**: Calculate percentiles (p95, p99)
6. **Trend Analysis**: Identify trends and anomalies

### Data Collection

Collects metrics from:
- **Services**: Prometheus endpoints on :8080/metrics
- **Kubernetes**: kube-state-metrics, kubelet
- **Databases**: PostgreSQL pg_stat_statements
- **Infrastructure**: Node exporter, disk usage

### Database Schema

```
metrics (time-series)
  ├─ metric_id (PK)
  ├─ service_name
  ├─ metric_type (response_time, error_rate, throughput, cpu, memory)
  ├─ value
  ├─ timestamp (indexed for range queries)
  └─ tags (JSON)

health_snapshots
  ├─ snapshot_id (PK)
  ├─ service_name
  ├─ status (healthy, degraded, down)
  ├─ response_time_ms
  └─ checked_at
```

### Key Metrics

- **Response Time**: min, max, avg, p50, p95, p99
- **Throughput**: requests/second, errors/second
- **Error Rate**: percentage of failed requests
- **Resource Usage**: CPU %, memory %, disk %
- **Queue Depth**: Kafka lag, job queue size

---

## Incident Service (Port 8083)

**Framework**: Spring Boot  
**Language**: Java  
**Database**: PostgreSQL (incidents schema)

### Responsibilities

1. **Incident Tracking**: Create and manage incidents
2. **Alert Correlation**: Link related alerts into incidents
3. **Root Cause Analysis**: AI-powered RCA using LLM Router
4. **Responder Assignment**: Route incidents to on-call engineers
5. **Timeline Management**: Track incident lifecycle
6. **Remediation Suggestions**: Propose fixes via AI agents

### Database Schema

```
incidents
  ├─ incident_id (PK)
  ├─ title
  ├─ description
  ├─ severity (critical, high, medium, low)
  ├─ status (open, in_progress, resolved, closed)
  ├─ detected_at
  ├─ resolved_at
  ├─ assigned_to (FK users.user_id)
  └─ tags (JSON array)

incident_events
  ├─ event_id (PK)
  ├─ incident_id (FK)
  ├─ event_type (metric_spike, error_spike, alert)
  ├─ data (JSON)
  └─ created_at

alert_correlations
  ├─ correlation_id (PK)
  ├─ incident_id (FK)
  ├─ alert_id
  ├─ confidence
  └─ created_at
```

### Incident Lifecycle

```
Detected
    ↓ (Alert correlated)
Open
    ↓ (Assigned to engineer)
In Progress
    ↓ (Fix applied)
Resolved
    ↓ (Auto-close after 24h or manual)
Closed
```

### Integration Points

- **Monitoring Service**: Receives metric alerts
- **LLM Router**: RCA analysis prompts
- **AI Agent Service**: Automation playbook execution
- **Kafka**: Publishes incident.* events

---

## Code Review Service (Port 8084)

**Framework**: Spring Boot  
**Language**: Java  
**Database**: PostgreSQL (reviews schema)

### Responsibilities

1. **PR Analysis**: Analyze pull request diffs
2. **Security Scanning**: SAST, vulnerability detection
3. **Performance Analysis**: Identify performance regressions
4. **Test Coverage**: Analyze test impact and suggestions
5. **Best Practices**: Code style and standards compliance
6. **Report Generation**: Structured review feedback

### Analysis Areas

| Category | Examples |
| --- | --- |
| Security | SQL injection, XSS, secrets, insecure crypto |
| Performance | N+1 queries, missing indexes, inefficient algorithms |
| Testing | Missing tests, low coverage, untested edge cases |
| Style | Naming conventions, complexity, documentation |
| Architecture | Layering violations, coupling, modularity |

### Database Schema

```
code_reviews
  ├─ review_id (PK)
  ├─ repository_id (FK)
  ├─ pr_number
  ├─ status (queued, in_progress, completed, failed)
  ├─ summary (text)
  └─ completed_at

review_findings
  ├─ finding_id (PK)
  ├─ review_id (FK)
  ├─ file_path
  ├─ line_number
  ├─ type (security, performance, style, testing)
  ├─ severity (critical, high, medium, low)
  ├─ message (text)
  ├─ suggestion (text)
  └─ auto_fixable (boolean)

review_metrics
  ├─ metric_id (PK)
  ├─ review_id (FK)
  ├─ files_changed
  ├─ lines_added
  ├─ lines_deleted
  └─ complexity_delta
```

### Review Workflow

```
PR Opened
    ↓
Analysis Queued (Kafka)
    ↓
LLM Analysis (via LLM Router)
    ↓
Finding Categorization & Ranking
    ↓
Report Generation
    ↓
Feedback Posted to PR
    ↓
Developer Review & Action
```

---

## Repository Intelligence Service (Port 8085)

**Framework**: Spring Boot (with Python embeddings)  
**Language**: Java  
**Database**: PostgreSQL (repos schema) + Qdrant (vector DB)

### Responsibilities

1. **Repository Indexing**: Clone and parse repositories
2. **Code Embedding**: Generate vector embeddings
3. **Semantic Search**: Natural language repo queries
4. **Dependency Analysis**: Map and analyze dependencies
5. **Architecture Visualization**: Generate architecture diagrams
6. **Codebase Summarization**: AI-generated summaries

### Indexing Pipeline

```
GitHub Repo
    ↓
Clone to /tmp (with depth limit)
    ↓
Parse (language detection, AST)
    ↓
Code Chunk Creation (512 token chunks with 50 overlap)
    ↓
Embedding Generation (sentence-transformers)
    ↓
Vector Insertion (Qdrant)
    ↓
Metadata Storage (PostgreSQL)
    ↓ Kafka Event
Complete
```

### Database Schema

```
repositories
  ├─ repo_id (PK)
  ├─ owner
  ├─ name
  ├─ url
  ├─ default_branch
  ├─ last_indexed_at
  └─ indexed_commit_sha

code_files
  ├─ file_id (PK)
  ├─ repo_id (FK)
  ├─ file_path
  ├─ language
  ├─ content_hash
  └─ lines_of_code

code_chunks
  ├─ chunk_id (PK)
  ├─ file_id (FK)
  ├─ content
  ├─ line_start
  ├─ line_end
  ├─ embedding_id (FK → Qdrant)
  └─ language
```

### Semantic Search Example

```
Query: "How is authentication handled?"
    ↓
Generate Query Embedding (sentence-transformers)
    ↓
Vector Search in Qdrant (top 10, threshold 0.7)
    ↓
Rank Results by Relevance
    ↓
Return with Context Preview
```

---

## LLM Router Service (Port 8086)

**Framework**: Spring Boot  
**Language**: Java  
**Database**: PostgreSQL (llm_router schema)

### Responsibilities

1. **Model Selection**: Choose best model for task
2. **Prompt Optimization**: Tailor prompts for selected model
3. **Cost Optimization**: Minimize token usage
4. **Fallback Handling**: Route to alternate model on failure
5. **Token Accounting**: Track usage and costs
6. **Model Health**: Monitor model provider status

### Routing Policies

Configurable per task:

```yaml
policies:
  code_review:
    strategy: quality_first
    primary: gpt-4
    secondary: claude-3-opus
    fallback: llama-2-70b
    
  incident_analysis:
    strategy: latency_optimized
    primary: claude-3-opus
    secondary: gpt-4
    fallback: llama-2-70b
    
  repo_summarization:
    strategy: cost_optimized
    primary: llama-2-70b
    secondary: gpt-4
    fallback: claude-3-opus
```

### Cost Calculation

```
Total Cost = 
  (Input Tokens × $input_per_1k) + 
  (Output Tokens × $output_per_1k) +
  API Call Fee
```

Example: GPT-4 @ $0.03/$0.06 per 1K tokens:
- 100 input + 200 output = $0.003 + $0.012 = $0.015

---

## AI Agent Service (Port 8087)

**Framework**: Spring Boot  
**Language**: Java  
**Database**: PostgreSQL (agents schema) + Redis (state)

### Responsibilities

1. **Agent Orchestration**: Multi-agent workflow management
2. **Tool Invocation**: Execute available tools (code execution, API calls, etc.)
3. **Memory Management**: Track agent context and history
4. **Tool Registry**: Maintain available tools and capabilities
5. **Workflow Execution**: Execute incident playbooks and automations
6. **Error Handling**: Graceful fallback on tool failures

### Agent Types

| Agent | Task | Tools |
| --- | --- | --- |
| Incident Analyzer | Root cause analysis | query_metrics, search_logs, invoke_llm |
| Code Quality Bot | Code analysis | parse_code, lint_check, suggest_refactors |
| DevOps Bot | Infrastructure tasks | query_k8s, deploy_service, run_command |

### Tool Registry

```
Available Tools:
  ├─ query_metrics (read only)
  │   └─ Query Prometheus for metrics
  ├─ search_logs (read only)
  │   └─ Search ELK for logs
  ├─ invoke_llm (external)
  │   └─ Call LLM Router service
  ├─ parse_code (internal)
  │   └─ Parse and analyze code
  └─ deploy_service (write)
      └─ Trigger deployment pipeline
```

### Execution Model

```
User Request → Task Queued → Agent Allocated
    ↓
Agent Reasoning Loop:
  1. Analyze task and available tools
  2. Decide which tool to invoke
  3. Execute tool with parameters
  4. Process result
  5. Update internal state
  6. Repeat if more steps needed
    ↓
Task Complete → Results Stored → User Notified
```

---

## AI Services (Python, Port 8000)

**Framework**: FastAPI  
**Language**: Python  

### Responsibilities

1. **Embeddings**: Generate sentence embeddings
2. **RAG Retrieval**: Semantic search and retrieval
3. **Text Generation**: LLM integration and prompting
4. **Document Processing**: PDF, code, structured data parsing
5. **Vector Operations**: Similarity search, clustering

### Endpoints

```
POST /embeddings
  └─ Generate embedding for text

POST /search
  └─ Semantic search against vector DB

POST /generate
  └─ Generate text using LLM

POST /parse-document
  └─ Parse and chunk document

GET /models
  └─ List available models
```

