package com.aitinerary.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Service for ensuring AI responses comply with JSON schema expectations.
 * Handles extraction of JSON from mixed text/markdown output, validation,
 * and reformatting for downstream consumers.
 */
@Service
@Slf4j
public class ResponseFormatter {

    private final ObjectMapper objectMapper;

    public ResponseFormatter(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    /**
     * Format a raw AI response as clean, validated JSON.
     * Strips markdown fences, validates structure, and returns clean JSON.
     *
     * @param rawResponse the raw AI output (may contain markdown fences)
     * @return clean JSON string
     * @throws RuntimeException if the response cannot be parsed as valid JSON
     */
    public String formatAsJson(String rawResponse) {
        if (rawResponse == null || rawResponse.isBlank()) {
            throw new RuntimeException("Cannot format null or blank response as JSON");
        }

        // Strip markdown code fences
        String cleaned = rawResponse.trim();
        cleaned = cleaned.replaceAll("(?s)```json\\s*", "");
        cleaned = cleaned.replaceAll("(?s)```\\w*\\s*", "");
        cleaned = cleaned.replaceAll("```", "");
        cleaned = cleaned.trim();

        // Validate it's proper JSON
        if (!isValidJson(cleaned)) {
            // Try extracting JSON from mixed text
            String extracted = extractJsonFromText(cleaned);
            if (extracted != null && isValidJson(extracted)) {
                log.debug("Extracted valid JSON from mixed text response");
                return extracted;
            }
            throw new RuntimeException("Response is not valid JSON after cleaning: " +
                    cleaned.substring(0, Math.min(200, cleaned.length())));
        }

        log.debug("Formatted response as clean JSON ({} characters)", cleaned.length());
        return cleaned;
    }

    /**
     * Extract a JSON object from mixed text by finding the first '{' and last '}'.
     *
     * @param text the mixed text potentially containing JSON
     * @return the extracted JSON string, or null if no JSON object is found
     */
    public String extractJsonFromText(String text) {
        if (text == null || text.isBlank()) {
            return null;
        }

        int firstBrace = text.indexOf('{');
        int lastBrace = text.lastIndexOf('}');

        if (firstBrace == -1 || lastBrace == -1 || lastBrace <= firstBrace) {
            log.debug("No JSON object boundaries found in text");
            return null;
        }

        String candidate = text.substring(firstBrace, lastBrace + 1);

        if (isValidJson(candidate)) {
            log.debug("Extracted JSON object from text: {} characters", candidate.length());
            return candidate;
        }

        log.debug("Extracted text between braces is not valid JSON");
        return null;
    }

    /**
     * Check whether the given string is valid JSON.
     *
     * @param json the string to validate
     * @return true if the string parses as valid JSON
     */
    public boolean isValidJson(String json) {
        if (json == null || json.isBlank()) {
            return false;
        }

        try {
            objectMapper.readTree(json);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Pretty-print a JSON string with indentation.
     *
     * @param json the compact JSON string
     * @return pretty-printed JSON, or the original string if parsing fails
     */
    public String prettyPrint(String json) {
        if (json == null || json.isBlank()) {
            return json;
        }

        try {
            JsonNode node = objectMapper.readTree(json);
            return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(node);
        } catch (Exception e) {
            log.debug("Failed to pretty-print JSON, returning original: {}", e.getMessage());
            return json;
        }
    }
}
