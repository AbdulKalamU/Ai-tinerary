package com.aitinerary.trip;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import com.aitinerary.user.User;
import com.aitinerary.common.BaseEntity;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "travel_plans")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class TravelPlan extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 100)
    private String destination;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @OneToMany(mappedBy = "travelPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @OrderBy("dayIndex ASC")
    private List<ItineraryDay> itineraryDays = new ArrayList<>();

    @Column(columnDefinition = "TEXT")
    private String budgetEstimate;

    @Column(columnDefinition = "TEXT")
    private String localPhrases;

    @Column(columnDefinition = "TEXT")
    private String packingTips;

    @Column(columnDefinition = "TEXT")
    private String safetyTips;

    @Column(columnDefinition = "TEXT")
    private String foodRecommendations;
}
