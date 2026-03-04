# Contributing to Codebasics Career Navigator

Thank you for your interest in contributing. This document explains how to set up the project locally, follow our code conventions, run tests, and submit pull requests.

## Development Setup

### Prerequisites

- **Node.js** 20+ (matches the Docker base image `node:20-alpine`)
- **npm** (comes with Node.js; the project uses `package-lock.json`, not yarn or pnpm)
- **Docker** (optional, for container-based development)

### Getting Started

1. **Clone the repository**

   ```bash
   git clone <repo-url>
   cd career-navigator
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

   This also runs the `postinstall` script (`node scripts/patch-next.js`).

3. **Set up environment variables**

   Create a `.env.local` file in the project root:

   ```env
   ADMIN_PASSWORD=your-local-admin-password
   GOOGLE_SHEETS_WEBHOOK_URL=              # optional -- leave empty to skip lead capture
   ```

   - `ADMIN_PASSWORD` is required for the admin panel to function.
   - `GOOGLE_SHEETS_WEBHOOK_URL` is optional. If unset, lead/feedback capture is silently skipped.

4. **Start the dev server**

   ```bash
   npm run dev
   ```

   The app runs at `http://localhost:3000`.

5. **Access the admin panel**

   Navigate to `http://localhost:3000/admin/login` and enter your `ADMIN_PASSWORD`.

### Docker Development

```bash
docker compose up --build
```

The app is available at `http://localhost:3000`. The `data/` directory is mounted as a named volume (`syllabus_data`) so syllabus edits persist across container restarts.

## Project Structure

```
app/
  page.tsx                  # Main wizard (BootcampPlanner)
  layout.tsx                # Root layout (fonts, metadata, Providers)
  providers.tsx             # MotionConfig wrapper
  privacy/page.tsx          # Privacy policy
  terms/page.tsx            # Terms of service
  admin/
    layout.tsx              # Auth guard + admin shell
    login/page.tsx          # Login form
    page.tsx                # Syllabus Manager dashboard
  api/
    health/route.ts         # Health check
    syllabus/route.ts       # GET/PUT syllabus data
    leads/route.ts          # POST lead capture
    feedback/route.ts       # POST feedback capture
    admin/auth/route.ts     # POST login/logout
    admin/check/route.ts    # GET auth status
components/
  planner/                  # Wizard step components, roadmap result, PDF modal
  ui/                       # Radix-based UI primitives (shadcn/ui style)
lib/
  generatePlan.ts           # Core roadmap engine
  auth.ts                   # Cookie-based HMAC auth
  rateLimit.ts              # In-memory rate limiter
  syllabusStore.ts          # Atomic JSON file read/write
  leads/sheets.ts           # Google Sheets webhook integration
  types.ts                  # Core TypeScript types
  syllabusTypes.ts          # Syllabus data types
  pdf/                      # PDF generation (react-pdf)
  schemas/                  # Zod validation schemas
data/
  syllabus_v3.json          # Bootcamp syllabus (editable via admin)
  free_syllabus.json        # Free-tier syllabus (read-only)
e2e/
  smoke.spec.ts             # Playwright smoke tests
scripts/
  validate-roadmap.ts       # Roadmap validation
  verify-all.ts             # Full verification suite
  test-matrix-hardened.ts   # Matrix test (all input combinations)
  validate-schema.ts        # Schema validation
  test-pdf-hardened.ts      # PDF generation tests
```

## Code Conventions

### TypeScript

- Strict TypeScript (`tsconfig.json`). All new code must pass `npx tsc --noEmit`.
- Use explicit types for function parameters and return values in library code (`lib/`).
- Prefer `type` over `interface` for data shapes. Use `interface` only when extension is needed.

### React

- Pages under `app/` are **server components** by default. Add `"use client"` only when hooks or browser APIs are needed.
- State management: local `useState` only -- no global state library.
- Use Radix UI primitives from `components/ui/` for all interactive elements (buttons, dialogs, selects, etc.).

### Styling

- **Tailwind CSS** exclusively. No CSS modules or styled-components.
- Use the `cn()` utility from `lib/utils.ts` to merge conditional class names.
- Follow the existing color palette (`slate`, `blue`, `emerald`, `indigo`).

### API Routes

- All API routes use the Next.js App Router convention (`app/api/.../route.ts`).
- Validate all inputs with **Zod** schemas.
- Return `Response.json()` (not `NextResponse`).
- Use structured logging via `lib/logger.ts`.

### File Naming

- React components: `PascalCase.tsx`
- Library modules: `camelCase.ts`
- API routes: `route.ts` inside the directory structure

### Imports

- Use `@/` path aliases (mapped to the project root in `tsconfig.json`).
- Group imports: React/Next.js first, then external packages, then internal modules.

## Testing

### Available Test Commands

| Command              | Description                                                     |
| -------------------- | --------------------------------------------------------------- |
| `npm test`           | Validate roadmap generation logic (`scripts/validate-roadmap.ts`) |
| `npm run test:verify`| Full verification suite (`scripts/verify-all.ts`)               |
| `npm run test:matrix`| Matrix test -- all input combinations (`scripts/test-matrix-hardened.ts`) |
| `npm run test:schema`| Schema validation (`scripts/validate-schema.ts`)                |
| `npm run test:pdf`   | PDF generation tests (`scripts/test-pdf-hardened.ts`)           |
| `npm run test:e2e`   | Playwright end-to-end tests (requires dev server)               |
| `npm run typecheck`  | TypeScript type checking (`tsc --noEmit`)                       |
| `npm run lint`       | ESLint                                                          |
| `npm run verify`     | Runs typecheck + lint + test + test:verify                      |
| `npm run verify:all` | Runs everything: typecheck + lint + test + test:verify + test:matrix + test:schema + test:pdf |

### Running Tests

Before submitting a PR, run the full verification suite:

```bash
npm run verify
```

For a comprehensive check including matrix and PDF tests:

```bash
npm run verify:all
```

### End-to-End Tests

E2E tests use Playwright with Chromium. The test suite automatically starts a dev server on port 3001:

```bash
npm run test:e2e
```

To run with a visible browser:

```bash
npx playwright test --headed
```

## Pull Request Guidelines

1. **Branch from `main`**. Use descriptive branch names:
   - `feat/add-dark-mode`
   - `fix/pdf-font-loading`
   - `refactor/simplify-skip-logic`

2. **Keep PRs focused**. One feature or fix per PR.

3. **Run the full verification** before pushing:

   ```bash
   npm run verify
   ```

4. **Write a clear PR description**:
   - What does this change?
   - Why is it needed?
   - How was it tested?

5. **Do not commit secrets**. Never commit `.env.local`, credentials, or API keys. The `.gitignore` should cover these, but double-check.

6. **Do not modify `data/syllabus_v3.json` or `data/free_syllabus.json` directly in PRs** unless the change is specifically about syllabus content. These files are managed via the admin panel in production.

7. **Ensure no TypeScript errors** (`npm run typecheck`), no lint warnings (`npm run lint`), and all tests pass before requesting review.

## Environment Variables Reference

| Variable                      | Required | Description                                          |
| ----------------------------- | -------- | ---------------------------------------------------- |
| `ADMIN_PASSWORD`              | Yes      | Admin panel password and HMAC key for session tokens |
| `AUTH_SECRET`                 | No       | Optional separate HMAC key (falls back to ADMIN_PASSWORD) |
| `GOOGLE_SHEETS_WEBHOOK_URL`  | No       | Google Apps Script webhook URL for lead/feedback data |
