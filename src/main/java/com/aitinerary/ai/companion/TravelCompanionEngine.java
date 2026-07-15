package com.aitinerary.ai.companion;

import com.aitinerary.ai.ModelRouter;
import com.aitinerary.ai.companion.dto.CompanionSyncRequest;
import com.aitinerary.ai.companion.dto.CompanionSyncResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class TravelCompanionEngine {

    private final ModelRouter modelRouter;
    private final ObjectMapper objectMapper;

    public CompanionSyncResponse processCompanionSync(CompanionSyncRequest request) {
        try {
            if (request.getActiveAction() != null && !request.getActiveAction().isEmpty()) {
                return handleQuickAction(request);
            }
            if (request.getUserMessage() != null && !request.getUserMessage().isEmpty()) {
                return handleUserMessage(request);
            }
            return handleProactiveSuggestion(request);
        } catch (Exception e) {
            log.error("Companion engine error: {}", e.getMessage(), e);
            return CompanionSyncResponse.builder()
                    .agentMessage("I'm having trouble connecting right now, but I'm here to help.")
                    .suggestionType("error")
                    .build();
        }
    }

    private CompanionSyncResponse handleProactiveSuggestion(CompanionSyncRequest request) throws Exception {
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are an elite, proactive human-like Travel Companion AI.\n");
        prompt.append("The traveler is currently on their trip.\n");
        prompt.append("Context:\n");
        prompt.append("- Time of day: ").append(request.getTimeOfDay()).append(" (").append(request.getLocalTime()).append(")\n");
        prompt.append("- Location: ").append(request.getCurrentLocation()).append("\n");
        prompt.append("- Weather context: ").append(request.getWeatherContext()).append("\n\n");
        
        prompt.append("Task: Generate a PROACTIVE, brief (1-3 sentences) message to the user.\n");
        prompt.append("Examples:\n");
        prompt.append("- 'Rain expected in one hour. You might want to move the museum visit earlier.'\n");
        prompt.append("- 'The beach will be crowded this afternoon. Consider visiting before 10 AM.'\n");
        prompt.append("- 'It's getting late! I found a great local dinner spot 5 mins away.'\n\n");
        
        prompt.append("Respond ONLY with a JSON object:\n");
        prompt.append("{\n");
        prompt.append("  \"agentMessage\": \"Your proactive message\"\n");
        prompt.append("}\n");

        String aiResponse = modelRouter.generateContent(prompt.toString());
        JsonNode root = objectMapper.readTree(cleanJson(aiResponse));
        
        return CompanionSyncResponse.builder()
                .agentMessage(root.path("agentMessage").asText())
                .suggestionType("proactive")
                .build();
    }

    private CompanionSyncResponse handleUserMessage(CompanionSyncRequest request) throws Exception {
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are an elite, human-like Travel Companion AI assisting a traveler currently on their trip.\n");
        prompt.append("Context:\n");
        prompt.append("- Location: ").append(request.getCurrentLocation()).append("\n");
        prompt.append("- User says: ").append(request.getUserMessage()).append("\n\n");
        
        prompt.append("Task: Respond to the user's message concisely and helpfully.\n");
        
        prompt.append("Respond ONLY with a JSON object:\n");
        prompt.append("{\n");
        prompt.append("  \"agentMessage\": \"Your response\"\n");
        prompt.append("}\n");

        String aiResponse = modelRouter.generateContent(prompt.toString());
        JsonNode root = objectMapper.readTree(cleanJson(aiResponse));
        
        return CompanionSyncResponse.builder()
                .agentMessage(root.path("agentMessage").asText())
                .suggestionType("reactive")
                .build();
    }

    private CompanionSyncResponse handleQuickAction(CompanionSyncRequest request) throws Exception {
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are an elite Travel Companion AI handling a quick action request.\n");
        prompt.append("Context: Location: ").append(request.getCurrentLocation()).append("\n");
        prompt.append("Action requested: ").append(request.getActiveAction()).append("\n\n");
        
        prompt.append("Task: Generate a highly relevant response for this action (e.g. for 'emergency' provide mock local emergency numbers, for 'transit' provide a mock transit update, for 'etiquette' provide a quick local tip).\n");
        
        prompt.append("Respond ONLY with a JSON object:\n");
        prompt.append("{\n");
        prompt.append("  \"agentMessage\": \"A brief conversational message introducing the data\",\n");
        prompt.append("  \"toolData\": { \"key\": \"value\" }\n");
        prompt.append("}\n");

        String aiResponse = modelRouter.generateContent(prompt.toString());
        JsonNode root = objectMapper.readTree(cleanJson(aiResponse));
        
        Map<String, Object> toolData = new HashMap<>();
        if (root.has("toolData")) {
            toolData = objectMapper.convertValue(root.path("toolData"), Map.class);
        }
        
        return CompanionSyncResponse.builder()
                .agentMessage(root.path("agentMessage").asText())
                .suggestionType("tool_result")
                .toolData(toolData)
                .build();
    }

    private String cleanJson(String raw) {
        String json = raw.trim();
        if (json.startsWith("```")) {
            json = json.replaceFirst("```(?:json)?\\s*", "");
            json = json.replaceAll("\\s*```$", "");
        }
        return json;
    }
}
