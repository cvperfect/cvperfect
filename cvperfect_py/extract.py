"""
Moduł ekstrakcji sekcji CV
Heurystyczne wykrywanie struktur bez halucynacji
"""

import re
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

@dataclass
class Experience:
    """Pojedyncze doświadczenie zawodowe."""
    role: str
    company: str
    date_start: Optional[str]
    date_end: Optional[str]
    bullets: List[str]
    
@dataclass
class Education:
    """Pojedynczy wpis edukacyjny."""
    degree: str
    institution: str
    date: Optional[str]
    field: Optional[str]

@dataclass
class CVSections:
    """Wszystkie wyekstraktowane sekcje CV."""
    contact: Dict[str, str]
    summary: Optional[str]
    experience: List[Experience]
    education: List[Education]
    skills: List[str]
    projects: List[str]
    certificates: List[str]
    interests: List[str]
    languages: List[str]
    raw_sections: Dict[str, str]  # Zachowaj oryginalne sekcje


def extract_sections(text: str) -> CVSections:
    """
    Ekstraktuje sekcje z tekstu CV używając heurystyk.
    
    Args:
        text: Znormalizowany tekst CV
        
    Returns:
        CVSections z wyekstraktowanymi danymi
    """
    # Podziel na sekcje używając nagłówków
    raw_sections = _split_into_sections(text)
    
    # Ekstraktuj kontakt
    contact = _extract_contact(text, raw_sections)
    
    # Ekstraktuj podsumowanie
    summary = _extract_summary(raw_sections)
    
    # Ekstraktuj doświadczenie
    experience = _extract_experience(raw_sections)
    
    # Ekstraktuj edukację
    education = _extract_education(raw_sections)
    
    # Ekstraktuj umiejętności
    skills = _extract_skills(raw_sections)
    
    # Ekstraktuj projekty
    projects = _extract_projects(raw_sections)
    
    # Ekstraktuj certyfikaty
    certificates = _extract_certificates(raw_sections)
    
    # Ekstraktuj zainteresowania
    interests = _extract_interests(raw_sections)
    
    # Ekstraktuj języki
    languages = _extract_languages(raw_sections)
    
    return CVSections(
        contact=contact,
        summary=summary,
        experience=experience,
        education=education,
        skills=skills,
        projects=projects,
        certificates=certificates,
        interests=interests,
        languages=languages,
        raw_sections=raw_sections
    )


def _split_into_sections(text: str) -> Dict[str, str]:
    """Dzieli tekst na sekcje według nagłówków."""
    # Wzorce nagłówków sekcji (PL i EN)
    section_patterns = [
        r'^(dane|kontakt|contact|personal)',
        r'^(podsumowanie|summary|profile|profil|o mnie|about)',
        r'^(doświadczenie|experience|praca|work|zatrudnienie|employment)',
        r'^(wykształcenie|edukacja|education|studia)',
        r'^(umiejętności|skills|kompetencje|kwalifikacje)',
        r'^(projekty|projects)',
        r'^(certyfikaty|certificates|kursy|szkolenia|training)',
        r'^(zainteresowania|hobby|interests)',
        r'^(języki|languages|języki obce)',
    ]
    
    sections = {}
    current_section = "header"
    current_content = []
    
    lines = text.split('\n')
    
    for line in lines:
        stripped = line.strip()
        
        # Sprawdź czy to nagłówek sekcji
        is_header = False
        for pattern in section_patterns:
            if re.match(pattern, stripped, re.IGNORECASE):
                # Zapisz poprzednią sekcję
                if current_content:
                    sections[current_section] = '\n'.join(current_content)
                
                # Ustaw nową sekcję
                current_section = _normalize_section_name(stripped)
                current_content = []
                is_header = True
                break
        
        if not is_header:
            current_content.append(line)
    
    # Zapisz ostatnią sekcję
    if current_content:
        sections[current_section] = '\n'.join(current_content)
    
    logger.debug(f"Found sections: {list(sections.keys())}")
    
    return sections


