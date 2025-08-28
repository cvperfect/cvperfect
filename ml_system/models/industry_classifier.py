"""
CVPerfect ML System - Industry Classification
ML-based industry classification from CV content
"""

import re
import json
import logging
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from collections import Counter
import numpy as np

logger = logging.getLogger(__name__)


@dataclass
class IndustryClassificationResult:
    """Industry classification result with confidence scores"""
    primary_industry: str
    confidence: float
    top_industries: List[Tuple[str, float]]  # (industry, confidence) pairs
    keywords_matched: Dict[str, List[str]]
    reasoning: str


class IndustryKeywordDatabase:
    """Database of industry-specific keywords and patterns"""
    
    def __init__(self):
        self.industry_keywords = {
            "Technology": {
                "primary": [
                    "software", "developer", "engineer", "programming", "coding", "python",
                    "javascript", "react", "angular", "vue", "node.js", "django", "flask",
                    "machine learning", "ai", "artificial intelligence", "data science",
                    "devops", "cloud", "aws", "azure", "kubernetes", "docker", "microservices",
                    "full stack", "frontend", "backend", "mobile", "ios", "android", "agile",
                    "scrum", "git", "api", "database", "sql", "nosql", "mongodb", "postgresql"
                ],
                "secondary": [
                    "startup", "tech", "digital", "saas", "platform", "application", "system",
                    "architecture", "infrastructure", "deployment", "testing", "debugging"
                ]
            },
            
            "Healthcare": {
                "primary": [
                    "doctor", "physician", "nurse", "medical", "healthcare", "hospital",
                    "clinical", "patient", "treatment", "diagnosis", "surgery", "medicine",
                    "pharmacy", "pharmaceutical", "biotech", "biotechnology", "research",
                    "therapy", "rehabilitation", "nursing", "dentist", "dental", "veterinary"
                ],
                "secondary": [
                    "health", "care", "wellness", "therapeutic", "diagnostic", "epidemic",
                    "public health", "mental health", "physical therapy", "radiology"
                ]
            },
            
            "Finance": {
                "primary": [
                    "finance", "financial", "banking", "investment", "trading", "portfolio",
                    "analyst", "accounting", "cpa", "cfa", "audit", "tax", "budget",
                    "revenue", "profit", "risk management", "compliance", "credit", "loan",
                    "mortgage", "insurance", "wealth management", "asset management"
                ],
                "secondary": [
                    "money", "capital", "equity", "bond", "securities", "market", "economics",
                    "financial planning", "treasury", "corporate finance", "private equity"
                ]
            },
            
            "Education": {
                "primary": [
                    "teacher", "professor", "education", "school", "university", "college",
                    "academic", "curriculum", "instruction", "learning", "student", "classroom",
                    "training", "tutor", "principal", "dean", "research", "publish", "thesis"
                ],
                "secondary": [
                    "pedagogy", "educational", "teaching", "academic", "scholarship", "degree",
                    "certification", "workshop", "seminar", "course development"
                ]
            },
            
            "Marketing": {
                "primary": [
                    "marketing", "brand", "advertising", "campaign", "social media", "seo",
                    "content marketing", "digital marketing", "ppc", "google ads", "facebook ads",
                    "email marketing", "lead generation", "conversion", "analytics", "roi",
                    "market research", "customer acquisition", "retention", "engagement"
                ],
                "secondary": [
                    "promotion", "outreach", "publicity", "pr", "public relations", "communications",
                    "copywriting", "creative", "design", "branding", "positioning"
                ]
            },
            
            "Sales": {
                "primary": [
                    "sales", "account manager", "business development", "revenue", "quota",
                    "pipeline", "crm", "salesforce", "lead", "prospect", "client", "customer",
                    "negotiation", "closing", "b2b", "b2c", "enterprise", "commission",
                    "territory", "relationship building", "sales strategy"
                ],
                "secondary": [
                    "selling", "deals", "contracts", "partnerships", "channel", "distribution",
                    "retail", "inside sales", "outside sales", "account executive"
                ]
            },
            
            "Operations": {
                "primary": [
                    "operations", "logistics", "supply chain", "inventory", "procurement",
                    "vendor management", "process improvement", "efficiency", "optimization",
                    "lean", "six sigma", "manufacturing", "production", "quality control",
                    "facilities", "warehouse", "distribution", "transportation"
                ],
                "secondary": [
                    "operational", "workflow", "procedures", "standards", "compliance",
                    "continuous improvement", "kaizen", "project management", "coordination"
                ]
            },
            
            "Human Resources": {
                "primary": [
                    "hr", "human resources", "recruitment", "hiring", "talent acquisition",
                    "employee relations", "compensation", "benefits", "payroll", "performance",
                    "training", "development", "onboarding", "culture", "engagement",
                    "diversity", "inclusion", "policy", "compliance", "labor relations"
                ],
                "secondary": [
                    "people", "workforce", "staff", "personnel", "recruiting", "staffing",
                    "organizational development", "change management", "employee experience"
                ]
            },
            
            "Engineering": {
                "primary": [
                    "engineer", "engineering", "mechanical", "electrical", "civil", "chemical",
                    "aerospace", "biomedical", "industrial", "environmental", "structural",
                    "design", "cad", "autocad", "solidworks", "project", "construction",
                    "manufacturing", "quality", "testing", "analysis", "simulation"
                ],
                "secondary": [
                    "technical", "blueprint", "specification", "prototype", "development",
                    "innovation", "problem solving", "systems", "process", "efficiency"
                ]
            },
            
            "Data Science": {
                "primary": [
                    "data scientist", "data analysis", "analytics", "statistics", "machine learning",
                    "deep learning", "neural networks", "artificial intelligence", "python",
                    "r", "sql", "tableau", "power bi", "hadoop", "spark", "tensorflow",
                    "pytorch", "scikit-learn", "pandas", "numpy", "visualization", "modeling"
                ],
                "secondary": [
                    "big data", "predictive", "algorithm", "statistical", "quantitative",
                    "business intelligence", "data mining", "pattern recognition", "forecasting"
                ]
            },
            
            "Design": {
                "primary": [
                    "designer", "design", "ux", "ui", "user experience", "user interface",
                    "graphic design", "web design", "product design", "visual design",
                    "creative", "adobe", "photoshop", "illustrator", "figma", "sketch",
                    "prototyping", "wireframe", "branding", "typography", "layout"
                ],
                "secondary": [
                    "creative", "artistic", "aesthetic", "visual", "design thinking",
                    "user research", "usability", "interaction design", "information architecture"
                ]
            },
            
            "Legal": {
                "primary": [
                    "lawyer", "attorney", "legal", "law", "litigation", "contract", "compliance",
                    "regulatory", "paralegal", "court", "trial", "counsel", "advice",
                    "intellectual property", "patent", "trademark", "corporate law",
                    "criminal law", "family law", "real estate law", "tax law"
                ],
                "secondary": [
                    "legal research", "brief", "case", "statute", "regulation", "negotiation",
                    "settlement", "mediation", "arbitration", "due diligence"
                ]
            },
            
            "Consulting": {
                "primary": [
                    "consultant", "consulting", "advisory", "strategy", "management consulting",
                    "business analyst", "process improvement", "transformation", "change management",
                    "project management", "client", "engagement", "analysis", "recommendation",
                    "implementation", "optimization", "efficiency", "best practices"
                ],
                "secondary": [
                    "strategic", "operational", "organizational", "business development",
                    "problem solving", "solution", "methodology", "framework"
                ]
            },
            
            "Project Management": {
                "primary": [
                    "project manager", "project management", "pmp", "agile", "scrum", "waterfall",
                    "kanban", "planning", "scheduling", "coordination", "stakeholder",
                    "risk management", "budget", "timeline", "deliverable", "milestone",
                    "resource management", "team leadership", "communication"
                ],
                "secondary": [
                    "program manager", "portfolio management", "cross-functional", "coordination",
                    "execution", "monitoring", "control", "quality assurance"
                ]
            }
        }
        
        # Industry similarity mapping for better classification
        self.industry_similarity = {
            "Technology": ["Data Science", "Engineering"],
            "Data Science": ["Technology", "Analytics"],
            "Engineering": ["Technology", "Manufacturing"],
            "Marketing": ["Sales", "Design"],
            "Sales": ["Marketing", "Business Development"],
            "Finance": ["Accounting", "Investment"],
            "Healthcare": ["Biotechnology", "Research"],
            "Design": ["Marketing", "Technology"]
        }
    
    def get_all_industries(self) -> List[str]:
        """Get list of all supported industries"""
        return list(self.industry_keywords.keys())
    
    def get_industry_keywords(self, industry: str) -> List[str]:
        """Get all keywords for a specific industry"""
        if industry not in self.industry_keywords:
            return []
        
        keywords_data = self.industry_keywords[industry]
        return keywords_data.get("primary", []) + keywords_data.get("secondary", [])


