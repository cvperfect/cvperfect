# CLAUDE CODE - NAJLEPSZE PRAKTYKI 2025

Ten plik zawiera zaawansowane techniki pracy z Claude Code, zebrane na podstawie najnowszych badań i doświadczeń społeczności programistów w 2025 roku. **Przeczytaj to PRZED każdą ważną sesją kodowania.**

## 🎯 KLUCZOWE ZASADY

### 1. Używaj słów kluczowych do aktywacji trybów myślenia
- `think` - podstawowy tryb analizy
- `think hard` - głębsza analiza
- `think harder` - bardzo dokładna analiza  
- `ultrathink` - maksymalny budżet obliczeniowy

**Przykład:** "Ultrathink how to optimize this API endpoint without breaking existing functionality"

### 2. Zarządzanie kontekstem - KRYTYCZNE
- Użyj `/clear` po każdym nowym zadaniu
- Monitoruj pasek kontekstu (prawy dolny róg)
- Kompresuj kontekst przy 70% wypełnienia
- **NIGDY nie pozwalaj na kompresję automatyczną** - Claude staje się "głupszy"

### 3. Test-Driven Development (TDD)
Claude UWIELBIA TDD. To najskuteczniejsza metoda przeciw halucynacjom:
1. Claude tworzy test
2. Claude tworzy mock
3. Następnym promptem: zamień mock na prawdziwą implementację

## ⚠️ GRANICE BŁĘDÓW - GDZIE CLAUDE MOŻE ZAWIEŚĆ

### Sytuacje wysokiego ryzyka:

#### 1. **Kompilacja i testy (90% błędów)**
- Claude zapomina kompilować przed uruchomieniem testów
- **ZAWSZE przypominaj:** "Compile first, then run tests"
- Claude zmienia testy żeby pasowały do błędnego kodu zamiast naprawić kod

#### 2. **Duże pliki (18,000+ linii)**
- Claude Code radzi sobie z dużymi plikami lepiej niż inne AI
- Ale po kompresji kontekstu traci orientację
- **Rozwiązanie:** Używaj sub-agentów dla dużych refaktoringów

#### 3. **Kontekst po kompresji**
- Claude "zapomina" o wcześniejszych korekcjach
- Powtarza błędy które już naprawiliście
- **Rozwiązanie:** Nowa sesja z `/clear` lub restart

#### 4. **Przechowywanie stanu między sesjami**
- Claude nie pamięta poprzednich sesji
- **Rozwiązanie:** Dokumentuj wszystko w CLAUDE.md i projektowych .md

### Sygnały ostrzegawcze:
- "I've made significant progress" (często kłamstwo)
- Zapętlone testy pass/fail
- Mówi że "functionality doesn't work for major cases"

## 🤖 SYSTEM SUB-AGENTÓW

### Kiedy używać sub-agentów:
- **Zadania wieloetapowe** (3+ kroków)
- **Specjalistyczne domeny** (security, performance, testing)
- **Równoległe przetwarzanie** (testy + debugging jednocześnie)
- **Zachowanie kontekstu** w głównym agencie

### Dostępne typy sub-agentów:
```
- general-purpose: Badania, wyszukiwanie kodu, zadania wieloetapowe
- statusline-setup: Konfiguracja statusu Claude Code
- output-style-setup: Tworzenie stylów output
```

### Optymalizacja kosztów sub-agentów (v1.0.64+):
- **Haiku**: Proste zadania (analiza danych, dokumentacja)
- **Sonnet**: Development, code review, testy  
- **Opus**: Krytyczne zadania (security audit, architektura, AI/ML)

### Wywołanie sub-agenta:
```
Claude, use a general-purpose subagent to research all optimization patterns in the codebase and create a comprehensive report.
```

## 📋 ZARZĄDZANIE ZADANIAMI (TodoWrite)

### Kiedy używać TodoWrite:
- ✅ Zadania wieloetapowe (3+ kroków)
- ✅ Złożone, nietrywialne zadania
- ✅ Użytkownik podaje listę zadań
- ✅ ZAWSZE na początku większych zadań

### Kiedy NIE używać:
- ❌ Pojedyncze, trywialne zadania
- ❌ Zadania < 3 kroków
- ❌ Pytania informacyjne

