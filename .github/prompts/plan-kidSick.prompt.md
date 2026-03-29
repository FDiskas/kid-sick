## Plan: Kid Health Tracker With Google Sheets

Build a frontend-only React app that lets each authenticated user create/use their own Google Sheet in Drive and track child profiles, temperatures, and medication events. Use Google Identity Services + Google APIs directly from the browser, structure data in normalized sheet tabs, and implement the UI with shadcn CLI-installed components to keep development consistent with your requirement.

**Steps**
1. Phase 1 - Foundation and dependencies
2. Add required runtime libraries: `react-router-dom`, `zod`, `react-hook-form`, `@hookform/resolvers`, and optionally `date-fns` for display formatting. Keep networking on native `fetch` to avoid extra weight.
3. Add shadcn components strictly through CLI (for example: `pnpm dlx shadcn@latest add card button input label textarea dialog dropdown-menu tabs table form select calendar popover sheet badge toast alert`).
4. Set environment contract in `.env.example` and app config module for `VITE_GOOGLE_CLIENT_ID` and optional defaults (sheet name prefix, app name).
5. Phase 2 - Google auth and API integration (*depends on 1-4*)
6. Implement GIS loader + OAuth token flow in a dedicated Google auth service. Use scopes `https://www.googleapis.com/auth/drive.file` and `https://www.googleapis.com/auth/spreadsheets`.
7. Implement `GoogleAuthContext` for sign-in, sign-out, token in-memory storage, token-expiry checks, and re-auth prompt on expiration (no offline queueing).
8. Implement Drive/Sheets service layer for:
9. Finding or creating per-user spreadsheet in their Drive (app-specific naming convention).
10. Ensuring required tabs exist (`Kids`, `TemperatureLogs`, `MedicationLogs`, `GrowthLogs`, optional `Meta`).
11. Reading/writing rows with header-based mapping utilities and id/timestamp generation.
12. Phase 3 - Domain model and data operations (*depends on 6-11*)
13. Define TypeScript domain types and validation schemas:
14. Kid profile: id, name, birthDate, currentHeightCm, currentWeightKg, notes, createdAt, updatedAt.
15. Temperature record: id, kidId, measuredAt, value, unit, method, notes.
16. Medication record: id, kidId, takenAt, medicationName, dose, unit, notes.
17. Growth record: id, kidId, measuredAt, heightCm, weightKg, notes.
18. Implement repository functions that translate schemas <-> sheet rows and enforce basic client-side validation + error normalization.
19. Phase 4 - App architecture and UX (*depends on 7 and 12-18; can build UI in parallel with service mocks*)
20. Add routing with pages: `Auth`, `Dashboard`, `KidDetail`, `Settings` and route guard requiring Google auth.
21. Dashboard UX: kid list, add/edit kid dialog, latest measurements summary, quick actions.
22. Kid detail UX: tabs for temperatures, meds, growth history; create/edit entries from dialog forms.
23. Keep public-app safety messaging in UI: consent explanation, scope explanation, and data ownership note (data lives in user Drive).
24. Provide loading/empty/error states using shadcn alerts/skeletons and global toasts for write success/failure.
25. Phase 5 - Data integrity and performance hardening (*depends on 19-24*)
26. Add optimistic UI only for safe create operations; fallback to authoritative refetch after writes.
27. Debounce expensive refreshes and batch read calls where possible to stay under Sheets API quotas.
28. Add defensive handling for sheet schema drift (missing columns or tab renamed) by auto-repairing headers/tabs when possible.
29. Add privacy controls: quick "Disconnect Google" action and optional "Open my sheet" external link.
30. Phase 6 - Polish and release-readiness (*depends on all prior phases*)
31. Improve responsive layout for mobile entry workflows (single-column forms, sticky action footer, touch-friendly controls).
32. Add onboarding empty state: sign in -> create sheet -> add first kid -> add first temperature/medication.
33. Document setup in README: Google Cloud console steps, OAuth consent settings, authorized origins, local dev flow, and known limitations for frontend-only auth.

**Relevant files**
- `src/main.tsx` - add provider composition (`ThemeProvider`, router, auth provider).
- `src/App.tsx` - convert from demo content to route shell.
- `src/components/theme-provider.tsx` - preserve existing pattern and mirror context style for auth.
- `src/lib/utils.ts` - keep shared helpers; add only generic formatting/helpers if needed.
- `src/index.css` - maintain established visual system and extend component-level styling tokens only.
- `src/components/ui/*` - shadcn-generated components added by CLI.
- `src/features/auth/*` - GIS auth service, context, hooks, and route guard.
- `src/features/kids/*` - kid CRUD UI and data adapters.
- `src/features/temperature/*` - temperature log forms/list.
- `src/features/medication/*` - medication log forms/list.
- `src/features/growth/*` - historical growth entry/list and latest profile sync.
- `src/features/sheets/*` - spreadsheet bootstrap + row mapping repository.
- `.env.example` - required client configuration keys.
- `README.md` - run/setup/Google configuration documentation.

**Verification**
1. Run typecheck/build: `pnpm build` and confirm zero TypeScript errors.
2. Run lint: `pnpm lint` and resolve violations from new modules.
3. Manual OAuth flow: sign in, grant scopes, verify app discovers/creates user sheet.
4. Manual CRUD flow: add kid, edit kid profile, add temperature, add medication, add growth entry, then refresh app and confirm persistence.
5. Cross-check in Google Sheets UI that rows are written to correct tabs with correct timestamps/ids.
6. Verify auth-expiry behavior by clearing token state and confirming re-auth prompt appears before next write.
7. Mobile check (responsive): create and edit entries on narrow viewport without layout breakage.

**Decisions**
- Storage model: per-user spreadsheet in each user Drive.
- Audience: multi-user public app.
- Medication MVP fields: name, dose, unit, timestamp, notes.
- Growth model: both latest profile values and historical growth logs.
- Offline behavior: no local queueing; online auth is required before save.
- Backend scope: excluded by requirement; all API calls are browser-side.

**Further Considerations**
1. OAuth production readiness: if app verification or sensitive-scope review becomes burdensome, consider a later migration path to Apps Script proxy while preserving current UI/domain modules.
2. Quota scaling: if write frequency grows, prioritize batch operations and lightweight cache strategy to avoid per-interaction full-sheet reads.
3. Data governance: add explicit data export/delete guidance in settings so users can self-manage records in their own Drive.
