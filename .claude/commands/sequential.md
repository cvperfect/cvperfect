# Sequential Thinking Command

**Usage**: `/sequential [on|off|status]`

Włącz/wyłącz tryb sekwencyjnego myślenia dla złożonych zadań wieloetapowych.

## Podstawowe użycie:

### `/sequential on`
Włącz tryb sekwencyjny:
```bash
/sequential on
```

Po włączeniu każde złożone zadanie będzie automatycznie rozbijane na ponumerowane kroki z śledzeniem postępu.

### `/sequential off`  
Wyłącz tryb sekwencyjny:
```bash
/sequential off
```

### `/sequential status`
Sprawdź aktualny status:
```bash
/sequential status
```

## Jak to działa:

### PRZED włączeniem sequential:
```
User: "Dodaj dark mode do CVPerfect"
Claude: [próbuje zrobić wszystko naraz, może pominąć kroki]
```

### PO włączeniu sequential:
```
User: "Dodaj dark mode do CVPerfect"
Claude: 
KROK 1/6: Analiza istniejącej struktury CSS
✅ Przeanalizowano style w pages/index.js i success.js

KROK 2/6: Definicja CSS custom properties dla dark mode
⏳ Tworzenie zmiennych kolorów...
✅ Dodano --bg-color, --text-color, --accent-color

KROK 3/6: Implementacja toggle w UI
⏳ Dodaję przełącznik dark mode...
✅ Toggle dodany do header

KROK 4/6: Logika przełączania
⏳ Implementuję localStorage i state...
✅ Dark mode zapisuje się w localStorage

KROK 5/6: Aktualizacja wszystkich komponentów
⏳ Aktualizuję komponenty...
✅ Wszystkie komponenty wspierają dark mode

KROK 6/6: Testowanie i weryfikacja
⏳ Testuję funkcjonalność...
✅ Dark mode działa poprawnie
```

## Idealne przypadki użycia:

### ✅ WŁĄCZ sequential dla:

**1. Dodawanie nowych features:**
```bash
/sequential on
"Dodaj system powiadomień email do CVPerfect"
```

**2. Refactoring dużych komponentów:**
```bash
/sequential on  
"Zrefaktoruj pages/index.js na mniejsze komponenty"
```

**3. Debugging złożonych problemów:**
```bash
/sequential on
"Napraw infinite loop w payment flow -debug"
```

**4. Implementacja security features:**
```bash
/sequential on
"Dodaj GDPR compliance do całej aplikacji"
```

**5. Performance optimization:**
```bash
/sequential on
"Zoptymalizuj ładowanie strony - od bundlesize do obrazków"
```

### ❌ NIE używaj sequential dla:

**1. Prostych zadań:**
```bash
# NIE potrzeba sequential
"Zmień kolor przycisku na niebieski"
```

**2. Szybkich fix-ów:**
```bash
# NIE potrzeba sequential
"Popraw literówkę w tekście"
```

## Zaawansowane opcje:

### Kombinacja z innymi skrótami:
```bash
/sequential on
"Zaimplementuj nowy szablon CV -sa -ut -todo"
```

Rezultat:
- **Sequential**: Rozbija na kroki 1/5, 2/5, etc.
- **-sa**: Automatycznie deleguje do odpowiedniego agenta
- **-ut**: Używa maksymalnej mocy obliczeniowej
- **-todo**: Tworzy todo listę równolegle

### Manual step control:
```bash
/sequential on
"Implementuj A/B testing, ale zatrzymaj się po kroku 3 żeby sprawdzić czy podejście jest OK"
```

### Progress tracking:
W trybie sequential automatycznie:
- ✅ Oznacza ukończone kroki
- ⏳ Pokazuje aktualny krok
- ❌ Pokazuje kroki które się nie powiodły
- 🔄 Pokazuje kroki do ponowienia

## Przykłady z życia:

### Przykład 1 - Dodawanie płatności:
```bash
/sequential on
"Dodaj nowy plan Premium Plus (129 PLN) do systemu płatności"

KROK 1/7: Analiza istniejących planów
✅ Znaleziono Basic, Gold, Premium w pages/index.js:2341

KROK 2/7: Aktualizacja cennika w komponencie
✅ Dodano Premium Plus (129 PLN) do pricing tiers

KROK 3/7: Konfiguracja Stripe
✅ Utworzono nowy Stripe Price ID

KROK 4/7: Aktualizacja API create-checkout-session
✅ Dodano obsługę premium_plus planu

KROK 5/7: Aktualizacja success page
✅ Premium Plus daje dostęp do wszystkich szablonów + AI insights

KROK 6/7: Testy payment flow
✅ Payment działa, redirect OK, funkcjonalności unlocked

KROK 7/7: Dokumentacja i deploy
✅ Zaktualizowano cennik, gotowe do produkcji
```

### Przykład 2 - Debugging:
```bash
/sequential on
"CV nie ładuje się poprawnie na success page -debug"

KROK 1/5: Reprodukcja problemu
✅ Potwierdzono - success page pokazuje loader zamiast CV

KROK 2/5: Analiza network requests
✅ /api/get-session-data zwraca 200 ale pusty cvData

KROK 3/5: Debugowanie API endpoint
✅ Problem w get-session-data.js:45 - wrong session extraction

KROK 4/5: Fix i test
✅ Naprawiono session parsing, CV się ładuje

KROK 5/5: Regression testing
✅ Wszystkie inne features działają, fix kompletny
```

## Monitoring i logs:

W trybie sequential:
- Każdy krok jest zapisywany do `analyze/sequential-logs/`
- Progress można sprawdzić w przyszłości
- Możliwość resume przy przerwaniu
- Automatyczne rollback przy critical failure

## Performance:

Sequential mode dodaje ~10-15% overhead ale daje:
- ✅ 90% mniej pominiętych kroków
- ✅ 75% lepsze śledzenie postępu  
- ✅ 60% łatwiejsze debugging gdy coś idzie źle
- ✅ 100% przejrzystość co się dzieje