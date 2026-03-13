# Architecture Overview

Codebasics Career Navigator is a bootcamp planning tool that generates personalized, week-by-week learning roadmaps for Data and AI careers. Users answer six questions (background, prior knowledge, target goal, career outcome, weekly availability, learning style) and receive a tailored roadmap they can download as a branded PDF.

## Tech Stack

| Layer              | Technology                                       |
| ------------------ | ------------------------------------------------ |
| Framework          | Next.js 14 (App Router, `output: "standalone"`)  |
| UI Library         | React 19                                         |
| Styling            | Tailwind CSS 3.4, `tailwindcss-animate`          |
| Component Library  | Radix UI (Dialog, Select, Tabs, Label, etc.)     |
| Animation          | Framer Motion 12                                 |
| Icons              | Lucide React                                     |
| Validation         | Zod 4                                            |
| PDF Generation     | `@react-pdf/renderer` 4 (client-side)            |
| Testing - Unit     | Custom `tsx` scripts (validate-roadmap, test-matrix, validate-schema, test-pdf) |
| Testing - E2E      | Playwright (Chromium)                            |
| Linting            | ESLint (next config)                             |
| Type Checking      | TypeScript 5.9                                   |
| Containerization   | Docker (node:20-alpine, multi-stage)             |
| Deployment         | Coolify (Docker Compose)                         |
| Data Persistence   | JSON files on disk (`data/` directory)           |
| External Services  | MySQL (via `mysql2` connection pool)                 |

## System Components

### Frontend Pages

| Route           | Component             | Description                                                     |
| --------------- | --------------------- | --------------------------------------------------------------- |
| `/`             | `BootcampPlanner`     | Main wizard UI -- 6-step questionnaire with animated transitions. Split-panel layout (hero + form). Client component. |
| `/admin/login`  | `AdminLoginPage`      | Password-based login form for the admin panel.                  |
| `/admin`        | `AdminDashboard`      | Syllabus Manager with two tabs (Subjects and Chapters). Full CRUD for both. Protected by cookie-based auth checked in `AdminLayout`. |
| `/privacy`      | `PrivacyPolicyPage`   | Static privacy policy page. Server component with metadata.     |
| `/terms`        | `TermsOfServicePage`  | Static terms of service page. Server component with metadata.   |

### Key Client Components

| Component            | Location                                    | Purpose                                                        |
| -------------------- | ------------------------------------------- | -------------------------------------------------------------- |
| `SelectionStep`      | `components/planner/SelectionStep.tsx`      | Reusable single-select step card (background, goal, availability, learning style). |
| `ExperienceStep`     | `components/planner/ExperienceStep.tsx`     | Multi-select step for prior knowledge (Python, SQL, Stats, ML, DL, NLP, GenAI, MLOps). |
| `RoadmapResult`      | `components/planner/RoadmapResult.tsx`      | Renders the generated roadmap with expandable phases, stats, and CTA. |
| `PdfDownloadModal`   | `components/planner/PdfDownloadModal.tsx`   | Lead capture form (name + email), then triggers client-side PDF generation and download. |
| `ProgressBar`        | `components/planner/ProgressBar.tsx`        | Visual step indicator for the wizard.                          |
| `UserDetailsStep`    | `components/planner/UserDetailsStep.tsx`    | User detail collection (used inside the PDF modal flow).       |
| `Providers`          | `app/providers.tsx`                         | Wraps children in `MotionConfig` with `reducedMotion: "user"`. |
| UI primitives        | `components/ui/*.tsx`                       | Radix-based primitives: Button, Input, Dialog, Select, Tabs, Badge, Card, etc. |

### Backend API Routes

