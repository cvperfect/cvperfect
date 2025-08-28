# CVPerfect Python - Deterministyczna Optymalizacja CV

Profesjonalne narzędzie do optymalizacji CV bez halucynacji. 100% offline, deterministyczne, zachowuje wszystkie fakty z oryginalnego CV.

## ✅ Funkcje

- **ZERO halucynacji** - nie dodaje nowych firm, stanowisk, dat czy technologii
- **Deterministyczne** - ten sam input zawsze daje ten sam output
- **Offline** - działa bez internetu i API
- **ATS Score** - heurystyczna ocena 0-100 zgodności z systemami ATS
- **Profesjonalizacja języka** - "kurier" → "Specjalista ds. dostaw ostatniej mili"
- **Tryb dopasowania do oferty** - zwiększa widoczność istniejących umiejętności
- **Szablony per plan** - Basic, Gold, Premium

## 📦 Instalacja

```bash
cd cvperfect_py
pip install -r requirements.txt
```

## 🚀 Użycie

### Podstawowa optymalizacja
```bash
python -m cvperfect_py.cli --cv examples/cv.pdf --out out/
```

### Z dopasowaniem do oferty
```bash
python -m cvperfect_py.cli --cv examples/cv.docx --job examples/job.txt --out out/
```

### Z wyborem szablonu Premium
```bash
python -m cvperfect_py.cli --cv cv.txt --plan premium --template premium/executive --out out/
```

## 📂 Struktura wyjścia

```
out/
├── optimized_cv.html      # Zoptymalizowane CV (HTML)
├── improvements.json      # Lista konkretnych zmian
├── report.json           # Metryki i ATS Score
└── suggestions.json      # Propozycje (wymagają dodania treści)
```

## 🎯 ATS Score (0-100)

- **Struktura (20%)**: obecność sekcji, kolejność, brak tabel
- **Czytelność (15%)**: długość bulletów, formatowanie
- **Słowa kluczowe (30%)**: pokrycie technologii i kompetencji  
- **Język (20%)**: action verbs, brak stop phrases
- **Spójność (15%)**: daty, kontakt, metadata

## 🔧 Architektura

```
cvperfect_py/
├── io_load.py       # Wczytywanie PDF/DOCX/TXT
├── normalize.py     # Czyszczenie tekstu
├── extract.py       # Ekstrakcja sekcji
├── lexicon/         # Słowniki HR (PL/EN)
├── ats_score.py     # Obliczanie ATS Score
├── rewrite.py       # Generowanie HTML
├── compliance.py    # Guard NO-NEW-FACTS
└── cli.py          # Interface CLI
```

## ⚡ Przykłady profesjonalizacji

### Przed:
> "roznosiłem paczki"

### Po:
> "Realizowałem terminowe dostawy do klientów na wyznaczonych trasach, dbając o standardy obsługi i bezpieczeństwo przesyłek"

### Przed:
> "odpowiadałem za magazyn"

### Po:
> "Koordynowałem i nadzorowałem procesy magazynowe"

## 🛡️ Gwarancje

1. **Nie dodaje** nowych doświadczeń, firm, dat
2. **Nie wymyśla** technologii których kandydat nie zna
3. **Nie zmienia** faktów - tylko profesjonalizuje język
4. **Deterministyczne** - zawsze ten sam wynik

## 📝 Licencja

MIT - użyj w swoich projektach!

## 🤝 Wsparcie

Problemy? Otwórz issue na GitHub.