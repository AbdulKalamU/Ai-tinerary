package com.aitinerary.ai;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VisionRequest {

    @NotBlank(message = "Image data is required")
    private String base64Image;

    @NotBlank(message = "MIME type is required")
    private String mimeType;
    
    // Optional destination context (e.g., "Paris, France")
    private String destinationContext;
}
