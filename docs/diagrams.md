# NexusAI System Diagrams

## 1. High-Level Architecture

```mermaid
graph TB
    subgraph Client["Client Layer"]
        WEB["Web Browser<br/>React/Next.js"]
        MOBILE["Mobile Client"]
    end
    
    subgraph CDN["Content Delivery"]
        NGINX["Nginx<br/>Static Assets"]
    end
    
    subgraph Gateway["API Layer"]
        GW["API Gateway<br/>Spring Cloud Gateway<br/>Port 8080"]
    end
    
    subgraph Services["Microservices"]
        AUTH["Auth Service<br/>Port 8081"]
        MONITOR["Monitoring Service<br/>Port 8082"]
        INCIDENT["Incident Service<br/>Port 8083"]
        REVIEW["Code Review Service<br/>Port 8084"]
        REPO["Repo Intelligence<br/>Port 8085"]
        LLM["LLM Router Service<br/>Port 8086"]
        AGENT["AI Agent Service<br/>Port 8087"]
        AI["AI Services<br/>FastAPI<br/>Port 8000"]
    end
    
    subgraph Persistence["Data Layer"]
        PG[("PostgreSQL<br/>Relational Data<br/>Port 5432")]
        REDIS[("Redis<br/>Sessions/Cache<br/>Port 6379")]
        QDRANT[("Qdrant<br/>Vector DB<br/>Port 6333")]
    end
    
    subgraph Messaging["Event Streaming"]
        KAFKA["Kafka<br/>Event Stream<br/>Port 9092"]
    end
    
    subgraph Infra["Infrastructure"]
        K8S["Kubernetes<br/>Container Orchestration"]
        PROM["Prometheus<br/>Metrics Collection"]
        GRAF["Grafana<br/>Visualization"]
        ELK["ELK Stack<br/>Logs & Search"]
    end
    
    WEB --> NGINX
    MOBILE --> NGINX
    NGINX --> GW
    
    GW --> AUTH
    GW --> MONITOR
    GW --> INCIDENT
    GW --> REVIEW
    GW --> REPO
    GW --> LLM
    GW --> AGENT
    GW --> AI
    
    AUTH --> PG
    MONITOR --> PG
    INCIDENT --> PG
    REVIEW --> PG
    REPO --> PG
    LLM --> PG
    AGENT --> PG
    
    AUTH --> REDIS
    AGENT --> REDIS
    GW --> REDIS
    
    REPO --> QDRANT
    LLM --> QDRANT
    
    MONITOR --> KAFKA
    INCIDENT --> KAFKA
    REVIEW --> KAFKA
    AGENT --> KAFKA
    REPO --> KAFKA
    
    MONITOR --> PROM
    PROM --> GRAF
    
    MONITOR --> ELK
    GW --> ELK
    AUTH --> ELK
    
    K8S -.->|Orchestrates| AUTH
    K8S -.->|Orchestrates| MONITOR
    K8S -.->|Orchestrates| INCIDENT
    K8S -.->|Orchestrates| REVIEW
    K8S -.->|Orchestrates| REPO
    K8S -.->|Orchestrates| LLM
    K8S -.->|Orchestrates| AGENT

    style Client fill:#e1f5ff
    style Gateway fill:#fff3e0
    style Services fill:#f3e5f5
    style Persistence fill:#e8f5e9
    style Messaging fill:#fce4ec
    style Infra fill:#f1f8e9
```

## 2. Request Flow and Service Interaction

