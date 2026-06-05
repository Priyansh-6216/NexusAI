package com.nexusai.agent;

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
@RequestMapping("/api/agents")
public class AiAgentController {

    private static final Logger logger = LoggerFactory.getLogger(AiAgentController.class);

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        logger.info("Health check requested");
        return ResponseEntity.ok(Map.of(
                "service", "ai-agent-service",
                "status", "ready",
                "version", "0.0.1",
                "checkedAt", Instant.now().toString()
        ));
    }

    @GetMapping("/registry")
    public ResponseEntity<Map<String, Object>> registry() {
        logger.info("Agent registry requested");
        return ResponseEntity.ok(Map.of(
                "service", "ai-agent-service",
                "agents", List.of(
                        "incident-triage-agent",
                        "code-review-agent",
                        "repo-analyst-agent",
                        "ops-automation-agent"
                ),
                "orchestration", Map.of(
                        "stateStores", List.of("redis", "kafka"),
                        "toolExecution", "enabled",
                        "memoryType", "short-term-and-long-term"
                ),
                "workflows", Map.of(
                        "parallel", "supported",
                        "dependencies", "supported",
                        "retries", "exponential-backoff"
                ),
                "status", "ready"
        ));
    }
}
