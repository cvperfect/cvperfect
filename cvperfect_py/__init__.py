"""
CVPerfect Python - Deterministyczne narzędzie do optymalizacji CV
Profesjonalna analiza i optymalizacja bez halucynacji
"""

__version__ = "1.0.0"
__author__ = "CVPerfect Team"

from .io_load import load_cv
from .extract import extract_sections
from .ats_score import calculate_ats_score

__all__ = [
    'load_cv',
    'extract_sections',
    'calculate_ats_score'
]