```mermaid
sequenceDiagram
    actor User
    participant Browser as Browser<br/>Frontend
    participant Gateway as API Gateway
    participant Auth as Auth Service
    participant Review as Code Review<br/>Service
    participant Repo as Repo Intelligence<br/>Service
    participant Cache as Redis Cache
    participant DB as PostgreSQL
    participant Kafka as Kafka Events
    
    User->>Browser: Accesses Dashboard
    Browser->>Gateway: GET /gateway/status
    Gateway->>DB: Verify Service Status
    DB-->>Gateway: Status OK
    Gateway-->>Browser: 200 OK
    
    User->>Browser: Login
    Browser->>Gateway: POST /auth/login
    Gateway->>Auth: Route to Auth Service
    Auth->>DB: Lookup User
    DB-->>Auth: User Found
    Auth->>Auth: Generate JWT
    Auth->>Cache: Store Session
    Auth-->>Gateway: JWT Token
    Gateway-->>Browser: Token + Refresh
    
    User->>Browser: Request Code Review
    Browser->>Gateway: POST /reviews/analyze
    Gateway->>Auth: Validate JWT
    Auth-->>Gateway: Valid
    Gateway->>Review: Route Request
    Review->>DB: Store Review Job
    Review->>Repo: Get Repository Context
    Repo->>QDRANT: Semantic Search
    Repo-->>Review: Context Vectors
    Review->>Kafka: Publish review.queued
    Kafka-->>Review: Event Queued
    Review-->>Gateway: Review Job ID
    Gateway-->>Browser: Job ID
    Browser->>Browser: Poll for Results
    Review->>DB: Store Results
    Review->>Kafka: Publish review.completed
    Review-->>DB: Store Results
    Browser->>Gateway: GET /reviews/job/{id}
    Gateway->>Review: Fetch Results
    Review->>DB: Query Results
    DB-->>Review: Results
    Review-->>Gateway: Review Feedback
    Gateway-->>Browser: Analysis Complete
```

## 3. Data Flow and Processing Pipeline

```mermaid
graph LR
    subgraph Input["Input Sources"]
        GH["GitHub Events<br/>via Webhooks"]
        K8S_METRICS["K8s Metrics<br/>via API"]
        LOGS["Application Logs<br/>via Log Shipper"]
    end
    
    subgraph Ingestion["Data Ingestion"]
        REPO_PARSER["Repo Parser<br/>Clone & Analyze"]
        METRIC_SCRAPER["Metric Scraper<br/>Prometheus"]
        LOG_COLLECTOR["Log Collector<br/>Fluent/Logstash"]
    end
    
    subgraph Processing["Processing"]
        EMBED["Embedding Pipeline<br/>Generate Vectors"]
        CORRELATE["Correlation Engine<br/>Link Events"]
        ANALYZE["Analysis Engine<br/>LLM Processing"]
    end
    
    subgraph Storage["Storage Layer"]
        PG_REPO["PG: Repository<br/>Code Metadata"]
        PG_METRICS["PG: Metrics<br/>Snapshots"]
        REDIS_CACHE["Redis: Cache<br/>Hot Data"]
        QDRANT_VEC["Qdrant: Vectors<br/>Embeddings"]
    end
    
    subgraph Output["Output/Serving"]
        API["REST APIs<br/>Read/Query"]
        REALTIME["WebSocket<br/>Real-Time Updates"]
        NOTIFICATIONS["Event Notifications<br/>Kafka"]
    end
    
    GH -->|Webhook Event| REPO_PARSER
    K8S_METRICS -->|Pull Request| METRIC_SCRAPER
    LOGS -->|Stream| LOG_COLLECTOR
    
    REPO_PARSER --> EMBED
    METRIC_SCRAPER --> CORRELATE
    LOG_COLLECTOR --> CORRELATE
    
    EMBED --> ANALYZE
    CORRELATE --> ANALYZE
    
    ANALYZE -->|Store Code| PG_REPO
    ANALYZE -->|Store Metrics| PG_METRICS
    ANALYZE -->|Cache Results| REDIS_CACHE
    ANALYZE -->|Store Vectors| QDRANT_VEC
    
    PG_REPO --> API
    PG_METRICS --> API
    REDIS_CACHE --> API
    QDRANT_VEC --> API
    
    API --> REALTIME
    API --> NOTIFICATIONS

    style Input fill:#e3f2fd
    style Ingestion fill:#f3e5f5
    style Processing fill:#fff3e0
    style Storage fill:#e8f5e9
    style Output fill:#fce4ec
```

## 4. Deployment Topology (Docker Compose / Kubernetes)

