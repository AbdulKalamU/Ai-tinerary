package com.aitinerary.trip;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItineraryDayDto {
    private Long id;
    private Integer dayIndex;
    private String title;
    private String overview;
    @Builder.Default
    private List<ActivityDto> activities = new ArrayList<>();
}
