package com.aitinerary.ai.companion.dto;

import lombok.Data;

@Data
public class CompanionSyncRequest {
    private String planId;
    private String localTime; // e.g., "14:30"
    private String timeOfDay; // "Morning", "Lunch", "Afternoon", "Evening", "Night"
    private String currentLocation;
    private String weatherContext;
    private String activeAction; // Action triggered by user (e.g., "directions", "emergency")
    private String userMessage;  // Direct message from the user
}
