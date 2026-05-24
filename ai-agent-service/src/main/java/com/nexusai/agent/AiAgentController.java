package com.nexusai.agent;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AiAgentController {

    @GetMapping("/api/agents/health")
    public Map<String, Object> health() {
        return Map.of(
                "service", "ai-agent-service",
                "status", "ready",
                "checkedAt", Instant.now().toString()
        );
    }

    @GetMapping("/api/agents/registry")
    public Map<String, Object> registry() {
        return Map.of(
                "agents", List.of("incident-triage", "code-review", "repo-analyst", "ops-automation"),
                "stateStores", List.of("redis", "kafka"),
                "toolExecution", "planned"
        );
    }
}
