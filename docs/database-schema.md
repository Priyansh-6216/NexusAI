# Database Schema Documentation

Complete reference for all database schemas across services.

## PostgreSQL Shared Database

All services share PostgreSQL with separate schemas per domain.

### Schema Organization

```
nexusai (database)
├── auth_schema
├── monitoring_schema
├── incidents_schema
├── reviews_schema
├── repos_schema
├── llm_schema
├── agents_schema
└── public (gateway, shared utilities)
```

---

## Auth Schema

### users Table

User accounts and authentication credentials.

```sql
CREATE TABLE auth_schema.users (
  user_id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  is_active BOOLEAN DEFAULT true,
  email_verified BOOLEAN DEFAULT false,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP
);

CREATE INDEX idx_users_email ON auth_schema.users(email);
CREATE INDEX idx_users_active ON auth_schema.users(is_active) WHERE is_active = true;
CREATE INDEX idx_users_created_at ON auth_schema.users(created_at DESC);
```

**Constraints:**
- Email must be valid format and unique
- Password hash minimum 60 characters (bcrypt output)
- Email required; other fields optional
- Soft delete via deleted_at

### roles Table

User roles for RBAC.

```sql
CREATE TABLE auth_schema.roles (
  role_id SERIAL PRIMARY KEY,
  role_name VARCHAR(50) NOT NULL UNIQUE,
  description TEXT,
  is_system BOOLEAN DEFAULT false,  -- System roles: admin, user, observer
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO auth_schema.roles (role_name, description, is_system) VALUES
  ('admin', 'Full system access', true),
  ('developer', 'Development and review access', true),
  ('reviewer', 'Code review access', true),
  ('observer', 'Read-only access', true);
```

### user_roles Table

Junction table for many-to-many user-role mapping.

```sql
CREATE TABLE auth_schema.user_roles (
  user_id INTEGER NOT NULL REFERENCES auth_schema.users(user_id) ON DELETE CASCADE,
  role_id INTEGER NOT NULL REFERENCES auth_schema.roles(role_id),
  assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, role_id)
);

CREATE INDEX idx_user_roles_role_id ON auth_schema.user_roles(role_id);
```

### permissions Table

Granular permissions for RBAC.

```sql
CREATE TABLE auth_schema.permissions (
  permission_id SERIAL PRIMARY KEY,
  permission_name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  category VARCHAR(50),  -- categories: read, write, delete, admin
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert standard permissions
INSERT INTO auth_schema.permissions (permission_name, category, description) VALUES
  ('read:repositories', 'read', 'View repository information'),
  ('write:reviews', 'write', 'Create code review comments'),
  ('read:incidents', 'read', 'View incidents'),
  ('write:incidents', 'write', 'Update incident status'),
  ('read:metrics', 'read', 'View monitoring metrics'),
  ('admin:users', 'admin', 'Manage users and roles');
```

### role_permissions Table

Junction table for role-permission mapping.

```sql
CREATE TABLE auth_schema.role_permissions (
  role_id INTEGER NOT NULL REFERENCES auth_schema.roles(role_id) ON DELETE CASCADE,
  permission_id INTEGER NOT NULL REFERENCES auth_schema.permissions(permission_id),
  PRIMARY KEY (role_id, permission_id)
);

-- Grant permissions to roles
INSERT INTO auth_schema.role_permissions (role_id, permission_id)
SELECT r.role_id, p.permission_id
FROM auth_schema.roles r, auth_schema.permissions p
WHERE r.role_name = 'admin';  -- Admin gets all permissions
```

### sessions Table

Active user sessions.

```sql
CREATE TABLE auth_schema.sessions (
  session_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL REFERENCES auth_schema.users(user_id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_user_id ON auth_schema.sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON auth_schema.sessions(expires_at);

-- Automatic cleanup of expired sessions
-- Run nightly: DELETE FROM auth_schema.sessions WHERE expires_at < NOW();
```

---

## Monitoring Schema

### metrics Table (Time-Series)

Stores metrics data points with efficient querying.

