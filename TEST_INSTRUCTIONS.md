# 🧪 CVPerfect - Instrukcje Testowania PDF

## ✅ KROK 1: Zrestartuj serwer deweloperski

**WAŻNE**: Puppeteer został właśnie zainstalowany. Musisz zrestartować serwer, żeby go załadował.

```bash
# 1. Zatrzymaj serwer (w terminalu gdzie działa npm run dev):
Ctrl+C

# 2. Uruchom ponownie:
npm run dev
```

---

## 🧪 KROK 2: Przetestuj optymalizację CV

### A. Przygotuj CV do testu
Użyj swojego CV:
```
c:\Users\czupa\Downloads\CV_Konrad_Jakóbczak.pdf
```

### B. Otwórz aplikację
```
http://localhost:3000
```

### C. Wypełnij formularz
1. **Email**: `test@example.com` (lub dowolny)
2. **Wgraj CV**: Przeciągnij lub wybierz plik PDF
3. **Oferta pracy**: (opcjonalne - możesz zostawić puste lub wkleić przykładową ofertę)

### D. Przejdź do płatności
1. Kliknij "Zoptymalizuj CV"
2. Wybierz plan (np. "Basic - 19.99 PLN")

### E. Test payment (Stripe Test Mode)
Użyj testowych danych karty:
```
Card Number:     4242 4242 4242 4242
Expiry Date:     12/34 (dowolna przyszła data)
CVC:             123 (dowolne 3 cyfry)
Name:            Test User (dowolne imię)
```

### F. Pobierz CV
1. Po płatności zobaczysz stronę sukcesu z CV
2. Kliknij **"📥 Pobierz PDF"**

---

## 🔍 KROK 3: Zweryfikuj PDF

### Test 1: Sprawdź console.log
Otwórz Developer Console (F12):

**Jeśli zobaczysz**:
```
🚀 Attempting server-side PDF generation...
✅ ULTRA ATS-friendly PDF downloaded (server-side)
```
→ **SUKCES!** Używa Puppeteer (najlepsze dla ATS) ✅

**Jeśli zobaczysz**:
```
⚠️ Server-side PDF failed, falling back to client-side...
📦 Using client-side jsPDF (fallback mode)...
```
→ **Fallback mode** - działa, ale gorsze dla ATS ⚠️
(Musisz zrestartować serwer - zobacz KROK 1)

---

### Test 2: Sprawdź czy PDF zawiera tekst

#### A. Otwórz pobrany PDF
Znajdź plik w:
```
C:\Users\czupa\Downloads\CV_*.pdf
```

#### B. Zaznacz tekst (NAJWAŻNIEJSZY TEST!)
1. Otwórz PDF w Adobe Reader / Edge / Chrome
2. **Naciśnij Ctrl+A** (zaznacz wszystko)
3. Sprawdź:
   - ✅ **DOBRZE**: Tekst się zaznacza, widzisz podświetlony tekst
   - ❌ **ŹLE**: Nic się nie zaznacza (PDF to obrazek)

#### C. Wyszukaj tekst
1. **Naciśnij Ctrl+F**
2. Wpisz imię z CV (np. "Konrad")
3. Sprawdź:
   - ✅ **DOBRZE**: Znajdzie i podświetli tekst
   - ❌ **ŹLE**: Nie znajdzie (PDF to obrazek)

#### D. Sprawdź rozmiar pliku
Kliknij prawym na plik → Właściwości → Rozmiar:
- ✅ **DOBRZE**: 50-300 KB (tekst)
- ⚠️ **ŚREDNIO**: 300-600 KB (mieszane)
- ❌ **ŹLE**: 600 KB - 2 MB (prawdopodobnie obrazek)

---

## 📊 KROK 4: Oczekiwane rezultaty

### ✅ Idealny scenariusz (Puppeteer działa):
```
Console:    🚀 Attempting server-side PDF generation...
           ✅ ULTRA ATS-friendly PDF downloaded (server-side)

PDF:       ✅ Tekst można zaznaczyć (Ctrl+A)
           ✅ Tekst można wyszukać (Ctrl+F)
           ✅ Rozmiar: 80-200 KB
           ✅ ATS Compatibility: 95%+
```

