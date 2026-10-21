# Grama Nayaka · ಗ್ರಾಮ ನಾಯಕ

*Learn. Lead. Transform your community.* — A **frontend-only prototype** of a bilingual (Kannada-first / English) leadership development and community-action platform. Everything runs on **fictional, seeded demo data** in the browser.

> **Not real:** there is no backend, database, authentication, SMS, Aadhaar verification, voter-data integration, WhatsApp sending, payment or government integration. Nothing is filed with, sent to, or verified by any authority.

## Run
```bash
npm install --legacy-peer-deps   # @hookform/resolvers has an optional-peer conflict
npm run dev                      # http://localhost:3000
npm run build && npm start
npm test                         # unit tests (vitest)
npm start -- -p 3111 & npm run test:smoke && npm run test:e2e   # Playwright (needs `npx playwright install chromium`)
```

## Demo guide
- **Role switcher:** profile menu (top right) → six roles (State, District, AC, Taluk/GP, Trainer, Participant). It changes navigation, routes, and data scope.
- **OTP:** use **123456** (000000 shows the expired-code state; 3 wrong tries rate-limit). Never sent, stored, or logged.
- **Participant lifecycle:** Home → "Demo: preview lifecycle stage" shows applicant → approved → training → LMS → fieldwork → completed.
- **Reset:** Admin → Settings → Reset demo data. Inject a one-off API error from the same page.

## What is built
Public landing, registration + consent + OTP simulation, 7-step application with save/resume; application status; participant home, learning (catalog, course, video/reading/MCQ/recorded-answer/assignment), community directory (residents), grievances (list, create, detail with full state machine, follow-up planner), AI assistant (ask, pathway, draft studio), events, rewards (impact, leaderboard, redemption), certificates (printable, KN/EN, sample-labelled), notifications, profile (consent receipts, withdrawal, rights requests), help.
Admin/trainer: overview (KPIs, funnel, capacity, grievance charts with table views), applications (manual decisions only), participants, training operations (cycle, 3 cohorts × 3 classes, capacity 30–100, conflict checks, roster assign/move, attendance with audited corrections), LMS admin, community records + restricted voter-related records, grievances, events (create/edit/cancel), rewards rules/ledger/redemptions, reports, templates, audit log, settings.

## Architecture
- Next.js 15 (App Router), React 19, strict TypeScript, Tailwind v4, Framer Motion, Phosphor icons, Zustand, TanStack Query, React Hook Form + Zod, Recharts.
- `src/lib/seed*.ts` fixtures → `src/lib/db.ts` (zustand store, persisted to localStorage; **synthetic data only**) → `src/lib/api.ts` (async mock API with latency, error injection, audit logging; `useMock` for reads, `useAct` for writes). Components never mutate fixtures directly.
- **i18n:** `src/lib/i18n.ts` holds typed dictionaries for shell/navigation; screen copy uses co-located `tr(en, kn)` pairs so both languages are always required. Bilingual content uses `loc()` which marks missing translations instead of silently showing the other language.
- **Geography:** assembly constituencies are a separate relation (`acs` → taluks), not children of districts.
- **Permissions:** `src/lib/nav.ts` (route allow-list per role) and `inScope()` in `db.ts`.

## Honest limitations / decisions
- **Frontend permissions are not a security boundary.** Production must enforce authorization, scoping and masking **on a server**.
- **Legal review required.** The privacy notice, purposes, retention periods and legal basis are placeholders. Counsel must approve them; the mock consent receipts do not make anything compliant. Production also needs data minimisation, encryption, retention/deletion workflows and incident response.
- **AI is simulated** with deterministic local text; no model is called and no resident/voter data would be sent. It never files, promises, or invents reference numbers.
- **Video:** no real media; a simulated player (faster than real time) with transcript is used. **Recording** is simulated (no mic/camera).
- **Offline:** only an offline indicator and a display-only "pending sync" note; no real background sync.
- **Hero image:** the landing page uses a product-owner-supplied illustrative image (`public/hero.jpg`, resized from the supplied PNG). It contains a banner showing a public figure; confirm with the owner that this is intended. The earlier Wikimedia portrait (CC BY-SA 4.0, Sanket Oswal) was removed from the page. No quote, endorsement text or party symbol is added.
- **Stack deviations:** shadcn/ui and next-intl are not used (accessible primitives live in `src/components/ui.tsx`; typed internal dictionary instead). Unit tests run in the `node` environment (jsdom 30 is incompatible with Node 22.4); UI behaviour is covered by the Playwright scripts in `tests/`.
- **Not done / next:** real image/audio assets, Kannada copy review by a native speaker, a11y audit with assistive technology, contrast validation of all tokens in dark mode, a map for geography, richer admin course editing (lessons/media), full Playwright suite in CI.