| Route                 | Methods    | Auth     | Purpose                                               |
| --------------------- | ---------- | -------- | ----------------------------------------------------- |
| `/api/syllabus`       | GET, PUT   | PUT only | GET returns syllabus JSON (supports `?type=free`). PUT updates `syllabus_v3.json` (admin auth required). |
| `/api/leads`          | POST       | No       | Validates lead data (Zod), stores in MySQL. Includes honeypot bot protection. |
| `/api/feedback`       | POST       | No       | Validates feedback (rating 1-5, optional comment), stores in MySQL. |
| `/api/admin/auth`     | POST       | No       | Login (password verification with HMAC + timing-safe comparison) and logout. Rate limited: 5 attempts per 15 minutes per IP. |
| `/api/admin/check`    | GET        | Cookie   | Returns `{ authenticated: true/false }` based on `admin_token` cookie. |
| `/api/health`         | GET        | No       | Returns `{ status: "ok", timestamp }`. Used by Docker healthcheck. |

### Server-Side Libraries

| Module                     | Purpose                                                        |
| -------------------------- | -------------------------------------------------------------- |
| `lib/auth.ts`              | HMAC-SHA256 cookie-based auth. Derives session token from `ADMIN_PASSWORD` env var. Uses `timingSafeEqual` for constant-time comparisons. Cookie: `admin_token`, httpOnly, 24h TTL. |
| `lib/rateLimit.ts`         | In-memory rate limiter. 5 attempts per 15-minute window per IP. Suitable for single-instance deployments. |
| `lib/syllabusStore.ts`     | Atomic read/write for `data/syllabus_v3.json`. Uses temp-file + rename pattern and an in-process write lock to prevent corruption. |
| `lib/leads/db.ts`          | Stores lead and feedback data in MySQL via `mysql2/promise` connection pool. Auto-creates `submissions` table on first request. |
| `lib/logger.ts`            | Structured JSON logger (info/warn/error) wrapping `console.*`.  |
| `lib/generatePlan.ts`      | Core roadmap generation engine. Handles skip logic (experience-based, goal-based, flag-based), profile multipliers, availability scaling, phase construction, and practical-first reordering. |
| `lib/schemas/planInputSchema.ts` | Zod schema for runtime validation of `PlanInput`.         |
| `lib/types.ts`             | Core type definitions: `PlanInput`, `PlanResult`, `Phase`, `ExperienceState`, `StepOption`. |
| `lib/syllabusTypes.ts`     | Data types: `Subject`, `SyllabusData`, `SubjectCategory`.      |
| `lib/bootcampData.ts`      | `Chapter` type definition and `FULL_ROADMAP` static dataset (legacy bootcamp roadmap). |
| `lib/normalizeTitle.ts`    | Title normalization utility (strips "Week N:" / "Module N:" prefixes). |
| `lib/utils.ts`             | `cn()` (clsx + twMerge), `formatWeeks()`, `weeksToMonths()`.   |
| `lib/validatePlan.ts`      | Plan validation utilities used by test scripts.                |
| `lib/pdf/generateBrandedPdf.ts` | PDF document builder using `@react-pdf/renderer`.         |
| `lib/pdf/designTokens.ts`  | PDF design constants (colors, fonts, spacing).                 |
| `lib/pdf/registerFonts.ts` | Font registration for `@react-pdf/renderer`.                   |

### Data Storage

The application uses **JSON file persistence** rather than a database:

| File                       | Description                                                      |
| -------------------------- | ---------------------------------------------------------------- |
| `data/syllabus_v3.json`   | Primary syllabus data. Contains `subjects[]` and `chapters[]`. Editable via the admin panel. Written atomically (temp file + rename). |
| `data/free_syllabus.json` | Free-tier syllabus data. Same schema as `syllabus_v3.json`. Read-only from the API (not editable via admin). |

In Docker, the `data/` directory is mounted as a named volume (`syllabus_data`) to persist changes across container restarts.

### External Integrations

| Service              | Integration Point                | Details                                                       |
| -------------------- | -------------------------------- | ------------------------------------------------------------- |
| MySQL                | `lib/leads/db.ts`               | Lead data and feedback are stored in a MySQL `submissions` table via `mysql2/promise`. Configured with a single `MYSQL_URL` env var. |
| Codebasics.io        | Bootcamp CTA links              | The roadmap result page links to relevant Codebasics bootcamp pages based on the selected goal. |

### Environment Variables

