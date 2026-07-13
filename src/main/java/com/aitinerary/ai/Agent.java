package com.aitinerary.ai;

import lombok.extern.slf4j.Slf4j;

import java.util.Map;

/**
 * Abstract base class for all AI agents. Provides shared infrastructure
 * for model routing, prompt management, safety validation, and response formatting.
 * Subclasses implement the specific logic for each agent type.
 */
@Slf4j
public abstract class Agent {

    protected final ModelRouter modelRouter;
    protected final PromptManager promptManager;
    protected final AiSafetyLayer safetyLayer;
    protected final ResponseFormatter responseFormatter;

    /**
     * Constructor with dependency injection for all shared services.
     *
     * @param modelRouter       the model router for AI provider access
     * @param promptManager     the prompt template manager
     * @param safetyLayer       the input/output safety layer
     * @param responseFormatter the response formatter for JSON compliance
     */
    protected Agent(ModelRouter modelRouter, PromptManager promptManager,
                    AiSafetyLayer safetyLayer, ResponseFormatter responseFormatter) {
        this.modelRouter = modelRouter;
        this.promptManager = promptManager;
        this.safetyLayer = safetyLayer;
        this.responseFormatter = responseFormatter;
    }

    /**
     * Get the type of this agent.
     *
     * @return the agent type enum value
     */
    public abstract AgentType getType();

    /**
     * Execute the agent's core logic on the given input.
     *
     * @param input   the user's input text
     * @param context additional context parameters
     * @return the agent's response
     */
    public abstract String execute(String input, Map<String, Object> context);

    /**
     * Determine whether this agent can handle the given input.
     *
     * @param input the user's input text
     * @return true if this agent is appropriate for the input
     */
    public abstract boolean canHandle(String input);

    /**
     * Safe execution wrapper that applies input sanitization, output validation,
     * and output sanitization around the core execute() method.
     *
     * @param input   the raw user input
     * @param context additional context parameters
     * @return the validated and sanitized response
     * @throws RuntimeException if the output fails validation
     */
    protected String safeExecute(String input, Map<String, Object> context) {
        // Sanitize input
        String sanitizedInput = safetyLayer.sanitizeInput(input);
        log.debug("Agent [{}]: sanitized input ({} -> {} chars)",
                getType(), input.length(), sanitizedInput.length());

        // Execute core logic
        String rawOutput = execute(sanitizedInput, context);

        // Sanitize output
        String sanitizedOutput = safetyLayer.sanitizeOutput(rawOutput);
        log.debug("Agent [{}]: sanitized output ({} -> {} chars)",
                getType(), rawOutput.length(), sanitizedOutput.length());

        // Validate output
        if (!safetyLayer.validateOutput(sanitizedOutput)) {
            log.warn("Agent [{}]: output failed validation (length: {})",
                    getType(), sanitizedOutput.length());
            throw new RuntimeException("Agent output failed validation. " +
                    "Output was too short or empty for agent type: " + getType());
        }

        return sanitizedOutput;
    }
}
