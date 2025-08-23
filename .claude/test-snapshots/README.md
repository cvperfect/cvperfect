# CVPerfect Test Snapshot System

System zarządzania snapshotami testów służący do zapobiegania regresjom przez porównywanie stanu aplikacji przed i po zmianach.

## 🎯 Cel

- **Baseline Management**: Ustalanie stanu "znanego jako działający"
- **Regression Detection**: Automatyczne wykrywanie zepsutej funkcjonalności
- **Change Tracking**: Śledzenie zmian w czasie
- **Rollback Support**: Identyfikacja bezpiecznych punktów powrotu

## 📁 Struktura Katalogu

```
.claude/test-snapshots/
├── README.md                    # Ten plik
├── snapshot-manager.js          # Główny manager snapshotów
├── baseline.json               # Aktualny baseline (stan wzorcowy)
├── snapshot-YYYYMMDD-HHMMSS.json  # Snapshots z timestampem
├── validation-YYYYMMDD-HHMMSS.json # Raporty walidacji
└── report-YYYYMMDD-HHMMSS.json    # Raporty regresji
```

## 🚀 Użycie

### Podstawowe Komendy

```bash
# Utworzenie nowego snapshotu
node .claude/test-snapshots/snapshot-manager.js create

# Utworzenie snapshotu z nazwą
node .claude/test-snapshots/snapshot-manager.js create "before-payment-fix"

# Ustalenie obecnego stanu jako baseline
node .claude/test-snapshots/snapshot-manager.js baseline

# Walidacja obecnego stanu względem baseline
node .claude/test-snapshots/snapshot-manager.js validate

# Czyszczenie starych snapshotów (7 dni)
node .claude/test-snapshots/snapshot-manager.js cleanup

# Czyszczenie starych snapshotów (custom dni)
node .claude/test-snapshots/snapshot-manager.js cleanup 14

# Generowanie raportu regresji
node .claude/test-snapshots/snapshot-manager.js report
```

### Typowy Workflow

1. **Przed rozpoczęciem prac**:
   ```bash
   node .claude/test-snapshots/snapshot-manager.js baseline
   ```

2. **Przed każdą większą zmianą**:
   ```bash
   node .claude/test-snapshots/snapshot-manager.js create "before-[nazwa-zmiany]"
   ```

3. **Po zmianach**:
   ```bash
   node .claude/test-snapshots/snapshot-manager.js validate
   ```

4. **W przypadku regresji**:
   - Sprawdź raport walidacji
   - Cofnij się do ostatniego działającego commita
   - Lub napraw regresję i uruchom `validate` ponownie

## 📋 Suite Testów

System uruchamia następujące kategorie testów:

### Critical Tests (MUSI przechodzić)
- **build**: `npm run build`
- **lint**: `npm run lint`

### Functional Tests
- **main_page**: `test-main-page.js`
- **payment_flow**: `test-stripe-payment-flow.js` 
- **success_functions**: `test-all-success-functions.js`
- **api_endpoints**: `test-api-endpoints.js`
- **responsive**: `test-responsive.js`
- **agents_integration**: `test-agents-integration.js`

### Performance Tests (optional)
- **bundle_size**: `test-bundle-size.js`
- **page_load**: `test-performance.js`

## 📊 Interpretacja Wyników

### Status Testów:
- **PASS**: Test zakończony sukcesem
- **FAIL**: Test nie przeszedł
- **SKIP**: Test pominięty (brak pliku testowego)

### Status Walidacji:
- **PASS**: Brak regresji
- **FAIL**: Wykryte regresje - wymagana interwencja

### Typy Zmian:
- **REGRESSION**: PASS → FAIL (🚨 krityczne)
- **IMPROVEMENT**: FAIL → PASS (✅ pozytywne)  
- **CHANGE**: Inne zmiany (⚠️ wymagają uwagi)
- **NO_CHANGE**: Brak zmian (➡️ OK)

## 🔗 Integracja z Hook'ami

Snapshots są automatycznie używane przez:

- **pre-edit.sh**: Tworzy baseline przed edycją
- **post-edit.sh**: Porównuje z baseline po edycji
- **regression-guard.sh**: Kompleksowa analiza regresji

## 📈 Monitoring i Utrzymanie

### Automatyczne Czyszczenie
```bash
# Dodaj do cron lub task scheduler
node .claude/test-snapshots/snapshot-manager.js cleanup 7
```

### Tygodniowy Raport
```bash
# Generuj co tydzień raport stanu
node .claude/test-snapshots/snapshot-manager.js report
```

## 🛠️ Konfiguracja

### Dodawanie Nowych Testów

Edytuj `TEST_SUITE` w `snapshot-manager.js`:

```javascript
const TEST_SUITE = {
    critical: [
        { name: 'nowy_test', command: 'npm run nowy-test', timeout: 30000 }
    ],
    functional: [
        { name: 'nowy_funkcjonalny', script: 'test-nowy-funkcjonalny.js', timeout: 60000 }
    ]
};
```

### Timeouty
- **critical**: 30-120 sekund
- **functional**: 30-90 sekund  
- **performance**: 30-60 sekund

## 🚨 Rozwiązywanie Problemów

### Snapshot Manager nie działa
1. Sprawdź czy jesteś w katalogu projektu
2. Sprawdź uprawnienia do zapisu w `.claude/test-snapshots/`
3. Sprawdź czy Node.js jest dostępny

### Testy nie przechodzą
1. Sprawdź czy pliki testowe istnieją
2. Sprawdź czy dependencje są zainstalowane (`npm install`)
3. Sprawdź logi błędów w plikach snapshotów

### Baseline przestarzały
```bash
# Utwórz nowy baseline z bieżącego stanu
node .claude/test-snapshots/snapshot-manager.js baseline
```

## 📝 Format Plików

### Snapshot JSON:
```json
{
  "id": "snapshot-20250823-104530",
  "created_at": "2025-08-23T10:45:30.123Z",
  "system_info": {
    "node_version": "v18.17.0",
    "git_commit": "abc123",
    "git_branch": "main"
  },
  "test_results": {
    "timestamp": "2025-08-23T10:45:30.123Z",
    "suites": {
      "critical": [
        { "name": "build", "status": "PASS", "duration": 45000 }
      ]
    },
    "summary": { "total": 8, "pass": 7, "fail": 1, "skip": 0 }
  }
}
```

### Validation Report JSON:
```json
{
  "timestamp": "2025-08-23T10:50:30.123Z",
  "status": "FAIL",
  "comparison": {
    "regressions": [
      {
        "test": "payment_flow",
        "before_status": "PASS",
        "after_status": "FAIL"
      }
    ],
    "improvements": [],
    "changes": []
  }
}
```