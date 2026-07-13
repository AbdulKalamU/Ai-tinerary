package com.aitinerary.ai;

public interface MultimodalAiService {
    /**
     * Analyzes an image with an accompanying text prompt using a Vision-capable LLM.
     *
     * @param base64Image The Base64 encoded image string.
     * @param mimeType    The MIME type of the image (e.g., "image/jpeg").
     * @param prompt      The instruction prompt for the AI.
     * @return The AI's generated response string (often JSON).
     */
    String analyzeImage(String base64Image, String mimeType, String prompt);
}
