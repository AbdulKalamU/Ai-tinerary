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
@ConditionalOnProperty(name = "gemini.api.key")
public class GeminiEmbeddingProvider implements EmbeddingProvider {

    @Value("${gemini.api.key}")
    private String apiKey;

    // We hardcode text-embedding-004 as it is standard and produces 768d vectors
    private static final String MODEL_NAME = "text-embedding-004";
    private static final String API_URL_FORMAT = "https://generativelanguage.googleapis.com/v1beta/models/%s:embedContent?key=%s";
    
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public GeminiEmbeddingProvider() {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    @PostConstruct
    public void init() {
        log.info("GeminiEmbeddingProvider initialized with model: {}", MODEL_NAME);
    }

    @Override
    public float[] generateEmbedding(String text) {
        if (apiKey == null || apiKey.isBlank() || apiKey.startsWith("${")) {
            throw new RuntimeException("Gemini API key is not configured for embeddings.");
        }

        try {
            var requestNode = objectMapper.createObjectNode();
            requestNode.put("model", "models/" + MODEL_NAME);
            
            var contentNode = requestNode.putObject("content");
            var partsArray = contentNode.putArray("parts");
            var textPart = partsArray.addObject();
            textPart.put("text", text);

            String jsonRequest = objectMapper.writeValueAsString(requestNode);
            String url = String.format(API_URL_FORMAT, MODEL_NAME, apiKey);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .header("Content-Type", "application/json")
                    .timeout(Duration.ofSeconds(10))
                    .POST(HttpRequest.BodyPublishers.ofString(jsonRequest))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.error("Gemini Embedding API error: HTTP {}", response.statusCode());
                log.error("Response: {}", response.body());
                throw new RuntimeException("Embedding API error: HTTP " + response.statusCode());
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode valuesNode = root.path("embedding").path("values");
            
            if (valuesNode.isMissingNode() || !valuesNode.isArray()) {
                throw new RuntimeException("Invalid response format: missing embedding array");
            }

            float[] embedding = new float[valuesNode.size()];
            for (int i = 0; i < valuesNode.size(); i++) {
                embedding[i] = (float) valuesNode.get(i).asDouble();
            }

            return embedding;
        } catch (Exception e) {
            log.error("Failed to generate embedding: {}", e.getMessage());
            throw new RuntimeException("Failed to generate embedding", e);
        }
    }

    @Override
    public int getDimensions() {
        return 768; // Standard output size for text-embedding-004
    }
}
