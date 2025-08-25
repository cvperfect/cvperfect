# Analyze Directory

Ten folder przechowuje przetworzone analizy i raporty generowane przez system CVPerfect.

## Struktura:
- `cv-analysis/` - Analizy CV użytkowników
- `performance/` - Raporty wydajności aplikacji
- `code-quality/` - Analizy jakości kodu
- `security/` - Raporty bezpieczeństwa
- `user-feedback/` - Analizy feedbacku użytkowników
- `reports/` - Raporty biznesowe

## Komendy:
- `/analyze cv [file]` - Przeanalizuj CV i zapisz wyniki
- `/analyze code [component]` - Przeanalizuj jakość kodu
- `/analyze performance` - Uruchom analizę wydajności
- `/analyze list` - Lista wszystkich analiz
- `/analyze show [id]` - Pokaż konkretną analizę

## Format plików:
Wszystkie analizy są zapisywane w formacie JSON z następującą strukturą:
```json
{
  "id": "analysis_timestamp_hash",
  "type": "cv|code|performance|security",
  "timestamp": "ISO date",
  "input": "source data",
  "results": "analysis results",
  "metadata": {
    "version": "1.0",
    "agent": "responsible_agent"
  }
}
```