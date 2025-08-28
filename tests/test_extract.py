"""
Test cases for CV extraction functionality
"""

import unittest
import sys
from pathlib import Path

# Add the parent directory to the path so we can import cvperfect_py
sys.path.insert(0, str(Path(__file__).parent.parent))

from cvperfect_py.extract import CVExtractor


class TestCVExtractor(unittest.TestCase):
    """Test cases for CVExtractor class"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.extractor = CVExtractor()
        
        # Sample CV content for testing
        self.sample_cv = """John Smith
Software Engineer

john.smith@email.com
(555) 123-4567

PROFESSIONAL SUMMARY
Experienced software engineer with 5+ years developing applications.

EXPERIENCE
Senior Developer, Tech Corp
01/2021 - Present
" Developed web applications using React
" Improved performance by 40%
" Led team of 3 developers

Junior Developer, StartupXYZ  
06/2019 - 12/2020
" Built mobile apps with React Native
" Reduced loading time by 25%

EDUCATION
Bachelor of Science in Computer Science
State University
Graduated: 05/2018
GPA: 3.7

SKILLS
Python, JavaScript, React, Node.js, Docker
"""
        
    def test_extract_contact_info(self):
        """Test contact information extraction"""
        result = self.extractor.extract(self.sample_cv)
        
        self.assertTrue(result['success'])
        contact_info = result['contact_info']
        
        self.assertIn('email', contact_info)
        self.assertEqual(contact_info['email'], 'john.smith@email.com')
        
        self.assertIn('phone', contact_info)
        self.assertIn('555', contact_info['phone'])
        
        self.assertIn('name', contact_info)
        self.assertEqual(contact_info['name'], 'John Smith')
        
    def test_extract_sections(self):
        """Test section extraction"""
        result = self.extractor.extract(self.sample_cv)
        
        self.assertTrue(result['success'])
        sections = result['sections']
        
        # Should identify common sections
        self.assertIn('experience', sections)
        self.assertIn('education', sections)
        self.assertIn('skills', sections)
        
        # Experience section should contain job information
        self.assertIn('Tech Corp', sections['experience'])
        self.assertIn('React', sections['experience'])
        
    def test_extract_experiences(self):
        """Test experience extraction"""
        result = self.extractor.extract(self.sample_cv)
        
        self.assertTrue(result['success'])
        experiences = result['experiences']
        
        self.assertGreater(len(experiences), 0)
        
        # Check first experience entry
        first_exp = experiences[0]
        self.assertIn('position', first_exp)
        self.assertIn('company', first_exp)
        self.assertIn('responsibilities', first_exp)
        self.assertIn('achievements', first_exp)
        
        # Should categorize achievements vs responsibilities
        self.assertGreater(len(first_exp['achievements']), 0)
        
    def test_extract_education(self):
        """Test education extraction"""
        result = self.extractor.extract(self.sample_cv)
        
        self.assertTrue(result['success'])
        education = result['education']
        
        self.assertGreater(len(education), 0)
        
        # Check education entry
        first_edu = education[0]
        self.assertIn('degree', first_edu)
        self.assertIn('institution', first_edu)
        self.assertIn('gpa', first_edu)
        
    def test_extract_skills(self):
        """Test skills extraction"""
        result = self.extractor.extract(self.sample_cv)
        
        self.assertTrue(result['success'])
        skills = result['skills']
        
        self.assertGreater(len(skills), 0)
        
        # Should extract common programming skills
        skill_text = ' '.join(skills).lower()
        self.assertIn('python', skill_text)
        self.assertIn('javascript', skill_text)
        
    def test_empty_content(self):
        """Test handling of empty content"""
        result = self.extractor.extract("")
        
        self.assertFalse(result['success'])
        self.assertIn('error', result)
        
    def test_minimal_content(self):
        """Test handling of minimal content"""
        minimal_cv = "John Doe\njohn@email.com"
        result = self.extractor.extract(minimal_cv)
        
        self.assertTrue(result['success'])
        self.assertIn('name', result['contact_info'])
        self.assertIn('email', result['contact_info'])


class TestContactInfoExtraction(unittest.TestCase):
    """Test specific contact information extraction patterns"""
    
    def setUp(self):
        self.extractor = CVExtractor()
        
    def test_email_extraction(self):
        """Test email pattern extraction"""
        content = "Contact me at john.doe@company.com for more info"
        result = self.extractor.extract(content)
        
        contact_info = result['contact_info']
        self.assertEqual(contact_info['email'], 'john.doe@company.com')
        
    def test_phone_extraction(self):
        """Test phone number pattern extraction"""
        test_cases = [
            "Phone: (555) 123-4567",
            "Call me at 555-123-4567",
            "Mobile: 555.123.4567"
        ]
        
        for content in test_cases:
            result = self.extractor.extract(f"John Smith\n{content}")
            contact_info = result['contact_info']
            self.assertIn('phone', contact_info)
            self.assertIn('555', contact_info['phone'])
            
    def test_linkedin_extraction(self):
        """Test LinkedIn URL extraction"""
        content = "LinkedIn: linkedin.com/in/johnsmith"
        result = self.extractor.extract(f"John Smith\n{content}")
        
        contact_info = result['contact_info']
        self.assertIn('linkedin', contact_info)
        self.assertIn('johnsmith', contact_info['linkedin'])


if __name__ == '__main__':
    unittest.main()