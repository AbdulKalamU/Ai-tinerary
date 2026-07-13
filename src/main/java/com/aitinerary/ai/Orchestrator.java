package com.aitinerary.ai;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 * Central AI orchestrator that coordinates the full request lifecycle:
 * input sanitization → safety checks → conversation memory → agent routing →
 * execution → output validation → usage tracking → response delivery.
 */
@Service
@Slf4j
public class Orchestrator {

    private final List<Agent> agents;
    private final CostTracker costTracker;
    private final ConversationMemory memory;
    private final ContextBuilder contextBuilder;
    private final AiSafetyLayer safetyLayer;

    public Orchestrator(List<Agent> agents,
                        CostTracker costTracker,
                        ConversationMemory memory,
                        ContextBuilder contextBuilder,
                        AiSafetyLayer safetyLayer) {
        this.agents = agents;
        this.costTracker = costTracker;
        this.memory = memory;
        this.contextBuilder = contextBuilder;
        this.safetyLayer = safetyLayer;

        log.info("Orchestrator initialized with {} agent(s): {}",
                agents.size(),
                agents.stream().map(a -> a.getType().name()).toList());
    }

    /**
     * Process an AI request through the full orchestration pipeline.
     *
     * @param input     the user's raw input text
     * @param userId    the authenticated user's ID
     * @param sessionId the conversation session identifier
     * @return the AI-generated response
     * @throws RuntimeException if input is prohibited or all agents fail
     */
    public String processRequest(String input, Long userId, String sessionId) {
        long startTime = System.currentTimeMillis();
        log.info("Orchestrator: processing request for user={}, session={}", userId, sessionId);

        // Step 1: Sanitize input
        String sanitizedInput = safetyLayer.sanitizeInput(input);
        log.debug("Orchestrator: input sanitized ({} -> {} chars)", input.length(), sanitizedInput.length());

        // Step 2: Check for prohibited content
        if (safetyLayer.containsProhibitedContent(sanitizedInput)) {
            log.warn("Orchestrator: prohibited content detected from user={}", userId);
            return "I'm sorry, but I can't process that request. " +
                    "Please rephrase your travel-related question.";
        }

        // Step 3: Add user message to conversation memory
        memory.addMessage(sessionId, "user", sanitizedInput);
        log.debug("Orchestrator: added user message to session {}", sessionId);

        // Step 4: Find the right agent
        Agent agent = findAgent(sanitizedInput);
        log.info("Orchestrator: routed to agent [{}] for input: {}",
                agent.getType(),
                sanitizedInput.length() > 80 ? sanitizedInput.substring(0, 80) + "..." : sanitizedInput);

        // Step 5: Execute agent
        String result;
        boolean success = true;
        String errorMessage = null;
        try {
            result = agent.safeExecute(sanitizedInput, Map.of());
            log.info("Orchestrator: agent [{}] produced response ({} chars)", agent.getType(), result.length());
        } catch (Exception e) {
            success = false;
            errorMessage = e.getMessage();
            log.error("Orchestrator: agent [{}] execution failed: {}", agent.getType(), e.getMessage());
            result = "I encountered an issue while processing your request. " +
                    "Please try again or rephrase your question.";
        }

        // Step 6: Validate output
        if (success && !safetyLayer.validateOutput(result)) {
            log.warn("Orchestrator: output validation failed for agent [{}]", agent.getType());
            success = false;
            errorMessage = "Output validation failed";
        }

        // Step 7: Record usage via cost tracker
        long durationMs = System.currentTimeMillis() - startTime;
        try {
            // Estimate token counts from character lengths (rough approximation: 4 chars ≈ 1 token)
            int estimatedPromptTokens = sanitizedInput.length() / 4;
            int estimatedCompletionTokens = result.length() / 4;

            costTracker.recordUsage(
                    userId,
                    "default",
                    "default",
                    estimatedPromptTokens,
                    estimatedCompletionTokens,
                    agent.getType().name(),
                    durationMs,
                    success,
                    errorMessage
            );
        } catch (Exception e) {
            log.error("Orchestrator: failed to record usage: {}", e.getMessage());
        }

        // Step 8: Add response to conversation memory
        memory.addMessage(sessionId, "assistant", result);
        log.debug("Orchestrator: added assistant response to session {}", sessionId);

        // Step 9: Return result
        log.info("Orchestrator: request completed in {}ms (success={})", durationMs, success);
        return result;
    }

    /**
     * Find the appropriate agent for the given input.
     * Iterates through registered agents and returns the first one that can handle
     * the input. Defaults to the GENERAL_ASSISTANT agent.
     *
     * @param input the user's input text
     * @return the matching agent
     */
    public Agent findAgent(String input) {
        for (Agent agent : agents) {
            if (agent.canHandle(input)) {
                return agent;
            }
        }

        // Default to GENERAL_ASSISTANT if available
        return agents.stream()
                .filter(a -> a.getType() == AgentType.GENERAL_ASSISTANT)
                .findFirst()
                .orElse(agents.get(0)); // Fallback to first registered agent
    }
}
