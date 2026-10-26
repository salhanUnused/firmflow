# FirmFlow

Firmware-as-a-Service for small electronics teams. Sign up, create a project, register devices, upload a signed firmware binary, simulate or live-deploy to ESP32, watch telemetry, and recover from failed updates.

## Demo

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

- `/admin` — register or sign in as a workspace **admin**
- `/signup` and `/login` — engineer / operator / viewer accounts

A new signup creates an isolated workspace as an engineer. Admins are created only at `/admin`. Dummy Helio Labs logins are not seeded.

## Vercel

1. Push this repo to GitHub (the `salhanUnused` account, not `ch1mkin`).
2. Import the repo in Vercel.
3. Set environment variables from `.env.example`.
4. For durable storage, create a Supabase project, run `supabase/firmflow.sql`, and set `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`.
5. Set `NEXT_PUBLIC_APP_URL` to the Vercel URL.

Without Supabase, the server store is in-memory on Vercel and resets on cold starts. Local `npm run dev` writes `.data/world.json`.

## ESP32

See the in-app **ESP32** page and `firmware-esp32/FirmFlowClient`.

The board authenticates with a device token, downloads firmware, verifies SHA-256, installs with the ESP32 `Update` library, then reports the running version. A failed verify/install keeps the last good build; FirmFlow records the failure and can auto-rollback.

## API (device)

```
POST /api/device/heartbeat   Authorization: Bearer <token>
GET  /api/device/ota
GET  /api/device/ota/file
POST /api/device/ota/result
POST /api/device/logs
```