def _normalize_section_name(header: str) -> str:
    """Normalizuje nazwę sekcji do standardowej."""
    header_lower = header.lower().strip()
    
    mapping = {
        'doświadczenie': 'experience',
        'experience': 'experience',
        'praca': 'experience',
        'work': 'experience',
        'zatrudnienie': 'experience',
        'employment': 'experience',
        'wykształcenie': 'education',
        'edukacja': 'education',
        'education': 'education',
        'studia': 'education',
        'umiejętności': 'skills',
        'skills': 'skills',
        'kompetencje': 'skills',
        'kwalifikacje': 'skills',
        'podsumowanie': 'summary',
        'summary': 'summary',
        'profile': 'summary',
        'profil': 'summary',
        'o mnie': 'summary',
        'about': 'summary',
        'projekty': 'projects',
        'projects': 'projects',
        'certyfikaty': 'certificates',
        'certificates': 'certificates',
        'kursy': 'certificates',
        'szkolenia': 'certificates',
        'training': 'certificates',
        'zainteresowania': 'interests',
        'hobby': 'interests',
        'interests': 'interests',
        'języki': 'languages',
        'languages': 'languages',
        'języki obce': 'languages',
        'dane': 'contact',
        'kontakt': 'contact',
        'contact': 'contact',
        'personal': 'contact',
    }
    
    for key, value in mapping.items():
        if key in header_lower:
            return value
    
    return header_lower


def _extract_contact(text: str, sections: Dict[str, str]) -> Dict[str, str]:
    """Ekstraktuje dane kontaktowe."""
    contact = {}
    
    # Szukaj w header lub contact section
    search_text = sections.get('header', '') + '\n' + sections.get('contact', '')
    
    # Email
    email_match = re.search(r'([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})', search_text)
    if email_match:
        contact['email'] = email_match.group(1)
    
    # Telefon
    phone_patterns = [
        r'(?:\+48\s?)?(\d{3}[-.\s]?\d{3}[-.\s]?\d{3})',
        r'(\d{2}[-.\s]?\d{3}[-.\s]?\d{2}[-.\s]?\d{2})',
        r'([(]?\d{2,4}[)]?[-.\s]?\d{3,4}[-.\s]?\d{3,4})'
    ]
    
    for pattern in phone_patterns:
        phone_match = re.search(pattern, search_text)
        if phone_match:
            contact['phone'] = phone_match.group(0).strip()
            break
    
    # LinkedIn
    linkedin_match = re.search(r'linkedin\.com/in/([a-zA-Z0-9-]+)', search_text)
    if linkedin_match:
        contact['linkedin'] = f"linkedin.com/in/{linkedin_match.group(1)}"
    
    # GitHub
    github_match = re.search(r'github\.com/([a-zA-Z0-9-]+)', search_text)
    if github_match:
        contact['github'] = f"github.com/{github_match.group(1)}"
    
    # Imię i nazwisko (pierwsze 1-3 linie niepuste)
    lines = [l.strip() for l in search_text.split('\n') if l.strip()][:5]
    for line in lines:
        # Sprawdź czy to wygląda jak imię i nazwisko
        if (len(line.split()) >= 2 and len(line) < 50 and 
            not any(char in line for char in ['@', 'http', 'www', '+48'])):
            contact['name'] = line
            break
    
    return contact


def _extract_summary(sections: Dict[str, str]) -> Optional[str]:
    """Ekstraktuje podsumowanie zawodowe."""
    summary_text = sections.get('summary', '')
    
    if summary_text:
        # Oczyść i zwróć
        lines = [l.strip() for l in summary_text.split('\n') if l.strip()]
        return ' '.join(lines)
    
    return None


