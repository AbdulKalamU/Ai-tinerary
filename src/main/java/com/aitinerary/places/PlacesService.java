package com.aitinerary.places;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import java.util.Map;
import java.util.List;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
public class PlacesService {

    @Value("${google.places.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();

    public String getPhotoUrl(String query) {
        if (apiKey == null || apiKey.equals("not_configured") || apiKey.isEmpty()) {
            return null; // Fallback
        }

        try {
            // Step 1: Find Place API to get photo_reference
            String findPlaceUrl = String.format(
                "https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=%s&inputtype=textquery&fields=photos&key=%s",
                URLEncoder.encode(query, StandardCharsets.UTF_8), apiKey
            );
            
            ResponseEntity<Map> response = restTemplate.getForEntity(findPlaceUrl, Map.class);
            Map<String, Object> body = response.getBody();
            
            if (body != null) {
                if (body.containsKey("status") && !body.get("status").equals("OK")) {
                    System.err.println("[Places API Error] Status: " + body.get("status") + ", Message: " + body.get("error_message"));
                }
                
                if (body.containsKey("candidates")) {
                    List<Map<String, Object>> candidates = (List<Map<String, Object>>) body.get("candidates");
                    if (!candidates.isEmpty()) {
                        Map<String, Object> candidate = candidates.get(0);
                        if (candidate.containsKey("photos")) {
                            List<Map<String, Object>> photos = (List<Map<String, Object>>) candidate.get("photos");
                            if (!photos.isEmpty()) {
                                String photoReference = (String) photos.get(0).get("photo_reference");
                                
                                // Step 2: Construct Photo API URL
                                return String.format(
                                    "https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=%s&key=%s",
                                    photoReference, apiKey
                                );
                            }
                        }
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        // Return null if place or photo not found so frontend can trigger a smart fallback
        return null;
    }
}
