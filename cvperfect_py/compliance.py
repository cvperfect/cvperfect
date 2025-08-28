"""
Compliance Guard System - ZERO Halucynacji
System walidacji zapewniający zachowanie wszystkich faktów z oryginalnego CV
Dodaje TYLKO profesjonalne przepisanie z lexicon, NIGDY nowe informacje
"""

import re
import json
import logging
from typing import Dict, List, Optional, Set, Tuple, Any
from dataclasses import dataclass
from pathlib import Path
from difflib import SequenceMatcher
import Levenshtein
from collections import Counter

logger = logging.getLogger(__name__)

@dataclass
class ViolationWarning:
    """Pojedyncze naruszenie compliance"""
    type: str  # 'new_fact', 'date_mismatch', 'company_added', etc.
    severity: str  # 'critical', 'warning', 'info'
    original: str
    processed: str
    confidence: float
    line_number: Optional[int] = None

@dataclass
class ComplianceResult:
    """Rezultat walidacji compliance"""
    is_compliant: bool
    violations: List[ViolationWarning]
    warning_score: float  # 0.0 = perfect, 1.0 = suspicious
    extracted_facts_count: int
    original_facts_count: int
    confidence: float
    summary: str
    recommendations: List[str]

class ComplianceGuard:
    """Główny system compliance guard"""
    
    def __init__(self, lexicon_path: str = "cvperfect_py/lexicon"):
        self.lexicon_path = Path(lexicon_path)
        self.forbidden_phrases = self._load_forbidden_phrases()
        self.allowed_transformations = self._load_allowed_transformations()
        self.role_aliases = self._load_role_aliases()
        self.entity_patterns = self._compile_entity_patterns()
        
    def _load_forbidden_phrases(self) -> Set[str]:
        """Ładuje zakazane frazy z JSON"""
        try:
            forbidden_path = self.lexicon_path / "forbidden_phrases.json"
            if forbidden_path.exists():
                with open(forbidden_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)
                    return set(data.get('forbidden', []))
        except Exception as e:
            logger.warning(f"Cannot load forbidden phrases: {e}")
        
        # Domyślne zakazane frazy
        return {
            "Senior Full-Stack Developer",
            "Team Lead",
            "Project Manager", 
            "Google", "Microsoft", "Amazon",
            "AWS Certified", "Scrum Master",
            "Machine Learning Engineer",
            "Data Scientist"
        }
    
    def _load_allowed_transformations(self) -> Dict[str, str]:
        """Ładuje dozwolone transformacje z lexicon"""
        transformations = {}
        
        try:
            # Wczytaj elevacje fraz
            verbs_path = self.lexicon_path / "verbs.pl.json"
            if verbs_path.exists():
                with open(verbs_path, 'r', encoding='utf-8') as f:
                    verbs_data = json.load(f)
                    transformations.update(verbs_data.get('phrase_elevation', {}))
                    transformations.update(verbs_data.get('professional_phrases', {}))
        except Exception as e:
            logger.warning(f"Cannot load verb transformations: {e}")
            
        return transformations
    
    def _load_role_aliases(self) -> Dict[str, str]:
        """Ładuje aliasy ról z lexicon"""
        aliases = {}
        
        try:
            roles_path = self.lexicon_path / "roles.pl.json"
            if roles_path.exists():
                with open(roles_path, 'r', encoding='utf-8') as f:
                    roles_data = json.load(f)
                    aliases.update(roles_data.get('role_aliases', {}))
        except Exception as e:
            logger.warning(f"Cannot load role aliases: {e}")
            
        return aliases
    
    def _compile_entity_patterns(self) -> Dict[str, re.Pattern]:
        """Kompiluje wzorce rozpoznawania encji"""
        return {
            'email': re.compile(r'\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b'),
            'phone': re.compile(r'(?:\+48\s?)?\d{2,3}[-.\s]?\d{3}[-.\s]?\d{2,3}[-.\s]?\d{2,3}'),
            'date_range': re.compile(r'\b\d{4}[-–—]\d{2,4}\b|\b\d{4}\s*[-–—]\s*(?:obecnie|present|current|\d{4})\b'),
            'company': re.compile(r'\b[A-ZĆŁŚŻŹ][a-ząćęłńóśźż\s]*(?:Sp\.?\s*z\.?\s*o\.?\.?|S\.?A\.?|Ltd\.?|Inc\.?|Corp\.?|GmbH|Spółka|Firma|Sklep|Hurtownia)\b'),
            'person_name': re.compile(r'\b[A-ZĆŁŚŻŹ][a-ząćęłńóśźż]+\s+[A-ZĆŁŚŻŹ][a-ząćęłńóśźż]+\b'),
            'city': re.compile(r'\b(?:Warszawa|Kraków|Gdańsk|Wrocław|Poznań|Łódź|Katowice|Lublin|Szczecin|Bydgoszcz)\b'),
            'skill': re.compile(r'\b(?:Python|JavaScript|React|Java|C\+\+|SQL|HTML|CSS|Docker|Git)\b'),
        }

    def validate_no_new_facts(self, original_text: str, extracted_sections) -> ComplianceResult:
        """
        Główna funkcja walidacji - sprawdza czy nie dodano nowych faktów
        """
        violations = []
        
        # Extract facts from original and processed
        original_facts = self._extract_facts(original_text)
        processed_facts = self._extract_facts_from_sections(extracted_sections)
        
        # 1. Check for new companies
        company_violations = self._check_company_integrity(
            original_facts['companies'], processed_facts['companies']
        )
        violations.extend(company_violations)
        
        # 2. Check for new dates
        date_violations = self._check_date_integrity(
            original_facts['dates'], processed_facts['dates']
        )
        violations.extend(date_violations)
        
        # 3. Check for new skills
        skill_violations = self._check_skill_integrity(
            original_facts['skills'], processed_facts['skills']
        )
        violations.extend(skill_violations)
        
        # 4. Check contact integrity
        contact_violations = self.validate_contact_integrity(
            original_facts['contact'], processed_facts['contact']
        )
        violations.extend(contact_violations)
        
        # 5. Check experience integrity
        experience_violations = self.validate_experience_integrity(
            original_text, extracted_sections.experience
        )
        violations.extend(experience_violations)
        
        # 6. Check forbidden phrases
        forbidden_violations = self._check_forbidden_phrases(extracted_sections)
        violations.extend(forbidden_violations)
        
        # Calculate compliance score
        warning_score = self._calculate_warning_score(violations)
        is_compliant = warning_score < 0.3  # Threshold for compliance
        confidence = max(0.0, 1.0 - warning_score)
        
        # Generate summary and recommendations
        summary = self._generate_summary(violations, original_facts, processed_facts)
        recommendations = self._generate_recommendations(violations)
        
        return ComplianceResult(
            is_compliant=is_compliant,
            violations=violations,
            warning_score=warning_score,
            extracted_facts_count=self._count_facts(processed_facts),
            original_facts_count=self._count_facts(original_facts),
            confidence=confidence,
            summary=summary,
            recommendations=recommendations
        )

    def check_fact_preservation(self, original: str, processed: str) -> List[ViolationWarning]:
        """Porównuje dwa teksty pod kątem zachowania faktów"""
        violations = []
        
        # Similarity check
        similarity = SequenceMatcher(None, original.lower(), processed.lower()).ratio()
        if similarity < 0.3:  # Very different texts
            violations.append(ViolationWarning(
                type='low_similarity',
                severity='warning',
                original=original[:100] + "...",
                processed=processed[:100] + "...",
                confidence=1.0 - similarity
            ))
        
        # Check for completely new sentences
        original_sentences = set(sent.strip().lower() for sent in original.split('.') if len(sent.strip()) > 10)
        processed_sentences = set(sent.strip().lower() for sent in processed.split('.') if len(sent.strip()) > 10)
        
        new_sentences = processed_sentences - original_sentences
        for sentence in new_sentences:
            if not self._is_allowed_transformation(sentence, original):
                violations.append(ViolationWarning(
                    type='new_sentence',
                    severity='warning',
                    original="",
                    processed=sentence[:100],
                    confidence=0.8
                ))
        
        return violations

    def validate_contact_integrity(self, original_contact: Dict[str, str], extracted_contact: Dict[str, str]) -> List[ViolationWarning]:
        """Waliduje integralność danych kontaktowych"""
        violations = []
        
        # Check if email was added (not in original)
        if 'email' in extracted_contact and 'email' not in original_contact:
            violations.append(ViolationWarning(
                type='contact_added',
                severity='critical',
                original="",
                processed=extracted_contact['email'],
                confidence=1.0
            ))
        
        # Check if email was changed
        both_contacts = set(original_contact.keys()) & set(extracted_contact.keys())
        if 'email' in both_contacts:
            if original_contact['email'] != extracted_contact['email']:
                violations.append(ViolationWarning(
                    type='contact_changed',
                    severity='critical',
                    original=original_contact['email'],
                    processed=extracted_contact['email'],
                    confidence=1.0
                ))
        
        # Same for phone
        if 'phone' in extracted_contact and 'phone' not in original_contact:
            violations.append(ViolationWarning(
                type='contact_added',
                severity='critical',
                original="",
                processed=extracted_contact['phone'],
                confidence=1.0
            ))
        
        return violations

    def validate_experience_integrity(self, original_text: str, experiences: List) -> List[ViolationWarning]:
        """Waliduje integralność doświadczenia zawodowego"""
        violations = []
        
        original_companies = set(self._extract_companies_from_text(original_text))
        
        for exp in experiences:
            if hasattr(exp, 'company') and exp.company:
                if exp.company not in original_companies:
                    # Check if it's just a transformation
                    if not self._is_company_transformation(exp.company, original_companies):
                        violations.append(ViolationWarning(
                            type='company_added',
                            severity='critical',
                            original="",
                            processed=exp.company,
                            confidence=0.9
                        ))
        
        return violations

    def _extract_facts(self, text: str) -> Dict[str, Set[str]]:
        """Ekstraktuje fakty z tekstu"""
        facts = {
            'companies': set(),
            'dates': set(),
            'skills': set(),
            'contact': {},
            'education': set(),
            'certifications': set()
        }
        
        # Extract companies
        facts['companies'] = set(self._extract_companies_from_text(text))
        
        # Extract dates
        dates = self.entity_patterns['date_range'].findall(text)
        facts['dates'] = set(dates)
        
        # Extract skills
        skills = self.entity_patterns['skill'].findall(text)
        facts['skills'] = set(skills)
        
        # Extract contact
        email_match = self.entity_patterns['email'].search(text)
        if email_match:
            facts['contact']['email'] = email_match.group()
        
        phone_match = self.entity_patterns['phone'].search(text)
        if phone_match:
            facts['contact']['phone'] = phone_match.group()
        
        return facts

    def _extract_facts_from_sections(self, sections) -> Dict[str, Set[str]]:
        """Ekstraktuje fakty z CVSections"""
        facts = {
            'companies': set(),
            'dates': set(),
            'skills': set(),
            'contact': {},
            'education': set(),
            'certifications': set()
        }
        
        # Extract from experience
        if hasattr(sections, 'experience'):
            for exp in sections.experience:
                if hasattr(exp, 'company') and exp.company:
                    facts['companies'].add(exp.company)
                if hasattr(exp, 'date_start') and exp.date_start:
                    facts['dates'].add(exp.date_start)
                if hasattr(exp, 'date_end') and exp.date_end:
                    facts['dates'].add(exp.date_end)
        
        # Extract contact
        if hasattr(sections, 'contact'):
            facts['contact'] = dict(sections.contact)
        
        # Extract skills
        if hasattr(sections, 'skills'):
            facts['skills'] = set(sections.skills)
        
        return facts

    def _extract_companies_from_text(self, text: str) -> List[str]:
        """Ekstraktuje nazwy firm z tekstu"""
        companies = []
        
        # Use pattern matching
        matches = self.entity_patterns['company'].findall(text)
        companies.extend(matches)
        
        # Additional heuristics for company detection
        lines = text.split('\n')
        for line in lines:
            # Look for patterns like "w XYZ", "at XYZ"
            matches = re.findall(r'\b(?:w|at|@)\s+([A-ZĆŁŚŻŹ][a-ząćęłńóśźż\s]{2,30})', line)
            companies.extend(matches)
        
        return [c.strip() for c in companies if len(c.strip()) > 2]

    def _check_company_integrity(self, original: Set[str], processed: Set[str]) -> List[ViolationWarning]:
        """Sprawdza integralność firm"""
        violations = []
        
        new_companies = processed - original
        for company in new_companies:
            if not self._is_company_transformation(company, original):
                violations.append(ViolationWarning(
                    type='company_added',
                    severity='critical',
                    original="",
                    processed=company,
                    confidence=0.9
                ))
        
        return violations

    def _check_date_integrity(self, original: Set[str], processed: Set[str]) -> List[ViolationWarning]:
        """Sprawdza integralność dat"""
        violations = []
        
        new_dates = processed - original
        for date in new_dates:
            violations.append(ViolationWarning(
                type='date_added',
                severity='critical',
                original="",
                processed=date,
                confidence=0.95
            ))
        
        return violations

    def _check_skill_integrity(self, original: Set[str], processed: Set[str]) -> List[ViolationWarning]:
        """Sprawdza integralność umiejętności"""
        violations = []
        
        new_skills = processed - original
        for skill in new_skills:
            # Check if it's forbidden
            if skill in self.forbidden_phrases:
                violations.append(ViolationWarning(
                    type='forbidden_skill',
                    severity='critical',
                    original="",
                    processed=skill,
                    confidence=1.0
                ))
        
        return violations

    def _check_forbidden_phrases(self, sections) -> List[ViolationWarning]:
        """Sprawdza zakazane frazy we wszystkich sekcjach"""
        violations = []
        
        # Convert sections to text for checking
        text_content = self._sections_to_text(sections)
        
        for phrase in self.forbidden_phrases:
            if phrase.lower() in text_content.lower():
                violations.append(ViolationWarning(
                    type='forbidden_phrase',
                    severity='critical',
                    original="",
                    processed=phrase,
                    confidence=1.0
                ))
        
        return violations

    def _is_allowed_transformation(self, processed_text: str, original_text: str) -> bool:
        """Sprawdza czy transformacja jest dozwolona"""
        processed_lower = processed_text.lower()
        original_lower = original_text.lower()
        
        # Check if it's in allowed transformations
        for original_phrase, transformed_phrase in self.allowed_transformations.items():
            if (original_phrase.lower() in original_lower and 
                transformed_phrase.lower() in processed_lower):
                return True
        
        # Check role aliases
        for original_role, transformed_role in self.role_aliases.items():
            if (original_role.lower() in original_lower and 
                transformed_role.lower() in processed_lower):
                return True
        
        return False

    def _is_company_transformation(self, company: str, original_companies: Set[str]) -> bool:
        """Sprawdza czy nazwa firmy to transformacja istniejącej"""
        company_lower = company.lower()
        
        for orig_company in original_companies:
            # Check similarity
            similarity = SequenceMatcher(None, company_lower, orig_company.lower()).ratio()
            if similarity > 0.8:
                return True
            
            # Check if one contains the other
            if (orig_company.lower() in company_lower or 
                company_lower in orig_company.lower()):
                return True
        
        return False

    def _calculate_warning_score(self, violations: List[ViolationWarning]) -> float:
        """Oblicza score ostrzeżeń"""
        if not violations:
            return 0.0
        
        severity_weights = {
            'critical': 1.0,
            'warning': 0.5,
            'info': 0.1
        }
        
        total_score = sum(
            violation.confidence * severity_weights.get(violation.severity, 0.5)
            for violation in violations
        )
        
        # Normalize by number of violations
        return min(1.0, total_score / len(violations))

    def _count_facts(self, facts: Dict[str, Set[str]]) -> int:
        """Liczy fakty"""
        count = 0
        for key, value in facts.items():
            if key == 'contact':
                count += len(value) if isinstance(value, dict) else 0
            else:
                count += len(value) if isinstance(value, set) else 0
        return count

    def _generate_summary(self, violations: List[ViolationWarning], original_facts: Dict, processed_facts: Dict) -> str:
        """Generuje podsumowanie"""
        if not violations:
            return "✅ Compliance PASSED - Żadnych naruszeń nie wykryto"
        
        critical_count = sum(1 for v in violations if v.severity == 'critical')
        warning_count = sum(1 for v in violations if v.severity == 'warning')
        
        summary = f"⚠️ Wykryto {len(violations)} naruszeń compliance: "
        summary += f"{critical_count} krytycznych, {warning_count} ostrzeżeń"
        
        return summary

    def _generate_recommendations(self, violations: List[ViolationWarning]) -> List[str]:
        """Generuje rekomendacje"""
        recommendations = []
        
        violation_types = set(v.type for v in violations)
        
        if 'company_added' in violation_types:
            recommendations.append("Usuń dodane nazwy firm - używaj tylko firm z oryginalnego CV")
        
        if 'forbidden_phrase' in violation_types:
            recommendations.append("Usuń zakazane frazy z listy forbidden_phrases.json")
        
        if 'contact_changed' in violation_types:
            recommendations.append("Przywróć oryginalne dane kontaktowe - NIGDY ich nie zmieniaj")
        
        if not recommendations:
            recommendations.append("Kontynuuj używanie tylko dozwolonych transformacji z lexicon/")
        
        return recommendations

    def _sections_to_text(self, sections) -> str:
        """Konwertuje sekcje do tekstu do analizy"""
        text_parts = []
        
        if hasattr(sections, 'experience'):
            for exp in sections.experience:
                if hasattr(exp, 'role'):
                    text_parts.append(exp.role)
                if hasattr(exp, 'company'):
                    text_parts.append(exp.company)
                if hasattr(exp, 'bullets'):
                    text_parts.extend(exp.bullets)
        
        if hasattr(sections, 'skills'):
            text_parts.extend(sections.skills)
        
        return ' '.join(text_parts)


def sanitize_html_content(content: str) -> str:
    """
    Sanitize HTML content using DOMPurify equivalent for Python
    Removes XSS vectors while preserving formatting
    """
    import html
    import re
    
    # HTML escape dangerous characters
    content = html.escape(content)
    
    # Remove script tags and their content
    content = re.sub(r'<script[^>]*>.*?</script>', '', content, flags=re.IGNORECASE | re.DOTALL)
    
    # Remove potentially dangerous attributes
    dangerous_attrs = ['onclick', 'onload', 'onerror', 'onmouseover', 'onmouseout', 'javascript:']
    for attr in dangerous_attrs:
        content = re.sub(f'{attr}[^>]*', '', content, flags=re.IGNORECASE)
    
    # Allow only safe HTML tags for CV formatting
    allowed_tags = ['p', 'br', 'strong', 'b', 'em', 'i', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'div', 'span']
    
    # Remove any tags not in allowed list
    content = re.sub(r'<(?!/?(?:' + '|'.join(allowed_tags) + r')\b)[^>]*>', '', content, flags=re.IGNORECASE)
    
    return content