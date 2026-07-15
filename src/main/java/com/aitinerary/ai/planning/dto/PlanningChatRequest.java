package com.aitinerary.ai.planning.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlanningChatRequest {
    private String sessionId;
    private String message;
}
