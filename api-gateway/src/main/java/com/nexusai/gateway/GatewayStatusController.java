package com.nexusai.gateway;

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
@RequestMapping("/gateway")
public class GatewayStatusController {

    private static final Logger logger = LoggerFactory.getLogger(GatewayStatusController.class);

    private static final List<Map<String, String>> ROUTES = List.of(
            Map.of("id", "auth-service", "path", "/api/auth/**", "target", "http://auth-service:8081", "status", "ready"),
            Map.of("id", "monitoring-service", "path", "/api/monitoring/**", "target", "http://monitoring-service:8082", "status", "ready"),
            Map.of("id", "incident-service", "path", "/api/incidents/**", "target", "http://incident-service:8083", "status", "ready"),
            Map.of("id", "code-review-service", "path", "/api/reviews/**", "target", "http://code-review-service:8084", "status", "ready"),
            Map.of("id", "repo-intelligence-service", "path", "/api/repos/**", "target", "http://repo-intelligence-service:8085", "status", "ready"),
            Map.of("id", "llm-router-service", "path", "/api/llm/**", "target", "http://llm-router-service:8086", "status", "ready"),
            Map.of("id", "ai-agent-service", "path", "/api/agents/**", "target", "http://ai-agent-service:8087", "status", "ready")
    );

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> status() {
        logger.info("Gateway status requested");
        return ResponseEntity.ok(Map.of(
                "service", "api-gateway",
                "status", "ready",
                "version", "0.0.1",
                "checkedAt", Instant.now().toString(),
                "totalRoutes", ROUTES.size(),
                "routes", ROUTES,
                "loadBalancing", "enabled",
                "circuitBreaker", "enabled",
                "rateLimit", "enabled"
        ));
    }

    @GetMapping("/routes")
    public ResponseEntity<Map<String, Object>> routes() {
        logger.info("Routes listing requested");
        return ResponseEntity.ok(Map.of(
                "service", "api-gateway",
                "routes", ROUTES,
                "totalRoutes", ROUTES.size(),
                "status", "ready"
        ));
    }
}
