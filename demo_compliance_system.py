#!/usr/bin/env python3
"""
Demonstracja systemu Compliance Guard
Pokazuje jak system zapobiega halucynacjom w CVPerfect
"""

import sys
from pathlib import Path

# Add the cvperfect_py to path
sys.path.insert(0, str(Path(__file__).parent))

from cvperfect_py.compliance import ComplianceGuard, sanitize_html_content
from cvperfect_py.extract import CVSections, Experience, Education

def demo_valid_transformations():
    """Demonstracja prawidłowych transformacji"""
    print("=" * 60)
    print("🟢 DEMO: Prawidłowe transformacje (dozwolone)")
    print("=" * 60)
    
    guard = ComplianceGuard(lexicon_path="cvperfect_py/lexicon")
    
    original_cv = """
    Michał Kowalski
    michal@email.com
    +48 123 456 789
    
    DOŚWIADCZENIE
    Kurier w DPD
    2021-2023
    - roznosiłem paczki
    - byłem punktualny
    
    UMIEJĘTNOŚCI
    Prawo jazdy kat B
    Dobra kondycja
    """
    
    # Prawidłowe sekcje z dozwolonymi transformacjami
    valid_sections = CVSections(
        contact={'email': 'michal@email.com', 'phone': '+48 123 456 789', 'name': 'Michał Kowalski'},
        summary=None,
        experience=[
            Experience(
                role='Kurier / Specjalista ds. dostaw ostatniej mili',  # ✅ Dozwolona transformacja z lexicon
                company='DPD',  # ✅ Bez zmian
                date_start='2021',
                date_end='2023', 
                bullets=[
                    'Realizowałem terminowe dostawy do klientów na wyznaczonych trasach, dbając o standardy obsługi i bezpieczeństwo przesyłek',  # ✅ Transformacja z lexicon
                    'Zapewniałem terminowość i rzetelność w realizacji zadań'  # ✅ Transformacja z lexicon
                ]
            )
        ],
        education=[],
        skills=['Prawo jazdy kategorii B (czynne)', 'Kondycja fizyczna umożliwiająca pracę w wymagającym środowisku'],  # ✅ Profesjonalizacja
        projects=[],
        certificates=[],
        interests=[],
        languages=[],
        raw_sections={}
    )
    
    result = guard.validate_no_new_facts(original_cv, valid_sections)
    
    print(f"Status: {'✅ COMPLIANT' if result.is_compliant else '❌ NON-COMPLIANT'}")
    print(f"Warning Score: {result.warning_score:.2f}")
    print(f"Confidence: {result.confidence:.2f}")
    print(f"Summary: {result.summary}")
    print(f"Violations: {len(result.violations)}")
    
    if result.violations:
        print("\nViolations:")
        for v in result.violations:
            print(f"  - {v.type}: {v.processed} (severity: {v.severity})")

def demo_hallucinations():
    """Demonstracja wykrywania halucynacji"""
    print("\n" + "=" * 60)
    print("🔴 DEMO: Wykrywanie halucynacji (zakazane)")
    print("=" * 60)
    
    guard = ComplianceGuard(lexicon_path="cvperfect_py/lexicon")
    
    original_cv = """
    Anna Nowak
    anna@email.com
    
    Sprzedawca w Biedronka
    2020-2022
    """
    
    # Sekcje z halucynacjami - próba nadmuchania doświadczenia
    hallucinated_sections = CVSections(
        contact={'email': 'anna@email.com', 'name': 'Anna Nowak'},
        summary="Experienced retail professional with expertise in customer relationship management",  # ❌ HALUCYNACJA
        experience=[
            Experience(
                role='Senior Full-Stack Developer',  # ❌ HALUCYNACJA - forbidden phrase
                company='Google',  # ❌ HALUCYNACJA - nie ma w oryginalnym CV
                date_start='2020',
                date_end='2022',
                bullets=[
                    'Led team of 10 developers',  # ❌ HALUCYNACJA
                    'Increased revenue by 300%',  # ❌ HALUCYNACJA - metrics not in original
                    'Architected microservices infrastructure'  # ❌ HALUCYNACJA
                ]
            )
        ],
        education=[
            Education(
                degree='PhD in Computer Science',  # ❌ HALUCYNACJA
                institution='MIT',  # ❌ HALUCYNACJA
                date='2015',
                field='Machine Learning'
            )
        ],
        skills=['Python', 'React', 'AWS', 'Machine Learning', 'Team Leadership'],  # ❌ HALUCYNACJE
        projects=[],
        certificates=['AWS Certified Solutions Architect'],  # ❌ HALUCYNACJA - forbidden
        interests=[],
        languages=[],
        raw_sections={}
    )
    
    result = guard.validate_no_new_facts(original_cv, hallucinated_sections)
    
    print(f"Status: {'✅ COMPLIANT' if result.is_compliant else '❌ NON-COMPLIANT'}")
    print(f"Warning Score: {result.warning_score:.2f}")
    print(f"Confidence: {result.confidence:.2f}")
    print(f"Summary: {result.summary}")
    print(f"Violations: {len(result.violations)}")
    
    if result.violations:
        print("\nDetected Violations:")
        for i, v in enumerate(result.violations[:10], 1):  # Show first 10
            print(f"  {i}. {v.type}: '{v.processed}' (severity: {v.severity}, confidence: {v.confidence:.2f})")
        
        if len(result.violations) > 10:
            print(f"  ... and {len(result.violations) - 10} more violations")
    
    print("\nRecommendations:")
    for rec in result.recommendations:
        print(f"  💡 {rec}")

