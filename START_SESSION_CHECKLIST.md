# 🚀 CVPerfect Session Start Checklist

## KROK 1: Sprawdź status przed rozpoczęciem

```bash
# Sprawdź czy są aktywne workflow
node checkpoint-workflow.js status

# Sprawdź ostatni stan regresji
/regression-check

# Lub uruchom szybką walidację
node test-regression-suite.js --quick
```

## KROK 2: Ustal baseline (jeśli nie ma)

```bash
# Jeśli nie ma baseline - stwórz
node .claude/test-snapshots/snapshot-manager.js baseline

# Sprawdź czy baseline został utworzony
ls .claude/test-snapshots/baseline.json
```

## KROK 3: Wybierz tryb pracy

### 🛠️ TRYB A: MAŁA NAPRAWA (single fix)

```bash
# Użyj bezpośrednio safe-fix
/safe-fix "opis problemu do naprawienia"
```

### 🏗️ TRYB B: WIĘKSZA FUNKCJONALNOŚĆ (feature development)

```bash
# Rozpocznij checkpoint workflow
node checkpoint-workflow.js start nazwa-funkcjonalności

# Potem przy każdej zmianie:
node checkpoint-workflow.js checkpoint "opis co zrobiłeś"

# Na koniec:
node checkpoint-workflow.js finish
```

### 🚨 TRYB C: EMERGENCY (coś jest zepsute)

```bash
# Sprawdź co się stało
/regression-check comprehensive

# Jeśli poważnie zepsute:
/rollback-to-safe HIGH

# Jeśli tylko ostrzeżenia:
/safe-fix "napraw konkretny problem"
```

## KROK 4: Podczas pracy - ZAWSZE

### Po każdej większej zmianie:
```bash
# Sprawdź czy nic się nie zepsuło
node test-regression-suite.js --critical
```

### Przed zakończeniem sesji:
```bash
# Final check
npm run build && npm run lint

# Zapisz snapshot jeśli wszystko OK
node .claude/test-snapshots/snapshot-manager.js create session-end
```

## 🎯 QUICK COMMANDS CHEAT SHEET

| Sytuacja | Komenda |
|----------|---------|
| 🔍 Sprawdź status | `node checkpoint-workflow.js status` |
| 📸 Utwórz baseline | `node .claude/test-snapshots/snapshot-manager.js baseline` |
| 🛠️ Bezpieczna naprawa | `/safe-fix "problem"` |
| 📊 Sprawdź regresje | `/regression-check` |
| 🚨 Emergency rollback | `/rollback-to-safe HIGH` |
| ✅ Quick test | `node test-regression-suite.js --quick` |
| 🏁 Checkpoint | `node checkpoint-workflow.js checkpoint "message"` |

## ⚠️ WAŻNE ZASADY

### ❌ NIGDY NIE:
- Nie ignoruj failed tests w critical suite
- Nie rób większych zmian bez checkpoint workflow
- Nie commituj gdy regression-check pokazuje CRITICAL failures

### ✅ ZAWSZE:
- Sprawdź status przed rozpoczęciem
- Użyj /safe-fix dla bugfixów
- Utwórz checkpoints przy większych zmianach
- Zrób final check przed zakończeniem sesji

## 🔄 TYPOWE SCENARIUSZE

### Scenariusz 1: "Claude przestaje działać poprawnie"
```bash
# Sprawdź co się dzieje
/regression-check comprehensive

# Jeśli dużo błędów - rollback
/rollback-to-safe HIGH

# Potem użyj /clear i rozpocznij od nowa
```

### Scenariusz 2: "Potrzebuję naprawić bug"
```bash
# Bezpieczna naprawa
/safe-fix "konkretny opis buga"

# System automatycznie:
# 1. Stworzy branch
# 2. Zrobi baseline  
# 3. Będzie validować każdy krok
# 4. Da instrukcje merge lub rollback
```

### Scenariusz 3: "Chcę dodać nową funkcjonalność"
```bash
# Rozpocznij workflow
node checkpoint-workflow.js start nazwa-funkcjonalności

# Pracuj krok po kroku z checkpointami
node checkpoint-workflow.js checkpoint "krok 1 ukończony"
node checkpoint-workflow.js checkpoint "krok 2 ukończony"

# Zakończ bezpiecznie
node checkpoint-workflow.js finish
```

## 💡 PRO TIPS

1. **Używaj ultrathink** dla skomplikowanych zadań:
   ```
   Ultrathink: jak naprawić [problem] bez psowania [critical functions]
   ```

2. **Sprawdzaj context window**:
   - Użyj `/clear` gdy context > 70%
   - Dokumentuj ważne rzeczy w CLAUDE.md

3. **Bądź konkretny**:
   - Zamiast "napraw błąd" → "napraw infinite loop w pages/success.js:245"

4. **Monitor baseline**:
   - Odświeżaj baseline co 1-2 tygodnie
   - Po każdej dużej zmianie która przeszła testy

## ✅ CHECKLIST PRZED ZAKOŃCZENIEM SESJI

- [ ] Wszystkie testy critical przechodzą
- [ ] Brak active workflow (lub świadomie pozostawiony)
- [ ] Ważne zmiany zadokumentowane  
- [ ] Baseline aktualny (jeśli były duże zmiany)
- [ ] Context window < 70% lub użyto /clear