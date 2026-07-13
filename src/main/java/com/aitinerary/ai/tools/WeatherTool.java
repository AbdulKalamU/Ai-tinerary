package com.aitinerary.ai.tools;

import com.aitinerary.ai.ToolRegistry;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;

/**
 * MCP Tool: Real-time weather data using the free Open-Meteo API.
 * No API key required.
 * Params: latitude (double), longitude (double)
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class WeatherTool {

    private final ToolRegistry toolRegistry;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    @PostConstruct
    public void register() {
        toolRegistry.registerTool(
                "get_weather",
                "Get current weather for a location. Params: latitude (double), longitude (double)",
                this::execute
        );
        log.info("MCP Tool registered: get_weather (Open-Meteo API)");
    }

    private String execute(Map<String, Object> params) {
        double lat = toDouble(params.get("latitude"));
        double lng = toDouble(params.get("longitude"));

        String url = String.format(
                "https://api.open-meteo.com/v1/forecast?latitude=%.4f&longitude=%.4f" +
                "&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code" +
                "&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=7",
                lat, lng
        );

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(10))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                log.error("Weather API error: HTTP {}", response.statusCode());
                return "{\"error\": \"Weather API returned HTTP " + response.statusCode() + "\"}";
            }

            // Parse and return a simplified summary
            JsonNode root = objectMapper.readTree(response.body());
            JsonNode current = root.path("current");
            JsonNode daily = root.path("daily");

            StringBuilder sb = new StringBuilder();
            sb.append("{");
            sb.append("\"current\": {");
            sb.append("\"temperature_c\": ").append(current.path("temperature_2m").asDouble()).append(",");
            sb.append("\"humidity_pct\": ").append(current.path("relative_humidity_2m").asInt()).append(",");
            sb.append("\"wind_speed_kmh\": ").append(current.path("wind_speed_10m").asDouble()).append(",");
            sb.append("\"weather_code\": ").append(current.path("weather_code").asInt());
            sb.append("},");
            sb.append("\"forecast_7day\": {");
            sb.append("\"max_temps\": ").append(daily.path("temperature_2m_max")).append(",");
            sb.append("\"min_temps\": ").append(daily.path("temperature_2m_min")).append(",");
            sb.append("\"precipitation_mm\": ").append(daily.path("precipitation_sum"));
            sb.append("}}");

            return sb.toString();
        } catch (Exception e) {
            log.error("Weather tool execution failed: {}", e.getMessage());
            return "{\"error\": \"" + e.getMessage() + "\"}";
        }
    }

    private double toDouble(Object val) {
        if (val instanceof Number) return ((Number) val).doubleValue();
        if (val instanceof String) return Double.parseDouble((String) val);
        return 0.0;
    }
}
