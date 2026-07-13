package com.aitinerary.knowledge;

import com.aitinerary.ai.EmbeddingProvider;
import com.aitinerary.user.User;
import com.aitinerary.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentIngestionService {

    private final DocumentRepository documentRepository;
    private final UserRepository userRepository;
    private final EmbeddingProvider embeddingProvider;

    private static final int CHUNK_SIZE = 1000;
    private static final int CHUNK_OVERLAP = 200;

    @Transactional
    public Document ingestDocument(MultipartFile file, Long userId) {
        log.info("Ingesting document: {} for user: {}", file.getOriginalFilename(), userId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String extractedText = extractText(file);
        
        if (extractedText == null || extractedText.isBlank()) {
            throw new RuntimeException("Could not extract text from document");
        }

        Document document = Document.builder()
                .user(user)
                .filename(file.getOriginalFilename())
                .fileType(file.getContentType())
                .originalText(extractedText)
                .build();

        List<String> textChunks = chunkText(extractedText);
        log.info("Split document into {} chunks", textChunks.size());

        List<DocumentChunk> chunks = new ArrayList<>();
        for (int i = 0; i < textChunks.size(); i++) {
            String chunkContent = textChunks.get(i);
            // Call Gemini API to get the vector embedding for this chunk
            float[] embedding = embeddingProvider.generateEmbedding(chunkContent);

            DocumentChunk chunk = DocumentChunk.builder()
                    .document(document)
                    .chunkIndex(i)
                    .content(chunkContent)
                    .embedding(embedding)
                    .build();
            chunks.add(chunk);
        }

        document.setChunks(chunks);
        return documentRepository.save(document);
    }

    private String extractText(MultipartFile file) {
        try {
            if (file.getContentType() != null && file.getContentType().contains("pdf")) {
                try (PDDocument doc = PDDocument.load(file.getInputStream())) {
                    PDFTextStripper stripper = new PDFTextStripper();
                    return stripper.getText(doc);
                }
            } else {
                // Assume text file
                return new String(file.getBytes());
            }
        } catch (IOException e) {
            log.error("Failed to extract text from file", e);
            throw new RuntimeException("Failed to read file content", e);
        }
    }

    private List<String> chunkText(String text) {
        List<String> chunks = new ArrayList<>();
        int length = text.length();
        int start = 0;

        while (start < length) {
            int end = Math.min(start + CHUNK_SIZE, length);
            
            // Try to break at a newline or space if not at the end
            if (end < length) {
                int lastNewline = text.lastIndexOf('\n', end);
                int lastSpace = text.lastIndexOf(' ', end);
                
                if (lastNewline > start + (CHUNK_SIZE / 2)) {
                    end = lastNewline;
                } else if (lastSpace > start + (CHUNK_SIZE / 2)) {
                    end = lastSpace;
                }
            }
            
            chunks.add(text.substring(start, end).trim());
            start = end - CHUNK_OVERLAP; // Overlap for context continuity
        }

        return chunks;
    }
}
