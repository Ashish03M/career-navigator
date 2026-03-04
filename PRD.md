# Project Requirement Document (PRD): GenAI & Data Science Personalized Learning Planner

## 1. Business Context & Vision
The goal is to create a high-end, interactive web application that acts as a personalized career and learning counselor for a GenAI & Data Science Bootcamp. Instead of a static syllabus, users experience a dynamic, 12-step consultation that tailors the vast curriculum to their specific background, goals, and availability. The output is a realistic, module-by-module learning roadmap with timelines and resource recommendations.

## 2. Success Metrics (KPIs)
*   **Completion Rate:** >90% of users starting the questionnaire should generate a plan.
*   **Engagement:** Users interact with the generated timeline (e.g., checking off items, exploring details).
*   **Perceived Value:** Users download or save their personalized plan.

## 3. User Experience (UX) Principles
*   **"Wow" Factor:** The UI must feel premium, modern, and "agentic" (glassmorphism, smooth transitions, typewriter effects).
*   **Progressive Disclosure:** Don't overwhelm the user. Show one question at a time with fluid animations.
*   **Instant Gratification:** The tailored plan should be generated immediately after the final step.

## 4. Functional Requirements

### Phase 1: MVP
*   **Interactive Questionnaire:**
    *   12-step linear flow.
    *   Input types: Single select, Multi-select, Sliders (for time commitment).
    *   Progress bar and "Back" functionality.
*   **Roadmap Generator Engine:**
    *   Logic to map user inputs (e.g., "Beginner" + "20hrs/week") to specific modules and durations.
    *   Filtering of optional modules based on goals.
*   **Dashboard/Result View:**
    *   Timeline view of the curriculum (Weeks/Months).
    *   Module cards with details (Description, Project, Resources).
    *   "Export to PDF" (basic print view).

### Phase 2 (Future)
*   User Authentication to save progress.
*   Integration with calendar apps.
*   Actual progress tracking (mark as done).

## 5. Technical Architecture

### Tech Stack
*   **Framework:** Next.js 16 (App Router) - for SSR/SSG and modern React features.
*   **Language:** TypeScript - for type safety and maintainability.
*   **Styling:** Tailwind CSS - for rapid, custom design.
*   **Components:** Shadcn/UI (Radix Primitives) - for accessible, high-quality component base.
*   **Icons:** Lucide React.
*   **State Management:** React Context or Zustand (simple enough for MVP).
*   **Animation:** Framer Motion - critical for the "premium" feel.

### Data Flow
1.  **User Input:** Client-side form state collection.
2.  **Processing:** Client-side (or lightweight API) mapping logic against the `Roadmap Data`.
3.  **Visualization:** Rendering the filtered list of modules.

### Component Structure
*   `app/page.tsx`: Landing page + Start button.
*   `components/planner/Questionnaire.tsx`: Main wizard container.
*   `components/planner/StepCard.tsx`: Reusable question step UI.
*   `components/roadmap/Timeline.tsx`: The result view.
*   `lib/roadmapData.ts`: The static (or fetched) definition of all bootcamp modules (The "Brain").

## 6. Implementation Plan & Timeline

### Step 1: Foundation (Day 1)
*   Initialize Next.js project.
*   Setup Tailwind + Shadcn/UI.
*   Define global design tokens (colors, fonts).

### Step 2: Core Components (Day 1-2)
*   Build the reusable `QuestionCard` component with animations.
*   Implement the `ProgressBar`.
*   Draft the `roadmapData` JSON structure (Schema).

### Step 3: Logic & Flow (Day 2-3)
*   Implement the 12-step state machine.
*   Write the `generatePlan(inputs)` logic.

### Step 4: Polish (Day 3)
*   Add Framer Motion transitions.
*   Finalize styling (Glassmorphism, gradients).
*   Responsiveness check.

---
**NOTE:** The specific "Roadmap" content (Modules, Titles, Durations) is currently relying on the provided DOCX. As I cannot currently read the file due to environment limitations, I will use placeholder data structure that can be easily populated once the content is text-accessible.
