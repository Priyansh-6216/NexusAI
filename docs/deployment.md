# Production Deployment Guide

Complete guide for deploying NexusAI to production environments.

## Pre-Deployment Checklist

- [ ] All tests passing locally
- [ ] Security audit completed
- [ ] Performance tested under load
- [ ] Database backups configured
- [ ] Monitoring and alerting setup
- [ ] Logging centralization ready
- [ ] HTTPS/TLS certificates acquired
- [ ] API keys and secrets provisioned
- [ ] Rollback strategy planned
- [ ] Runbooks and documentation reviewed

---

## Architecture Options

### Option 1: Kubernetes (Recommended for Production)

Best for scaling, auto-recovery, and managed infrastructure.

**Prerequisites:**
- Kubernetes v1.24+
- kubectl CLI configured
- Container registry (ECR, Docker Hub, GCR)
- Helm (optional, for package management)

**Steps:**

1. Build and push images:
   ```bash
   docker build -t myregistry/nexusai-api-gateway:1.0.0 api-gateway/
   docker push myregistry/nexusai-api-gateway:1.0.0
   # Repeat for all services
   ```

2. Create Kubernetes namespace:
   ```bash
   kubectl create namespace nexusai
   kubectl config set-context --current --namespace=nexusai
   ```

3. Create secrets:
   ```bash
   kubectl create secret generic nexusai-secrets \
     --from-literal=jwt-secret=$(openssl rand -hex 32) \
     --from-literal=db-password=$(openssl rand -base64 32) \
     --from-literal=redis-password=$(openssl rand -base64 32)
   ```

4. Deploy using manifests:
   ```bash
   kubectl apply -f kubernetes/
   ```

5. Verify deployment:
   ```bash
   kubectl get pods -n nexusai
   kubectl get svc -n nexusai
   ```

See `kubernetes/README.md` for detailed manifests.

### Option 2: Docker Swarm

For smaller deployments or learning environments.

```bash
docker swarm init
docker stack deploy -c docker-compose.prod.yml nexusai
docker stack services nexusai
```

### Option 3: Cloud-Managed Services

Deploy to AWS, GCP, or Azure using their managed container services.

**AWS ECS:**
```bash
aws ecs create-cluster --cluster-name nexusai
# Register task definitions and services
```

**Google Cloud Run:**
```bash
gcloud run deploy nexusai-gateway \
  --image gcr.io/project/nexusai-gateway:1.0.0
```

---

## Database Setup (PostgreSQL)

### 1. Provision PostgreSQL Instance

**Self-hosted (recommended for data control):**
```bash
docker run -d \
  --name postgres-prod \
  -e POSTGRES_DB=nexusai \
  -e POSTGRES_PASSWORD=$(openssl rand -base64 32) \
  -v postgres-data:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:14-alpine
```

**Managed service (AWS RDS, Google Cloud SQL, etc.):**
- Create multi-AZ instance for HA
- Enable automated backups (daily, 30-day retention)
- Enable encryption at rest
- Configure security groups for service access

### 2. Initialize Database

```bash
psql -h prod-db.example.com -U nexusai -d nexusai \
  -f database/postgres/init/01-schemas.sql \
  -f database/postgres/init/02-tables.sql \
  -f database/postgres/init/03-indexes.sql
```

### 3. Configure Performance

```sql
-- Increase shared buffers (25% of system RAM)
ALTER SYSTEM SET shared_buffers = '4GB';

-- Connection pooling (if using PgBouncer)
ALTER SYSTEM SET max_connections = 200;

-- Query optimization
ALTER SYSTEM SET effective_cache_size = '16GB';
ALTER SYSTEM SET work_mem = '32MB';
ALTER SYSTEM SET maintenance_work_mem = '512MB';

SELECT pg_reload_conf();
```

### 4. Setup Replication (High Availability)

```sql
-- On Primary
ALTER SYSTEM SET wal_level = replica;
ALTER SYSTEM SET max_wal_senders = 3;
ALTER SYSTEM SET wal_keep_size = '1GB';

-- Create replication user
CREATE USER replication WITH REPLICATION ENCRYPTED PASSWORD 'password';

SELECT pg_reload_conf();
```

### 5. Backup Strategy

