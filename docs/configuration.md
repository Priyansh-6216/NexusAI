# Configuration Reference

Complete reference for all NexusAI configuration options across services.

## Environment Variables

### API Gateway

| Variable | Default | Description |
| --- | --- | --- |
| `GATEWAY_PORT` | `8080` | Gateway listening port |
| `GATEWAY_TIMEOUT` | `30` | Request timeout in seconds |
| `MAX_REQUEST_SIZE` | `10485760` | Max request body size in bytes (10MB) |
| `ENABLE_CORS` | `true` | Enable CORS support |
| `CORS_ORIGINS` | `*` | Comma-separated allowed origins |
| `JWT_SECRET` | (required) | Secret for JWT signing |
| `JWT_ALGORITHM` | `HS256` | JWT algorithm |
| `RATE_LIMIT_ENABLED` | `true` | Enable rate limiting |
| `RATE_LIMIT_PER_MINUTE` | `1000` | Default rate limit |
| `AUTH_RETRY_ATTEMPTS` | `3` | Retries for auth validation |
| `CIRCUIT_BREAKER_THRESHOLD` | `50` | Error threshold % |
| `CIRCUIT_BREAKER_TIMEOUT` | `60` | Circuit open timeout (seconds) |

### Auth Service

| Variable | Default | Description |
| --- | --- | --- |
| `AUTH_SERVICE_PORT` | `8081` | Service port |
| `DB_HOST` | `postgres` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `DB_NAME` | `nexusai` | Database name |
| `DB_USER` | `nexusai` | Database user |
| `DB_PASSWORD` | (required) | Database password |
| `JDBC_POOL_SIZE` | `20` | Connection pool size |
| `JWT_EXPIRY` | `3600` | Access token expiry (seconds) |
| `REFRESH_TOKEN_EXPIRY` | `604800` | Refresh token expiry (seconds, 7 days) |
| `PASSWORD_MIN_LENGTH` | `12` | Minimum password length |
| `PASSWORD_REQUIRE_UPPERCASE` | `true` | Require uppercase letters |
| `PASSWORD_REQUIRE_NUMBERS` | `true` | Require numbers |
| `PASSWORD_REQUIRE_SPECIAL` | `true` | Require special characters |
| `BCRYPT_ROUNDS` | `12` | bcrypt hashing rounds |
| `SESSION_TIMEOUT` | `86400` | Session timeout (seconds, 24 hours) |
| `MAX_LOGIN_ATTEMPTS` | `5` | Lockout after N failed attempts |
| `LOCKOUT_DURATION` | `900` | Account lockout duration (seconds, 15 min) |
| `REDIS_HOST` | `redis` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |

### Monitoring Service

| Variable | Default | Description |
| --- | --- | --- |
| `MONITORING_SERVICE_PORT` | `8082` | Service port |
| `METRICS_SCRAPE_INTERVAL` | `30` | Metrics collection interval (seconds) |
| `METRICS_RETENTION_DAYS` | `30` | Metrics retention in database |
| `PROMETHEUS_URL` | `http://prometheus:9090` | Prometheus URL |
| `ALERT_THRESHOLD_CPU` | `80` | CPU alert threshold (%) |
| `ALERT_THRESHOLD_MEMORY` | `85` | Memory alert threshold (%) |
| `ALERT_THRESHOLD_DISK` | `90` | Disk alert threshold (%) |
| `ALERT_THRESHOLD_ERROR_RATE` | `5` | Error rate alert threshold (%) |
| `METRICS_BATCH_SIZE` | `1000` | Batch size for metric inserts |
| `DB_HOST` | `postgres` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `KAFKA_BROKER` | `kafka:9092` | Kafka broker address |

### Incident Service

