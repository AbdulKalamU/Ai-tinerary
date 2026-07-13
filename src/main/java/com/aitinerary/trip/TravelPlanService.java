package com.aitinerary.trip;

import com.aitinerary.user.User;
import com.aitinerary.user.UserRepository;
import com.aitinerary.auth.UserPrincipal;
import com.aitinerary.ai.ModelRouter;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TravelPlanService {

    private final TravelPlanRepository travelPlanRepository;
    private final UserRepository userRepository;
    private final ModelRouter aiProvider;
    private final ObjectMapper objectMapper;
    private final ActivityRepository activityRepository;

    // ─── Create ───────────────────────────────────────────────

    @Transactional
    public TravelPlanResponse createTravelPlan(TravelPlanRequest request, UserPrincipal currentUser) {
        log.info("Creating travel plan for user: {}, destination: {}", currentUser.getId(), request.getDestination());
        log.info("Using AI Provider: {}, Model: {}", aiProvider.getProviderName(), aiProvider.getModelName());

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new IllegalArgumentException("End date must be after start date");
        }
        if (request.getEndDate().isEqual(request.getStartDate())) {
            throw new IllegalArgumentException("End date must be different from start date");
        }

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String prompt = buildStructuredPrompt(request);
        log.info("Calling AI provider to generate travel plan...");
        String aiResponse = aiProvider.generateContent(prompt);
        log.info("AI response received, length: {} characters", aiResponse.length());

        TravelPlan travelPlan = TravelPlan.builder()
                .user(user)
                .destination(request.getDestination())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .build();

        // Parse the AI JSON and hydrate relational entities
        parseAiResponseIntoEntities(aiResponse, travelPlan);

        travelPlan = travelPlanRepository.save(travelPlan);
        log.info("Travel plan created successfully with ID: {}", travelPlan.getId());

        return mapToResponse(travelPlan);
    }

    // ─── Read ─────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<TravelPlanResponse> getUserTravelPlans(UserPrincipal currentUser, Pageable pageable) {
        log.info("Fetching travel plans for user: {}", currentUser.getId());
        return travelPlanRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId(), pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public List<TravelPlanResponse> getUserTravelPlans(UserPrincipal currentUser) {
        log.info("Fetching travel plans for user: {}", currentUser.getId());
        List<TravelPlan> plans = travelPlanRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId());
        return plans.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Cacheable(value = "travelPlans", key = "#id + '-' + #currentUser.id")
    @Transactional(readOnly = true)
    public TravelPlanResponse getTravelPlanById(Long id, UserPrincipal currentUser) {
        log.info("Fetching travel plan ID: {} for user: {}", id, currentUser.getId());
        TravelPlan travelPlan = travelPlanRepository.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Travel plan not found"));
        return mapToResponse(travelPlan);
    }

    // ─── Delete ───────────────────────────────────────────────

    @CacheEvict(value = "travelPlans", key = "#id + '-' + #currentUser.id")
    @Transactional
    public void deleteTravelPlan(Long id, UserPrincipal currentUser) {
        log.info("Deleting travel plan ID: {} for user: {}", id, currentUser.getId());
        TravelPlan travelPlan = travelPlanRepository.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Travel plan not found"));
        travelPlanRepository.delete(travelPlan);
        log.info("Travel plan deleted successfully");
    }

    // ─── Workspace Operations ─────────────────────────────────

    @CachePut(value = "travelPlans", key = "#activityId + '-' + #currentUser.id", unless = "#result == null")
    @Transactional
    public ActivityDto updateActivity(Long activityId, ActivityDto dto, UserPrincipal currentUser) {
        Activity activity = activityRepository.findById(activityId)
                .orElseThrow(() -> new RuntimeException("Activity not found"));

        // Verify ownership through the chain: Activity -> ItineraryDay -> TravelPlan -> User
        Long ownerId = activity.getItineraryDay().getTravelPlan().getUser().getId();
        if (!ownerId.equals(currentUser.getId())) {
            throw new RuntimeException("Unauthorized access to activity");
        }

        if (dto.getName() != null) activity.setName(dto.getName());
        if (dto.getDescription() != null) activity.setDescription(dto.getDescription());
        if (dto.getStartTime() != null) activity.setStartTime(dto.getStartTime());
        if (dto.getCategory() != null) activity.setCategory(dto.getCategory());
        if (dto.getEstimatedCost() != null) activity.setEstimatedCost(dto.getEstimatedCost());
        if (dto.getTips() != null) activity.setTips(dto.getTips());
        if (dto.getOrderIndex() != null) activity.setOrderIndex(dto.getOrderIndex());

        activity = activityRepository.save(activity);
        return mapActivityToDto(activity);
    }

    @Transactional
    public void reorderActivities(Long dayId, List<Long> activityIds, UserPrincipal currentUser) {
        for (int i = 0; i < activityIds.size(); i++) {
            Activity activity = activityRepository.findById(activityIds.get(i))
                    .orElseThrow(() -> new RuntimeException("Activity not found"));

            Long ownerId = activity.getItineraryDay().getTravelPlan().getUser().getId();
            if (!ownerId.equals(currentUser.getId())) {
                throw new RuntimeException("Unauthorized access to activity");
            }

            activity.setOrderIndex(i);
            activityRepository.save(activity);
        }
    }

    // ─── AI Response Parsing ──────────────────────────────────

    private void parseAiResponseIntoEntities(String aiResponse, TravelPlan travelPlan) {
        try {
            // Strip markdown fences if present
            String json = aiResponse.trim();
            if (json.startsWith("```")) {
                json = json.replaceFirst("```(?:json)?\\s*", "");
                json = json.replaceAll("\\s*```$", "");
            }

            AiPlanResponseDto parsed = objectMapper.readValue(json, AiPlanResponseDto.class);

            // Set the new AI metadata fields as serialized JSON strings
            if (parsed.getBudgetEstimate() != null) {
                travelPlan.setBudgetEstimate(objectMapper.writeValueAsString(parsed.getBudgetEstimate()));
            }
            if (parsed.getLocalPhrases() != null) {
                travelPlan.setLocalPhrases(objectMapper.writeValueAsString(parsed.getLocalPhrases()));
            }
            if (parsed.getPackingTips() != null) {
                travelPlan.setPackingTips(objectMapper.writeValueAsString(parsed.getPackingTips()));
            }
            if (parsed.getSafetyTips() != null) {
                travelPlan.setSafetyTips(objectMapper.writeValueAsString(parsed.getSafetyTips()));
            }
            if (parsed.getFoodRecommendations() != null) {
                travelPlan.setFoodRecommendations(objectMapper.writeValueAsString(parsed.getFoodRecommendations()));
            }

            if (parsed.getDays() != null) {
                List<ItineraryDay> days = new ArrayList<>();
                for (AiPlanResponseDto.AiDayDto dayDto : parsed.getDays()) {
                    ItineraryDay day = ItineraryDay.builder()
                            .travelPlan(travelPlan)
                            .dayIndex(dayDto.getDay())
                            .title(dayDto.getTitle())
                            .overview(parsed.getOverview())
                            .build();

                    if (dayDto.getActivities() != null) {
                        List<Activity> activities = new ArrayList<>();
                        int orderIndex = 0;
                        for (AiPlanResponseDto.AiActivityDto actDto : dayDto.getActivities()) {
                            Activity activity = Activity.builder()
                                    .itineraryDay(day)
                                    .startTime(parseTime(actDto.getTime()))
                                    .name(actDto.getName())
                                    .description(actDto.getDescription())
                                    .category(actDto.getCategory())
                                    .locationData(serializeLocation(actDto.getLocation()))
                                    .estimatedCost(actDto.getEstimatedCost())
                                    .tips(actDto.getTips())
                                    .orderIndex(orderIndex++)
                                    .build();
                            activities.add(activity);
                        }
                        day.setActivities(activities);
                    }
                    days.add(day);
                }
                travelPlan.setItineraryDays(days);
            }
        } catch (Exception e) {
            log.error("Failed to parse AI response into entities: {}", e.getMessage());
            // Fallback: create a single day with a note
            ItineraryDay fallback = ItineraryDay.builder()
                    .travelPlan(travelPlan)
                    .dayIndex(1)
                    .title("Your Itinerary")
                    .overview("AI generated plan (raw format)")
                    .build();

            Activity note = Activity.builder()
                    .itineraryDay(fallback)
                    .name("AI Plan")
                    .description(aiResponse.length() > 4000 ? aiResponse.substring(0, 4000) : aiResponse)
                    .category("sightseeing")
                    .orderIndex(0)
                    .build();

            fallback.setActivities(List.of(note));
            travelPlan.setItineraryDays(List.of(fallback));
        }
    }

    private LocalTime parseTime(String timeStr) {
        if (timeStr == null || timeStr.isBlank()) return null;
        try {
            // Try "09:00 AM" format
            return LocalTime.parse(timeStr, DateTimeFormatter.ofPattern("hh:mm a"));
        } catch (DateTimeParseException e) {
            try {
                // Try "09:00" (24h) format
                return LocalTime.parse(timeStr, DateTimeFormatter.ofPattern("HH:mm"));
            } catch (DateTimeParseException e2) {
                log.warn("Could not parse time: {}", timeStr);
                return null;
            }
        }
    }

    private String serializeLocation(Map<String, Object> location) {
        if (location == null) return null;
        try {
            return objectMapper.writeValueAsString(location);
        } catch (Exception e) {
            return null;
        }
    }

    // ─── Mapping ──────────────────────────────────────────────

    private TravelPlanResponse mapToResponse(TravelPlan plan) {
        List<ItineraryDayDto> dayDtos = plan.getItineraryDays().stream()
                .map(this::mapDayToDto)
                .collect(Collectors.toList());

        return TravelPlanResponse.builder()
                .id(plan.getId())
                .destination(plan.getDestination())
                .startDate(plan.getStartDate())
                .endDate(plan.getEndDate())
                .itineraryDays(dayDtos)
                .createdAt(plan.getCreatedAt())
                .budgetEstimate(plan.getBudgetEstimate())
                .localPhrases(plan.getLocalPhrases())
                .packingTips(plan.getPackingTips())
                .safetyTips(plan.getSafetyTips())
                .foodRecommendations(plan.getFoodRecommendations())
                .build();
    }

    private ItineraryDayDto mapDayToDto(ItineraryDay day) {
        List<ActivityDto> actDtos = day.getActivities().stream()
                .map(this::mapActivityToDto)
                .collect(Collectors.toList());

        return ItineraryDayDto.builder()
                .id(day.getId())
                .dayIndex(day.getDayIndex())
                .title(day.getTitle())
                .overview(day.getOverview())
                .activities(actDtos)
                .build();
    }

    private ActivityDto mapActivityToDto(Activity act) {
        return ActivityDto.builder()
                .id(act.getId())
                .startTime(act.getStartTime())
                .name(act.getName())
                .description(act.getDescription())
                .category(act.getCategory())
                .locationData(act.getLocationData())
                .estimatedCost(act.getEstimatedCost())
                .tips(act.getTips())
                .orderIndex(act.getOrderIndex())
                .build();
    }

    // ─── Prompt Builder ───────────────────────────────────────

    private String buildStructuredPrompt(TravelPlanRequest request) {
        long tripDays = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate());

        StringBuilder prompt = new StringBuilder();

        prompt.append("You are an expert travel planner. Create a comprehensive, detailed travel itinerary.\n\n");

        prompt.append("=== TRIP DETAILS ===\n");
        prompt.append("Destination: ").append(request.getDestination()).append("\n");
        prompt.append("Travel Dates: ").append(request.getStartDate())
              .append(" to ").append(request.getEndDate())
              .append(" (").append(tripDays).append(" days)\n");

        if (request.getGroupType() != null && !request.getGroupType().isEmpty()) {
            prompt.append("Traveler Type: ").append(request.getGroupType()).append("\n");
        }

        if (request.getActivities() != null && !request.getActivities().isEmpty()) {
            prompt.append("Preferred Activities: ")
                  .append(String.join(", ", request.getActivities())).append("\n");
        }

        prompt.append("\n=== RESPONSE FORMAT ===\n");
        prompt.append("You MUST respond with ONLY valid JSON (no markdown, no code fences, no extra text).\n");
        prompt.append("Use this exact JSON structure:\n\n");

        prompt.append("{\n");
        prompt.append("  \"overview\": \"A 2-3 sentence overview of the destination\",\n");
        prompt.append("  \"bestTimeToVisit\": \"Best months to visit\",\n");
        prompt.append("  \"language\": \"Primary language spoken\",\n");
        prompt.append("  \"currency\": \"Local currency with symbol\",\n");
        prompt.append("  \"weatherDuringTrip\": \"Expected weather during the travel dates\",\n");
        prompt.append("  \"budgetEstimate\": {\n");
        prompt.append("    \"budget\": \"$XX-XX/day for budget travelers\",\n");
        prompt.append("    \"mid\": \"$XX-XX/day for mid-range\",\n");
        prompt.append("    \"luxury\": \"$XX+/day for luxury\"\n");
        prompt.append("  },\n");
        prompt.append("  \"days\": [\n");
        prompt.append("    {\n");
        prompt.append("      \"day\": 1,\n");
        prompt.append("      \"title\": \"Short catchy title for this day\",\n");
        prompt.append("      \"activities\": [\n");
        prompt.append("        {\n");
        prompt.append("          \"time\": \"09:00 AM\",\n");
        prompt.append("          \"name\": \"Activity name\",\n");
        prompt.append("          \"description\": \"2-3 sentence description\",\n");
        prompt.append("          \"category\": \"one of: sightseeing, food, adventure, cultural, shopping, relaxation, nightlife, transportation\",\n");
        prompt.append("          \"estimatedCost\": \"$XX or Free\",\n");
        prompt.append("          \"duration\": \"1-2 hours\",\n");
        prompt.append("          \"location\": {\n");
        prompt.append("            \"name\": \"Place name\",\n");
        prompt.append("            \"lat\": 0.0,\n");
        prompt.append("            \"lng\": 0.0\n");
        prompt.append("          },\n");
        prompt.append("          \"tips\": \"One practical tip\",\n");
        prompt.append("          \"imageKeyword\": \"2-3 word search keyword\"\n");
        prompt.append("        }\n");
        prompt.append("      ]\n");
        prompt.append("    }\n");
        prompt.append("  ],\n");
        prompt.append("  \"packingTips\": [\"tip1\", \"tip2\", \"tip3\", \"tip4\", \"tip5\"],\n");
        prompt.append("  \"localPhrases\": [\n");
        prompt.append("    { \"phrase\": \"Local phrase\", \"meaning\": \"English meaning\", \"pronunciation\": \"How to say it\" }\n");
        prompt.append("  ],\n");
        prompt.append("  \"foodRecommendations\": [\n");
        prompt.append("    { \"name\": \"Dish name\", \"description\": \"Brief description\", \"priceRange\": \"$X-XX\" }\n");
        prompt.append("  ],\n");
        prompt.append("  \"safetyTips\": [\"tip1\", \"tip2\", \"tip3\"]\n");
        prompt.append("}\n\n");

        prompt.append("=== IMPORTANT RULES ===\n");
        prompt.append("1. Create exactly ").append(tripDays).append(" days in the 'days' array\n");
        prompt.append("2. Each day should have 3-4 activities with realistic timings. BE CONCISE to avoid output truncation.\n");
        prompt.append("3. Keep all descriptions strictly to 1-2 short sentences.\n");
        prompt.append("4. Include accurate latitude/longitude coordinates\n");
        prompt.append("5. Keep imageKeyword short (1-2 words)\n");
        prompt.append("5. Tailor activities to the traveler type: ").append(
            request.getGroupType() != null ? request.getGroupType() : "General"
        ).append("\n");
        prompt.append("6. Include a mix of popular attractions and hidden gems\n");
        prompt.append("7. Consider travel time between locations\n");
        prompt.append("8. Respond with ONLY the JSON object, no additional text\n");

        return prompt.toString();
    }
}
