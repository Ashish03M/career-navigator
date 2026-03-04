import { Chapter } from "./bootcampData";
import { ExperienceState, PlanResult, Phase, PlanInput } from "./types";
import type { Subject } from "./syllabusTypes";
import { normalizeTitle } from "./normalizeTitle";

/**
 * Canonical mapping: ExperienceState key → syllabus tag category.
 * This is the SINGLE source of truth for which experience checkbox
 * maps to which syllabus subject category for skip logic.
 */
const EXPERIENCE_TO_CATEGORY: Record<string, string> = {
    python: 'python',
    sql: 'sql',
    statistics: 'statistics',
    ml: 'ml',
    dl: 'dl',
    nlp: 'nlp',
    genai: 'genai',
    mlops: 'mlops',
    excel_bi: 'analytics',
    data_engineering: 'data-engineering',
    big_data: 'big-data',
};

/**
 * Goal → subject IDs that are CORE (always included) for that goal.
 * Subjects NOT in this list for the selected goal get marked optional
 * and excluded if they're in the 'specialization' category.
 * Foundation + career subjects are always kept regardless of goal.
 */
const GOAL_CORE_SUBJECTS: Record<string, Set<string>> = {
    // Legacy ID preserved for any saved references
    'fullstack-ds': new Set(['sub-python', 'sub-sql', 'sub-math', 'sub-ml', 'sub-dl', 'sub-nlp', 'sub-genai', 'sub-sql-adv', 'sub-virtual-internship',
        'free-python', 'free-dsa', 'free-adv-python', 'free-data-libs', 'free-math', 'free-ml', 'free-ml-projects', 'free-dl', 'free-nlp', 'free-cv', 'free-genai', 'free-genai-projects', 'free-devops', 'free-cloud']),
    'ml-engineer': new Set(['sub-python', 'sub-sql', 'sub-math', 'sub-ml', 'sub-dl', 'sub-sql-adv', 'sub-virtual-internship',
        'free-python', 'free-dsa', 'free-adv-python', 'free-data-libs', 'free-math', 'free-ml', 'free-ml-projects', 'free-dl', 'free-devops', 'free-cloud']),
    // genai-engineer replaces genai-specialist as the active ID
    'genai-engineer': new Set(['sub-python', 'sub-sql', 'sub-math', 'sub-ml', 'sub-dl', 'sub-genai', 'sub-virtual-internship',
        'free-python', 'free-dsa', 'free-adv-python', 'free-data-libs', 'free-math', 'free-ml', 'free-dl', 'free-genai', 'free-genai-projects', 'free-devops']),
    'genai-specialist': new Set(['sub-python', 'sub-sql', 'sub-math', 'sub-ml', 'sub-dl', 'sub-genai', 'sub-virtual-internship',
        'free-python', 'free-dsa', 'free-adv-python', 'free-data-libs', 'free-math', 'free-ml', 'free-dl', 'free-genai', 'free-genai-projects', 'free-devops']),
    'ai-engineer': new Set(['sub-python', 'sub-sql', 'sub-math', 'sub-ml', 'sub-dl', 'sub-genai', 'sub-sql-adv', 'sub-virtual-internship',
        'free-python', 'free-dsa', 'free-adv-python', 'free-data-libs', 'free-math', 'free-ml', 'free-ml-projects', 'free-dl', 'free-genai', 'free-genai-projects', 'free-devops', 'free-cloud']),
    'nlp-engineer': new Set(['sub-python', 'sub-sql', 'sub-math', 'sub-ml', 'sub-dl', 'sub-nlp', 'sub-virtual-internship',
        'free-python', 'free-dsa', 'free-adv-python', 'free-data-libs', 'free-math', 'free-ml', 'free-ml-projects', 'free-dl', 'free-nlp', 'free-devops']),
    // Data Scientist — heavy stats + ML, no GenAI/NLP/CV specializations
    'data-scientist': new Set(['sub-python', 'sub-sql', 'sub-math', 'sub-ml', 'sub-dl', 'sub-sql-adv', 'sub-virtual-internship',
        'free-python', 'free-dsa', 'free-adv-python', 'free-data-libs', 'free-math', 'free-ml', 'free-ml-projects', 'free-dl', 'free-devops', 'free-unguided', 'free-career']),
    'data-analyst': new Set([
        'free-python', 'free-data-libs',
        'free-excel', 'free-powerbi', 'free-domain-knowledge',
        'free-stakeholder-comm', 'free-ai-tools-da', 'free-interview-prep-da']),
    'data-engineer': new Set([
        'free-python', 'free-dsa', 'free-adv-python', 'free-data-libs',
        'free-devops', 'free-de-foundations', 'free-data-modeling',
        'free-cloud-etl', 'free-spark-databricks', 'free-de-projects',
        'free-snowflake-airflow', 'free-streaming-analytics']),
};

