# NexusAI Database Design

Day 5 defines the persistence contracts for the platform.

## PostgreSQL

The initial schema lives in `postgres/init/001_core_schema.sql`. Docker Compose mounts this directory into Postgres so a fresh local volume initializes automatically.

Logical schemas:

- `auth` - users, roles, user-role assignments, refresh tokens
- `monitoring` - metric snapshots and alert rules
- `incidents` - incidents and timeline events
- `code_review` - review runs and review findings
- `repo_intelligence` - repositories and indexed documents
- `llm_router` - model providers and routing decisions
- `agents` - agent definitions and workflow runs

## Redis

Redis key contracts are documented in `redis/keyspace.md`. Redis should hold ephemeral state only: sessions, locks, rate limits, provider health, and in-flight workflow progress.

## Qdrant

Vector collection definitions are documented in `qdrant/collections.json`.

Initial collections:

- `repo_code_chunks`
- `incident_context`
- `runbook_knowledge`
