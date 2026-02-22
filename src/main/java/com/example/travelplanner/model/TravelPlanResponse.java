package com.example.travelplanner.model;

public class TravelPlanResponse {
    private String itinerary;

    public TravelPlanResponse(String itinerary) {
        this.itinerary = itinerary;
    }

    public String getItinerary() { return itinerary; }
    public void setItinerary(String itinerary) { this.itinerary = itinerary; }
}
