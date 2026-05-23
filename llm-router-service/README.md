# LLM Router Service

This service will select the best LLM for specific tasks and handle failover.

## Responsibilities

- Model selection based on latency and task type
- Prompt optimization and token cost estimation
- Failover and retries across providers
- Metrics and model performance logging

## Technologies

- Spring Boot
- Kafka
- OpenAI / Claude / Gemini connectors
- Redis caching

## Next Steps

1. Define router API and policy model.
2. Connect task requests to available LLM endpoints.
3. Add failover and cost controls.
