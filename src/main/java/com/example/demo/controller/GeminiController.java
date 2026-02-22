
package com.example.demo.controller;

import com.example.demo.service.GeminiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
public class GeminiController {

    @Autowired
    private GeminiService geminiService;

    @PostMapping(value = "/generate-plan", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<String> generatePlan(@RequestBody TravelRequest requestData) {
        try {
            String userPrompt = String.format(
                "Generate a detailed travel plan for a trip to %s from %s to %s. Activities include: %s. The traveler type is: %s. Include: about the place, weather, itinerary, activities, places to visit. " +
                "You MUST respond ONLY with a raw, valid JSON object. Do not include any markdown formatting, do not include the word 'json', and do not use backticks (```). The JSON must have exactly these keys: 'about' (string), 'weather' (string), 'activities' (array of strings), 'places' (array of strings), 'itinerary' (array of strings).",
                requestData.getDestination(),
                requestData.getStartDate(),
                requestData.getEndDate(),
                String.join(", ", requestData.getActivities()),
                requestData.getGroupType()
            );

            String aiResponse = geminiService.generateTravelPlan(userPrompt);
            // Return the raw Gemini response as JSON
            return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(aiResponse);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("{\"error\":\"" + e.getMessage() + "\"}");
        }
    }

    public static class TravelRequest {
        private String destination;
        private String startDate;
        private String endDate;
        private String groupType;
        private List<String> activities;

        public String getDestination() { return destination; }
        public void setDestination(String destination) { this.destination = destination; }

        public String getStartDate() { return startDate; }
        public void setStartDate(String startDate) { this.startDate = startDate; }

        public String getEndDate() { return endDate; }
        public void setEndDate(String endDate) { this.endDate = endDate; }

        public String getGroupType() { return groupType; }
        public void setGroupType(String groupType) { this.groupType = groupType; }

        public List<String> getActivities() { return activities; }
        public void setActivities(List<String> activities) { this.activities = activities; }
    }
}
