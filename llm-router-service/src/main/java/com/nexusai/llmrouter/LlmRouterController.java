package com.nexusai.llmrouter;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/llm")
public class LlmRouterController {

    private static final Logger logger = LoggerFactory.getLogger(LlmRouterController.class);

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        logger.info("Health check requested");
        return ResponseEntity.ok(Map.of(
                "service", "llm-router-service",
                "status", "ready",
                "version", "0.0.1",
                "checkedAt", Instant.now().toString()
        ));
    }

    @GetMapping("/policies")
    public ResponseEntity<Map<String, Object>> policies() {
        logger.info("Routing policies requested");
        return ResponseEntity.ok(Map.of(
                "service", "llm-router-service",
                "routing", Map.of(
                        "signals", List.of("task-type", "latency-requirement", "cost", "availability", "model-capability"),
                        "providers", List.of("openai", "anthropic", "google", "meta"),
                        "fallbackStrategy", "round-robin",
                        "caching", "enabled"
                ),
                "metrics", Map.of(
                        "routedRequests", 15400,
                        "avgLatencyMs", 245,
                        "costPerRequest", 0.025
                ),
                "status", "ready"
        ));
    }
}
