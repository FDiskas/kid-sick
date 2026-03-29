# Kid Sick Tracker

Frontend-only React app for tracking child health data in Google Sheets. Each user authorizes Google and stores records in a spreadsheet created in their own Drive.

## Features

- Google authorization using Google Identity Services
- Per-user spreadsheet bootstrap in Google Drive
- Kid profile CRUD with birthday, latest height, latest weight, notes
- Temperature logs
- Medication logs (name, dose, unit, timestamp, notes)
- Growth logs (historical entries + profile latest sync)
- No backend/server required

## Stack

- React + TypeScript + Vite
- shadcn UI components (added by CLI)
- React Router
- React Hook Form + Zod

## Local Setup

1. Install dependencies:

```bash
pnpm install
```

2. Copy env variables:

```bash
cp .env.example .env
```

3. Set `VITE_GOOGLE_CLIENT_ID` in `.env`.

4. Start development server:

```bash
pnpm dev
```

## Google Cloud Configuration

1. Create a Google Cloud project.
2. Enable APIs:
   - Google Drive API
   - Google Sheets API
3. Configure OAuth consent screen.
4. Create OAuth client credentials for a web app.
5. Add authorized JavaScript origins:
   - `http://localhost:5173`
   - your production origin
6. Use the generated client ID as `VITE_GOOGLE_CLIENT_ID`.

## Scripts

- `pnpm dev` - run local dev server
- `pnpm build` - typecheck and build
- `pnpm lint` - lint code
- `pnpm typecheck` - TypeScript check only

## Notes and Limits

- Access token is browser-side and session-bound.
- Re-auth is required after token expiry.
- Data is written directly to Google APIs from the browser.
- If OAuth verification requirements become strict for production, consider moving API writes behind a Google Apps Script proxy while keeping UI and domain modules unchanged.
- Themes are used from https://tweakcn.com/editor/theme
