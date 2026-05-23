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

1. Create Spring Boot starter project.
2. Add gateway routes for auth, monitoring, incidents, and AI services.
3. Configure security and OAuth/JWT filters.
