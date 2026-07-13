package com.aitinerary.ai;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * JPA entity for tracking AI provider usage, token consumption, and estimated costs.
 * Each record represents a single AI API invocation.
 */
@Entity
@Table(name = "ai_usage_records")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiUsageRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id")
    private Long userId;

    @Column(name = "provider", length = 50)
    private String provider;

    @Column(name = "model", length = 100)
    private String model;

    @Column(name = "prompt_tokens")
    private Integer promptTokens;

    @Column(name = "completion_tokens")
    private Integer completionTokens;

    @Column(name = "total_tokens")
    private Integer totalTokens;

    @Column(name = "estimated_cost")
    private Double estimatedCost;

    @Column(name = "request_type", length = 50)
    private String requestType;

    @Column(name = "duration_ms")
    private Long durationMs;

    @Column(name = "success")
    private Boolean success;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
