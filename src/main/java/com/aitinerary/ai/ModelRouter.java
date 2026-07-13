package com.aitinerary.ai;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Facade over multiple AiProvider implementations. Routes AI generation requests
 * to the configured default provider, a specific named provider, or implements
 * automatic fallback across available providers.
 *
 * Also implements AiProvider itself so it can be used as a drop-in replacement
 * anywhere an AiProvider is expected, delegating to the default provider.
 */
@Service
@Slf4j
public class ModelRouter {

    private final List<AiProvider> providers;

    @Value("${ai.provider:groq}")
    private String defaultProvider;

    public ModelRouter(List<AiProvider> providers) {
        this.providers = providers;
        log.info("ModelRouter initialized with {} provider(s)", providers.size());
    }

    /**
     * Generate content using the default provider.
     *
     * @param prompt the input prompt
     * @return the generated content
     */
    public String generateContent(String prompt) {
        // Automatically attempt generation using the robust fallback system
        // which iterates through all available configured providers (Groq -> Gemini -> OpenAI)
        return generateWithFallback(prompt);
    }

    /**
     * Generate content using a specific named provider.
     *
     * @param prompt       the input prompt
     * @param providerName the provider to use (case-insensitive)
     * @return the generated content
     * @throws RuntimeException if the provider is not found or not configured
     */
    public String generateContent(String prompt, String providerName) {
        AiProvider provider = findProvider(providerName);

        if (!provider.isConfigured()) {
            throw new RuntimeException("Provider '" + providerName + "' is not properly configured");
        }

        log.info("Routing request to provider '{}' (model: {})", provider.getProviderName(), provider.getModelName());
        return provider.generateContent(prompt);
    }

    /**
     * Generate content with automatic fallback. Tries the default provider first,
     * then falls back to the next available configured provider.
     *
     * @param prompt the input prompt
     * @return the generated content
     * @throws RuntimeException if all providers fail
     */
    public String generateWithFallback(String prompt) {
        // Try default provider first
        try {
            AiProvider defaultProv = findProvider(defaultProvider);
            if (defaultProv.isConfigured()) {
                log.info("Attempting generation with default provider '{}'", defaultProv.getProviderName());
                return defaultProv.generateContent(prompt);
            }
        } catch (Exception e) {
            log.warn("Default provider '{}' failed: {}", defaultProvider, e.getMessage());
        }

        // Fallback to any other configured provider
        for (AiProvider provider : providers) {
            if (provider.getProviderName().equalsIgnoreCase(defaultProvider)) {
                continue; // Skip the default that already failed
            }
            if (!provider.isConfigured()) {
                continue; // Skip unconfigured providers
            }

            try {
                log.info("Falling back to provider '{}'", provider.getProviderName());
                return provider.generateContent(prompt);
            } catch (Exception e) {
                log.warn("Fallback provider '{}' failed: {}", provider.getProviderName(), e.getMessage());
            }
        }

        throw new RuntimeException("All AI providers failed to generate content. Tried: " +
                providers.stream().map(AiProvider::getProviderName).collect(Collectors.joining(", ")));
    }

    /**
     * Get the list of available (configured) provider names.
     *
     * @return list of provider names that are properly configured
     */
    public List<String> getAvailableProviders() {
        return providers.stream()
                .filter(AiProvider::isConfigured)
                .map(AiProvider::getProviderName)
                .collect(Collectors.toList());
    }

    public String getProviderName() {
        return "ModelRouter";
    }

    public String getModelName() {
        try {
            return findProvider(defaultProvider).getModelName();
        } catch (Exception e) {
            return "unknown";
        }
    }

    public boolean isConfigured() {
        return providers.stream().anyMatch(AiProvider::isConfigured);
    }

    /**
     * Find a provider by name (case-insensitive).
     *
     * @param name the provider name to search for
     * @return the matching AiProvider
     * @throws RuntimeException if no provider with the given name is found
     */
    private AiProvider findProvider(String name) {
        return providers.stream()
                .filter(p -> p.getProviderName().equalsIgnoreCase(name))
                .findFirst()
                .orElseThrow(() -> new RuntimeException(
                        "No AI provider found with name '" + name + "'. Available: " +
                                providers.stream().map(AiProvider::getProviderName).collect(Collectors.joining(", "))
                ));
    }
}
