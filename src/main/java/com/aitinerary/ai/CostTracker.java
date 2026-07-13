package com.aitinerary.ai;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

/**
 * Service for tracking AI token usage and estimating costs per provider.
 * Records each AI invocation with token counts, timing, and success status
 * for analytics and rate-limiting purposes.
 */
@Service
@Slf4j
public class CostTracker {

    private final AiUsageRepository usageRepository;

    public CostTracker(AiUsageRepository usageRepository) {
        this.usageRepository = usageRepository;
    }

    /**
     * Record an AI usage event.
     *
     * @param userId           the user who initiated the request
     * @param provider         the AI provider name (e.g., "Groq", "Gemini")
     * @param model            the model used
     * @param promptTokens     estimated input token count
     * @param completionTokens estimated output token count
     * @param requestType      the type of request (e.g., "itinerary.generate")
     * @param durationMs       request duration in milliseconds
     * @param success          whether the request succeeded
     * @param errorMessage     error message if the request failed (may be null)
     */
    public void recordUsage(Long userId, String provider, String model,
                            int promptTokens, int completionTokens,
                            String requestType, long durationMs,
                            boolean success, String errorMessage) {
        int totalTokens = promptTokens + completionTokens;
        double estimatedCost = estimateCost(provider, totalTokens);

        AiUsageRecord record = AiUsageRecord.builder()
                .userId(userId)
                .provider(provider)
                .model(model)
                .promptTokens(promptTokens)
                .completionTokens(completionTokens)
                .totalTokens(totalTokens)
                .estimatedCost(estimatedCost)
                .requestType(requestType)
                .durationMs(durationMs)
                .success(success)
                .errorMessage(errorMessage)
                .build();

        usageRepository.save(record);

        log.info("Recorded AI usage: user={}, provider={}, model={}, tokens={}, cost=${}, success={}, duration={}ms",
                userId, provider, model, totalTokens,
                String.format("%.6f", estimatedCost), success, durationMs);
    }

    /**
     * Estimate the cost for a given provider and token count.
     * Groq is free tier; Gemini charges ~$0.001 per 1K tokens.
     *
     * @param provider    the provider name
     * @param totalTokens the total token count
     * @return estimated cost in USD
     */
    public double estimateCost(String provider, int totalTokens) {
        if (provider == null) {
            return 0.0;
        }

        return switch (provider.toLowerCase()) {
            case "groq" -> 0.0; // Groq free tier
            case "gemini" -> (totalTokens / 1000.0) * 0.001;
            default -> {
                log.debug("Unknown provider '{}' for cost estimation, defaulting to $0", provider);
                yield 0.0;
            }
        };
    }

    /**
     * Get all AI usage records for a user from today (since midnight).
     *
     * @param userId the user ID
     * @return list of today's usage records
     */
    public List<AiUsageRecord> getUserUsageToday(Long userId) {
        LocalDateTime startOfDay = LocalDate.now().atTime(LocalTime.MIN);
        return usageRepository.findByUserIdAndCreatedAtAfter(userId, startOfDay);
    }

    /**
     * Get the total token count across all AI requests for a user.
     *
     * @param userId the user ID
     * @return total tokens consumed, or 0 if no records exist
     */
    public int getUserTotalTokens(Long userId) {
        List<AiUsageRecord> records = usageRepository.findByUserId(userId);
        return records.stream()
                .filter(r -> r.getTotalTokens() != null)
                .mapToInt(AiUsageRecord::getTotalTokens)
                .sum();
    }
}
