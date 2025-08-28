"""
Test cases for keyword extraction and matching functionality
"""

import unittest
import sys
from pathlib import Path

# Add the parent directory to the path so we can import cvperfect_py
sys.path.insert(0, str(Path(__file__).parent.parent))

from cvperfect_py.keywords import KeywordMatcher


class TestKeywordMatcher(unittest.TestCase):
    """Test cases for KeywordMatcher class"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.matcher = KeywordMatcher()
        
        # Sample CV content
        self.cv_content = """John Smith
Senior Software Developer

5+ years experience in Python, JavaScript, and React development.
Worked with Docker, AWS, and PostgreSQL databases.
Experience with Agile methodologies and Scrum processes.
Bachelor's degree in Computer Science.
AWS Certified Developer certification.
"""
        
        # Sample job posting
        self.job_posting = """We are looking for a Senior Python Developer with:
- 3+ years experience in Python development
- Experience with React and JavaScript
- Knowledge of AWS and Docker
- Familiar with Agile development
- Bachelor's degree preferred
- Experience with PostgreSQL or MySQL databases
- Knowledge of Redis caching
- Kubernetes experience is a plus
"""
    
    def test_extract_cv_keywords(self):
        """Test keyword extraction from CV"""
        result = self.matcher.analyze(self.cv_content)
        
        self.assertTrue(result['success'])
        keywords = result['cv_keywords']
        
        self.assertGreater(len(keywords), 0)
        
        # Should extract programming languages
        keywords_lower = [kw.lower() for kw in keywords]
        self.assertIn('python', keywords_lower)
        self.assertIn('javascript', keywords_lower)
        self.assertIn('react', keywords_lower)
        
        # Should extract technologies
        self.assertIn('docker', keywords_lower)
        self.assertIn('aws', keywords_lower)
        
    def test_extract_job_keywords(self):
        """Test keyword extraction from job posting"""
        result = self.matcher.analyze(self.cv_content, self.job_posting)
        
        self.assertTrue(result['success'])
        job_keywords = result['job_keywords']
        
        self.assertGreater(len(job_keywords), 0)
        
        # Should extract required skills
        keywords_lower = [kw.lower() for kw in job_keywords]
        self.assertIn('python', keywords_lower)
        self.assertIn('react', keywords_lower)
        self.assertIn('kubernetes', keywords_lower)
        
    def test_keyword_matching(self):
        """Test keyword matching between CV and job posting"""
        result = self.matcher.analyze(self.cv_content, self.job_posting)
        
        self.assertTrue(result['success'])
        
        # Should have matching analysis
        self.assertIn('matched_keywords', result)
        self.assertIn('missing_keywords', result)
        self.assertIn('match_percentage', result)
        
        matched = result['matched_keywords']
        missing = result['missing_keywords']
        match_percentage = result['match_percentage']
        
        # Should find some matches
        self.assertGreater(len(matched), 0)
        
        # Should identify some missing keywords
        self.assertGreater(len(missing), 0)
        
        # Match percentage should be reasonable
        self.assertGreaterEqual(match_percentage, 0)
        self.assertLessEqual(match_percentage, 100)
        
        # Should match common technologies
        matched_lower = [kw.lower() for kw in matched]
        self.assertIn('python', matched_lower)
        self.assertIn('react', matched_lower)
        
    def test_skill_categorization(self):
        """Test skill categorization"""
        result = self.matcher.analyze(self.cv_content)
        
        self.assertTrue(result['success'])
        categories = result['skill_categories']
        
        # Should have categorized skills
        self.assertGreater(len(categories), 0)
        
        # Should have programming languages category
        self.assertIn('programming_languages', categories)
        prog_langs = categories['programming_languages']
        prog_langs_lower = [skill.lower() for skill in prog_langs]
        self.assertIn('python', prog_langs_lower)
        
        # Should have cloud/devops category
        if 'cloud_devops' in categories:
            cloud_skills = categories['cloud_devops']
            cloud_skills_lower = [skill.lower() for skill in cloud_skills]
            self.assertIn('aws', cloud_skills_lower)
            
    def test_recommendations_generation(self):
        """Test recommendation generation"""
        result = self.matcher.analyze(self.cv_content, self.job_posting)
        
        self.assertTrue(result['success'])
        recommendations = result.get('recommendations', [])
        
        # Should generate some recommendations
        self.assertGreater(len(recommendations), 0)
        
        # Recommendations should be strings
        for rec in recommendations:
            self.assertIsInstance(rec, str)
            self.assertGreater(len(rec), 10)  # Should be meaningful
            
    def test_fuzzy_matching(self):
        """Test fuzzy matching if rapidfuzz is available"""
        # Test with slightly different terms
        cv_with_variations = """Software Engineer
