package com.nexusai.llmrouter;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class LlmRouterController {

    @GetMapping("/api/llm/health")
    public Map<String, Object> health() {
        return Map.of(
                "service", "llm-router-service",
                "status", "ready",
                "checkedAt", Instant.now().toString()
        );
    }

    @GetMapping("/api/llm/policies")
    public Map<String, Object> policies() {
        return Map.of(
                "routingSignals", List.of("task-type", "latency", "cost", "availability"),
                "providers", List.of("openai", "anthropic", "google"),
                "fallback", "enabled"
        );
    }
}
