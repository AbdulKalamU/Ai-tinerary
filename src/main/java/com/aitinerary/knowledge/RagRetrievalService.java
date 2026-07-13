package com.aitinerary.knowledge;

import com.aitinerary.ai.EmbeddingProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class RagRetrievalService {

    private final DocumentChunkRepository chunkRepository;
    private final EmbeddingProvider embeddingProvider;

    @Transactional(readOnly = true)
    public List<DocumentChunk> retrieveRelevantContext(String query, Long userId, int maxResults) {
        log.info("Retrieving RAG context for user: {}, query: '{}'", userId, query);
        
        // Convert the search query into a vector
        float[] queryVector = embeddingProvider.generateEmbedding(query);
        
        // Search PGVector for the most similar chunks (inner product distance <#>)
        List<DocumentChunk> results = chunkRepository.findSimilarChunks(userId, queryVector, maxResults);
        
        log.info("Found {} relevant document chunks", results.size());
        return results;
    }
    
    /**
     * Helper to format retrieved chunks into a single string to inject into an LLM prompt.
     */
    public String formatContextForPrompt(List<DocumentChunk> chunks) {
        if (chunks == null || chunks.isEmpty()) {
            return "";
        }
        
        StringBuilder sb = new StringBuilder();
        sb.append("=== USER PROVIDED DOCUMENTS (USE AS FACTUAL CONTEXT) ===\n");
        
        for (DocumentChunk chunk : chunks) {
            sb.append("Document: ").append(chunk.getDocument().getFilename()).append("\n");
            sb.append(chunk.getContent()).append("\n\n");
        }
        
        return sb.toString();
    }
}