```mermaid
graph TB
    subgraph Docker["Docker Compose Development"]
        subgraph Frontend["Frontend"]
            NGINX_DC["Nginx Container<br/>Port 3000"]
        end
        
        subgraph Backend["Backend Services"]
            AUTH_DC["Auth Service<br/>JVM<br/>Port 8081"]
            GW_DC["API Gateway<br/>JVM<br/>Port 8080"]
            MONITOR_DC["Monitoring<br/>JVM<br/>Port 8082"]
            INCIDENT_DC["Incident<br/>JVM<br/>Port 8083"]
            REVIEW_DC["Code Review<br/>JVM<br/>Port 8084"]
            REPO_DC["Repo Intel<br/>JVM<br/>Port 8085"]
            LLM_DC["LLM Router<br/>JVM<br/>Port 8086"]
            AGENT_DC["AI Agent<br/>JVM<br/>Port 8087"]
            AI_DC["AI Services<br/>Python<br/>Port 8000"]
        end
        
        subgraph Database["Data Services"]
            PG_DC["PostgreSQL<br/>Port 5432"]
            REDIS_DC["Redis<br/>Port 6379"]
            QDRANT_DC["Qdrant<br/>Port 6333"]
        end
        
        subgraph Messaging["Messaging"]
            KAFKA_DC["Kafka<br/>Port 9092"]
            ZK_DC["Zookeeper<br/>Port 2181"]
        end
    end
    
    subgraph Kubernetes["Kubernetes Production"]
        subgraph Namespace["default namespace"]
            subgraph Ingress_NS["Ingress"]
                ING["Ingress Controller<br/>Port 80/443"]
            end
            
            subgraph Services_NS["Service Deployments"]
                AUTH_K8S["Auth Deployment<br/>Replicas: 3<br/>CPU: 500m<br/>RAM: 512Mi"]
                GW_K8S["Gateway Deployment<br/>Replicas: 3<br/>CPU: 1000m<br/>RAM: 1Gi"]
                MONITOR_K8S["Monitoring Deploy<br/>Replicas: 2<br/>CPU: 500m<br/>RAM: 512Mi"]
                INCIDENT_K8S["Incident Deploy<br/>Replicas: 2"]
                REVIEW_K8S["Review Deploy<br/>Replicas: 2"]
                REPO_K8S["Repo Deploy<br/>Replicas: 2"]
                LLM_K8S["LLM Deploy<br/>Replicas: 2"]
                AGENT_K8S["Agent Deploy<br/>Replicas: 2"]
                AI_K8S["AI Services Deploy<br/>Replicas: 2"]
            end
            
            subgraph Storage_NS["StatefulSets"]
                PG_K8S["PostgreSQL<br/>Replicas: 1<br/>PVC: 100Gi"]
                REDIS_K8S["Redis<br/>Replicas: 1<br/>PVC: 50Gi"]
                QDRANT_K8S["Qdrant<br/>Replicas: 1<br/>PVC: 100Gi"]
                KAFKA_K8S["Kafka Broker<br/>Replicas: 3<br/>PVC: 100Gi"]
            end
            
            subgraph Monitoring_NS["Observability"]
                PROM_K8S["Prometheus<br/>Scrape: 30s"]
                GRAF_K8S["Grafana<br/>Dashboards"]
                ELK_K8S["ELK Stack<br/>Log Storage"]
            end
        end
        
        subgraph Network["Networking"]
            SVC["Services<br/>Internal DNS"]
            CONFIG_MAP["ConfigMaps<br/>Configuration"]
            SECRETS["Secrets<br/>Credentials"]
        end
    end
    
    ING --> GW_K8S
    GW_K8S --> AUTH_K8S
    GW_K8S --> MONITOR_K8S
    GW_K8S --> INCIDENT_K8S
    GW_K8S --> REVIEW_K8S
    GW_K8S --> REPO_K8S
    GW_K8S --> LLM_K8S
    GW_K8S --> AGENT_K8S
    GW_K8S --> AI_K8S
    
    AUTH_K8S --> PG_K8S
    MONITOR_K8S --> PG_K8S
    INCIDENT_K8S --> PG_K8S
    REVIEW_K8S --> PG_K8S
    REPO_K8S --> PG_K8S
    LLM_K8S --> PG_K8S
    AGENT_K8S --> PG_K8S
    
    AUTH_K8S --> REDIS_K8S
    AGENT_K8S --> REDIS_K8S
    GW_K8S --> REDIS_K8S
    
    REPO_K8S --> QDRANT_K8S
    LLM_K8S --> QDRANT_K8S
    
    MONITOR_K8S --> KAFKA_K8S
    INCIDENT_K8S --> KAFKA_K8S
    REVIEW_K8S --> KAFKA_K8S
    AGENT_K8S --> KAFKA_K8S
    REPO_K8S --> KAFKA_K8S
    
    PROM_K8S --> AUTH_K8S
    PROM_K8S --> GW_K8S
    PROM_K8S --> MONITOR_K8S
    ELK_K8S --> GW_K8S
    ELK_K8S --> AUTH_K8S

    style Docker fill:#eceff1
    style Kubernetes fill:#f5f5f5
    style Frontend fill:#bbdefb
    style Backend fill:#c8e6c9
    style Database fill:#ffe0b2
    style Messaging fill:#f8bbd0
    style Namespace fill:#f0f4c3
    style Storage_NS fill:#dcedc8
```