```sql
CREATE TABLE monitoring_schema.metrics (
  metric_id BIGSERIAL PRIMARY KEY,
  service_name VARCHAR(100) NOT NULL,
  metric_type VARCHAR(50),  -- response_time, error_rate, cpu, memory, throughput
  value NUMERIC(10, 4) NOT NULL,
  tags JSONB,  -- {"environment": "prod", "endpoint": "/api/auth"}
  recorded_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Composite index for efficient time-range queries
CREATE INDEX idx_metrics_service_type_time 
  ON monitoring_schema.metrics(service_name, metric_type, recorded_at DESC)
  WHERE recorded_at > NOW() - INTERVAL '30 days';

-- JSONB index for tag filtering
CREATE INDEX idx_metrics_tags ON monitoring_schema.metrics USING gin(tags);

-- Partition by month for performance on large datasets
-- Year of 2026, metrics per service per month likely hundreds of millions
CREATE TABLE monitoring_schema.metrics_2026_05 PARTITION OF monitoring_schema.metrics
  FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');
```

### health_snapshots Table

Periodic service health checks.

```sql
CREATE TABLE monitoring_schema.health_snapshots (
  snapshot_id BIGSERIAL PRIMARY KEY,
  service_name VARCHAR(100) NOT NULL,
  status VARCHAR(20),  -- healthy, degraded, down
  response_time_ms INTEGER,
  error_count INTEGER,
  checked_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_health_service_time 
  ON monitoring_schema.health_snapshots(service_name, checked_at DESC);
```

---

## Incidents Schema

### incidents Table

Main incident tracking table.

```sql
CREATE TABLE incidents_schema.incidents (
  incident_id BIGSERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  severity VARCHAR(20) NOT NULL,  -- critical, high, medium, low
  status VARCHAR(30) NOT NULL,    -- open, in_progress, resolved, closed
  detected_at TIMESTAMP NOT NULL,
  resolved_at TIMESTAMP,
  detected_by VARCHAR(100),       -- monitoring_service, user_manual, webhook
  assigned_to INTEGER REFERENCES auth_schema.users(user_id),
  tags TEXT[] DEFAULT ARRAY[]::TEXT[],
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_incidents_status ON incidents_schema.incidents(status);
CREATE INDEX idx_incidents_severity ON incidents_schema.incidents(severity);
CREATE INDEX idx_incidents_assigned_to ON incidents_schema.incidents(assigned_to);
CREATE INDEX idx_incidents_detected_at ON incidents_schema.incidents(detected_at DESC);
CREATE INDEX idx_incidents_tags ON incidents_schema.incidents USING gin(tags);
```

### incident_events Table

Timeline of events for an incident.

```sql
CREATE TABLE incidents_schema.incident_events (
  event_id BIGSERIAL PRIMARY KEY,
  incident_id BIGINT NOT NULL REFERENCES incidents_schema.incidents(incident_id) ON DELETE CASCADE,
  event_type VARCHAR(50),  -- status_change, comment_added, assigned, escalated
  description TEXT,
  metadata JSONB,         -- Additional event data
  created_by INTEGER REFERENCES auth_schema.users(user_id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_incident_events_incident_id 
  ON incidents_schema.incident_events(incident_id, created_at DESC);
```

---

## Reviews Schema

### code_reviews Table

Code review requests and results.

```sql
CREATE TABLE reviews_schema.code_reviews (
  review_id BIGSERIAL PRIMARY KEY,
  repository_id INTEGER,
  pr_number INTEGER,
  status VARCHAR(30),     -- queued, in_progress, completed, failed
  summary TEXT,
  analysis_result JSONB,  -- Structured findings and suggestions
  completed_at TIMESTAMP,
  analysis_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_status ON reviews_schema.code_reviews(status);
CREATE INDEX idx_reviews_created_at ON reviews_schema.code_reviews(created_at DESC);
CREATE INDEX idx_reviews_completed_at ON reviews_schema.code_reviews(completed_at DESC)
  WHERE status = 'completed';
```

### review_findings Table

Individual findings/issues from reviews.

```sql
CREATE TABLE reviews_schema.review_findings (
  finding_id BIGSERIAL PRIMARY KEY,
  review_id BIGINT NOT NULL REFERENCES reviews_schema.code_reviews(review_id) ON DELETE CASCADE,
  file_path VARCHAR(512),
  line_number INTEGER,
  finding_type VARCHAR(50),   -- security, performance, style, testing, architecture
  severity VARCHAR(20),       -- critical, high, medium, low
  title VARCHAR(255),
  description TEXT,
  suggestion TEXT,
  auto_fixable BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_review_findings_review_id 
  ON reviews_schema.review_findings(review_id);
CREATE INDEX idx_review_findings_type_severity 
  ON reviews_schema.review_findings(finding_type, severity);
```

