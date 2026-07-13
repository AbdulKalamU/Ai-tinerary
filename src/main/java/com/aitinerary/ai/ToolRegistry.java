package com.aitinerary.ai;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.function.Function;

/**
 * Registry for AI-invocable tools. Provides a mechanism for agents to call
 * external functions (tools) by name with structured parameters.
 * Built-in tools are registered at startup; additional tools can be registered dynamically.
 */
@Service
@Slf4j
public class ToolRegistry {

    private final Map<String, ToolDefinition> registry = new ConcurrentHashMap<>();

    /**
     * Represents a registered tool with its metadata and executor function.
     */
    public record ToolDefinition(
            String name,
            String description,
            Function<Map<String, Object>, String> executor
    ) {
    }

    /**
     * Register built-in tools at application startup.
     */
    @PostConstruct
    public void init() {
        registerTool(
                "get_current_date",
                "Returns the current date in ISO-8601 format (YYYY-MM-DD)",
                params -> LocalDate.now().toString()
        );

        log.info("ToolRegistry initialized with {} built-in tool(s): {}", registry.size(), getAvailableTools());
    }

    /**
     * Register a new tool in the registry.
     *
     * @param name        unique tool name
     * @param description human-readable description of what the tool does
     * @param executor    function that accepts parameters and returns a result string
     */
    public void registerTool(String name, String description, Function<Map<String, Object>, String> executor) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Tool name must not be null or blank");
        }
        if (executor == null) {
            throw new IllegalArgumentException("Tool executor must not be null");
        }

        registry.put(name, new ToolDefinition(name, description, executor));
        log.info("Registered tool: '{}' — {}", name, description);
    }

    /**
     * Invoke a registered tool by name.
     *
     * @param toolName the name of the tool to invoke
     * @param params   the parameters to pass to the tool
     * @return the tool's result string
     * @throws RuntimeException if the tool is not found or execution fails
     */
    public String invokeTool(String toolName, Map<String, Object> params) {
        ToolDefinition tool = registry.get(toolName);
        if (tool == null) {
            throw new RuntimeException("Tool not found: '" + toolName +
                    "'. Available tools: " + getAvailableTools());
        }

        log.debug("Invoking tool '{}' with params: {}", toolName, params);

        try {
            String result = tool.executor().apply(params != null ? params : Collections.emptyMap());
            log.debug("Tool '{}' returned: {}", toolName,
                    result != null && result.length() > 200 ? result.substring(0, 200) + "..." : result);
            return result;
        } catch (Exception e) {
            log.error("Tool '{}' execution failed: {}", toolName, e.getMessage(), e);
            throw new RuntimeException("Tool '" + toolName + "' execution failed: " + e.getMessage(), e);
        }
    }

    /**
     * Get the list of all registered tool names.
     *
     * @return list of tool names
     */
    public List<String> getAvailableTools() {
        return new ArrayList<>(registry.keySet());
    }

    /**
     * Get the full tool definition by name, or null if not found.
     *
     * @param toolName the tool name
     * @return the tool definition, or null
     */
    public ToolDefinition getToolDefinition(String toolName) {
        return registry.get(toolName);
    }
}
