# NexusAI — Enterprise AI-Powered Engineering Operations Platform

![NexusAI Dashboard](docs/images/dashboard.svg)

NexusAI is a production-scale SaaS platform designed to centralize AI-powered engineering, observability, incident management, and developer productivity.

## Vision

Provide an AI Operating System for software teams that unifies:

- AI Code Review
- Repository Intelligence
- Kubernetes Monitoring
- Incident Root Cause Analysis
- Multi-LLM Routing
- DevOps Automation
- Chaos Engineering
- Predictive Infrastructure Analytics

## Day 3 Update — Frontend Dashboard

The frontend now includes a modern enterprise dashboard skeleton built with Next.js and TailwindCSS.

- Responsive sidebar navigation
- Metrics cards for incident, cluster, and AI review health
- AI insights summary panel
- Incident alert timeline
- Enterprise-style dashboard visual language

## Day 4 Update — Backend Core Setup

The backend foundation now includes runnable Spring Boot skeletons for the API gateway and core microservices.

- API Gateway application entrypoint with route configuration for backend services
- Gateway status endpoint for service discovery and deployment checks
- Auth service health and capability endpoints
- Monitoring service health and platform summary endpoints
- Incident, code review, repo intelligence, LLM router, and AI agent service skeletons
- Baseline application configuration for local service ports, databases, Kafka, and management endpoints

## Day 5 Update — Data Layer Design

The platform now includes persistence contracts for PostgreSQL, Redis, and Qdrant.

- PostgreSQL schemas for auth, monitoring, incidents, code review, repo intelligence, LLM routing, and AI agents
- Docker Compose Postgres initialization for fresh local development volumes
- Redis keyspace contracts for sessions, rate limits, locks, workflow state, and provider health
- Qdrant collection definitions for repository chunks, incident context, and runbook knowledge
- Data-layer documentation in `database/README.md`

## Architecture Overview

```mermaid
flowchart TD
  A[Frontend] -->|HTTP / WebSocket| B[API Gateway]
  B --> C[Auth Service]
  B --> D[Monitoring Service]
  B --> E[Incident Service]
  B --> F[Code Review Service]
  B --> G[Repo Intelligence Service]
  B --> H[LLM Router Service]
  B --> I[AI Agent Service]
  D --> J[PostgreSQL]
  C --> J
  E --> J
  F --> J
  G --> J
  H --> K[Vector DB]
  I --> L[Kafka]
  D --> L
  E --> L
  F --> L
  G --> L
  I --> M[Redis]
  B --> M
```

## Phase 1 — Foundation & Architecture

### Goals

- Define the platform architecture
- Establish the monorepo structure
- Create core documentation
- Initialize the first services skeletons

### Structure

- `frontend/`
- `api-gateway/`
- `auth-service/`
- `monitoring-service/`
- `incident-service/`
- `code-review-service/`
- `llm-router-service/`
- `repo-intelligence-service/`
- `ai-agent-service/`
- `ai-services/`
- `kubernetes/`
- `terraform/`
- `docs/`

## Getting Started

This workspace is intentionally bootstrapped for a modular enterprise microservices platform.

Next steps:

1. Review the architecture in `docs/architecture.md`
2. Confirm the service breakdown in `docs/services.md`
3. Continue with Day 2 repository setup and initial service scaffolding
