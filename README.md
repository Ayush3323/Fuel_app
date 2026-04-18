# Fuel Credit (UI demo)

UI-only **Fuel Credit Management** app for transport companies and petrol pumps: fuel requests, fill confirmation with photos, ledger-style billing (HSD/MS split, per-fuel discounts), and bill payment marking.

## Run

```bash
npm install
npx expo start
```

## Demo logins

| Role | User ID | Password |
|------|---------|----------|
| Company owner | `admin` | `admin123` |
| Pump owner (HPE) | `pump1` | `pump123` |
| Pump owner (Ellar) | `pump2` | `pump123` |
| Pump employee | `emp1` | `emp123` |

On the login screen, **Dev: jump as** switches role without typing a password.

## Stack

- Expo Router (file routes)
- React Native + TypeScript
- In-memory mock state: [`src/context/AppContext.tsx`](src/context/AppContext.tsx)

## Project layout

- `app/(admin)/` — company owner (dashboard, pumps, bills)
- `app/(pump)/` — pump owner (requests, completed, billing, team)
- `app/(employee)/` — pump employee (pending, completed)
- `src/components/ui/` — shared UI + [`BillView`](src/components/ui/BillView.tsx)
