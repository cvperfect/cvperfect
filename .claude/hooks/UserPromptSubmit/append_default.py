#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
DEFAULT PROTOCOL ENFORCER
Podstawowe reguły CVPerfect dla wszystkich zapytań
"""

import sys
import io

# Fix Windows encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

def main():
    message = sys.argv[1] if len(sys.argv) > 1 else ""
    
    # Zawsze dodaj podstawowe reguły CVPerfect
    enhanced = message + """

🔒 CVPERFECT_PROTOCOL_ACTIVE
✅ 21 mandatory rules from CLAUDE.md enforced
✅ TodoWrite for multi-step tasks
✅ Sub-agents for specialized work
✅ Verification before completion

CORE_EXECUTION_RULES:
• Task tool for 3+ step operations
• Debug agents for technical issues  
• CVPerfect agents for payment/API/templates
• lint→build→test→verify sequence
• Anti-hallucination: TRUST BUT VERIFY

📋 SESSION_CONTEXT: CVPerfect Next.js app with Stripe, Groq AI, 6k+ line SPA"""
    
    print(enhanced)

if __name__ == "__main__":
    main()