### ⚠️ Fallback scenariusz (Puppeteer nie załadowany):
```
Console:    ⚠️ Server-side PDF failed
           📦 Using client-side jsPDF (fallback mode)

PDF:       ⚠️ Tekst częściowo zaznaczalny
           ⚠️ Większy rozmiar (300-800 KB)
           ⚠️ ATS Compatibility: 70-80%

ROZWIĄZANIE: Zrestartuj serwer (KROK 1)
```

---

## 🐛 Troubleshooting

### Problem 1: "Module not found: Can't resolve 'puppeteer'"
**Rozwiązanie**:
```bash
npm install puppeteer
```
Następnie **ZRESTARTUJ** serwer (Ctrl+C → npm run dev)

---

### Problem 2: PDF się nie pobiera (błąd w console)
**Rozwiązanie**:
1. Sprawdź console.log - jaki dokładnie błąd?
2. Sprawdź terminal serwera - jaki błąd server-side?
3. Skopiuj błąd i prześlij

---

### Problem 3: Server-side PDF fails, używa fallback
**Możliwe przyczyny**:
1. **Serwer nie został zrestartowany** po instalacji Puppeteer
   → Zatrzymaj (Ctrl+C) i uruchom ponownie (npm run dev)

2. **Puppeteer Chromium download failed**
   ```bash
   # Sprawdź czy Chromium został pobrany:
   ls node_modules/puppeteer/.local-chromium

   # Jeśli pusty, ponownie zainstaluj:
   npm uninstall puppeteer
   npm install puppeteer
   ```

3. **Windows Firewall blokuje Chromium**
   → Dodaj wyjątek dla node.exe i chromium.exe

---

### Problem 4: PDF jest w języku angielskim zamiast polskiego
To normalne - AI może używać angielskiego słownictwa.
Jeśli chcesz wymuszić polski:
- Dodaj "Proszę używać tylko języka polskiego" do opisu oferty pracy

---

### Problem 5: CV wygląda źle / brakuje sekcji
**Możliwe przyczyny**:
1. Parser nie rozpoznał struktury CV
2. AI zwrócił niepoprawny HTML

**Debug**:
1. Sprawdź console.log:
   - `✅ AI returned properly structured HTML` → OK
   - `⚠️ Received plain text - using simple parser` → Parser fallback
2. Sprawdź czy oryginalne CV ma czytelną strukturę

---

## 📝 Raportowanie błędów

Jeśli coś nie działa, wyślij:

1. **Screenshot z console.log** (F12 → Console tab)
2. **Screenshot błędu** (jeśli jest)
3. **Terminal output** (z npm run dev)
4. **Czy wykonałeś KROK 1** (restart serwera)?

---

## ✅ Checklist końcowy

Przed uznaniem testu za zakończony, sprawdź:

- [ ] Puppeteer zainstalowany (`npm list puppeteer` pokazuje wersję)
- [ ] Serwer zrestartowany po instalacji Puppeteer
- [ ] CV przeszło przez proces optymalizacji
- [ ] PDF pobrał się poprawnie
- [ ] Console pokazuje "server-side PDF" (nie fallback)
- [ ] Tekst w PDF można zaznaczyć (Ctrl+A)
- [ ] Tekst w PDF można wyszukać (Ctrl+F)
- [ ] Rozmiar PDF: 50-300 KB
- [ ] CV wygląda profesjonalnie (biały szablon, niebieskie akcenty)

**Jeśli wszystko ✅ → GRATULACJE! System działa! 🎉**

---

## 🚀 Co dalej?

Jeśli wszystko działa:
1. Przetestuj z różnymi CV (różne formaty, języki)
2. Sprawdź wydajność (jak szybko generuje PDF?)
3. Gotowe do wdrożenia na produkcję!

Jeśli coś nie działa:
1. Przejdź przez Troubleshooting
2. Wyślij raport błędu
3. Możemy razem to naprawić 💪
