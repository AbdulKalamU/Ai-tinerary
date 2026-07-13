package com.aitinerary.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Service
@Slf4j
public class GeminiProvider implements AiProvider {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.model}")
    private String model;

    @Value("${gemini.api.base-url}")
    private String baseUrl;

    @Value("${gemini.api.version}")
    private String apiVersion;

    @Value("${gemini.api.max-retries:3}")
    private int maxRetries;

    @Value("${gemini.api.timeout-seconds:30}")
    private int timeoutSeconds;

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public GeminiProvider() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    @PostConstruct
    public void init() {
        log.info("=== Gemini AI Provider Configuration ===");
        log.info("Provider: Gemini");
        log.info("Base URL: {}", baseUrl);
        log.info("API Version: {}", apiVersion);
        log.info("Model: {}", model);
        log.info("Max Retries: {}", maxRetries);
        
        if (apiKey == null || apiKey.isEmpty() || apiKey.startsWith("${")) {
            log.error("API Key Status: NOT CONFIGURED");
        } else {
            log.info("API Key Status: LOADED");
        }
        log.info("=== Configuration Complete ===");
    }

    @Override
    public String generateContent(String prompt) {
        if (!isConfigured()) {
            throw new RuntimeException("Gemini provider is not properly configured. Check GEMINI_API_KEY environment variable.");
        }

        Exception lastException = null;
        
        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                log.info("=== Gemini API Request (Attempt {}/{}) ===", attempt, maxRetries);
                String result = attemptGeneration(prompt);
                log.info("=== SUCCESS on attempt {} ===", attempt);
                return result;
            } catch (Exception e) {
                lastException = e;
                log.warn("Attempt {}/{} failed: {}", attempt, maxRetries, e.getMessage());
                
                if (attempt < maxRetries) {
                    int delaySeconds = attempt * 2;
                    log.info("Retrying in {} seconds...", delaySeconds);
                    try {
                        Thread.sleep(delaySeconds * 1000L);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                        throw new RuntimeException("Retry interrupted", ie);
                    }
                }
            }
        }
        
        log.error("All {} attempts failed", maxRetries);
        throw new RuntimeException("Failed to generate content after " + maxRetries + " attempts. Last error: " + 
            (lastException != null ? lastException.getMessage() : "Unknown error"));
    }

    private String attemptGeneration(String prompt) throws Exception {
        // Build request using Jackson for proper JSON serialization
        var requestNode = objectMapper.createObjectNode();
        var contentsArray = requestNode.putArray("contents");
        var contentNode = contentsArray.addObject();
        var partsArray = contentNode.putArray("parts");
        var partNode = partsArray.addObject();
        partNode.put("text", prompt);

        String jsonRequest = objectMapper.writeValueAsString(requestNode);

        String endpoint = String.format("%s/%s/models/%s:generateContent?key=%s", 
            baseUrl, apiVersion, model, apiKey);

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .header("Content-Type", "application/json")
                .timeout(Duration.ofSeconds(timeoutSeconds))
                .POST(HttpRequest.BodyPublishers.ofString(jsonRequest))
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        log.info("Response HTTP Status: {}", response.statusCode());

        if (response.statusCode() != 200) {
            throw new RuntimeException("Gemini API error (HTTP " + response.statusCode() + "): " + response.body());
        }

        return extractGeminiContent(response.body());
    }

    /**
     * Extracts the AI-generated text from the Gemini API response using Jackson ObjectMapper.
     * The response format is: {"candidates":[{"content":{"parts":[{"text":"..."}]}}]}
     * 
     * This replaces the old fragile indexOf/substring parsing that broke on
     * any AI response containing quote characters.
     */
    private String extractGeminiContent(String responseBody) {
        try {
            JsonNode rootNode = objectMapper.readTree(responseBody);
            JsonNode candidatesNode = rootNode.path("candidates");
            
            if (candidatesNode.isMissingNode() || !candidatesNode.isArray() || candidatesNode.isEmpty()) {
                log.error("No candidates found in Gemini response");
                throw new RuntimeException("Invalid response format: missing candidates array");
            }
            
            JsonNode textNode = candidatesNode.get(0)
                    .path("content")
                    .path("parts")
                    .get(0)
                    .path("text");
            
            if (textNode.isMissingNode() || textNode.isNull()) {
                log.error("No text found in first candidate");
                throw new RuntimeException("Invalid response format: missing text field");
            }
            
            return textNode.asText();
        } catch (Exception e) {
            log.error("Failed to extract content from Gemini response", e);
            throw new RuntimeException("Failed to parse Gemini response: " + e.getMessage());
        }
    }

    @Override
    public String getProviderName() {
        return "Gemini";
    }

    @Override
    public String getModelName() {
        return model;
    }

    @Override
    public boolean isConfigured() {
        return apiKey != null && 
               !apiKey.isEmpty() && 
               !apiKey.startsWith("${") &&
               model != null;
    }
}
