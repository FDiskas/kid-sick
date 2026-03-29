---
name: kid-sick-project
description: 'Use when implementing, extending, debugging, or reviewing the Kid Sick Tracker app. Covers project structure, Google Sheets data model, frontend-only constraints, shadcn usage rules, auth flow, and completion checks for changes in this repo.'
argument-hint: 'Describe the feature, bug, refactor, or documentation task in Kid Sick Tracker'
user-invocable: true
---

# Kid Sick Project

## What This Skill Produces

This skill guides work in the Kid Sick Tracker repository so changes stay aligned with the app's architecture and product constraints.

Use it to:
- add or modify features in the child health tracker
- debug Google auth or Google Sheets persistence flows
- review whether a change fits the frontend-only architecture
- understand where code belongs before editing
- verify a change is complete before handing it back

## When to Use

Use this skill when prompts involve any of these triggers:
- Kid Sick Tracker
- Google Sheets storage
- Google Drive authorization
- kid profile CRUD
- temperature logs
- medication logs
- growth logs
- frontend-only architecture
- shadcn component additions
- app structure or file placement in this repo

## Project Rules

- The app is frontend-only. Do not introduce a backend or server dependency unless explicitly requested.
- Data is stored per user in a Google Sheet created in that user's Google Drive.
- Google auth uses Google Identity Services and browser-side tokens.
- UI components should be added via shadcn CLI, not handwritten replacements for standard project UI primitives.
- Prefer native `fetch` for Google API calls unless there is a strong reason to add another client.
- Keep the current React + TypeScript + Vite structure and existing theme system intact.

## Project Structure

### App Shell And Routing

- `src/main.tsx`: root providers and toaster
- `src/App.tsx`: router entry and route definitions
- `src/components/app-shell.tsx`: shared authenticated layout
- `src/pages/auth-page.tsx`: Google sign-in screen
- `src/pages/dashboard-page.tsx`: kid list, add/edit, delete
- `src/pages/kid-page.tsx`: per-kid temperature, medication, and growth tabs
- `src/pages/settings-page.tsx`: sheet link and disconnect action

### Auth And Google Integration

- `src/config/env.ts`: environment variables
- `src/features/google/gis.ts`: Google Identity script loading
- `src/features/auth/auth-context.tsx`: auth state, persistence, sign-in, sign-out
- `src/features/auth/require-auth.tsx`: protected route guard

### Data Layer

- `src/features/sheets/google-api.ts`: low-level Google Sheets and Drive API operations
- `src/features/sheets/sheets-schema.ts`: sheet names and headers
- `src/features/sheets/health-repository.ts`: domain-level CRUD and cascade delete
- `src/features/health/types.ts`: TypeScript domain types
- `src/features/health/schemas.ts`: Zod validation schemas

### UI Primitives

- `src/components/ui/*`: shadcn-generated UI components
- `src/components/theme-provider.tsx`: theme state and toggling
- `src/index.css`: global tokens and visual system

## Google Sheets Data Model

The app expects these tabs in each spreadsheet:
- `Kids`
- `TemperatureLogs`
- `MedicationLogs`
- `GrowthLogs`

Expected relationships:
- `Kids.id` is the primary identifier
- `TemperatureLogs.kidId` references `Kids.id`
- `MedicationLogs.kidId` references `Kids.id`
- `GrowthLogs.kidId` references `Kids.id`

Deletion rule:
- deleting a kid must also delete all related temperature, medication, and growth rows

Profile rule:
- historical growth belongs in `GrowthLogs`
- latest height and weight are also mirrored on the kid profile row

## Standard Workflow

1. Confirm the request fits the frontend-only Google Sheets architecture.
2. Identify whether the change belongs in app shell, auth, Sheets API, repository, validation, or page UI.
3. If the task adds standard UI, install components with shadcn CLI before using them.
4. Keep domain validation in `src/features/health/schemas.ts` and domain types in `src/features/health/types.ts`.
5. Put low-level Google API mechanics in `src/features/sheets/google-api.ts`.
6. Put domain behavior and row translation in `src/features/sheets/health-repository.ts`.
7. Keep page components focused on UI state, form handling, and calling repository functions.
8. If a feature changes stored data shape, update both sheet headers and repository mapping logic together.
9. If a feature affects auth lifecycle, preserve refresh persistence and explicit logout behavior.
10. Validate with lint and build before concluding work.

## Decision Points

### When adding data fields

- Update the relevant TypeScript type.
- Update the corresponding Zod schema.
- Update sheet headers if the field is persisted.
- Update repository read/write mapping.
- Update UI forms and tables.

### When adding a new tracked record type

- Prefer a new sheet tab over overloading existing tabs.
- Add a new typed model and validation schema.
- Add repository list/create helpers.
- Add the UI in a dedicated section or tab in the appropriate page.

### When changing auth behavior

- Preserve browser refresh persistence.
- Remove persisted auth on logout or expiry.
- Keep the app functional without a backend.

### When changing navigation or layout

- Put shared authenticated chrome in `src/components/app-shell.tsx`.
- Put route protection in `src/features/auth/require-auth.tsx`.
- Keep page-specific actions inside the relevant page component.

### When changing Google Sheets operations

- Keep API-specific request shapes in `google-api.ts`.
- Keep business rules in `health-repository.ts`.
- Handle row index mutation safely when deleting rows by deleting from bottom to top.

## Quality Criteria

A change is complete when all of these are true:
- it respects the frontend-only architecture
- it does not break per-user Google Sheet ownership
- it keeps the data model consistent across types, schemas, headers, repository mapping, and UI
- it uses existing project structure instead of introducing parallel patterns
- it preserves or improves auth/session handling when relevant
- it keeps destructive operations explicit and safe
- it passes lint and production build

## Completion Checks

Run these before considering the task done:

1. `npm run lint`
2. `npm run build`
3. Manual check of the affected UI flow
4. If data changed, confirm rows are written or removed correctly in Google Sheets
5. If auth changed, refresh the page and verify expected session behavior

## Common Pitfalls

- Adding data fields in the form but not the sheet header mapping
- Writing Google API logic directly inside page components
- Breaking auth persistence by only storing in React state
- Introducing `asChild` assumptions for this repo's button primitive instead of using `buttonVariants` with links
- Deleting parent rows without deleting related child rows in other tabs
- Using a different package manager command than the repo is currently configured to run in the environment

## Example Prompts

- `/kid-sick-project add edit and delete for medication records`
- `/kid-sick-project add fever trend chart to the kid detail page`
- `/kid-sick-project debug why Google auth stops working after refresh`
- `/kid-sick-project add a new symptom log sheet and UI`
- `/kid-sick-project review whether this change fits the project structure`