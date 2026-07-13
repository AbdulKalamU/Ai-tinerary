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
public class OpenAiProvider implements AiProvider {

    @Value("${openai.api.key}")
    private String apiKey;

    @Value("${openai.api.model}")
    private String model;

    @Value("${openai.api.base-url}")
    private String baseUrl;

    @Value("${openai.api.max-retries:3}")
    private int maxRetries;

    @Value("${openai.api.timeout-seconds:30}")
    private int timeoutSeconds;

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public OpenAiProvider() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    @PostConstruct
    public void init() {
        log.info("=== OpenAI AI Provider Configuration ===");
        log.info("Provider: OpenAI");
        log.info("Base URL: {}", baseUrl);
        log.info("Model: {}", model);
        log.info("Max Retries: {}", maxRetries);
        log.info("Timeout: {} seconds", timeoutSeconds);
        
        if (apiKey == null || apiKey.isEmpty() || apiKey.startsWith("${")) {
            log.error("API Key Status: NOT CONFIGURED");
            log.error("Set OPENAI_API_KEY environment variable");
        } else {
            log.info("API Key Status: LOADED");
            log.info("API Key Length: {} characters", apiKey.length());
            log.info("API Key Preview: {}...", apiKey.substring(0, Math.min(8, apiKey.length())));
        }
        log.info("=== Configuration Complete ===");
    }

    @Override
    public String generateContent(String prompt) {
        if (!isConfigured()) {
            throw new RuntimeException("OpenAI provider is not properly configured. Check OPENAI_API_KEY environment variable.");
        }

        Exception lastException = null;
        
        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                log.info("=== OpenAI API Request (Attempt {}/{}) ===", attempt, maxRetries);
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
        log.info("Model: {}", model);
        log.info("Base URL: {}", baseUrl);
        log.info("Timeout: {} seconds", timeoutSeconds);

        var requestNode = objectMapper.createObjectNode();
        requestNode.put("model", model);
        requestNode.put("temperature", 0.7);
        requestNode.put("max_tokens", 4500); 
        
        var responseFormatNode = requestNode.putObject("response_format");
        responseFormatNode.put("type", "json_object");
        
        var messagesArray = requestNode.putArray("messages");
        var messageNode = messagesArray.addObject();
        messageNode.put("role", "user");
        messageNode.put("content", prompt);

        String jsonRequest = objectMapper.writeValueAsString(requestNode);
        String endpoint = baseUrl + "/chat/completions";
        
        log.info("Endpoint: {}", endpoint);
        log.info("Request Body Length: {} bytes", jsonRequest.length());

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .header("Content-Type", "application/json")
                .header("Authorization", "Bearer " + apiKey)
                .timeout(Duration.ofSeconds(timeoutSeconds))
                .POST(HttpRequest.BodyPublishers.ofString(jsonRequest))
                .build();

        log.info("Sending POST request to OpenAI API...");
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

        log.info("Response HTTP Status: {}", response.statusCode());
        log.info("Response Body Length: {} bytes", response.body() != null ? response.body().length() : 0);
        
        if (response.body() != null && !response.body().isEmpty()) {
            String preview = response.body().length() > 500 
                ? response.body().substring(0, 500) + "..." 
                : response.body();
            log.debug("Response Preview: {}", preview);
        }

        if (response.statusCode() != 200) {
            log.error("=== OPENAI API ERROR ===");
            log.error("HTTP Status: {}", response.statusCode());
            log.error("Response Body: {}", response.body());
            
            switch (response.statusCode()) {
                case 401:
                    throw new RuntimeException("Authentication failed. Check OPENAI_API_KEY.");
                case 429:
                    throw new RuntimeException("Rate limit exceeded. Retrying...");
                case 503:
                    throw new RuntimeException("Service temporarily unavailable. Retrying...");
                default:
                    throw new RuntimeException("OpenAI API error (HTTP " + response.statusCode() + "): " + response.body());
            }
        }

        String content = extractContent(response.body());
        log.info("Generated Content Length: {} characters", content.length());
        
        return content;
    }

    private String extractContent(String responseBody) {
        try {
            JsonNode rootNode = objectMapper.readTree(responseBody);
            JsonNode choicesNode = rootNode.path("choices");
            
            if (choicesNode.isMissingNode() || !choicesNode.isArray() || choicesNode.isEmpty()) {
                log.error("No choices found in OpenAI response");
                throw new RuntimeException("Invalid response format: missing choices array");
            }
            
            JsonNode contentNode = choicesNode.get(0).path("message").path("content");
            
            if (contentNode.isMissingNode() || contentNode.isNull()) {
                log.error("No content found in first choice message");
                throw new RuntimeException("Invalid response format: missing content field");
            }
            
            return contentNode.asText();
        } catch (Exception e) {
            log.error("Failed to extract content from OpenAI response", e);
            throw new RuntimeException("Failed to parse OpenAI response: " + e.getMessage());
        }
    }

    @Override
    public String getProviderName() {
        return "OpenAI";
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
               model != null &&
               !model.isEmpty();
    }
}
