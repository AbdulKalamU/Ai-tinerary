package com.aitinerary.ai.planning.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ItineraryStrategyDto {
    private String strategyName; // e.g., "Budget Explorer", "Luxury Escape"
    private String explanation;  // Why it exists and matches the user
    private BudgetEstimate totalEstimatedCost;
    private List<DayPlan> days;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BudgetEstimate {
        private String min;
        private String max;
        private String currency;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class DayPlan {
        private int dayNumber;
        private String date;
        private String theme;
        private List<ActivityPlan> activities;
        private String transportation;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class ActivityPlan {
        private String time;
        private String name;
        private String description;
        private String location;
        private String duration;
        private String estimatedCost;
        private String tips;
        private String whyRecommended; // Clear explanation for recommendation
    }
}
