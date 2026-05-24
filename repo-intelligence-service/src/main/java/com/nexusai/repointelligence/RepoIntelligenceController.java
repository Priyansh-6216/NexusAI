package com.nexusai.repointelligence;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RepoIntelligenceController {

    @GetMapping("/api/repos/health")
    public Map<String, Object> health() {
        return Map.of(
                "service", "repo-intelligence-service",
                "status", "ready",
                "checkedAt", Instant.now().toString()
        );
    }

    @GetMapping("/api/repos/capabilities")
    public Map<String, Object> capabilities() {
        return Map.of(
                "ingestion", List.of("github", "metadata", "source-tree"),
                "analysis", List.of("semantic-search", "dependency-map", "ownership"),
                "storage", List.of("postgresql", "vector-db")
        );
    }
}