---

## Repositories Schema

### repositories Table

Repository metadata.

```sql
CREATE TABLE repos_schema.repositories (
  repo_id SERIAL PRIMARY KEY,
  owner VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  url VARCHAR(512) NOT NULL UNIQUE,
  description TEXT,
  default_branch VARCHAR(100) DEFAULT 'main',
  last_indexed_at TIMESTAMP,
  indexed_commit_sha VARCHAR(40),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(owner, name)
);

CREATE INDEX idx_repos_owner_name ON repos_schema.repositories(owner, name);
CREATE INDEX idx_repos_active ON repos_schema.repositories(is_active) 
  WHERE is_active = true;
```

### code_files Table

Files within repositories.

```sql
CREATE TABLE repos_schema.code_files (
  file_id SERIAL PRIMARY KEY,
  repo_id INTEGER NOT NULL REFERENCES repos_schema.repositories(repo_id) ON DELETE CASCADE,
  file_path VARCHAR(512) NOT NULL,
  language VARCHAR(50),
  lines_of_code INTEGER,
  content_hash VARCHAR(64),  -- SHA256 for detecting changes
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(repo_id, file_path)
);

CREATE INDEX idx_code_files_repo_id ON repos_schema.code_files(repo_id);
CREATE INDEX idx_code_files_language ON repos_schema.code_files(language);
```

### code_chunks Table

Chunked code for embedding and search.

```sql
CREATE TABLE repos_schema.code_chunks (
  chunk_id SERIAL PRIMARY KEY,
  file_id INTEGER NOT NULL REFERENCES repos_schema.code_files(file_id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  line_start INTEGER,
  line_end INTEGER,
  token_count INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_code_chunks_file_id ON repos_schema.code_chunks(file_id);
```

---

## Qdrant Vector Database

Vector collections for semantic search.

### repository_chunks Collection

Vectors for code chunks.

```json
{
  "name": "repository_chunks",
  "vectors": {
    "size": 384,
    "distance": "Cosine"
  },
  "payload_schema": {
    "chunk_id": {"type": "integer"},
    "repo_id": {"type": "integer"},
    "file_path": {"type": "text"},
    "language": {"type": "text"},
    "content_preview": {"type": "text"}
  }
}
```

### incident_context Collection

Vectors for incident logs and metrics for similarity matching.

```json
{
  "name": "incident_context",
  "vectors": {
    "size": 384,
    "distance": "Cosine"
  }
}
```

### runbook_knowledge Collection

Vectors for runbooks and solutions for correlation.

```json
{
  "name": "runbook_knowledge",
  "vectors": {
    "size": 384,
    "distance": "Cosine"
  }
}
```

---

## Performance Tuning

### Index Maintenance

```sql
-- Reindex after bulk operations
REINDEX INDEX idx_metrics_service_type_time;

-- Analyze table statistics
ANALYZE incidents_schema.incidents;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
```

### Query Optimization

```sql
-- Explain query plans
EXPLAIN ANALYZE
SELECT * FROM monitoring_schema.metrics
WHERE service_name = 'auth' 
  AND recorded_at > NOW() - INTERVAL '1 hour';

-- Identify missing indexes
SELECT schemaname, tablename, attname, n_distinct
FROM pg_stats
WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
ORDER BY n_distinct DESC;
```

### Data Archival

```sql
-- Archive old metrics to compressed table
CREATE TABLE monitoring_schema.metrics_archive AS
SELECT * FROM monitoring_schema.metrics
WHERE recorded_at < NOW() - INTERVAL '90 days';

DELETE FROM monitoring_schema.metrics
WHERE recorded_at < NOW() - INTERVAL '90 days';

VACUUM monitoring_schema.metrics;
```

---

## Backup and Recovery

### Backup Strategy

```bash
# Full backup
pg_dump -Fc nexusai > /backup/nexusai-$(date +%Y%m%d-%H%M%S).dump

# Incremental backup via WAL archiving
# Copy WAL files periodically to external storage

# Schema-only backup
pg_dump -s nexusai > /backup/nexusai-schema.sql
```

### Recovery

```bash
# Full restore
pg_restore -d nexusai /backup/nexusai-20260529.dump

# Schema only (keep existing data)
pg_restore -s -d nexusai /backup/nexusai-schema.sql

# Specific table
pg_dump -t auth_schema.users nexusai | psql nexusai
```

