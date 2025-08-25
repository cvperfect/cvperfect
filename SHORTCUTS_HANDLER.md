# CLAUDE CODE SHORTCUTS HANDLER

## Instrukcje dla Claude - Automatyczne Rozpoznawanie Skrótów

**WAŻNE: Ten plik jest czytany automatycznie przez Claude Code. Zawiera definicje skrótów które użytkownik może używać w swoich promptach.**

---

## 🎯 SYSTEM ROZPOZNAWANIA SKRÓTÓW

Gdy użytkownik używa następujących skrótów w swoich promptach (np. "Napraw błąd -ut -todo"), Claude automatycznie aktywuje odpowiednie zachowania:

### TRYBY MYŚLENIA
- **`-ut`** → **ULTRATHINK MODE**
  - Maksymalny budżet obliczeniowy
  - Bardzo dogłębna analiza wszystkich aspektów
  - Rozważ edge cases i potencjalne problemy
  - Zaplanuj implementację krok po kroku

- **`-th`** → **THINK HARD MODE**  
  - Głęboka analiza problemu
  - Systematyczne podejście
  - Rozważ alternatywne rozwiązania

- **`-t`** → **THINK MODE**
  - Podstawowa analiza
  - Strukturalne myślenie

- **`-td`** → **THINK DEEPER MODE**
  - Bardzo głęboka analiza
  - Dokładne przemyślenie konsekwencji

### WORKFLOW SKRÓTY
- **`-p`** → **PLAN FIRST**
  - Najpierw stwórz szczegółowy plan implementacji
  - Nie zaczynej kodować dopóki plan nie jest gotowy
  - Rozłóż zadanie na konkretne kroki

- **`-r`** → **RESEARCH FIRST**
  - Zbadaj cały codebase przed rozpoczęciem
  - Przeanalizuj istniejące patterns i konwencje
  - Zrozum context i zależności

- **`-sa`** → **USE SUBAGENT (CVPerfect Integration)**
  - Automatycznie deleguj zadanie do systemu 40 agentów CVPerfect
  - Inteligentne wykrywanie typu zadania i wybór odpowiedniego agenta
  - Fallback do wbudowanego Task tool Claude jeśli agenci niedostępni
  - **Dostępne typy agentów:**
    - `frontend` → React, CSS, komponenty, responsive design
    - `backend` → API, endpointy, baza danych, Stripe, webhooks
    - `cv-optimization` → Analiza CV, ATS, szablony, Groq AI
    - `security` → Autentykacja, CORS, walidacja, ochrona danych
    - `testing` → Testy, debugging, QA, naprawianie bugów
    - `performance` → Optymalizacja, cache, szybkość, bundle size
    - `analytics` → Metryki, raporty, business intelligence
  - **Użycie:** `-sa` (automatyczne) lub `-sa frontend` (konkretny agent)

- **`-todo`** → **CREATE TODO LIST**
  - Automatycznie użyj TodoWrite tool
  - Podziel zadanie na konkretne, wykonalne kroki
  - Śledź postęp z statusami pending/in_progress/completed

- **`-test`** → **TEST-DRIVEN DEVELOPMENT**
  - Napisz testy przed implementacją
  - Stwórz mockup najpierw
  - Następnie zaimplementuj funkcjonalność

- **`-mc`** → **MULTI-CLAUDE WORKFLOW**
  - Zaproponuj użycie kilku instancji Claude Code
  - Wyjaśnij jak podzielić pracę między instancje
  - Podaj konkretne instrukcje setupu

### BEZPIECZEŃSTWO I NAPRAWIANIE
- **`-fix`** → **SAFE FIX WITH REGRESSION CHECK**
  - Przeczytaj CLAUDE_BEST_PRACTICES.md
  - Sprawdź git status przed zmianami
  - Utwórz backupy ważnych plików
  - Implementuj z pełną ochroną regresji
  - Przetestuj po zmianach

- **`-debug`** → **DEBUG LOOP**
  - Uruchom systematyczną pętlę debugowania
  - Zbierz wszystkie error messages i logs
  - Przeanalizuj systematycznie możliwe przyczyny
  - Testuj hipotezy jedna po drugiej

