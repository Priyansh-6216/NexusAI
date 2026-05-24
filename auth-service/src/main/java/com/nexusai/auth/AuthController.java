package com.nexusai.auth;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {

    @GetMapping("/api/auth/health")
    public Map<String, Object> health() {
        return Map.of(
                "service", "auth-service",
                "status", "ready",
                "checkedAt", Instant.now().toString()
        );
    }

    @GetMapping("/api/auth/capabilities")
    public Map<String, Object> capabilities() {
        return Map.of(
                "identity", List.of("signup", "login", "refresh-token"),
                "authorization", List.of("rbac", "jwt-validation", "session-cache"),
                "dataStores", List.of("postgresql", "redis")
        );
    }
}
