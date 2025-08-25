# Claude Code Shortcuts System

## System Rozpoznawania Skrótów

Gdy użytkownik używa następujących skrótów w swoich promptach, Claude automatycznie implementuje odpowiednie zachowania:

### Tryby Myślenia
- `-ut` → Aktywuj ultrathink mode (maksymalny budżet obliczeniowy)
- `-th` → Aktywuj think hard mode (głęboka analiza)
- `-t` → Aktywuj think mode (podstawowa analiza)
- `-td` → Aktywuj think deeper mode (bardzo głęboka analiza)

### Workflow Skróty
- `-p` → Plan first - Najpierw stwórz szczegółowy plan implementacji
- `-r` → Research - Zbadaj cały codebase przed rozpoczęciem
- `-sa` → Use subagent - Deleguj zadanie do wyspecjalizowanego sub-agenta
- `-todo` → Create todo list - Utwórz szczegółową listę zadań z TodoWrite
- `-test` → Test-driven development - Napisz testy przed implementacją
- `-mc` → Multi-claude workflow - Zaproponuj użycie kilku instancji Claude

### Bezpieczeństwo i Naprawianie
- `-fix` → Safe fix with regression check - Implementuj z pełną ochroną regresji
- `-debug` → Debug loop - Uruchom systematyczną pętlę debugowania
- `-dm` → Debug Masters - Użyj advanced debugging masters (AI, RCA, Systematic)
- `-check` → Regression check - Sprawdź czy nic się nie zepsuło

### Zarządzanie Sesją
- `-clear` → Clear context - Wyczyść kontekst jeśli przekracza 70%
- `-init` → Session init - Rozpocznij sesję z pełnym setupem

### Zarządzanie Danymi (Data Management)
- `/ds` → `/data show all` - Pokaż wszystkie dane (sessions, CV, cache)
- `/ds s` → `/data show sessions` - Pokaż sesje użytkowników
- `/ds c` → `/data show cv` - Pokaż pliki CV
- `/ds ch` → `/data show cache` - Pokaż pliki cache
- `/dc` → `/data cleanup cache 1` - Codzienne czyszczenie cache
- `/dc s` → `/data cleanup sessions 7` - Tygodniowe czyszczenie sesji
- `/dc c` → `/data cleanup cv 30` - Miesięczne czyszczenie CV
- `/dc all` → `/data cleanup all 14` - Dwutygodniowe pełne czyszczenie
- `/dst` → `/data stats` - Pełne statystyki storage
- `/dst -s` → `/data stats --summary` - Krótkie podsumowanie storage

## Implementacja w Claude

### Gdy wykryjesz skrót `-ut`:
1. Użyj maksymalnego budżetu obliczeniowego
2. Przeprowadź bardzo dogłębną analizę
3. Rozważ wszystkie edge cases
4. Zaplanuj implementation step-by-step

### Gdy wykryjesz skrót `-todo`:
1. Automatycznie użyj TodoWrite tool
2. Podziel zadanie na konkretne, wykonalne kroki
3. Śledź postęp z statusami pending/in_progress/completed

### Gdy wykryjesz skrót `-fix`:
1. Przeczytaj CLAUDE_BEST_PRACTICES.md
2. Sprawdź aktualny stan z git status
3. Utwórz backup przed zmianami
4. Implementuj z regression prevention
5. Przetestuj po zmianach

### Gdy wykryjesz skrót `-dm` (Debug Masters):
1. Aktywuj advanced debugging system (3 masters)
2. Uruchom Root Cause Analysis Master dla comprehensive RCA
3. Użyj AI Debugging Copilot Master dla pattern recognition
4. Zastosuj Systematic Debugging Master dla structured approach
5. Pokaż confidence scores i recommended fixes
6. Apply automated fixes jeśli dostępne (high confidence)

### Gdy wykryjesz skrót `-check`:
1. Uruchom npm run lint
2. Uruchom npm run build
3. Sprawdź czy testy przechodzą
4. Porównaj z poprzednim stanem

### Gdy wykryjesz skrót `/ds` (data show):
1. Wywołaj POST /api/data-management z command: "show"
2. Wyświetl sformatowane dane w czytelnej formie
3. Pokaż summary i najważniejsze statystyki
4. Dla `/ds s` - pokaż ostatnie 5 sesji z detalami
5. Dla `/ds c` - pokaż pliki CV z rozmiarami i datami
6. Dla `/ds ch` - pokaż status cache i pliki wygasłe

### Gdy wykryjesz skrót `/dc` (data cleanup):
1. ZAWSZE użyj --dry-run NAJPIERW dla bezpieczeństwa
2. Pokaż co zostanie usunięte
3. Jeśli user potwierdzi, wykonaj cleanup bez --dry-run
4. Utwórz backup jeśli cleanup > 10 plików
5. Wyświetl raport cleanup z ilością usuniętych plików
6. Sprawdź czy nie ma błędów

### Gdy wykryjesz skrót `/dst` (data stats):
1. Wywołaj POST /api/data-management z command: "stats"
2. Wyświetl sformatowane statystyki w tabeli
3. Dla `/dst -s` - pokaż tylko kluczowe metryki
4. Pokaż procentowe wykorzystanie storage
5. Ostrzeż jeśli storage > 40MB (80% limitu 50MB)

## Rozpoznawanie Kombinacji

### Przykład: `-ut -todo -check`
1. Aktywuj ultrathink mode
2. Utwórz szczegółową todo listę
3. Po każdym kroku sprawdzaj regresje

### Przykład: `-debug -fix`
1. Uruchom debug loop dla identyfikacji problemu
2. Implementuj rozwiązanie z pełną ochroną regresji

### Przykład: `-dm -fix -check`
1. Użyj Debug Masters dla comprehensive analysis
2. Apply recommended fixes z high confidence scores
3. Sprawdź regresje po naprawie

### Przykład: `-ut -dm -todo`
1. Maksymalna analiza problemu
2. Systematyczne debugging z wszystkimi metodami
3. Stwórz structured todo list dla implementation

## Integracja z CVPerfect

CVPerfect agenci są aktywowani automatycznie przez hooks system gdy:
- Zadanie jest w ich kompetencjach (keywords matching)
- Hook session-start uruchamia agentów przy starcie
- Hook task-execute deleguje zadania automatycznie

Claude nie musi ręcznie aktywować agentów - działają w tle automatycznie.

## Fallback Behavior

Jeśli Claude nie rozpozna skrótu:
1. Traktuj jako normalny tekst
2. Nie przerywaj wykonania zadania
3. Kontynuuj z domyślnym trybem myślenia