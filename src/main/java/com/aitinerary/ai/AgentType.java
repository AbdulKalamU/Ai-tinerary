package com.aitinerary.ai;

/**
 * Defines the types of AI agents available in the AI-Tinerary platform.
 * Each agent type has a specific role and description.
 */
public enum AgentType {

    ITINERARY_GENERATOR("Generates travel itineraries"),
    ACTIVITY_SUGGESTER("Suggests activities for a destination"),
    ITINERARY_MODIFIER("Modifies existing itineraries"),
    GENERAL_ASSISTANT("General travel Q&A");

    private final String description;

    AgentType(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
