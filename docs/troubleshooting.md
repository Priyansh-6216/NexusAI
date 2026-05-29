# Troubleshooting Guide

Common issues and their solutions.

## Service Won't Start

### Symptom: Port already in use

**Error:**
```
Address already in use :8080
```

**Solution:**
```bash
# Find process using port
lsof -i :8080

# Kill process
kill -9 <PID>

# Or change port
export GATEWAY_PORT=8081
```

### Symptom: Database connection failed

**Error:**
```
java.sql.SQLException: Cannot get a connection, pool error Timeout waiting for idle object
```

**Solution:**
```bash
# Check PostgreSQL is running
docker compose ps postgres

# Check credentials
echo "password='$DB_PASSWORD'" psql -h localhost

# Restart database
docker compose restart postgres
docker compose restart auth-service
```

### Symptom: Out of memory

**Error:**
```
java.lang.OutOfMemoryError: Java heap space
```

**Solution:**
```bash
# Increase JVM heap
docker compose exec api-gateway sh -c "export JAVA_OPTS='-Xmx1024m'; ..."

# Or edit docker-compose.yml:
# environment:
#   JAVA_OPTS: "-Xmx512m -Xms256m"
```

---

## API Issues

### 401 Unauthorized on authenticated endpoints

**Issue:** Token rejected, even with valid JWT

**Debugging:**
```bash
# Check JWT token
jwt_payload=$(echo $TOKEN | cut -d. -f2)
echo $jwt_payload | base64 -d | jq

# Verify expiry
jq '.exp' <<< $payload
date +%s  # Compare to current timestamp

# Check secret matches
curl -X POST http://localhost:8080/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refresh_token\": \"$TOKEN\"}"
```

**Solutions:**
- Token expired → Get new token with `/auth/login`
- Wrong secret → Check JWT_SECRET env var
- Token revoked → Re-authenticate
- Clock skew → Sync server time

### 429 Too Many Requests

**Issue:** Rate limiting triggered

**Debugging:**
```bash
# Check rate limit headers
curl -v http://localhost:8080/api/auth/health | grep X-RateLimit

# Check current user limits
curl -H "Authorization: Bearer $TOKEN" http://localhost:8080/api/auth/capabilities | jq .rate_limits
```

**Solutions:**
- Implement backoff-retry logic
- Cache responses where possible
- Request limit increase for your account
- Upgrade tier if available

### 503 Service Unavailable

**Issue:** Downstream service down

**Debugging:**
```bash
# Check service health
curl http://localhost:8080/gateway/status | jq .services

# Check individual service
curl http://localhost:8084/api/reviews/health

# Check logs
docker compose logs code-review-service
```

**Solutions:**
- Restart failed service: `docker compose restart code-review-service`
- Check database: `docker compose logs postgres`
- Check Redis: `docker compose logs redis`
- Scale service: `docker compose up -d --scale code-review-service=3`

---

## Database Issues

### Database query timeout

**Symptom:** Queries take >30s

**Debugging:**
```bash
# Enable slow query log
docker compose exec postgres psql -U nexusai -d nexusai -c \
  "ALTER SYSTEM SET log_min_duration_statement = 1000;"

# Check active queries
SELECT * FROM pg_stat_activity WHERE state != 'idle';

# Check indexes
\d+ table_name
```

**Solutions:**
```sql
-- Add missing index
CREATE INDEX CONCURRENTLY idx_incidents_status ON incidents(status);

-- Analyze table to update stats
ANALYZE incidents;

-- Kill long-running query
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE duration > interval '5 min';
```

### Disk space full

**Symptom:** Database errors, writes fail

**Debugging:**
```bash
# Check disk usage
df -h /var/lib/docker

# Check Docker volume usage
docker system df

# Check PostgreSQL size
docker compose exec postgres psql -U nexusai -d nexusai -c \
  "SELECT datname, pg_size_pretty(pg_database_size(datname)) FROM pg_database ORDER BY pg_database_size(datname) DESC;"
```

