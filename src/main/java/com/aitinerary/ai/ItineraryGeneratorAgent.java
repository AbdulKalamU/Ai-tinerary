package com.aitinerary.ai;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.regex.Pattern;

/**
 * Agent responsible for generating complete travel itineraries.
 * Matches user inputs requesting itinerary creation and produces
 * structured JSON itinerary responses via the AI provider.
 */
@Component
@Slf4j
public class ItineraryGeneratorAgent extends Agent {

    private static final Pattern HANDLE_PATTERN = Pattern.compile(
            "\\b(generate|create|plan|itinerary|build|make)\\b",
            Pattern.CASE_INSENSITIVE
    );

    public ItineraryGeneratorAgent(ModelRouter modelRouter,
                                   PromptManager promptManager,
                                   AiSafetyLayer safetyLayer,
                                   ResponseFormatter responseFormatter) {
        super(modelRouter, promptManager, safetyLayer, responseFormatter);
    }

    @Override
    public AgentType getType() {
        return AgentType.ITINERARY_GENERATOR;
    }

    /**
     * Returns true if the input contains keywords indicating an itinerary generation request.
     */
    @Override
    public boolean canHandle(String input) {
        if (input == null || input.isBlank()) {
            return false;
        }
        return HANDLE_PATTERN.matcher(input).find();
    }

    /**
     * Execute itinerary generation:
     * 1. Retrieve the itinerary.generate prompt template
     * 2. Combine with user input as context
     * 3. Send to the model router for AI generation
     * 4. Format the response as clean JSON
     */
    @Override
    public String execute(String input, Map<String, Object> context) {
        log.info("ItineraryGeneratorAgent executing for input: {}",
                input.length() > 100 ? input.substring(0, 100) + "..." : input);

        // Get the base system prompt
        String systemPrompt = promptManager.getPrompt("itinerary.generate");

        // If context contains template variables, build a customized prompt
        String fullPrompt;
        if (context != null && !context.isEmpty()) {
            @SuppressWarnings("unchecked")
            Map<String, String> templateVars = (Map<String, String>) context.get("templateVariables");
            if (templateVars != null) {
                fullPrompt = promptManager.buildPrompt("itinerary.generate", templateVars);
            } else {
                fullPrompt = systemPrompt + "\n\nUser Request:\n" + input;
            }
        } else {
            fullPrompt = systemPrompt + "\n\nUser Request:\n" + input;
        }

        // Generate via ModelRouter
        log.debug("Sending prompt to ModelRouter ({} characters)", fullPrompt.length());
        String rawResponse = modelRouter.generateContent(fullPrompt);

        // Format response as JSON
        try {
            String formattedJson = responseFormatter.formatAsJson(rawResponse);
            log.info("ItineraryGeneratorAgent produced valid JSON response ({} characters)", formattedJson.length());
            return formattedJson;
        } catch (Exception e) {
            log.warn("Response was not valid JSON, returning sanitized raw response: {}", e.getMessage());
            return rawResponse;
        }
    }
}
