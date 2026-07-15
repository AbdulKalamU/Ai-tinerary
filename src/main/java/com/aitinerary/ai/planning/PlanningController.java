package com.aitinerary.ai.planning;

import com.aitinerary.ai.planning.dto.PlanningChatRequest;
import com.aitinerary.ai.planning.dto.PlanningChatResponse;
import com.aitinerary.auth.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/planning")
@RequiredArgsConstructor
public class PlanningController {

    private final PlanningEngine planningEngine;

    @PostMapping("/chat")
    public ResponseEntity<PlanningChatResponse> chat(
            @RequestBody PlanningChatRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        // currentUser is not strictly required if we want to allow guests, 
        // but can be used later to save the session to the DB.
        
        PlanningChatResponse response = planningEngine.processChat(request);
        return ResponseEntity.ok(response);
    }
}
