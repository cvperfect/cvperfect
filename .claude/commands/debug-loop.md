# Debug Loop Workflow

## Systematyczna pętla debugowania dla złożonych problemów

### Krok 1: Problem Identification
- Zbierz wszystkie error messages
- Sprawdź console logs
- Zidentyfikuj pattern błędów
- Określ scope problemu

### Krok 2: Environment Check
```bash
npm run dev # czy server działa
git status # aktualne zmiany
npm run lint # błędy składni
```

### Krok 3: Systematic Analysis
- Przeanalizuj call stack
- Sprawdź related files
- Zidentyfikuj dependencies
- Sprawdź recent changes w git

### Krok 4: Hypothesis Formation
- Stwórz listę potencjalnych przyczyn
- Priorytetyzuj według prawdopodobieństwa
- Zaplanuj kolejność testowania

### Krok 5: Iterative Testing
Dla każdej hipotezy:
1. Utwórz minimal test case
2. Zaimplementuj fix
3. Przetestuj
4. Jeśli nie działa - rollback i spróbuj następnej

### Krok 6: Root Cause Analysis
- Gdy znajdziesz rozwiązanie, przeanalizuj dlaczego wystąpił
- Sprawdź czy nie ma podobnych problemów w innych miejscach
- Udokumentuj lesson learned

### Krok 7: Prevention
- Dodaj testy dla tego przypadku
- Popraw error handling
- Zaktualizuj dokumentację

## Użycie skrótu `-debug`

Gdy użytkownik doda `-debug` do promptu, Claude automatycznie:
1. Uruchomi systematyczny proces debugowania
2. Będzie zbierać wszystkie informacje debug
3. Przetestuje hipotezy po kolei
4. Udokumentuje znalezione rozwiązanie

## CVPerfect Specific Debug Points

### Common Issues:
- Infinite loops w useEffect (success.js)
- Session data nie ładuje się (API endpoints)
- Modal state conflicts (overlay management)
- Payment flow interruption (Stripe)
- Template switching breaks (UI state)

### Debug Commands:
```bash
# Server logs
npm run dev

# Test specific flows
node test-comprehensive.js
node test-success-final.js
node test-agents-integration.js
```