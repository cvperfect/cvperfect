"""
Moduł ekstrakcji słów kluczowych i dopasowania
Deterministyczny, bez halucynacji
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Set, Tuple
import logging

try:
    from rapidfuzz import fuzz
    RAPIDFUZZ_AVAILABLE = True
except ImportError:
    RAPIDFUZZ_AVAILABLE = False

logger = logging.getLogger(__name__)


def extract_keywords(text: str, language: str = "pl") -> Dict[str, List[str]]:
    """
    Ekstraktuje słowa kluczowe z tekstu CV.
    
    Returns:
        Dict z kategoriami: technical_skills, soft_skills, languages, certifications
    """
    keywords = {
        'technical_skills': [],
        'soft_skills': [],
        'languages': [],
        'certifications': []
    }
    
    # Load skills dictionary
    try:
        skills_dict = _load_skills_dict()
    except Exception as e:
        logger.warning(f"Cannot load skills dictionary: {e}")
        return keywords
    
    text_lower = text.lower()
    
    # Extract technical skills
    for skill in skills_dict.get('technical_skills', []):
        if _is_skill_present(skill, text_lower):
            keywords['technical_skills'].append(skill)
    
    # Extract soft skills
    for skill in skills_dict.get('soft_skills', []):
        if _is_skill_present(skill, text_lower):
            keywords['soft_skills'].append(skill)
    
    # Extract languages
    lang_dict = skills_dict.get('languages', {}).get(language, {})
    for lang, levels in lang_dict.items():
        if _is_skill_present(lang, text_lower):
            # Try to find level
            found_level = None
            for level in levels:
                if level.lower() in text_lower:
                    found_level = level
                    break
            
            lang_entry = lang if not found_level else f"{lang} ({found_level})"
            keywords['languages'].append(lang_entry)
    
    # Extract certifications
    for cert in skills_dict.get('certifications', []):
        if _is_skill_present(cert, text_lower):
            keywords['certifications'].append(cert)
    
    # Remove duplicates and sort
    for category in keywords:
        keywords[category] = sorted(list(set(keywords[category])))
    
    return keywords


def calculate_keyword_match(cv_keywords: Dict[str, List[str]], 
                          job_text: str,
                          language: str = "pl") -> Dict[str, float]:
    """
    Oblicza dopasowanie słów kluczowych między CV a ofertą pracy.
    
    Returns:
        Dict ze współczynnikami dopasowania per kategoria
    """
    if not job_text:
        return {}
    
    job_keywords = extract_keywords(job_text, language)
    match_scores = {}
    
    for category in cv_keywords:
        cv_set = set(kw.lower() for kw in cv_keywords[category])
        job_set = set(kw.lower() for kw in job_keywords.get(category, []))
        
        if not job_set:
            match_scores[category] = 0.0
            continue
        
        # Calculate Jaccard similarity
        intersection = cv_set & job_set
        union = cv_set | job_set
        
        if not union:
            match_scores[category] = 0.0
        else:
            match_scores[category] = len(intersection) / len(union) * 100
    
    # Overall match (weighted)
    weights = {
        'technical_skills': 0.4,
        'soft_skills': 0.2,
        'languages': 0.2,
        'certifications': 0.2
    }
    
    overall_match = 0.0
    total_weight = 0.0
    
    for category, weight in weights.items():
        if category in match_scores:
            overall_match += match_scores[category] * weight
            total_weight += weight
    
    if total_weight > 0:
        match_scores['overall'] = overall_match / total_weight
    else:
        match_scores['overall'] = 0.0
    
    return match_scores


def enhance_keywords_for_job(cv_keywords: Dict[str, List[str]], 
                           job_text: str,
                           language: str = "pl") -> Dict[str, List[str]]:
    """
    Wzmacnia istniejące słowa kluczowe w CV pod ofertę pracy.
    NIE DODAJE nowych - tylko reorganizuje/priorytetyzuje istniejące.
    """
    if not job_text:
        return cv_keywords
    
    job_keywords = extract_keywords(job_text, language)
    enhanced_keywords = {}
    
    for category in cv_keywords:
        cv_skills = cv_keywords[category][:]
        job_skills = set(kw.lower() for kw in job_keywords.get(category, []))
        
        # Prioritize skills that match job posting
        priority_skills = []
        other_skills = []
        
        for skill in cv_skills:
            if skill.lower() in job_skills or _fuzzy_match(skill, job_skills):
                priority_skills.append(skill)
            else:
                other_skills.append(skill)
        
        # Combine: priority first, then others
        enhanced_keywords[category] = priority_skills + other_skills
    
    return enhanced_keywords


def _load_skills_dict() -> Dict:
    """Loads skills dictionary from JSON."""
    skills_path = Path(__file__).parent / 'lexicon' / 'skills.json'
    
    with open(skills_path, 'r', encoding='utf-8') as f:
        return json.load(f)


def _is_skill_present(skill: str, text: str) -> bool:
    """Checks if skill is present in text (with variations)."""
    skill_lower = skill.lower()
    
    # Exact match
    if skill_lower in text:
        return True
    
    # Word boundary match
    if re.search(r'\b' + re.escape(skill_lower) + r'\b', text):
        return True
    
    # Handle common variations
    variations = _get_skill_variations(skill_lower)
    for variation in variations:
        if variation in text or re.search(r'\b' + re.escape(variation) + r'\b', text):
            return True
    
    return False


def _get_skill_variations(skill: str) -> List[str]:
    """Returns common variations of a skill name."""
    variations = []
    
    # Common tech variations
    tech_variations = {
        'javascript': ['js', 'ecmascript'],
        'typescript': ['ts'],
        'python': ['py'],
        'postgresql': ['postgres', 'psql'],
        'microsoft office': ['ms office', 'office'],
        'photoshop': ['ps'],
        'illustrator': ['ai'],
        'after effects': ['ae'],
        'premiere': ['pr'],
        'visual studio code': ['vscode', 'vs code'],
        'github': ['git hub'],
        'linkedin': ['linked in'],
        'facebook ads': ['fb ads'],
        'google ads': ['adwords', 'google adwords'],
        'css3': ['css'],
        'html5': ['html'],
        'node.js': ['nodejs', 'node'],
        'react.js': ['reactjs'],
        'vue.js': ['vuejs'],
        'angular.js': ['angularjs']
    }
    
    if skill in tech_variations:
        variations.extend(tech_variations[skill])
    
    return variations


def _fuzzy_match(skill: str, job_skills: Set[str], threshold: int = 80) -> bool:
    """Fuzzy matching using rapidfuzz if available."""
    if not RAPIDFUZZ_AVAILABLE:
        return False
    
    skill_lower = skill.lower()
    
    for job_skill in job_skills:
        similarity = fuzz.ratio(skill_lower, job_skill)
        if similarity >= threshold:
            return True
    
    return False


def analyze_keyword_gaps(cv_keywords: Dict[str, List[str]], 
                        job_keywords: Dict[str, List[str]]) -> Dict[str, List[str]]:
    """
    Analizuje luki w słowach kluczowych (dla suggestions, nie do automatycznego dodania).
    """
    gaps = {}
    
    for category in job_keywords:
        cv_set = set(kw.lower() for kw in cv_keywords.get(category, []))
        job_set = set(kw.lower() for kw in job_keywords[category])
        
        missing = job_set - cv_set
        if missing:
            gaps[category] = list(missing)
    
    return gaps