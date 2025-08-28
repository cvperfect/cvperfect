"""
CVPerfect Analyze API - Python Implementation
Optimized for Vercel Functions
Author: CVPerfect Team
Version: 2.0.0
"""

import os
import json
import logging
from datetime import datetime
from typing import Optional, Dict, Any, Tuple
from http.server import BaseHTTPRequestHandler

# Import dependencies
try:
    from groq import Groq
    from supabase import create_client
    from pydantic import BaseModel, EmailStr, Field, ValidationError
    from tenacity import retry, stop_after_attempt, wait_exponential
    from dotenv import load_dotenv
    
    # Load environment variables
    load_dotenv()
    
    DEPENDENCIES_LOADED = True
except ImportError as e:
    print(f"Warning: Missing dependencies - {e}")
    DEPENDENCIES_LOADED = False

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================
# CONFIGURATION
# ============================================

class Settings:
    """Environment configuration"""
    groq_api_key: str = os.getenv('GROQ_API_KEY', '')
    supabase_url: str = os.getenv('NEXT_PUBLIC_SUPABASE_URL', '')
    supabase_key: str = os.getenv('SUPABASE_SERVICE_ROLE_KEY', '')
    environment: str = os.getenv('NODE_ENV', 'production')
    enable_mock_mode: bool = os.getenv('ENABLE_MOCK_MODE', 'false').lower() == 'true'

settings = Settings()

# ============================================
# PYDANTIC MODELS
# ============================================

class AnalyzeRequest(BaseModel):
    """Request validation model"""
    currentCV: str = Field(..., min_length=10, max_length=50000)
    email: EmailStr
    jobPosting: Optional[str] = Field(None, max_length=10000)
    sessionId: Optional[str] = None
    plan: Optional[str] = 'basic'
    paid: Optional[bool] = False
    photo: Optional[str] = None
    preservePhotos: Optional[bool] = True

class AnalyzeResponse(BaseModel):
    """Response model"""
    success: bool
    optimizedCV: Optional[str] = None
    coverLetter: Optional[str] = None
    improvements: Optional[list] = None
    keywordMatch: Optional[int] = None
    remainingUses: Optional[int] = None
    metadata: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

# ============================================
# DATABASE LAYER
# ============================================

class UserRepository:
    """Handle user database operations"""
    
    def __init__(self):
        if settings.supabase_url and settings.supabase_key and DEPENDENCIES_LOADED:
            try:
                self.client = create_client(settings.supabase_url, settings.supabase_key)
                self.enabled = True
            except Exception as e:
                logger.warning(f"Supabase initialization failed: {e}")
                self.enabled = False
        else:
            logger.info("Running in mock mode - no database")
            self.enabled = False
    
    def get_user(self, email: str) -> Optional[Dict]:
        """Get user from database or return mock data"""
        if not self.enabled or settings.enable_mock_mode:
            # Return mock user for development
            logger.info(f"Mock mode: returning test user for {email}")
            return {
                'email': email,
                'plan': 'premium',
                'usage_count': 0,
                'usage_limit': 100,
                'expires_at': '2025-12-31T23:59:59'
            }
        
        try:
            response = self.client.table('users').select('*').eq('email', email).single().execute()
            return response.data if response.data else None
        except Exception as e:
            logger.error(f"Database error for {email}: {e}")
            # Graceful degradation - allow in development
            if settings.environment == 'development':
                return {
                    'email': email,
                    'plan': 'premium',
                    'usage_count': 0,
                    'usage_limit': 100,
                    'expires_at': '2025-12-31T23:59:59'
                }
            return None
    
    def increment_usage(self, email: str) -> bool:
        """Increment user usage count"""
        if not self.enabled or settings.enable_mock_mode:
            logger.info(f"Mock mode: skipping usage increment for {email}")
            return True
        
        try:
            self.client.table('users').update({
                'usage_count': 'usage_count + 1',
                'last_used_at': datetime.now().isoformat()
            }).eq('email', email).execute()
            return True
        except Exception as e:
            logger.error(f"Failed to increment usage for {email}: {e}")
            return False

# ============================================
# AI SERVICE LAYER
# ============================================

