package com.aitinerary.ai.companion.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanionSyncResponse {
    private String agentMessage;
    private String suggestionType; // "proactive", "reactive", "tool_result"
    private Map<String, Object> toolData; // Structured data for quick actions
}
