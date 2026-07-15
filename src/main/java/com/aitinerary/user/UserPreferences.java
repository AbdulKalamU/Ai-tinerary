package com.aitinerary.user;

import com.aitinerary.common.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "user_preferences")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPreferences extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "budget_level")
    private String budgetLevel;

    @Column(name = "travel_pace")
    private String travelPace;

    @Column(name = "dietary_restrictions", columnDefinition = "TEXT")
    private String dietaryRestrictions;

    @Column(name = "accessibility_needs", columnDefinition = "TEXT")
    private String accessibilityNeeds;

    @Column(name = "travel_interests", columnDefinition = "TEXT")
    private String travelInterests;
}
