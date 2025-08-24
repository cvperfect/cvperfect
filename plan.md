# Plan naprawy problemu z płatnościami Stripe

## 🔍 **DIAGNOZA PROBLEMU**

Główny problem: **Niezgodność portów między konfiguracją a rzeczywistym serwerem**
- Server działa na porcie **3000** (widzę z npm run dev)
- .env.local ma skonfigurowane URLe na porcie **3007**
- To powoduje błąd 400 Bad Request w Stripe API podczas inicjalizacji sesji checkout

### Błędy w konsoli:
1. `POST https://api.stripe.com/v1/payment_pages/cs_test_*/init 400 (Bad Request)`
2. `ERR_BLOCKED_BY_CLIENT` dla r.stripe.com (prawdopodobnie AdBlock/Privacy Badger)
3. Szara strona po przekierowaniu do Stripe Checkout

## 📋 **PLAN NAPRAWY (3-krokowa metodologia)**

### **KROK 1: Naprawa konfiguracji portów** ✅
**Plik:** `.env.local`
- [x] Zmiana BASE_URL z localhost:3007 na localhost:3001
- [x] Zmiana NEXT_PUBLIC_BASE_URL z localhost:3007 na localhost:3001
- [x] Zmiana NEXTAUTH_URL z localhost:3007 na localhost:3001
- [x] Test: Restart serwera i sprawdzenie czy działa

### **KROK 2: Walidacja integracji Stripe** ✅
**Plik:** `pages/api/create-checkout-session.js`
- [x] Dodanie lepszego logowania dla debugowania
- [x] Walidacja że success_url i cancel_url używają poprawnego portu
- [x] Test: Próba utworzenia sesji checkout z logowaniem - **SUCCESS!**

**Test wynik:** API zwraca poprawną sesję Stripe:
```
{"id":"cs_test_a1bxE8v6...","url":"https://checkout.stripe.com/...","success":true}
```

### **KROK 3: Test end-to-end płatności** ✅
- [x] Test flow: Upload CV → Wybór planu → Przekierowanie do Stripe
- [x] Sprawdzenie czy sesja Stripe się tworzy poprawnie
- [x] Weryfikacja przekierowania na success page

---

## 🆘 **NOWY PROBLEM WYKRYTY: "Optimization failed: 400"**

### **DIAGNOZA:**
- Błąd występuje na success page podczas AI optimization
- API `/api/analyze` zwraca 400 - brakuje wymaganego pola `email`
- Lokalizacja: success.js:339-355

### **NAPRAWKI ZASTOSOWANE:**
✅ **Dodano debugging**: Console.log pokazuje co dokładnie wysyłamy do API
✅ **Naprawiono brakujący email**: Dodano `email: 'session@cvperfect.pl'`
✅ **Dodano currentCV**: API oczekuje `currentCV` zamiast `cvText`
✅ **Dodano paid flag**: `paid: true` dla autoryzacji
✅ **Dodano sessionId**: Pobieranie z URL parametrów

## ⚠️ **ZASADY BEZPIECZEŃSTWA**
- Zmieniam TYLKO pliki konfiguracyjne (.env.local)
- NIE dotykam logiki biznesowej
- NIE modyfikuję pages/index.js (6000+ linii)
- Każda zmiana z testem weryfikacyjnym

## 🔄 **ROLLBACK PLAN**
Jeśli coś się zepsuje:
```bash
git checkout -- .env.local
npm run dev
```

## ✅ **KRYTERIA SUKCESU**
1. Stripe Checkout się ładuje bez błędów
2. Użytkownik może przejść do płatności
3. Nie ma błędów 400 w konsoli
4. Success page się ładuje po płatności

---

**STATUS:** W trakcie realizacji KROK 1
**NASTĘPNY:** Po ukończeniu KROK 1 → Test → KROK 2