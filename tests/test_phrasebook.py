"""
Test suite for Professional Phrasebook
Weryfikacja deterministycznych transformacji jzyka HR
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

import unittest
from cvperfect_py.phrasebook import ProfessionalPhrasebook, elevate_role, improve_bullet, transform_text


class TestProfessionalPhrasebook(unittest.TestCase):
    """Test cases for ProfessionalPhrasebook class"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.phrasebook = ProfessionalPhrasebook()
    
    def test_role_elevation_basic(self):
        """Test basic role elevation transformations"""
        test_cases = [
            ("kurier", "Kurier / Specjalista ds. dostaw ostatniej mili"),
            ("magazynier", "Magazynier / Specjalista ds. logistyki magazynowej"),
            ("kasjer", "Kasjer / Specjalista ds. obsBugi klienta i rozliczeD"),
            ("sprztacz", "Pracownik sBu|b porzdkowych"),
            ("kelner", "Pracownik obsBugi gastronomicznej"),
            ("ochroniarz", "Specjalista ds. bezpieczeDstwa i ochrony"),
            ("pracownik sklepu", "Doradca handlowy"),
            ("recepcjonista", "Specjalista ds. obsBugi klienta i recepcji"),
        ]
        
        for casual_role, expected_professional in test_cases:
            with self.subTest(role=casual_role):
                result = self.phrasebook.elevate_job_title(casual_role)
                self.assertEqual(result, expected_professional)
    
    def test_role_elevation_case_insensitive(self):
        """Test that role elevation works with different cases"""
        test_cases = [
            ("KURIER", "Kurier / Specjalista ds. dostaw ostatniej mili"),
            ("Magazynier", "Magazynier / Specjalista ds. logistyki magazynowej"),
            ("kasJER", "Kasjer / Specjalista ds. obsBugi klienta i rozliczeD"),
        ]
        
        for casual_role, expected_professional in test_cases:
            with self.subTest(role=casual_role):
                result = self.phrasebook.elevate_job_title(casual_role)
                self.assertEqual(result, expected_professional)
    
    def test_role_elevation_no_match(self):
        """Test that unknown roles are returned unchanged"""
        unknown_roles = ["Developer", "Manager", "CEO", "Dyrektor"]
        
        for role in unknown_roles:
            with self.subTest(role=role):
                result = self.phrasebook.elevate_job_title(role)
                self.assertEqual(result, role)
    
    def test_bullet_point_improvement_basic(self):
        """Test basic bullet point improvements"""
        test_cases = [
            ("RoznosiBem paczki", "realizowaBem"),
            ("PakowaBem towary", "odpowiadaBem"),
            ("ObsBugiwaBem kas", "prowadziBem"),
            ("SprztaBem", "utrzymywaBem"),
            ("PomagaBem", "wspieraBem"),
            ("ZajmowaBem si", "prowadziBem"),
        ]
        
        for casual_bullet, expected_verb in test_cases:
            with self.subTest(bullet=casual_bullet):
                result = self.phrasebook.improve_bullet_point(casual_bullet)
                self.assertNotEqual(result, casual_bullet)
                self.assertIn(expected_verb, result.lower())
    
    def test_convenience_functions(self):
        """Test convenience functions for direct use"""
        # Test elevate_role function
        role_result = elevate_role("kurier")
        self.assertEqual(role_result, "Kurier / Specjalista ds. dostaw ostatniej mili")
        
        # Test improve_bullet function  
        bullet_result = improve_bullet("RoznosiBem paczki")
        self.assertNotEqual(bullet_result, "RoznosiBem paczki")
        self.assertIn("realizowaBem", bullet_result.lower())


if __name__ == '__main__':
    # Print header
    print("=" * 60)
    print("PHRASEBOOK PROFESSIONAL TRANSFORMATIONS - TESTS")
    print("=" * 60)
    
    # Run tests with verbose output
    unittest.main(verbosity=2)