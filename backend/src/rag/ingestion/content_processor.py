"""
ET AI Concierge - Phase 2
RAG Content Processor: cleans and chunks text documents.
"""
import re
import hashlib
from typing import List, Dict, Optional


class DocumentChunk:
    """Represents a chunked piece of text with metadata."""
    
    def __init__(self, text: str, metadata: dict, doc_id: Optional[str] = None):
        self.text = text
        self.metadata = metadata
        self.chunk_id = doc_id or hashlib.sha256(text[:100].encode()).hexdigest()[:16]

    def to_dict(self) -> dict:
        return {"text": self.text, "metadata": self.metadata, "chunk_id": self.chunk_id}


def clean_text(text: str) -> str:
    """Remove HTML tags, normalize whitespace."""
    text = re.sub(r'<[^>]+>', ' ', text)           # Remove HTML tags
    text = re.sub(r'\s+', ' ', text)               # Normalize whitespace
    text = re.sub(r'\n{3,}', '\n\n', text)         # Collapse extra newlines
    text = text.strip()
    return text


def chunk_text(
    text: str,
    metadata: dict,
    chunk_size: int = 500,
    chunk_overlap: int = 50,
    min_chunk_size: int = 50,
) -> List[DocumentChunk]:
    """
    Split text into overlapping chunks using recursive character splitting.
    Preserves paragraph and sentence boundaries where possible.
    """
    separators = ["\n\n", "\n", ". ", " "]
    
    def _split(text: str, sep_idx: int) -> List[str]:
        if len(text) <= chunk_size or sep_idx >= len(separators):
            return [text]
        
        sep = separators[sep_idx]
        parts = text.split(sep)
        chunks = []
        current = ""
        
        for part in parts:
            if not part.strip():
                continue
            candidate = current + (sep if current else "") + part
            if len(candidate) <= chunk_size:
                current = candidate
            else:
                if current and len(current) >= min_chunk_size:
                    chunks.append(current)
                if len(part) > chunk_size:
                    sub_chunks = _split(part, sep_idx + 1)
                    chunks.extend(sub_chunks[:-1])
                    current = sub_chunks[-1] if sub_chunks else part
                else:
                    current = part
        
        if current and len(current) >= min_chunk_size:
            chunks.append(current)
        return chunks

    raw_chunks = _split(text, 0)
    
    # Apply overlap
    result_chunks = []
    for i, chunk in enumerate(raw_chunks):
        if i > 0 and chunk_overlap > 0:
            prev_text = raw_chunks[i - 1]
            overlap_text = prev_text[-chunk_overlap:]
            chunk = overlap_text + " " + chunk
        result_chunks.append(DocumentChunk(text=chunk.strip(), metadata=metadata))

    return result_chunks


def process_document(
    raw_content: str,
    title: str,
    source_type: str,
    source_id: str,
    extra_metadata: Optional[dict] = None,
) -> List[DocumentChunk]:
    """
    Full pipeline: clean → chunk → attach metadata.
    
    Args:
        raw_content: Raw text or HTML content
        title: Document title
        source_type: 'article', 'faq', 'product', 'manual'
        source_id: Unique identifier from source system
        extra_metadata: Additional metadata fields
    
    Returns:
        List of DocumentChunk objects ready for embedding + storage
    """
    cleaned = clean_text(raw_content)
    metadata = {
        "title": title,
        "source_type": source_type,
        "source_id": source_id,
        **(extra_metadata or {}),
    }
    return chunk_text(cleaned, metadata)
