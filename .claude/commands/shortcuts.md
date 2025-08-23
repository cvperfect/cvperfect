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
- `-check` → Regression check - Sprawdź czy nic się nie zepsuło

### Zarządzanie Sesją
- `-clear` → Clear context - Wyczyść kontekst jeśli przekracza 70%
- `-init` → Session init - Rozpocznij sesję z pełnym setupem

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

### Gdy wykryjesz skrót `-check`:
1. Uruchom npm run lint
2. Uruchom npm run build
3. Sprawdź czy testy przechodzą
4. Porównaj z poprzednim stanem

## Rozpoznawanie Kombinacji

### Przykład: `-ut -todo -check`
1. Aktywuj ultrathink mode
2. Utwórz szczegółową todo listę
3. Po każdym kroku sprawdzaj regresje

### Przykład: `-debug -fix`
1. Uruchom debug loop dla identyfikacji problemu
2. Implementuj rozwiązanie z pełną ochroną regresji

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