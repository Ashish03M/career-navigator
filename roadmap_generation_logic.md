# Roadmap Generation Logic (Syllabus Chiseling)

The roadmap generation logic, implemented in `lib/generatePlan.ts`, is the core "chiseling" engine. It transforms the comprehensive master syllabus into a lean, personalized learning journey.

## 🧱 The Foundation: Base Durations

Before any math happens, the engine fetches the **Base Duration** for every chapter from [syllabus_v3.json](file:///c:/Users/User/bootcamp_custom_planner/bootcamp-planner/data/syllabus_v3.json). 

**The principle is the same for every module:** The engine sums up the `durationWeeks` of all chapters within a subject to get the starting "Base Duration" for that module.

### Base Duration Examples (From JSON):
- **SQL Basics**: `1.0 + 1.0 + 0.2` = **2.2 weeks**
- **Math & Stats**: `0.5 + 1.0 + 0.5 + 0.8 + 0.5 + 1.2 + 0.5 + 1.0 + 0.8 + 0.5 + 0.2` = **7.5 weeks**
- **Machine Learning**: `0.3 + 1.5 + 1.5 + 0.8 + 0.5 + 0.5 + 1.0 + 1.5 + 1.5 + 1.5 + 0.4` = **11.0 weeks**

## 🏃 The 6-Step Generation Flow

### 1. Internship Selection
The engine picks the most relevant internship based on the user's specialization goal:
- **`genai-specialist` or `nlp-engineer`**: Assigns the **RAG Internship**.
- **`ml-engineer` or `cv-specialist`**: Assigns the **Computer Vision Internship**.
- **Generalists**: Keep both for a comprehensive experience.

### 2. Goal-Based Filtering
Irrelevant modules are stripped away to keep the roadmap efficient:
- **ML Engineer**: Skips deep NLP modules.
- **NLP Engineer**: Skips Computer Vision (CNN) modules.
- **Advanced SQL**: Marked as optional (0 weeks) for specialized AI roles.

### 3. Experience-Based Skipping (The "Chisel")
If a user marks existing technical proficiency, the engine removes the foundational counterparts:
- **Python Exp**: Skips `PYTHON_BASICS_IDS`.
- **SQL Exp**: Skips `SQL_BASICS_IDS`.
- **Stats Exp**: Skips `MATH_STATS_IDS`.
- **AI Exp**: Skips corresponding Core ML, DL, or GenAI modules.

### 4. Category-Based Scaling (The Multipliers)
- **Profile Multipliers**: Applied to **all** subjects to account for technical literacy:
    - Beginner: `1.5x` (Added 50% buffer for complex concepts)
    - Intermediate: `0.9x`
    - Professional: `0.8x`
- **`career` Category**: `Base Duration * 1.5x` (if motivation is "First Job").
- **Role-Specific**: `Base Duration * 0.5x` (Software Devs on Python basics).

### 5. Availability Scaling
The "Final Duration" per chapter is calculated as:
`Adjusted Duration * availabilityFactor`

**Availability Factors:**
- **3-5 hrs/week**: `4.0x`
- **5-10 hrs/week**: `2.5x`
- **10-20 hrs/week**: `1.0x` (Baseline)
- **20-30 hrs/week**: `0.6x`
- **30-40 hrs/week**: `0.45x`
- **Full-time (40+ hrs/week)**: `0.4x`

### 6. Timeline Totals
- **Total Weeks**: `Sum of all Final Durations`
- **Total Months**: `Ceil(Total Weeks / 4.3)` 
    > [!NOTE]
    > **4.3** is the average number of weeks in a month (365 days ÷ 7 ÷ 12). Using this instead of `4.0` prevents underestimating the total duration.
- **Avg Hours/Week**: Static mapping from availability selection (e.g., "10-20 hrs" → `15 hrs`).

### 7. Phase Construction
Finally, the chiseled chapters are grouped back into **Phases** (Modules) based on their `subjectId`, ensuring the original pedagogical order is preserved.

---

## Example Scenarios

### Scenario : The Career Changer (Absolute Beginner)
- **Profile**: Beginner (`profileMultiplier: 1.5`)
- **Motivation**: First Job (`careerMultiplier: 1.5`)
- **Availability**: 5-10 hrs/week (`availabilityFactor: 2.5`)
- **Experience**: None

| Module | Base Weeks | Calculation | Final Weeks |
| :--- | :--- | :--- | :--- |
| Python (Foundation) | 2.0 | `2.0 * 1.5 (Profile) * 2.5 (Avail)` | **7.5** |
| GenAI (Core) | 3.0 | `3.0 * 1.5 (Profile) * 2.5 (Avail)` | **11.3** |
| Career Prep (Career) | 1.0 | `1.0 * 1.5 (Motiv) * 1.5 (Profile) * 2.5 (Avail)` | **5.6** |
| **Total** | **6.0** | | **24.4 Weeks** |

