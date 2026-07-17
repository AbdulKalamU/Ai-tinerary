package com.aitinerary.discovery;

import com.aitinerary.ai.AiProvider;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class DiscoveryService {

    private final AiProvider aiProvider;
    private final ObjectMapper objectMapper;
    
    private List<TrendingDestination> cachedDestinations = new ArrayList<>();
    private long lastFetchTime = 0;
    private static final long CACHE_DURATION_MS = 3600000; // 1 hour

    public DiscoveryService(AiProvider aiProvider, ObjectMapper objectMapper) {
        this.aiProvider = aiProvider;
        this.objectMapper = objectMapper;
    }

    public List<TrendingDestination> getTrendingDestinations() {
        if (!cachedDestinations.isEmpty() && (System.currentTimeMillis() - lastFetchTime) < CACHE_DURATION_MS) {
            log.info("Returning cached trending destinations");
            return cachedDestinations;
        }

        log.info("Fetching new trending destinations from AI...");
        try {
            String prompt = "Generate a JSON array of 12 trending global travel destinations right now. " +
                    "Do not include markdown blocks like ```json, just output the raw JSON array. " +
                    "Each object in the array must have these exact keys: " +
                    "\"id\" (a string like 'tokyo-japan'), " +
                    "\"name\" (a string like 'Tokyo, Japan'), " +
                    "\"location\" (same as name), " +
                    "\"description\" (1 sentence description), " +
                    "\"tags\" (an array of 3 strings like ['Culture', 'Food', 'City']), " +
                    "\"category\" (a single word string like 'Culture', 'Nature', 'Relaxation', 'Adventure', 'Romance'), " +
                    "\"days\" (integer, recommended days to stay, e.g. 5), " +
                    "\"imageQuery\" (a string optimized for Google Places API image search, e.g., 'Tokyo Japan city').";

            String jsonResponse = aiProvider.generateContent(prompt);
            
            // Clean up possible markdown if the AI ignored instructions
            jsonResponse = jsonResponse.trim();
            if (jsonResponse.startsWith("```json")) {
                jsonResponse = jsonResponse.substring(7);
            }
            if (jsonResponse.startsWith("```")) {
                jsonResponse = jsonResponse.substring(3);
            }
            if (jsonResponse.endsWith("```")) {
                jsonResponse = jsonResponse.substring(0, jsonResponse.length() - 3);
            }
            jsonResponse = jsonResponse.trim();

            List<TrendingDestination> destinations = objectMapper.readValue(jsonResponse, new TypeReference<List<TrendingDestination>>() {});
            
            cachedDestinations = destinations;
            lastFetchTime = System.currentTimeMillis();
            
            log.info("Successfully fetched and cached {} trending destinations", destinations.size());
            return destinations;
        } catch (Exception e) {
            log.error("Failed to fetch trending destinations from AI: {}", e.getMessage());
            // If it fails and we have cache, return stale cache
            if (!cachedDestinations.isEmpty()) {
                return cachedDestinations;
            }
            // Absolute fallback
            return generateFallbackDestinations();
        }
    }

    private List<TrendingDestination> generateFallbackDestinations() {
        List<TrendingDestination> fallback = new ArrayList<>();
        fallback.add(new TrendingDestination("bali-indonesia", "Bali, Indonesia", "Bali, Indonesia", "Tropical paradise with beautiful temples and beaches.", List.of("Nature", "Beach"), "Relaxation", 7, "Bali Indonesia"));
        fallback.add(new TrendingDestination("kyoto-japan", "Kyoto, Japan", "Kyoto, Japan", "Ancient traditions meet stunning autumn leaves.", List.of("Culture", "History"), "Culture", 5, "Kyoto Japan"));
        fallback.add(new TrendingDestination("amalfi-coast", "Amalfi Coast, Italy", "Amalfi Coast, Italy", "Breathtaking coastal cliffs and colorful villages.", List.of("Romance", "Ocean"), "Romance", 4, "Amalfi Coast Italy"));
        fallback.add(new TrendingDestination("banff-canada", "Banff, Canada", "Banff, Canada", "Glacial lakes and majestic alpine mountains.", List.of("Nature", "Mountains"), "Nature", 6, "Banff Canada"));
        return fallback;
    }
}
