package com.nexusai.incident;

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
@RequestMapping("/api/incidents")
public class IncidentController {

    private static final Logger logger = LoggerFactory.getLogger(IncidentController.class);

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        logger.info("Health check requested");
        return ResponseEntity.ok(Map.of(
                "service", "incident-service",
                "status", "ready",
                "version", "0.0.1",
                "checkedAt", Instant.now().toString()
        ));
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> summary() {
        logger.info("Incident summary requested");
        return ResponseEntity.ok(Map.of(
                "service", "incident-service",
                "summary", Map.of(
                        "openIncidents", 4,
                        "resolvedToday", 12,
                        "avgResolutionTime", 245
                ),
                "severityDistribution", Map.of(
                        "critical", 0,
                        "high", 2,
                        "medium", 2,
                        "low", 0
                ),
                "signals", List.of("alerts", "logs", "traces", "deployments"),
                "status", "ready"
        ));
    }
}
