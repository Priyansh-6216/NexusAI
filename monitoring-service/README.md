# Monitoring Service

This service will aggregate Kubernetes and cloud metrics for NexusAI.

## Responsibilities

- Ingest metrics from Prometheus, Kubernetes, and CloudWatch
- Store metric snapshots in PostgreSQL
- Trigger alerts and notifications
- Serve dashboards and health summaries

## Technologies

- Spring Boot
- PostgreSQL
- Prometheus client
- Kafka events

## Next Steps

1. Define metrics ingestion APIs.
2. Implement metric storage and query endpoints.
3. Publish alert events to Kafka.

## Day 4 Endpoints

- `GET /api/monitoring/health` - monitoring service readiness
- `GET /api/monitoring/summary` - starter dashboard summary payload
