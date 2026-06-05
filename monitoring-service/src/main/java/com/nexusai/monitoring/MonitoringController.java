package com.nexusai.monitoring;

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
@RequestMapping("/api/monitoring")
public class MonitoringController {

    private static final Logger logger = LoggerFactory.getLogger(MonitoringController.class);

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        logger.info("Health check requested");
        return ResponseEntity.ok(Map.of(
                "service", "monitoring-service",
                "status", "ready",
                "version", "0.0.1",
                "checkedAt", Instant.now().toString()
        ));
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> summary() {
        logger.info("Monitoring summary requested");
        return ResponseEntity.ok(Map.of(
                "service", "monitoring-service",
                "summary", Map.of(
                        "clusterHealth", 97,
                        "activeIncidents", 4,
                        "errorRate", 0.45,
                        "dataPoints", 1250000
                ),
                "signals", List.of("kubernetes", "prometheus", "cloudwatch", "kafka"),
                "status", "ready"
        ));
    }
}