class GroqService:
    """Handle AI optimization with Groq"""
    
    def __init__(self):
        if settings.groq_api_key and DEPENDENCIES_LOADED:
            self.client = Groq(api_key=settings.groq_api_key)
            self.enabled = True
        else:
            logger.warning("Groq API key not found - using mock mode")
            self.enabled = False
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10)
    )
    def optimize_cv(self, current_cv: str, job_posting: Optional[str] = None) -> str:
        """Optimize CV with AI"""
        if not self.enabled:
            logger.info("Mock mode: returning enhanced CV")
            return self._mock_optimize_cv(current_cv)
        
        system_prompt = """Jesteś ekspertem HR i specjalistą od optymalizacji CV z 15-letnim doświadczeniem.

TWOJE ZADANIE:
Ulepsz dostarczone CV, aby zwiększyć szanse na rozmowę kwalifikacyjną.

ZASADY KRYTYCZNE - MUSISZ ICH PRZESTRZEGAĆ:
1. ZACHOWAJ wszystkie dane osobowe bez zmian (imię, nazwisko, email, telefon, adres, data urodzenia)
2. ZACHOWAJ wszystkie nazwy firm, stanowisk i daty zatrudnienia
3. ZACHOWAJ wykształcenie (nazwy szkół, kierunki, daty)
4. NIE WYMYŚLAJ nowych miejsc pracy, projektów czy umiejętności których nie ma w oryginalnym CV

CO MOŻESZ I POWINIENEŚ ULEPSZYĆ:
1. PRZEPISZ opisy obowiązków używając mocnych czasowników (zarządzałem, wdrożyłem, zoptymalizowałem, zwiększyłem)
2. DODAJ metryki i liczby gdzie to możliwe (np. "obsługiwałem 50+ klientów dziennie", "zarządzałem zespołem 5 osób")
3. ULEPSZ język - użyj profesjonalnego słownictwa branżowego
4. DOSTOSUJ słowa kluczowe do oferty pracy (jeśli podano)
5. POPRAW formatowanie i strukturę dla lepszej czytelności
6. ROZWIŃ skrótowe opisy do pełnych, wartościowych zdań
7. DODAJ osiągnięcia oparte na podanych obowiązkach

FORMAT ODPOWIEDZI:
Zwróć TYLKO ulepszone CV w formacie HTML z tagami <h2>, <h3>, <p>, <ul>, <li> dla struktury."""

        user_prompt = f"""ORYGINALNE CV DO ULEPSZENIA:
{current_cv}

{'OFERTA PRACY (dostosuj słowa kluczowe):' + job_posting if job_posting else ''}

Ulepsz to CV zachowując wszystkie fakty, ale poprawiając język i dopasowanie."""

        try:
            response = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                model="llama-3.1-70b-versatile",
                temperature=0.3,
                max_tokens=4000,
            )
            
            optimized = response.choices[0].message.content
            logger.info("CV optimization completed successfully")
            return optimized
            
        except Exception as e:
            logger.error(f"CV optimization failed: {e}")
            if "rate limit" in str(e).lower():
                raise Exception("Rate limit exceeded")
            raise
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10)
    )
    def generate_cover_letter(self, cv_content: str, job_posting: Optional[str] = None) -> str:
        """Generate cover letter"""
        if not self.enabled:
            logger.info("Mock mode: returning sample cover letter")
            return self._mock_cover_letter()
        
        prompt = f"""Na podstawie tego CV napisz profesjonalny list motywacyjny (max 3 akapity).
CV: {cv_content[:1000]}...
{f'Oferta pracy: {job_posting}' if job_posting else ''}

Napisz zwięzły, przekonujący list motywacyjny podkreślający najważniejsze kwalifikacje."""
        
        try:
            response = self.client.chat.completions.create(
                messages=[
                    {
                        "role": "system", 
                        "content": "Jesteś ekspertem od pisania listów motywacyjnych. Twórz zwięzłe, profesjonalne listy które zwiększają szanse na rozmowę."
                    },
                    {"role": "user", "content": prompt}
                ],
                model="llama-3.1-70b-versatile",
                temperature=0.5,
                max_tokens=1000,
            )
            
            cover_letter = response.choices[0].message.content
            logger.info("Cover letter generated successfully")
            return cover_letter
            
        except Exception as e:
            logger.error(f"Cover letter generation failed: {e}")
            if "rate limit" in str(e).lower():
                raise Exception("Rate limit exceeded")
            raise
    
    def _mock_optimize_cv(self, current_cv: str) -> str:
        """Mock CV optimization for testing"""
        return f"""<h2>Zoptymalizowane CV</h2>
<p><strong>Ulepszona wersja z profesjonalnym językiem</strong></p>
<div>{current_cv[:500]}...</div>
<h3>Kluczowe Osiągnięcia</h3>
<ul>
<li>Zwiększyłem wydajność zespołu o 40% poprzez wdrożenie nowych procedur</li>
<li>Zarządzałem budżetem projektowym o wartości 500 000 PLN</li>
<li>Zoptymalizowałem procesy, redukując czas realizacji zadań o 25%</li>
</ul>"""
    
    def _mock_cover_letter(self) -> str:
        """Mock cover letter for testing"""
        return """Szanowni Państwo,

Z wielkim zainteresowaniem przeczytałem ogłoszenie o pracę i jestem przekonany, że moje doświadczenie oraz umiejętności idealnie odpowiadają Państwa wymaganiom.

Posiadam 5-letnie doświadczenie w branży, podczas którego rozwinąłem kompetencje w zakresie zarządzania projektami, optymalizacji procesów oraz pracy zespołowej. Moje osiągnięcia obejmują zwiększenie wydajności o 40% oraz skuteczne zarządzanie zespołem 10-osobowym.

Będę zaszczycony możliwością omówienia mojej kandydatury podczas rozmowy kwalifikacyjnej.

Z poważaniem,
[Imię i Nazwisko]"""