Experience with Javascript and Postgres database.
Worked with Amazon Web Services cloud platform.
"""
        
        job_with_standard_terms = """Looking for developer with:
- JavaScript experience
- PostgreSQL database knowledge  
- AWS cloud experience
"""
        
        result = self.matcher.analyze(cv_with_variations, job_with_standard_terms)
        
        if 'fuzzy_matches' in result:
            fuzzy_matches = result['fuzzy_matches']
            # Should find fuzzy matches for similar terms
            if fuzzy_matches:
                self.assertIsInstance(fuzzy_matches, list)
                for match in fuzzy_matches:
                    self.assertIn('job_keyword', match)
                    self.assertIn('cv_keyword', match)
                    self.assertIn('similarity', match)
                    
    def test_empty_content(self):
        """Test handling of empty content"""
        result = self.matcher.analyze("")
        
        self.assertTrue(result['success'])  # Should succeed but with empty results
        self.assertEqual(len(result['cv_keywords']), 0)
        
    def test_experience_extraction(self):
        """Test years of experience extraction"""
        cv_with_experience = """Senior Developer with 8+ years experience.
5 years of Python development experience.
3+ years working with React."""
        
        result = self.matcher.analyze(cv_with_experience)
        keywords = result['cv_keywords']
        
        # Should extract experience patterns
        exp_keywords = [kw for kw in keywords if 'year' in kw.lower() and 'experience' in kw.lower()]
        self.assertGreater(len(exp_keywords), 0)
        
    def test_certification_extraction(self):
        """Test certification extraction"""
        cv_with_certs = """Certifications:
- AWS Certified Developer
- Google Cloud Professional
- Microsoft Azure Fundamentals
- Scrum Master Certified"""
        
        result = self.matcher.analyze(cv_with_certs)
        keywords = result['cv_keywords']
        
        # Should extract certifications
        cert_keywords = [kw for kw in keywords if 'certified' in kw.lower() or 'certification' in kw.lower()]
        self.assertGreater(len(cert_keywords), 0)
        
    def test_degree_extraction(self):
        """Test degree extraction"""
        cv_with_education = """Education:
Bachelor of Science in Computer Science
Master's degree in Software Engineering
PhD in Artificial Intelligence"""
        
        result = self.matcher.analyze(cv_with_education)
        keywords = result['cv_keywords']
        
        # Should extract degree information
        degree_keywords = [kw for kw in keywords if any(term in kw.lower() for term in ['bachelor', 'master', 'phd'])]
        self.assertGreater(len(degree_keywords), 0)


class TestKeywordExtraction(unittest.TestCase):
    """Test specific keyword extraction patterns"""
    
    def setUp(self):
        self.matcher = KeywordMatcher()
        
    def test_programming_language_extraction(self):
        """Test programming language identification"""
        content = "I have experience with Python, Java, C++, and JavaScript development."
        result = self.matcher.analyze(content)
        
        keywords_lower = [kw.lower() for kw in result['cv_keywords']]
        
        self.assertIn('python', keywords_lower)
        self.assertIn('java', keywords_lower)
        self.assertIn('c++', keywords_lower)
        self.assertIn('javascript', keywords_lower)
        
    def test_database_extraction(self):
        """Test database technology identification"""
        content = "Experience with MySQL, PostgreSQL, MongoDB, and Redis databases."
        result = self.matcher.analyze(content)
        
        keywords_lower = [kw.lower() for kw in result['cv_keywords']]
        
        self.assertIn('mysql', keywords_lower)
        self.assertIn('postgresql', keywords_lower)
        self.assertIn('mongodb', keywords_lower)
        self.assertIn('redis', keywords_lower)
        
    def test_framework_extraction(self):
        """Test framework identification"""
        content = "Built applications using React, Angular, Django, and Express frameworks."
        result = self.matcher.analyze(content)
        
        keywords_lower = [kw.lower() for kw in result['cv_keywords']]
        
        self.assertIn('react', keywords_lower)
        self.assertIn('angular', keywords_lower)
        self.assertIn('django', keywords_lower)
        self.assertIn('express', keywords_lower)


if __name__ == '__main__':
    unittest.main()