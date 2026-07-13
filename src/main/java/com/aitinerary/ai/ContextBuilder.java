package com.aitinerary.ai;

import com.aitinerary.trip.TravelPlanRequest;
import com.aitinerary.user.UserPreferences;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;

/**
 * Assembles context variables for LLM prompt templates by extracting and
 * formatting data from TravelPlanRequest and UserPreferences.
 * Handles null preferences gracefully with sensible defaults.
 */
@Service
@Slf4j
public class ContextBuilder {

    /**
     * Build a map of template variables from a travel plan request and user preferences.
     *
     * @param request the travel plan request containing destination, dates, etc.
     * @param prefs   the user's preferences (may be null)
     * @return map of variable names to string values for prompt template substitution
     */
    public Map<String, String> buildItineraryContext(TravelPlanRequest request, UserPreferences prefs) {
        Map<String, String> context = new HashMap<>();

        // Extract from TravelPlanRequest
        context.put("destination", safeString(request.getDestination(), "Not specified"));

        if (request.getStartDate() != null) {
            context.put("startDate", request.getStartDate().toString());
        } else {
            context.put("startDate", "Not specified");
        }

        if (request.getEndDate() != null) {
            context.put("endDate", request.getEndDate().toString());
        } else {
            context.put("endDate", "Not specified");
        }

        // Calculate trip duration
        if (request.getStartDate() != null && request.getEndDate() != null) {
            long days = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;
            context.put("duration", String.valueOf(days));
        } else {
            context.put("duration", "Not specified");
        }

        context.put("groupType", safeString(request.getGroupType(), "General travelers"));

        // Format activities list
        if (request.getActivities() != null && !request.getActivities().isEmpty()) {
            context.put("activities", String.join(", ", request.getActivities()));
        } else {
            context.put("activities", "Open to suggestions");
        }

        // Extract from UserPreferences (handle null gracefully)
        if (prefs != null) {
            context.put("budgetLevel", safeString(prefs.getBudgetLevel(), "Moderate"));
            context.put("travelPace", safeString(prefs.getTravelPace(), "Moderate"));
            context.put("dietaryRestrictions", safeString(prefs.getDietaryRestrictions(), "None"));
        } else {
            context.put("budgetLevel", "Moderate");
            context.put("travelPace", "Moderate");
            context.put("dietaryRestrictions", "None");
        }

        log.debug("Built itinerary context with {} variables for destination '{}'",
                context.size(), context.get("destination"));

        return context;
    }

    /**
     * Returns the value if non-null and non-blank, otherwise returns the default.
     */
    private String safeString(String value, String defaultValue) {
        return (value != null && !value.isBlank()) ? value : defaultValue;
    }
}
