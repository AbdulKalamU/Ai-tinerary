package com.aitinerary.ai;

/**
 * Abstraction for AI providers (Groq, Gemini, etc.)
 * Allows switching between different AI services without changing business logic
 */
public interface AiProvider {
    
    /**
     * Generate text content based on a prompt
     * 
     * @param prompt The input prompt for the AI
     * @return The generated text response
     * @throws RuntimeException if generation fails after retries
     */
    String generateContent(String prompt);
    
    /**
     * Get the name of this provider
     * 
     * @return Provider name (e.g., "Groq", "Gemini")
     */
    String getProviderName();
    
    /**
     * Get the model being used
     * 
     * @return Model name (e.g., "llama-3.3-70b-versatile", "gemini-2.5-flash")
     */
    String getModelName();
    
    /**
     * Check if the provider is properly configured
     * 
     * @return true if provider is ready to use
     */
    boolean isConfigured();
}