| Variable                      | Required | Purpose                                              |
| ----------------------------- | -------- | ---------------------------------------------------- |
| `ADMIN_PASSWORD`              | Yes      | Admin panel password. Also used to derive the HMAC session token. |
| `AUTH_SECRET`                 | No       | Optional HMAC key for password verification. Falls back to `ADMIN_PASSWORD`. |
| `MYSQL_URL`                    | No     | MySQL connection URL (e.g. `mysql://user:pass@host:3306/db`). If unset, lead/feedback capture is silently skipped. |

## Data Flow

### 1. Roadmap Generation (Main User Flow)

```
User opens / --> BootcampPlanner loads
  --> useEffect fetches GET /api/syllabus?type=free
  --> Server reads data/free_syllabus.json, returns SyllabusData
  --> User answers 6 questions (background, experience, goal, outcome, hours, style)
  --> User clicks "Generate Roadmap"
  --> generatePlan() runs CLIENT-SIDE:
      1. Skip logic: removes subjects user already knows (experience checkboxes)
      2. Goal filtering: removes subjects not core to the selected career path
      3. Profile multiplier: adjusts duration based on background + learning preference
      4. Availability scaling: stretches/compresses weeks based on hours/week
      5. Phase construction: groups chapters into phases by subject
      6. Practical reordering: interleaves projects if "practical" learning style
  --> RoadmapResult renders phases with expandable chapter details
  --> User clicks "Download PDF"
  --> PdfDownloadModal opens: collects name + email
  --> POST /api/leads stores lead data in MySQL
  --> Client-side @react-pdf/renderer generates branded PDF
  --> PDF downloads to user's device
```

### 2. Admin Syllabus Management

```
Admin navigates to /admin
  --> AdminLayout checks GET /api/admin/check (cookie-based)
  --> If not authenticated, redirects to /admin/login
  --> Admin enters password --> POST /api/admin/auth
      --> Server: rate limit check (5 attempts/15min per IP)
      --> Server: HMAC timing-safe password verification
      --> Server: sets httpOnly admin_token cookie (24h TTL)
  --> AdminDashboard loads --> GET /api/syllabus (reads syllabus_v3.json)
  --> Admin edits subjects/chapters (CRUD operations in UI state)
  --> Admin clicks "Save Changes" --> PUT /api/syllabus
      --> Server: verifies admin_token cookie
      --> Server: validates body with Zod schema (subjects + chapters)
      --> Server: atomic write (temp file + rename) to syllabus_v3.json
```

### 3. Feedback Capture

```
User submits feedback (rating 1-5, optional comment)
  --> POST /api/feedback
  --> Server: Zod validation
  --> Server: stores feedback in MySQL
  --> Response: { success: true }
```

## Security Features

- **Authentication**: HMAC-SHA256 derived session tokens with `timingSafeEqual` comparison.
- **Rate Limiting**: In-memory, 5 login attempts per 15-minute window per IP.
- **Honeypot**: Hidden field in lead form silently rejects bot submissions.
- **CSP Headers**: Strict Content-Security-Policy set in `next.config.mjs` (frame-ancestors: none, limited connect-src).
- **Security Headers**: X-Frame-Options: DENY, X-Content-Type-Options: nosniff, strict Referrer-Policy, restrictive Permissions-Policy.
- **Cookie Security**: httpOnly, secure (in production), sameSite: lax.
- **Input Validation**: Zod schemas on all API inputs.
- **Atomic Writes**: Data file updates use temp-file + rename to prevent corruption.
- **Non-root Docker**: Production container runs as `nextjs` user (UID 1001).

## Infrastructure

- **Docker**: Multi-stage build (deps, builder, runner). Alpine-based, ~150MB image. Uses `tini` as init process.
- **Docker Compose**: Single service with 512MB memory limit, named volume for data persistence.
- **Healthcheck**: `GET /api/health` polled every 30s by both Docker and Docker Compose.
- **Deployment**: Hosted on Coolify. Environment variables configured via Coolify UI.
- **Standalone Output**: Next.js `output: "standalone"` for minimal production bundle.