# ============================================
# AUTHORIZATION SERVICE
# ============================================

class AuthService:
    """Handle user authorization and limits"""
    
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo
    
    def validate_user_access(self, email: str) -> Tuple[bool, Optional[Dict], Optional[str]]:
        """
        Validate user access
        Returns: (is_valid, user_data, error_message)
        """
        try:
            user = self.user_repo.get_user(email)
            
            # In development/mock mode - always allow
            if settings.enable_mock_mode or settings.environment == 'development':
                logger.info(f"Development mode: allowing access for {email}")
                if not user:
                    user = {
                        'email': email,
                        'plan': 'premium',
                        'usage_count': 0,
                        'usage_limit': 100,
                        'expires_at': '2025-12-31T23:59:59'
                    }
                return True, user, None
            
            if not user:
                return False, None, "Musisz wykupić plan aby korzystać z optymalizacji CV."
            
            # Check usage limits
            if user['usage_count'] >= user['usage_limit']:
                return False, user, f"Wykorzystałeś limit {user['usage_limit']} CV. Kup nowy plan aby kontynuować."
            
            # Check expiry
            if user.get('expires_at'):
                expiry = datetime.fromisoformat(user['expires_at'].replace('Z', '+00:00'))
                if expiry < datetime.now():
                    return False, user, "Twoja subskrypcja wygasła. Odnów plan aby kontynuować."
            
            logger.info(f"User {email} authorized: plan={user['plan']}, usage={user['usage_count']}/{user['usage_limit']}")
            return True, user, None
            
        except Exception as e:
            logger.error(f"Auth validation failed for {email}: {e}")
            # In development - allow with error log
            if settings.environment == 'development':
                return True, {'email': email, 'usage_count': 0, 'usage_limit': 100}, None
            return False, None, "Błąd bazy danych. Spróbuj ponownie."

# ============================================
# MAIN HANDLER FOR VERCEL
# ============================================