- **`-check`** → **REGRESSION CHECK**
  - Uruchom npm run lint
  - Uruchom npm run build
  - Sprawdź czy wszystkie testy przechodzą
  - Porównaj z poprzednim stanem
  - Przetestuj kluczowe funkcjonalności

### ZARZĄDZANIE SESJĄ  
- **`-clear`** → **CLEAR CONTEXT**
  - Sugeruj użycie /clear jeśli kontekst > 70%
  - Wyjaśnij dlaczego to ważne
  - Zaproponuj restart sesji z clean context

- **`-init`** → **SESSION INIT**
  - Przeczytaj CLAUDE.md
  - Przeczytaj CLAUDE_BEST_PRACTICES.md
  - Przeczytaj START_SESSION_CHECKLIST.md
  - Zainicjalizuj pełny context projektu

---

## 🔄 ROZPOZNAWANIE KOMBINACJI SKRÓTÓW

### Przykład: `-ut -todo -check`
1. Aktywuj ULTRATHINK MODE
2. Utwórz szczegółową todo listę z TodoWrite
3. Po każdym ważnym kroku uruchamiaj regression check

### Przykład: `-debug -fix -check`
1. Uruchom systematyczny debug loop
2. Implementuj rozwiązanie z pełną ochroną regresji  
3. Sprawdź czy nic się nie zepsuło

### Przykład: `-p -r -ut`
1. Zbadaj codebase (research)
2. Stwórz szczegółowy plan
3. Użyj maksymalnej mocy obliczeniowej do analizy

### Przykład: `-sa -ut -todo`
1. Automatycznie deleguj zadanie do odpowiedniego agenta CVPerfect
2. Użyj maksymalnej mocy obliczeniowej do analizy
3. Stwórz szczegółową todo listę z postępem

---

## 🚨 SPECIAL HANDLING

### Gdy wykryjesz `-ut` (ULTRATHINK):
- To jest najważniejszy skrót - oznacza krytyczne zadanie
- Użyj maksymalnej głębokości analizy
- Rozważ wszystkie możliwe problemy i edge cases
- Zaplanuj bardzo dokładnie każdy krok

### Gdy wykryjesz `-todo`:
- ZAWSZE użyj TodoWrite tool
- Podziel zadanie na minimum 3-5 konkretnych kroków
- Każdy krok powinien mieć jasny success criterion
- Śledź postęp i aktualizuj statusy

### Gdy wykryjesz `-fix`:
- To sygnał że coś jest zepsute i trzeba ostrożnie
- ZAWSZE sprawdź co już jest zepsute (git status, linting)
- Nie wprowadzaj więcej zmian niż konieczne
- Przetestuj każdą zmianę

### Gdy wykryjesz `-check`:
- Użytkownik chce mieć pewność że nic się nie zepsuło
- Uruchom pełną serię testów
- Sprawdź build, linting, core functionality
- Raportuj wszystkie znalezione problemy

### Gdy wykryjesz `-sa`:
- Aktywuj system 40 agentów CVPerfect przez claude-agent-router.js
- Przeanalizuj opis zadania i wybierz odpowiedniego agenta automatycznie
- Jeśli system agentów niedostępny, użyj fallback do Task tool
- Raportuj który agent został wybrany i dlaczego

---

## ⚡ CVPerfect CONTEXT

Gdy pracujesz z CVPerfect, pamiętaj o:
- Agenci działają automatycznie w tle (nie aktywuj ręcznie)
- Hooks system już skonfigurowany
- MCP Puppeteer dostępny
- Główne pliki: pages/index.js, pages/success.js
- Kluczowe API: /api/analyze, /api/create-checkout-session

---

## 🎯 FALLBACK BEHAVIOR

Jeśli nie rozpoznasz skrótu:
1. Traktuj jako normalny tekst
2. Nie przerywaj wykonania zadania  
3. Kontynuuj z domyślnym trybem myślenia
4. Nie wspominaj o nierozpoznanym skrócie

---

**WAŻNE DLA CLAUDE:** 
- Te skróty to sposób na ulepszenie komunikacji z użytkownikiem
- Użytkownik może używać kilka skrótów jednocześnie
- Skróty mogą być na początku, w środku lub na końcu promptu
- Zawsze rozpoznaj wszystkie skróty w prompcie i zastosuj ich kombinację
- Skróty zawsze zaczynają się od `-` (myślnik)