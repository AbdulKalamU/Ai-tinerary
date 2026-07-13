package com.aitinerary.ai.tools;

import com.aitinerary.ai.ToolRegistry;
import com.aitinerary.auth.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * REST controller exposing the Tool Invocation Layer to the frontend.
 * Allows listing available tools and invoking them via API.
 */
@RestController
@RequestMapping("/api/v1/tools")
@RequiredArgsConstructor
public class ToolController {

    private final ToolRegistry toolRegistry;

    @GetMapping
    public ResponseEntity<Map<String, Object>> listTools() {
        List<Map<String, String>> tools = toolRegistry.getAvailableTools().stream()
                .map(name -> {
                    ToolRegistry.ToolDefinition def = toolRegistry.getToolDefinition(name);
                    Map<String, String> toolInfo = new HashMap<>();
                    toolInfo.put("name", name);
                    toolInfo.put("description", def != null ? def.description() : "");
                    return toolInfo;
                })
                .collect(Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("tools", tools);
        response.put("total", tools.size());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/{toolName}/invoke")
    public ResponseEntity<Map<String, Object>> invokeTool(
            @PathVariable String toolName,
            @RequestBody(required = false) Map<String, Object> params,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        String result = toolRegistry.invokeTool(toolName, params != null ? params : Map.of());

        Map<String, Object> response = new HashMap<>();
        response.put("tool", toolName);
        response.put("result", result);

        return ResponseEntity.ok(response);
    }
}
