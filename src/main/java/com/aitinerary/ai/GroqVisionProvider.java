package com.aitinerary.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

@Service
@Primary
@Slf4j
public class GroqVisionProvider implements MultimodalAiService {

    @Value("${groq.api.key}")
    private String apiKey;

    // Groq's specialized vision model
    private final String model = "llama-3.2-11b-vision-preview";

    @Value("${groq.api.base-url:https://api.groq.com/openai/v1}")
    private String baseUrl;

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public GroqVisionProvider() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    @Override
    public String analyzeImage(String base64Image, String mimeType, String prompt) {
        if (apiKey == null || apiKey.isEmpty() || apiKey.startsWith("${")) {
            throw new RuntimeException("Groq API key is not configured.");
        }

        try {
            log.info("=== Groq Vision API Request ===");
            log.info("Model: {}", model);
            
            var requestNode = objectMapper.createObjectNode();
            requestNode.put("model", model);
            requestNode.put("temperature", 0.5);
            requestNode.put("max_completion_tokens", 1024);
            
            var messagesArray = requestNode.putArray("messages");
            var messageNode = messagesArray.addObject();
            messageNode.put("role", "user");
            
            var contentArray = messageNode.putArray("content");
            
            // Text part
            var textPart = contentArray.addObject();
            textPart.put("type", "text");
            textPart.put("text", prompt);
            
            // Ensure proper Base64 URL format
            String dataUrl = base64Image;
            if (!dataUrl.startsWith("data:")) {
                dataUrl = "data:" + mimeType + ";base64," + base64Image;
            }
            
            // Image part
            var imagePart = contentArray.addObject();
            imagePart.put("type", "image_url");
            var imageUrlNode = imagePart.putObject("image_url");
            imageUrlNode.put("url", dataUrl);

            String jsonRequest = objectMapper.writeValueAsString(requestNode);
            String endpoint = baseUrl + "/chat/completions";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(endpoint))
                    .header("Content-Type", "application/json")
                    .header("Authorization", "Bearer " + apiKey)
                    .timeout(Duration.ofSeconds(45))
                    .POST(HttpRequest.BodyPublishers.ofString(jsonRequest))
                    .build();

            log.info("Sending POST request to Groq Vision API...");
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            log.info("Response HTTP Status: {}", response.statusCode());

            if (response.statusCode() != 200) {
                log.error("Groq Vision Error: {}", response.body());
                throw new RuntimeException("Groq API error (HTTP " + response.statusCode() + "): " + response.body());
            }

            return extractContent(response.body());
            
        } catch (Exception e) {
            log.error("Failed to execute vision analysis", e);
            throw new RuntimeException("Vision Analysis Failed: " + e.getMessage());
        }
    }

    private String extractContent(String responseBody) throws Exception {
        JsonNode rootNode = objectMapper.readTree(responseBody);
        JsonNode choicesNode = rootNode.path("choices");
        
        if (choicesNode.isMissingNode() || !choicesNode.isArray() || choicesNode.isEmpty()) {
            throw new RuntimeException("Invalid response format: missing choices array");
        }
        
        JsonNode contentNode = choicesNode.get(0).path("message").path("content");
        
        if (contentNode.isMissingNode() || contentNode.isNull()) {
            throw new RuntimeException("Invalid response format: missing content field");
        }
        
        return contentNode.asText();
    }
}
