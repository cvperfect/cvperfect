"""
CVPerfect ML System - Training Data Pipeline
Comprehensive data curation system for CV optimization models
"""

import asyncio
import json
import logging
import re
import hashlib
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass, asdict
from pathlib import Path
from datetime import datetime
import pandas as pd
import numpy as np
from concurrent.futures import ThreadPoolExecutor, as_completed
import sqlite3

logger = logging.getLogger(__name__)


@dataclass
class CVDataPoint:
    """Single CV training data point"""
    id: str
    original_text: str
    optimized_text: str
    industry: str
    ats_score: float
    job_level: str  # entry, mid, senior, executive
    experience_years: int
    skills: List[str]
    certifications: List[str]
    education_level: str
    language: str  # en, pl
    file_format: str  # pdf, docx, txt
    quality_score: float  # 0-100
    annotations: Dict[str, Any]
    created_at: datetime
    
    def to_dict(self) -> Dict:
        """Convert to dictionary for storage"""
        data = asdict(self)
        data['created_at'] = self.created_at.isoformat()
        return data
    
    @classmethod
    def from_dict(cls, data: Dict):
        """Create from dictionary"""
        data['created_at'] = datetime.fromisoformat(data['created_at'])
        return cls(**data)


@dataclass
class JobPostingDataPoint:
    """Job posting data for CV-job matching training"""
    id: str
    title: str
    description: str
    company: str
    industry: str
    location: str
    experience_level: str
    salary_range: Optional[str]
    required_skills: List[str]
    preferred_skills: List[str]
    education_requirements: str
    language: str
    created_at: datetime


