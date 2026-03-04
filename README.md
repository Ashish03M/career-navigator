# Career Navigator

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![React PDF](https://img.shields.io/badge/React_PDF-4.3-red?style=for-the-badge)](https://react-pdf.org/)
[![CI](https://github.com/Ashish03M/career-navigator/actions/workflows/ci.yml/badge.svg)](https://github.com/Ashish03M/career-navigator/actions)
[![License: Proprietary](https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge)](LICENSE)

A free **Data & AI career roadmap generator** by [Codebasics](https://codebasics.io/). Users answer 6 questions about their background, prior knowledge, career goal, desired outcome, weekly availability, and learning style — and receive a personalized, week-by-week learning plan they can download as a branded PDF.

Covers 7 career paths: Data Analyst, Data Engineer, Data Scientist, AI Engineer, ML Engineer, GenAI Engineer, and NLP Engineer.

---

## Table of Contents

- [Key Features](#key-features)
- [Supported Career Paths](#supported-career-paths)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Usage](#usage)
- [Available Scripts](#available-scripts)
- [API Endpoints](#api-endpoints)
- [Testing](#testing)
- [Deployment](#deployment)
- [Configuration](#configuration)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

---

## Key Features

| Feature | Description |
|---------|-------------|
| **Personalized Roadmap Generation** | A 6-question flow captures the user's background, skills, career goal, availability, and learning style — then generates a tailored week-by-week plan covering only what they need. |
| **Smart Skip Logic** | If a user already knows Python, SQL, or other topics, those modules are automatically removed — saving weeks of study time. |
| **Goal-Based Filtering** | The curriculum is filtered to include only subjects relevant to the selected career path (e.g., a Data Analyst path skips Deep Learning and NLP). |
| **Dynamic Duration Scaling** | Module durations adjust based on experience level and weekly hours available — someone with 5 h/week gets a longer but lighter timeline than someone studying 20+ h/week. |
| **Branded PDF Export** | Users enter their name and email, then download a professionally designed PDF with custom fonts (Kanit, Saira) and Codebasics branding. Built client-side with `@react-pdf/renderer`. |
| **Lead Capture** | Name and email are optionally sent to Google Sheets via webhook before PDF download. A honeypot field provides bot protection. |
| **Feedback System** | After viewing their roadmap, users can rate the experience (1-5 stars) and leave a comment — captured to Google Sheets. |
| **Admin Control Center** | A password-protected panel for managing the master syllabus (subjects, chapters, topics, resources). Changes are reflected instantly in new roadmaps. |
| **Security Hardening** | HMAC-SHA256 auth cookies, HSTS, CSP headers, in-memory rate limiting, Zod input validation, and Edge middleware for admin route protection. |

---

## Supported Career Paths

The roadmap engine supports 7 career tracks, each with its own curated curriculum:

| Career Path | Focus Areas |
|-------------|-------------|
| **Data Analyst** | Excel, Power BI, SQL, domain knowledge, stakeholder communication |
| **Data Engineer** | Python, SQL, cloud ETL, Spark, Databricks, streaming analytics |
| **Data Scientist** | Statistics, ML, deep learning, model evaluation |
| **AI Engineer** | Full-stack AI — ML, DL, GenAI, and cloud deployment |
| **ML Engineer** | ML fundamentals, deep learning, MLOps, production deployment |
| **GenAI Engineer** | LLMs, RAG, LangChain, agentic AI, fine-tuning |
| **NLP Engineer** | Text processing, embeddings, transformers, Hugging Face |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router) |
| **Language** | [TypeScript 5.9](https://www.typescriptlang.org/) |
| **UI Library** | [React 19](https://react.dev/) |
| **Styling** | [Tailwind CSS 3.4](https://tailwindcss.com/) |
| **Components** | [shadcn/ui](https://ui.shadcn.com/) + [Radix UI](https://www.radix-ui.com/) |
| **Animations** | [Framer Motion 12](https://www.framer.com/motion/) |
| **PDF Generation** | [@react-pdf/renderer 4.3](https://react-pdf.org/) |
| **Validation** | [Zod 4](https://zod.dev/) (runtime schema validation) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Data Storage** | Local filesystem — JSON file persistence (no database required) |
| **CI/CD** | GitHub Actions |
| **Containerization** | Docker (multi-stage build, Alpine, non-root) |

---

## Project Structure

```
career-navigator/
├── app/                            # Next.js App Router
│   ├── api/
│   │   ├── admin/                  # Auth endpoints (login, logout, status check)
│   │   ├── feedback/               # Feedback capture → Google Sheets
│   │   ├── health/                 # Health check (includes data file verification)
│   │   ├── leads/                  # Lead capture → Google Sheets
│   │   └── syllabus/               # Syllabus CRUD (GET / PUT)
│   ├── admin/
│   │   ├── layout.tsx              # Admin layout wrapper
│   │   ├── login/page.tsx          # Admin login page
│   │   └── page.tsx                # Admin syllabus editor
│   ├── privacy/page.tsx            # Privacy policy
│   ├── terms/page.tsx              # Terms of service
│   ├── error.tsx                   # Page-level error boundary
│   ├── global-error.tsx            # Root-level error boundary
│   ├── layout.tsx                  # Root layout with metadata & fonts
│   ├── loading.tsx                 # Global loading UI
│   ├── not-found.tsx               # Custom 404 page
│   ├── page.tsx                    # Main 6-question roadmap flow
│   ├── providers.tsx               # Client-side providers wrapper
│   ├── robots.ts                   # SEO robots.txt generation
│   └── sitemap.ts                  # SEO sitemap generation
│
├── components/
│   ├── planner/                    # Domain-specific components
│   │   ├── ExperienceStep.tsx      # Prior knowledge multi-select (Step 2)
│   │   ├── PdfDownloadModal.tsx    # PDF generation modal with lead capture
│   │   ├── PdfErrorBoundary.tsx    # Error boundary wrapping PDF generation
│   │   ├── ProgressBar.tsx         # Step progress indicator
│   │   ├── RoadmapResult.tsx       # Generated roadmap viewer + feedback widget
│   │   ├── SelectionStep.tsx       # Single-select question step wrapper
│   │   └── UserDetailsStep.tsx     # Name & email collection form
│   └── ui/                         # Reusable shadcn/ui primitives (button, dialog, input, etc.)
│
├── data/
│   ├── free_syllabus.json          # Free learner syllabus (used by the public app)
│   └── syllabus_v3.json            # Bootcamp syllabus (admin-managed)
│
├── lib/
│   ├── pdf/
│   │   ├── designTokens.ts         # Brand colors, fonts, spacing for PDF
│   │   ├── generateBrandedPdf.tsx  # PDF document assembly & blob export
│   │   └── templates/
│   │       └── CareerRoadmapPdf.tsx # Branded PDF React component
│   ├── leads/
│   │   └── sheets.ts               # Google Sheets webhook integration
│   ├── schemas/
│   │   └── planInputSchema.ts      # Zod schema for plan input validation
│   ├── auth.ts                     # HMAC-SHA256 cookie-based admin auth
│   ├── bootcampData.ts             # Chapter type definition & bootcamp roadmap data
│   ├── generatePlan.ts             # Core roadmap engine (skip logic, scaling, filtering)
│   ├── logger.ts                   # Structured JSON logger
│   ├── normalizeTitle.ts           # Title string normalization utility
│   ├── rateLimit.ts                # In-memory rate limiter (configurable)
│   ├── stepOptions.tsx             # All 6 question step options (backgrounds, goals, etc.)
│   ├── syllabusStore.ts            # Atomic JSON read/write with backup-on-write
│   ├── syllabusTypes.ts            # Syllabus TypeScript type definitions
│   ├── types.ts                    # Shared application types (PlanResult, PlanInput, etc.)
│   ├── utils.ts                    # General utility functions (cn, formatWeeks, etc.)
│   └── validatePlan.ts             # Plan quality & consistency validation
│
├── middleware.ts                    # Edge middleware (admin route protection)
├── public/
│   └── fonts/                      # Custom brand fonts (Kanit, Saira)
├── .github/workflows/ci.yml        # GitHub Actions CI pipeline
├── Dockerfile                       # Multi-stage production Docker build
├── .env.example                     # Environment variable template
├── next.config.mjs                  # Next.js config (CSP, HSTS, standalone output)
├── tailwind.config.ts               # Tailwind CSS configuration
├── tsconfig.json                    # TypeScript configuration
└── package.json
```

---

## Getting Started

### Prerequisites

- **Node.js** 18.x or higher — [Download here](https://nodejs.org/)
- **npm** (comes bundled with Node.js)
- **Git** — [Download here](https://git-scm.com/)

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Ashish03M/career-navigator.git
   cd career-navigator
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up environment variables:**

   ```bash
   cp .env.example .env.local
   ```

   Open `.env.local` and configure any variables you need. See [Environment Variables](#environment-variables) for details. The app works out of the box without any env vars — they're only needed for the admin panel and lead capture.

4. **Start the development server:**

   ```bash
   npm run dev
   ```

5. **Open the app:** Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## Environment Variables

Create a `.env.local` file in the project root (use `.env.example` as a template).

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ADMIN_PASSWORD` | No | — | Password to access the admin panel at `/admin`. Only needed if you use the admin panel. The public app works without it. |
| `GOOGLE_SHEETS_WEBHOOK_URL` | No | — | Google Apps Script webhook URL for capturing leads and feedback. If not set, data capture is silently skipped and the app still works normally. |
| `STRICT_VALIDATION` | No | `false` | Set to `"true"` to enable stricter plan validation rules during roadmap generation. |

> **Note:** Never commit `.env.local` to version control. It is already listed in `.gitignore`.

---

## Usage

### How the Roadmap Flow Works

Users go through a 6-step questionnaire:

| Step | Question | Type |
|------|----------|------|
| 1 | **Current Background** — What best describes you right now? (Complete Beginner, Student, Software Developer, Data Analyst, Tech Professional, Non-Tech Professional, Career Break) | Single select |
| 2 | **Prior Knowledge** — Which topics do you already know? (Python, SQL, Statistics, ML, DL, NLP, GenAI, MLOps) | Multi-select |
| 3 | **Target Goal** — Which career do you want to pursue? (Data Analyst, Data Engineer, Data Scientist, AI Engineer, ML Engineer, GenAI Engineer, NLP Engineer) | Single select |
| 4 | **Career Outcome** — What's your immediate goal? (Full-time job, career transition, freelancing, startup, upskilling, academic) | Single select |
| 5 | **Weekly Availability** — How many hours per week can you study? (5h or less, 5-10h, 10-20h, 20+h) | Single select |
| 6 | **Learning Style** — Practical-first, theory-first, or balanced? | Single select |

After the last step, the engine generates a personalized roadmap. The user can:
- View the full week-by-week plan with topics and resources
- Download a branded PDF (requires name and email)
- Rate the experience and leave feedback

### Admin Panel

1. Navigate to `/admin` and log in with the `ADMIN_PASSWORD`.
2. Edit subjects, chapters, topics, and resources in the syllabus editor.
3. Click **Save** — changes are written to the JSON data files and reflected in new roadmaps.

---

## Available Scripts

| Script | Command | Description |
|--------|---------|-------------|
| **Dev server** | `npm run dev` | Start the Next.js development server on port 3000 |
| **Build** | `npm run build` | Create an optimized production build |
| **Start** | `npm run start` | Serve the production build locally |
| **Lint** | `npm run lint` | Run ESLint to check for code issues |
| **Type check** | `npm run typecheck` | Run the TypeScript compiler in check-only mode |
| **Test** | `npm run test` | Run roadmap validation tests |
| **Verify** | `npm run verify` | Run typecheck + lint + all tests (used in CI) |
| **Full verify** | `npm run verify:all` | Run all checks including matrix, schema, and PDF tests |

---

## API Endpoints

All API routes live under `/api/`. Authentication is required only for write operations on the syllabus.

| Method | Endpoint | Auth | Rate Limit | Description |
|--------|----------|------|------------|-------------|
| `GET` | `/api/syllabus` | No | — | Fetch the bootcamp syllabus |
| `GET` | `/api/syllabus?type=free` | No | — | Fetch the free learner syllabus (used by the public app) |
| `PUT` | `/api/syllabus` | **Yes** | — | Update the syllabus (admin only). Body is validated with Zod. |
| `POST` | `/api/admin/auth` | No | 5 req/15 min | Admin login (`{ password }`) or logout (`{ action: "logout" }`) |
| `GET` | `/api/admin/check` | No | — | Check current admin authentication status |
| `POST` | `/api/leads` | No | 10 req/15 min | Capture lead data (name, email, goal) to Google Sheets |
| `POST` | `/api/feedback` | No | 10 req/15 min | Capture star rating and feedback comment to Google Sheets |
| `GET` | `/api/health` | No | — | Health check — returns `{ status: "ok" }` or `503` if degraded |

### Example: Fetch the Free Syllabus

```bash
curl http://localhost:3000/api/syllabus?type=free
```

### Example: Admin Login

```bash
curl -X POST http://localhost:3000/api/admin/auth \
  -H "Content-Type: application/json" \
  -d '{"password": "your-admin-password"}'
```

---

## Testing

The project includes multiple levels of automated testing:

```bash
# Run core roadmap validation tests
npm run test

# Run the full verification suite (typecheck + lint + tests)
npm run verify

# Run everything including matrix, schema, and PDF tests
npm run verify:all
```

### What the Tests Cover

- **Roadmap validation** (`npm run test`) — Generates plans for various user profiles and validates that each roadmap meets quality and consistency rules.
- **Verification suite** (`npm run test:verify`) — Runs multiple user profiles through the generation engine and checks output structure.
- **Matrix tests** (`npm run test:matrix`) — Tests all combinations of career goals, experience levels, and availability settings.
- **Schema tests** (`npm run test:schema`) — Validates that `syllabus_v3.json` and `free_syllabus.json` conform to the expected data schema.
- **PDF tests** (`npm run test:pdf`) — Generates sample PDFs and validates they are non-empty and well-formed.

### CI Pipeline

Every push and pull request runs the full CI pipeline via GitHub Actions:

1. Install dependencies (`npm ci`)
2. TypeScript type checking
3. ESLint
4. Roadmap validation tests
5. Verification suite
6. Production build

---

## Deployment

### Docker (Recommended)

The project includes a production-ready, multi-stage Dockerfile:

```bash
# Build the image
docker build -t career-navigator .

# Run the container
docker run -p 3000:3000 \
  -e ADMIN_PASSWORD=your-strong-password \
  -e GOOGLE_SHEETS_WEBHOOK_URL=https://script.google.com/... \
  career-navigator
```

**Docker features:**
- Multi-stage build (deps → build → runtime) for minimal image size
- Runs as non-root user (`nextjs:nodejs`)
- Uses [tini](https://github.com/krallin/tini) as PID 1 for proper signal handling
- Built-in health check hitting `/api/health` every 30 seconds
- Next.js standalone output mode for minimal runtime footprint

### Vercel

Deploy directly to Vercel with zero configuration:

1. Push your code to GitHub.
2. Import the repository on [vercel.com](https://vercel.com).
3. Set the environment variables (`ADMIN_PASSWORD`, etc.) in the Vercel dashboard.
4. Deploy.

> **Note:** When deploying to Vercel, the JSON data files (`data/*.json`) are read-only at runtime. Admin edits to the syllabus will not persist across redeployments.

### Manual / VPS

```bash
npm run build
npm run start
```

The production server runs on port 3000 by default. Use a reverse proxy (Nginx, Caddy) to add TLS.

---

## Configuration

### Security Headers

All security headers are configured in `next.config.mjs`:

- **HSTS** — `max-age=63072000; includeSubDomains; preload`
- **CSP** — Restricts scripts, styles, fonts, images, and connections to trusted origins
- **X-Frame-Options** — `DENY` (prevents clickjacking)
- **X-Content-Type-Options** — `nosniff`
- **Referrer-Policy** — `strict-origin-when-cross-origin`
- **Permissions-Policy** — Disables camera, microphone, and geolocation

### Rate Limiting

In-memory rate limiting is applied to sensitive endpoints:
- **Admin auth:** 5 requests per 15 minutes per IP
- **Leads / Feedback:** 10 requests per 15 minutes per IP

Per-endpoint limits are configurable where `checkRateLimit()` is called in each route handler.

### Syllabus Data

The curriculum is stored as JSON files in the `data/` directory:
- `data/free_syllabus.json` — Free learner syllabus (used by the public-facing app)
- `data/syllabus_v3.json` — Bootcamp syllabus (admin-managed)

On every admin save, a backup is automatically created (e.g., `data/syllabus_v3.backup.json`).

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| `npm install` fails | Make sure you are running Node.js 18 or higher. Run `node -v` to check. |
| Port 3000 already in use | Stop the other process or run `npm run dev -- -p 3001` to use a different port. |
| Admin login not working | Verify `ADMIN_PASSWORD` is set in `.env.local`. Restart the dev server after changing env vars. |
| PDF download fails | Check the browser console for errors. The PDF generator loads ~100 KB of code on first download — slow connections may hit the 30-second timeout. |
| Lead capture not working | This is expected if `GOOGLE_SHEETS_WEBHOOK_URL` is not set. The app works without it. |
| `npm run lint` prompts for config | Ensure `.eslintrc.json` exists with `{ "extends": "next/core-web-vitals" }`. |
| Health check returns 503 | The data file `data/syllabus_v3.json` is missing or unreadable. Ensure it exists and has correct permissions. |
| TypeScript errors after pulling | Run `npm install` to ensure dependencies match `package-lock.json`. |

---

## Contributing

Contributions are welcome! Here's how to get started:

1. **Fork** the repository.
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** and ensure all checks pass:
   ```bash
   npm run verify
   ```
4. **Commit** your changes with a clear, descriptive message.
5. **Push** your branch and open a **Pull Request**.

### Guidelines

- Follow the existing code style (TypeScript strict mode, Tailwind CSS classes, shadcn/ui patterns).
- Add tests for new roadmap generation logic.
- Do not commit `.env.local` or any files containing secrets.
- Keep PRs focused — one feature or fix per PR.

---

## License

This project is proprietary software owned by [Codebasics](https://codebasics.io/). All rights reserved. See [LICENSE](LICENSE) for details.

---

## Acknowledgements

- Built by the Career Navigator team at [Codebasics](https://codebasics.io/)
- UI components from [shadcn/ui](https://ui.shadcn.com/) and [Radix UI](https://www.radix-ui.com/)
- PDF generation powered by [@react-pdf/renderer](https://react-pdf.org/)
- Icons by [Lucide](https://lucide.dev/)

---

## Detailed Documentation

For technical deep-dives into the architecture and internal logic:

- [Project Architecture & Data Flow](./PROJECT_OVERVIEW.md)
- [The Roadmap Generation Math & Logic](./roadmap_generation_logic.md)
