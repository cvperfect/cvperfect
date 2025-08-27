#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ULTRATHINK MODE ENFORCER
Aktywuje tryb maksymalnej analizy z budżetem 128K tokenów
"""

import sys
import io

# Fix Windows encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def main():
    message = sys.argv[1] if len(sys.argv) > 1 else ""
    
    # Wzorce wymagające ultrathink
    ultrathink_patterns = [
        "complex", "architecture", "debug", "performance", 
        "optimize", "refactor", "analyze", "security",
        "złożony", "architektura", "wydajność", "optymalizuj"
    ]
    
    should_ultrathink = any(pattern in message.lower() for pattern in ultrathink_patterns)
    
    if should_ultrathink:
        enhanced = message + """

🧠 ULTRATHINK_MODE_ACTIVATED 
✅ Maximum analysis budget: 128K tokens
✅ Extended reasoning enabled
✅ Deep problem analysis required
✅ Multi-step verification mandatory

EXECUTION_REQUIREMENTS:
• Use maximum thinking time before responding
• Break complex problems into sub-components  
• Verify each step before proceeding
• Apply CVPerfect 21 mandatory rules

⚠️ HIGH_COMPLEXITY_TASK_DETECTED - Ultrathink mode required for optimal results."""
        
        print(enhanced)
    else:
        print(message)

if __name__ == "__main__":
    main()