class CVIndustryClassifier:
    """ML-based industry classifier for CVs"""
    
    def __init__(self):
        self.keyword_db = IndustryKeywordDatabase()
        self.industries = self.keyword_db.get_all_industries()
        
        # Scoring weights
        self.weights = {
            "primary_keywords": 3.0,
            "secondary_keywords": 1.5,
            "context_bonus": 1.2,
            "experience_weight": 2.0,
            "skills_weight": 2.5,
            "title_weight": 3.0
        }
        
    def classify_industry(self, cv_content: any, top_k: int = 5) -> IndustryClassificationResult:
        """
        Classify CV into industry categories
        
        Args:
            cv_content: Extracted CV sections
            top_k: Number of top industries to return
            
        Returns:
            IndustryClassificationResult with predictions and confidence
        """
        
        # Extract text content from structured CV
        text_content = self._extract_text_content(cv_content)
        
        # Score each industry
        industry_scores = {}
        keyword_matches = {}
        
        for industry in self.industries:
            score, matches = self._score_industry(text_content, industry, cv_content)
            industry_scores[industry] = score
            keyword_matches[industry] = matches
        
        # Sort industries by score
        sorted_industries = sorted(
            industry_scores.items(), 
            key=lambda x: x[1], 
            reverse=True
        )
        
        # Calculate confidence scores
        top_industries = []
        total_score = sum(industry_scores.values())
        
        for industry, score in sorted_industries[:top_k]:
            confidence = (score / total_score) * 100 if total_score > 0 else 0
            top_industries.append((industry, round(confidence, 1)))
        
        # Primary industry and confidence
        primary_industry = sorted_industries[0][0] if sorted_industries else "Unknown"
        primary_confidence = top_industries[0][1] if top_industries else 0
        
        # Generate reasoning
        reasoning = self._generate_reasoning(
            primary_industry, 
            keyword_matches[primary_industry], 
            text_content
        )
        
        return IndustryClassificationResult(
            primary_industry=primary_industry,
            confidence=primary_confidence,
            top_industries=top_industries,
            keywords_matched=keyword_matches,
            reasoning=reasoning
        )
    
    def _extract_text_content(self, cv_content: any) -> Dict[str, str]:
        """Extract text content from structured CV for analysis"""
        content = {
            "full_text": "",
            "job_titles": "",
            "skills": "",
            "experience": "",
            "summary": ""
        }
        
        if isinstance(cv_content, str):
            content["full_text"] = cv_content.lower()
            return content
        
        text_parts = []
        
        # Extract job titles and experience
        if hasattr(cv_content, 'experience') and cv_content.experience:
            job_titles = []
            experience_text = []
            
            for exp in cv_content.experience:
                if hasattr(exp, 'role') and exp.role:
                    job_titles.append(exp.role.lower())
                    text_parts.append(exp.role.lower())
                
                if hasattr(exp, 'company') and exp.company:
                    text_parts.append(exp.company.lower())
                
                if hasattr(exp, 'bullets') and exp.bullets:
                    exp_bullets = [bullet.lower() for bullet in exp.bullets]
                    experience_text.extend(exp_bullets)
                    text_parts.extend(exp_bullets)
            
            content["job_titles"] = " ".join(job_titles)
            content["experience"] = " ".join(experience_text)
        
        # Extract skills
        if hasattr(cv_content, 'skills') and cv_content.skills:
            skills_text = [skill.lower() for skill in cv_content.skills]
            content["skills"] = " ".join(skills_text)
            text_parts.extend(skills_text)
        
        # Extract summary
        if hasattr(cv_content, 'summary') and cv_content.summary:
            content["summary"] = cv_content.summary.lower()
            text_parts.append(cv_content.summary.lower())
        
        # Extract contact info
        if hasattr(cv_content, 'contact') and cv_content.contact:
            contact = cv_content.contact
            if isinstance(contact, dict):
                if contact.get('name'):
                    text_parts.append(contact['name'].lower())
        
        content["full_text"] = " ".join(text_parts)
        return content
    
    def _score_industry(self, text_content: Dict[str, str], industry: str, cv_content: any) -> Tuple[float, List[str]]:
        """Score how well CV matches a specific industry"""
        
        if industry not in self.keyword_db.industry_keywords:
            return 0.0, []
        
        keywords_data = self.keyword_db.industry_keywords[industry]
        primary_keywords = keywords_data.get("primary", [])
        secondary_keywords = keywords_data.get("secondary", [])
        
        score = 0.0
        matched_keywords = []
        
        full_text = text_content["full_text"]
        
        # Score primary keywords
        for keyword in primary_keywords:
            if keyword.lower() in full_text:
                matched_keywords.append(keyword)
                
                # Base score
                keyword_score = self.weights["primary_keywords"]
                
                # Context bonuses
                if keyword.lower() in text_content["job_titles"]:
                    keyword_score *= self.weights["title_weight"]
                elif keyword.lower() in text_content["skills"]:
                    keyword_score *= self.weights["skills_weight"]
                elif keyword.lower() in text_content["experience"]:
                    keyword_score *= self.weights["experience_weight"]
                
                # Multiple mentions bonus
                mention_count = full_text.count(keyword.lower())
                keyword_score *= min(2.0, 1.0 + (mention_count - 1) * 0.2)
                
                score += keyword_score
        
        # Score secondary keywords
        for keyword in secondary_keywords:
            if keyword.lower() in full_text:
                matched_keywords.append(keyword)
                
                keyword_score = self.weights["secondary_keywords"]
                
                # Context bonuses for secondary keywords too
                if keyword.lower() in text_content["skills"]:
                    keyword_score *= 1.5
                elif keyword.lower() in text_content["experience"]:
                    keyword_score *= 1.3
                
                score += keyword_score
        
        # Similarity bonus (related industries)
        similar_industries = self.keyword_db.industry_similarity.get(industry, [])
        for similar_industry in similar_industries:
            if similar_industry in self.keyword_db.industry_keywords:
                similar_keywords = self.keyword_db.get_industry_keywords(similar_industry)
                similar_matches = [kw for kw in similar_keywords if kw.lower() in full_text]
                if similar_matches:
                    score += len(similar_matches) * 0.5  # Small bonus for related keywords
        
        # Industry-specific bonuses
        score += self._apply_industry_specific_bonuses(industry, text_content, cv_content)
        
        return score, matched_keywords
    
    def _apply_industry_specific_bonuses(self, industry: str, text_content: Dict[str, str], cv_content: any) -> float:
        """Apply industry-specific scoring bonuses"""
        bonus = 0.0
        full_text = text_content["full_text"]
        
        if industry == "Technology":
            # Bonus for programming languages
            prog_langs = ["python", "javascript", "java", "c++", "ruby", "go", "rust", "swift"]
            lang_count = sum(1 for lang in prog_langs if lang in full_text)
            bonus += lang_count * 2.0
            
            # Bonus for tech frameworks/tools
            if any(tool in full_text for tool in ["react", "angular", "vue", "django", "flask", "spring"]):
                bonus += 3.0
        
        elif industry == "Finance":
            # Bonus for financial certifications
            if any(cert in full_text for cert in ["cfa", "cpa", "frm", "series 7"]):
                bonus += 5.0
            
            # Bonus for financial terms
            finance_terms = ["portfolio", "investment", "trading", "risk", "compliance"]
            term_count = sum(1 for term in finance_terms if term in full_text)
            bonus += term_count * 1.5
        
        elif industry == "Healthcare":
            # Bonus for medical degrees/certifications
            if any(degree in full_text for degree in ["md", "phd", "rn", "pharmd", "dds"]):
                bonus += 5.0
            
            # Bonus for medical specializations
            if any(spec in full_text for spec in ["cardiology", "oncology", "neurology", "pediatrics"]):
                bonus += 3.0
        
        elif industry == "Engineering":
            # Bonus for engineering tools
            if any(tool in full_text for tool in ["autocad", "solidworks", "matlab", "ansys"]):
                bonus += 3.0
            
            # Bonus for PE license
            if "pe license" in full_text or "professional engineer" in full_text:
                bonus += 4.0
        
        return bonus
    
    def _generate_reasoning(self, primary_industry: str, matched_keywords: List[str], text_content: Dict[str, str]) -> str:
        """Generate human-readable reasoning for classification"""
        
        if not matched_keywords:
            return f"Classification uncertain - limited industry-specific keywords found."
        
        top_keywords = matched_keywords[:5]  # Top 5 matched keywords
        
        reasoning = f"Classified as {primary_industry} based on "
        
        if len(top_keywords) == 1:
            reasoning += f"the keyword '{top_keywords[0]}'."
        elif len(top_keywords) == 2:
            reasoning += f"keywords '{top_keywords[0]}' and '{top_keywords[1]}'."
        else:
            reasoning += f"keywords including '{', '.join(top_keywords[:3])}', and others."
        
        # Add context about where keywords were found
        if text_content["job_titles"] and any(kw in text_content["job_titles"] for kw in top_keywords[:3]):
            reasoning += " Strong indicators found in job titles."
        elif text_content["skills"] and any(kw in text_content["skills"] for kw in top_keywords[:3]):
            reasoning += " Key skills align with this industry."
        
        return reasoning


