# Local Development

Day 6 packages the NexusAI workspace as a Docker Compose stack.

## Start

```bash
docker compose up --build
```

The frontend is served at `http://localhost:3000`.

## Core Ports

| Service | URL |
| --- | --- |
| Frontend | `http://localhost:3000` |
| API Gateway | `http://localhost:8080/gateway/status` |
| Auth Service | `http://localhost:8081/api/auth/health` |
| Monitoring Service | `http://localhost:8082/api/monitoring/health` |
| Incident Service | `http://localhost:8083/api/incidents/health` |
| Code Review Service | `http://localhost:8084/api/reviews/health` |
| Repo Intelligence Service | `http://localhost:8085/api/repos/health` |
| LLM Router Service | `http://localhost:8086/api/llm/health` |
| AI Agent Service | `http://localhost:8087/api/agents/health` |
| AI Services | `http://localhost:8000` |
| PostgreSQL | `localhost:5432` |
| Redis | `localhost:6379` |
| Kafka | `localhost:9092` |
| Qdrant | `http://localhost:6333` |

## Stop

```bash
docker compose down
```

## Reset Data

PostgreSQL init scripts run only when the database volume is first created.

```bash
docker compose down -v
docker compose up --build
```

## Day 6 Notes

- Java services use multi-stage Maven builds and lightweight JRE runtime images.
- The frontend builds static Next.js output and serves it from Nginx.
- Service containers expose health checks for Compose orchestration.
- Docker build contexts exclude local dependencies and generated output via `.dockerignore`.
