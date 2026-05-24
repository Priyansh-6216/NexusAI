package com.nexusai.incident;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class IncidentController {

    @GetMapping("/api/incidents/health")
    public Map<String, Object> health() {
        return Map.of(
                "service", "incident-service",
                "status", "ready",
                "checkedAt", Instant.now().toString()
        );
    }

    @GetMapping("/api/incidents/summary")
    public Map<String, Object> summary() {
        return Map.of(
                "openIncidents", 4,
                "severityLevels", List.of("critical", "high", "medium", "low"),
                "signals", List.of("alerts", "logs", "traces", "deployments")
        );
    }
}
