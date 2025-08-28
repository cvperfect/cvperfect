"""
Moduł obliczania ATS Score
Deterministyczny, offline scoring bez AI
"""

import re
import json
from pathlib import Path
from typing import Dict, List, Optional
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)

@dataclass
class ATSScoreResult:
    """Wynik analizy ATS."""
    total_score: int  # 0-100
    subscores: Dict[str, int]
    details: Dict[str, List[str]]
    recommendations: List[str]


def calculate_ats_score(sections, job_text: Optional[str] = None) -> ATSScoreResult:
    """
    Oblicza deterministyczny ATS score.
    
    Wagi:
    - Struktura (20%): sekcje, kolejność, formatowanie
    - Czytelność (15%): długość bulletów, formatowanie
    - Słowa kluczowe (30%): pokrycie technologii i kompetencji
    - Język (20%): action verbs, brak stop phrases
    - Spójność (15%): daty, kontakt, metadata
    """
    subscores = {}
    details = {}
    recommendations = []
    
    # 1. Struktura (20 pkt)
    structure_score, structure_details = _score_structure(sections)
    subscores['structure'] = structure_score
    details['structure'] = structure_details
    
    # 2. Czytelność (15 pkt)
    readability_score, readability_details = _score_readability(sections)
    subscores['readability'] = readability_score
    details['readability'] = readability_details
    
    # 3. Słowa kluczowe (30 pkt)
    keywords_score, keywords_details = _score_keywords(sections, job_text)
    subscores['keywords'] = keywords_score
    details['keywords'] = keywords_details
    
    # 4. Język (20 pkt)
    language_score, language_details = _score_language(sections)
    subscores['language'] = language_score
    details['language'] = language_details
    
    # 5. Spójność (15 pkt)
    consistency_score, consistency_details = _score_consistency(sections)
    subscores['consistency'] = consistency_score
    details['consistency'] = consistency_details
    
    # Oblicz total z wagami
    weights = {
        'structure': 0.20,
        'readability': 0.15,
        'keywords': 0.30,
        'language': 0.20,
        'consistency': 0.15
    }
    
    total_score = sum(subscores[key] * weights[key] for key in weights)
    total_score = round(total_score)
    
    # Generuj rekomendacje
    if structure_score < 70:
        recommendations.append("Uporządkuj sekcje CV w standardowej kolejności")
    if readability_score < 70:
        recommendations.append("Skróć opisy do 2-3 linii, używaj krótkich bulletów")
    if keywords_score < 70:
        recommendations.append("Dodaj więcej słów kluczowych związanych ze stanowiskiem")
    if language_score < 70:
        recommendations.append("Użyj czasowników akcji, unikaj fraz biernych")
    if consistency_score < 70:
        recommendations.append("Ujednolić format dat i sprawdź dane kontaktowe")
    
    return ATSScoreResult(
        total_score=total_score,
        subscores=subscores,
        details=details,
        recommendations=recommendations
    )


def _score_structure(sections) -> tuple:
    """Ocenia strukturę CV."""
    score = 100
    details = []
    
    # Sprawdź obecność kluczowych sekcji
    required_sections = ['contact', 'experience', 'education', 'skills']
    for section in required_sections:
        if section not in sections.raw_sections or not getattr(sections, section, None):
            score -= 10
            details.append(f"Brak sekcji: {section}")
    
    # Sprawdź kolejność
    ideal_order = ['contact', 'summary', 'experience', 'skills', 'education']
    section_keys = list(sections.raw_sections.keys())
    
    # Penalizuj za złą kolejność
    for i, ideal_section in enumerate(ideal_order):
        if ideal_section in section_keys:
            actual_position = section_keys.index(ideal_section)
            if abs(actual_position - i) > 2:
                score -= 5
                details.append(f"Zła pozycja sekcji: {ideal_section}")
    
    # Bonus za summary
    if sections.summary:
        score = min(100, score + 5)
        details.append("+ Posiada podsumowanie zawodowe")
    
    return max(0, score), details


