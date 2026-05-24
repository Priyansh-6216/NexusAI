# NexusAI Service Definitions

## Service Responsibilities

### API Gateway

- Central ingress point
- Request routing
- Authentication and authorization enforcement
- API aggregation and fallback handling

### Auth Service

- User registration and login
- JWT access tokens and refresh tokens
- Role-based access control
- Session management

### Monitoring Service

- Kubernetes and cloud metrics ingestion
- Aggregation of CPU, memory, network, disk, and pod health
- Stores metrics snapshots in PostgreSQL
- Publishes alert events to Kafka

### Incident Service

- Tracks incidents and alerts
- Correlates logs, metrics, and events
- Provides root cause analysis context
- Generates remediation suggestions

### Code Review Service

- Analyzes pull requests and code changes
- Performs security and performance scanning
- Generates review comments and improvement suggestions
- Creates unit/integration test recommendations

### Repo Intelligence Service

- Ingests GitHub repositories
- Parses code, dependencies, and structure
- Builds embeddings and vector indexes
- Answers natural language repo questions

### LLM Router Service

- Chooses the best language model per task
- Optimizes for latency, cost, and capability
- Handles model failover and retries

### AI Agent Service

- Coordinates multi-agent workflows
- Maintains agent memory and tool registry
- Executes automation tasks and incident playbooks

## Day 4 Service Contracts

| Service | Port | Starter endpoints |
| --- | ---: | --- |
| API Gateway | 8080 | `GET /gateway/status` |
| Auth Service | 8081 | `GET /api/auth/health`, `GET /api/auth/capabilities` |
| Monitoring Service | 8082 | `GET /api/monitoring/health`, `GET /api/monitoring/summary` |
| Incident Service | 8083 | `GET /api/incidents/health`, `GET /api/incidents/summary` |
| Code Review Service | 8084 | `GET /api/reviews/health`, `GET /api/reviews/capabilities` |
| Repo Intelligence Service | 8085 | `GET /api/repos/health`, `GET /api/repos/capabilities` |
| LLM Router Service | 8086 | `GET /api/llm/health`, `GET /api/llm/policies` |
| AI Agent Service | 8087 | `GET /api/agents/health`, `GET /api/agents/registry` |
