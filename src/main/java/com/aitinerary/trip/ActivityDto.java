package com.aitinerary.trip;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActivityDto {
    private Long id;
    private LocalTime startTime;
    private String name;
    private String description;
    private String category;
    private String locationData;
    private String estimatedCost;
    private String tips;
    private Integer orderIndex;
}
