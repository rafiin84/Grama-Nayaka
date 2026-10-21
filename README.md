# Grama Nayaka · ಗ್ರಾಮ ನಾಯಕ

*Learn. Lead. Transform your community.* — A **frontend-only prototype** of a bilingual (Kannada-first / English) leadership development and community-action platform. Everything runs on **fictional, seeded demo data** in the browser.

> **Not real:** there is no backend, database, authentication, SMS, Aadhaar verification, voter-data integration, WhatsApp sending, payment or government integration. Nothing is filed with, sent to, or verified by any authority.

## Run
```bash
npm install --legacy-peer-deps   # @hookform/resolvers has an optional-peer conflict
npm run dev                      # http://localhost:3000
npm run build && npm start
npm test                         # unit tests (vitest)
npm run test:admin               # admin e2e (needs dev server on :3100)
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

## Admin panel (integrated into the existing app)
Reachable from the demo role switcher (State = Super Admin). Pages: **Dashboard** (`/admin`), **Users & Volunteers** (`/admin/users`), **Village Enrollment** (`/admin/villages`), **Roles & Permissions** (`/admin/roles`), **Training Operations** (`/admin/training`), plus the existing Applications, Participants, LMS, Community Records, Grievances, Events, Rewards, Reports, Templates, Audit Log and Settings.
- **Dashboard:** volunteers registered/trained/pending, sessions, villages enrolled/pending, districts/blocks/Gram Panchayats, grievances (submitted, pending action, awaiting official response, closed), learning resources, active/inactive users, trends, pending approvals, alerts and recent activity. Filters: district, block/taluk, Gram Panchayat, village, date range, training status, grievance status. All values are computed from the app's records in `src/lib/adminStats.ts`; only the 1,00,000 volunteer target is a fixed number.
- **Users & Volunteers:** add/edit/view, assign location, assign roles (a role can only assign roles below its own; only Super Admin grants Super Admin; the last active Super Admin is protected), activate/deactivate/suspend with reason, start a password reset (mock, no passwords exist), soft delete + restore (records preserved), CSV import with per-row validation and duplicate detection, CSV export, duplicate review, training history / villages / grievance activity per volunteer.
- **Roles & Permissions:** editable matrix (view/create/edit/delete/approve/export per module, manage-users and change-settings flags, data scope) for Super Admin, District Admin, Block Admin, Training Coordinator, Trainer, Grievance Manager, Content Manager and Volunteer. Navigation, route access and action buttons follow the matrix (`src/lib/rbac.ts`). Only Super Admin can edit it.
- **Village Enrollment:** add/edit/enroll/archive/delete villages under a Gram Panchayat and assign volunteers.
- **Training:** create/edit/reschedule/cancel/delete sessions with location, capacity, trainer and coordinator, room/trainer conflict checks, registered/attended/completed/pending counts, certification status, materials (file name and size only), and session-, district- and block-wise reports with CSV download.

### Admin panel limitations
- No backend or real authentication exists in this prototype, so there is no real login, password or last-login tracking (the "last login" column is seed data). Roles and permissions are a **UI simulation**; production must enforce them on a server.
- "Real-time" means live against this browser's saved demo data. Each browser has its own data; Settings → Reset restores the seed.
- CSV only for import (save Excel files as CSV). Training materials record the file name and size; nothing is uploaded. Training duration is fixed at 2 days because attendance is modelled per day (day 1 / day 2).
- The requirement text was cut off at section 5, so reports beyond training (and anything after) were not specified.

## Sign in, sessions and Logout
- **Register** (hero button and `/register`) starts the application: mobile number → consent → OTP → application form. **Sign in** (header, right) is `/signin`: mobile number → OTP → verified → you land on your own home (volunteers `/app`, staff `/admin`, trainers `/admin/training`). Nobody is signed in until the code is verified.
- Signed in, the header shows your profile (initial + name) with **Open my home** and **Log out**; logging out restores **Sign in**. The session (name, role, masked phone) survives a reload and is cleared on logout. The OTP itself is never stored.
- Demo OTP is **123456** (000000 = expired; 3 wrong tries lock the form). The Sign in page lists fictional demo numbers. A number that verifies but has no account is told to register; inactive, suspended or deleted accounts cannot sign in. A new applicant only sees Home, Application status and Help until approved.
- Signing in as a volunteer switches the participant screens to that person's data (most seeded volunteers have little activity, which is realistic).
- **This is a UI simulation.** There is no server and no SMS gateway, and pages are not hard-blocked for signed-out visitors (the role switcher in the profile menu stays as a labelled demo tool). A real deployment needs a real OTP provider, server-issued sessions and server-side authorisation.

## Admin add / edit / manage screens
Every list has a working **Add**, **View**, **Edit**, **Delete (with confirmation)**, search/filter and, where it makes sense, **bulk actions**, with field-level validation and success/error messages. Forms are full pages with unsaved-changes protection.
- **Users & Volunteers:** `/admin/users/new`, `/admin/users/[id]`, `/admin/users/[id]/edit`. Fields: name, mobile, email, date of birth, address, district/block/Gram Panchayat, village, assigned training session, role, account status; training status is derived from the session and attendance. Profile actions: change role, assign villages, activate/deactivate/suspend (reason required), issue a new activation code, delete/restore. Bulk: activate, deactivate/suspend, register for a session, delete; CSV import/export.
- **Credentials:** there is no authentication system in this prototype and no password is ever created. A new account gets an ID and a **one-time activation code** shown once; only its SHA-256 hash and expiry are stored (`src/lib/credentials.ts`). A real deployment must issue activation links through its own secure authentication system.
- **Training:** `/admin/training/new`, `/admin/training/[id]` (view), `/admin/training/[id]/edit`. Save draft / Publish / Update / Cancel; description, dates (end date is calculated: the programme is fixed at 2 days), location, region, trainer, coordinator, capacity 30–100, registration deadline, supporting documents. Draft sessions cannot take registrations. Detail page: assign trainer, bulk register volunteers, record attendance, mark completion (approved exception, reason required), upload materials, reschedule, cancel.
- **Learning Resources:** `/admin/resources` (+ `/new`, `/[id]`, `/[id]/edit`, Categories tab). Upload a video, PDF or document, or add a YouTube/video/website link; thumbnail, language, audience, display order, status (Draft/Published/Scheduled/Archived) and publish date. Volunteers see only live resources aimed at them in **My Learning → Resource library**.
- **Files and "the database":** uploads and all records live **in this browser** (IndexedDB + local storage). There is no server or database, so nothing is shared between users or devices. The mock API in `src/lib/api.ts` is the single place to replace with real backend calls (for example Zoho Catalyst Data Store, File Store and Authentication).

## Home-page media and credits
- **Section photos** (`public/images/sections/`) and the **sample video** (`public/videos/`) are freely licensed files from Wikimedia Commons (CC BY / CC BY-SA). Their licences require attribution, so every photo carries a visible credit link and the footer has a "Photo and video credits" list. Details live in `src/lib/credits.ts`. Resized/cropped copies are adaptations; CC BY-SA applies to those images, not to this app's code.
- **Training video player** (`TrainingVideoPlayer`, `src/components/Media.tsx`): click-to-play (nothing downloads until play), accessible, shows an error message if the file cannot play. The playlist is `src/lib/trainingVideos.ts`. The bundled clip ("Women in Panchayat", Indian Diplomacy, CC BY 3.0, 26 MB WebM) is a **sample documentary, not footage of this programme's training**. To show your own training recordings, add MP4/WebM files under `public/videos/` (or a `youtubeId`) to that list and remove `sample: true`.
- The hero image is the owner-supplied illustrative image (`public/hero.jpg`).

## Scope switcher
The top bar shows **Scope: <current value> ⌄** for every non-participant role; click it to change the scope in a dropdown right there (search, keyboard arrows/Esc, selected item ticked, saved across reloads). The choices depend on the role: Super Admin and the other state-wide roles can pick all of Karnataka, a district or a Gram Panchayat; a District Admin can narrow to Gram Panchayats in their district; a Block Admin (AC) to Gram Panchayats in their constituency; a local Block Admin is locked to one Gram Panchayat; a Trainer chooses which trainer they are acting as. The selection narrows every list, count and report through `inScope()` (`src/lib/scope.ts`). It is a UI simulation, not a security boundary.

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
