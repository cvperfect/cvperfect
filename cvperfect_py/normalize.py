"""
Moduł normalizacji tekstu CV
Deterministyczne czyszczenie bez zmiany faktów
"""

import re
from typing import List, Tuple
import logging

logger = logging.getLogger(__name__)

def normalize_text(text: str) -> str:
    """
    Normalizuje tekst CV - czyszczenie bez zmiany faktów.
    
    Args:
        text: Surowy tekst CV
        
    Returns:
        Znormalizowany tekst
    """
    if not text:
        return ""
    
    # Zachowaj oryginał dla debugowania
    original_length = len(text)
    
    # 1. Unifikuj końce linii
    text = text.replace('\r\n', '\n').replace('\r', '\n')
    
    # 2. Usuń nadmiarowe białe znaki zachowując strukturę
    text = _normalize_whitespace(text)
    
    # 3. Unifikuj myślniki i bullets
    text = _normalize_bullets(text)
    
    # 4. Normalizuj daty
    text = _normalize_dates(text)
    
    # 5. Usuń dziwne znaki Unicode (ale zachowaj polskie znaki)
    text = _clean_unicode(text)
    
    # 6. Napraw wielokrotne puste linie
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    # 7. Usuń trailing/leading whitespace
    lines = [line.strip() for line in text.split('\n')]
    text = '\n'.join(lines)
    
    logger.debug(f"Normalized text: {original_length} -> {len(text)} chars")
    
    return text


def _normalize_whitespace(text: str) -> str:
    """Normalizuje białe znaki zachowując strukturę."""
    # Zamień tabulacje na spacje
    text = text.replace('\t', '    ')
    
    # Usuń wielokrotne spacje (ale zachowaj single)
    text = re.sub(r'[ ]{2,}', ' ', text)
    
    # Usuń spacje przed końcem linii
    text = re.sub(r' +\n', '\n', text)
    
    return text


def _normalize_bullets(text: str) -> str:
    """Unifikuje różne style punktów."""
    bullet_patterns = [
        (r'^[-–—∙·•◦▪▫★☆→⇒»]+\s*', '• '),  # Różne bullets na początku linii
        (r'^[*]\s+', '• '),                   # Gwiazdka
        (r'^\d+[.)]\s*', '• '),               # Numerowane (1. lub 1))
        (r'^[a-z][.)]\s*', '• '),             # Literowane (a. lub a))
    ]
    
    lines = text.split('\n')
    normalized_lines = []
    
    for line in lines:
        stripped = line.strip()
        if stripped:
            for pattern, replacement in bullet_patterns:
                if re.match(pattern, stripped, re.IGNORECASE):
                    stripped = re.sub(pattern, replacement, stripped, flags=re.IGNORECASE)
                    break
        normalized_lines.append(stripped)
    
    return '\n'.join(normalized_lines)


def _normalize_dates(text: str) -> str:
    """Normalizuje formaty dat do YYYY-MM."""
    # Popularne formaty dat do unifikacji
    date_patterns = [
        # MM/YYYY -> YYYY-MM
        (r'\b(\d{1,2})/(\d{4})\b', lambda m: f"{m.group(2)}-{m.group(1).zfill(2)}"),
        # MM.YYYY -> YYYY-MM
        (r'\b(\d{1,2})\.(\d{4})\b', lambda m: f"{m.group(2)}-{m.group(1).zfill(2)}"),
        # YYYY/MM -> YYYY-MM
        (r'\b(\d{4})/(\d{1,2})\b', lambda m: f"{m.group(1)}-{m.group(2).zfill(2)}"),
        # Skróty miesięcy PL
        (r'\b(sty|lut|mar|kwi|maj|cze|lip|sie|wrz|paź|lis|gru)\.?\s+(\d{4})\b', _convert_polish_month),
        # Pełne nazwy miesięcy PL
        (r'\b(styczeń|luty|marzec|kwiecień|maj|czerwiec|lipiec|sierpień|wrzesień|październik|listopad|grudzień)\s+(\d{4})\b', _convert_polish_month_full),
    ]
    
    for pattern, replacement in date_patterns:
        text = re.sub(pattern, replacement, text, flags=re.IGNORECASE)
    
    # Normalizuj zakresy dat (YYYY-MM - YYYY-MM) -> (YYYY-MM – YYYY-MM)
    text = re.sub(r'(\d{4}-\d{2})\s*[-–—]\s*(\d{4}-\d{2})', r'\1 – \2', text)
    text = re.sub(r'(\d{4}-\d{2})\s*[-–—]\s*(obecnie|dziś|today|present)', r'\1 – obecnie', text, flags=re.IGNORECASE)
    
    return text


def _convert_polish_month(match) -> str:
    """Konwertuje skrót miesiąca PL na format YYYY-MM."""
    months = {
        'sty': '01', 'lut': '02', 'mar': '03', 'kwi': '04',
        'maj': '05', 'cze': '06', 'lip': '07', 'sie': '08',
        'wrz': '09', 'paź': '10', 'lis': '11', 'gru': '12'
    }
    month_abbr = match.group(1).lower()[:3]
    year = match.group(2)
    month_num = months.get(month_abbr, '01')
    return f"{year}-{month_num}"


def _convert_polish_month_full(match) -> str:
    """Konwertuje pełną nazwę miesiąca PL na format YYYY-MM."""
    months = {
        'styczeń': '01', 'luty': '02', 'marzec': '03', 'kwiecień': '04',
        'maj': '05', 'czerwiec': '06', 'lipiec': '07', 'sierpień': '08',
        'wrzesień': '09', 'październik': '10', 'listopad': '11', 'grudzień': '12'
    }
    month_name = match.group(1).lower()
    year = match.group(2)
    month_num = months.get(month_name, '01')
    return f"{year}-{month_num}"


def _clean_unicode(text: str) -> str:
    """Czyści dziwne znaki Unicode zachowując polskie znaki."""
    # Zachowaj polskie znaki
    polish_chars = 'ąćęłńóśźżĄĆĘŁŃÓŚŹŻ'
    
    # Zamień dziwne spacje na normalne
    text = re.sub(r'[\xa0\u00a0\u2000-\u200a\u202f\u205f\u3000]', ' ', text)
    
    # Usuń znaki kontrolne (ale zachowaj \n \t)
    text = ''.join(char for char in text 
                   if char in '\n\t ' or char.isprintable() or char in polish_chars)
    
    return text


def split_into_lines(text: str) -> List[str]:
    """
    Dzieli tekst na linie (pomocnicze dla innych modułów).
    
    Returns:
        Lista niepustych linii
    """
    lines = text.split('\n')
    return [line.strip() for line in lines if line.strip()]