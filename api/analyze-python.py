"""
CVPerfect Analyze API - Python Implementation
Optimized for Vercel Functions
"""

from http.server import BaseHTTPRequestHandler
import json
import os
from urllib.parse import parse_qs

class handler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        """Handle CORS preflight"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
        
    def do_POST(self):
        """Handle POST requests"""
        try:
            # Read request body
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            data = json.loads(post_data.decode('utf-8'))
            
            # Extract data
            current_cv = data.get('currentCV', '')
            email = data.get('email', '')
            job_posting = data.get('jobPosting', '')
            
            # Validation
            if not current_cv or not email:
                self.send_error_response(400, "CV i email są wymagane")
                return
                
            if len(current_cv) < 10:
                self.send_error_response(400, "CV jest za krótkie")
                return
                
            # Mock response for testing
            response = {
                "success": True,
                "optimizedCV": f"""Jan Kowalski
Email: {email}
Telefon: +48 123 456 789

PROFIL ZAWODOWY
Doświadczony Full Stack Developer z 6-letnim doświadczeniem w tworzeniu aplikacji webowych.
Specjalizacja w React, Node.js oraz Python. Poszukuję stanowiska Senior Developer.

DOŚWIADCZENIE ZAWODOWE

Senior Full Stack Developer | ABC Company | 2020-2024
• Projektowanie i rozwój aplikacji e-commerce obsługującej 100k użytkowników
• Implementacja mikroserwisów w Node.js i Python
• Optymalizacja wydajności - redukcja czasu ładowania o 60%
• Mentoring zespołu 5 junior developerów

Full Stack Developer | XYZ Startup | 2018-2020  
• Rozwój aplikacji SaaS w React i Django
• Integracja z API płatności Stripe i PayPal
• Wdrożenie CI/CD z użyciem GitLab
• Współpraca w zespole Agile/Scrum

WYKSZTAŁCENIE

Magister Informatyki | Uniwersytet Warszawski | 2014-2018
• Specjalizacja: Inżynieria Oprogramowania
• Praca magisterska: "Optymalizacja aplikacji webowych z użyciem Machine Learning"

UMIEJĘTNOŚCI TECHNICZNE

Języki: JavaScript (ES6+), Python, TypeScript, SQL
Frontend: React, Next.js, Vue.js, HTML5, CSS3, Tailwind CSS  
Backend: Node.js, Express, Django, FastAPI
Bazy danych: PostgreSQL, MongoDB, Redis
DevOps: Docker, Kubernetes, AWS, CI/CD
Narzędzia: Git, Jira, Figma, VS Code

CERTYFIKATY
• AWS Certified Solutions Architect (2023)
• Google Cloud Professional Developer (2022)

JĘZYKI
• Polski - ojczysty
• Angielski - C1 (biegły)""",
                "coverLetter": f"""Szanowni Państwo,

Z dużym zainteresowaniem aplikuję na stanowisko opisane w Państwa ogłoszeniu. Jako doświadczony Full Stack Developer z 6-letnim doświadczeniem, jestem przekonany, że moje umiejętności idealnie odpowiadają Państwa wymaganiom.

W mojej dotychczasowej karierze:
• Rozwijałem aplikacje obsługujące setki tysięcy użytkowników
• Implementowałem rozwiązania w React i Node.js
• Prowadziłem projekty od koncepcji do wdrożenia produkcyjnego
• Mentorowałem młodszych członków zespołu

Jestem entuzjastycznie nastawiony do możliwości dołączenia do Państwa zespołu i wniesienia swojego doświadczenia w rozwój innowacyjnych rozwiązań.

Z poważaniem,
Jan Kowalski""",
                "improvements": [
                    "✅ Dodano sekcję PROFIL ZAWODOWY z kluczowymi kompetencjami",
                    "✅ Rozbudowano opisy doświadczenia z konkretnymi osiągnięciami", 
                    "✅ Dodano metryki wydajności (60% redukcja czasu ładowania)",
                    "✅ Uwypuklono umiejętności techniczne zgodnez wymaganiami",
                    "✅ Dodano certyfikaty branżowe",
                    "✅ Zoptymalizowano słowa kluczowe dla ATS"
                ],
                "keywordMatch": 85,
                "metadata": {
                    "processingTime": 1.2,
                    "provider": "Python Mock API",
                    "timestamp": "2025-08-27T15:00:00Z"
                }
            }
            
            # Send response
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(response).encode('utf-8'))
            
        except Exception as e:
            self.send_error_response(500, str(e))
            
    def send_error_response(self, code, message):
        """Send error response"""
        response = {
            "success": False,
            "error": message
        }
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        self.wfile.write(json.dumps(response).encode('utf-8'))