class CVDataCurator:
    """Advanced CV data curation and preprocessing system"""
    
    def __init__(self, data_dir: str = "ml_system/data"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
        # Initialize databases
        self.cv_db_path = self.data_dir / "cv_training_data.db"
        self.job_db_path = self.data_dir / "job_posting_data.db"
        self._init_databases()
        
        # Quality filters
        self.min_cv_length = 100  # words
        self.max_cv_length = 2000  # words
        self.min_quality_score = 60  # 0-100
        
        # Anonymization patterns
        self.pii_patterns = {
            'email': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
            'phone': r'(\+?1?[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}',
            'ssn': r'\b\d{3}-?\d{2}-?\d{4}\b',
            'address': r'\b\d+\s+[A-Za-z0-9\s,.-]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Place|Pl)\b',
            'name_patterns': [
                r'\b[A-Z][a-z]+ [A-Z][a-z]+\b',  # First Last
                r'\b[A-Z][a-z]+ [A-Z]\. [A-Z][a-z]+\b',  # First M. Last
            ]
        }
        
        logger.info(f"CV Data Curator initialized with data directory: {self.data_dir}")
    
    def _init_databases(self):
        """Initialize SQLite databases for training data"""
        
        # CV training data database
        with sqlite3.connect(self.cv_db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS cv_data (
                    id TEXT PRIMARY KEY,
                    original_text TEXT,
                    optimized_text TEXT,
                    industry TEXT,
                    ats_score REAL,
                    job_level TEXT,
                    experience_years INTEGER,
                    skills TEXT,  -- JSON array
                    certifications TEXT,  -- JSON array
                    education_level TEXT,
                    language TEXT,
                    file_format TEXT,
                    quality_score REAL,
                    annotations TEXT,  -- JSON
                    created_at TEXT
                )
            """)
            
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_industry ON cv_data(industry)
            """)
            
            conn.execute("""
                CREATE INDEX IF NOT EXISTS idx_quality ON cv_data(quality_score)
            """)
        
        # Job posting database
        with sqlite3.connect(self.job_db_path) as conn:
            conn.execute("""
                CREATE TABLE IF NOT EXISTS job_data (
                    id TEXT PRIMARY KEY,
                    title TEXT,
                    description TEXT,
                    company TEXT,
                    industry TEXT,
                    location TEXT,
                    experience_level TEXT,
                    salary_range TEXT,
                    required_skills TEXT,  -- JSON array
                    preferred_skills TEXT,  -- JSON array
                    education_requirements TEXT,
                    language TEXT,
                    created_at TEXT
                )
            """)
    
    async def curate_cv_dataset(self, target_size: int = 100000, 
                               sources: List[str] = None) -> Dict[str, int]:
        """
        Curate comprehensive CV dataset
        
        Args:
            target_size: Target number of CV samples
            sources: Data sources to use
            
        Returns:
            Statistics about curated dataset
        """
        logger.info(f"Starting CV dataset curation - target size: {target_size:,}")
        
        # For production, this would connect to various data sources:
        # - Public CV datasets (with proper licensing)
        # - Synthetic CV generation
        # - User-contributed anonymized CVs
        # - Industry-specific CV samples
        
        # For demonstration, we'll create synthetic training data
        stats = await self._generate_synthetic_cvs(target_size)
        
        logger.info(f"CV dataset curation completed: {stats}")
        return stats
    
    async def _generate_synthetic_cvs(self, count: int) -> Dict[str, int]:
        """Generate synthetic CVs for training (demonstration purposes)"""
        
        # Industry distribution (realistic market distribution)
        industry_distribution = {
            "Technology": 0.25,
            "Healthcare": 0.12,
            "Finance": 0.10,
            "Education": 0.08,
            "Marketing": 0.08,
            "Sales": 0.07,
            "Engineering": 0.06,
            "Operations": 0.06,
            "Human Resources": 0.05,
            "Consulting": 0.05,
            "Design": 0.04,
            "Legal": 0.03,
            "Project Management": 0.01
        }
        
        # Experience level distribution
        level_distribution = {
            "entry": 0.30,
            "mid": 0.40,
            "senior": 0.25,
            "executive": 0.05
        }
        
        # Language distribution (Polish market focus)
        language_distribution = {
            "pl": 0.70,
            "en": 0.30
        }
        
        synthetic_cvs = []
        batch_size = 1000
        
        for batch_start in range(0, count, batch_size):
            batch_end = min(batch_start + batch_size, count)
            batch_cvs = []
            
            for i in range(batch_start, batch_end):
                # Generate synthetic CV
                cv_data = await self._generate_single_synthetic_cv(
                    i, industry_distribution, level_distribution, language_distribution
                )
                batch_cvs.append(cv_data)
            
            # Process batch
            await self._process_cv_batch(batch_cvs)
            
            if batch_start % 10000 == 0:
                logger.info(f"Generated {batch_start:,} synthetic CVs...")
        
        # Calculate final statistics
        stats = self._calculate_dataset_statistics()
        return stats
    
    async def _generate_single_synthetic_cv(self, index: int, industry_dist: Dict, 
                                          level_dist: Dict, lang_dist: Dict) -> CVDataPoint:
        """Generate a single synthetic CV data point"""
        
        # Select characteristics based on distributions
        industry = np.random.choice(list(industry_dist.keys()), p=list(industry_dist.values()))
        job_level = np.random.choice(list(level_dist.keys()), p=list(level_dist.values()))
        language = np.random.choice(list(lang_dist.keys()), p=list(lang_dist.values()))
        
        # Generate experience years based on level
        exp_ranges = {"entry": (0, 2), "mid": (3, 7), "senior": (8, 15), "executive": (16, 30)}
        experience_years = np.random.randint(*exp_ranges[job_level])
        
        # Generate synthetic CV content
        cv_content = self._generate_cv_content(industry, job_level, experience_years, language)
        
        # Create optimized version
        optimized_content = self._optimize_cv_content(cv_content, industry)
        
        # Calculate quality metrics
        quality_score = self._calculate_quality_score(cv_content)
        ats_score = self._calculate_synthetic_ats_score(optimized_content, industry)
        
        # Generate skills and certifications
        skills = self._generate_skills_for_industry(industry, job_level)
        certifications = self._generate_certifications(industry, experience_years)
        
        cv_id = f"synthetic_cv_{index:06d}_{hashlib.md5(cv_content.encode()).hexdigest()[:8]}"
        
        return CVDataPoint(
            id=cv_id,
            original_text=cv_content,
            optimized_text=optimized_content,
            industry=industry,
            ats_score=ats_score,
            job_level=job_level,
            experience_years=experience_years,
            skills=skills,
            certifications=certifications,
            education_level=self._generate_education_level(job_level),
            language=language,
            file_format=np.random.choice(["pdf", "docx", "txt"], p=[0.6, 0.3, 0.1]),
            quality_score=quality_score,
            annotations={
                "synthetic": True,
                "generation_method": "template_based",
                "industry_keywords": len([s for s in skills if s.lower() in cv_content.lower()])
            },
            created_at=datetime.now()
        )
    
    def _generate_cv_content(self, industry: str, level: str, years: int, language: str) -> str:
        """Generate realistic CV content based on parameters"""
        
        # Industry-specific templates
        templates = {
            "Technology": {
                "pl": """Jan Kowalski
Software Developer
Email: j.kowalski@email.com
Telefon: +48 123 456 789

Doświadczenie zawodowe:
- {years} lat doświadczenia w programowaniu
- Rozwój aplikacji webowych w {tech_stack}
- Praca z zespołami agile/scrum
- Implementacja rozwiązań chmurowych

Umiejętności techniczne: Python, JavaScript, React, Docker, AWS, PostgreSQL

Wykształcenie:
Informatyka, Politechnika Warszawska (2020)""",
                
                "en": """John Smith
Software Developer
Email: j.smith@email.com
Phone: +1 555 123 4567

Professional Experience:
- {years} years of programming experience
- Web application development with {tech_stack}
- Agile/scrum team collaboration
- Cloud solutions implementation

Technical Skills: Python, JavaScript, React, Docker, AWS, PostgreSQL

Education:
Computer Science, University of Technology (2020)"""
            },
            
            "Finance": {
                "pl": """Anna Nowak
Analityk Finansowy
Email: a.nowak@email.com
Telefon: +48 123 456 789

Doświadczenie zawodowe:
- {years} lat doświadczenia w analizie finansowej
- Modelowanie finansowe i wyceny
- Analiza ryzyka inwestycyjnego
- Przygotowanie raportów dla zarządu

Umiejętności: Excel zaawansowany, PowerBI, SQL, Python, analiza danych

Wykształcenie:
Finanse i Rachunkowość, SGH Warszawa (2019)""",
                
                "en": """Jane Wilson
Financial Analyst
Email: j.wilson@email.com
Phone: +1 555 123 4567

Professional Experience:
- {years} years in financial analysis
- Financial modeling and valuations
- Investment risk analysis
- Executive reporting

Skills: Advanced Excel, PowerBI, SQL, Python, data analysis

Education:
Finance and Accounting, University of Economics (2019)"""
            }
        }
        
        # Get template or use default
        industry_templates = templates.get(industry, templates["Technology"])
        template = industry_templates.get(language, industry_templates["en"])
        
        # Generate tech stack for technology industry
        tech_stacks = ["Python/Django", "JavaScript/React", "Java/Spring", "C#/.NET", "PHP/Laravel"]
        tech_stack = np.random.choice(tech_stacks)
        
        # Fill template
        content = template.format(years=years, tech_stack=tech_stack)
        
        # Add level-specific content
        if level == "senior":
            if language == "pl":
                content += "\n\nDodatkowe doświadczenie:\n- Prowadzenie zespołu programistów\n- Mentoring junior developers"
            else:
                content += "\n\nAdditional Experience:\n- Team leadership\n- Junior developer mentoring"
        elif level == "executive":
            if language == "pl":
                content += "\n\nDoświadczenie kierownicze:\n- Zarządzanie działem IT\n- Strategia technologiczna firmy"
            else:
                content += "\n\nExecutive Experience:\n- IT department management\n- Technology strategy"
        
        return content
    
    def _optimize_cv_content(self, original: str, industry: str) -> str:
        """Create optimized version of CV content"""
        
        # This simulates the ML optimization process
        # In production, this would use the actual CV optimization model
        
        optimizations = [
            "Enhanced with action verbs",
            "Improved keyword density",
            "Better ATS formatting",
            "Quantified achievements",
            "Industry-specific terminology"
        ]
        
        # Add optimization header
        optimized = f"[OPTIMIZED CV - {', '.join(optimizations[:3])}]\n\n"
        optimized += original
        
        # Add industry-specific keywords
        industry_keywords = {
            "Technology": ["agile", "CI/CD", "microservices", "scalable", "performance optimization"],
            "Finance": ["risk management", "compliance", "financial modeling", "ROI analysis"],
            "Healthcare": ["patient care", "clinical research", "regulatory compliance"],
        }
        
        keywords = industry_keywords.get(industry, [])
        if keywords:
            if "English" in original or "Email" in original:
                optimized += f"\n\nKey Competencies: {', '.join(keywords)}"
            else:
                optimized += f"\n\nKluczowe kompetencje: {', '.join(keywords)}"
        
        return optimized
    
    def _calculate_quality_score(self, content: str) -> float:
        """Calculate quality score for CV content"""
        score = 50.0  # Base score
        
        # Length bonus
        word_count = len(content.split())
        if 200 <= word_count <= 800:
            score += 20
        elif 100 <= word_count < 200 or 800 < word_count <= 1200:
            score += 10
        
        # Structure bonus
        if "@" in content:  # Has email
            score += 5
        if re.search(r'\d{3}[-.\s]?\d{3}[-.\s]?\d{4}', content):  # Has phone
            score += 5
        if "Experience" in content or "Doświadczenie" in content:
            score += 10
        if "Skills" in content or "Umiejętności" in content:
            score += 10
        
        return min(100.0, score)
    
    def _calculate_synthetic_ats_score(self, content: str, industry: str) -> float:
        """Calculate synthetic ATS score"""
        base_score = 65.0 + np.random.normal(0, 10)
        
        # Industry-specific adjustments
        if industry == "Technology" and any(tech in content.lower() for tech in ["python", "javascript", "react"]):
            base_score += 15
        elif industry == "Finance" and any(fin in content.lower() for fin in ["excel", "analysis", "financial"]):
            base_score += 15
        
        return min(100.0, max(0.0, base_score))
    
    def _generate_skills_for_industry(self, industry: str, level: str) -> List[str]:
        """Generate realistic skills based on industry and level"""
        
        skills_db = {
            "Technology": {
                "entry": ["Python", "JavaScript", "HTML/CSS", "Git", "SQL"],
                "mid": ["Python", "JavaScript", "React", "Docker", "AWS", "PostgreSQL", "REST API"],
                "senior": ["Python", "JavaScript", "React", "Docker", "Kubernetes", "AWS", "PostgreSQL", "Microservices", "Team Leadership"],
                "executive": ["Strategic Planning", "Technology Roadmap", "Team Management", "Budget Planning", "Vendor Relations"]
            },
            "Finance": {
                "entry": ["Excel", "Financial Analysis", "Data Entry", "Basic Accounting"],
                "mid": ["Advanced Excel", "Financial Modeling", "PowerBI", "SQL", "Risk Analysis"],
                "senior": ["Financial Strategy", "Investment Analysis", "Team Leadership", "Regulatory Compliance"],
                "executive": ["Strategic Finance", "M&A", "Board Reporting", "Budget Management", "Investor Relations"]
            }
        }
        
        return skills_db.get(industry, {}).get(level, ["Communication", "Problem Solving", "Teamwork"])
    
    def _generate_certifications(self, industry: str, years: int) -> List[str]:
        """Generate realistic certifications"""
        if years < 3:
            return []
        
        certs_by_industry = {
            "Technology": ["AWS Certified", "Google Cloud Certified", "Certified Scrum Master"],
            "Finance": ["CFA", "CPA", "FRM"],
            "Project Management": ["PMP", "PRINCE2", "Certified Scrum Master"]
        }
        
        available_certs = certs_by_industry.get(industry, [])
        num_certs = min(len(available_certs), max(0, int(years / 5)))
        
        if num_certs > 0:
            return list(np.random.choice(available_certs, size=num_certs, replace=False))
        return []
    
    def _generate_education_level(self, job_level: str) -> str:
        """Generate education level based on job level"""
        education_by_level = {
            "entry": ["Bachelor's", "Associate", "High School"],
            "mid": ["Bachelor's", "Master's"],
            "senior": ["Bachelor's", "Master's", "MBA"],
            "executive": ["Master's", "MBA", "PhD"]
        }
        
        options = education_by_level[job_level]
        weights = [0.6, 0.3, 0.1] if len(options) == 3 else [0.7, 0.3]
        
        return np.random.choice(options, p=weights)
    
    async def _process_cv_batch(self, cv_batch: List[CVDataPoint]):
        """Process and store batch of CVs"""
        
        # Quality filtering
        filtered_cvs = [cv for cv in cv_batch if cv.quality_score >= self.min_quality_score]
        
        # Anonymization
        anonymized_cvs = []
        for cv in filtered_cvs:
            anonymized_cv = self._anonymize_cv(cv)
            anonymized_cvs.append(anonymized_cv)
        
        # Store in database
        await self._store_cvs_in_db(anonymized_cvs)
        
        logger.debug(f"Processed batch: {len(cv_batch)} -> {len(filtered_cvs)} -> {len(anonymized_cvs)}")
    
    def _anonymize_cv(self, cv: CVDataPoint) -> CVDataPoint:
        """Anonymize PII from CV content"""
        
        anonymized_original = self._anonymize_text(cv.original_text)
        anonymized_optimized = self._anonymize_text(cv.optimized_text)
        
        return CVDataPoint(
            id=cv.id,
            original_text=anonymized_original,
            optimized_text=anonymized_optimized,
            industry=cv.industry,
            ats_score=cv.ats_score,
            job_level=cv.job_level,
            experience_years=cv.experience_years,
            skills=cv.skills,
            certifications=cv.certifications,
            education_level=cv.education_level,
            language=cv.language,
            file_format=cv.file_format,
            quality_score=cv.quality_score,
            annotations=cv.annotations,
            created_at=cv.created_at
        )
    
    def _anonymize_text(self, text: str) -> str:
        """Anonymize PII in text content"""
        
        anonymized = text
        
        # Replace emails
        anonymized = re.sub(self.pii_patterns['email'], 'email@example.com', anonymized)
        
        # Replace phone numbers
        anonymized = re.sub(self.pii_patterns['phone'], '+1-555-0123', anonymized)
        
        # Replace SSN
        anonymized = re.sub(self.pii_patterns['ssn'], 'XXX-XX-XXXX', anonymized)
        
        # Replace addresses
        anonymized = re.sub(self.pii_patterns['address'], '123 Main Street', anonymized)
        
        # Replace names (simple approach - in production would use NER)
        for pattern in self.pii_patterns['name_patterns']:
            anonymized = re.sub(pattern, 'John Smith', anonymized)
        
        return anonymized
    
    async def _store_cvs_in_db(self, cvs: List[CVDataPoint]):
        """Store CVs in SQLite database"""
        
        with sqlite3.connect(self.cv_db_path) as conn:
            for cv in cvs:
                data = cv.to_dict()
                data['skills'] = json.dumps(data['skills'])
                data['certifications'] = json.dumps(data['certifications'])
                data['annotations'] = json.dumps(data['annotations'])
                
                conn.execute("""
                    INSERT OR REPLACE INTO cv_data VALUES (
                        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
                    )
                """, (
                    data['id'], data['original_text'], data['optimized_text'],
                    data['industry'], data['ats_score'], data['job_level'],
                    data['experience_years'], data['skills'], data['certifications'],
                    data['education_level'], data['language'], data['file_format'],
                    data['quality_score'], data['annotations'], data['created_at']
                ))
    
    def _calculate_dataset_statistics(self) -> Dict[str, int]:
        """Calculate dataset statistics"""
        
        with sqlite3.connect(self.cv_db_path) as conn:
            cursor = conn.cursor()
            
            # Total count
            cursor.execute("SELECT COUNT(*) FROM cv_data")
            total = cursor.fetchone()[0]
            
            # By industry
            cursor.execute("SELECT industry, COUNT(*) FROM cv_data GROUP BY industry")
            by_industry = dict(cursor.fetchall())
            
            # By language
            cursor.execute("SELECT language, COUNT(*) FROM cv_data GROUP BY language")
            by_language = dict(cursor.fetchall())
            
            # By job level
            cursor.execute("SELECT job_level, COUNT(*) FROM cv_data GROUP BY job_level")
            by_level = dict(cursor.fetchall())
            
            # Quality distribution
            cursor.execute("SELECT AVG(quality_score), MIN(quality_score), MAX(quality_score) FROM cv_data")
            quality_stats = cursor.fetchone()
        
        return {
            "total_cvs": total,
            "by_industry": by_industry,
            "by_language": by_language,
            "by_job_level": by_level,
            "quality_stats": {
                "average": round(quality_stats[0], 1) if quality_stats[0] else 0,
                "min": quality_stats[1] or 0,
                "max": quality_stats[2] or 0
            }
        }
    
    def get_training_data(self, industry: Optional[str] = None, 
                         language: Optional[str] = None,
                         min_quality: float = 60.0,
                         limit: Optional[int] = None) -> List[CVDataPoint]:
        """Retrieve training data with filters"""
        
        query = "SELECT * FROM cv_data WHERE quality_score >= ?"
        params = [min_quality]
        
        if industry:
            query += " AND industry = ?"
            params.append(industry)
        
        if language:
            query += " AND language = ?"
            params.append(language)
        
        if limit:
            query += " LIMIT ?"
            params.append(limit)
        
        with sqlite3.connect(self.cv_db_path) as conn:
            cursor = conn.cursor()
            cursor.execute(query, params)
            rows = cursor.fetchall()
        
        # Convert to CVDataPoint objects
        cvs = []
        columns = [desc[0] for desc in cursor.description]
        
        for row in rows:
            data = dict(zip(columns, row))
            data['skills'] = json.loads(data['skills'])
            data['certifications'] = json.loads(data['certifications'])
            data['annotations'] = json.loads(data['annotations'])
            cvs.append(CVDataPoint.from_dict(data))
        
        return cvs


if __name__ == "__main__":
    # Test the data pipeline
    print("🔄 CVPerfect ML Training Data Pipeline - Testing...")
    
    async def test_pipeline():
        curator = CVDataCurator()
        
        # Generate small test dataset
        print("📊 Generating test dataset (1000 samples)...")
        stats = await curator.curate_cv_dataset(target_size=1000)
        
        print(f"✅ Dataset created:")
        print(f"   Total CVs: {stats['total_cvs']:,}")
        print(f"   Industries: {len(stats['by_industry'])}")
        print(f"   Languages: {stats['by_language']}")
        print(f"   Quality: {stats['quality_stats']['average']}/100 average")
        
        # Test data retrieval
        tech_cvs = curator.get_training_data(industry="Technology", limit=10)
        print(f"📋 Retrieved {len(tech_cvs)} Technology CVs for testing")
        
        if tech_cvs:
            sample = tech_cvs[0]
            print(f"📄 Sample CV: {sample.id}")
            print(f"   Industry: {sample.industry}")
            print(f"   ATS Score: {sample.ats_score}")
            print(f"   Skills: {len(sample.skills)} skills")
        
        print("✅ Data pipeline test completed successfully")
    
    # Run test
    asyncio.run(test_pipeline())