"""
ET AI Concierge - Phase 2
Unit Tests: RAG Pipeline
"""
import pytest
from src.rag.ingestion.content_processor import clean_text, chunk_text, process_document
from src.tools.segment_classifier import classify_segment
from src.tools.product_matcher import match_products


# ─── Content Processor ────────────────────────────────────────────────────
class TestContentProcessor:
    def test_clean_text_removes_html(self):
        dirty = "<p>Hello <b>World</b></p>"
        result = clean_text(dirty)
        assert "<" not in result
        assert "Hello" in result
        assert "World" in result

    def test_chunk_text_respects_size(self):
        text = "This is a test. " * 100  # ~1600 chars
        chunks = chunk_text(text, metadata={}, chunk_size=200)
        for chunk in chunks:
            # Allow small overshoot from overlap
            assert len(chunk.text) <= 300

    def test_chunk_text_minimum_chunk_size(self):
        text = "Short."
        chunks = chunk_text(text, metadata={}, chunk_size=500, min_chunk_size=5)
        assert len(chunks) >= 1

    def test_process_document_attaches_metadata(self):
        chunks = process_document(
            raw_content="Test article about mutual funds and investing.",
            title="Test Article",
            source_type="article",
            source_id="test-001",
            extra_metadata={"category": "education"},
        )
        assert len(chunks) >= 1
        for chunk in chunks:
            assert chunk.metadata["title"] == "Test Article"
            assert chunk.metadata["source_type"] == "article"
            assert chunk.metadata["category"] == "education"


# ─── Segment Classifier ───────────────────────────────────────────────────
class TestSegmentClassifier:
    def test_tech_professional_segment(self):
        profile = {
            "industry": "technology",
            "occupation": "software engineer",
            "investment_experience": "beginner",
            "age_group": "26-30",
        }
        result = classify_segment(profile)
        assert result["primary_segment"] == "tech_professional_investor"
        assert result["confidence"] > 0.5

    def test_experienced_trader_segment(self):
        profile = {
            "investment_experience": "advanced",
            "risk_tolerance": "aggressive",
            "portfolio_size_range": "50L+",
        }
        result = classify_segment(profile)
        assert result["primary_segment"] == "experienced_trader"
        assert result["confidence"] > 0.8

    def test_empty_profile_returns_default(self):
        result = classify_segment({})
        assert result["primary_segment"] == "learning_focused_beginner"
        assert result["confidence"] > 0.0

    def test_sub_segments_are_sorted_by_score(self):
        profile = {
            "investment_experience": "beginner",
            "age_group": "18-25",
            "interests": ["mutual_funds"],
        }
        result = classify_segment(profile)
        scores = [s["score"] for s in result["sub_segments"]]
        assert scores == sorted(scores, reverse=True)


# ─── Product Matcher ──────────────────────────────────────────────────────
class TestProductMatcher:
    def test_returns_top_n_products(self):
        profile = {"interests": ["equity", "mutual_funds"], "investment_experience": "beginner"}
        results = match_products(profile, top_n=3)
        assert len(results) <= 3

    def test_scores_are_between_0_and_1(self):
        profile = {"investment_experience": "advanced", "risk_tolerance": "aggressive"}
        results = match_products(profile, primary_segment="experienced_trader")
        for r in results:
            assert 0.0 <= r["score"] <= 1.0

    def test_results_are_sorted_descending(self):
        profile = {"investment_experience": "intermediate", "interests": ["equity"]}
        results = match_products(profile)
        scores = [r["score"] for r in results]
        assert scores == sorted(scores, reverse=True)

    def test_segment_aligned_product_scores_higher(self):
        profile = {}
        results_with_seg = match_products(profile, primary_segment="learning_focused_beginner")
        results_no_seg = match_products(profile, primary_segment=None)
        # With segment, at least some product should score higher
        max_with = max(r["score"] for r in results_with_seg) if results_with_seg else 0
        max_without = max(r["score"] for r in results_no_seg) if results_no_seg else 0
        assert max_with >= max_without
