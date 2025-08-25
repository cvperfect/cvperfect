# Documentation Access Command

**Usage**: `/docs [library] [section]`

Pobierz najnowszą dokumentację dla bibliotek używanych w CVPerfect.

## Dostępne biblioteki:

### `/docs next`
Dokumentacja Next.js 14:
```bash
/docs next app-router         # App Router documentation
/docs next api-routes         # API Routes
/docs next deployment         # Deployment guides
/docs next optimization       # Performance optimization
/docs next middleware         # Middleware
```

### `/docs react`
Dokumentacja React 18:
```bash
/docs react hooks            # React Hooks
/docs react useEffect        # useEffect best practices
/docs react performance      # Performance optimization
/docs react typescript       # TypeScript integration
/docs react testing          # Testing components
```

### `/docs stripe`
Dokumentacja Stripe API:
```bash
/docs stripe webhooks         # Webhook handling
/docs stripe checkout         # Stripe Checkout
/docs stripe payments         # Payment processing
/docs stripe subscriptions   # Subscription management
/docs stripe testing          # Testing with Stripe
```

### `/docs supabase`
Dokumentacja Supabase:
```bash
/docs supabase auth          # Authentication
/docs supabase database      # Database operations
/docs supabase realtime      # Realtime subscriptions
/docs supabase storage       # File storage
```

## Dodatkowe biblioteki:

### `/docs nodejs`
Node.js documentation:
```bash
/docs nodejs fs              # File system
/docs nodejs http            # HTTP server
/docs nodejs modules         # Module system
```

### `/docs tailwind`
Tailwind CSS (jeśli używane):
```bash
/docs tailwind utilities     # Utility classes
/docs tailwind responsive    # Responsive design
/docs tailwind components    # Component patterns
```

## Specjalne sekcje:

### `/docs best-practices`
Best practices dla różnych technologii:
```bash
/docs best-practices react       # React best practices
/docs best-practices nextjs      # Next.js best practices
/docs best-practices security    # Security best practices
/docs best-practices performance # Performance best practices
```

### `/docs examples`
Przykłady kodu:
```bash
/docs examples stripe-webhook    # Stripe webhook example
/docs examples react-components  # React component examples
/docs examples api-routes        # Next.js API examples
```

## Opcje wyszukiwania:

### `/docs search [query]`
Wyszukaj w dokumentacji:
```bash
/docs search useEffect cleanup   # Szukaj informacji o cleanup
/docs search stripe webhook signature # Stripe webhook verification
```

### `/docs recent`
Ostatnie aktualizacje dokumentacji:
```bash
/docs recent react               # Najnowsze zmiany w React
/docs recent next                # Najnowsze features Next.js
```

## Integracja z workflow:

### Podczas developmentu:
```bash
# Problem z hookiem
/docs react useEffect

# Implementacja płatności
/docs stripe checkout

# Optymalizacja Next.js
/docs next optimization
```

### Troubleshooting:
```bash
# Błąd z API
/docs next api-routes
/docs examples api-routes

# Problem z webhookiem
/docs stripe webhooks
/docs examples stripe-webhook
```

## Automatyczne wykrywanie:

System automatycznie wykrywa kontekst i sugeruje dokumentację:

```bash
# Gdy pracujesz z plikiem pages/api/stripe-webhook.js
# Automatycznie zostanie zasugerowane:
/docs stripe webhooks
```

## Cache dokumentacji:

- Dokumentacja jest cache'owana lokalnie na 1 godzinę
- Automatyczne sprawdzanie aktualizacji co 6 godzin
- Możliwość wymuszenia odświeżenia: `/docs refresh [library]`

## Przykłady użycia:

```bash
# Implementuję nowy hook
/docs react hooks

# Mam problem z API route
/docs next api-routes
/docs examples api-routes

# Konfiguruję Stripe webhook
/docs stripe webhooks
/docs examples stripe-webhook  
/docs best-practices security

# Optymalizuję wydajność
/docs next optimization
/docs react performance
/docs best-practices performance
```

## Offline mode:

Gdy brak połączenia z internetem:
- Używa cache'owanej dokumentacji
- Wyświetla ostrzeżenie o potencjalnie przestarzałych informacjach
- Sugeruje sprawdzenie online po przywróceniu połączenia