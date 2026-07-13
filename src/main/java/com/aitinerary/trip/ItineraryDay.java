package com.aitinerary.trip;

import com.aitinerary.common.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import lombok.EqualsAndHashCode;
import com.fasterxml.jackson.annotation.JsonIgnore;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "itinerary_days")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ItineraryDay extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "travel_plan_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    private TravelPlan travelPlan;

    @Column(name = "day_index", nullable = false)
    private Integer dayIndex;

    @Column(name = "title")
    private String title;

    @Column(name = "overview", columnDefinition = "TEXT")
    private String overview;

    @OneToMany(mappedBy = "itineraryDay", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @OrderBy("orderIndex ASC")
    private List<Activity> activities = new ArrayList<>();
}