### Stany zadań:
- `pending` - nie rozpoczęte
- `in_progress` - w trakcie (TYLKO JEDNO na raz)
- `completed` - ukończone (oznaczaj NATYCHMIAST po zakończeniu)

### Przykład dobrego Todo:
```
1. Analyze current CV parsing logic - in_progress
2. Implement photo preservation in optimization - pending  
3. Add error handling for malformed CVs - pending
4. Run comprehensive tests and fix failures - pending
```

## 🚀 WORKFLOW AUTOMATYZACJA

### Komendy niskiego poziomu (zawsze działają):
```bash
npm run dev
npm run build  
npm run lint
npm run test
git status
git diff
```

### Custom commands w .claude/commands/:
Utwórz pliki .md z powtarzalnymi workflow:

**debug-loop.md:**
```markdown
# Debug Loop
1. Run tests and capture failures
2. Analyze error patterns  
3. Fix root causes systematically
4. Verify fixes with re-test
5. Document lessons learned
```

### Pattern: "Jeden task na sesję"
- Użyj `/clear` między zadaniami  
- Claude skutecznie pracuje 10-20 minut przed spadkiem wydajności
- Może ukończyć 5-8 kroków w jednej sesji

## 💡 ZAAWANSOWANE TECHNIKI

### 1. Projektowanie najpierw
```
Before coding, create a design doc in markdown describing:
- Goals and requirements
- Technical approach  
- Success criteria
- Testing strategy
```

### 2. Kontrola przerwań
- `Escape` - przerwij Claude w dowolnej fazie
- `Escape + Escape` - cofnij w historii i edytuj prompt

### 3. Naturalne komendy zamiast złożonych
- ✅ "Fix the TypeScript error in LoginForm.tsx where user might be undefined"
- ❌ Listowanie każdego pliku osobno

### 4. Bezpieczne --dangerously-skip-permissions
Tylko w kontenerze bez internetu dla:
- Naprawiania błędów lint
- Generowania boilerplate
- **NIGDY** w produkcji

## 🔧 IMPLEMENTACJA DLA CVPERFECT

### 1. Umiejscowienie pliku
Ten plik powinien być w głównym katalogu projektu obok CLAUDE.md. Claude automatycznie go przeczyta.

### 2. Integracja z istniejącymi agentami
CVPerfect ma już 40 wyspecjalizowanych agentów. Ten plik wspiera ich działanie.

### 3. Praktyczne zastosowanie
```
# Na początku sesji:
"Read CLAUDE_BEST_PRACTICES.md first, then ultrathink the approach to [task]"

# Dla dużych zadań:
"Create a comprehensive todo list and use specialized subagents for [task]"

# Przed zakończeniem:
"Run lint, tests, and build. Fix any errors before finishing."
```

### 4. Komendy dla CVPerfect
```bash
# Development
npm run dev                    # Port 3000
npm run mcp-puppeteer         # Browser automation
node start-agents-system.js  # CVPerfect agents

# Testing  
npm run lint
npm run build
node test-comprehensive.js
```

## 📊 MONITORING I TROUBLESHOOTING

### Sygnały że coś idzie źle:
- Pasek kontekstu > 70%
- Claude powtarza wcześniej naprawione błędy
- "I've made significant progress" bez konkretnych rezultatów  
- Zapętlone komunikaty o testach

### Natychmiastowe działania:
1. `/clear` jeśli kontekst pełny
2. Nowa sesja jeśli Claude "głupieje"
3. Sub-agent dla specjalistycznych zadań
4. Compile przed testami ZAWSZE

## 🎯 CHECKLIST PRZED WAŻNYMI ZADANIAMI

- [ ] Przeczytałem ten plik
- [ ] Kontekst < 70% 
- [ ] Mam jasny plan (design doc)
- [ ] Wiem które sub-agenty mogą pomóc
- [ ] Przygotowałem TodoWrite dla złożonych zadań
- [ ] Znam komendy build/test/lint projektu

---

**PAMIĘTAJ:** Claude Code to narzędzie wspierające, nie zastępujące. Ty nadal jesteś architektem rozwiązania. Claude pomaga w implementacji Twojej wizji.

**Aktualizacja:** Sierpień 2025 - Na podstawie najnowszych badań społeczności Claude Code