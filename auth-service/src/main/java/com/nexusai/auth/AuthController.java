package com.nexusai.auth;

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
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        logger.info("Health check requested");
        return ResponseEntity.ok(Map.of(
                "service", "auth-service",
                "status", "ready",
                "version", "0.0.1",
                "checkedAt", Instant.now().toString()
        ));
    }

    @GetMapping("/capabilities")
    public ResponseEntity<Map<String, Object>> capabilities() {
        logger.info("Capabilities requested");
        return ResponseEntity.ok(Map.of(
                "service", "auth-service",
                "capabilities", Map.of(
                        "identity", List.of("signup", "login", "logout", "refresh-token"),
                        "authorization", List.of("rbac", "jwt-validation", "session-cache"),
                        "dataStores", List.of("postgresql", "redis"),
                        "security", List.of("bcrypt-hashing", "token-refresh", "revocation")
                ),
                "status", "ready"
        ));
    }
}