def _extract_experience(sections: Dict[str, str]) -> List[Experience]:
    """Ekstraktuje doświadczenie zawodowe."""
    experience_list = []
    exp_text = sections.get('experience', '')
    
    if not exp_text:
        return experience_list
    
    # Wzorce dla stanowisk - POPRAWIONE (exclude bullet points)
    role_patterns = [
        # Pattern 1: Role w/at Company (dates) - not starting with bullet
        r'^(?![•\-–—])(.+?)\s+(?:w|at|@)\s+(.+?)(?:\s*\((\d{4}[-–—]\d{4}|\d{4}[-–—]obecnie)\))?$',
        # Pattern 2: Role | Company (dates) - not starting with bullet
        r'^(?![•\-–—])(.+?)\s*\|\s*(.+?)(?:\s*\((\d{4}[-–—]\d{4}|\d{4}[-–—]obecnie)\))?$',
        # Pattern 3: Role (Company) (dates) - not starting with bullet
        r'^(?![•\-–—])(.+?)\s*\(([^)]+)\)(?:\s*\((\d{4}[-–—]\d{4}|\d{4}[-–—]obecnie)\))?$',
        # Pattern 4: Just Role with dates - not starting with bullet
        r'^(?![•\-–—])(.+?)(?:\s*\((\d{4}[-–—]\d{4}|\d{4}[-–—]obecnie)\))?$'
    ]
    
    current_exp = None
    lines = exp_text.split('\n')
    
    for line in lines:
        stripped = line.strip()
        
        if not stripped:
            continue
            
        # Sprawdź czy to nowe stanowisko
        is_new_role = False
        for i, pattern in enumerate(role_patterns):
            match = re.match(pattern, stripped)
            if match:
                # Zapisz poprzednie jeśli istnieje
                if current_exp and current_exp.role:
                    experience_list.append(current_exp)
                
                # Stwórz nowe - handle different pattern structures
                groups = match.groups()
                role = groups[0].strip() if groups[0] else ''
                
                if i == 2:  # Pattern 3: Role (Company) (dates)
                    company = groups[1].strip() if groups[1] else ''
                    dates = groups[2] if len(groups) > 2 and groups[2] else ''
                elif i == 3:  # Pattern 4: Just role with dates
                    company = ''
                    dates = groups[1] if len(groups) > 1 and groups[1] else ''
                else:  # Patterns 1 & 2: Role connector Company (dates)
                    company = groups[1].strip() if len(groups) > 1 and groups[1] else ''
                    dates = groups[2] if len(groups) > 2 and groups[2] else ''
                
                # Check if company looks like dates (fix for pattern 4 edge case)
                if company and re.match(r'^\d{4}[-–—]\d{4}$|^\d{4}[-–—]obecnie$', company):
                    dates = company
                    company = ''
                
                # Parsuj daty
                date_start, date_end = _parse_date_range(dates)
                
                current_exp = Experience(
                    role=role,
                    company=company,
                    date_start=date_start,
                    date_end=date_end,
                    bullets=[]
                )
                is_new_role = True
                break
        
        # Jeśli nie nowe stanowisko, to bullet
        if not is_new_role and current_exp:
            if stripped.startswith('•') or stripped.startswith('-'):
                bullet = stripped[1:].strip()
                if bullet:
                    current_exp.bullets.append(bullet)
            elif len(stripped) < 150:  # Krótka linia = prawdopodobnie bullet
                current_exp.bullets.append(stripped)
    
    # Dodaj ostatnie
    if current_exp and current_exp.role:
        experience_list.append(current_exp)
    
    return experience_list


def _extract_education(sections: Dict[str, str]) -> List[Education]:
    """Ekstraktuje wykształcenie."""
    education_list = []
    edu_text = sections.get('education', '')
    
    if not edu_text:
        return education_list
    
    lines = [l.strip() for l in edu_text.split('\n') if l.strip()]
    
    # Wzorce dla wykształcenia
    patterns = [
        r'([^,|]+?)\s*[,|]\s*([^,|(]+?)(?:\s*[(\[](\d{4}[-–—]\d{4}|\d{4})[)\]])?',
        r'([^(\[]+?)(?:\s*[(\[](\d{4}[-–—]\d{4}|\d{4})[)\]])?',
    ]
    
    for line in lines:
        for pattern in patterns:
            match = re.match(pattern, line)
            if match:
                groups = match.groups()
                degree = groups[0].strip() if groups[0] else line
                institution = groups[1].strip() if len(groups) > 1 and groups[1] else ''
                date = groups[2].strip() if len(groups) > 2 and groups[2] else ''
                
                education_list.append(Education(
                    degree=degree,
                    institution=institution,
                    date=date,
                    field=None
                ))
                break
    
    return education_list


