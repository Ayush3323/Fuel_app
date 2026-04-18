# Fuel Credit (UI demo)

UI-only **Fuel Credit Management**: companies and pumps **self-register**; companies **invite pumps** with a 6-character code; pumps **join** from their Companies screen. Fuel requests, fills, and bills are scoped to `(companyId, pumpId)`.

## Run

```bash
npm install
npx expo start
```

## Demo logins (seeded)

| Role | User ID | Password |
|------|---------|----------|
| Company (Karma) | `admin` | `admin123` |
| Company (Shree) | `shree` | `shree123` |
| Pump owner (HPE) | `pump1` | `pump123` |
| Pump owner (Ellar) | `pump2` | `pump123` |
| Employee (on HPE) | `emp1` | `emp123` |

**Dev chips** on the login screen switch users without a password.

## Join flow (demo)

- Pump `p1` starts linked only to **Karma** (`co1`). Use **Invites** on the Shree company (`shree`) to generate a code, or use the pre-seeded unused code **`ABC123`** (company Shree) on the pump’s **Join** screen to link Shree.
- After redeeming, Shree appears on the pump’s **Companies** list; open it for per-company requests / billing.

## Register (new accounts)

From login: **Register company** or **Register pump** (in-memory; no backend).

## Stack

- Expo Router — [`app/`](app/)
- State: [`src/context/AppContext.tsx`](src/context/AppContext.tsx)
- Types / seed: [`src/types/index.ts`](src/types/index.ts), [`src/mock/seed.ts`](src/mock/seed.ts)
