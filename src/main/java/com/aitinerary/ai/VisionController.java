package com.aitinerary.ai;

import com.aitinerary.ai.VisionRequest;
import com.aitinerary.ai.MultimodalAiService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/vision")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class VisionController {

    private final MultimodalAiService visionService;

    @PostMapping("/passport")
    public ResponseEntity<String> analyzePassport(@Valid @RequestBody VisionRequest request) {
        log.info("Analyzing Passport Image");
        
        String prompt = "You are an expert AI Travel Assistant. Analyze this image of a passport. " +
                "Extract the following information and return ONLY valid JSON: " +
                "1. firstName " +
                "2. lastName " +
                "3. nationality " +
                "4. documentNumber " +
                "5. dateOfExpiry (format YYYY-MM-DD). " +
                "If it is not a passport, return {\"error\": \"Image is not a recognized passport\"}. " +
                "Do not include any markdown formatting or extra text.";

        String response = visionService.analyzeImage(request.getBase64Image(), request.getMimeType(), prompt);
        return ResponseEntity.ok(cleanJsonResponse(response));
    }

    @PostMapping("/luggage")
    public ResponseEntity<String> analyzeLuggage(@Valid @RequestBody VisionRequest request) {
        log.info("Analyzing Luggage Image for destination: {}", request.getDestinationContext());
        
        String context = request.getDestinationContext() != null 
                ? " The user is traveling to: " + request.getDestinationContext() + "." 
                : "";

        String prompt = "You are an expert AI Travel Assistant. Analyze this image of an open suitcase/luggage." +
                context +
                " Identify the visible items packed. Then, based on common travel needs (and the destination weather if provided), " +
                "suggest 3-5 crucial items the traveler might have forgotten. " +
                "Return ONLY valid JSON with two arrays: " +
                "{\"packedItems\": [\"item1\"], \"missingSuggestions\": [\"suggestion1\"]}. " +
                "Do not include any markdown formatting.";

        String response = visionService.analyzeImage(request.getBase64Image(), request.getMimeType(), prompt);
        return ResponseEntity.ok(cleanJsonResponse(response));
    }

    @PostMapping("/receipt")
    public ResponseEntity<String> analyzeReceipt(@Valid @RequestBody VisionRequest request) {
        log.info("Analyzing Receipt Image");
        
        String prompt = "You are an expert AI Travel Budget Tracker. Analyze this image of a receipt. " +
                "Extract the total amount, currency symbol, merchant name, date, and categorize the expense " +
                "(e.g., Food & Dining, Transportation, Accommodation, Shopping). " +
                "Return ONLY valid JSON: " +
                "{\"merchantName\": \"Name\", \"date\": \"YYYY-MM-DD\", \"currency\": \"$\", \"totalAmount\": 0.00, \"category\": \"Category\"}. " +
                "If not a receipt, return {\"error\": \"Not a valid receipt\"}. " +
                "Do not include markdown.";

        String response = visionService.analyzeImage(request.getBase64Image(), request.getMimeType(), prompt);
        return ResponseEntity.ok(cleanJsonResponse(response));
    }
    
    // Helper to strip markdown blocks if the AI includes them despite instructions
    private String cleanJsonResponse(String response) {
        String clean = response.trim();
        if (clean.startsWith("```json")) {
            clean = clean.substring(7);
        } else if (clean.startsWith("```")) {
            clean = clean.substring(3);
        }
        if (clean.endsWith("```")) {
            clean = clean.substring(0, clean.length() - 3);
        }
        return clean.trim();
    }
}