def _extract_skills(sections: Dict[str, str]) -> List[str]:
    """Ekstraktuje umiejętności."""
    skills_text = sections.get('skills', '')
    
    if not skills_text:
        return []
    
    skills = []
    
    # Rozbij na pojedyncze umiejętności
    # Separatory: przecinek, średnik, bullet, nowa linia
    parts = re.split(r'[,;•\n]', skills_text)
    
    for part in parts:
        skill = part.strip(' -–—')
        # Filtruj śmieci
        if skill and len(skill) > 1 and len(skill) < 50:
            skills.append(skill)
    
    # Usuń duplikaty zachowując kolejność
    seen = set()
    unique_skills = []
    for skill in skills:
        skill_lower = skill.lower()
        if skill_lower not in seen:
            seen.add(skill_lower)
            unique_skills.append(skill)
    
    return unique_skills


def _extract_projects(sections: Dict[str, str]) -> List[str]:
    """Ekstraktuje projekty."""
    projects_text = sections.get('projects', '')
    
    if not projects_text:
        return []
    
    projects = []
    lines = [l.strip() for l in projects_text.split('\n') if l.strip()]
    
    for line in lines:
        # Usuń bullets
        clean = re.sub(r'^[•\-–—*]\s*', '', line)
        if clean and len(clean) > 5:
            projects.append(clean)
    
    return projects


def _extract_certificates(sections: Dict[str, str]) -> List[str]:
    """Ekstraktuje certyfikaty."""
    cert_text = sections.get('certificates', '')
    
    if not cert_text:
        return []
    
    certificates = []
    lines = [l.strip() for l in cert_text.split('\n') if l.strip()]
    
    for line in lines:
        clean = re.sub(r'^[•\-–—*]\s*', '', line)
        if clean and len(clean) > 3:
            certificates.append(clean)
    
    return certificates


def _extract_interests(sections: Dict[str, str]) -> List[str]:
    """Ekstraktuje zainteresowania."""
    interests_text = sections.get('interests', '')
    
    if not interests_text:
        return []
    
    interests = []
    
    # Rozbij podobnie jak skills
    parts = re.split(r'[,;•\n]', interests_text)
    
    for part in parts:
        interest = part.strip(' -–—')
        if interest and len(interest) > 1 and len(interest) < 50:
            interests.append(interest)
    
    # Usuń duplikaty
    return list(dict.fromkeys(interests))


def _extract_languages(sections: Dict[str, str]) -> List[str]:
    """Ekstraktuje języki."""
    lang_text = sections.get('languages', '')
    
    if not lang_text:
        return []
    
    languages = []
    lines = [l.strip() for l in lang_text.split('\n') if l.strip()]
    
    for line in lines:
        clean = re.sub(r'^[•\-–—*]\s*', '', line)
        if clean:
            languages.append(clean)
    
    return languages


def _parse_date_range(date_str: str) -> Tuple[Optional[str], Optional[str]]:
    """Parsuje zakres dat."""
    if not date_str:
        return None, None
    
    # Wzorce zakresów
    patterns = [
        r'(\d{4}[-–—]\d{2})\s*[-–—]\s*(\d{4}[-–—]\d{2})',
        r'(\d{4}[-–—]\d{2})\s*[-–—]\s*(obecnie|present|current|dziś)',
        r'(\d{4})\s*[-–—]\s*(\d{4})',
        r'(\d{4})\s*[-–—]\s*(obecnie|present|current|dziś)',
    ]
    
    for pattern in patterns:
        match = re.match(pattern, date_str, re.IGNORECASE)
        if match:
            start = match.group(1)
            end = match.group(2)
            
            if end.lower() in ['obecnie', 'present', 'current', 'dziś']:
                end = 'obecnie'
            
            return start, end
    
    # Pojedyncza data
    if re.match(r'\d{4}[-–—]\d{2}', date_str):
        return date_str, None
    
    if re.match(r'\d{4}', date_str):
        return date_str, None
    
    return None, None