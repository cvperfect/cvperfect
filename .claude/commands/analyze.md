# Analyze Command

**Usage**: `/analyze [type] [options]`

Uruchom analizę danych CVPerfect i zapisz wyniki w folderze analyze/.

## Typy analiz:

### `/analyze cv [file]`
Przeanalizuj plik CV pod kątem:
- Kompatybilność z ATS
- Jakość treści
- Słowa kluczowe
- Formatowanie
- Sugestie ulepszeń

**Przykład:**
```bash
/analyze cv resume.pdf --keywords tech --format json
```

### `/analyze code [component]`
Analizuj jakość kodu:
- Złożoność cyklomatyczna
- Best practices
- Potential bugs
- Performance issues
- Security vulnerabilities

**Przykład:**
```bash
/analyze code pages/success.js --full-report
```

### `/analyze performance [url]`
Testuj wydajność aplikacji:
- Page speed
- Core Web Vitals
- Bundle size
- Network requests
- Accessibility score

**Przykład:**
```bash
/analyze performance http://localhost:3001 --mobile
```

### `/analyze security`
Audyt bezpieczeństwa:
- Vulnerability scanning
- GDPR compliance
- API security
- Data protection
- Authentication issues

### `/analyze business`
Analiza biznesowa:
- User engagement
- Conversion rates
- A/B testing results
- Revenue analytics
- Customer feedback

## Opcje:

- `--format json|text|html` - Format raportu
- `--save` - Zapisz wyniki do analyze/
- `--compare [baseline]` - Porównaj z poprzednią analizą
- `--detailed` - Rozszerzony raport
- `--export [path]` - Eksportuj raport

## Wyświetlanie wyników:

### `/analyze list [type]`
Lista wszystkich analiz:
```bash
/analyze list cv        # Analizy CV
/analyze list           # Wszystkie analizy
```

### `/analyze show [id]`
Pokaż konkretną analizę:
```bash
/analyze show analysis_1756064448592_abc123
```

### `/analyze compare [id1] [id2]`
Porównaj dwie analizy:
```bash
/analyze compare old_analysis new_analysis
```

## Integracja z agentami:

Komendy `/analyze` automatycznie wykorzystują odpowiednich agentów:
- **CV analysis** → `ats_optimization` agent
- **Code analysis** → `code_quality` agent  
- **Performance** → `performance_monitor` agent
- **Security** → `api_security` agent
- **Business** → `data_analytics_insights` agent

## Przykłady użycia:

```bash
# Podstawowa analiza CV
/analyze cv my-resume.pdf

# Szczegółowa analiza kodu
/analyze code pages/index.js --detailed --save

# Performance audit z raportem
/analyze performance --lighthouse --report html

# Security audit całej aplikacji
/analyze security --full-scan --export security-report.pdf

# Lista ostatnich analiz
/analyze list --recent 10

# Porównanie wydajności
/analyze performance --compare baseline_performance
```