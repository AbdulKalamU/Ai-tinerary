package com.aitinerary.user;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserPreferencesRepository userPreferencesRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return mapToProfileResponse(user);
    }

    @Transactional
    public UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getDisplayName() != null) {
            user.setDisplayName(request.getDisplayName());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio());
        }
        if (request.getHomeCity() != null) {
            user.setHomeCity(request.getHomeCity());
        }

        return mapToProfileResponse(userRepository.save(user));
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new RuntimeException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

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
        existingPrefs.setTravelInterests(preferences.getTravelInterests());

        return userPreferencesRepository.save(existingPrefs);
    }

    @Transactional(readOnly = true)
    public UserPreferences getPreferences(Long userId) {
        return userPreferencesRepository.findByUserId(userId)
                .orElse(UserPreferences.builder().build());
    }

    private UserProfileResponse mapToProfileResponse(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .displayName(user.getDisplayName())
                .bio(user.getBio())
                .homeCity(user.getHomeCity())
                .emailVerified(user.getEmailVerified() != null ? user.getEmailVerified() : false)
                .createdAt(user.getCreatedAt())
                .totalTrips(user.getTravelPlans() != null ? user.getTravelPlans().size() : 0)
                .build();
    }
}
