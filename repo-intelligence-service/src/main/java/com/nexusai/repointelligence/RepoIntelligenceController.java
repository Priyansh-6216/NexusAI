package com.nexusai.repointelligence;

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
@RequestMapping("/api/repos")
public class RepoIntelligenceController {

    private static final Logger logger = LoggerFactory.getLogger(RepoIntelligenceController.class);

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        logger.info("Health check requested");
        return ResponseEntity.ok(Map.of(
                "service", "repo-intelligence-service",
                "status", "ready",
                "version", "0.0.1",
                "checkedAt", Instant.now().toString()
        ));
    }

    @GetMapping("/capabilities")
    public ResponseEntity<Map<String, Object>> capabilities() {
        logger.info("Capabilities requested");
        return ResponseEntity.ok(Map.of(
                "service", "repo-intelligence-service",
                "capabilities", Map.of(
                        "ingestion", List.of("github", "gitlab", "bitbucket", "source-tree"),
                        "analysis", List.of("semantic-search", "dependency-map", "codebase-ownership", "architecture-patterns"),
                        "storage", List.of("postgresql", "qdrant-vector-db"),
                        "embedding", List.of("code-embeddings", "semantic-chunks")
                ),
                "status", "ready"
        ));
    }
}