**Solutions:**
```bash
# Clean up old Docker data
docker system prune -a

# Truncate old logs/metrics
docker compose exec postgres psql -U nexusai -d nexusai -c \
  "DELETE FROM metrics WHERE created_at < NOW() - INTERVAL '30 days';"

# Or backup and restore to new volume
docker compose down -v
docker compose up -d postgres
```

### Connection pool exhaustion

**Symptom:** "connection pool exhausted" in logs

**Debugging:**
```bash
# Check active connections
docker compose exec postgres psql -U nexusai -d nexusai -c \
  "SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;"

# Check which service is consuming
SELECT client_addr, usename, state, count(*) 
FROM pg_stat_activity 
WHERE datname = 'nexusai' 
GROUP BY client_addr, usename, state;
```

**Solutions:**
```bash
# Increase pool size in docker-compose.yml
JDBC_POOL_SIZE=50

# Restart services
docker compose restart

# Kill idle connections
SELECT pg_terminate_backend(pid) FROM pg_stat_activity 
WHERE state = 'idle' AND query_start < NOW() - INTERVAL '10 minutes';
```

---

## Message Queue Issues

### Kafka consumer lag increasing

**Symptom:** Events processed slowly, lag grows

**Debugging:**
```bash
# Check consumer group status
docker compose exec kafka kafka-consumer-groups \
  --bootstrap-server localhost:9092 \
  --group nexusai-incidents \
  --describe

# Check topic status
docker compose exec kafka kafka-topics \
  --bootstrap-server localhost:9092 \
  --topic incidents \
  --describe
```

**Solutions:**
```bash
# Increase consumer parallelism
KAFKA_CONSUMER_THREADS=4

# Increase fetch batch size
KAFKA_FETCH_MIN_BYTES=10240

# Restart consumers
docker compose restart ai-agent-service

# Reset consumer offset to re-process
docker compose exec kafka kafka-consumer-groups \
  --bootstrap-server localhost:9092 \
  --group nexusai-incidents \
  --reset-offsets --to-earliest --execute
```

### Kafka broker down

**Symptom:** Connection refused, 9092

**Debugging:**
```bash
# Check broker status
docker compose ps kafka

# Check logs
docker compose logs kafka | tail -50

# Check network
docker compose exec kafka nc -zv kafka 9092
```

**Solutions:**
```bash
# Restart broker
docker compose restart kafka zookeeper

# Verify recovery
docker compose exec kafka kafka-broker-api-versions \
  --bootstrap-server localhost:9092
```

---

## Cache Issues

### Redis connection fails

**Symptom:** "Connection refused: 6379"

**Debugging:**
```bash
# Check Redis running
docker compose ps redis

# Test connection
redis-cli -h localhost -p 6379 ping

# Check logs
docker compose logs redis
```

**Solutions:**
```bash
# Restart Redis
docker compose restart redis

# Clear cache
docker compose exec redis redis-cli FLUSHDB

# Monitor Redis commands
docker compose exec redis redis-cli MONITOR
```

### Cache stale data

**Symptom:** Users see old data, updates not reflected

**Debugging:**
```bash
# Check cache key
docker compose exec redis redis-cli GET cache:user:42

# Check TTL
docker compose exec redis redis-cli TTL cache:user:42

# Monitor cache activity
docker compose exec redis redis-cli MONITOR
```

**Solutions:**
```bash
# Clear specific cache
docker compose exec redis redis-cli DEL cache:user:*

# Reduce TTL for frequently-updated data
REDIS_CACHE_TTL_DEFAULT=300  # 5 min instead of 1 hour

# Implement cache invalidation webhook
# Services should DELETE cache key after update
```

---

## Performance Issues

### Slow API responses

**Symptom:** API takes >5s to respond

**Debugging:**
```bash
# Measure request time
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:8080/api/incidents

# Check service metrics
curl http://localhost:8082/api/monitoring/metrics?service=incidents&metric=response_time

# Check slow queries
docker compose exec postgres psql -U nexusai -d nexusai -c \
  "SELECT query, mean_exec_time FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 5;"
```

