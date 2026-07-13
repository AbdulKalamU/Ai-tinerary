package com.aitinerary.ai.tools;

import com.aitinerary.ai.ToolRegistry;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Map;

/**
 * MCP Tool: Country information using the free RestCountries API.
 * No API key required.
 * Params: country (name, e.g. "France")
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class CountryInfoTool {

    private final ToolRegistry toolRegistry;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    @PostConstruct
    public void register() {
        toolRegistry.registerTool(
                "get_country_info",
                "Get country information. Params: country (string, e.g. 'France')",
                this::execute
        );
        log.info("MCP Tool registered: get_country_info (RestCountries API)");
    }

    private String execute(Map<String, Object> params) {
        String country = params.getOrDefault("country", "").toString();
        if (country.isBlank()) {
            return "{\"error\": \"Country name is required\"}";
        }

        String encoded = URLEncoder.encode(country, StandardCharsets.UTF_8);
        String url = "https://restcountries.com/v3.1/name/" + encoded + "?fields=name,capital,currencies,languages,population,region,subregion,timezones,latlng";

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(10))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                return "{\"error\": \"Country not found or API error (HTTP " + response.statusCode() + ")\"}";
            }

            JsonNode root = objectMapper.readTree(response.body());
            if (!root.isArray() || root.isEmpty()) {
                return "{\"error\": \"No results found for '" + country + "'\"}";
            }

            JsonNode c = root.get(0);

            StringBuilder sb = new StringBuilder();
            sb.append("{");
            sb.append("\"name\": \"").append(c.path("name").path("common").asText()).append("\",");
            sb.append("\"official_name\": \"").append(c.path("name").path("official").asText()).append("\",");
            sb.append("\"capital\": ").append(c.path("capital")).append(",");
            sb.append("\"region\": \"").append(c.path("region").asText()).append("\",");
            sb.append("\"subregion\": \"").append(c.path("subregion").asText()).append("\",");
            sb.append("\"population\": ").append(c.path("population").asLong()).append(",");
            sb.append("\"currencies\": ").append(c.path("currencies")).append(",");
            sb.append("\"languages\": ").append(c.path("languages")).append(",");
            sb.append("\"timezones\": ").append(c.path("timezones")).append(",");
            sb.append("\"latlng\": ").append(c.path("latlng"));
            sb.append("}");

            return sb.toString();
        } catch (Exception e) {
            log.error("Country info tool execution failed: {}", e.getMessage());
            return "{\"error\": \"" + e.getMessage() + "\"}";
        }
    }
}
