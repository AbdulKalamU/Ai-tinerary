package com.aitinerary.trip;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TravelPlanResponse {
    private Long id;
    private String destination;
    private LocalDate startDate;
    private LocalDate endDate;
    private String groupType;
    @Builder.Default
    private List<ItineraryDayDto> itineraryDays = new ArrayList<>();
    private LocalDateTime createdAt;
    
    // Additional AI Context Data (JSON Strings)
    private String budgetEstimate;
    private String localPhrases;
    private String packingTips;
    private String safetyTips;
    private String foodRecommendations;
}
