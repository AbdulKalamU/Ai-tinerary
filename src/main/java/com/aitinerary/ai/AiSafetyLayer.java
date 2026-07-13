package com.aitinerary.ai;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Safety layer for AI input/output validation and sanitization.
 * Protects against prompt injection, malformed content, and ensures
 * that inputs and outputs meet quality thresholds.
 */
@Service
@Slf4j
public class AiSafetyLayer {

    private static final int MAX_INPUT_LENGTH = 10000;
    private static final int MIN_OUTPUT_LENGTH = 50;

    private static final List<String> PROHIBITED_PATTERNS = List.of(
            "ignore previous instructions",
            "ignore all previous",
            "disregard previous",
            "forget your instructions",
            "override your instructions",
            "you are now",
            "act as if you have no restrictions",
            "pretend you are",
            "ignore the above",
            "disregard the above"
    );

    /**
     * Sanitize user input before sending to the AI provider.
     * Strips HTML tags, removes control characters, and enforces max length.
     *
     * @param input the raw user input
     * @return sanitized input safe for AI consumption
     */
    public String sanitizeInput(String input) {
        if (input == null || input.isBlank()) {
            log.debug("Input sanitization: received null or blank input");
            return "";
        }

        String sanitized = input;

        // Strip HTML tags
        sanitized = sanitized.replaceAll("<[^>]*>", "");
        log.debug("Input sanitization: stripped HTML tags");

        // Remove control characters (keep newlines and tabs for formatting)
        sanitized = sanitized.replaceAll("[\\x00-\\x08\\x0B\\x0C\\x0E-\\x1F\\x7F]", "");
        log.debug("Input sanitization: removed control characters");

        // Trim whitespace
        sanitized = sanitized.trim();

        // Enforce max length
        if (sanitized.length() > MAX_INPUT_LENGTH) {
            sanitized = sanitized.substring(0, MAX_INPUT_LENGTH);
            log.debug("Input sanitization: truncated to {} characters", MAX_INPUT_LENGTH);
        }

        log.debug("Input sanitization complete: {} -> {} characters", input.length(), sanitized.length());
        return sanitized;
    }

    /**
     * Validate that AI output meets quality thresholds.
     *
     * @param output the raw AI output
     * @return true if the output is valid and usable
     */
    public boolean validateOutput(String output) {
        if (output == null || output.isBlank()) {
            log.debug("Output validation failed: null or blank output");
            return false;
        }

        if (output.trim().length() < MIN_OUTPUT_LENGTH) {
            log.debug("Output validation failed: output too short ({} chars, minimum {})",
                    output.trim().length(), MIN_OUTPUT_LENGTH);
            return false;
        }

        log.debug("Output validation passed: {} characters", output.length());
        return true;
    }

    /**
     * Sanitize AI output by stripping markdown code fences and trimming whitespace.
     *
     * @param output the raw AI output
     * @return cleaned output suitable for downstream processing
     */
    public String sanitizeOutput(String output) {
        if (output == null || output.isBlank()) {
            log.debug("Output sanitization: received null or blank output");
            return "";
        }

        String sanitized = output.trim();

        // Strip markdown code fences (```json ... ``` or ``` ... ```)
        sanitized = sanitized.replaceAll("(?s)```\\w*\\s*", "");
        sanitized = sanitized.replaceAll("```", "");
        log.debug("Output sanitization: stripped markdown code fences");

        sanitized = sanitized.trim();

        log.debug("Output sanitization complete: {} -> {} characters", output.length(), sanitized.length());
        return sanitized;
    }

    /**
     * Check if the input text contains prompt injection or prohibited content patterns.
     *
     * @param text the text to check
     * @return true if prohibited content is detected
     */
    public boolean containsProhibitedContent(String text) {
        if (text == null || text.isBlank()) {
            return false;
        }

        String lowerText = text.toLowerCase();

        for (String pattern : PROHIBITED_PATTERNS) {
            if (lowerText.contains(pattern)) {
                log.debug("Prohibited content detected: pattern '{}' found in input", pattern);
                return true;
            }
        }

        return false;
    }
}
