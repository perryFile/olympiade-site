# ØLympiade hjemmeside

Dansk event-site med:
- Deltagere
- Hold
- Leaderboard
- Aktiviteter
- Tidsplan
- Skjult admin-side til live-opdateringer

## Lokal opstart

1. Kopier env-fil:
```bash
cp .env.example .env
```

2. Install og start:
```bash
npm install
npm run dev
```

3. Aaben siden:
`http://localhost:5173`

Admin-rute er som standard:
`/baglokale-olympiade`

## Logo

Standardlogo ligger i:
`public/logo-olympiade.svg`

Hvis I vil bruge jeres eget logo, kan I erstatte filen med samme navn.

## Data-mode

Siden kan koere i to modes:

1. Lokal browserdata (default)
- Hurtig test
- Gemmer data i localStorage

2. Firebase live data
- Delte live-opdateringer paa tværs af enheder
- Noedvendig til rigtig event-drift

For Firebase: udfyld alle `VITE_FIREBASE_*` variabler i `.env`.

Detaljeret guide findes i:
`FIREBASE_SETUP_DA.md`

## Firebase regler

Klar til brug:
- `firebase/database.rules.json`
- `firebase.json` (database)

Hvis du vil deploye regler via Firebase CLI:

```bash
npm install -g firebase-tools
firebase login
cp .firebaserc.example .firebaserc
# ret projekt-id i .firebaserc
firebase deploy --only database
```

## GitHub Pages deploy

Workflow ligger i:
`.github/workflows/deploy.yml`

Detaljeret secrets-guide findes i:
`GITHUB_SECRETS_DA.md`

### Krav i GitHub repo

1. Slå Pages til under: Settings -> Pages -> Source: GitHub Actions
2. Tilføj secrets under: Settings -> Secrets and variables -> Actions
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_DATABASE_URL`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
3. Push til `main`

### Valgfrit

Repo variable til admin-sti:
- `VITE_ADMIN_PATH`

Eksempel:
`/hemmeligt-ol-panel-2026`

## Vigtig sikkerhedsnote

I har valgt skjult admin-link uden login.
Det er nemt, men mindre sikkert.

Minimum anbefaling:
- Brug lang og svaer admin-sti
- Del kun med arrangoerer
- Roter admin-sti efter event
