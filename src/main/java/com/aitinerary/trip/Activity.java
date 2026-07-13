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

import java.time.LocalTime;

@Entity
@Table(name = "activities")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class Activity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "itinerary_day_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    private ItineraryDay itineraryDay;

    @Column(name = "start_time")
    private LocalTime startTime;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "category", length = 50)
    private String category;

    @Column(name = "location_data", columnDefinition = "TEXT")
    private String locationData;

    @Column(name = "estimated_cost", length = 50)
    private String estimatedCost;

    @Column(name = "tips", columnDefinition = "TEXT")
    private String tips;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;
}
