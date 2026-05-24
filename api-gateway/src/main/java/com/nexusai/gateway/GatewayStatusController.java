package com.nexusai.gateway;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class GatewayStatusController {

    private static final List<Map<String, String>> ROUTES = List.of(
            Map.of("id", "auth-service", "path", "/api/auth/**", "target", "http://auth-service:8081"),
            Map.of("id", "monitoring-service", "path", "/api/monitoring/**", "target", "http://monitoring-service:8082"),
            Map.of("id", "incident-service", "path", "/api/incidents/**", "target", "http://incident-service:8083"),
            Map.of("id", "code-review-service", "path", "/api/reviews/**", "target", "http://code-review-service:8084"),
            Map.of("id", "repo-intelligence-service", "path", "/api/repos/**", "target", "http://repo-intelligence-service:8085"),
            Map.of("id", "llm-router-service", "path", "/api/llm/**", "target", "http://llm-router-service:8086"),
            Map.of("id", "ai-agent-service", "path", "/api/agents/**", "target", "http://ai-agent-service:8087")
    );

    @GetMapping("/gateway/status")
    public Map<String, Object> status() {
        return Map.of(
                "service", "api-gateway",
                "status", "ready",
                "checkedAt", Instant.now().toString(),
                "routes", ROUTES
        );
    }
}
