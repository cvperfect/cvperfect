# Data Management Commands

**Usage**: `/data [show|cleanup|stats] [category] [options]`

Zarządzaj danymi CVPerfect: sesje, cache, CV files, metrics.

## `/data show [category]`

Wyświetl zapisane dane według kategorii:

### Podstawowe użycie:
```bash
/data show sessions    # Pokaż wszystkie sesje
/data show cv         # Pokaż zapisane CV
/data show cache      # Pokaż cache files
/data show all        # Pokaż wszystkie kategorie
```

### Zaawansowane opcje:
```bash
/data show sessions --recent 10      # 10 najnowszych sesji
/data show sessions --paid           # Tylko płatne sesje
/data show sessions --today          # Sesje z dzisiaj
/data show cv --with-photos         # CV z zdjęciami
/data show cache --expired          # Wygasły cache
```

### Przykład output:
```
📊 CVPerfect Data Summary
========================

📂 SESSIONS (63 files, 2.4MB)
├── Recent (24h): 8 sessions
├── Paid plans: 23 sessions (Basic: 8, Gold: 9, Premium: 6)
├── Demo/test: 40 sessions
└── Oldest: sess_1755792612737_j5mowch30.json (3 days ago)

📄 CV FILES (15 files, 1.1MB)
├── With photos: 8 files
├── PDF originals: 12 files
├── DOCX files: 3 files
└── Optimized outputs: 15 files

💾 CACHE (25 files, 456KB)
├── AI responses: 18 files
├── Template renders: 7 files
├── Expired (>24h): 3 files
└── Fresh cache: 22 files
```

## `/data cleanup [category] [days]`

Wyczyść stare pliki według kategorii i wieku:

### Podstawowe użycie:
```bash
/data cleanup sessions 7     # Usuń sesje starsze niż 7 dni
/data cleanup cache 1        # Usuń cache starszy niż 1 dzień
/data cleanup cv 30          # Usuń CV starsze niż 30 dni
/data cleanup all 14         # Usuń wszystko starsze niż 14 dni
```

### Opcje bezpieczeństwa:
```bash
/data cleanup sessions 3 --dry-run    # Pokaż co zostanie usunięte (bez usuwania)
/data cleanup cache 1 --force         # Usuń bez potwierdzenia
/data cleanup all 7 --backup          # Utwórz backup przed usunięciem
```

### Przykład output:
```
🧹 Data Cleanup Report
======================

📂 SESSIONS CLEANUP (--dry-run)
├── Found: 63 sessions
├── Expired (>7 days): 23 sessions
├── Would delete: 23 files (892KB)
└── Would keep: 40 recent sessions (1.5MB)

💾 CACHE CLEANUP (executed)
├── Found: 25 cache files
├── Expired (>1 day): 8 files
├── Deleted: 8 files (123KB)
└── Kept: 17 fresh files (333KB)

✅ Cleanup completed - 31 files analyzed, 8 files deleted
```

## `/data stats`

Wyświetl szczegółowe statystyki storage:

### Podstawowe użycie:
```bash
/data stats              # Pełne statystyki
/data stats --summary    # Krótkie podsumowanie
/data stats --trends     # Trendy użycia (ostatnie 7 dni)
```

### Przykład output:
```
📈 CVPerfect Storage Statistics
================================

💾 TOTAL STORAGE: 4.2MB
├── Sessions: 2.4MB (57%) - 63 files
├── CV files: 1.1MB (26%) - 15 files  
├── Cache: 456KB (11%) - 25 files
└── Logs: 234KB (6%) - 12 files

📊 SESSION BREAKDOWN
├── Basic plan: 8 sessions (13%)
├── Gold plan: 9 sessions (14%) 
├── Premium plan: 6 sessions (10%)
└── Demo/test: 40 sessions (63%)

⏱️ AGE DISTRIBUTION
├── Today: 8 files (13%)
├── This week: 35 files (55%)
├── This month: 58 files (92%)
└── Older: 5 files (8%)

📈 TRENDS (7 days)
├── Daily avg sessions: 9.1
├── Paid conversion: 36%
├── Storage growth: +340KB/day
└── Peak usage: Wednesday 14:30
```

## Integracja z istniejącymi API

### Wykorzystuje:
- ✅ `/api/cleanup-sessions.js` - session cleanup logic
- ✅ `/api/session-metrics.js` - metrics gathering
- ✅ `.sessions/` folder - session storage
- ✅ `data/` folder - CV and cache storage

### Konfiguracja w settings.json:
```json
{
  "dataManagement": {
    "autoCleanup": {
      "enabled": true,
      "sessionMaxAge": 168,
      "cacheMaxAge": 24,
      "runDaily": "03:00"
    },
    "storage": {
      "maxTotalSize": "50MB",
      "warningThreshold": "40MB"
    }
  }
}
```

## Bezpieczeństwo i backup

### Auto-backup przed cleanup:
```bash
# Automatyczny backup do .claude/backups/
/data cleanup sessions 7 --backup
```

### Emergency restore:
```bash
/data restore sessions 2025-08-24    # Przywróć sesje z daty
/data restore all latest              # Przywróć najnowszy backup
```

## Hook integration

Komenda `/data` automatycznie:
- 🔄 Synchronizuje z live server data
- 📊 Aktualizuje metryki w czasie rzeczywistym  
- 🔍 Indeksuje nowe pliki dla szybkiego wyszukiwania
- ⚡ Cache'uje wyniki dla szybszego działania
- 🛡️ Sprawdza integralność danych przed operacjami

## Przykłady praktyczne

### Daily maintenance:
```bash
/data stats --summary                 # Sprawdź użycie storage
/data cleanup cache 1 --dry-run       # Sprawdź co można wyczyścić
/data cleanup cache 1                 # Wyczyść cache
/data show sessions --recent 5        # Zobacz najnowsze sesje
```

### Analiza problemów:
```bash
/data show sessions --paid --today    # Dzisiejsze płatne sesje
/data stats --trends                  # Trendy ostatnich 7 dni  
/data show cv --with-photos           # CV które mogą zajmować dużo miejsca
```

### Maintenance przed deploymentem:
```bash
/data cleanup all 14 --backup         # Cleanup z backupem
/data stats                           # Sprawdź stan po cleanup
```