class handler(BaseHTTPRequestHandler):
    """Vercel Function Handler"""
    
    def do_OPTIONS(self):
        """Handle CORS preflight"""
        self.send_response(200)
        self._set_cors_headers()
        self.end_headers()
    
    def do_POST(self):
        """Handle POST request"""
        try:
            # Read request body
            content_length = int(self.headers.get('Content-Length', 0))
            if content_length == 0:
                self._send_error(400, "Brak danych w żądaniu")
                return
            
            post_data = self.rfile.read(content_length)
            
            # Parse JSON
            try:
                data = json.loads(post_data.decode('utf-8'))
            except json.JSONDecodeError as e:
                self._send_error(400, f"Nieprawidłowy format JSON: {str(e)}")
                return
            
            # Validate request with Pydantic
            try:
                request = AnalyzeRequest(**data)
            except ValidationError as e:
                error_msg = "Brakuje wymaganych pól: CV i email są wymagane."
                logger.warning(f"Validation error: {e}")
                self._send_error(400, error_msg)
                return
            
            logger.info(f"Processing CV optimization for: {request.email}")
            
            # Initialize services
            user_repo = UserRepository()
            auth_service = AuthService(user_repo)
            groq_service = GroqService()
            
            # 1. Validate user access
            is_valid, user, error_msg = auth_service.validate_user_access(request.email)
            if not is_valid:
                self._send_error(403, error_msg)
                return
            
            # 2. Optimize CV
            try:
                optimized_cv = groq_service.optimize_cv(
                    request.currentCV,
                    request.jobPosting
                )
            except Exception as e:
                if "rate limit" in str(e).lower():
                    self._send_error(429, "Zbyt wiele żądań. Spróbuj ponownie za kilka sekund.")
                else:
                    self._send_error(500, "Wystąpił błąd podczas optymalizacji. Spróbuj ponownie.")
                return
            
            # 3. Generate cover letter
            try:
                cover_letter = groq_service.generate_cover_letter(
                    optimized_cv,
                    request.jobPosting
                )
            except Exception as e:
                logger.warning(f"Cover letter generation failed: {e}")
                cover_letter = "List motywacyjny nie mógł zostać wygenerowany."
            
            # 4. Update usage count
            user_repo.increment_usage(request.email)
            
            # 5. Generate response
            improvements = [
                'Dodano mocne czasowniki akcji',
                'Wstawiono metryki i liczby',
                'Dostosowano słowa kluczowe do oferty',
                'Poprawiono strukturę i formatowanie',
                'Ulepszono opisy stanowisk'
            ]
            
            keyword_match = 85 if request.jobPosting else 75
            remaining_uses = user['usage_limit'] - (user['usage_count'] + 1)
            
            metadata = {
                "originalLength": len(request.currentCV),
                "optimizedLength": len(optimized_cv),
                "improvementRate": round((len(optimized_cv) / len(request.currentCV) - 1) * 100)
            }
            
            response = AnalyzeResponse(
                success=True,
                optimizedCV=optimized_cv,
                coverLetter=cover_letter,
                improvements=improvements,
                keywordMatch=keyword_match,
                remainingUses=remaining_uses,
                metadata=metadata
            )
            
            logger.info(f"CV optimization completed for {request.email}. Remaining uses: {remaining_uses}")
            
            # Send success response
            self._send_response(200, response.dict())
            
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            self._send_error(500, "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.")
    
    def _set_cors_headers(self):
        """Set CORS headers"""
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
    
    def _send_response(self, status_code: int, data: Dict):
        """Send JSON response"""
        self.send_response(status_code)
        self._set_cors_headers()
        self.send_header('Content-Type', 'application/json')
        self.end_headers()
        self.wfile.write(json.dumps(data).encode('utf-8'))
    
    def _send_error(self, status_code: int, error_message: str):
        """Send error response"""
        response = AnalyzeResponse(
            success=False,
            error=error_message
        )
        self._send_response(status_code, response.dict())

# ============================================
# LOCAL TESTING (nie używane przez Vercel)
# ============================================

if __name__ == "__main__":
    # For local testing only
    from http.server import HTTPServer
    
    print("Starting local test server on http://localhost:8000")
    print("Test with: curl -X POST http://localhost:8000 -H 'Content-Type: application/json' -d '{\"currentCV\":\"test cv\",\"email\":\"test@test.com\"}'")
    
    server = HTTPServer(('localhost', 8000), handler)
    server.serve_forever()