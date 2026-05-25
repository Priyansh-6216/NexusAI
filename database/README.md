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

The schema includes baseline status checks, foreign keys, uniqueness constraints, and lookup indexes for the Day 4 service endpoints. It is intentionally service-oriented: each backend owns a logical schema while sharing one local database named `nexusai`.

## Ownership Matrix

| Service | PostgreSQL schema | Redis keys | Vector collections |
| --- | --- | --- | --- |
| auth-service | `auth` | `nexusai:auth:*` | none |
| monitoring-service | `monitoring` | `nexusai:monitoring:*` | none |
| incident-service | `incidents` | `nexusai:incident:*` | `incident_context` |
| code-review-service | `code_review` | `nexusai:review:*` | `repo_code_chunks` |
| repo-intelligence-service | `repo_intelligence` | `nexusai:repo:*` | `repo_code_chunks` |
| llm-router-service | `llm_router` | `nexusai:llm:*` | none |
| ai-agent-service | `agents` | `nexusai:agent:*` | `runbook_knowledge` |

## Redis

Redis key contracts are documented in `redis/keyspace.md`. Redis should hold ephemeral state only: sessions, locks, rate limits, provider health, and in-flight workflow progress.

## Qdrant

Vector collection definitions are documented in `qdrant/collections.json`.

Initial collections:

- `repo_code_chunks`
- `incident_context`
- `runbook_knowledge`

## Local Reset

Postgres init scripts run only when the Docker volume is created. To re-apply the Day 5 schema locally, remove the `postgres-data` volume and start the stack again.
