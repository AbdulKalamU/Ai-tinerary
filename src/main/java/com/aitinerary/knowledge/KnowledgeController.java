package com.aitinerary.knowledge;

import com.aitinerary.auth.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/documents")
@RequiredArgsConstructor
public class KnowledgeController {

    private final DocumentIngestionService ingestionService;
    private final DocumentRepository documentRepository;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
        }

        Document document = ingestionService.ingestDocument(file, currentUser.getId());
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", document.getId());
        response.put("filename", document.getFilename());
        response.put("chunksGenerated", document.getChunks().size());
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> listDocuments(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        List<Document> documents = documentRepository.findByUserIdOrderByCreatedAtDesc(currentUser.getId());
        
        List<Map<String, Object>> docsList = documents.stream().map(doc -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", doc.getId());
            map.put("filename", doc.getFilename());
            map.put("fileType", doc.getFileType());
            map.put("createdAt", doc.getCreatedAt());
            return map;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(Map.of("documents", docsList, "total", docsList.size()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {
        
        Document doc = documentRepository.findByIdAndUserId(id, currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Document not found"));
                
        documentRepository.delete(doc);
        return ResponseEntity.noContent().build();
    }
}
