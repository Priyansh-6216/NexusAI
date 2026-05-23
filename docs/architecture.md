# NexusAI Architecture

## High-Level Architecture

NexusAI is built as a modular enterprise microservices platform with the following layers:

- **Frontend**: React + Next.js + TailwindCSS
- **API Gateway**: Spring Cloud Gateway
- **Backend Microservices**: Spring Boot services for auth, monitoring, incidents, code review, repository intelligence, and agents
- **AI Services**: Python FastAPI services for embeddings, RAG, agent orchestration, and LLM routing
- **Event Streaming**: Kafka for async communication and workflow events
- **Databases**: PostgreSQL, Redis, and a vector database
- **Infrastructure**: Docker, Kubernetes, Terraform
- **Monitoring**: Prometheus, Grafana, ELK Stack

## Microservice Breakdown

- `api-gateway/`: request routing, authentication validation, gateway aggregation
- `auth-service/`: JWT, RBAC, user and session management
- `monitoring-service/`: Kubernetes metrics, cloud observability, metrics ingestion
- `incident-service/`: incident tracking, alert correlation, root cause analysis workflows
- `code-review-service/`: AI PR analysis, security scanning, test generation
- `repo-intelligence-service/`: repository ingest, repo summarization, semantic search
- `llm-router-service/`: model selection, prompt optimization, failover handling
- `ai-agent-service/`: multi-agent orchestration, tool calls, automation workflows
- `ai-services/`: Python-based AI utilities, embedding pipelines, retrieval services

## Communication Flow

1. Frontend sends requests to `api-gateway`
2. Gateway routes to backend services or AI services as needed
3. Services publish events to Kafka for async workflows and notifications
4. Monitoring and incident services consume metrics and logs
5. AI services use vector DB + embeddings for semantic queries

## Deployment Architecture

- Each service runs in its own container
- Core persistence is handled by PostgreSQL and Redis
- Kafka and Zookeeper provide event streaming
- Prometheus scrapes metrics from services and Kubernetes
- Grafana visualizes KPIs and alerting dashboards
- ELK ingests logs for search and root cause analysis
