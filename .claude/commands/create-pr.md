# Create Pull Request Workflow

## Automatyczne tworzenie PR z najlepszymi praktykami

### Workflow Steps:
1. ZAWSZE zacznij od `git status` żeby sprawdzić branch
2. Użyj template: `gh pr create --base main --head [current-branch] --title "[PREFIX]: clear title" --body "detailed description"`
3. ZAWSZE twórz PR przeciwko `main` branch (dla CVPerfect)
4. Jeśli wystąpią błędy - ZATRZYMAJ i wyjaśnij użytkownikowi

### Naming Conventions:
- **FIX:** - dla naprawek błędów
- **FEAT:** - dla nowych funkcji
- **REFACTOR:** - dla refaktoringu kodu
- **RISKY:** - dla dużych, ryzykownych zmian
- **SECURITY:** - dla poprawek bezpieczeństwa
- **PERF:** - dla optymalizacji wydajności

### Template Examples:

#### Fix Example:
```bash
gh pr create --base main --head feature/payment-fix --title "FIX: Resolve infinite loop in payment processing" --body "Fixed useEffect dependency issue causing infinite re-renders in success.js. Added proper cleanup and error handling."
```

#### Feature Example:
```bash
gh pr create --base main --head feature/dark-mode --title "FEAT: Add dark mode toggle to settings" --body "Implemented dark mode functionality with user preference persistence. Includes CSS variables, theme context, and responsive design updates."
```

#### Risky Example:
```bash
gh pr create --base main --head refactor/success-page --title "RISKY: Complete success.js redesign with new templates" --body "Major overhaul of success page including 3 new CV templates, improved AI optimization, and enhanced PDF export. Requires careful testing of all template functions."
```

### Safety Rules:
- ✅ Sprawdź git status przed tworzeniem PR
- ✅ Używaj opisowych tytułów
- ✅ Dodawaj szczegółowe opisy zmian
- ✅ Oznaczaj ryzykowne zmiany prefiksem RISKY:
- ❌ NIE twórz PR bez sprawdzenia statusu
- ❌ NIE używaj niepopisowych tytułów typu "fixes"
- ❌ NIE pomijaj opisów w body

### Integration with Shortcuts:
Użyj z skrótami:
- `"Create PR for payment fix -pr -check"` 
- `"Submit dark mode feature -pr -test"`

### CVPerfect Specific:
- Main branch: `main` 
- Zawsze dodawaj footer: `🤖 Generated with [Claude Code](https://claude.ai/code)`
- Sprawdź czy build przechodzi przed PR
- Uruchom regression tests

### Error Handling:
Jeśli wystąpią problemy:
1. Sprawdź czy jesteś na właściwym branch
2. Sprawdź czy masz uncommitted changes
3. Sprawdź czy GitHub CLI jest skonfigurowany (`gh auth status`)
4. Sprawdź czy remote branch istnieje
5. Zatrzymaj workflow i wyjaśnij błąd użytkownikowi