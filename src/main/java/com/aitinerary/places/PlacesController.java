package com.aitinerary.places;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/v1/places")
public class PlacesController {

    @Autowired
    private PlacesService placesService;

    @GetMapping("/photo")
    public ResponseEntity<Map<String, String>> getPhoto(@RequestParam String query) {
        String photoUrl = placesService.getPhotoUrl(query);
        if (photoUrl == null) {
            return ResponseEntity.notFound().build();
        }
        Map<String, String> response = new HashMap<>();
        response.put("url", photoUrl);
        return ResponseEntity.ok(response);
    }
}