Daily snapshots:
```bash
# Automated script
0 2 * * * pg_dump -h prod-db.example.com -U nexusai nexusai | gzip > /backup/nexusai-$(date +\%Y\%m\%d).sql.gz
```

---

## Cache Layer Setup (Redis)

### Deployment

**Self-hosted:**
```bash
docker run -d \
  --name redis-prod \
  -e REDIS_PASSWORD=$(openssl rand -base64 32) \
  -v redis-data:/data \
  -p 6379:6379 \
  redis:7-alpine \
  redis-server --appendonly yes --requirepass $REDIS_PASSWORD
```

**Managed service:**
- AWS ElastiCache with Multi-AZ
- Google Cloud Memorystore
- Azure Cache for Redis

### Configuration

```conf
# Persistence
save 900 1              # Save every 15 min if 1+ keys changed
save 300 10             # Save every 5 min if 10+ keys changed
appendonly yes          # Enable AOF persistence
appendfsync everysec    # Sync every second

# Memory management
maxmemory 2gb
maxmemory-policy allkeys-lru

# Security
requirepass your-secure-password
```

---

## Event Streaming Setup (Kafka)

### Deployment

Recommended: Use Confluent Cloud or AWS MSK

**Self-hosted cluster:**
```bash
docker run -d \
  --name kafka-prod \
  -e KAFKA_BROKER_ID=1 \
  -e KAFKA_ZOOKEEPER_CONNECT=zk-prod:2181 \
  -v kafka-data:/var/lib/kafka/data \
  -p 9092:9092 \
  confluentinc/cp-kafka:7.4.0
```

### Topics Configuration

```bash
kafka-topics --create \
  --topic auth_events \
  --partitions 3 \
  --replication-factor 3 \
  --config retention.ms=604800000

# Repeat for: metrics, incidents, code_reviews, repositories, agent_tasks
```

---

## Vector Database Setup (Qdrant)

### Deployment

```bash
docker run -d \
  --name qdrant-prod \
  -e QDRANT_SNAPSHOT_PATH=/qdrant/snapshots \
  -v qdrant-data:/qdrant/storage \
  -v qdrant-snapshots:/qdrant/snapshots \
  -p 6333:6333 \
  qdrant/qdrant:latest
```

### Collection Configuration

```python
from qdrant_client import QdrantClient

client = QdrantClient("localhost", port=6333)

# Create embeddings collection
client.recreate_collection(
    collection_name="repository_chunks",
    vectors_config={
        "size": 384,  # all-MiniLM-L6-v2 dimension
        "distance": "Cosine"
    }
)
```

---

## Networking and Load Balancing

### Ingress Controller (Kubernetes)

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: nexusai-ingress
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  ingressClassName: nginx
  tls:
    - hosts:
        - api.nexusai.com
      secretName: nexusai-tls
  rules:
    - host: api.nexusai.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: api-gateway
                port:
                  number: 8080
```

### Load Balancer Configuration (AWS)

```yaml
apiVersion: v1
kind: Service
metadata:
  name: api-gateway
  annotations:
    service.beta.kubernetes.io/aws-load-balancer-type: nlb
spec:
  type: LoadBalancer
  ports:
    - port: 443
      protocol: TCP
      targetPort: 8080
  selector:
    app: api-gateway
```

---

## Monitoring and Observability

### Prometheus Setup

Deploy Prometheus for metrics:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-config
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
      evaluation_interval: 15s
    alerting:
      alertmanagers:
        - static_configs:
            - targets: ["alertmanager:9093"]
    scrape_configs:
      - job_name: 'nexusai-services'
        static_configs:
          - targets: ['api-gateway:8080', 'auth-service:8081', ...]
```

### Grafana Dashboards

Import dashboards for:
- Service health and uptime
- Request latency and throughput
- Database performance
- Resource utilization (CPU, memory)
- Error rates and exceptions

### Centralized Logging (ELK Stack)

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: filebeat-config
data:
  filebeat.yml: |
    filebeat.inputs:
      - type: container
        enabled: true
        paths:
          - '/var/lib/docker/containers/*/*.log'
    output.elasticsearch:
      hosts: ["elasticsearch:9200"]
