# 🛠️ KONFIGURACJA STRIPE PRICE IDS - CVPERFECT

## ⚠️ KRYTYCZNE: Utwórz te ceny w Stripe Dashboard

### 1. BASIC PLAN - 19.99 PLN ✅
```
JUŻ SKONFIGUROWANE:
Price ID: price_1Rwooh4FWb3xY5tDRxqQ4y69
Kwota: 19.99 PLN
Typ: Jednorazowa płatność
```

### 2. GOLD PLAN - 49 PLN ❌ WYMAGANE
```
WYMAGANE UTWORZENIE W STRIPE:
Nazwa: CvPerfect Gold Plan
Kwota: 49.00 PLN 
Typ: Jednorazowa płatność
Opis: 10 optymalizacji CV, 3 szablony, list motywacyjny

DODAJ DO .env.local:
STRIPE_PRICE_GOLD_49=price_[NOWY_ID_Z_STRIPE]
```

### 3. PREMIUM PLAN - 79 PLN ❌ WYMAGANE  
```
WYMAGANE UTWORZENIE W STRIPE:
Nazwa: CvPerfect Premium Plan
Kwota: 79.00 PLN
Typ: Jednorazowa płatność  
Opis: 25 optymalizacji CV, 7 szablonów, LinkedIn profil, bez rejestracji

DODAJ DO .env.local:
STRIPE_PRICE_PREMIUM_79=price_[NOWY_ID_Z_STRIPE]
```

## 🔧 KROKI KONFIGURACJI STRIPE:

### Krok 1: Zaloguj się do Stripe Dashboard
- Wejdź na https://dashboard.stripe.com
- Przejdź do sekcji "Products"

### Krok 2: Utwórz Product dla Gold Plan
1. Kliknij "Add product"
2. Nazwa: "CvPerfect Gold Plan"
3. Opis: "10 optymalizacji CV, 3 szablony profesjonalne, list motywacyjny, PDF + DOCX"
4. Cennik:
   - Typ: "One time"
   - Cena: 49.00 PLN
   - Waluta: PLN
5. Zapisz i skopiuj Price ID (format: price_xxxxx)

### Krok 3: Utwórz Product dla Premium Plan
1. Kliknij "Add product"
2. Nazwa: "CvPerfect Premium Plan"  
3. Opis: "25 optymalizacji CV, 7 szablonów, LinkedIn profil, bez rejestracji"
4. Cennik:
   - Typ: "One time"
   - Cena: 79.00 PLN
   - Waluta: PLN
5. Zapisz i skopiuj Price ID

### Krok 4: Aktualizuj zmienne środowiskowe
```env
# Dodaj do .env.local
STRIPE_PRICE_GOLD_49=price_1XXXXXXXXXXXXXXXXXX
STRIPE_PRICE_PREMIUM_79=price_1XXXXXXXXXXXXXXXXXX
```

## ✅ SPRAWDZENIE KONFIGURACJI:

Po dodaniu Price IDs restart aplikacji i przetestuj:

```bash
# Test Gold Plan (49 PLN)
curl -X POST http://localhost:3000/api/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{"plan":"gold","email":"test@example.com"}'

# Test Premium Plan (79 PLN)  
curl -X POST http://localhost:3000/api/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{"plan":"premium","email":"test@example.com"}'
```

### Oczekiwane wyniki:
- ✅ Zwraca session URL z poprawną ceną
- ❌ Błąd: "price_PLACEHOLDER" = nie skonfigurowano

## 🚨 ZABEZPIECZENIA:

Aplikacja ma built-in walidację:
- Blokuje płatności z placeholder IDs
- Sprawdza zgodność planu z ceną
- Loguje błędy konfiguracji

## 📊 STRUKTURA PLANÓW:

| Plan | Cena | Limit | Szablony | Features |
|------|------|-------|----------|----------|
| Basic | 19.99 PLN | 1 użycie | 1 | PDF |
| Gold | 49 PLN | 10 użyć | 3 | PDF + DOCX + List |
| Premium | 79 PLN | 25 użyć | 7 | Wszystko + LinkedIn |

Po skonfigurowaniu - usuń ten plik z repo (zawiera instrukcje deployment).