## 5. API Gateway Routing

```mermaid
graph TD
    REQ["Incoming Request<br/>HTTP/HTTPS"]
    
    REQ -->|GET /api/auth/**| AUTH_ROUTE["Route to Auth Service<br/>:8081"]
    REQ -->|GET /api/monitoring/**| MONITOR_ROUTE["Route to Monitoring Service<br/>:8082"]
    REQ -->|GET /api/incidents/**| INCIDENT_ROUTE["Route to Incident Service<br/>:8083"]
    REQ -->|GET /api/reviews/**| REVIEW_ROUTE["Route to Code Review Service<br/>:8084"]
    REQ -->|GET /api/repos/**| REPO_ROUTE["Route to Repo Intelligence<br/>:8085"]
    REQ -->|GET /api/llm/**| LLM_ROUTE["Route to LLM Router<br/>:8086"]
    REQ -->|GET /api/agents/**| AGENT_ROUTE["Route to AI Agent Service<br/>:8087"]
    REQ -->|GET /gateway/**| GATEWAY_ROUTE["Route to Gateway<br/>Internal"]
    REQ -->|GET /health| HEALTH["Aggregate Health Check<br/>All Services"]
    
    AUTH_ROUTE --> AUTH_VAL["Validate JWT Token"]
    MONITOR_ROUTE --> AUTH_VAL
    INCIDENT_ROUTE --> AUTH_VAL
    REVIEW_ROUTE --> AUTH_VAL
    REPO_ROUTE --> AUTH_VAL
    LLM_ROUTE --> AUTH_VAL
    AGENT_ROUTE --> AUTH_VAL
    
    AUTH_VAL -->|Valid| CACHE_CHECK["Check Rate Limit<br/>Redis"]
    AUTH_VAL -->|Invalid| 401["401 Unauthorized"]
    
    CACHE_CHECK -->|Within Limit| FORWARD["Forward to Service"]
    CACHE_CHECK -->|Exceeded| 429["429 Too Many Requests"]
    
    FORWARD --> SVC_RESPONSE["Service Response"]
    
    HEALTH --> HEALTH_AGG["Aggregate Status"]
    HEALTH_AGG --> HEALTH_RESP["200 OK<br/>Status JSON"]
    
    SVC_RESPONSE --> RESP["Return Response"]
    401 --> RESP
    429 --> RESP
    HEALTH_RESP --> RESP
    GATEWAY_ROUTE --> RESP

    style REQ fill:#e3f2fd
    style AUTH_VAL fill:#fff3e0
    style CACHE_CHECK fill:#fff3e0
    style FORWARD fill:#c8e6c9
    style RESP fill:#f8bbd0
```

## 6. Authentication and Authorization Flow

