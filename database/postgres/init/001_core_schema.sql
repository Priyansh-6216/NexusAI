CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS monitoring;
CREATE SCHEMA IF NOT EXISTS incidents;
CREATE SCHEMA IF NOT EXISTS code_review;
CREATE SCHEMA IF NOT EXISTS repo_intelligence;
CREATE SCHEMA IF NOT EXISTS llm_router;
CREATE SCHEMA IF NOT EXISTS agents;

CREATE TABLE IF NOT EXISTS auth.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    display_name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS auth.roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS auth.user_roles (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES auth.roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS auth.refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS monitoring.metric_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name TEXT NOT NULL,
    namespace TEXT NOT NULL DEFAULT 'default',
    metric_name TEXT NOT NULL,
    metric_value NUMERIC(18, 6) NOT NULL,
    unit TEXT NOT NULL,
    labels JSONB NOT NULL DEFAULT '{}'::jsonb,
    captured_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_metric_snapshots_lookup
    ON monitoring.metric_snapshots (service_name, metric_name, captured_at DESC);

CREATE TABLE IF NOT EXISTS monitoring.alert_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    metric_name TEXT NOT NULL,
    comparator TEXT NOT NULL,
    threshold NUMERIC(18, 6) NOT NULL,
    severity TEXT NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS incidents.incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    severity TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'open',
    impacted_service TEXT,
    summary TEXT,
    opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_incidents_status_severity
    ON incidents.incidents (status, severity, opened_at DESC);

CREATE TABLE IF NOT EXISTS incidents.timeline_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    incident_id UUID NOT NULL REFERENCES incidents.incidents(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS code_review.review_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repository TEXT NOT NULL,
    pull_request_number INTEGER,
    commit_sha TEXT,
    status TEXT NOT NULL DEFAULT 'queued',
    risk_score NUMERIC(5, 2),
    requested_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_review_runs_repository_created
    ON code_review.review_runs (repository, created_at DESC);

CREATE TABLE IF NOT EXISTS code_review.review_findings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_run_id UUID NOT NULL REFERENCES code_review.review_runs(id) ON DELETE CASCADE,
    severity TEXT NOT NULL,
    category TEXT NOT NULL,
    file_path TEXT,
    line_number INTEGER,
    message TEXT NOT NULL,
    recommendation TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS repo_intelligence.repositories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider TEXT NOT NULL DEFAULT 'github',
    owner_name TEXT NOT NULL,
    repo_name TEXT NOT NULL,
    default_branch TEXT NOT NULL DEFAULT 'main',
    last_ingested_commit TEXT,
    indexed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (provider, owner_name, repo_name)
);

CREATE TABLE IF NOT EXISTS repo_intelligence.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    repository_id UUID NOT NULL REFERENCES repo_intelligence.repositories(id) ON DELETE CASCADE,
    path TEXT NOT NULL,
    language TEXT,
    content_hash TEXT NOT NULL,
    chunk_count INTEGER NOT NULL DEFAULT 0,
    metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (repository_id, path)
);

CREATE TABLE IF NOT EXISTS llm_router.model_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_name TEXT NOT NULL,
    model_name TEXT NOT NULL,
    context_window INTEGER NOT NULL,
    input_cost_per_million NUMERIC(10, 4),
    output_cost_per_million NUMERIC(10, 4),
    enabled BOOLEAN NOT NULL DEFAULT true,
    UNIQUE (provider_name, model_name)
);

CREATE TABLE IF NOT EXISTS llm_router.routing_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_type TEXT NOT NULL,
    provider_name TEXT NOT NULL,
    model_name TEXT NOT NULL,
    latency_ms INTEGER,
    estimated_cost NUMERIC(12, 6),
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_routing_decisions_task_created
    ON llm_router.routing_decisions (task_type, created_at DESC);

CREATE TABLE IF NOT EXISTS agents.agent_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    capabilities JSONB NOT NULL DEFAULT '[]'::jsonb,
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS agents.workflow_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agent_name TEXT NOT NULL REFERENCES agents.agent_definitions(name),
    status TEXT NOT NULL DEFAULT 'queued',
    input_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    output_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at TIMESTAMPTZ
);

INSERT INTO auth.roles (name, description)
VALUES
    ('admin', 'Full platform administration'),
    ('engineer', 'Engineering workflow access'),
    ('viewer', 'Read-only dashboard access')
ON CONFLICT (name) DO NOTHING;

INSERT INTO agents.agent_definitions (name, description, capabilities)
VALUES
    ('incident-triage', 'Correlates alerts and proposes incident severity', '["alerts", "logs", "timeline"]'::jsonb),
    ('code-review', 'Analyzes pull requests and proposes review comments', '["diffs", "security", "tests"]'::jsonb),
    ('repo-analyst', 'Answers repository structure and ownership questions', '["semantic-search", "dependencies"]'::jsonb),
    ('ops-automation', 'Plans remediation workflow steps for platform operations', '["runbooks", "tools"]'::jsonb)
ON CONFLICT (name) DO NOTHING;
