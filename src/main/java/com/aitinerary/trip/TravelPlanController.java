package com.aitinerary.trip;

import com.aitinerary.auth.UserPrincipal;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class TravelPlanController {

    private final TravelPlanService travelPlanService;

    @PostMapping("/generate-plan")
    public ResponseEntity<TravelPlanResponse> generatePlan(
            @Valid @RequestBody TravelPlanRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        TravelPlanResponse response = travelPlanService.createTravelPlan(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/travel-plans")
    public ResponseEntity<Map<String, Object>> getUserPlans(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<TravelPlanResponse> planPage = travelPlanService.getUserTravelPlans(currentUser, pageable);

        Map<String, Object> result = new HashMap<>();
        result.put("plans", planPage.getContent());
        result.put("total", planPage.getTotalElements());
        result.put("page", planPage.getNumber());
        result.put("totalPages", planPage.getTotalPages());

        return ResponseEntity.ok(result);
    }

    @GetMapping("/travel-plans/{id}")
    public ResponseEntity<TravelPlanResponse> getPlanById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        TravelPlanResponse response = travelPlanService.getTravelPlanById(id, currentUser);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/travel-plans/{id}")
    public ResponseEntity<Void> deletePlan(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        travelPlanService.deleteTravelPlan(id, currentUser);
        return ResponseEntity.noContent().build();
    }

    // ─── Workspace Endpoints ──────────────────────────────────

    @PatchMapping("/activities/{activityId}")
    public ResponseEntity<ActivityDto> updateActivity(
            @PathVariable Long activityId,
            @RequestBody ActivityDto dto,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        ActivityDto updated = travelPlanService.updateActivity(activityId, dto, currentUser);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/days/{dayId}/reorder")
    public ResponseEntity<Void> reorderActivities(
            @PathVariable Long dayId,
            @RequestBody List<Long> activityIds,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        travelPlanService.reorderActivities(dayId, activityIds, currentUser);
        return ResponseEntity.ok().build();
    }
}
