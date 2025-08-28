# TODO - Plan naprawy Success Page

## FAZA 1: Krytyczne (30 minut)

### ✅ 1. Fix onError callback (5 min)
**Plik:** `pages/success.js`
- [ ] Dodaj funkcję handleAIError w success.js (~linia 300)
- [ ] Przekaż jako prop do AIOptimizer (~linia 2210)
```javascript
const handleAIError = useCallback((error) => {
  addNotification({
    type: 'error',
    message: error
  });
}, [addNotification]);
```

### ✅ 2. Fix Python API request (10 min)
**Plik:** `components/success/AIOptimizer.jsx`
- [ ] Sprawdź strukturę request body (linia ~150-160)
- [ ] Dodaj brakujące pola: currentCV, email
```javascript
const requestBody = {
  currentCV: cvData?.rawText || sessionData?.cvData?.rawText,
  email: sessionData?.email || 'user@example.com',
  jobPosting: sessionData?.jobPosting || '',
  sessionId: sessionId,
  plan: userPlan
};
```

### ✅ 3. Add CV Preview element (15 min)
**Plik:** `pages/success.js`
- [ ] Dodaj div z id="cv-preview" przed TemplateRenderer (~linia 2190)
- [ ] Ustaw ref dla cvPreviewRef
```javascript
<div id="cv-preview" ref={cvPreviewRef} style={{display: 'none'}}>
  <TemplateRenderer 
    ref={cvPreviewRef}
    cvData={coreData.cvData}
    currentTemplate={coreData.currentTemplate}
  />
</div>
```

## FAZA 2: Wysokie (30 minut)

### ✅ 4. Fix PDF export (10 min)
**Plik:** `components/success/ExportTools.jsx`
- [ ] Sprawdź czy cvPreviewRef jest przekazywany
- [ ] Dodaj fallback dla brakującego elementu

### ✅ 5. Fix DOCX duplicate download (10 min)
**Plik:** `components/success/ExportTools.jsx`
- [ ] Dodaj state protection przed duplikacją
```javascript
const [isDownloading, setIsDownloading] = useState(false);
if (isDownloading) return;
setIsDownloading(true);
// ... download logic
setTimeout(() => setIsDownloading(false), 1000);
```

### ✅ 6. Add Template Selector button (10 min)
**Plik:** `pages/success.js`
- [ ] Dodaj przycisk "Zmień szablon" obok tytułu CV
```javascript
<button onClick={() => setShowTemplateSelector(true)}>
  📑 Zmień szablon
</button>
```

## FAZA 3: Cleanup (15 minut)

### ✅ 7. Remove system-debugger.js (2 min)
**Plik:** `pages/success.js`
- [ ] Usuń linie 66-69 (script loading)

### ✅ 8. Add feature translations (5 min)
**Plik:** `pages/success.js`
- [ ] Sprawdź czy tłumaczenia są w translations object (linie 1830-1834)
- [ ] Upewnij się że są przekazywane do AIOptimizer

### ✅ 9. Test wszystkich napraw (8 min)
- [ ] Test AI optimization
- [ ] Test PDF export
- [ ] Test DOCX export (bez duplikacji)
- [ ] Test Template selector

## WERYFIKACJA

```bash
# Quick test
npm run dev
# Otwórz http://localhost:3000/success?session_id=test123&plan=gold

# Full test
node test-all-success-functions.js
```

## CZAS REALIZACJI
- Faza 1: 30 minut ⏱️
- Faza 2: 30 minut ⏱️
- Faza 3: 15 minut ⏱️
**TOTAL: 75 minut**

## NOTATKI
- Nie overengineering - proste, działające rozwiązania
- Test każdej naprawy osobno
- Commit po każdej fazie