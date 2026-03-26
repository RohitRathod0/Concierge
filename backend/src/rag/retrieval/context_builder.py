"""
ET AI Concierge - Phase 2
RAG Context Builder: formats retrieved documents into LLM-ready context.
"""
import logging
from typing import List, Optional

logger = logging.getLogger(__name__)

MAX_CONTEXT_CHARS = 6000  # ~2000 tokens at average 3 chars/token


def build_context(
    documents: List[dict],
    query: str,
    max_chars: int = MAX_CONTEXT_CHARS,
    include_citations: bool = True,
) -> str:
    """
    Build a formatted context string from retrieved documents.

    Args:
        documents: Retrieved doc dicts with 'text', 'metadata', 'score'
        query: Original user query
        max_chars: Max context string length in characters
        include_citations: Whether to include source references

    Returns:
        Formatted context string ready for LLM prompt injection.
    """
    if not documents:
        return ""

    context_parts = []
    total_chars = 0

    for i, doc in enumerate(documents, start=1):
        text = doc.get("text", "").strip()
        metadata = doc.get("metadata", {})
        score = doc.get("score", 0.0)

        if not text:
            continue

        title = metadata.get("title", f"ET Content {i}")
        source_type = metadata.get("source_type", "content")

        # Build this document's entry
        if include_citations:
            entry = f"[Source {i}: {title}]\n{text}"
        else:
            entry = text

        if total_chars + len(entry) > max_chars:
            # Truncate to fit
            remaining = max_chars - total_chars
            if remaining > 100:
                context_parts.append(entry[:remaining] + "...")
            break

        context_parts.append(entry)
        total_chars += len(entry)

    if not context_parts:
        return ""

    context = "\n\n---\n\n".join(context_parts)
    return f"### Relevant Information from ET Knowledge Base\n\n{context}\n\n### End of Retrieved Context"


def build_prompt_with_context(
    query: str,
    documents: List[dict],
    profile_summary: str = "",
    max_context_chars: int = MAX_CONTEXT_CHARS,
) -> str:
    """
    Convenience function: build a fully formatted RAG prompt.
    """
    context = build_context(documents, query, max_chars=max_context_chars)

    if not context:
        return query

    prompt = f"{context}\n\n"
    if profile_summary:
        prompt += f"User Profile: {profile_summary}\n\n"
    prompt += f"Question: {query}\n\nAnswer based on the above context. Cite sources inline with [Source N: title]."

    return prompt
