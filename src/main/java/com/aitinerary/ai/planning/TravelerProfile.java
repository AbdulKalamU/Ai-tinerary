package com.aitinerary.ai.planning;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TravelerProfile {
    private String destination;
    private String travelDates; // e.g. "2026-08-01 to 2026-08-10" or "August 2026"
    private String budget;
    private String travelPace;
    private String interests;
    private String foodPreferences;
    private String accessibilityNeeds;
    private String groupType;
    private String preferredTransportation;
    private String accommodationStyle;
    private String activityIntensity;
    private String wakeSleepSchedule;
}
