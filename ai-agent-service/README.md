# AI Agent Service

This service will orchestrate multi-agent workflows and enable tool execution.

## Responsibilities

- Coordinate specialized AI agents
- Manage agent memory and workflow state
- Execute tool calls for remediation and workflows
- Integrate with incident, monitoring, and repo services

## Technologies

- Spring Boot
- Kafka
- Redis
- Python AI service connectors

## Next Steps

1. Add agent registry and workflow models.
2. Implement coordination APIs.
3. Build tool invocation and state persistence.

## Day 4 Endpoints

- `GET /api/agents/health` - AI agent service readiness
- `GET /api/agents/registry` - starter agent registry summary
