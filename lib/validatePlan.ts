import { PlanResult, PlanInput } from "./types";

export type ValidationResult = {
    ok: boolean;
    errors: string[];
    warnings: string[];
};

export function validatePlan(plan: PlanResult, input?: PlanInput): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // ... existing invariants ...

    // 1. Invariant: totalWeeks matches sum of module durations
    const computedTotalWeeks = plan.phases.reduce((sum, phase) => {
        return sum + phase.chapters.reduce((pSum, ch) => pSum + ch.durationWeeks, 0);
    }, 0);

    if (Math.abs(computedTotalWeeks - plan.totalWeeks) > 0.1) {
        errors.push(`Total weeks mismatch: Plan says ${plan.totalWeeks}, computed sum is ${computedTotalWeeks.toFixed(2)} `);
    }

    // 2. Invariant: totalMonths derived correctly
    const expectedMonths = Math.ceil(plan.totalWeeks / 4.3);
    if (plan.estimatedMonths !== expectedMonths) {
        errors.push(`Estimated months mismatch: Plan says ${plan.estimatedMonths}, expected ${expectedMonths} (based on ${plan.totalWeeks} weeks)`);
    }

    // 3. Invariant: counts
    const computedProjectCount = plan.phases.reduce((sum, phase) => sum + phase.chapters.filter(ch => ch.isProject).length, 0);
    if (computedProjectCount !== plan.projectCount) errors.push(`Project count mismatch: Plan says ${plan.projectCount}, found ${computedProjectCount} `);

    const computedInternshipCount = plan.phases.reduce((sum, phase) => sum + phase.chapters.filter(ch => ch.isInternship).length, 0);
    if (computedInternshipCount !== plan.internshipCount) errors.push(`Internship count mismatch: Plan says ${plan.internshipCount}, found ${computedInternshipCount} `);

    // 4. Invariant: No invalid durations & Phase consistency
    plan.phases.forEach(phase => {
        const phaseSum = phase.chapters.reduce((sum, ch) => sum + ch.durationWeeks, 0);
        if (Math.abs(phaseSum - phase.durationWeeks) > 0.1) {
            errors.push(`Phase duration mismatch for "${phase.name}": Phase says ${phase.durationWeeks}, sum of chapters is ${phaseSum.toFixed(2)} `);
        }
        phase.chapters.forEach(ch => {
            if (ch.durationWeeks <= 0) errors.push(`Invalid duration for module ${ch.id}: ${ch.durationWeeks} `);
        });
    });

    // 5. Hardening: Syllabus Integrity & Flag Validation (if input provided)
    if (input) {
        const strictMode = process.env.STRICT_VALIDATION === "true";
        const KNOWN_FLAGS = ['hasPythonBasics', 'hasDSABasics', 'hasgitBasics', 'hasAIIntro']; // Note: 'hasgitBasics' case from input type
        const usedCategories = new Set<string>();

        input.syllabusSubjects.forEach(sub => {
            const tags = sub.tags;
            if (tags && tags.level === 'intro') {
                if (!tags.category) {
                    errors.push(`Syllabus Integrity: Intro module "${sub.id}" missing 'category' tag.`);
                } else {
                    usedCategories.add(tags.category);
                }
            }
        });

        // Warn if a category is used but no obvious flag maps to it (Manual mapping check)
        // Map: python->hasPythonBasics, dsa->hasDSABasics, git->hasgitBasics, ai-basics->hasAIIntro
        const categoryMap: Record<string, string> = {
            'python': 'hasPythonBasics',
            'dsa': 'hasDSABasics',
            'git': 'hasgitBasics',
            'ai-basics': 'hasAIIntro'
        };

        usedCategories.forEach(cat => {
            if (!categoryMap[cat]) {
                const msg = `Config Warning: Category '${cat}' used in syllabus but no explicit mapping in validation logic.`;
                if (strictMode) {
                    errors.push(`[STRICT] ${msg} `);
                } else {
                    warnings.push(msg);
                }
            }
        });
    }

    // 6. Deep Duration Integrity Checks
    let calculatedTotalWeeks = 0;
    plan.phases.forEach(phase => {
        const phaseSum = phase.chapters.reduce((sum, ch) => sum + ch.durationWeeks, 0);
        if (Math.abs(phaseSum - phase.durationWeeks) > 0.01) {
            errors.push(`Phase duration integrity fail: "${phase.name}" sum(${phaseSum}) != phase.duration(${phase.durationWeeks})`);
        }
        calculatedTotalWeeks += phase.durationWeeks;
    });

    if (Math.abs(calculatedTotalWeeks - plan.totalWeeks) > 0.01) {
        errors.push(`Global duration integrity fail: plan.totalWeeks(${plan.totalWeeks}) != sum(phases)(${calculatedTotalWeeks})`);
    }

    // 7. Check formatting consistency (Optional but good for strictness)
    // We expect weeksToMonths to be consistent
    const reCalcMonths = Math.ceil(plan.totalWeeks / 4.3);
    if (plan.estimatedMonths !== reCalcMonths) {
        errors.push(`Global integrity fail: Months(${plan.estimatedMonths}) != ceil(Weeks(${plan.totalWeeks}) / 4.3)`);
    }

    return {
        ok: errors.length === 0,
        errors,
        warnings
    };
}
