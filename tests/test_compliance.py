"""
Test cases for Compliance Guard System
Ensures ZERO hallucinations and fact preservation
"""

import unittest
import sys
from pathlib import Path
from dataclasses import dataclass

# Add the parent directory to the path so we can import cvperfect_py
sys.path.insert(0, str(Path(__file__).parent.parent))

from cvperfect_py.compliance import ComplianceGuard, ViolationWarning, ComplianceResult, sanitize_html_content
from cvperfect_py.extract import CVSections, Experience, Education

class TestComplianceGuard(unittest.TestCase):
    """Test cases for main Compliance Guard functionality"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.guard = ComplianceGuard(lexicon_path="cvperfect_py/lexicon")
        
        # Sample original CV text
        self.original_cv = """Jan Kowalski
jan.kowalski@email.com
+48 123 456 789

DOŚWIADCZENIE
Kurier w DHL
2020-2022
- roznosiłem paczki
- odpowiadałem za terminowe dostawy

Magazynier w ABC Logistics
2018-2020
- pakowałem towary
- układałem towar

UMIEJĘTNOŚCI
Prawo jazdy kat B
Obsługa wózka widłowego
"""
        
        # Valid transformed sections (allowed transformations)
        self.valid_sections = CVSections(
            contact={'email': 'jan.kowalski@email.com', 'phone': '+48 123 456 789', 'name': 'Jan Kowalski'},
            summary=None,
            experience=[
                Experience(
                    role='Kurier / Specjalista ds. dostaw ostatniej mili',
                    company='DHL',
                    date_start='2020',
                    date_end='2022',
                    bullets=['Realizowałem terminowe dostawy do klientów na wyznaczonych trasach, dbając o standardy obsługi i bezpieczeństwo przesyłek']
                ),
                Experience(
                    role='Magazynier / Specjalista ds. logistyki magazynowej',
                    company='ABC Logistics',
                    date_start='2018',
                    date_end='2020',
                    bullets=['Realizowałem procesy pakowania zgodnie ze standardami', 'Organizowałem ekspozycję produktów zgodnie z planogramami']
                )
            ],
            education=[],
            skills=['Prawo jazdy kategorii B (czynne)', 'Obsługa wózka widłowego'],
            projects=[],
            certificates=[],
            interests=[],
            languages=[],
            raw_sections={}
        )
        
        # Invalid sections with hallucinations
        self.invalid_sections = CVSections(
            contact={'email': 'jan.kowalski@email.com', 'phone': '+48 123 456 789', 'name': 'Jan Kowalski'},
            summary=None,
            experience=[
                Experience(
                    role='Senior Full-Stack Developer',  # FORBIDDEN - not in original
                    company='Google',  # FORBIDDEN - not in original
                    date_start='2020',
                    date_end='2022',
                    bullets=['Developed microservices architecture', 'Led team of 5 developers']  # Not in original
                )
            ],
            education=[
                Education(
                    degree='PhD in Computer Science',  # FORBIDDEN - not in original
                    institution='MIT',  # FORBIDDEN - not in original
                    date='2018',
                    field='Machine Learning'
                )
            ],
            skills=['Python', 'React', 'AWS', 'Machine Learning'],  # Some not in original
            projects=[],
            certificates=['AWS Certified Solutions Architect'],  # FORBIDDEN
            interests=[],
            languages=[],
            raw_sections={}
        )

    def test_valid_transformations_pass(self):
        """Test that valid transformations pass compliance"""
        result = self.guard.validate_no_new_facts(self.original_cv, self.valid_sections)
        
        self.assertTrue(result.is_compliant, f"Valid transformations should pass. Summary: {result.summary}")
        self.assertLess(result.warning_score, 0.3, "Warning score should be low for valid transformations")
        self.assertGreater(result.confidence, 0.7, "Confidence should be high for valid transformations")

    def test_hallucinations_detected(self):
        """Test that hallucinations are properly detected"""
        result = self.guard.validate_no_new_facts(self.original_cv, self.invalid_sections)
        
        self.assertFalse(result.is_compliant, "Hallucinations should fail compliance")
        self.assertGreater(len(result.violations), 0, "Should detect multiple violations")
        
        # Check specific violation types
        violation_types = {v.type for v in result.violations}
        self.assertIn('company_added', violation_types, "Should detect added company (Google)")
        self.assertIn('forbidden_phrase', violation_types, "Should detect forbidden phrases")

    def test_contact_integrity(self):
        """Test contact information integrity validation"""
        original_contact = {'email': 'jan@example.com', 'phone': '+48 123'}
        
        # Test email change - CRITICAL violation
        changed_contact = {'email': 'different@example.com', 'phone': '+48 123'}
        violations = self.guard.validate_contact_integrity(original_contact, changed_contact)
        
        self.assertGreater(len(violations), 0, "Should detect email change")
        self.assertEqual(violations[0].type, 'contact_changed')
        self.assertEqual(violations[0].severity, 'critical')

    def test_experience_integrity(self):
        """Test experience integrity validation"""
        # Create experiences with new company not in original
        experiences = [
            Experience(
                role='Developer',
                company='New Company Not In Original',  # This should be flagged
                date_start='2020',
                date_end='2022',
                bullets=[]
            )
        ]
        
        violations = self.guard.validate_experience_integrity(self.original_cv, experiences)
        
        self.assertGreater(len(violations), 0, "Should detect new company")
        self.assertEqual(violations[0].type, 'company_added')

    def test_forbidden_phrases_detection(self):
        """Test detection of forbidden phrases"""
        # Create sections with forbidden phrases
        sections_with_forbidden = CVSections(
            contact={},
            summary=None,
            experience=[
                Experience(
                    role='Senior Full-Stack Developer',  # FORBIDDEN
                    company='Google',  # FORBIDDEN
                    date_start='2020',
                    date_end='2022',
                    bullets=[]
                )
            ],
            education=[],
            skills=['AWS Certified Solutions Architect'],  # FORBIDDEN
            projects=[],
            certificates=[],
            interests=[],
            languages=[],
            raw_sections={}
        )
        
        violations = self.guard._check_forbidden_phrases(sections_with_forbidden)
        
        self.assertGreater(len(violations), 0, "Should detect forbidden phrases")
        forbidden_phrases_found = [v.processed for v in violations if v.type == 'forbidden_phrase']
        self.assertTrue(any('Senior Full-Stack Developer' in phrase for phrase in forbidden_phrases_found))

    def test_fact_preservation(self):
        """Test fact preservation between original and processed text"""
        original = "Pracowałem jako kurier w DHL przez 2 lata"
        
        # Valid transformation
        valid_processed = "Realizowałem funkcje kuriera / specjalisty ds. dostaw w DHL przez 2 lata"
        violations_valid = self.guard.check_fact_preservation(original, valid_processed)
        self.assertEqual(len(violations_valid), 0, "Valid transformation should not create violations")
        
        # Invalid transformation with new facts
        invalid_processed = "Pracowałem jako Senior Developer w Google przez 5 lat"
        violations_invalid = self.guard.check_fact_preservation(original, invalid_processed)
        self.assertGreater(len(violations_invalid), 0, "Invalid transformation should create violations")

    def test_role_alias_transformations(self):
        """Test that role alias transformations are allowed"""
        # This should be allowed: kurier -> Kurier / Specjalista ds. dostaw ostatniej mili
        original_text = "Pracowałem jako kurier w DHL"
        processed_text = "Pracowałem jako Kurier / Specjalista ds. dostaw ostatniej mili w DHL"
        
        is_allowed = self.guard._is_allowed_transformation(processed_text, original_text)
        self.assertTrue(is_allowed, "Role alias transformations should be allowed")

    def test_company_transformation_detection(self):
        """Test detection of company name transformations vs new companies"""
        original_companies = {'DHL', 'ABC Logistics'}
        
        # Valid transformation (same company)
        self.assertTrue(
            self.guard._is_company_transformation('DHL Express', original_companies),
            "Company extensions should be recognized as transformations"
        )
        
        # Invalid new company
        self.assertFalse(
            self.guard._is_company_transformation('Google', original_companies),
            "Completely new companies should not be recognized as transformations"
        )

    def test_compliance_score_calculation(self):
        """Test compliance score calculation"""
        # No violations = perfect score
        empty_violations = []
        score = self.guard._calculate_warning_score(empty_violations)
        self.assertEqual(score, 0.0, "No violations should give perfect score")
        
        # Critical violations = high score
        critical_violations = [
            ViolationWarning('test', 'critical', '', 'test', 1.0),
            ViolationWarning('test', 'critical', '', 'test', 1.0)
        ]
        score = self.guard._calculate_warning_score(critical_violations)
        self.assertGreater(score, 0.8, "Critical violations should give high warning score")

class TestSanitization(unittest.TestCase):
    """Test HTML sanitization functionality"""
    
    def test_xss_prevention(self):
        """Test XSS attack prevention"""
        malicious_content = '<script>alert("XSS")</script><p>Good content</p>'
        sanitized = sanitize_html_content(malicious_content)
        
        self.assertNotIn('<script>', sanitized, "Script tags should be removed")
        self.assertNotIn('alert(', sanitized, "JavaScript should be removed")
        self.assertIn('Good content', sanitized, "Safe content should be preserved")

    def test_dangerous_attributes_removal(self):
        """Test removal of dangerous HTML attributes"""
        dangerous_html = '<div onclick="malicious()">Content</div>'
        sanitized = sanitize_html_content(dangerous_html)
        
        self.assertNotIn('onclick', sanitized, "Dangerous onclick should be removed")
        self.assertIn('Content', sanitized, "Safe content should be preserved")

    def test_allowed_tags_preservation(self):
        """Test that allowed HTML tags are preserved"""
        safe_html = '<p><strong>Bold text</strong> and <em>italic</em></p>'
        sanitized = sanitize_html_content(safe_html)
        
        # Check that content is escaped but structure hints remain
        self.assertIn('Bold text', sanitized, "Text content should be preserved")
        self.assertIn('italic', sanitized, "Text content should be preserved")

class TestEdgeCases(unittest.TestCase):
    """Test edge cases and error conditions"""
    
    def setUp(self):
        self.guard = ComplianceGuard(lexicon_path="cvperfect_py/lexicon")

    def test_empty_cv_handling(self):
        """Test handling of empty CV content"""
        empty_sections = CVSections(
            contact={}, summary=None, experience=[], education=[], 
            skills=[], projects=[], certificates=[], interests=[], 
            languages=[], raw_sections={}
        )
        
        result = self.guard.validate_no_new_facts("", empty_sections)
        self.assertTrue(result.is_compliant, "Empty CV should be compliant")

    def test_missing_lexicon_handling(self):
        """Test graceful handling of missing lexicon files"""
        # Create guard with non-existent path
        guard_no_lexicon = ComplianceGuard(lexicon_path="non_existent_path")
        
        # Should not crash, should use defaults
        self.assertIsInstance(guard_no_lexicon.forbidden_phrases, set)
        self.assertGreater(len(guard_no_lexicon.forbidden_phrases), 0, "Should have default forbidden phrases")

    def test_unicode_handling(self):
        """Test proper handling of Polish unicode characters"""
        polish_text = "Pracowałem w Żabka Sp. z o.o. jako specjalista ds. sprzedaży"
        facts = self.guard._extract_facts(polish_text)
        
        # Should handle Polish characters correctly
        self.assertGreater(len(facts['companies']), 0, "Should extract Polish company names")

class TestIntegration(unittest.TestCase):
    """Integration tests with real-world scenarios"""
    
    def setUp(self):
        self.guard = ComplianceGuard(lexicon_path="cvperfect_py/lexicon")

    def test_real_world_kurier_scenario(self):
        """Test real-world scenario: kurier CV optimization"""
        original = """
        Marek Nowak
        marek@email.com
        +48 987 654 321
        
        DOŚWIADCZENIE
        Kurier w DPD
        2021-2023
        - roznosiłem paczki po Warszawie
        - byłem punktualny
        
        UMIEJĘTNOŚCI  
        Prawo jazdy kat B
        Dobra kondycja fizyczna
        """
        
        # Valid optimization
        optimized_sections = CVSections(
            contact={'email': 'marek@email.com', 'phone': '+48 987 654 321', 'name': 'Marek Nowak'},
            summary=None,
            experience=[
                Experience(
                    role='Kurier / Specjalista ds. dostaw ostatniej mili',
                    company='DPD',
                    date_start='2021',
                    date_end='2023',
                    bullets=['Realizowałem terminowe dostawy do klientów na wyznaczonych trasach w Warszawie, dbając o standardy obsługi i bezpieczeństwo przesyłek', 'Zapewniałem terminowość i rzetelność w realizacji zadań']
                )
            ],
            education=[],
            skills=['Prawo jazdy kategorii B (czynne)', 'Kondycja fizyczna umożliwiająca pracę w wymagającym środowisku'],
            projects=[],
            certificates=[],
            interests=[],
            languages=[],
            raw_sections={}
        )
        
        result = self.guard.validate_no_new_facts(original, optimized_sections)
        
        self.assertTrue(result.is_compliant, f"Real-world kurier optimization should pass. Violations: {[v.processed for v in result.violations]}")
        self.assertLess(result.warning_score, 0.2, "Should have very low warning score for proper optimization")

    def test_hallucination_prevention_scenario(self):
        """Test prevention of common hallucination patterns"""
        simple_original = """
        Anna Kowal
        anna@email.com
        
        Sprzedawca w Biedronka
        2020-2022
        """
        
        # Hallucinated sections - trying to inflate experience
        hallucinated_sections = CVSections(
            contact={'email': 'anna@email.com', 'name': 'Anna Kowal'},
            summary="Experienced retail professional with expertise in customer relationship management and team leadership",  # HALLUCINATION
            experience=[
                Experience(
                    role='Senior Sales Associate & Team Lead',  # INFLATION
                    company='Jeronimo Martins (Biedronka)',  # OK - company group
                    date_start='2020',
                    date_end='2022',
                    bullets=[
                        'Managed a team of 8 sales associates',  # HALLUCINATION
                        'Increased store revenue by 25%',  # HALLUCINATION - no metrics in original
                        'Implemented new customer service protocols'  # HALLUCINATION
                    ]
                )
            ],
            education=[],
            skills=['Customer Service Excellence', 'Team Management', 'Sales Analytics'],  # HALLUCINATIONS
            projects=[],
            certificates=[],
            interests=[],
            languages=[],
            raw_sections={}
        )
        
        result = self.guard.validate_no_new_facts(simple_original, hallucinated_sections)
        
        self.assertFalse(result.is_compliant, "Hallucinated content should fail compliance")
        self.assertGreater(len(result.violations), 3, "Should detect multiple hallucinations")


if __name__ == '__main__':
    # Run tests with verbose output
    unittest.main(verbosity=2)