```

---

## CI/CD Pipeline

### GitHub Actions Deployment

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build images
        run: |
          docker build -t ${{ secrets.REGISTRY }}/nexusai-api-gateway:${{ github.sha }} api-gateway/
          docker push ${{ secrets.REGISTRY }}/nexusai-api-gateway:${{ github.sha }}
      
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/api-gateway \
            api-gateway=${{ secrets.REGISTRY }}/nexusai-api-gateway:${{ github.sha }} \
            -n nexusai
      
      - name: Verify rollout
        run: |
          kubectl rollout status deployment/api-gateway -n nexusai
```

---

## Scaling Strategy

### Horizontal Scaling

**Kubernetes HPA:**
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-gateway-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api-gateway
  minReplicas: 3
  maxReplicas: 20
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
    - type: Resource
      resource:
        name: memory
        target:
          type: Utilization
          averageUtilization: 80
```

### Vertical Scaling

Increase resource requests/limits:
```yaml
resources:
  requests:
    memory: "1Gi"
    cpu: "500m"
  limits:
    memory: "2Gi"
    cpu: "1000m"
```

---

## Disaster Recovery

### Backup Strategy

1. **Database backups**: Daily snapshots, 30-day retention
2. **Configuration backups**: Version control in Git
3. **State backups**: Redis snapshots, Kafka topic backups
4. **Secrets backups**: Vault or cloud secrets manager

### Recovery Procedures

**Database Recovery:**
```bash
# Restore from backup
psql -h prod-db.example.com -U nexusai -d nexusai < backup-$(date -d '1 day ago' +%Y%m%d).sql
```

**Service Recovery:**
```bash
# Rollback to previous version
kubectl rollout undo deployment/api-gateway -n nexusai
kubectl rollout undo deployment/auth-service -n nexusai
```

**Full Cluster Recovery:**
```bash
# Restore from etcd backup (Kubernetes)
etcdctl snapshot restore backup.db --data-dir=/var/lib/etcd-restore
```

---

## Security Hardening

### Network Security

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: nexusai-network-policy
spec:
  podSelector:
    matchLabels:
      app: api-gateway
  policyTypes:
    - Ingress
    - Egress
  ingress:
    - from:
        - namespaceSelector:
            matchLabels:
              name: nexusai
      ports:
        - protocol: TCP
          port: 8080
  egress:
    - to:
        - namespaceSelector:
            matchLabels:
              name: nexusai
      ports:
        - protocol: TCP
```

### RBAC Configuration

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role
metadata:
  name: nexusai-reader
rules:
  - apiGroups: [""]
    resources: ["pods", "services"]
    verbs: ["get", "list"]
```

### Secrets Rotation

Rotate secrets every 90 days:
```bash
# Update JWT secret
kubectl patch secret nexusai-secrets -p '{"data":{"jwt-secret":"'$(echo -n new-secret | base64)'"}}'

# Restart pods to pick up new secret
kubectl rollout restart deployment/api-gateway -n nexusai
```

---

## Performance Optimization

### Caching Strategy

- **HTTP caching**: 5 min for read endpoints
- **Redis caching**: 1 hour for frequent queries
- **CDN caching**: 24 hours for static assets

### Query Optimization

```sql
-- Add indexes for common queries
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_incidents_status ON incidents(status, detected_at DESC);
CREATE INDEX idx_reviews_pr ON code_reviews(repository_id, pr_number);
```

### Database Connection Pooling

```
PgBouncer configuration:
[databases]
nexusai = host=localhost port=5432 dbname=nexusai

[pgbouncer]
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 50
```

---

## Monitoring and Alerting

### Key Metrics to Monitor

- API latency (p50, p95, p99)
- Error rate (4xx, 5xx)
- Database connection pool utilization
- Message queue lag
- Cache hit rate
- Service uptime

### Alert Rules

```yaml
groups:
  - name: nexusai
    rules:
      - alert: HighErrorRate
        expr: rate(http_requests_total{status=~"5.."}[5m]) > 0.05
        for: 5m
        annotations:
          summary: "High error rate detected"
      
      - alert: DatabaseConnPoolFull
        expr: pg_stat_activity_count > 95
        for: 2m
        annotations:
          summary: "Database connection pool nearly full"
```

---

## Post-Deployment

- [ ] Smoke test all endpoints
- [ ] Monitor logs for errors
- [ ] Verify database replication
- [ ] Test failover procedures
- [ ] Document actual deployment time
- [ ] Update runbooks with new endpoints
- [ ] Schedule team debriefing