```mermaid
sequenceDiagram
    actor User
    participant Browser as Browser
    participant Gateway as API Gateway
    participant Auth as Auth Service
    participant DB as PostgreSQL
    participant Redis as Redis
    
    User->>Browser: Login with Credentials
    Browser->>Gateway: POST /auth/login<br/>{email, password}
    Gateway->>Auth: Forward Request
    Auth->>DB: Query User<br/>SELECT * FROM users
    DB-->>Auth: User Record<br/>with bcrypt_hash
    Auth->>Auth: Verify Password<br/>bcrypt.compare()
    alt Password Valid
        Auth->>Auth: Generate JWT<br/>{sub, roles, exp}
        Auth->>Auth: Generate Refresh Token
        Auth->>Redis: SETEX session:{token}<br/>TTL: 24h
        Auth->>DB: Log Login Event
        Auth-->>Gateway: 200 OK<br/>{accessToken, refreshToken, expiresIn}
        Gateway-->>Browser: Set HttpOnly Cookie<br/>+ Response Body
    else Password Invalid
        Auth-->>Gateway: 401 Unauthorized
        Gateway-->>Browser: 401 Unauthorized
    end
    
    Browser->>Gateway: Subsequent Request<br/>Authorization: Bearer {JWT}
    Gateway->>Gateway: Middleware: Extract Token
    Gateway->>Auth: Validate JWT Signature
    Auth->>Auth: Verify JWT<br/>Check expiry, signature
    alt Token Valid
        Auth->>Auth: Extract Claims<br/>{sub, roles}
        Auth->>Redis: Check Revocation
        Redis-->>Auth: Token Not Revoked
        Auth-->>Gateway: 200 OK<br/>Claims + Roles
        Gateway->>Gateway: Load User Context<br/>into Request
        Gateway->>Gateway: Check RBAC Rules<br/>Required Roles?
        alt User Has Role
            Gateway->>Gateway: Allow Request
            Gateway->>Auth: Route to Target Service
        else User Lacks Role
            Gateway-->>Browser: 403 Forbidden
        end
    else Token Invalid/Expired
        Auth-->>Gateway: 401 Unauthorized
        Gateway-->>Browser: 401 Unauthorized<br/>Suggest Refresh
    end
    
    User->>Browser: Token Expired
    Browser->>Gateway: POST /auth/refresh<br/>{refreshToken}
    Gateway->>Auth: Forward Request
    Auth->>Redis: Verify Refresh Token
    Redis-->>Auth: Token Found + Valid
    Auth->>Auth: Issue New Access Token
    Auth-->>Gateway: 200 OK<br/>{accessToken, expiresIn}
    Gateway-->>Browser: New Token

    style User fill:#e3f2fd
    style Auth fill:#fff3e0
    style Gateway fill:#c8e6c9
    style DB fill:#ffe0b2
    style Redis fill:#f8bbd0
```

## 7. Event Streaming and Async Workflows

```mermaid
graph TB
    subgraph Producers["Event Producers"]
        AUTH_PROD["Auth Service<br/>- user.registered<br/>- user.login<br/>- user.logout"]
        MONITOR_PROD["Monitoring Service<br/>- metrics.collected<br/>- alert.triggered"]
        INCIDENT_PROD["Incident Service<br/>- incident.created<br/>- incident.resolved"]
        REVIEW_PROD["Code Review Service<br/>- review.queued<br/>- review.completed"]
        REPO_PROD["Repo Intel Service<br/>- repo.indexed<br/>- repo.updated"]
        AGENT_PROD["AI Agent Service<br/>- agent.task.started<br/>- agent.task.completed"]
    end
    
    subgraph Kafka_Topics["Kafka Topics"]
        AUTH_TOPIC["auth_events<br/>Partitions: 3<br/>Retention: 7d"]
        METRICS_TOPIC["metrics<br/>Partitions: 6<br/>Retention: 30d"]
        INCIDENTS_TOPIC["incidents<br/>Partitions: 3<br/>Retention: 90d"]
        REVIEWS_TOPIC["code_reviews<br/>Partitions: 3<br/>Retention: 30d"]
        REPOS_TOPIC["repositories<br/>Partitions: 3<br/>Retention: 90d"]
        TASKS_TOPIC["agent_tasks<br/>Partitions: 3<br/>Retention: 7d"]
    end
    
    subgraph Consumers["Event Consumers"]
        MONITOR_CONS["Monitoring Service<br/>- Correlates metrics"]
        INCIDENT_CONS["Incident Service<br/>- Tracks events<br/>- Triggers rules"]
        NOTIF_CONS["Notification Service<br/>- Sends alerts"]
        ANALYTICS_CONS["Analytics Service<br/>- Updates dashboards"]
        AGENT_CONS["AI Agent Service<br/>- Triggers workflows"]
    end
    
    AUTH_PROD -->|Emit| AUTH_TOPIC
    MONITOR_PROD -->|Emit| METRICS_TOPIC
    INCIDENT_PROD -->|Emit| INCIDENTS_TOPIC
    REVIEW_PROD -->|Emit| REVIEWS_TOPIC
    REPO_PROD -->|Emit| REPOS_TOPIC
    AGENT_PROD -->|Emit| TASKS_TOPIC
    
    AUTH_TOPIC -->|Consume| ANALYTICS_CONS
    AUTH_TOPIC -->|Consume| NOTIF_CONS
    
    METRICS_TOPIC -->|Consume| MONITOR_CONS
    METRICS_TOPIC -->|Consume| INCIDENT_CONS
    METRICS_TOPIC -->|Consume| NOTIF_CONS
    
    INCIDENTS_TOPIC -->|Consume| AGENT_CONS
    INCIDENTS_TOPIC -->|Consume| NOTIF_CONS
    INCIDENTS_TOPIC -->|Consume| ANALYTICS_CONS
    
    REVIEWS_TOPIC -->|Consume| NOTIF_CONS
    REVIEWS_TOPIC -->|Consume| ANALYTICS_CONS
    
    REPOS_TOPIC -->|Consume| ANALYTICS_CONS
    
    TASKS_TOPIC -->|Consume| NOTIF_CONS
    TASKS_TOPIC -->|Consume| ANALYTICS_CONS

    style Producers fill:#e3f2fd
    style Kafka_Topics fill:#fff3e0
    style Consumers fill:#c8e6c9
```

