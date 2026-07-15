package com.aitinerary.ai.planning.dto;

import com.aitinerary.ai.planning.TravelerProfile;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PlanningChatResponse {
    private String status; // "needs_info" or "complete"
    private TravelerProfile profile;
    private String agentMessage; // The follow-up question or concluding message
    private List<ItineraryStrategyDto> strategies; // Only populated if status is "complete"
}
