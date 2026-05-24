package com.nexusai.codereview;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CodeReviewController {

    @GetMapping("/api/reviews/health")
    public Map<String, Object> health() {
        return Map.of(
                "service", "code-review-service",
                "status", "ready",
                "checkedAt", Instant.now().toString()
        );
    }

    @GetMapping("/api/reviews/capabilities")
    public Map<String, Object> capabilities() {
        return Map.of(
                "reviewTypes", List.of("security", "quality", "tests", "architecture"),
                "inputs", List.of("pull-request", "diff", "repository"),
                "outputs", List.of("comments", "risk-score", "test-suggestions")
        );
    }
}