def _score_readability(sections) -> tuple:
    """Ocenia czytelność CV."""
    score = 100
    details = []
    
    # Sprawdź długość bulletów w experience
    for exp in sections.experience:
        for bullet in exp.bullets:
            word_count = len(bullet.split())
            if word_count > 25:
                score -= 2
                details.append(f"Za długi bullet ({word_count} słów)")
            elif word_count < 3:
                score -= 1
                details.append(f"Za krótki bullet ({word_count} słów)")
    
    # Sprawdź liczbę bulletów per role
    for exp in sections.experience:
        bullet_count = len(exp.bullets)
        if bullet_count > 7:
            score -= 5
            details.append(f"Za dużo bulletów w {exp.role} ({bullet_count})")
        elif bullet_count == 0:
            score -= 10
            details.append(f"Brak opisów dla {exp.role}")
    
    # Bonus za czytelne formatowanie dat
    date_pattern = r'\d{4}-\d{2}'
    for exp in sections.experience:
        if exp.date_start and re.match(date_pattern, exp.date_start):
            score = min(100, score + 1)
    
    return max(0, score), details


def _score_keywords(sections, job_text: Optional[str]) -> tuple:
    """Ocenia pokrycie słów kluczowych."""
    score = 50  # Bazowy score
    details = []
    
    # Załaduj słownik umiejętności
    try:
        lexicon_path = Path(__file__).parent / 'lexicon' / 'skills.json'
        with open(lexicon_path, 'r', encoding='utf-8') as f:
            skills_dict = json.load(f)
            known_skills = set(skill.lower() for skill in skills_dict['technical_skills'])
    except:
        known_skills = set()
    
    # Sprawdź pokrycie znanych umiejętności
    cv_skills = set(skill.lower() for skill in sections.skills)
    matched_skills = cv_skills & known_skills
    
    if matched_skills:
        score += min(30, len(matched_skills) * 3)
        details.append(f"+ Znalezione umiejętności techniczne: {len(matched_skills)}")
    
    # Jeśli podano ofertę, sprawdź dopasowanie
    if job_text:
        job_words = set(job_text.lower().split())
        cv_text = ' '.join(sections.skills + [exp.role for exp in sections.experience])
        cv_words = set(cv_text.lower().split())
        
        overlap = len(job_words & cv_words)
        match_ratio = overlap / max(len(job_words), 1) * 100
        
        score += min(20, int(match_ratio / 5))
        details.append(f"Dopasowanie do oferty: {int(match_ratio)}%")
    
    return min(100, score), details


def _score_language(sections) -> tuple:
    """Ocenia język CV."""
    score = 100
    details = []
    
    # Załaduj słownik czasowników
    try:
        lexicon_path = Path(__file__).parent / 'lexicon' / 'verbs.pl.json'
        with open(lexicon_path, 'r', encoding='utf-8') as f:
            verbs_dict = json.load(f)
            action_verbs = set(verb.lower() for verb in verbs_dict['action_verbs'])
            stop_phrases = set(phrase.lower() for phrase in verbs_dict['stop_phrases'])
    except:
        action_verbs = set()
        stop_phrases = set()
    
    # Sprawdź użycie action verbs
    action_count = 0
    stop_count = 0
    
    for exp in sections.experience:
        for bullet in exp.bullets:
            bullet_lower = bullet.lower()
            
            # Sprawdź action verbs
            for verb in action_verbs:
                if bullet_lower.startswith(verb.lower()):
                    action_count += 1
                    break
            
            # Sprawdź stop phrases
            for phrase in stop_phrases:
                if phrase in bullet_lower:
                    stop_count += 1
                    score -= 3
                    details.append(f"- Stop phrase: '{phrase}'")
                    break
    
    # Bonus za action verbs
    if action_count > 0:
        score = min(100, score + action_count * 2)
        details.append(f"+ Action verbs: {action_count}")
    
    return max(0, score), details


def _score_consistency(sections) -> tuple:
    """Ocenia spójność CV."""
    score = 100
    details = []
    
    # Sprawdź obecność kontaktu
    if not sections.contact.get('email'):
        score -= 20
        details.append("- Brak adresu email")
    
    if not sections.contact.get('phone'):
        score -= 10
        details.append("- Brak numeru telefonu")
    
    # Sprawdź format dat
    date_pattern = r'\d{4}(?:-\d{2})?'
    inconsistent_dates = False
    
    for exp in sections.experience:
        if exp.date_start and not re.match(date_pattern, str(exp.date_start)):
            inconsistent_dates = True
        if exp.date_end and exp.date_end != 'obecnie' and not re.match(date_pattern, str(exp.date_end)):
            inconsistent_dates = True
    
    if inconsistent_dates:
        score -= 15
        details.append("- Niespójny format dat")
    
    # Sprawdź długość CV (nie za długie)
    total_bullets = sum(len(exp.bullets) for exp in sections.experience)
    if total_bullets > 30:
        score -= 10
        details.append(f"- CV za długie ({total_bullets} bulletów)")
    
    return max(0, score), details