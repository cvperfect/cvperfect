"""
Test cases for CLI functionality
"""

import unittest
import tempfile
import sys
from pathlib import Path
from unittest.mock import patch, MagicMock
import json

# Add the parent directory to the path so we can import cvperfect_py
sys.path.insert(0, str(Path(__file__).parent.parent))

from cvperfect_py.cli import main_simple


class TestCLI(unittest.TestCase):
    """Test cases for CLI functionality"""
    
    def setUp(self):
        """Set up test fixtures"""
        # Create temporary test CV file
        self.test_cv_content = """John Smith
Software Engineer

john.smith@email.com
(555) 123-4567

Professional Summary
Experienced software engineer with 5+ years of Python and JavaScript development.

Experience
Senior Developer, Tech Corp
01/2021 - Present
" Developed web applications using React and Node.js
" Improved application performance by 40%

Education
Bachelor of Science in Computer Science
State University, 2018

Skills
Python, JavaScript, React, Node.js, Docker, AWS
"""
        
        # Create temporary job posting file
        self.test_job_content = """Senior Python Developer Position

Requirements:
- 3+ years Python development experience
- Experience with React and JavaScript
- Knowledge of AWS cloud services
- Docker containerization experience
- Bachelor's degree in Computer Science or related field
"""
        
    def test_main_simple_cv_only(self):
        """Test CLI with CV file only"""
        with tempfile.TemporaryDirectory() as temp_dir:
            # Create test CV file
            cv_file = Path(temp_dir) / "test_cv.txt"
            with open(cv_file, 'w') as f:
                f.write(self.test_cv_content)
                
            output_dir = Path(temp_dir) / "output"
            
            # Run CLI
            result = main_simple(str(cv_file), output_dir=str(output_dir))
            
            # Should succeed
            self.assertEqual(result, 0)
            
            # Check output files exist
            self.assertTrue((output_dir / "optimized_cv.html").exists())
            self.assertTrue((output_dir / "improvements.json").exists())
            self.assertTrue((output_dir / "report.json").exists())
            
            # Check HTML content
            with open(output_dir / "optimized_cv.html", 'r', encoding='utf-8') as f:
                html_content = f.read()
                self.assertIn("John Smith", html_content)
                self.assertIn("Software Engineer", html_content)
                self.assertIn("john.smith@email.com", html_content)
                
            # Check improvements file
            with open(output_dir / "improvements.json", 'r', encoding='utf-8') as f:
                improvements = json.load(f)
                self.assertIn('improvements', improvements)
                self.assertIn('total_improvements', improvements)
                self.assertIsInstance(improvements['improvements'], list)
                
            # Check report file
            with open(output_dir / "report.json", 'r', encoding='utf-8') as f:
                report = json.load(f)
                self.assertIn('cv_analysis', report)
                self.assertIn('metadata', report)
                
    def test_main_simple_cv_and_job(self):
        """Test CLI with both CV and job posting files"""
        with tempfile.TemporaryDirectory() as temp_dir:
            # Create test files
            cv_file = Path(temp_dir) / "test_cv.txt"
            job_file = Path(temp_dir) / "test_job.txt"
            
            with open(cv_file, 'w') as f:
                f.write(self.test_cv_content)
                
            with open(job_file, 'w') as f:
                f.write(self.test_job_content)
                
            output_dir = Path(temp_dir) / "output"
            
            # Run CLI
            result = main_simple(str(cv_file), str(job_file), str(output_dir))
            
            # Should succeed
            self.assertEqual(result, 0)
            
            # Check output files exist
            self.assertTrue((output_dir / "optimized_cv.html").exists())
            self.assertTrue((output_dir / "improvements.json").exists())
            self.assertTrue((output_dir / "report.json").exists())
            
            # Check report includes job matching analysis
            with open(output_dir / "report.json", 'r', encoding='utf-8') as f:
                report = json.load(f)
                self.assertIn('job_match_analysis', report)
                
                job_analysis = report['job_match_analysis']
                self.assertIn('match_percentage', job_analysis)
                self.assertIn('matched_keywords', job_analysis)
                self.assertIn('missing_keywords', job_analysis)
                self.assertIn('recommendations', job_analysis)
                
                # Match percentage should be reasonable
                match_percentage = job_analysis['match_percentage']
                self.assertGreaterEqual(match_percentage, 0)
                self.assertLessEqual(match_percentage, 100)
                
    def test_main_simple_nonexistent_cv_file(self):
        """Test CLI with nonexistent CV file"""
        with tempfile.TemporaryDirectory() as temp_dir:
            nonexistent_file = Path(temp_dir) / "nonexistent.txt"
            output_dir = Path(temp_dir) / "output"
            
            # Run CLI
            result = main_simple(str(nonexistent_file), output_dir=str(output_dir))
            
            # Should fail
            self.assertEqual(result, 1)
            
    def test_main_simple_invalid_cv_content(self):
        """Test CLI with invalid CV content"""
        with tempfile.TemporaryDirectory() as temp_dir:
            # Create nearly empty CV file
            cv_file = Path(temp_dir) / "empty_cv.txt"
            with open(cv_file, 'w') as f:
                f.write("x")  # Minimal content
                
            output_dir = Path(temp_dir) / "output"
            
            # Run CLI
            result = main_simple(str(cv_file), output_dir=str(output_dir))
            
            # Should still succeed (graceful handling)
            self.assertEqual(result, 0)
            
    def test_output_file_structure(self):
        """Test that output files have correct structure"""
        with tempfile.TemporaryDirectory() as temp_dir:
            # Create test CV file
            cv_file = Path(temp_dir) / "test_cv.txt"
            with open(cv_file, 'w') as f:
                f.write(self.test_cv_content)
                
            output_dir = Path(temp_dir) / "output"
            
            # Run CLI
            result = main_simple(str(cv_file), output_dir=str(output_dir))
            self.assertEqual(result, 0)
            
            # Check HTML file structure
            with open(output_dir / "optimized_cv.html", 'r', encoding='utf-8') as f:
                html_content = f.read()
                
                # Should have proper HTML structure
                self.assertIn('<!DOCTYPE html>', html_content)
                self.assertIn('<html', html_content)
                self.assertIn('<head>', html_content)
                self.assertIn('<body>', html_content)
                self.assertIn('<style>', html_content)
                
                # Should include contact information
                self.assertIn('john.smith@email.com', html_content)
                self.assertIn('555', html_content)
                
            # Check improvements file structure
            with open(output_dir / "improvements.json", 'r', encoding='utf-8') as f:
                improvements = json.load(f)
                
                required_keys = [
                    'improvements', 'normalization_changes', 'total_improvements',
                    'original_word_count', 'optimized_word_count'
                ]
                for key in required_keys:
                    self.assertIn(key, improvements)
                    
            # Check report file structure
            with open(output_dir / "report.json", 'r', encoding='utf-8') as f:
                report = json.load(f)
                
                # Should have CV analysis
                self.assertIn('cv_analysis', report)
                cv_analysis = report['cv_analysis']
                self.assertIn('total_keywords', cv_analysis)
                self.assertIn('skill_categories', cv_analysis)
                
                # Should have metadata
                self.assertIn('metadata', report)
                metadata = report['metadata']
                self.assertIn('cv_file', metadata)
                self.assertIn('processing_date', metadata)
                
    def test_different_output_directories(self):
        """Test CLI with different output directories"""
        with tempfile.TemporaryDirectory() as temp_dir:
            # Create test CV file
            cv_file = Path(temp_dir) / "test_cv.txt"
            with open(cv_file, 'w') as f:
                f.write(self.test_cv_content)
                
            # Test with nested output directory
            output_dir = Path(temp_dir) / "nested" / "output" / "folder"
            
            # Run CLI
            result = main_simple(str(cv_file), output_dir=str(output_dir))
            self.assertEqual(result, 0)
            
            # Should create nested directories and output files
            self.assertTrue(output_dir.exists())
            self.assertTrue((output_dir / "optimized_cv.html").exists())
            
    @patch('builtins.print')
    def test_cli_output_messages(self, mock_print):
        """Test that CLI produces expected output messages"""
        with tempfile.TemporaryDirectory() as temp_dir:
            # Create test CV file
            cv_file = Path(temp_dir) / "test_cv.txt"
            with open(cv_file, 'w') as f:
                f.write(self.test_cv_content)
                
            output_dir = Path(temp_dir) / "output"
            
            # Run CLI
            result = main_simple(str(cv_file), output_dir=str(output_dir))
            self.assertEqual(result, 0)
            
            # Check that appropriate messages were printed
            print_calls = [call[0][0] for call in mock_print.call_args_list if call[0]]
            
            # Should print progress messages
            progress_messages = [msg for msg in print_calls if any(emoji in msg for emoji in ['=Ä', '='', '=Ê', '=', '<¨', '=¾', ''])]
            self.assertGreater(len(progress_messages), 0)
            
            # Should print completion message
            completion_messages = [msg for msg in print_calls if 'completed successfully' in msg]
            self.assertGreater(len(completion_messages), 0)


class TestCLIErrorHandling(unittest.TestCase):
    """Test CLI error handling scenarios"""
    
    def test_permission_error_handling(self):
        """Test handling of permission errors"""
        with tempfile.TemporaryDirectory() as temp_dir:
            # Create test CV file
            cv_file = Path(temp_dir) / "test_cv.txt"
            with open(cv_file, 'w') as f:
                f.write("John Smith\nSoftware Engineer\njohn@email.com")
                
            # Try to write to root directory (should fail on most systems)
            if sys.platform != 'win32':  # Skip on Windows due to different permission model
                result = main_simple(str(cv_file), output_dir="/root/forbidden")
                # Should handle gracefully (might succeed or fail depending on system)
                self.assertIn(result, [0, 1])
                
    def test_large_file_handling(self):
        """Test handling of large CV files"""
        with tempfile.TemporaryDirectory() as temp_dir:
            # Create large CV file
            cv_file = Path(temp_dir) / "large_cv.txt"
            large_content = "John Smith\nSoftware Engineer\n" + ("Experience details. " * 10000)
            
            with open(cv_file, 'w') as f:
                f.write(large_content)
                
            output_dir = Path(temp_dir) / "output"
            
            # Run CLI
            result = main_simple(str(cv_file), output_dir=str(output_dir))
            
            # Should handle large files gracefully
            self.assertEqual(result, 0)
            self.assertTrue((output_dir / "optimized_cv.html").exists())


if __name__ == '__main__':
    unittest.main()