package com.nexusai.monitoring;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class MonitoringController {

    @GetMapping("/api/monitoring/health")
    public Map<String, Object> health() {
        return Map.of(
                "service", "monitoring-service",
                "status", "ready",
                "checkedAt", Instant.now().toString()
        );
    }

    @GetMapping("/api/monitoring/summary")
    public Map<String, Object> summary() {
        return Map.of(
                "clusterHealth", 97,
                "activeIncidents", 4,
                "errorRate", 0.45,
                "signals", List.of("kubernetes", "prometheus", "cloudwatch", "kafka")
        );
    }
}
