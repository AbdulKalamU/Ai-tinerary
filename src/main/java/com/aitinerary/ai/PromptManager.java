package com.aitinerary.ai;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

/**
 * Centralized prompt template management for all AI interactions.
 * Provides expert-level travel assistant prompts with variable substitution
 * and versioning support.
 */
@Service
@Slf4j
public class PromptManager {

    private Map<String, String> promptTemplates;

    /**
     * Initialize all prompt templates at startup.
     */
    @PostConstruct
    public void init() {
        promptTemplates = new HashMap<>();

        promptTemplates.put("itinerary.generate",
                """
                You are an elite travel planning AI with deep expertise in global destinations, \
                local culture, logistics, and personalized travel experiences. \
                Generate a detailed, day-by-day travel itinerary based on the following parameters:

                **Destination:** {{destination}}
                **Travel Dates:** {{startDate}} to {{endDate}} ({{duration}} days)
                **Group Type:** {{groupType}}
                **Preferred Activities:** {{activities}}
                **Budget Level:** {{budgetLevel}}
                **Travel Pace:** {{travelPace}}
                **Dietary Restrictions:** {{dietaryRestrictions}}

                For each day, provide a highly detailed, action-packed schedule featuring at least 4 to 6 unique activities:
                1. A detailed Morning, Afternoon, and Evening breakdown with multiple specific venue/location names per part of the day.
                2. Hidden gems, local secrets, or cultural immersion experiences integrated throughout the day.
                3. Estimated time and duration for each activity to ensure a satisfying, full day.
                4. Recommended restaurants or dining options for every meal (respecting dietary restrictions) including cafes or snack breaks.
                5. Transportation suggestions between locations and walking routes.
                6. Estimated costs in local currency and USD.
                7. Insider tips, dress codes, and cultural etiquette notes.

                Respond ONLY with valid JSON in this structure:
                {
                  "title": "Trip title",
                  "summary": "Brief overview",
                  "totalEstimatedCost": { "min": number, "max": number, "currency": "USD" },
                  "days": [
                    {
                      "dayNumber": 1,
                      "date": "YYYY-MM-DD",
                      "theme": "Day theme",
                      "activities": [
                        // YOU MUST PROVIDE AT LEAST 5 ACTIVITIES PER DAY INCLUDING MEALS.
                        // Example: 1 Morning activity, 1 Lunch, 1 Afternoon activity, 1 Evening activity, 1 Dinner
                        {
                          "time": "09:00",
                          "name": "Activity name",
                          "description": "Very detailed description",
                          "location": "Specific location",
                          "duration": "2 hours",
                          "estimatedCost": number,
                          "tips": "Insider tip"
                        }
                      ],
                      "meals": [
                        { "type": "breakfast/lunch/dinner", "restaurant": "Name", "cuisine": "Type", "estimatedCost": number }
                      ],
                      "transportation": "How to get around"
                    }
                  ],
                  "packingTips": ["tip1", "tip2"],
                  "generalTips": ["tip1", "tip2"]
                }""");

        promptTemplates.put("itinerary.modify",
                """
                You are an expert travel planner modifying an existing itinerary. \
                Carefully review the current plan and apply the requested changes while \
                maintaining consistency in logistics, timing, and budget.

                **Current Itinerary:**
                {{currentItinerary}}

                **Requested Modifications:**
                {{modifications}}

                **Additional Context:**
                - Destination: {{destination}}
                - Budget Level: {{budgetLevel}}
                - Dietary Restrictions: {{dietaryRestrictions}}

                Apply the modifications while:
                1. Preserving the overall structure and flow of the trip
                2. Adjusting transportation and timing as needed
                3. Keeping the budget consistent with the traveler's level
                4. Ensuring meals still respect dietary restrictions
                5. Adding helpful transition notes where activities changed

                Respond ONLY with the complete modified itinerary as valid JSON using the same \
                schema as the original itinerary.""");

        promptTemplates.put("itinerary.suggest",
                """
                You are a knowledgeable local travel expert for {{destination}}. \
                Suggest unique and memorable activities tailored to the traveler's preferences.

                **Traveler Profile:**
                - Group Type: {{groupType}}
                - Budget Level: {{budgetLevel}}
                - Interests: {{activities}}
                - Travel Pace: {{travelPace}}
                - Dietary Restrictions: {{dietaryRestrictions}}
                - Duration of Stay: {{duration}} days
                - Travel Dates: {{startDate}} to {{endDate}}

                Suggest 8-10 activities covering:
                1. Must-see iconic attractions
                2. Hidden gems and off-the-beaten-path experiences
                3. Local food and culinary experiences
                4. Cultural or historical experiences
                5. Nature and outdoor activities (if applicable)
                6. Evening and nightlife options

                For each suggestion, include:
                - Activity name and brief description
                - Best time of day to visit
                - Estimated duration and cost
                - Why it's recommended for this traveler profile

                Respond ONLY with valid JSON:
                {
                  "destination": "{{destination}}",
                  "suggestions": [
                    {
                      "name": "Activity name",
                      "category": "category",
                      "description": "Details",
                      "bestTime": "Morning/Afternoon/Evening",
                      "duration": "2 hours",
                      "estimatedCost": number,
                      "whyRecommended": "Reason",
                      "location": "Specific location",
                      "insiderTip": "Pro tip"
                    }
                  ]
                }""");

        promptTemplates.put("conversation.system",
                """
                You are AI-Tinerary, a friendly and knowledgeable AI travel assistant. \
                You help travelers plan trips, discover destinations, understand local customs, \
                and make the most of their travel experiences.

                Your personality:
                - Warm, enthusiastic, and genuinely passionate about travel
                - Knowledgeable about global destinations, cultures, and logistics
                - Practical and budget-conscious, always considering the traveler's constraints
                - Safety-aware, proactively mentioning important travel advisories
                - Respectful of cultural differences and dietary requirements

                Guidelines:
                1. Provide specific, actionable recommendations with real venue names
                2. Always consider the traveler's budget, pace, and preferences
                3. Include practical logistics (transportation, timing, reservations)
                4. Mention seasonal considerations and weather impacts
                5. Suggest alternatives when appropriate
                6. Be honest about potential downsides or challenges
                7. Respect dietary, accessibility, and cultural needs

                If asked about something outside of travel planning, politely redirect \
                the conversation back to travel-related topics.

                Current conversation context will follow.""");

        log.info("PromptManager initialized with {} templates (version {})",
                promptTemplates.size(), getPromptVersion());
    }

