package com.aitinerary.discovery;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrendingDestination {
    private String id;
    private String name;
    private String location;
    private String description;
    private List<String> tags;
    private String category;
    private Integer days;
    private String imageQuery; // The query passed to the Google Places API (e.g. "Kyoto Japan")
}
