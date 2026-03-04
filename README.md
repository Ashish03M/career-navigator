# Bootcamp Custom Planner

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![React PDF](https://img.shields.io/badge/React_PDF-4.3-red?style=for-the-badge)](https://react-pdf.org/)

The **Bootcamp Custom Planner** is a powerful personalization engine built for the Codebasics GenAI & Data Science Bootcamp. It "chisels" a massive syllabus into a lean, 100% personalized learning journey based on a student's unique experience, career goals, and weekly availability.

**Repository**: [https://github.com/MochithaCodeBasics/Custom-Planner](https://github.com/MochithaCodeBasics/Custom-Planner)

---

## Features

- **Syllabus Chiseling**: Automatically removes modules you already know and filters subjects based on your target career goal (ML, GenAI, or NLP).
- **Dynamic Scaling**: Adapts module durations using smart multipliers for your profile (Beginner/Pro) and availability (3h/week to Full-time).
- **Dual Learning Tracks**: Supports both **Independent (Free)** and **Guided (Bootcamp)** learning paths with separate syllabi.
- **Branded PDF Export**: Generate and download a professionally designed, branded career roadmap PDF with custom fonts and Codebasics styling.
- **Lead Capture**: Collects user details (name, email, goals) before PDF download, with Google Sheets integration via webhook and honeypot bot protection.
- **Plan Validation**: Built-in validation engine (`validatePlan.ts`) ensures generated roadmaps meet quality and consistency standards.
- **Admin Control Center**: A dedicated UI to manage the master syllabus, with changes reflected instantly in user roadmaps.
- **UI**: Built with Framer Motion and shadcn/ui for a high-end, responsive explorer experience.

---

## Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|----------|----------|-------------|
| `ADMIN_PASSWORD` | **Yes** | Password to access the admin panel at `/admin` |
| `GOOGLE_SHEETS_WEBHOOK_URL` | No | Google Apps Script webhook URL for lead/feedback capture. If not set, data capture is silently skipped. |
| `STRICT_VALIDATION` | No | Set to `"true"` to enable strict plan validation rules. Default: `false`. |

### Installation & Run

1. **Clone the repository**:
   ```bash
   git clone https://github.com/MochithaCodeBasics/Custom-Planner.git
   cd Custom-Planner
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

The app will be available at `http://localhost:3000`.

### Available Scripts

| Script | Command | Description |
|---|---|---|
| Dev server | `npm run dev` | Start the Next.js development server |
| Build | `npm run build` | Create a production build |
| Lint | `npm run lint` | Run ESLint |
| Type check | `npm run typecheck` | Run TypeScript compiler checks |
| Validate | `npm run test` | Run roadmap validation tests |
| Full verify | `npm run verify` | Run typecheck + lint + all tests |

---

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19
- **Logic Engine**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui + Radix UI
- **Animations**: Framer Motion
- **PDF Generation**: `@react-pdf/renderer` with custom branded templates
- **Validation**: Zod (API input validation) + custom plan validation engine
- **Database (Base Store)**: Local Filesystem (JSON Persistence)

---

## Project Structure

```
├── app/                        # Next.js App Router pages & API routes
│   ├── api/
│   │   ├── admin/              # Admin authentication API
│   │   ├── leads/              # Lead capture API (POST → Google Sheets)
│   │   └── syllabus/           # Syllabus CRUD API (GET/PUT)
│   ├── admin/                  # Admin panel UI
│   ├── globals.css             # Global styles & Codebasics brand tokens
│   └── page.tsx                # Main Career Navigator questionnaire
├── components/
│   ├── planner/                # Domain-specific components
│   │   ├── ExperienceStep.tsx  # Technical experience selector
│   │   ├── PdfDownloadModal.tsx # PDF download with lead capture
│   │   ├── RoadmapResult.tsx   # Generated roadmap viewer
│   │   ├── SelectionStep.tsx   # Questionnaire step wrapper
│   │   └── UserDetailsStep.tsx # Name & email collection form
│   └── ui/                     # Reusable shadcn/ui components
├── data/
│   ├── syllabus_v3.json        # Bootcamp syllabus (source of truth)
│   └── free_syllabus.json      # Free/independent learner syllabus
├── lib/
│   ├── generatePlan.ts         # Core roadmap generation engine
│   ├── validatePlan.ts         # Plan quality & consistency validation
│   ├── leads/
│   │   └── sheets.ts           # Google Sheets webhook integration
│   ├── pdf/
│   │   ├── designTokens.ts     # Brand colors, fonts & spacing for PDF
│   │   ├── generateBrandedPdf.tsx  # PDF document assembly
│   │   └── templates/
│   │       └── CareerRoadmapPdf.tsx # Branded PDF template
│   ├── auth.ts                 # Cookie-based admin authentication
│   ├── bootcampData.ts         # Bootcamp-specific configuration
│   ├── syllabusStore.ts        # JSON file persistence layer
│   └── types.ts                # Shared TypeScript types
├── public/
│   └── fonts/                  # Custom brand fonts (Kanit, Saira)
├── scripts/                    # Developer utility & test scripts
└── package.json
```

---

## API Routes

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/api/syllabus` | No | Fetch bootcamp syllabus |
| `GET` | `/api/syllabus?type=free` | No | Fetch free/independent syllabus |
| `PUT` | `/api/syllabus` | **Required** | Update syllabus (admin only) |
| `POST` | `/api/admin/auth` | No | Admin login / logout |
| `GET` | `/api/admin/check` | No | Check current auth status |
| `POST` | `/api/leads` | No | Capture lead data to Google Sheets |
| `POST` | `/api/feedback` | No | Capture user feedback to Google Sheets |

---

## Detailed Documentation

For technical deep-dives into the architecture and logic:
- **[Project Architecture & Data Flow](./PROJECT_OVERVIEW.md)**
- **[The Chiseling Math & Logic](./roadmap_generation_logic.md)**

---

© 2026 Codebasics. Built for Personalized Learning Excellence.
