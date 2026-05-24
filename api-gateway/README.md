# API Gateway

This service will route external requests to the appropriate backend microservice.

## Responsibilities

- Central ingress for frontend traffic
- JWT validation and RBAC enforcement
- Request routing to microservices
- Federation of service APIs and fallback handling

## Technologies

- Spring Boot
- Spring Cloud Gateway
- Spring Security
- Redis for token/session caching

## Next Steps

1. Expand route filters for auth, monitoring, incidents, and AI services.
2. Configure JWT validation and RBAC policies.
3. Add fallback and rate-limiting behavior.

## Day 4 Endpoints

- `GET /gateway/status` - gateway readiness and configured service route summary
