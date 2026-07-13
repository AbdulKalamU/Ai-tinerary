package com.aitinerary.trip;

import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
public class AiPlanResponseDto {
    private String overview;
    private String bestTimeToVisit;
    private String language;
    private String currency;
    private String weatherDuringTrip;
    private Map<String, String> budgetEstimate;
    private List<AiDayDto> days;
    private List<String> packingTips;
    private List<Map<String, String>> localPhrases;
    private List<Map<String, String>> foodRecommendations;
    private List<String> safetyTips;

    @Data
    public static class AiDayDto {
        private Integer day;
        private String title;
        private List<AiActivityDto> activities;
    }

    @Data
    public static class AiActivityDto {
        private String time;
        private String name;
        private String description;
        private String category;
        private String estimatedCost;
        private String duration;
        private Map<String, Object> location;
        private String tips;
        private String imageKeyword;
    }
}
