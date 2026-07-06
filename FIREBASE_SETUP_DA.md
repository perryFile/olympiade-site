# Firebase setup (naeste trin)

Denne guide goer jeres hjemmeside live paa tvaers af enheder.

## 1) Opret Firebase projekt

1. Gaa til Firebase Console
2. Opret projekt, fx `olympiade-2026`
3. Tilfoej en Web App i projektet
4. Kopier konfigurationsfelter

## 2) Aktivér Realtime Database

1. Vaelg Realtime Database
2. Opret database i EU region (anbefalet)
3. Start i test mode (hurtigst)
4. Indlaes reglerne fra `firebase/database.rules.json`

## 3) Udfyld lokal env

1. Koer:
```bash
cp .env.example .env
```
2. Udfyld alle `VITE_FIREBASE_*` i `.env`
3. (Valgfrit) saet en ny admin sti i `VITE_ADMIN_PATH`

## 4) Test lokalt

```bash
npm run dev -- --host
```

Tjek:
1. Offentlig side loader
2. Admin side loader paa din sti (fx `/baglokale-olympiade`)
3. Opret hold/deltager
4. Opdater score og se live leaderboard

## 5) GitHub setup (for produktion)

I GitHub repo:
1. Settings -> Secrets and variables -> Actions -> Secrets
2. Tilfoej alle `VITE_FIREBASE_*`
3. (Valgfrit) under Variables: `VITE_ADMIN_PATH`
4. Push til `main`

Workflow deployer automatisk via `.github/workflows/deploy.yml`.

## 6) Sikkerhed (vigtigt)

I har valgt skjult admin-link uden login.
Det er nemt men ikke robust sikkerhed.

Minimum:
1. Brug lang admin-sti
2. Del kun med arrangorer
3. Aendr admin-sti efter event
4. Tag backup af data under eventet

## Backup-tip

I browserens devtools kan du midlertidigt eksportere data:
- Hent data fra `localStorage` hvis I koerer lokalt
- Eller eksporter direkte fra Firebase Console
