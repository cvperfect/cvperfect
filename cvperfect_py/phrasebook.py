# -*- coding: utf-8 -*-
"""
Professional Phrasebook - Deterministyczny system transformacji jzyka HR
Konwertuje casual Polish na professional HR language bez halucynacji.
Tylko sprawdzone, zatwierdzone transformacje z lexicon.
"""

import re
import json
import logging
from pathlib import Path
from typing import Dict, List, Optional, Tuple

logger = logging.getLogger(__name__)

class ProfessionalPhrasebook:
    """
    Deterministyczny system podnoszenia jzyka CV na poziom profesjonalny.
    
    CORE PRINCIPLE: ZERO halucynacji - tylko sprawdzone mapping z lexicon.
    """
    
    def __init__(self):
        self.lexicon_dir = Path(__file__).parent / "lexicon"
        
        # Load all lexicon files
        self.role_elevations = self._load_role_elevations()
        self.verb_transformations = self._load_verb_transformations()
        self.phrase_improvements = self._load_phrase_improvements()
        self.professional_phrases = self._load_professional_phrases()
        self.stop_phrases = self._load_stop_phrases()
        self.action_verbs = self._load_action_verbs()
        
        # Compile regex patterns for performance
        self._compile_patterns()
        
        logger.info(" ProfessionalPhrasebook initialized with deterministic mappings")
    
    def _load_role_elevations(self) -> Dict[str, str]:
        """Load role elevation mappings from roles.pl.json"""
        try:
            with open(self.lexicon_dir / "roles.pl.json", 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data.get("role_aliases", {})
        except Exception as e:
            logger.warning(f"Could not load role elevations: {e}")
            return {}
    
    def _load_verb_transformations(self) -> Dict[str, str]:
        """Load verb transformations from verbs.pl.json"""
        try:
            with open(self.lexicon_dir / "verbs.pl.json", 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data.get("phrase_elevation", {})
        except Exception as e:
            logger.warning(f"Could not load verb transformations: {e}")
            return {}
    
    def _load_phrase_improvements(self) -> Dict[str, str]:
        """Load phrase improvement mappings"""
        # Try to load from phrases.pl.json, fallback to verbs.pl.json
        try:
            phrases_file = self.lexicon_dir / "phrases.pl.json"
            if phrases_file.exists():
                with open(phrases_file, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    # Combine phrase_improvements and verb_transformations
                    improvements = data.get("phrase_improvements", {})
                    verb_transformations = data.get("verb_transformations", {})
                    improvements.update(verb_transformations)
                    return improvements
            else:
                # Fallback to verbs.pl.json for now
                with open(self.lexicon_dir / "verbs.pl.json", 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    return data.get("phrase_elevation", {})
        except Exception as e:
            logger.warning(f"Could not load phrase improvements: {e}")
            return {}
    
    def _load_professional_phrases(self) -> Dict[str, str]:
        """Load professional phrase mappings"""
        try:
            with open(self.lexicon_dir / "verbs.pl.json", 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data.get("professional_phrases", {})
        except Exception as e:
            logger.warning(f"Could not load professional phrases: {e}")
            return {}
    
    def _load_stop_phrases(self) -> List[str]:
        """Load stop phrases that should be replaced"""
        try:
            with open(self.lexicon_dir / "verbs.pl.json", 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data.get("stop_phrases", [])
        except Exception as e:
            logger.warning(f"Could not load stop phrases: {e}")
            return []
    
    def _load_action_verbs(self) -> List[str]:
        """Load professional action verbs"""
        try:
            with open(self.lexicon_dir / "verbs.pl.json", 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data.get("action_verbs", [])
        except Exception as e:
            logger.warning(f"Could not load action verbs: {e}")
            return []
    
    def _compile_patterns(self):
        """Compile regex patterns for better performance"""
        # Patterns for casual phrase detection
        self.casual_patterns = [
            # Basic casual verbs
            (re.compile(r'\brobiBem\b', re.IGNORECASE), 'realizowaBem'),
            (re.compile(r'\brobiBam\b', re.IGNORECASE), 'realizowaBam'),
            (re.compile(r'\bpomagaBem\b', re.IGNORECASE), 'wspieraBem'),
            (re.compile(r'\bpomagaBam\b', re.IGNORECASE), 'wspieraBam'),
            (re.compile(r'\bzajmowaBem si\b', re.IGNORECASE), 'zarzdzaBem'),
            (re.compile(r'\bzajmowaBam si\b', re.IGNORECASE), 'zarzdzaBam'),
            (re.compile(r'\bpracowaBem przy\b', re.IGNORECASE), 'uczestniczyBem w realizacji'),
            (re.compile(r'\bpracowaBam przy\b', re.IGNORECASE), 'uczestniczyBam w realizacji'),
            
            # Specific job task patterns
            (re.compile(r'\broznosiBem paczki\b', re.IGNORECASE), 'realizowaBem terminowe dostawy do klient�w'),
            (re.compile(r'\broznosiBam paczki\b', re.IGNORECASE), 'realizowaBam terminowe dostawy do klient�w'),
            (re.compile(r'\bpakowaBem towary?\b', re.IGNORECASE), 'odpowiadaBem za profesjonalne pakowanie i przygotowanie przesyBek'),
            (re.compile(r'\bpakowaBam towary?\b', re.IGNORECASE), 'odpowiadaBam za profesjonalne pakowanie i przygotowanie przesyBek'),
            (re.compile(r'\bobsBugiwaBem kas\b', re.IGNORECASE), 'prowadziBem rozliczenia finansowe i obsBug transakcji pBatniczych'),
            (re.compile(r'\bobsBugiwaBam kas\b', re.IGNORECASE), 'prowadziBam rozliczenia finansowe i obsBug transakcji pBatniczych'),
            (re.compile(r'\bsprztaBem\b', re.IGNORECASE), 'utrzymywaBem wysokie standardy czysto[ci i porzdku'),
            (re.compile(r'\bsprztaBam\b', re.IGNORECASE), 'utrzymywaBam wysokie standardy czysto[ci i porzdku'),
        ]
        
        # Pattern for detecting already professional language
        self.professional_indicators = [
            'zarzdzaBem', 'zarzdzaBam', 'koordynowaBem', 'koordynowaBam',
            'realizowaBem', 'realizowaBam', 'wdro|yBem', 'wdro|yBam',
            'zoptymalizowaBem', 'zoptymalizowaBam', 'nadzorowaBem', 'nadzorowaBam',
            'opracowaBem', 'opracowaBam', 'wspieraBem', 'wspieraBam'
        ]
    
    def elevate_job_title(self, title: str) -> str:
        """
        Podnosi tytuB stanowiska do poziomu HR profesjonalnego.
        
        Examples:
        - "kurier" � "Kurier / Specjalista ds. dostaw ostatniej mili"
        - "magazynier" � "Magazynier / Specjalista ds. logistyki magazynowej"
        """
        if not title:
            return title
            
        title_lower = title.lower().strip()
        
        # Check for exact matches in role elevations
        for casual_role, professional_role in self.role_elevations.items():
            if casual_role.lower() == title_lower:
                logger.debug(f"Role elevated: '{title}' � '{professional_role}'")
                return professional_role
        
        # Check for partial matches (for compound titles)
        for casual_role, professional_role in self.role_elevations.items():
            if casual_role.lower() in title_lower:
                # Replace the casual part with professional
                elevated = title_lower.replace(casual_role.lower(), professional_role.lower())
                logger.debug(f"Role partially elevated: '{title}' � '{elevated.title()}'")
                return elevated.title()
        
        # Return original if no transformation found
        return title
    
    def improve_bullet_point(self, bullet: str) -> str:
        """
        Poprawia bullet point na profesjonalny poziom.
        
        Examples:
        - "RoznosiBem paczki" � "RealizowaBem terminowe dostawy do klient�w na wyznaczonych trasach"
        - "PakowaBem towary" � "OdpowiadaBem za profesjonalne pakowanie i przygotowanie przesyBek"
        """
        if not bullet:
            return bullet
        
        improved = bullet.strip()
        
        # Skip if already professional
        if self._is_already_professional(improved):
            return improved
        
        # Apply exact phrase transformations first (highest priority)
        for phrase, replacement in self.verb_transformations.items():
            if phrase.lower() in improved.lower():
                improved = re.sub(re.escape(phrase), replacement, improved, flags=re.IGNORECASE)
                logger.debug(f"Phrase elevated: '{bullet}' � '{improved}'")
                return improved
        
        # Apply pattern-based transformations
        for pattern, replacement in self.casual_patterns:
            if pattern.search(improved):
                improved = pattern.sub(replacement, improved)
                logger.debug(f"Pattern elevated: '{bullet}' � '{improved}'")
                return improved
        
        # Apply general professional phrases
        for casual, professional in self.professional_phrases.items():
            if casual.lower() in improved.lower():
                improved = re.sub(re.escape(casual), professional, improved, flags=re.IGNORECASE)
                logger.debug(f"Professional phrase applied: '{bullet}' � '{improved}'")
                return improved
        
        return improved
    
    def transform_casual_language(self, text: str) -> str:
        """
        Zamienia casual na business language dla caBego tekstu.
        
        U|ywane dla summary i innych sekcji tekstowych.
        """
        if not text:
            return text
        
        transformed = text
        
        # Apply all phrase transformations
        for casual, professional in {**self.verb_transformations, **self.professional_phrases}.items():
            if casual.lower() in transformed.lower():
                transformed = re.sub(re.escape(casual), professional, transformed, flags=re.IGNORECASE)
        
        return transformed
    
    def _is_already_professional(self, text: str) -> bool:
        """Sprawdza czy tekst jest ju| na poziomie profesjonalnym"""
        text_lower = text.lower()
        
        # Check for professional indicators
        for indicator in self.professional_indicators:
            if indicator.lower() in text_lower:
                return True
        
        # Check for stop phrases that indicate casual language
        for stop_phrase in self.stop_phrases:
            if stop_phrase.lower() in text_lower:
                return False
        
        return False
    
    def get_transformation_stats(self, original_text: str, transformed_text: str) -> Dict[str, int]:
        """Zwraca statystyki transformacji"""
        stats = {
            'total_transformations': 0,
            'role_elevations': 0,
            'verb_improvements': 0,
            'phrase_improvements': 0
        }
        
        # Count differences (simplified)
        if original_text != transformed_text:
            stats['total_transformations'] = 1
            
            # More detailed counting could be added here
            for phrase in self.verb_transformations:
                if phrase.lower() in original_text.lower() and phrase.lower() not in transformed_text.lower():
                    stats['verb_improvements'] += 1
        
        return stats
    
    def validate_no_hallucinations(self, original: str, transformed: str) -> bool:
        """
        Waliduje |e transformacja nie dodaBa nowych fakt�w.
        
        Safety check przeciwko halucynacjom.
        """
        # Very basic check - more sophisticated validation would be in compliance module
        original_words = set(original.lower().split())
        transformed_words = set(transformed.lower().split())
        
        # Check if too many new words were added (potential hallucination)
        new_words = transformed_words - original_words
        
        # Allow up to 50% new words (professional language expansion)
        if len(new_words) > len(original_words) * 0.5:
            logger.warning(f"Potential hallucination detected - too many new words: {new_words}")
            return False
        
        return True


# Convenience functions for direct use
def elevate_role(role_title: str) -> str:
    """Quick function to elevate a job title"""
    phrasebook = ProfessionalPhrasebook()
    return phrasebook.elevate_job_title(role_title)

def improve_bullet(bullet_text: str) -> str:
    """Quick function to improve a bullet point"""
    phrasebook = ProfessionalPhrasebook()
    return phrasebook.improve_bullet_point(bullet_text)

def transform_text(text: str) -> str:
    """Quick function to transform casual text"""
    phrasebook = ProfessionalPhrasebook()
    return phrasebook.transform_casual_language(text)


if __name__ == "__main__":
    # Test basic functionality
    phrasebook = ProfessionalPhrasebook()
    
    # Test role elevation
    print("=== ROLE ELEVATION TESTS ===")
    test_roles = ["kurier", "magazynier", "kasjer", "sprztacz", "kelner", "ochroniarz"]
    for role in test_roles:
        elevated = phrasebook.elevate_job_title(role)
        print(f"{role} � {elevated}")
    
    print("\n=== BULLET IMPROVEMENT TESTS ===")
    test_bullets = [
        "RoznosiBem paczki",
        "PakowaBem towary",
        "ObsBugiwaBem kas",
        "SprztaBem biuro",
        "PomagaBem klientom",
        "ZajmowaBem si magazynem"
    ]
    
    for bullet in test_bullets:
        improved = phrasebook.improve_bullet_point(bullet)
        print(f"'{bullet}' � '{improved}'")