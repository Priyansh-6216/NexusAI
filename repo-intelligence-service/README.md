# Repo Intelligence Service

This service will ingest repositories, build embeddings, and provide semantic repository search.

## Responsibilities

- Import GitHub repositories
- Parse source code and metadata
- Build vector embeddings
- Answer repo intelligence queries

## Technologies

- Spring Boot
- PostgreSQL
- Kafka
- Vector DB connectors
- AI service integration

## Next Steps

1. Define repository ingestion model.
2. Add GitHub import endpoints.
3. Create semantic search APIs.

## Day 4 Endpoints

- `GET /api/repos/health` - repo intelligence service readiness
- `GET /api/repos/capabilities` - starter repository intelligence capability summary