**Solutions:**
- Add database indexes (see database schema)
- Implement pagination: `?limit=20&offset=0`
- Enable response compression
- Add caching for read operations
- Shard data if it grows large
- Scale service horizontally

### High CPU usage

**Symptom:** Service consuming 100% CPU

**Debugging:**
```bash
# Check CPU usage per service
docker compose stats

# Profile Java service
# Use JFR (Java Flight Recorder) or profiler
docker exec api-gateway \
  jcmd $(docker inspect -f '{{.State.Pid}}' api-gateway) \
  JFR.start duration=10s filename=/tmp/recording.jfr
```

**Solutions:**
- Identify hot functions (profiling)
- Optimize algorithms
- Add caching
- Increase heap size (GC pressure)
- Scale horizontally

### High memory usage

**Symptom:** Service memory growing, OOM errors

**Debugging:**
```bash
# Check memory per container
docker compose stats

# Check Java heap
docker exec auth-service jmap -heap $(docker inspect -f '{{.State.Pid}}' auth-service)

# Memory leak analysis
docker exec auth-service jmap -dump:live,file=/tmp/heap.hprof,format=b 1
```

**Solutions:**
- Identify memory leaks (heap dump analysis)
- Reduce cache sizes
- Implement object pooling
- Increase JVM heap
- Enable G1GC for better memory management

---

## Network Issues

### Services can't communicate

**Symptom:** "Connection refused", services in docker-compose

**Debugging:**
```bash
# Check network
docker network ls
docker network inspect nexusai_default

# Test connectivity
docker compose exec api-gateway ping auth-service

# Check DNS
docker compose exec api-gateway nslookup auth-service
```

**Solutions:**
```bash
# Verify service name in connection strings (must use docker-compose service name)
# ✗ jdbc:postgresql://localhost:5432/nexusai
# ✓ jdbc:postgresql://postgres:5432/nexusai

# Check docker-compose.yml service names match environment
# Restart services to reconnect to network
docker compose restart
```

### High latency between services

**Symptom:** Inter-service calls take >1s

**Debugging:**
```bash
# Measure latency
docker compose exec api-gateway sh -c "time curl http://auth-service:8081/api/auth/health"

# Check network stats
docker stats

# Monitor traffic
docker network stats
```

**Solutions:**
- Verify services on same network
- Reduce payload sizes
- Implement connection pooling
- Use HTTP/2 or gRPC
- Scale services closer (co-locate)

---

## Logging and Diagnostics

### Enable debug logging

```bash
# Edit docker-compose.yml
environment:
  LOGGING_LEVEL_ROOT: DEBUG
  LOGGING_LEVEL_COM_NEXUSAI: DEBUG

docker compose up -d
docker compose logs -f
```

### Collect diagnostics bundle

```bash
# Create diagnostic report
mkdir diagnostics
docker compose logs > diagnostics/logs.txt
docker compose ps > diagnostics/services.txt
curl http://localhost:8080/gateway/status > diagnostics/health.json
docker system df > diagnostics/disk.txt
docker stats --no-stream > diagnostics/stats.txt

tar -czf diagnostics.tar.gz diagnostics/
```

### Enable request tracing

```bash
# Add correlation ID to all requests
X-Correlation-ID: $(uuidgen)

# Trace through services
# Each service logs with correlation ID
grep "X-Correlation-ID: abc-123" docker-compose logs
```

---

## When All Else Fails

### Nuclear reset

```bash
# Remove all containers, volumes, networks
docker compose down -v

# Clean up Docker system
docker system prune -a --volumes

# Fresh start
docker compose up --build
```

### Get help

1. Check logs: `docker compose logs -f`
2. Check health: `curl http://localhost:8080/gateway/status | jq`
3. Check docs: `docs/`, `kubernetes/`, service `README.md`
4. Check GitHub Issues: https://github.com/Priyansh-6216/NexusAI/issues
5. Create issue with diagnostics bundle

