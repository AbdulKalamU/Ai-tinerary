package com.aitinerary.ai.companion;

import com.aitinerary.ai.companion.dto.CompanionSyncRequest;
import com.aitinerary.ai.companion.dto.CompanionSyncResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/companion")
@RequiredArgsConstructor
public class CompanionController {

    private final TravelCompanionEngine companionEngine;

    @PostMapping("/sync")
    public ResponseEntity<CompanionSyncResponse> syncCompanion(@RequestBody CompanionSyncRequest request) {
        CompanionSyncResponse response = companionEngine.processCompanionSync(request);
        return ResponseEntity.ok(response);
    }
}
