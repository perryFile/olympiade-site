# GitHub Secrets til ØLympiade deploy

Denne guide forbinder GitHub Pages deploy med Firebase data.

## 1) Aabn repo settings

1. Gaa til dit GitHub repo
2. Aabn Settings -> Secrets and variables -> Actions

## 2) Opret disse Secrets

Opret en secret for hver af disse noegler:

- VITE_FIREBASE_API_KEY
- VITE_FIREBASE_AUTH_DOMAIN
- VITE_FIREBASE_DATABASE_URL
- VITE_FIREBASE_PROJECT_ID
- VITE_FIREBASE_MESSAGING_SENDER_ID
- VITE_FIREBASE_APP_ID

## 3) Hvor findes vaerdierne i Firebase

I Firebase Console:
1. Project settings
2. General
3. Your apps
4. Vaelg Web App
5. Find firebaseConfig objektet

Map felter saadan:

- apiKey -> VITE_FIREBASE_API_KEY
- authDomain -> VITE_FIREBASE_AUTH_DOMAIN
- databaseURL -> VITE_FIREBASE_DATABASE_URL
- projectId -> VITE_FIREBASE_PROJECT_ID
- messagingSenderId -> VITE_FIREBASE_MESSAGING_SENDER_ID
- appId -> VITE_FIREBASE_APP_ID

## 4) Valgfri repo variable til admin-sti

Under Variables (ikke Secrets):

- VITE_ADMIN_PATH

Eksempel:

- /hemmeligt-ol-panel-2026

## 5) Aktivér GitHub Pages workflow

1. Settings -> Pages
2. Source: GitHub Actions

## 6) Deploy

1. Push til main
2. Tjek Actions fanen
3. Naar workflow er groent, er siden live

## 7) Hurtig fejlsogning

Hvis siden loader men viser lokal datasource:

1. Kontrollér alle secret-navne stavet 100 procent korrekt
2. Kontrollér at databaseURL er sat
3. Koer et nyt push for at trigge workflow igen
