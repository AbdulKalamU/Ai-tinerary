-- Enable the pgvector extension (must be run by superuser or on a pgvector-enabled image)
CREATE EXTENSION IF NOT EXISTS vector;

-- Documents table
CREATE TABLE documents (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    original_text TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT fk_document_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Document Chunks table with vector embeddings
CREATE TABLE document_chunks (
    id BIGSERIAL PRIMARY KEY,
    document_id BIGINT NOT NULL,
    chunk_index INT NOT NULL,
    content TEXT NOT NULL,
    embedding vector(768), -- Gemini text-embedding-004 produces 768-dimensional embeddings by default
    CONSTRAINT fk_chunk_document FOREIGN KEY (document_id) REFERENCES documents (id) ON DELETE CASCADE
);

-- Create HNSW index for fast vector similarity search using inner product (IP)
CREATE INDEX idx_document_chunks_embedding ON document_chunks USING hnsw (embedding vector_ip_ops);
