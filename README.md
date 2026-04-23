# Fuel Credit (Firebase backend)

Fuel Credit now runs on Firebase Auth + Firestore with the existing multi-company frontend.

## Backend stack

- React Native Firebase: `@react-native-firebase/app`, `auth`, `firestore`
- Auth: Email + password
- Database: Cloud Firestore
- Data model source: `src/types/index.ts`

## Setup

1. Keep `google-services.json` at project root (already added).
2. In Firebase Console:
   - Enable **Authentication > Email/Password**.
   - Create Firestore database in production mode.
   - Publish rules from `src/firebase/rules.txt`.
3. Install dependencies:

```bash
npm install
```

## Dev client (Expo Go not supported)

Because RN Firebase is native, run with a dev client:

```bash
npx expo prebuild
npx expo run:android
npx expo start --dev-client
```

Or with EAS:

```bash
eas build --profile development --platform android
npx expo start --dev-client
```

## Auth flows implemented

- Company register: email + password
- Pump register: email + password
- Login: email + password + forgot-password
- Pump employee invite:
  - Pump owner enters employee name + email.
  - App stores invite in `pendingEmployees/{email}`.
  - Employee uses **Employee signup** on login, then first login claims the pending record and creates their `users/{uid}` document.

## Firestore collections

- `users`
- `companies`
- `pumps`
- `companyPumpLinks`
- `pumpInvites`
- `pendingEmployees`
- `fuelRequests`
- `transactions`
- `bills`

## Optional seed (dev only)

To seed Firestore from mock data, use:

- Script: `scripts/seedFirestore.ts`
- Source data: `src/mock/seed.ts`
