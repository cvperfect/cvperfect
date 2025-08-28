# -*- coding: utf-8 -*-
"""
CVPerfect Template System - Jinja2 templates with plan-based access control.

Supports 3 plan tiers:
- Basic (19.99 PLN): Standard template, basic sections
- Gold (49 PLN): 3 templates, extended sections, premium styling
- Premium (79 PLN): 7 templates, photos, animations, premium features
"""

import os
from pathlib import Path
from typing import Dict, Any, List
from jinja2 import Environment, FileSystemLoader, select_autoescape
from dataclasses import dataclass

from extract import CVSections


@dataclass
class PlanFeatures:
    """Features available for each plan."""
    templates: List[str]
    sections: List[str]
    photos: bool
    premium_styles: bool
    animations: bool
    export_quality: str
    max_colors: int


# Plan-based feature matrix
PLAN_FEATURES = {
    'basic': PlanFeatures(
        templates=['standard'],
        sections=['contact', 'summary', 'experience', 'skills', 'education'],
        photos=False,
        premium_styles=False,
        animations=False,
        export_quality='standard',
        max_colors=2
    ),
    'gold': PlanFeatures(
        templates=['standard', 'modern', 'classic'],
        sections=['contact', 'summary', 'experience', 'skills', 'education', 
                 'projects', 'certificates', 'languages'],
        photos=False,
        premium_styles=True,
        animations=False,
        export_quality='high',
        max_colors=4
    ),
    'premium': PlanFeatures(
        templates=['standard', 'modern', 'classic', 'executive', 'creative', 
                  'technical', 'minimalist'],
        sections=['all'],  # All available sections
        photos=True,
        premium_styles=True,
        animations=True,
        export_quality='premium',
        max_colors=8
    )
}


