package com.aitinerary.ai;

/**
 * Interface for generating vector embeddings from text for RAG.
 */
public interface EmbeddingProvider {
    
    /**
     * Converts a string of text into a vector embedding array.
     * 
     * @param text The text to embed
     * @return float array representing the vector embedding
     * @throws RuntimeException if the embedding generation fails
     */
    float[] generateEmbedding(String text);
    
    /**
     * Get the dimensions of the generated embeddings.
     * 
     * @return number of dimensions (e.g., 768)
     */
    int getDimensions();
}
