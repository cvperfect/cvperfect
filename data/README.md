# Data Storage Directory

Ten folder przechowuje surowe dane używane przez system CVPerfect.

## Struktura:
- `cv/` - Surowe dane CV użytkowników
- `sessions/` - Dane sesji użytkowników  
- `uploads/` - Przesłane pliki
- `cache/` - Dane cache'owane
- `exports/` - Wyeksportowane pliki (PDF, DOCX)

## Komendy:
- `/data show` - Pokaż zawartość foldera data
- `/data cv [user_id]` - Pokaż dane CV dla użytkownika
- `/data cleanup` - Wyczyść stare pliki cache

## Bezpieczeństwo:
⚠️ Ten folder może zawierać dane osobowe użytkowników.
Nie commituj zawartości tego folderu do git.