if __name__ == "__main__":
    # Test the industry classifier
    print("🏢 CVPerfect Industry Classifier - Testing...")
    
    classifier = CVIndustryClassifier()
    
    # Test with sample CV content
    test_cv_text = """
    Senior Software Engineer
    Python, JavaScript, React, Django, AWS, Docker
    
    Experience:
    - Developed web applications using Python and Django
    - Built responsive frontend with React and JavaScript
    - Implemented CI/CD pipelines with Docker and AWS
    - Led agile development team of 5 engineers
    - Designed microservices architecture for scalability
    
    Skills: Python, JavaScript, React, Django, AWS, Docker, Kubernetes, PostgreSQL
    """
    
    result = classifier.classify_industry(test_cv_text, top_k=3)
    
    print(f"🎯 Primary Industry: {result.primary_industry} ({result.confidence}% confidence)")
    print(f"📊 Top Industries:")
    for industry, confidence in result.top_industries:
        print(f"   • {industry}: {confidence}%")
    
    print(f"🔍 Keywords Matched for {result.primary_industry}:")
    primary_keywords = result.keywords_matched.get(result.primary_industry, [])
    print(f"   {', '.join(primary_keywords[:10])}")  # First 10 keywords
    
    print(f"💭 Reasoning: {result.reasoning}")
    print("✅ Industry Classifier test completed")