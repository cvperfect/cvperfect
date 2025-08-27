#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
EXPLAIN MODE ENFORCER
Wymusza szczegółowe wyjaśnienia i dokumentację
"""

import sys
import io

# Fix Windows encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def main():
    message = sys.argv[1] if len(sys.argv) > 1 else ""
    
    # Wzorce wymagające wyjaśnień
    explain_patterns = [
        "explain", "why", "how", "what", "describe",
        "wyjaśnij", "dlaczego", "jak", "co", "opisz",
        "tell me", "show me", "walk through"
    ]
    
    needs_explanation = any(pattern in message.lower() for pattern in explain_patterns)
    
    if needs_explanation:
        enhanced = message + """

📚 EXPLAIN_MODE_ACTIVATED
✅ Detailed explanations required
✅ Step-by-step breakdown needed
✅ Context and reasoning mandatory
✅ Code examples where applicable

EXPLANATION_REQUIREMENTS:
• Provide comprehensive context
• Include practical examples
• Explain the 'why' not just 'what'
• Reference relevant CVPerfect components
• Use clear, structured formatting

🎯 EDUCATIONAL_RESPONSE_REQUIRED - Focus on understanding and learning."""
        
        print(enhanced)
    else:
        print(message)

if __name__ == "__main__":
    main()