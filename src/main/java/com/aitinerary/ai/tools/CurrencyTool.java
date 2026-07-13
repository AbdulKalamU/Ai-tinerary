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
 * MCP Tool: Currency exchange rates using the free ExchangeRate-API.
 * No API key required for the open endpoint.
 * Params: base (currency code, e.g. "USD"), target (currency code, e.g. "EUR")
 */
@Component
@Slf4j
@RequiredArgsConstructor
public class CurrencyTool {

    private final ToolRegistry toolRegistry;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    @PostConstruct
    public void register() {
        toolRegistry.registerTool(
                "get_exchange_rate",
                "Get currency exchange rate. Params: base (string, e.g. 'USD'), target (string, e.g. 'EUR')",
                this::execute
        );
        log.info("MCP Tool registered: get_exchange_rate (ExchangeRate-API)");
    }

    private String execute(Map<String, Object> params) {
        String base = params.getOrDefault("base", "USD").toString().toUpperCase();
        String target = params.getOrDefault("target", "EUR").toString().toUpperCase();

        String url = "https://open.er-api.com/v6/latest/" + base;

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(10))
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200) {
                return "{\"error\": \"Exchange rate API returned HTTP " + response.statusCode() + "\"}";
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode rates = root.path("rates");

            if (rates.isMissingNode() || !rates.has(target)) {
                return "{\"error\": \"Currency code '" + target + "' not found\"}";
            }

            double rate = rates.path(target).asDouble();
            String lastUpdate = root.path("time_last_update_utc").asText("");

            return String.format(
                    "{\"base\": \"%s\", \"target\": \"%s\", \"rate\": %.6f, \"last_updated\": \"%s\"}",
                    base, target, rate, lastUpdate
            );
        } catch (Exception e) {
            log.error("Currency tool execution failed: {}", e.getMessage());
            return "{\"error\": \"" + e.getMessage() + "\"}";
        }
    }
}
