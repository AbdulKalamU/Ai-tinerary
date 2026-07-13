package com.aitinerary.knowledge;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentChunkRepository extends JpaRepository<DocumentChunk, Long> {

    @Query(value = """
            SELECT dc.* FROM document_chunks dc
            JOIN documents d ON dc.document_id = d.id
            WHERE d.user_id = :userId
            ORDER BY dc.embedding <#> cast(:embedding as vector)
            LIMIT :maxResults
            """, nativeQuery = true)
    List<DocumentChunk> findSimilarChunks(
            @Param("userId") Long userId,
            @Param("embedding") float[] embedding,
            @Param("maxResults") int maxResults
    );
}
