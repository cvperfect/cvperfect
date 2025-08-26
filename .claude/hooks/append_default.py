#!/usr/bin/env python3
"""
Append Default Hook - Automatycznie dodaje digest instruction
Gdy prompt kończy się na "-d", appenduje instrukcję zwięzłego podsumowania
"""

import sys
import re

def main():
    # Pobierz message z argumentów
    if len(sys.argv) < 2:
        return
    
    message = ' '.join(sys.argv[1:])
    
    # Sprawdź czy message kończy się na "-d"
    if re.search(r'-d\s*$', message.strip()):
        # Usuń "-d" z końca
        cleaned_message = re.sub(r'-d\s*$', '', message.strip())
        
        # Dodaj digest instruction
        digest_instruction = """

🔒 DIGEST_MODE_ACTIVE: Append a concise digest instruction.
MANDATORY: Keep answer short, focus on key points only. 
FORMAT: Use bullet points, max 5 lines, no unnecessary details."""
        
        enhanced_message = cleaned_message + digest_instruction
        print(enhanced_message)
    else:
        # Jeśli nie ma "-d", zwróć message bez zmian
        print(message)

if __name__ == "__main__":
    main()