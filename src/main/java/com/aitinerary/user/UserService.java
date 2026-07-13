package com.aitinerary.user;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserPreferencesRepository userPreferencesRepository;

    @Transactional
    public UserPreferences updatePreferences(Long userId, UserPreferences preferences) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        UserPreferences existingPrefs = userPreferencesRepository.findByUserId(userId)
                .orElse(UserPreferences.builder().user(user).build());

        existingPrefs.setBudgetLevel(preferences.getBudgetLevel());
        existingPrefs.setTravelPace(preferences.getTravelPace());
        existingPrefs.setDietaryRestrictions(preferences.getDietaryRestrictions());
        existingPrefs.setAccessibilityNeeds(preferences.getAccessibilityNeeds());

        return userPreferencesRepository.save(existingPrefs);
    }

    @Transactional(readOnly = true)
    public UserPreferences getPreferences(Long userId) {
        return userPreferencesRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Preferences not found for user"));
    }
}
