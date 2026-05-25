# Redis Keyspace Design

Redis is used for short-lived coordination, session state, request throttling, and live workflow status. Keys use the `nexusai:` prefix so shared Redis instances remain readable.

## Key Contracts

| Key pattern | Type | TTL | Owner | Purpose |
| --- | --- | ---: | --- | --- |
| `nexusai:auth:session:{sessionId}` | hash | 24h | auth-service | Authenticated session metadata and current user id |
| `nexusai:auth:refresh:{tokenId}` | string | 30d | auth-service | Refresh token allow-list state |
| `nexusai:gateway:ratelimit:{subject}:{window}` | string counter | 1m | api-gateway | Per-user or per-IP gateway throttling |
| `nexusai:monitoring:latest:{service}` | hash | 5m | monitoring-service | Latest health and metric rollup per service |
| `nexusai:incident:lock:{incidentId}` | string | 5m | incident-service | Prevent duplicate incident correlation work |
| `nexusai:review:run:{reviewRunId}` | hash | 12h | code-review-service | In-flight AI review state |
| `nexusai:repo:ingest:{repositoryId}` | hash | 24h | repo-intelligence-service | Repository ingestion progress |
| `nexusai:llm:provider-health:{provider}` | hash | 2m | llm-router-service | Provider latency, error rate, and availability snapshot |
| `nexusai:agent:workflow:{workflowRunId}` | hash | 24h | ai-agent-service | Agent workflow status and current step |

## Conventions

- Store durable records in PostgreSQL first; Redis is a cache or coordination layer.
- All serialized values should be JSON strings unless the key contract explicitly says hash.
- Expiring operational keys should use TTLs at write time.
- Locks should include a unique owner token so services can release only their own lock.
