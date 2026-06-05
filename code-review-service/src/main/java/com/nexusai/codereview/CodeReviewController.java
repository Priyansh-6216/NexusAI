package com.nexusai.codereview;

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
@RequestMapping("/api/reviews")
public class CodeReviewController {

    private static final Logger logger = LoggerFactory.getLogger(CodeReviewController.class);

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        logger.info("Health check requested");
        return ResponseEntity.ok(Map.of(
                "service", "code-review-service",
                "status", "ready",
                "version", "0.0.1",
                "checkedAt", Instant.now().toString()
        ));
    }

    @GetMapping("/capabilities")
    public ResponseEntity<Map<String, Object>> capabilities() {
        logger.info("Capabilities requested");
        return ResponseEntity.ok(Map.of(
                "service", "code-review-service",
                "capabilities", Map.of(
                        "reviewTypes", List.of("security", "quality", "performance", "architecture", "tests"),
                        "inputs", List.of("pull-request", "diff", "repository", "context"),
                        "outputs", List.of("comments", "risk-score", "test-suggestions", "refactoring-hints")
                ),
                "integrations", List.of("github", "gitlab", "bitbucket", "ai-services"),
                "status", "ready"
        ));
    }
}