/**
 * Fallback: map subject ID → experience category for skip logic
 * when the subject has no tags field. Uses subject ID to infer
 * what experience category it corresponds to.
 */
const SUBJECT_ID_TO_EXPERIENCE_CATEGORY: Record<string, string> = {
    // Bootcamp subjects
    'sub-python': 'python',
    'sub-sql': 'sql',
    'sub-sql-adv': 'sql',
    'sub-math': 'statistics',
    'sub-ml': 'ml',
    'sub-dl': 'dl',
    'sub-nlp': 'nlp',
    'sub-genai': 'genai',
    // Free subjects
    'free-python': 'python',
    'free-adv-python': 'python',
    'free-data-libs': 'sql',
    'free-math': 'statistics',
    'free-ml': 'ml',
    'free-ml-projects': 'ml',
    'free-dl': 'dl',
    'free-nlp': 'nlp',
    'free-genai': 'genai',
    'free-genai-projects': 'genai',
    'free-devops': 'mlops',
    // Data Analyst subjects
    'free-excel': 'analytics',
    'free-powerbi': 'analytics',
    'free-ai-tools-da': 'analytics',
    // Data Engineer subjects
    'free-de-foundations': 'data-engineering',
    'free-data-modeling': 'data-engineering',
    'free-cloud-etl': 'data-engineering',
    'free-spark-databricks': 'big-data',
    'free-snowflake-airflow': 'big-data',
    'free-streaming-analytics': 'big-data',
};

/** Phase names that indicate career/support phases (not learning modules) */
const CAREER_PHASE_KEYWORDS = ['online credibility', 'job assistance', 'interview', 'branding'];
const OPTIONAL_PHASE_KEYWORDS = ['sql (advanced)'];

// Helper to derive defaults if flags are missing (Backward Compatibility + UX Simplicity)
function deriveSkillFlags(background: string, input: PlanInput) {
    const isTech = ['tech-pro', 'software-dev', 'data-analyst', 'academic'].includes(background);
    const isDev = ['tech-pro', 'software-dev'].includes(background);

    // Default: Assume Python/basics known for Tech roles, unless explicitly set to false
    // If input.hasPythonBasics is defined, use it. Otherwise derive.
    const hasPythonBasics = input.hasPythonBasics ?? isTech;

    // DSA: Usually CS grads/devs know this. Analysts might not.
    // 'academic' might be Math major (no DSA). So stricter default.
    const hasDSABasics = input.hasDSABasics ?? isDev;

    // Git: Devs know it. Analysts might not.
    const hasGitBasics = input.hasgitBasics ?? isDev;

    // AI Intro: specific to this course. Usually assume No unless 'tech-pro' who might know it.
    // Actually, let's link it to Python Basics for simplicity in "Tech Pro" case, or strict false?
    // User request: "Prevent incorrect skipping". 
    // Let's assume 'tech-pro' knows AI basics (high level).
    const hasAIIntro = input.hasAIIntro ?? (background === 'tech-pro');

    return { hasPythonBasics, hasDSABasics, hasGitBasics, hasAIIntro };
}

function buildSubjectNameMap(subjects: Subject[]): Map<string, string> {
    return new Map(subjects.map(s => [s.id, s.name]));
}

function subjectName(ch: Chapter, nameMap: Map<string, string>): string {
    return nameMap.get(ch.subjectId) ?? ch.subjectId;
}

import { formatWeeks, weeksToMonths } from "./utils";
import { PlanInputSchema } from "./schemas/planInputSchema";