| Variable | Default | Description |
| --- | --- | --- |
| `INCIDENT_SERVICE_PORT` | `8083` | Service port |
| `DB_HOST` | `postgres` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `KAFKA_BROKER` | `kafka:9092` | Kafka broker address |
| `LLM_ROUTER_URL` | `http://localhost:8086` | LLM Router endpoint |
| `AI_AGENT_URL` | `http://localhost:8087` | AI Agent endpoint |
| `INCIDENT_TTL_DAYS` | `90` | Auto-close incidents after N days |
| `AUTO_ESCALATE_ENABLED` | `true` | Auto-escalate unresolved incidents |
| `AUTO_ESCALATE_AFTER_HOURS` | `2` | Escalate after N hours |
| `CORRELATION_ENABLED` | `true` | Correlate related incidents |
| `CORRELATION_TIME_WINDOW` | `300` | Correlation window (seconds, 5 min) |

### Code Review Service

| Variable | Default | Description |
| --- | --- | --- |
| `REVIEW_SERVICE_PORT` | `8084` | Service port |
| `DB_HOST` | `postgres` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `KAFKA_BROKER` | `kafka:9092` | Kafka broker address |
| `LLM_ROUTER_URL` | `http://localhost:8086` | LLM Router endpoint |
| `GITHUB_TOKEN` | (optional) | GitHub API token for PR data |
| `MAX_FILE_SIZE_MB` | `10` | Max file size for analysis |
| `MAX_LINES_PER_REVIEW` | `5000` | Max lines per review |
| `ANALYSIS_TIMEOUT_SECONDS` | `300` | Analysis timeout |
| `ENABLE_SECURITY_SCAN` | `true` | Run security scanning |
| `ENABLE_PERF_ANALYSIS` | `true` | Run performance analysis |
| `ENABLE_TEST_GENERATION` | `true` | Generate test suggestions |

### Repository Intelligence Service

| Variable | Default | Description |
| --- | --- | --- |
| `REPO_SERVICE_PORT` | `8085` | Service port |
| `DB_HOST` | `postgres` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `QDRANT_URL` | `http://qdrant:6333` | Qdrant vector DB URL |
| `KAFKA_BROKER` | `kafka:9092` | Kafka broker address |
| `GITHUB_TOKEN` | (optional) | GitHub API token |
| `EMBEDDING_MODEL` | `all-MiniLM-L6-v2` | Sentence transformer model |
| `CHUNK_SIZE` | `512` | Code chunk size (tokens) |
| `CHUNK_OVERLAP` | `50` | Chunk overlap (tokens) |
| `VECTOR_SEARCH_THRESHOLD` | `0.7` | Relevance threshold (0-1) |
| `MAX_REPO_SIZE_GB` | `5` | Maximum repo size |
| `INDEX_BATCH_SIZE` | `100` | Batch size for indexing |

### LLM Router Service

| Variable | Default | Description |
| --- | --- | --- |
| `LLM_SERVICE_PORT` | `8086` | Service port |
| `DB_HOST` | `postgres` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `OPENAI_API_KEY` | (optional) | OpenAI API key |
| `OPENAI_MODEL` | `gpt-4` | Default OpenAI model |
| `OPENAI_MAX_TOKENS` | `2000` | Max tokens for GPT-4 |
| `ANTHROPIC_API_KEY` | (optional) | Anthropic API key |
| `ANTHROPIC_MODEL` | `claude-3-opus` | Default Claude model |
| `TOGETHER_API_KEY` | (optional) | Together.ai API key |
| `FALLBACK_MODEL` | `llama-2-70b` | Fallback model |
| `ROUTING_STRATEGY` | `cost_optimized` | cost_optimized, latency_optimized, quality_first |
| `MODEL_TIMEOUT_SECONDS` | `60` | Model inference timeout |
| `RETRY_ATTEMPTS` | `2` | Retries on model failure |

### AI Agent Service

