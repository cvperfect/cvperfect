# CLI Tool Command

**Usage**: `/cli-tool [nazwa] [parametry]`

Uruchom zewnętrzne narzędzia CLI zintegrowane z CVPerfect.

## Dostępne narzędzia:

### `cv-analyzer`
Analizuj pliki CV pod kątem ATS i jakości:
```bash
/cli-tool cv-analyzer resume.pdf --format json
/cli-tool cv-analyzer cv.docx --ats-check --keywords tech
```

**Opcje:**
- `--format json|text` - Format wyniku
- `--ats-check` - Sprawdzenie kompatybilności ATS
- `--keywords tech|management|business` - Kategoria słów kluczowych
- `--score` - Dołącz ocenę jakości

### `data-export`
Eksportuj dane CVPerfect:
```bash
/cli-tool data-export cv --format csv --date-range 30d
/cli-tool data-export analytics --format json
```

**Opcje:**
- `--format csv|json|xlsx` - Format eksportu
- `--date-range 7d|30d|90d` - Zakres dat
- `--output [path]` - Ścieżka pliku wyjściowego

### `perf-audit`
Audyt wydajności strony:
```bash
/cli-tool perf-audit http://localhost:3001 --mobile
/cli-tool perf-audit --lighthouse --report html
```

**Opcje:**
- `--mobile` - Test mobilny
- `--lighthouse` - Użyj Lighthouse
- `--report html|json|csv` - Format raportu

## Zarządzanie narzędziami:

### Lista narzędzi:
```bash
/cli-tool list                    # Wszystkie narzędzia
/cli-tool list cv-processing      # Kategoria CV
```

### Informacje o narzędziu:
```bash
/cli-tool info cv-analyzer        # Szczegóły cv-analyzer
```

### Statystyki:
```bash
/cli-tool stats                   # Statystyki użycia
```

## Rejestracja własnych narzędzi:

Możesz dodać własne narzędzia CLI do systemu. Przykład konfiguracji:

```json
{
  "name": "my-tool",
  "command": "node my-script.js",
  "description": "Moje narzędzie do analizy",
  "category": "custom",
  "usage": "my-tool <input> [options]",
  "examples": [
    "my-tool data.json --format csv"
  ],
  "options": {
    "--format": "Format wyjściowy",
    "--verbose": "Tryb szczegółowy"
  }
}
```

## Przykłady integracji:

### Analiza CV w workflow:
```bash
# 1. Przeanalizuj CV
/cli-tool cv-analyzer uploaded-cv.pdf --format json

# 2. Zapisz wyniki
/analyze cv uploaded-cv.pdf --save

# 3. Wygeneruj raport
/cli-tool data-export cv-analysis --format html
```

### Audyt wydajności:
```bash
# 1. Uruchom audit
/cli-tool perf-audit http://localhost:3001 --lighthouse

# 2. Zapisz metryki
/analyze performance --save

# 3. Porównaj z baseline
/analyze performance --compare baseline
```

## Automatyzacja:

Narzędzia CLI można wywoływać automatycznie przez agentów:

```bash
# Agent performance_monitor automatycznie użyje perf-audit
-sa Zoptymalizuj wydajność strony głównej

# Agent ats_optimization użyje cv-analyzer
-sa Przeanalizuj CV pod kątem ATS
```

## Bezpieczeństwo:

- Wszystkie narzędzia działają w sandboxie
- Timeout 30 sekund na wykonanie
- Maksymalny bufor wyjścia: 10MB  
- Logowanie wszystkich wykonanych komend