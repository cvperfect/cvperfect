"""
CVPerfect ML System - ATS Compatibility Scorer
Advanced ATS scoring with deterministic rules + ML predictions
"""

import re
import json
import logging
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from pathlib import Path

logger = logging.getLogger(__name__)


@dataclass
class ATSScoreResult:
    """ATS scoring result with detailed breakdown"""
    total_score: float
    subscores: Dict[str, float]
    details: Dict[str, any]
    recommendations: List[str]
    keywords_found: List[str]
    keywords_missing: List[str]


class ATSKeywordAnalyzer:
    """Keyword analysis for ATS optimization"""
    
    def __init__(self):
        self.technical_keywords = {
            'programming': [
                'python', 'javascript', 'java', 'c++', 'react', 'angular', 'vue',
                'node.js', 'django', 'flask', 'spring', 'tensorflow', 'pytorch',
                'kubernetes', 'docker', 'aws', 'azure', 'gcp', 'mysql', 'postgresql'
            ],
            'management': [
                'project management', 'team leadership', 'agile', 'scrum', 'kanban',
                'strategic planning', 'budget management', 'stakeholder management',
                'risk management', 'change management', 'process improvement'
            ],
            'soft_skills': [
                'communication', 'teamwork', 'problem solving', 'analytical thinking',
                'creativity', 'adaptability', 'time management', 'critical thinking',
                'attention to detail', 'customer service', 'negotiation'
            ],
            'certifications': [
                'pmp', 'aws certified', 'google cloud', 'microsoft certified',
                'cisco', 'comptia', 'six sigma', 'itil', 'certified scrum master',
                'prince2', 'lean', 'cpa', 'cfa'
            ]
        }
        
    def analyze_keywords(self, cv_text: str, job_description: Optional[str] = None) -> Dict[str, any]:
        """Analyze keyword match and coverage"""
        cv_lower = cv_text.lower()
        
        # Find present keywords by category
        found_keywords = {}
        for category, keywords in self.technical_keywords.items():
            found = [kw for kw in keywords if kw in cv_lower]
            found_keywords[category] = found
            
        # Total keyword coverage
        total_keywords = sum(len(kws) for kws in self.technical_keywords.values())
        found_count = sum(len(kws) for kws in found_keywords.values())
        keyword_coverage = (found_count / total_keywords) * 100
        
        result = {
            'keyword_coverage': keyword_coverage,
            'found_keywords': found_keywords,
            'total_found': found_count,
            'total_possible': total_keywords
        }
        
        # If job description provided, analyze job-specific matching
        if job_description:
            job_analysis = self._analyze_job_match(cv_text, job_description)
            result.update(job_analysis)
            
        return result
    
    def _analyze_job_match(self, cv_text: str, job_description: str) -> Dict[str, any]:
        """Analyze CV-job posting keyword match"""
        cv_words = set(re.findall(r'\b\w+\b', cv_text.lower()))
        job_words = set(re.findall(r'\b\w+\b', job_description.lower()))
        
        # Filter out common words
        stop_words = {'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'a', 'an'}
        cv_keywords = cv_words - stop_words
        job_keywords = job_words - stop_words
        
        # Calculate match
        matched_keywords = cv_keywords & job_keywords
        match_percentage = (len(matched_keywords) / len(job_keywords)) * 100 if job_keywords else 0
        
        missing_keywords = job_keywords - cv_keywords
        
        return {
            'job_match_percentage': match_percentage,
            'matched_job_keywords': list(matched_keywords)[:20],  # Top 20
            'missing_job_keywords': list(missing_keywords)[:10]   # Top 10 missing
        }


class ATSFormattingAnalyzer:
    """Analyze CV formatting for ATS compatibility"""
    
    @staticmethod
    def analyze_formatting(cv_text: str) -> Dict[str, any]:
        """Analyze formatting and structure"""
        
        # Check for standard sections
        sections_found = {
            'contact': bool(re.search(r'\b(email|phone|linkedin|github)\b', cv_text, re.IGNORECASE)),
            'experience': bool(re.search(r'\b(experience|work|employment|job)\b', cv_text, re.IGNORECASE)),
            'education': bool(re.search(r'\b(education|degree|university|college)\b', cv_text, re.IGNORECASE)),
            'skills': bool(re.search(r'\b(skills|competencies|expertise)\b', cv_text, re.IGNORECASE))
        }
        
        # Check formatting issues
        formatting_issues = []
        
        # Check for excessive special characters
        special_char_ratio = len(re.findall(r'[^\w\s\-\.\,\;\:\(\)]', cv_text)) / len(cv_text)
        if special_char_ratio > 0.1:
            formatting_issues.append("Too many special characters may confuse ATS")
            
        # Check for proper email format
        email_found = re.search(r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', cv_text)
        if not email_found:
            formatting_issues.append("No valid email address found")
            
        # Check for phone number
        phone_found = re.search(r'(\+?1?[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}', cv_text)
        if not phone_found:
            formatting_issues.append("No phone number detected")
            
        # Check text length
        word_count = len(cv_text.split())
        if word_count < 100:
            formatting_issues.append("CV appears too short (under 100 words)")
        elif word_count > 1000:
            formatting_issues.append("CV may be too long for some ATS systems")
            
        section_score = (sum(sections_found.values()) / len(sections_found)) * 100
        formatting_score = max(0, 100 - (len(formatting_issues) * 15))
        
        return {
            'section_score': section_score,
            'formatting_score': formatting_score,
            'sections_found': sections_found,
            'formatting_issues': formatting_issues,
            'word_count': word_count
        }


class EnhancedATSScorer:
    """Enhanced ATS scorer combining deterministic rules with ML predictions"""
    
    def __init__(self):
        self.keyword_analyzer = ATSKeywordAnalyzer()
        self.formatting_analyzer = ATSFormattingAnalyzer()
        self.industry_weights = self._load_industry_weights()
        
    def _load_industry_weights(self) -> Dict[str, Dict[str, float]]:
        """Load industry-specific scoring weights"""
        # In production, this would load from a config file
        return {
            'technology': {
                'keywords': 0.4,
                'formatting': 0.2,
                'experience': 0.3,
                'education': 0.1
            },
            'finance': {
                'keywords': 0.3,
                'formatting': 0.2,
                'experience': 0.3,
                'education': 0.2
            },
            'default': {
                'keywords': 0.35,
                'formatting': 0.25,
                'experience': 0.25,
                'education': 0.15
            }
        }
    
    def calculate_ats_score(self, cv_content: any, job_description: Optional[str] = None, 
                          industry: str = 'default') -> ATSScoreResult:
        """
        Calculate comprehensive ATS score
        
        Args:
            cv_content: Extracted CV sections (from extract.py)
            job_description: Optional job posting text
            industry: Industry category for weighted scoring
            
        Returns:
            ATSScoreResult with detailed breakdown
        """
        
        # Convert sections to text for analysis
        cv_text = self._sections_to_text(cv_content)
        
        # Analyze keywords
        keyword_analysis = self.keyword_analyzer.analyze_keywords(cv_text, job_description)
        
        # Analyze formatting
        formatting_analysis = self.formatting_analyzer.analyze_formatting(cv_text)
        
        # Calculate component scores
        scores = {
            'keywords': min(100, keyword_analysis['keyword_coverage'] * 1.2),  # Boost keyword importance
            'formatting': formatting_analysis['formatting_score'],
            'sections': formatting_analysis['section_score'],
            'content_quality': self._assess_content_quality(cv_content)
        }
        
        # Job-specific scoring
        if job_description and 'job_match_percentage' in keyword_analysis:
            scores['job_match'] = keyword_analysis['job_match_percentage']
            job_boost = min(20, keyword_analysis['job_match_percentage'] * 0.2)
            scores['keywords'] += job_boost
        
        # Apply industry weights
        weights = self.industry_weights.get(industry, self.industry_weights['default'])
        
        # Calculate weighted total score
        total_score = (
            scores['keywords'] * weights['keywords'] +
            scores['formatting'] * weights['formatting'] +
            scores['sections'] * weights['experience'] +
            scores['content_quality'] * weights['education']
        )
        
        total_score = min(100, max(0, total_score))
        
        # Generate recommendations
        recommendations = self._generate_recommendations(scores, formatting_analysis, keyword_analysis)
        
        return ATSScoreResult(
            total_score=round(total_score, 1),
            subscores={k: round(v, 1) for k, v in scores.items()},
            details={
                'keyword_analysis': keyword_analysis,
                'formatting_analysis': formatting_analysis,
                'industry_weights': weights,
                'word_count': formatting_analysis['word_count']
            },
            recommendations=recommendations,
            keywords_found=sum(keyword_analysis['found_keywords'].values(), []),
            keywords_missing=keyword_analysis.get('missing_job_keywords', [])
        )
    
    def _sections_to_text(self, sections: any) -> str:
        """Convert structured CV sections to text for analysis"""
        if isinstance(sections, str):
            return sections
            
        text_parts = []
        
        # Contact info
        if hasattr(sections, 'contact') and sections.contact:
            contact = sections.contact
            if isinstance(contact, dict):
                text_parts.extend([
                    contact.get('name', ''),
                    contact.get('email', ''),
                    contact.get('phone', ''),
                    contact.get('linkedin', ''),
                    contact.get('github', '')
                ])
        
        # Summary
        if hasattr(sections, 'summary') and sections.summary:
            text_parts.append(sections.summary)
        
        # Experience
        if hasattr(sections, 'experience') and sections.experience:
            for exp in sections.experience:
                if hasattr(exp, 'role'):
                    text_parts.append(exp.role)
                if hasattr(exp, 'company'):
                    text_parts.append(exp.company)
                if hasattr(exp, 'bullets'):
                    text_parts.extend(exp.bullets)
        
        # Education
        if hasattr(sections, 'education') and sections.education:
            for edu in sections.education:
                if hasattr(edu, 'degree'):
                    text_parts.append(edu.degree)
                if hasattr(edu, 'institution'):
                    text_parts.append(edu.institution)
        
        # Skills
        if hasattr(sections, 'skills') and sections.skills:
            text_parts.extend(sections.skills)
        
        return '\n'.join(filter(None, text_parts))
    
    def _assess_content_quality(self, sections: any) -> float:
        """Assess content quality and completeness"""
        quality_score = 0
        
        # Check section completeness
        required_sections = ['contact', 'experience', 'skills']
        section_bonus = 0
        
        for section in required_sections:
            if hasattr(sections, section) and getattr(sections, section):
                section_bonus += 25
        
        # Check experience depth
        if hasattr(sections, 'experience') and sections.experience:
            exp_count = len(sections.experience)
            exp_bonus = min(30, exp_count * 10)  # Max 30 points for experience
        else:
            exp_bonus = 0
        
        # Check skills diversity
        if hasattr(sections, 'skills') and sections.skills:
            skill_count = len(sections.skills)
            skill_bonus = min(20, skill_count * 2)  # Max 20 points for skills
        else:
            skill_bonus = 0
        
        quality_score = section_bonus + exp_bonus + skill_bonus
        return min(100, quality_score)
    
    def _generate_recommendations(self, scores: Dict[str, float], formatting_analysis: Dict, 
                                keyword_analysis: Dict) -> List[str]:
        """Generate personalized ATS improvement recommendations"""
        recommendations = []
        
        # Keyword recommendations
        if scores['keywords'] < 70:
            recommendations.append("Add more relevant keywords from your industry")
            if keyword_analysis.get('missing_job_keywords'):
                top_missing = keyword_analysis['missing_job_keywords'][:3]
                recommendations.append(f"Consider adding these job-specific keywords: {', '.join(top_missing)}")
        
        # Formatting recommendations
        if scores['formatting'] < 80:
            for issue in formatting_analysis['formatting_issues'][:3]:
                recommendations.append(issue)
        
        # Section recommendations
        if scores['sections'] < 90:
            missing_sections = [k for k, v in formatting_analysis['sections_found'].items() if not v]
            if missing_sections:
                recommendations.append(f"Add missing sections: {', '.join(missing_sections)}")
        
        # Content quality recommendations
        if scores['content_quality'] < 75:
            recommendations.append("Expand your experience section with more detailed bullet points")
            recommendations.append("Add more technical skills relevant to your field")
        
        # Length recommendations
        word_count = formatting_analysis['word_count']
        if word_count < 200:
            recommendations.append("CV appears too short - add more detail to your experience")
        elif word_count > 800:
            recommendations.append("Consider condensing your CV - some ATS systems prefer shorter resumes")
        
        return recommendations[:5]  # Return top 5 recommendations


if __name__ == "__main__":
    # Test the ATS scorer
    print("🎯 CVPerfect ATS Scorer - Testing...")
    
    scorer = EnhancedATSScorer()
    
    # Test with sample CV text
    test_cv = """
    John Smith
    Software Engineer
    Email: john.smith@email.com
    Phone: (555) 123-4567
    
    Experience:
    Senior Software Engineer at TechCorp (2020-2023)
    - Developed Python applications using Django framework
    - Led team of 5 developers on microservices architecture
    - Implemented automated testing with pytest
    
    Skills: Python, JavaScript, React, Docker, AWS, PostgreSQL
    Education: BS Computer Science, MIT (2018)
    """
    
    result = scorer.calculate_ats_score(test_cv)
    
    print(f"📊 Total ATS Score: {result.total_score}/100")
    print(f"📈 Subscores: {result.subscores}")
    print(f"💡 Recommendations: {len(result.recommendations)}")
    for i, rec in enumerate(result.recommendations, 1):
        print(f"   {i}. {rec}")
    
    print("✅ ATS Scorer test completed")