| Variable | Default | Description |
| --- | --- | --- |
| `AGENT_SERVICE_PORT` | `8087` | Service port |
| `DB_HOST` | `postgres` | PostgreSQL host |
| `DB_PORT` | `5432` | PostgreSQL port |
| `REDIS_HOST` | `redis` | Redis host |
| `REDIS_PORT` | `6379` | Redis port |
| `KAFKA_BROKER` | `kafka:9092` | Kafka broker address |
| `LLM_ROUTER_URL` | `http://localhost:8086` | LLM Router endpoint |
| `MAX_CONCURRENT_TASKS` | `50` | Max parallel task execution |
| `TASK_TIMEOUT_SECONDS` | `600` | Task execution timeout |
| `MEMORY_WINDOW_SIZE` | `20` | Agent memory context size |
| `TOOL_CALL_TIMEOUT_SECONDS` | `30` | Tool invocation timeout |

### AI Services (Python)

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `8000` | Service port |
| `HOST` | `0.0.0.0` | Listen address |
| `WORKERS` | `4` | Number of Uvicorn workers |
| `EMBEDDING_BATCH_SIZE` | `32` | Batch size for embeddings |
| `DEVICE` | `cpu` | Compute device (cpu or cuda) |
| `CACHE_SIZE_MB` | `512` | In-memory cache size |
| `ENABLE_PROMETHEUS` | `true` | Enable Prometheus metrics |

### Database Configuration

#### PostgreSQL

| Variable | Default | Description |
| --- | --- | --- |
| `POSTGRES_DB` | `nexusai` | Database name |
| `POSTGRES_USER` | `nexusai` | Database user |
| `POSTGRES_PASSWORD` | (required) | Database password |
| `POSTGRES_INITDB_ARGS` | `` | Additional initdb arguments |
| `PG_MAX_CONNECTIONS` | `100` | Max connections |
| `SHARED_BUFFERS` | `256MB` | Shared memory buffer |
| `EFFECTIVE_CACHE_SIZE` | `1GB` | Cache size hint |
| `WORK_MEM` | `16MB` | Memory per sort/hash |
| `MAINTENANCE_WORK_MEM` | `64MB` | VACUUM/CREATE INDEX memory |

#### Redis

| Variable | Default | Description |
| --- | --- | --- |
| `REDIS_MAXMEMORY` | `512mb` | Max memory |
| `REDIS_MAXMEMORY_POLICY` | `allkeys-lru` | Eviction policy |
| `REDIS_TIMEOUT` | `300` | Client timeout (seconds) |
| `REDIS_TCP_BACKLOG` | `511` | TCP backlog |

#### Kafka

| Variable | Default | Description |
| --- | --- | --- |
| `KAFKA_BROKER_ID` | `1` | Broker ID |
| `KAFKA_NUM_PARTITIONS` | `3` | Default partitions |
| `KAFKA_LOG_RETENTION_HOURS` | `168` | Retention (7 days) |
| `KAFKA_LOG_SEGMENT_BYTES` | `1073741824` | 1GB per segment |
| `KAFKA_COMPRESSION_TYPE` | `snappy` | Compression algorithm |
| `KAFKA_AUTO_CREATE_TOPICS` | `false` | Disable auto topic creation |

#### Qdrant

| Variable | Default | Description |
| --- | --- | --- |
| `QDRANT_SNAPSHOT_PATH` | `/qdrant/storage` | Snapshot storage |
| `QDRANT_API_KEY` | (optional) | API authentication key |

---

## Java Service Configuration

Add to `application.properties`:

```properties
# Spring Boot
spring.application.name=auth-service
spring.profiles.active=production
server.port=8081
server.servlet.context-path=/api/auth

# Logging
logging.level.root=INFO
logging.level.com.nexusai=DEBUG
logging.pattern.console=%d{HH:mm:ss.SSS} [%thread] %-5level %logger{36} - %msg%n

# Actuator (Monitoring)
management.endpoints.web.exposure.include=health,metrics,prometheus
management.metrics.export.prometheus.enabled=true

# Datasource
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=20000
spring.datasource.hikari.idle-timeout=300000
spring.datasource.hikari.max-lifetime=1200000

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQL10Dialect

# Circuit Breaker
resilience4j.circuitbreaker.instances.default.registerHealthIndicator=true
resilience4j.circuitbreaker.instances.default.failureRateThreshold=50
resilience4j.circuitbreaker.instances.default.waitDurationInOpenState=60000
```

