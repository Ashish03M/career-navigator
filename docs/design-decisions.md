# Design Decisions

This document captures key UI/UX and product decisions for stakeholder reference.

---

## 1. Module Card Styling

**Decision**: All module cards use a uniform white background with gray border (March 2026).

Previously, each module had a unique color based on its topic area (e.g., blue for Python, yellow for ML, pink for NLP). This was removed because:

- The color coding had no legend or explanation in the UI, so users had no way to understand what colors meant
- With 18+ distinct colors, the visual noise outweighed any grouping benefit
- Users reported confusion about whether colors indicated difficulty, importance, or status

All modules now render as `bg-white border-gray-200`. The syllabus JSON files still contain per-subject `color` fields (for potential future use), but `generatePlan.ts` overrides them to white at phase construction time.

Note: Chapter-type icons (project, internship, lecture) inside cards still use distinct styling to differentiate content types.

---

## 2. Career Outcome Options (Consolidated)

**Decision**: Reduced from 6 options to 4 (March 2026).

### Previous Options (6)
1. Full-Time Employment (`job-search`)
2. Career Transition (`career-transition`)
3. Freelancing / Consulting (`freelance`)
4. Entrepreneurship (`startup`)
5. Skill Enhancement (`upskill`)
6. Academic / Research (`academic`)

### Current Options (4)
1. **Get a Job** (`job-search`) -- merged Full-Time Employment + Career Transition
2. **Build Something** (`build`) -- merged Freelancing + Entrepreneurship
3. **Skill Enhancement** (`upskill`) -- unchanged
4. **Academic / Research** (`academic`) -- unchanged

### Why We Consolidated

- The roadmap engine differentiates career outcomes by adjusting **module durations** (not which modules are included). The actual numeric effect was minimal -- automated tests confirmed all 6 outcomes produced nearly identical total week counts.
- "Career Transition" and "Full-Time Employment" had overlapping descriptions and nearly identical engine behavior (both boost career-prep modules).
- "Freelancing" and "Entrepreneurship" both emphasized project-building and independent work with minimal differentiation.
- Reducing to 4 options lowers decision fatigue while preserving the meaningful distinctions: job-focused vs. build-focused vs. learning-only vs. academic.

### How Career Outcome Affects the Roadmap

| Outcome | Engine Effect |
|---|---|
| Get a Job | +50% career/branding module, +30% unguided projects, +20% internship duration |
| Build Something | +20% GenAI projects, +30% unguided projects, +30% DevOps, +30% Cloud |
| Skill Enhancement | -50% career/branding module, -50% unguided projects (no job-switch prep needed) |
| Academic / Research | +30% math, +20% deep learning, -50% career module |

---

## 3. Wizard Step Options Summary

For reference, here are all wizard steps and their current options:

### Step 1: Current Background (single-select)
- Student / Beginner
- Software Developer
- Data / Business Analyst
- Working Professional
- Career Break / Returning

### Step 2: Prior Knowledge (multi-select, grouped by category)
- **Foundations**: Python, SQL, Math & Stats
- **AI & ML**: ML Basics, Deep Learning, NLP, GenAI
- **Tools**: MLOps & Cloud, Excel & BI Tools
- **Data Engineering**: DE Basics, Big Data & Cloud

### Step 3: Target Goal (single-select)
- Data Analyst, Data Engineer, Data Scientist, AI Engineer, ML Engineer, GenAI Engineer, NLP Engineer

### Step 4: Career Outcome (single-select)
- Get a Job, Build Something, Skill Enhancement, Academic / Research

### Step 5: Weekly Availability (single-select)
- 5 hours or less, 5-10 hours, 10-20 hours, 20+ hours

### Step 6: Learning Style (single-select)
- Practical-first, Theory-first, Balanced

### Step 7: Application Focus (multi-select)
- Build My Own Project, Structured Guided Projects, Contribute to Open Source, Job Preparation

Note: Application Focus (Step 7) currently has **no effect** on roadmap generation. It is collected for future use and analytics.