def demo_security_sanitization():
    """Demonstracja sanityzacji HTML (security)"""
    print("\n" + "=" * 60)
    print("🛡️ DEMO: Sanityzacja HTML (Security)")
    print("=" * 60)
    
    malicious_content = """
    <script>alert('XSS Attack!');</script>
    <p onclick="maliciousFunction()">Seemingly safe content</p>
    <strong>This should be preserved</strong>
    <iframe src="javascript:alert('hack')"></iframe>
    """
    
    print("Original content:")
    print(malicious_content)
    print("\nSanitized content:")
    
    sanitized = sanitize_html_content(malicious_content)
    print(sanitized)
    
    print(f"\n✅ XSS Prevention: {'PASSED' if '<script>' not in sanitized else 'FAILED'}")
    print(f"✅ Dangerous Attributes: {'REMOVED' if 'onclick' not in sanitized else 'FAILED'}")
    print(f"✅ Safe Content: {'PRESERVED' if 'This should be preserved' in sanitized else 'FAILED'}")

def demo_real_world_scenarios():
    """Demonstracja rzeczywistych scenariuszy"""
    print("\n" + "=" * 60)  
    print("🌍 DEMO: Rzeczywiste scenariusze")
    print("=" * 60)
    
    guard = ComplianceGuard(lexicon_path="cvperfect_py/lexicon")
    
    scenarios = [
        {
            "name": "Magazynier -> Specjalista logistyki",
            "original": "Magazynier w ABC. Układałem towary.",
            "transformation": "kurier -> Kurier / Specjalista ds. dostaw ostatniej mili",
            "expected": "✅ VALID"
        },
        {
            "name": "Sprzedawca -> Senior Sales Manager",  
            "original": "Sprzedawca w sklepie",
            "transformation": "sprzedawca -> Senior Sales Manager", 
            "expected": "❌ INVALID (forbidden inflation)"
        },
        {
            "name": "DHL -> DHL Express",
            "original": "Kurier w DHL",
            "transformation": "DHL -> DHL Express",
            "expected": "✅ VALID (company extension)"
        },
        {
            "name": "Brak doświadczenia -> Google Engineer",
            "original": "Student informatyki",
            "transformation": "Student -> Google Software Engineer",
            "expected": "❌ INVALID (company hallucination)"
        }
    ]
    
    for scenario in scenarios:
        print(f"\n📋 Scenario: {scenario['name']}")
        print(f"   Original: {scenario['original']}")
        print(f"   Transform: {scenario['transformation']}")
        print(f"   Expected: {scenario['expected']}")

def demo_compliance_integration():
    """Demonstracja integracji z systemem ekstrakcji"""
    print("\n" + "=" * 60)
    print("🔗 DEMO: Integracja z systemem ekstrakcji")
    print("=" * 60)
    
    from cvperfect_py.extract import extract_sections
    
    sample_cv = """
    Robert Kowalski
    robert@test.pl
    +48 555 123 456
    
    DOŚWIADCZENIE ZAWODOWE
    Sprzedawca w Żabka Sp. z o.o.
    2021-2023
    - obsługiwałem klientów
    - odpowiadałem za kasę
    - układałem towar na półkach
    
    WYKSZTAŁCENIE
    Technik informatyk
    ZST Nr 1 w Warszawie
    2017-2021
    
    UMIEJĘTNOŚCI
    Obsługa kasy fiskalnej
    Praca w zespole
    Komunikatywność
    """
    
    print("Przetwarzanie CV przez system ekstrakcji z compliance guard...")
    sections = extract_sections(sample_cv)
    
    print(f"\nWyekstraktowane sekcje:")
    print(f"Kontakt: {sections.contact}")
    print(f"Doświadczenie: {len(sections.experience)} pozycji")
    print(f"Umiejętności: {len(sections.skills)} elementów")
    
    if sections.experience:
        exp = sections.experience[0]
        print(f"Pierwsze doświadczenie: {exp.role} w {exp.company}")

def main():
    """Uruchom wszystkie demonstracje"""
    print("🚀 CVPerfect Compliance Guard System Demo")
    print("System zapobiegania halucynacjom w optymalizacji CV")
    
    try:
        demo_valid_transformations()
        demo_hallucinations() 
        demo_security_sanitization()
        demo_real_world_scenarios()
        demo_compliance_integration()
        
        print("\n" + "=" * 60)
        print("✅ Demo completed successfully!")
        print("🛡️ Compliance Guard System is operational")
        print("📝 Run: python -m pytest tests/test_compliance.py -v")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ Demo failed: {e}")
        print("Check that all dependencies are installed:")
        print("pip install Levenshtein")

if __name__ == "__main__":
    main()