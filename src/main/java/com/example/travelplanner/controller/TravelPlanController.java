package com.example.travelplanner.controller;

import com.example.travelplanner.model.TravelPlanRequest;
import com.example.travelplanner.model.TravelPlanResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/travel")
public class TravelPlanController {


    @PostMapping("/plan")
    public TravelPlanResponse generatePlan(@RequestBody TravelPlanRequest request) {
        // AI functionality removed due to missing dependency
        String result = "AI functionality unavailable. Please add Spring AI dependency or implement custom logic.";
        return new TravelPlanResponse(result);
    }
}