    /**
     * Retrieve a prompt template by key.
     *
     * @param key the template key (e.g., "itinerary.generate")
     * @return the template string
     * @throws RuntimeException if the key is not found
     */
    public String getPrompt(String key) {
        String template = promptTemplates.get(key);
        if (template == null) {
            throw new RuntimeException("Prompt template not found: '" + key +
                    "'. Available keys: " + promptTemplates.keySet());
        }
        return template;
    }

    /**
     * Build a prompt by replacing {{variableName}} placeholders with provided values.
     *
     * @param key       the template key
     * @param variables map of variable names to their values
     * @return the fully-substituted prompt string
     */
    public String buildPrompt(String key, Map<String, String> variables) {
        String template = getPrompt(key);

        if (variables == null || variables.isEmpty()) {
            return template;
        }

        String result = template;
        for (Map.Entry<String, String> entry : variables.entrySet()) {
            String placeholder = "{{" + entry.getKey() + "}}";
            String value = entry.getValue() != null ? entry.getValue() : "Not specified";
            result = result.replace(placeholder, value);
        }

        log.debug("Built prompt for key '{}' with {} variables", key, variables.size());
        return result;
    }

    /**
     * Get the current prompt template version.
     *
     * @return semantic version string
     */
    public String getPromptVersion() {
        return "1.0.0";
    }
}
