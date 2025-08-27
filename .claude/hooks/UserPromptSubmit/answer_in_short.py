#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
SHORT ANSWER MODE
Wymusza zwięzłe odpowiedzi (max 4 linie)
"""

import sys
import io

# Fix Windows encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def main():
    message = sys.argv[1] if len(sys.argv) > 1 else ""
    
    # Sprawdź czy użytkownik chce krótkiej odpowiedzi
    short_indicators = ["-d", "-short", "-quick", "-brief", "krótko", "szybko"]
    needs_short = any(indicator in message.lower() for indicator in short_indicators)
    
    if needs_short:
        # Usuń flagi z wiadomości
        cleaned_message = message
        for indicator in short_indicators:
            cleaned_message = cleaned_message.replace(indicator, "").strip()
            
        enhanced = cleaned_message + """

📝 SHORT_ANSWER_MODE_ACTIVATED  
✅ Maximum 4 lines response
✅ Bullet points preferred
✅ Essential info only
✅ No explanations unless critical

RESPONSE_FORMAT:
• Direct answer first
• Key points in bullets
• Skip preamble/conclusion
• Code snippets if needed

🎯 CONCISE_MODE: Get to the point immediately."""
        
        print(enhanced)
    else:
        print(message)

if __name__ == "__main__":
    main()