class CVTemplateRenderer:
    """Jinja2-based CV template renderer with plan-based access control."""
    
    def __init__(self, plan: str = "basic", template_dir: str = None):
        """
        Initialize the template renderer.
        
        Args:
            plan: User's plan (basic, gold, premium)
            template_dir: Custom template directory path
        """
        self.plan = plan.lower()
        self.features = PLAN_FEATURES.get(self.plan, PLAN_FEATURES['basic'])
        
        # Setup template directory
        if template_dir is None:
            current_dir = Path(__file__).parent
            template_dir = current_dir / 'templates'
        
        self.template_dir = Path(template_dir)
        
        # Initialize Jinja2 environment
        self.env = Environment(
            loader=FileSystemLoader(str(self.template_dir)),
            autoescape=select_autoescape(['html', 'xml']),
            trim_blocks=True,
            lstrip_blocks=True
        )
        
        # Add custom filters
        self.env.filters['plan_filter'] = self._plan_filter
        self.env.filters['section_allowed'] = self._section_allowed
    
    def _plan_filter(self, value: Any, required_plan: str) -> Any:
        """Jinja2 filter to show content only for specific plans."""
        if self.plan == 'premium':
            return value
        elif self.plan == 'gold' and required_plan in ['basic', 'gold']:
            return value
        elif self.plan == 'basic' and required_plan == 'basic':
            return value
        return None
    
    def _section_allowed(self, section_name: str) -> bool:
        """Check if section is allowed for current plan."""
        if 'all' in self.features.sections:
            return True
        return section_name in self.features.sections
    
    def get_plan_styles(self) -> str:
        """Get CSS styles based on plan."""
        styles_map = {
            'basic': self._load_basic_styles(),
            'gold': self._load_gold_styles(),
            'premium': self._load_premium_styles()
        }
        return styles_map.get(self.plan, styles_map['basic'])
    
    def _load_basic_styles(self) -> str:
        """Basic plan CSS - clean, ATS-friendly."""
        return """
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #fff;
        }
        
        h1 {
            color: #2c3e50;
            border-bottom: 2px solid #3498db;
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        
        h2 {
            color: #34495e;
            margin: 25px 0 15px 0;
            font-size: 1.3em;
        }
        
        h3 {
            color: #2980b9;
            margin-bottom: 5px;
        }
        
        .contact {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 25px;
        }
        
        .contact-item {
            margin: 5px 0;
        }
        
        .experience-item, .education-item {
            margin: 15px 0;
            padding: 10px 0;
            border-bottom: 1px solid #eee;
        }
        
        .date {
            color: #7f8c8d;
            font-style: italic;
            font-size: 0.9em;
        }
        
        .skills {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        
        .skill {
            background: #3498db;
            color: white;
            padding: 4px 10px;
            border-radius: 15px;
            font-size: 0.85em;
        }
        
        ul {
            padding-left: 20px;
            margin: 10px 0;
        }
        
        li {
            margin: 3px 0;
        }
        
        .summary {
            font-style: italic;
            color: #555;
            margin-bottom: 25px;
            padding: 15px;
            border-left: 3px solid #3498db;
            background: #f8f9fa;
        }
        """
    
    def _load_gold_styles(self) -> str:
        """Gold plan CSS - professional styling with colors."""
        return """
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #2c3e50;
            max-width: 850px;
            margin: 0 auto;
            padding: 25px;
            background: #fff;
        }
        
        .header {
            text-align: center;
            border-bottom: 3px solid #2980b9;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        
        h1 {
            color: #2c3e50;
            font-size: 2.2em;
            font-weight: 300;
            letter-spacing: -1px;
        }
        
        h2 {
            color: #2980b9;
            margin: 30px 0 15px 0;
            font-size: 1.4em;
            font-weight: 500;
            position: relative;
        }
        
        h2:after {
            content: '';
            position: absolute;
            bottom: -5px;
            left: 0;
            width: 50px;
            height: 2px;
            background: #e74c3c;
        }
        
        h3 {
            color: #2c3e50;
            margin-bottom: 8px;
            font-weight: 600;
        }
        
        .contact {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            border-left: 4px solid #2980b9;
        }
        
        .contact-item {
            margin: 8px 0;
            font-size: 1.05em;
        }
        
        .experience-item, .education-item, .project-item {
            margin: 20px 0;
            padding: 15px;
            border-radius: 6px;
            background: #f8f9fa;
            border-left: 3px solid #e74c3c;
        }
        
        .company, .institution {
            color: #e74c3c;
            font-weight: 500;
            font-size: 1.05em;
        }
        
        .date {
            color: #7f8c8d;
            font-style: italic;
            font-size: 0.95em;
            float: right;
        }
        
        .skills {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin: 15px 0;
        }
        
        .skill {
            background: linear-gradient(135deg, #2980b9 0%, #3498db 100%);
            color: white;
            padding: 6px 14px;
            border-radius: 20px;
            font-size: 0.9em;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .summary {
            font-size: 1.05em;
            color: #555;
            margin-bottom: 30px;
            padding: 20px;
            border-radius: 8px;
            background: linear-gradient(135deg, #ecf0f1 0%, #d5dbdb 100%);
            border-left: 4px solid #f39c12;
        }
        
        ul {
            padding-left: 25px;
            margin: 12px 0;
        }
        
        li {
            margin: 5px 0;
            line-height: 1.7;
        }
        
        .section-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }
        
        .certificates, .languages {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            border-left: 3px solid #27ae60;
        }
        """
    
    def _load_premium_styles(self) -> str:
        """Premium plan CSS - advanced styling with animations and effects."""
        return """
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.7;
            color: #2c3e50;
            max-width: 900px;
            margin: 0 auto;
            padding: 30px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
        }
        
        .cv-container {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 15px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            padding: 40px;
            border: 1px solid rgba(255,255,255,0.2);
        }
        
        .header {
            text-align: center;
            position: relative;
            margin-bottom: 40px;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 100px;
            height: 3px;
            background: linear-gradient(90deg, #667eea, #764ba2);
            border-radius: 2px;
        }
        
        h1 {
            color: #2c3e50;
            font-size: 2.5em;
            font-weight: 300;
            letter-spacing: -2px;
            margin-top: 15px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        h2 {
            color: #2c3e50;
            margin: 35px 0 20px 0;
            font-size: 1.5em;
            font-weight: 500;
            position: relative;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        
        h2::after {
            content: '';
            position: absolute;
            bottom: -8px;
            left: 0;
            width: 60px;
            height: 3px;
            background: linear-gradient(90deg, #667eea, #764ba2);
            border-radius: 2px;
        }
        
        h3 {
            color: #2c3e50;
            margin-bottom: 10px;
            font-weight: 600;
            font-size: 1.2em;
        }
        
        .contact {
            background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
            padding: 25px;
            border-radius: 12px;
            margin-bottom: 35px;
            border: 1px solid rgba(102, 126, 234, 0.2);
            backdrop-filter: blur(5px);
        }
        
        .contact-item {
            margin: 10px 0;
            font-size: 1.1em;
            color: #34495e;
        }
        
        .experience-item, .education-item, .project-item {
            margin: 25px 0;
            padding: 20px;
            border-radius: 10px;
            background: linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(240,240,240,0.8) 100%);
            border-left: 4px solid #667eea;
            box-shadow: 0 5px 15px rgba(0,0,0,0.05);
            transition: all 0.3s ease;
        }
        
        .experience-item:hover, .education-item:hover, .project-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }
        
        .company, .institution {
            color: #667eea;
            font-weight: 600;
            font-size: 1.1em;
        }
        
        .date {
            color: #7f8c8d;
            font-style: italic;
            font-size: 0.95em;
            float: right;
            background: rgba(102, 126, 234, 0.1);
            padding: 2px 8px;
            border-radius: 10px;
        }
        
        .skills {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin: 20px 0;
        }
        
        .skill {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 8px 16px;
            border-radius: 25px;
            font-size: 0.9em;
            box-shadow: 0 4px 8px rgba(102, 126, 234, 0.3);
            transition: all 0.3s ease;
            border: 1px solid rgba(255,255,255,0.2);
        }
        
        .skill:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(102, 126, 234, 0.4);
        }
        
        .summary {
            font-size: 1.1em;
            color: #555;
            margin-bottom: 35px;
            padding: 25px;
            border-radius: 12px;
            background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(240,240,240,0.9) 100%);
            border-left: 4px solid #764ba2;
            box-shadow: 0 5px 15px rgba(0,0,0,0.05);
            line-height: 1.8;
        }
        
        ul {
            padding-left: 25px;
            margin: 15px 0;
        }
        
        li {
            margin: 8px 0;
            line-height: 1.8;
            position: relative;
        }
        
        li::before {
            content: '�';
            color: #667eea;
            font-weight: bold;
            position: absolute;
            left: -20px;
        }
        
        .section-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 25px;
            margin-top: 20px;
        }
        
        .certificates, .languages {
            background: linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(240,240,240,0.8) 100%);
            padding: 20px;
            border-radius: 10px;
            border-left: 4px solid #27ae60;
            box-shadow: 0 5px 15px rgba(0,0,0,0.05);
        }
        
        .photo-placeholder {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 2em;
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
        }
        
        @media print {
            body {
                background: white;
            }
            .cv-container {
                box-shadow: none;
                background: white;
            }
            .skill:hover, .experience-item:hover {
                transform: none;
            }
        }
        
        @media (max-width: 768px) {
            .section-grid {
                grid-template-columns: 1fr;
            }
            
            .date {
                float: none;
                display: block;
                margin-top: 5px;
            }
        }
        """
    
    def render_cv(self, sections: CVSections, template_choice: str = "standard", **kwargs) -> str:
        """
        Render CV using selected template and plan-based features.
        
        Args:
            sections: Extracted CV sections
            template_choice: Selected template name
            **kwargs: Additional template variables
            
        Returns:
            Rendered HTML string
        """
        # Validate template choice against plan
        if template_choice not in self.features.templates:
            template_choice = self.features.templates[0]  # Fallback to first available
        
        # Filter sections based on plan
        filtered_sections = self._filter_sections(sections)
        
        # Prepare template context
        context = {
            'sections': filtered_sections,
            'plan': self.plan,
            'features': self.features,
            'plan_styles': self.get_plan_styles(),
            'template_choice': template_choice,
            **kwargs
        }
        
        # Load and render template
        template_file = f"plans/{self.plan}.html.j2"
        try:
            template = self.env.get_template(template_file)
        except:
            # Fallback to base template
            template = self.env.get_template("base.html.j2")
        
        return template.render(**context)
    
    def _filter_sections(self, sections: CVSections) -> CVSections:
        """Filter sections based on plan permissions."""
        # For premium, return all sections
        if self.plan == 'premium':
            return sections
        
        # For other plans, filter sections
        allowed_sections = self.features.sections
        
        # Create filtered copy
        filtered = CVSections(
            contact=sections.contact if 'contact' in allowed_sections else {},
            summary=sections.summary if 'summary' in allowed_sections else None,
            experience=sections.experience if 'experience' in allowed_sections else [],
            education=sections.education if 'education' in allowed_sections else [],
            skills=sections.skills if 'skills' in allowed_sections else [],
            projects=sections.projects if 'projects' in allowed_sections else [],
            certificates=sections.certificates if 'certificates' in allowed_sections else [],
            interests=sections.interests if 'interests' in allowed_sections else [],
            languages=sections.languages if 'languages' in allowed_sections else [],
            raw_sections=sections.raw_sections
        )
        
        return filtered
    
    def get_available_templates(self) -> List[str]:
        """Get list of templates available for current plan."""
        return self.features.templates.copy()
    
    def can_use_template(self, template_name: str) -> bool:
        """Check if template is available for current plan."""
        return template_name in self.features.templates