## 8. Database Entity Relationships

```mermaid
erDiagram
    USERS ||--o{ SESSIONS : has
    USERS ||--o{ ROLES : "has many"
    USERS ||--o{ AUDIT_LOGS : creates
    
    ROLES ||--o{ PERMISSIONS : grants
    
    REPOSITORIES ||--o{ REPO_COMMITS : "has many"
    REPOSITORIES ||--o{ REPO_FILES : "has many"
    REPOSITORIES ||--o{ CODE_CHUNKS : contains
    
    CODE_CHUNKS ||--o{ EMBEDDINGS : "indexed by"
    
    METRICS ||--o{ ALERTS : triggers
    METRICS ||--o{ METRIC_POINTS : "has many"
    
    INCIDENTS ||--o{ INCIDENT_EVENTS : "has many"
    INCIDENTS ||--o{ INCIDENT_RESPONDERS : "assigned to"
    INCIDENTS ||--o{ RUNBOOKS : follows
    
    CODE_REVIEWS ||--o{ REVIEW_COMMENTS : "has many"
    CODE_REVIEWS ||--o{ REVIEW_FINDINGS : contains
    
    USERS {
        int user_id PK
        string email UK
        string password_hash
        string display_name
        timestamp created_at
        timestamp updated_at
    }
    
    SESSIONS {
        string session_id PK
        int user_id FK
        string token_hash
        timestamp expires_at
        timestamp created_at
    }
    
    ROLES {
        int role_id PK
        string role_name UK
        string description
        timestamp created_at
    }
    
    REPOSITORIES {
        int repo_id PK
        string owner
        string name UK
        string url UK
        string default_branch
        timestamp last_indexed
        timestamp created_at
    }
    
    CODE_CHUNKS {
        int chunk_id PK
        int repo_id FK
        string file_path
        string language
        text content
        int line_start
        int line_end
    }
    
    EMBEDDINGS {
        int embedding_id PK
        int chunk_id FK
        vector vector_data
        timestamp created_at
    }
    
    INCIDENTS {
        int incident_id PK
        string title
        string severity
        string status
        timestamp detected_at
        timestamp resolved_at
        timestamp created_at
    }
    
    CODE_REVIEWS {
        int review_id PK
        int repo_id FK
        string pr_number
        string status
        text summary
        timestamp completed_at
        timestamp created_at
    }
```

## 9. Cache Layer Strategy (Redis)