---

## Feature Flags

Control feature availability via environment variables:

```env
# Feature flags
FEATURE_AI_REVIEW=true
FEATURE_REPO_INTELLIGENCE=true
FEATURE_INCIDENT_AUTOMATION=true
FEATURE_KUBERNETES_INTEGRATION=true
FEATURE_CHAOS_ENGINEERING=false
FEATURE_ANALYTICS_DASHBOARD=true
FEATURE_WEBHOOKS=true
FEATURE_RBAC=true
```

---

## Security Configuration

### JWT Configuration

```env
JWT_ALGORITHM=HS256
JWT_SECRET=your-long-random-secret-key-at-least-32-characters
JWT_ISSUER=nexusai
JWT_AUDIENCE=nexusai-platform
JWT_EXPIRY=3600
REFRESH_TOKEN_EXPIRY=604800
```

### HTTPS/TLS

```env
SERVER_SSL_ENABLED=true
SERVER_SSL_KEY_STORE=/etc/nexusai/keystore.jks
SERVER_SSL_KEY_STORE_PASSWORD=keystorepass
SERVER_SSL_KEY_STORE_TYPE=JKS
SERVER_SSL_KEY_ALIAS=nexusai
```

### Password Policy

```env
PASSWORD_MIN_LENGTH=12
PASSWORD_REQUIRE_UPPERCASE=true
PASSWORD_REQUIRE_LOWERCASE=true
PASSWORD_REQUIRE_NUMBERS=true
PASSWORD_REQUIRE_SPECIAL_CHARS=true
SPECIAL_CHARS=!@#$%^&*()_+-=[]{}|;:,.<>?
```

---

## Performance Tuning

### Database Connection Pool

For high-traffic deployments:

```env
# Increase from default 20
JDBC_POOL_SIZE=50
DB_MIN_IDLE_CONNECTIONS=10

# Adjust timeouts
DB_CONNECTION_TIMEOUT_MS=30000
DB_IDLE_TIMEOUT_MS=900000
DB_MAX_LIFETIME_MS=1800000
```

### Kafka Performance

```env
KAFKA_BATCH_SIZE=16384
KAFKA_LINGER_MS=10
KAFKA_BUFFER_MEMORY=33554432
KAFKA_COMPRESSION_TYPE=snappy
```

### Cache Configuration

```env
REDIS_CACHE_TTL_DEFAULT=3600
REDIS_CACHE_TTL_SESSION=86400
REDIS_CACHE_TTL_METRICS=1800
REDIS_MAX_CONNECTIONS=100
```

---

## Monitoring Configuration

### Prometheus Scrape Config

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'api-gateway'
    static_configs:
      - targets: ['localhost:8080']
  - job_name: 'auth-service'
    static_configs:
      - targets: ['localhost:8081']
  - job_name: 'postgres'
    static_configs:
      - targets: ['localhost:5432']
```

### Grafana Dashboard

Essential dashboards:
- Service health and availability
- Request latency and throughput
- Error rates and exceptions
- Database query performance
- Cache hit rates
- Kafka topic lag

---

## Secrets Management

### Development

Store secrets in `.env` (git-ignored):

```bash
echo ".env" >> .gitignore
echo "OPENAI_API_KEY=sk-..." >> .env
```

### Production

Use environment variables from your orchestration platform:

**Kubernetes**:
```bash
kubectl create secret generic nexusai-secrets \
  --from-literal=jwt-secret=... \
  --from-literal=openai-api-key=... \
  --from-literal=db-password=...
```

**AWS Secrets Manager**:
```bash
aws secretsmanager create-secret \
  --name nexusai/database-password \
  --secret-string "{\"password\": \"...\"}"
```

