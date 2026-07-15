package com.aitinerary.ai.planning;

import com.aitinerary.ai.ModelRouter;
import com.aitinerary.ai.planning.dto.ItineraryStrategyDto;
import com.aitinerary.ai.planning.dto.PlanningChatRequest;
import com.aitinerary.ai.planning.dto.PlanningChatResponse;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
@Slf4j
public class PlanningEngine {

    private final ModelRouter modelRouter;
    private final ObjectMapper objectMapper;
    
    // In-memory store for active sessions. In a real app, use Redis or a DB.
    private final Map<String, PlanningSession> activeSessions = new ConcurrentHashMap<>();

    public PlanningChatResponse processChat(PlanningChatRequest request) {
        String sessionId = request.getSessionId();
        String userMessage = request.getMessage();

        PlanningSession session = activeSessions.computeIfAbsent(sessionId, id -> new PlanningSession(id, new TravelerProfile(), new java.util.ArrayList<>()));
        session.addMessage("user", userMessage);

        try {
            // Phase 1: Profile Extraction & Intent Evaluation
            JsonNode extractionResult = runProfileExtraction(session);
            
            String status = extractionResult.path("status").asText("needs_info");
            String agentMessage = extractionResult.path("agentMessage").asText("I need a bit more info.");
            
            // Update the profile in session
            if (extractionResult.has("updatedProfile")) {
                TravelerProfile updatedProfile = objectMapper.treeToValue(extractionResult.path("updatedProfile"), TravelerProfile.class);
                session.setProfile(updatedProfile);
            }
            
            session.addMessage("assistant", agentMessage);

            if ("needs_info".equals(status)) {
                return PlanningChatResponse.builder()
                        .status("needs_info")
                        .profile(session.getProfile())
                        .agentMessage(agentMessage)
                        .build();
            }

            // Phase 2: Strategy Generation (Only if status is "complete")
            List<ItineraryStrategyDto> strategies = runStrategyGeneration(session.getProfile());
            
            return PlanningChatResponse.builder()
                    .status("complete")
                    .profile(session.getProfile())
                    .agentMessage(agentMessage)
                    .strategies(strategies)
                    .build();
                    
        } catch (Exception e) {
            log.error("Error in PlanningEngine for session {}: {}", sessionId, e.getMessage(), e);
            throw new RuntimeException("Failed to process planning chat", e);
        }
    }

    private JsonNode runProfileExtraction(PlanningSession session) throws Exception {
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are an expert AI Travel Advisor. Your goal is to extract traveler preferences from the conversation to build a complete profile.\n");
        prompt.append("Analyze the conversation history and update the current profile.\n");
        prompt.append("A complete profile should ideally have Destination, Travel Dates, Budget, Pace, Interests, Group Type, Food Preferences, and Accommodation Style.\n");
        prompt.append("If critical information (Destination, Dates, Budget, Group Type, Interests) is missing, ask ONE targeted, professional follow-up question to gather it.\n");
        prompt.append("Do NOT ask multiple questions at once. Do NOT generate an itinerary yet.\n\n");
        
        prompt.append("=== CURRENT PROFILE ===\n");
        prompt.append(objectMapper.writeValueAsString(session.getProfile())).append("\n\n");
        
        prompt.append("=== CONVERSATION HISTORY ===\n");
        for (PlanningSession.ChatMessage msg : session.getConversationHistory()) {
            prompt.append(msg.getRole().toUpperCase()).append(": ").append(msg.getContent()).append("\n");
        }
        
        prompt.append("\nRespond ONLY with valid JSON in this exact structure:\n");
        prompt.append("{\n");
        prompt.append("  \"updatedProfile\": { ... },\n");
        prompt.append("  \"status\": \"needs_info\" OR \"complete\",\n");
        prompt.append("  \"agentMessage\": \"Your response to the user. Either a follow-up question, or an acknowledgment that you are ready to generate the itinerary.\"\n");
        prompt.append("}\n");

        String aiResponse = modelRouter.generateContent(prompt.toString());
        return objectMapper.readTree(cleanJson(aiResponse));
    }

    private List<ItineraryStrategyDto> runStrategyGeneration(TravelerProfile profile) throws Exception {
        StringBuilder prompt = new StringBuilder();
        prompt.append("You are an elite AI Travel Planner. Generate multiple distinct itinerary strategies based on the traveler's profile.\n");
        prompt.append("Generate exactly 3 strategies tailored to their profile, but highlighting different approaches (e.g., 'Budget Explorer', 'Luxury Escape', 'Adventure Packed', 'Relaxed Vacation', 'Family Friendly').\n");
        prompt.append("For EVERY activity recommended, you MUST provide a clear, specific explanation in the 'whyRecommended' field based on the user's profile (e.g., 'Recommended because it matches your vegetarian preference and fits your budget').\n");
        prompt.append("Do NOT produce long paragraphs. Keep descriptions concise.\n\n");
        
        prompt.append("=== TRAVELER PROFILE ===\n");
        prompt.append(objectMapper.writeValueAsString(profile)).append("\n\n");
        
        prompt.append("Respond ONLY with a JSON ARRAY of strategy objects in this exact structure:\n");
        prompt.append("[\n");
        prompt.append("  {\n");
        prompt.append("    \"strategyName\": \"Name of strategy\",\n");
        prompt.append("    \"explanation\": \"Why this strategy matches the user profile overall\",\n");
        prompt.append("    \"totalEstimatedCost\": { \"min\": \"1000\", \"max\": \"2000\", \"currency\": \"USD\" },\n");
        prompt.append("    \"days\": [\n");
        prompt.append("      {\n");
        prompt.append("        \"dayNumber\": 1,\n");
        prompt.append("        \"date\": \"YYYY-MM-DD\",\n");
        prompt.append("        \"theme\": \"Day theme\",\n");
        prompt.append("        \"transportation\": \"How to get around\",\n");
        prompt.append("        \"activities\": [\n");
        prompt.append("          {\n");
        prompt.append("            \"time\": \"09:00 AM\",\n");
        prompt.append("            \"name\": \"Activity name\",\n");
        prompt.append("            \"description\": \"Brief 1-sentence description\",\n");
        prompt.append("            \"location\": \"Specific location\",\n");
        prompt.append("            \"duration\": \"2 hours\",\n");
        prompt.append("            \"estimatedCost\": \"$XX\",\n");
        prompt.append("            \"tips\": \"Insider tip\",\n");
        prompt.append("            \"whyRecommended\": \"Detailed reason matching profile (e.g. Recommended because...)\"\n");
        prompt.append("          }\n");
        prompt.append("        ]\n");
        prompt.append("      }\n");
        prompt.append("    ]\n");
        prompt.append("  }\n");
        prompt.append("]\n");

        String aiResponse = modelRouter.generateContent(prompt.toString());
        return objectMapper.readValue(cleanJson(aiResponse), new TypeReference<List<ItineraryStrategyDto>>() {});
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