```mermaid
graph TB
    subgraph Sessions["Session & Auth"]
        S1["session:{session_id}<br/>Type: String<br/>TTL: 24h<br/>Contains: JWT Claims"]
        S2["user:{user_id}:profile<br/>Type: Hash<br/>TTL: 1h<br/>Contains: User Data"]
        S3["token:blacklist:{token_hash}<br/>Type: String<br/>TTL: Token Expiry<br/>Contains: Revoked Tokens"]
    end
    
    subgraph RateLimit["Rate Limiting"]
        R1["ratelimit:{user_id}:{endpoint}<br/>Type: String<br/>TTL: 60s<br/>Contains: Request Count"]
        R2["ratelimit:global:{endpoint}<br/>Type: String<br/>TTL: 60s<br/>Contains: Global Count"]
    end
    
    subgraph Locks["Distributed Locks"]
        L1["lock:incident:{incident_id}<br/>Type: String<br/>TTL: 5m<br/>Contains: Lock Owner"]
        L2["lock:repo:index:{repo_id}<br/>Type: String<br/>TTL: 30m<br/>Contains: Lock Owner"]
    end
    
    subgraph Cache["Data Cache"]
        C1["cache:repo:{repo_id}:metadata<br/>Type: Hash<br/>TTL: 6h<br/>Contains: Repo Info"]
        C2["cache:incident:{incident_id}<br/>Type: Hash<br/>TTL: 1h<br/>Contains: Incident Data"]
        C3["cache:user:{user_id}:permissions<br/>Type: Set<br/>TTL: 2h<br/>Contains: Role IDs"]
    end
    
    subgraph PubSub["Pub/Sub Channels"]
        P1["channel:notifications:{user_id}<br/>Pattern: User Notifications"]
        P2["channel:incidents:alerts<br/>Pattern: Incident Alerts"]
        P3["channel:review:updates<br/>Pattern: Review Updates"]
    end
    
    subgraph Workflow["Workflow State"]
        W1["workflow:{agent_id}:state<br/>Type: Hash<br/>TTL: 24h<br/>Contains: Execution State"]
        W2["queue:pending_tasks<br/>Type: List<br/>TTL: None<br/>Contains: Task IDs"]
    end
    
    style Sessions fill:#e3f2fd
    style RateLimit fill:#fff3e0
    style Locks fill:#fce4ec
    style Cache fill:#e8f5e9
    style PubSub fill:#f3e5f5
    style Workflow fill:#ffe0b2
```

## 10. Error Handling and Resilience Pattern

```mermaid
graph TD
    REQ["Incoming Request"]
    
    REQ --> TIMEOUT["Set Timeout<br/>30s default"]
    
    TIMEOUT --> ATTEMPT1["Attempt 1<br/>Primary Service"]
    
    ATTEMPT1 -->|Success| CACHE["Cache Result<br/>Redis"]
    ATTEMPT1 -->|Timeout| ATTEMPT2["Attempt 2<br/>Circuit Open?"]
    ATTEMPT1 -->|Error| ERROR_CHECK{"Error Type"}
    
    ERROR_CHECK -->|Retryable| ATTEMPT2
    ERROR_CHECK -->|Non-Retryable| ERROR_RESP["Return Error<br/>500/503"]
    
    ATTEMPT2 -->|Success| CACHE
    ATTEMPT2 -->|Failure| FALLBACK["Fallback Strategy"]
    
    FALLBACK -->|Cached Data| SERVE_CACHE["Serve Stale<br/>from Cache"]
    FALLBACK -->|No Cache| CIRCUIT_OPEN["Open Circuit<br/>Log Incident"]
    FALLBACK -->|Default Response| DEFAULT["Return Default<br/>Response"]
    
    SERVE_CACHE --> RESPONSE["Return Response<br/>+ Cache-Control:<br/>max-age=0"]
    CIRCUIT_OPEN --> NOTIFY["Notify Monitoring<br/>Publish Event"]
    DEFAULT --> RESPONSE
    
    CACHE --> RESPONSE
    ERROR_RESP --> RESPONSE
    
    RESPONSE --> CLIENT["Client Response"]
    
    NOTIFY --> MONITOR["Alert Dashboard<br/>Incident Service"]

    style REQ fill:#e3f2fd
    style ATTEMPT1 fill:#fff3e0
    style ATTEMPT2 fill:#fff3e0
    style FALLBACK fill:#fce4ec
    style CACHE fill:#e8f5e9
    style RESPONSE fill:#c8e6c9
```