export function generatePlan(input: PlanInput): PlanResult {
    // Runtime validation of input shape
    const parsed = PlanInputSchema.safeParse(input);
    if (!parsed.success) {
        throw new Error(`Invalid plan input: ${parsed.error.message}`);
    }

    const {
        learnerType,
        goal, background, careerOutcome, learningPreference, availability,
        experience, syllabusChapters, syllabusSubjects
    } = input;

    const nameMap = buildSubjectNameMap(syllabusSubjects);
    let chapters: Chapter[] = [...syllabusChapters];
    const whyThisPlan: string[] = [];

    // ===== 0. FILTERING (SKIP LOGIC) =====
    // Derive effective flags from background AND ExperienceState
    const derived = deriveSkillFlags(background, input);

    // Merge: if user explicitly checked an experience box, force the flag true
    const hasPythonBasics = derived.hasPythonBasics || experience.python;
    const hasDSABasics = derived.hasDSABasics;
    const hasGitBasics = derived.hasGitBasics;
    const hasAIIntro = derived.hasAIIntro || experience.genai;

    // Build a set of categories the user claims knowledge of (from ExperienceState)
    const knownCategories = new Set<string>();
    for (const [expKey, checked] of Object.entries(experience)) {
        if (checked && EXPERIENCE_TO_CATEGORY[expKey]) {
            knownCategories.add(EXPERIENCE_TO_CATEGORY[expKey]);
        }
    }

    // Identify subjects to skip based on flags, tags, and experience
    const skippedSubjectIds = new Set<string>();
    const appliedSkips: { moduleId: string; reason: string; reasonCode: string; flagUsed: string; }[] = [];

    syllabusSubjects.forEach(sub => {
        // Fallback: derive tags from subject ID → experience category mapping when tags field is missing
        const tags = sub.tags ?? {
            category: SUBJECT_ID_TO_EXPERIENCE_CATEGORY[sub.id] ?? sub.category ?? 'unknown',
            level: 'intro'
        };

        let shouldSkip = false;
        let reason = "";
        let reasonCode = "";
        let flagUsed = "";

        // Flag-based skips (backward compat)
        if (tags.category === 'python' && tags.level === 'intro' && hasPythonBasics) {
            shouldSkip = true;
            reason = "User has Python basics";
            reasonCode = "SKIP_PYTHON_BASIC";
            flagUsed = "hasPythonBasics";
        }
        if (tags.category === 'dsa' && tags.level === 'intro' && hasDSABasics) {
            shouldSkip = true;
            reason = "User has DSA basics";
            reasonCode = "SKIP_DSA_BASIC";
            flagUsed = "hasDSABasics";
        }
        if (tags.category === 'git' && tags.level === 'intro' && hasGitBasics) {
            shouldSkip = true;
            reason = "User has Git basics";
            reasonCode = "SKIP_GIT_BASIC";
            flagUsed = "hasGitBasics";
        }

        // Experience-state-based skip: if user checked the matching category
        if (tags.level === 'intro' && knownCategories.has(tags.category) && !shouldSkip) {
            shouldSkip = true;
            reason = `User marked ${tags.category} as known`;
            reasonCode = `SKIP_EXPERIENCE_${tags.category.toUpperCase()}`;
            flagUsed = `experience.${tags.category}`;
        }

        // Tool-based skip: big-data and analytics are standalone tools, not progressive depth
        // Skip all levels when user claims knowledge (e.g. knows Spark → skip all Spark modules)
        const toolCategories = ['big-data', 'analytics', 'data-engineering'];
        if (!shouldSkip && knownCategories.has(tags.category) && toolCategories.includes(tags.category)) {
            shouldSkip = true;
            reason = `User marked ${tags.category} as known`;
            reasonCode = `SKIP_TOOL_${tags.category.toUpperCase()}`;
            flagUsed = `experience.${tags.category}`;
        }

        // Enhanced depth-aware skip: advanced backgrounds skip intermediate levels too
        const advancedBackgrounds = ['software-dev', 'tech-pro', 'data-analyst'];
        if (tags.level === 'intermediate' && knownCategories.has(tags.category)
            && advancedBackgrounds.includes(background) && !shouldSkip) {
            shouldSkip = true;
            reason = `Advanced background skips intermediate ${tags.category}`;
            reasonCode = `SKIP_INTERMEDIATE_${tags.category.toUpperCase()}`;
            flagUsed = `experience.${tags.category}+background`;
        }

        // Legacy: Tech Pro skips intermediate Python specifically
        if (tags.category === 'python' && tags.level === 'intermediate' && hasPythonBasics && background === 'tech-pro' && !shouldSkip) {
            shouldSkip = true;
            reason = "Tech Pro skips intermediate Python";
            reasonCode = "SKIP_PYTHON_INTERMEDIATE_TECH";
            flagUsed = "hasPythonBasics+background";
        }

        if (shouldSkip) {
            skippedSubjectIds.add(sub.id);
            appliedSkips.push({ moduleId: sub.id, reason, reasonCode, flagUsed });
        }
    });

    if (skippedSubjectIds.size > 0) {
        const skippedDuration = chapters
            .filter(ch => skippedSubjectIds.has(ch.subjectId))
            .reduce((sum, ch) => sum + ch.durationWeeks, 0);
        chapters = chapters.filter(ch => !skippedSubjectIds.has(ch.subjectId));
        const savedWeeks = Math.round(skippedDuration);
        whyThisPlan.push(
            `Skipped ${skippedSubjectIds.size} module${skippedSubjectIds.size !== 1 ? 's' : ''} you already know${savedWeeks > 0 ? ` — saving you ~${savedWeeks} week${savedWeeks !== 1 ? 's' : ''}` : ''}.`
        );
    }

    // ===== GOAL-BASED FILTERING =====
    // Remove specialization subjects that are NOT core to the selected goal.
    // Foundation and career subjects are always kept.
    const goalCoreSet = GOAL_CORE_SUBJECTS[goal];
    if (goalCoreSet) {
        const goalExcludedIds = new Set<string>();
        syllabusSubjects.forEach(sub => {
            const cat = sub.category ?? 'unknown';
            // Only filter out subjects not relevant to the goal
            // Career subjects (git, unguided, career) are always kept
            if (cat !== 'career' && !goalCoreSet.has(sub.id)) {
                goalExcludedIds.add(sub.id);
            }
        });
        if (goalExcludedIds.size > 0) {
            chapters = chapters.filter(ch => !goalExcludedIds.has(ch.subjectId));
            const goalDisplayName = syllabusSubjects.length > 0
                ? (goal.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))
                : goal;
            whyThisPlan.push(`Tailored for ${goalDisplayName}: removed ${goalExcludedIds.size} module${goalExcludedIds.size !== 1 ? 's' : ''} not relevant to this career path.`);
        }
    }

    // --- MAPPING NEW INPUTS TO LOGIC ---

    // 1. Profile Category (Multiplier Logic)
    let profileMultiplier = 1.0;
    if (['beginner', 'student', 'non-tech', 'career-gap'].includes(background)) {
        profileMultiplier = 1.2; // Reduced from 1.5 to align better with labels
    } else if (['data-analyst', 'tech-pro', 'academic'].includes(background)) {
        profileMultiplier = 1.0; // Standard
    } else if (['software-dev', 'manager'].includes(background)) {
        profileMultiplier = 0.8; // Fast learners
    }

    // 2. Learning Preference Logic
    if (learningPreference === 'fast-track') {
        // Legacy ID — kept for backward compat
        profileMultiplier *= 0.85;
        whyThisPlan.push("Accelerated pacing — each module has tighter timelines for fast-track learning.");
    } else if (learningPreference === 'theory') {
        profileMultiplier *= 1.1;
        whyThisPlan.push("Extra time allocated for deep theoretical understanding before moving to projects.");
    } else if (learningPreference === 'comprehensive') {
        // Legacy ID — kept for backward compat
        profileMultiplier *= 1.1;
        whyThisPlan.push("Extra time allocated for comprehensive depth and theory.");
    } else if (learningPreference === 'practical') {
        whyThisPlan.push("Practical-first approach — projects are interleaved earlier in your learning path.");
    }
    // 'balanced' uses default multiplier and order (1.0 — no change)

    // 3. Bootcamp Specific Logic
    if (learnerType === 'bootcamp') {
        profileMultiplier *= 0.55;
        whyThisPlan.push("Applied Bootcamp Pacing (intensive/guided).");
    }

    // ===== 4. TIME ADJUSTMENTS (PROFILE) =====
    chapters = chapters.map(ch => {
        let duration = ch.durationWeeks * profileMultiplier;

        // Context-aware adjustments (legacy)
        if (careerOutcome === 'job-search' && ch.isInternship) {
            duration *= 1.2;
        }

        // Career outcome curriculum restructuring
        const outcomeDurationBoost: Record<string, Record<string, number>> = {
            'job-search': { 'free-career': 1.5, 'free-unguided': 1.3 },
            'startup': { 'free-devops': 1.3, 'free-cloud': 1.3 },
            'upskill': { 'free-career': 0.5, 'free-unguided': 0.5 },
            'freelance': { 'free-genai-projects': 1.2, 'free-unguided': 1.3 },
            'career-transition': { 'free-career': 1.3 },
            'academic': { 'free-math': 1.3, 'free-dl': 1.2, 'free-career': 0.5 },
        };
        const outcomeBoosts = outcomeDurationBoost[careerOutcome];
        if (outcomeBoosts && outcomeBoosts[ch.subjectId]) {
            duration *= outcomeBoosts[ch.subjectId];
        }

        // Normalize checks
        if (duration < 0.1) duration = 0.5; // Minimum 0.5 weeks

        return { ...ch, durationWeeks: parseFloat(duration.toFixed(1)) };
    });

    // Career outcome whyThisPlan messages
    const outcomeMessages: Record<string, string> = {
        'job-search': 'Prioritized interview preparation, portfolio projects, and career branding for your job search.',
        'startup': 'Emphasized deployment, cloud infrastructure, and end-to-end product building for entrepreneurship.',
        'upskill': 'Reduced career/job-prep modules since you are focused on skill enhancement, not job switching.',
        'freelance': 'Emphasized project-building and independent work for freelancing/consulting readiness.',
        'career-transition': 'Added extra career transition support including branding and networking guidance.',
        'academic': 'Deepened mathematical foundations and theory for academic/research preparation.',
    };
    if (outcomeMessages[careerOutcome]) {
        whyThisPlan.push(outcomeMessages[careerOutcome]);
    }

    // Background-specific whyThisPlan messages
    const backgroundMessages: Record<string, string> = {
        'software-dev': 'As a software developer, we streamlined foundations and focused on AI-specific content.',
        'beginner': 'Included all foundational modules with extra time for mastering each concept from scratch.',
        'non-tech': 'Included comprehensive foundations to build your technical skills from the ground up.',
        'career-gap': 'Built in extra review time to help you re-engage with technical concepts at a comfortable pace.',
        'data-analyst': 'Optimized your path by building on your existing data analysis skills.',
        'student': 'Tailored for your academic background with a structured learning progression.',
    };
    if (backgroundMessages[background]) {
        whyThisPlan.push(backgroundMessages[background]);
    }

    // Goal-specific whyThisPlan messages
    const goalMessages: Record<string, string> = {
        'data-analyst': 'Focused on Excel, BI tools, SQL, and business domain knowledge — the core skills employers look for in Data Analysts.',
        'data-engineer': 'Covers Python, SQL, cloud ETL, Spark, and streaming — the full modern Data Engineering stack.',
        'data-scientist': 'Heavy emphasis on statistics, ML, and deep learning — the core competencies for Data Scientists.',
        'ml-engineer': 'Focused on ML fundamentals, deep learning, and MLOps for production model deployment.',
        'ai-engineer': 'Full-stack AI path covering ML, DL, GenAI, and cloud deployment.',
    };
    if (goalMessages[goal]) {
        whyThisPlan.push(goalMessages[goal]);
    }

    // ===== 5. AVAILABILITY FACTORS =====
    let hoursPerWeek = 15;
    let availabilityFactor = 1.0;

    if (availability === '0-5' || availability === '3-5') {
        // '0-5' is the new ID; '3-5' is the legacy ID — both map the same
        hoursPerWeek = 4;
        availabilityFactor = 2.8;
    } else if (availability === '5-10') {
        hoursPerWeek = 7.5;
        availabilityFactor = 1.2;
    } else if (availability === '10-20') {
        hoursPerWeek = 15;
        availabilityFactor = 0.75;
    } else if (availability === '20+' || availability === '20-30') {
        // '20+' is the new ID consolidating 20-30/30-40/full-time; maps to 25h/week
        hoursPerWeek = 25;
        availabilityFactor = 0.5;
    } else if (availability === '30-40') {
        // Legacy ID — kept for backward compat
        hoursPerWeek = 35;
        availabilityFactor = 0.4;
    } else if (availability === 'full-time') {
        // Legacy ID — kept for backward compat
        hoursPerWeek = 40;
        availabilityFactor = 0.35;
    }

    // Apply availability factor to chapters
    chapters = chapters.map(ch => {
        let duration = parseFloat((ch.durationWeeks * availabilityFactor).toFixed(1));
        // Enforce minimum 0.1 weeks after ALL scaling (prevents 0-duration chapters)
        if (duration < 0.1) duration = 0.1;
        return { ...ch, durationWeeks: duration };
    });

    // ===== 6. CONSTRUCT PHASES =====
    const phases: Phase[] = [];
    let phaseCounter = 0;
    syllabusSubjects.forEach(subject => {
        const subjectChapters = chapters.filter(ch => ch.subjectId === subject.id);
        if (subjectChapters.length > 0) {
            phaseCounter++;
            const phaseDuration = subjectChapters.reduce((sum, ch) => sum + ch.durationWeeks, 0);
            const rawName = subject.displayName || subject.name;
            const cleanName = normalizeTitle(rawName);
            const lowerName = cleanName.toLowerCase();

            phases.push({
                id: subject.id,  // STABLE IDENTITY
                name: cleanName, // normalized — no "Week N:" / "Module N:" prefix
                phaseIndex: phaseCounter,
                displayLabel: `Week ${phaseCounter}`,
                color: subject.color || "bg-gray-50 border-gray-200",
                chapters: subjectChapters,
                isCareerPhase: CAREER_PHASE_KEYWORDS.some(kw => lowerName.includes(kw)),
                isOptional: OPTIONAL_PHASE_KEYWORDS.some(kw => lowerName.includes(kw)),
                durationWeeks: phaseDuration,
                formattedDuration: formatWeeks(phaseDuration)
            });
        }
    });

    // ===== 6B. LEARNING PREFERENCE REORDERING =====
    if (learningPreference === 'practical' && phases.length > 2) {
        const foundationPhases = phases.filter(p => !p.isCareerPhase && !p.chapters.some(ch => ch.isProject));
        const projectPhases = phases.filter(p => p.chapters.some(ch => ch.isProject));
        const careerPhases = phases.filter(p => p.isCareerPhase);

        if (projectPhases.length > 0) {
            const reordered: Phase[] = [];
            let fIdx = 0;
            let pIdx = 0;

            // Interleave: after every 2 foundation phases, insert a project phase
            while (fIdx < foundationPhases.length) {
                reordered.push(foundationPhases[fIdx++]);
                if (fIdx < foundationPhases.length) reordered.push(foundationPhases[fIdx++]);
                if (pIdx < projectPhases.length) reordered.push(projectPhases[pIdx++]);
            }
            // Append remaining projects and career phases
            while (pIdx < projectPhases.length) reordered.push(projectPhases[pIdx++]);
            reordered.push(...careerPhases);

            // Re-index phases
            reordered.forEach((phase, i) => {
                phase.phaseIndex = i + 1;
                phase.displayLabel = `Week ${i + 1}`;
            });

            // Replace phases array content
            phases.length = 0;
            phases.push(...reordered);
        }
    }

    // ===== 7. CALCULATE TOTALS (Single Source of Truth) =====
    const projectCount = phases.reduce((sum, p) => sum + p.chapters.filter(ch => ch.isProject).length, 0);
    const internshipCount = phases.reduce((sum, p) => sum + p.chapters.filter(ch => ch.isInternship).length, 0);

    const finalTotalWeeks = chapters.reduce((sum, ch) => sum + ch.durationWeeks, 0);
    const estimatedMonths = weeksToMonths(finalTotalWeeks);

    // ===== 8. WARNING GENERATION =====
    const warnings: string[] = [];

    let expectedMaxMonths = 999;
    if (availability === '10-20') expectedMaxMonths = 8;
    else if (availability === '20+' || availability === '20-30') expectedMaxMonths = 6;
    else if (availability === '30-40') expectedMaxMonths = 5;
    else if (availability === 'full-time') expectedMaxMonths = 4;
    else if (availability === '5-10') expectedMaxMonths = 12;

    if (estimatedMonths > expectedMaxMonths) {
        warnings.push(`Your selections require ~${estimatedMonths} months. Adjust weekly hours or scope to fit your selected range.`);
    }

    return {
        phases,
        totalModules: phases.reduce((sum, p) => sum + p.chapters.length, 0),
        totalWeeks: parseFloat(finalTotalWeeks.toFixed(1)),
        estimatedMonths,
        hoursPerWeek: Math.round(hoursPerWeek),
        whyThisPlan,
        projectCount,
        internshipCount,
        warnings,
        diagnostics: {
            effectiveFlags: { hasPythonBasics, hasDSABasics, hasGitBasics, hasAIIntro },
            appliedSkips,
            syllabusVersion: "v2-tagged"
        }
    };
}
