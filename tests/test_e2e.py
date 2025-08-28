"""
Test end-to-end dla CVPerfect Python
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

import tempfile
import shutil
from pathlib import Path
import json

from cvperfect_py.io_load import load_cv
from cvperfect_py.normalize import normalize_text
from cvperfect_py.extract import extract_sections
from cvperfect_py.ats_score import calculate_ats_score


def test_full_pipeline():
    """Test kompletnego pipeline CV → HTML."""
    
    # Load sample CV
    fixture_path = Path(__file__).parent / "fixtures" / "sample_cv.txt"
    cv_content, cv_format = load_cv(str(fixture_path))
    
    assert cv_format == "txt"
    assert len(cv_content) > 100
    assert "Anna Kowalska" in cv_content
    
    # Normalize
    normalized = normalize_text(cv_content)
    assert len(normalized) <= len(cv_content)  # Should be equal or smaller
    
    # Extract sections
    sections = extract_sections(normalized)
    
    # Test contact extraction
    assert sections.contact['name'] == "Anna Kowalska"
    assert sections.contact['email'] == "anna.kowalska@gmail.com"
    assert sections.contact['phone'] == "+48 555 123 456"
    
    # Test experience extraction
    assert len(sections.experience) >= 3
    
    # Check first experience
    first_exp = sections.experience[0]
    assert "Marketing Manager" in first_exp.role
    assert "Digital Agency" in first_exp.company
    assert len(first_exp.bullets) >= 3
    
    # Test skills extraction
    assert len(sections.skills) >= 5
    assert "Google Ads" in sections.skills
    assert "Facebook Ads" in sections.skills
    
    # Test education extraction
    assert len(sections.education) >= 1
    assert "Magister" in sections.education[0].degree
    
    # Calculate ATS Score
    ats_result = calculate_ats_score(sections)
    assert 0 <= ats_result.total_score <= 100
    assert len(ats_result.subscores) == 5
    
    print(f"[OK] ATS Score: {ats_result.total_score}/100")
    print(f"   - Structure: {ats_result.subscores['structure']}")
    print(f"   - Readability: {ats_result.subscores['readability']}")
    print(f"   - Keywords: {ats_result.subscores['keywords']}")
    print(f"   - Language: {ats_result.subscores['language']}")
    print(f"   - Consistency: {ats_result.subscores['consistency']}")


def test_deterministic_output():
    """Test deterministyczności - ten sam input = ten sam output."""
    
    fixture_path = Path(__file__).parent / "fixtures" / "sample_cv.txt"
    
    # Run pipeline twice
    results1 = []
    results2 = []
    
    for results in [results1, results2]:
        cv_content, _ = load_cv(str(fixture_path))
        normalized = normalize_text(cv_content)
        sections = extract_sections(normalized)
        ats_result = calculate_ats_score(sections)
        
        results.append({
            'normalized_length': len(normalized),
            'sections_count': len(sections.raw_sections),
            'experience_count': len(sections.experience),
            'skills_count': len(sections.skills),
            'ats_score': ats_result.total_score,
            'subscores': ats_result.subscores
        })
    
    # Compare results
    assert results1[0]['normalized_length'] == results2[0]['normalized_length']
    assert results1[0]['sections_count'] == results2[0]['sections_count']
    assert results1[0]['experience_count'] == results2[0]['experience_count']
    assert results1[0]['skills_count'] == results2[0]['skills_count']
    assert results1[0]['ats_score'] == results2[0]['ats_score']
    assert results1[0]['subscores'] == results2[0]['subscores']
    
    print("[OK] Deterministycznosc potwierdzona - identyczne wyniki")


def test_no_hallucination():
    """Test że nie dodajemy nowych faktów."""
    
    fixture_path = Path(__file__).parent / "fixtures" / "sample_cv.txt"
    cv_content, _ = load_cv(str(fixture_path))
    normalized = normalize_text(cv_content)
    sections = extract_sections(normalized)
    
    # Check that we only extracted what was in the original
    original_lower = cv_content.lower()
    
    # Name should match
    assert sections.contact['name'] in cv_content
    
    # Companies should exist in original
    for exp in sections.experience:
        if exp.company:
            assert any(word in original_lower for word in exp.company.lower().split())
    
    # Skills should be from original (allowing for normalization)
    for skill in sections.skills:
        # Skill or part of skill should exist in original
        skill_words = skill.lower().split()
        assert any(any(word in original_lower for word in skill_words) for word in skill_words)
    
    print("[OK] No-hallucination check passed - tylko oryginalne dane")


def test_ats_score_ranges():
    """Test że ATS Score jest w poprawnych zakresach."""
    
    fixture_path = Path(__file__).parent / "fixtures" / "sample_cv.txt"
    cv_content, _ = load_cv(str(fixture_path))
    normalized = normalize_text(cv_content)
    sections = extract_sections(normalized)
    ats_result = calculate_ats_score(sections)
    
    # Total score 0-100
    assert 0 <= ats_result.total_score <= 100
    
    # All subscores 0-100
    for category, score in ats_result.subscores.items():
        assert 0 <= score <= 100, f"Category {category} score {score} out of range"
    
    # Should have all categories
    expected_categories = ['structure', 'readability', 'keywords', 'language', 'consistency']
    for category in expected_categories:
        assert category in ats_result.subscores
    
    print(f"[OK] ATS Score validation passed - wszystkie kategorie w zakresie 0-100")


if __name__ == "__main__":
    print("CVPerfect Python - Test Suite")
    print("=" * 50)
    
    test_full_pipeline()
    print()
    
    test_deterministic_output()
    print()
    
    test_no_hallucination()
    print()
    
    test_ats_score_ranges()
    print()
    
    print("Wszystkie testy przeszly pomyslnie!")