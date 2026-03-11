# Changelog

All notable changes to Career Navigator are documented here.

## [Unreleased]

### Added
- User details step (name/email) before roadmap generation
- CSRF origin verification on all mutating API endpoints (admin, leads, feedback)
- Redesigned roadmap result header with dark hero section and personalized greeting
- PDF personalization with user context (background, goals, skills)
- Auto-trigger PDF download when modal opens with pre-filled data
- JSON-LD structured data for SEO
- Canonical URL metadata
- Rate limiting on `GET /api/syllabus`
- `LICENSE` file (proprietary)
- `SECURITY.md` with responsible disclosure process
- `CHANGELOG.md`
- Production readiness report

### Changed
- Lead capture moved from PDF download to roadmap generation time
- UI updated to 2-column layouts for selection steps
- Bootcamp CTA redesigned with feature badges
- `text-slate-400` upgraded to `text-slate-500` on light backgrounds for WCAG AA contrast compliance
- Console.log/error calls converted to structured JSON format for log aggregation
- Zod schema for `planInputSchema` tightened from `z.any()` to typed chapter/subject schemas
- `AUTH_SECRET` documented in `.env.example`

### Fixed
- Missing `AUTH_SECRET` environment variable documentation

## [1.2.0] - 2026-03-05

### Added
- DA/DE career path skip options for prior knowledge
- Redesigned Prior Knowledge UI
- Google Sheets API integration (replacing webhook)

### Changed
- Migrated lead/feedback capture from Google Apps Script webhook to direct Google Sheets API

## [1.1.0] - 2026-03-04

### Changed
- Repository cleanup: removed 23MB binary bloat, stale docs, unused dependencies
- README rewritten with accurate product description

## [1.0.0] - 2026-03-03

### Added
- Initial release: Career Navigator
- 7-step wizard for personalized Data & AI career roadmaps
- PDF generation with branded Codebasics design
- Admin panel for syllabus management
- Cookie-based HMAC authentication
- Rate limiting, CSP headers, HSTS
- Privacy policy and terms of service
- Sitemap and robots.txt
- E2E tests with Playwright
- Docker multi-stage build with health checks
- CI pipeline (GitHub Actions)
