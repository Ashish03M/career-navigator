/**
 * Comprehensive Verification Suite
 * Covers: Invariants, Determinism, Validation, totalModules audit
 * 
 * Run: npx tsx scripts/verify-all.ts
 */
import { generatePlan } from "../lib/generatePlan";
import { INITIAL_EXPERIENCE, type PlanInput, type PlanResult, type ExperienceState } from "../lib/types";
import { validatePlan } from "../lib/validatePlan";
import { formatWeeks, weeksToMonths } from "../lib/utils";
import { normalizeTitle } from "../lib/normalizeTitle";
import freeSyllabus from "../data/free_syllabus.json";
import bootcampSyllabus from "../data/syllabus_v3.json";

// ─── Test Harness ───
let passed = 0;
let failed = 0;
const failMessages: string[] = [];

function assert(condition: boolean, label: string, detail?: string) {
    if (condition) {
        passed++;
        console.log(`  ✅ ${label}`);
    } else {
        failed++;
        const msg = detail ? `${label} — ${detail}` : label;
        failMessages.push(msg);
        console.error(`  ❌ ${label}${detail ? ` (${detail})` : ""}`);
    }
}

function section(name: string) {
    console.log(`\n━━━ ${name} ━━━`);
}

// ─── Fixtures ───
const FREE_BASE: PlanInput = {
    learnerType: "free",
    goal: "career",
    background: "beginner",
    careerOutcome: "job-search",
    learningPreference: "structured",
    availability: "10-20",
    realWorldApp: "yes",
    experience: INITIAL_EXPERIENCE,
    syllabusChapters: freeSyllabus.chapters as any,
    syllabusSubjects: freeSyllabus.subjects as any,
};

const BOOTCAMP_BASE: PlanInput = {
    learnerType: "bootcamp",
    goal: "career",
    background: "beginner",
    careerOutcome: "job-search",
    learningPreference: "structured",
    availability: "10-20",
    realWorldApp: "yes",
    experience: INITIAL_EXPERIENCE,
    syllabusChapters: bootcampSyllabus.chapters as any,
    syllabusSubjects: bootcampSyllabus.subjects as any,
};

// =============================
// TEST 1: INVARIANT SUITE
// =============================
function testInvariants(plan: PlanResult, label: string, catalogChapterIds?: Set<string>) {
    section(`Invariants: ${label}`);

    // 1a. Phase duration = sum(chapter durations)
    plan.phases.forEach(phase => {
        const chapSum = phase.chapters.reduce((s, ch) => s + ch.durationWeeks, 0);
        const diff = Math.abs(chapSum - phase.durationWeeks);
        assert(diff < 0.02, `Phase "${phase.name}": sum(chapters)=${chapSum.toFixed(2)} ≈ phase.duration=${phase.durationWeeks}`, diff >= 0.02 ? `diff=${diff}` : undefined);
    });

    // 1b. totalWeeks = sum(phase durations)
    const phaseSum = plan.phases.reduce((s, p) => s + p.durationWeeks, 0);
    const totalDiff = Math.abs(phaseSum - plan.totalWeeks);
    assert(totalDiff < 0.2, `totalWeeks=${plan.totalWeeks} ≈ sum(phases)=${phaseSum.toFixed(2)}`, totalDiff >= 0.2 ? `diff=${totalDiff}` : undefined);

    // 1c. estimatedMonths = ceil(totalWeeks / 4.3)
    const expectedMonths = weeksToMonths(plan.totalWeeks);
    assert(plan.estimatedMonths === expectedMonths, `estimatedMonths=${plan.estimatedMonths} === ceil(${plan.totalWeeks}/4.3)=${expectedMonths}`);

    // 1d. No NaN or negative durations
    let hasInvalid = false;
    plan.phases.forEach(p => {
        p.chapters.forEach(ch => {
            if (isNaN(ch.durationWeeks) || ch.durationWeeks < 0) {
                hasInvalid = true;
                console.error(`    Invalid duration: ${ch.id} = ${ch.durationWeeks}`);
            }
        });
    });
    assert(!hasInvalid, "No NaN or negative durations in any chapter");

    // 1e. projectCount matches filter
    const computedProjects = plan.phases.reduce((s, p) => s + p.chapters.filter(c => c.isProject).length, 0);
    assert(computedProjects === plan.projectCount, `projectCount=${plan.projectCount} matches recount=${computedProjects}`);

    // 1f. internshipCount matches filter
    const computedInternships = plan.phases.reduce((s, p) => s + p.chapters.filter(c => c.isInternship).length, 0);
    assert(computedInternships === plan.internshipCount, `internshipCount=${plan.internshipCount} matches recount=${computedInternships}`);

    // 1g. formattedDuration matches formatWeeks()
    plan.phases.forEach(p => {
        const expected = formatWeeks(p.durationWeeks);
        assert(p.formattedDuration === expected, `Phase "${p.name}": formattedDuration="${p.formattedDuration}" === formatWeeks()="${expected}"`);
    });

    // 1h. hoursPerWeek is a positive integer
    assert(plan.hoursPerWeek > 0 && Number.isInteger(plan.hoursPerWeek), `hoursPerWeek=${plan.hoursPerWeek} is positive integer`);

    // 1i. validatePlan passes
    const validation = validatePlan(plan);
    assert(validation.ok, `validatePlan() passes`, validation.errors.length > 0 ? validation.errors.join("; ") : undefined);

    // 1j. totalModules = sum of all chapter counts across phases
    const totalChapterCount = plan.phases.reduce((s, p) => s + p.chapters.length, 0);
    assert(plan.totalModules === totalChapterCount, `totalModules=${plan.totalModules} matches total chapter count=${totalChapterCount}`);

    // 1k. Phase IDs are unique and non-empty
    const phaseIds = plan.phases.map(p => p.id);
    assert(phaseIds.every(id => id && id.length > 0), "All phase IDs are non-empty");
    assert(new Set(phaseIds).size === phaseIds.length, `Phase IDs are unique (${phaseIds.length} phases, ${new Set(phaseIds).size} unique IDs)`);

    // 1l. No duplicate chapter IDs
    const allChapterIds = plan.phases.flatMap(p => p.chapters.map(c => c.id));
    assert(new Set(allChapterIds).size === allChapterIds.length, `No duplicate chapter IDs (${allChapterIds.length} chapters, ${new Set(allChapterIds).size} unique)`);

    // 1m. All chapters map to a known catalog chapter (if provided)
    if (catalogChapterIds) {
        const unmapped = allChapterIds.filter(id => !catalogChapterIds.has(id));
        assert(unmapped.length === 0, `All chapters exist in catalog`, unmapped.length > 0 ? `unmapped: ${unmapped.join(', ')}` : undefined);
    }

    // 1n. phaseIndex is sequential 1..N
    plan.phases.forEach((p, i) => {
        assert(p.phaseIndex === i + 1, `Phase "${p.name}": phaseIndex=${p.phaseIndex} === ${i + 1}`);
    });

    // 1o. displayLabel matches phaseIndex
    plan.phases.forEach(p => {
        assert(p.displayLabel === `Week ${p.phaseIndex}`, `Phase "${p.name}": displayLabel="${p.displayLabel}" === "Week ${p.phaseIndex}"`);
    });

    // 1p. No phase name contains schedule prefix leaks
    plan.phases.forEach(p => {
        const hasLeak = /^(Week\s+[\d,\s]+:|Module\s+\d+:)/i.test(p.name);
        assert(!hasLeak, `Phase "${p.name}": no leaked schedule prefix`, hasLeak ? `name still has prefix` : undefined);
    });
}

// =============================
// TEST 2: DETERMINISM (50 RUNS)
// =============================
function testDeterminism() {
    section("Determinism (50 runs, free syllabus)");
    const results: string[] = [];
    for (let i = 0; i < 50; i++) {
        const plan = generatePlan({ ...FREE_BASE });
        // Stable serialization: JSON.stringify with sorted keys for each phase/chapter
        const serialized = JSON.stringify(plan, Object.keys(plan).sort());
        results.push(serialized);
    }
    const allIdentical = results.every(r => r === results[0]);
    assert(allIdentical, "50 runs produce bit-identical output");

    section("Determinism (50 runs, bootcamp syllabus)");
    const bcResults: string[] = [];
    for (let i = 0; i < 50; i++) {
        const plan = generatePlan({ ...BOOTCAMP_BASE });
        const serialized = JSON.stringify(plan, Object.keys(plan).sort());
        bcResults.push(serialized);
    }
    const allIdenticalBc = bcResults.every(r => r === bcResults[0]);
    assert(allIdenticalBc, "50 runs produce bit-identical output (bootcamp)");
}

// =============================
// TEST 3: SKIP LOGIC
// =============================
function testSkipLogic() {
    section("Skip Logic (Free Syllabus)");

    // Beginner — no skips
    const beginner = generatePlan({ ...FREE_BASE, background: "beginner" });
    const beginnerSubjects = new Set(beginner.phases.flatMap(p => p.chapters.map(c => c.subjectId)));
    assert(beginnerSubjects.has("free-python"), "Beginner retains free-python");
    assert(beginnerSubjects.has("free-dsa"), "Beginner retains free-dsa");
    assert(beginnerSubjects.has("free-git"), "Beginner retains free-git");

    // Tech-pro — skips python, dsa, git, adv-python
    const techPro = generatePlan({ ...FREE_BASE, background: "tech-pro" });
    const techSubjects = new Set(techPro.phases.flatMap(p => p.chapters.map(c => c.subjectId)));
    assert(!techSubjects.has("free-python"), "Tech-pro skips free-python");
    assert(!techSubjects.has("free-dsa"), "Tech-pro skips free-dsa");
    assert(!techSubjects.has("free-git"), "Tech-pro skips free-git (derived flag)");
    assert(!techSubjects.has("free-adv-python"), "Tech-pro skips free-adv-python (intermediate)");

    // Explicit override: hasPythonBasics=false on tech-pro should RETAIN python
    const techNoSkip = generatePlan({ ...FREE_BASE, background: "tech-pro", hasPythonBasics: false });
    const techNoSkipSubjects = new Set(techNoSkip.phases.flatMap(p => p.chapters.map(c => c.subjectId)));
    assert(techNoSkipSubjects.has("free-python"), "Tech-pro with hasPythonBasics=false retains free-python");

    // Duration reduction
    assert(techPro.totalWeeks < beginner.totalWeeks, `Tech-pro weeks(${techPro.totalWeeks}) < Beginner weeks(${beginner.totalWeeks})`);

    section("Skip Logic (Bootcamp Syllabus — tags fallback)");
    const bcBeginner = generatePlan({ ...BOOTCAMP_BASE, background: "beginner" });
    const bcTechPro = generatePlan({ ...BOOTCAMP_BASE, background: "tech-pro" });
    const bcBeginnerChapterCount = bcBeginner.phases.reduce((s, p) => s + p.chapters.length, 0);
    const bcTechProChapterCount = bcTechPro.phases.reduce((s, p) => s + p.chapters.length, 0);
    // Tech-pro derives experience flags (hasPythonBasics, hasAIIntro) which trigger skip logic via tags fallback.
    // Beginner has no experience, so more chapters are included.
    assert(bcBeginnerChapterCount >= bcTechProChapterCount,
        `Bootcamp: beginner chapters(${bcBeginnerChapterCount}) >= tech-pro chapters(${bcTechProChapterCount}) [skip logic active via fallback]`);
    // But durations should differ (tech-pro profileMultiplier = 1.0, beginner = 1.2)
    assert(bcTechPro.totalWeeks < bcBeginner.totalWeeks,
        `Bootcamp: tech-pro weeks(${bcTechPro.totalWeeks}) < beginner weeks(${bcBeginner.totalWeeks}) [profile multiplier]`);
}

// =============================
// TEST 4: totalModules COUNT
// =============================
function testTotalModulesCount() {
    section("totalModules Count Audit");

    // After hardening: totalModules = sum of all chapters across all phases
    const freePlan = generatePlan(FREE_BASE);
    const freeChapterCount = freePlan.phases.reduce((s, p) => s + p.chapters.length, 0);
    assert(freePlan.totalModules === freeChapterCount,
        `Free: totalModules=${freePlan.totalModules} === chapters=${freeChapterCount}`);
    assert(freePlan.totalModules > 0,
        `Free: totalModules is non-zero (${freePlan.totalModules})`);

    const bcPlan = generatePlan(BOOTCAMP_BASE);
    const bcChapterCount = bcPlan.phases.reduce((s, p) => s + p.chapters.length, 0);
    assert(bcPlan.totalModules === bcChapterCount,
        `Bootcamp: totalModules=${bcPlan.totalModules} === chapters=${bcChapterCount}`);
    assert(bcPlan.totalModules > 0,
        `Bootcamp: totalModules is non-zero (${bcPlan.totalModules})`);
}

// =============================
// TEST 5: AVAILABILITY FACTOR
// =============================
function testAvailabilityScaling() {
    section("Availability Factor Scaling");

    const avails = ["3-5", "5-10", "10-20", "20-30", "30-40", "full-time"];
    let prevWeeks = Infinity;
    let monotonic = true;

    for (const avail of avails) {
        const plan = generatePlan({ ...FREE_BASE, availability: avail });
        if (plan.totalWeeks > prevWeeks) {
            monotonic = false;
            console.error(`  ❌ Non-monotonic: availability="${avail}" weeks=${plan.totalWeeks} > prev=${prevWeeks}`);
        }
        // As availability increases, weeks should decrease (more hrs → faster)
        // Exception: "3-5" has factor 2.8 (slowest), "full-time" has 0.35 (fastest)
        prevWeeks = plan.totalWeeks;
    }
    // Actually the mapping goes from LEAST hours to MOST hours, so weeks should DECREASE
    assert(monotonic, "Weeks decrease monotonically as availability increases");
}

// =============================
// TEST 6: INPUT VALIDATION AUDIT
// =============================
function testInputValidation() {
    section("Input Validation Audit");

    // The engine does NOT validate input schema — it just computes.
    // Check: does it crash on weird input?
    let crashed = false;
    try {
        generatePlan({
            ...FREE_BASE,
            goal: "UNKNOWN_GOAL",
            background: "UNKNOWN_BG",
            availability: "UNKNOWN_AVAIL",
        });
    } catch {
        crashed = true;
    }
    assert(!crashed, "Engine does NOT crash on unknown enum values (graceful)");

    // Check: does unknown availability get default hoursPerWeek=15?
    const unknownAvailPlan = generatePlan({ ...FREE_BASE, availability: "UNKNOWN" });
    assert(unknownAvailPlan.hoursPerWeek === 15, `Unknown availability defaults to hoursPerWeek=15 (got ${unknownAvailPlan.hoursPerWeek})`);

    // Check: is there any runtime schema validation (zod/yup)?
    // REPORT: No schema validation found at the engine level.
    console.log("  ⚠️  FINDING: No runtime schema validation (zod/yup/joi). Engine accepts any input shape without rejection.");
    console.log("  ⚠️  FINDING: Unknown enum values are silently accepted with default multipliers. No strict enum enforcement.");
}

// =============================
// TEST 7: ORDERING STABILITY
// =============================
function testOrdering() {
    section("Ordering Stability");

    const plan = generatePlan(FREE_BASE);
    // Phases should follow the order of subjects in the syllabus data (normalized names)
    const subjectOrder = freeSyllabus.subjects.map(s => normalizeTitle(s.displayName || s.name));
    const phaseOrder = plan.phases.map(p => p.name);

    // Check that phases appear in the same order as subjects (minus skipped ones)
    let lastIdx = -1;
    let orderPreserved = true;
    for (const phaseName of phaseOrder) {
        const idx = subjectOrder.indexOf(phaseName);
        if (idx === -1) {
            console.error(`  Phase "${phaseName}" not found in subject order`);
            orderPreserved = false;
        } else if (idx < lastIdx) {
            console.error(`  Phase "${phaseName}" appears out of order (idx=${idx}, prev=${lastIdx})`);
            orderPreserved = false;
        }
        lastIdx = idx;
    }
    assert(orderPreserved, "Phase ordering matches subject definition order in syllabus");
}

// =============================
// TEST 8: SKIP MATRIX (Phase 6)
// =============================
function testSkipMatrix() {
    section("Skip Matrix (ExperienceState-driven)");

    const freeCatalogIds = new Set((freeSyllabus.chapters as any[]).map((c: any) => c.id));
    const freeSubjectIds = new Set(freeSyllabus.subjects.map((s: any) => s.id));

    // Helper: get subject IDs appearing in plan output
    const planSubjectIds = (plan: PlanResult) =>
        new Set(plan.phases.flatMap(p => p.chapters.map(c => c.subjectId)));

    // Helper: get skipped subject IDs from diagnostics
    const skippedIds = (plan: PlanResult) =>
        new Set((plan.diagnostics?.appliedSkips ?? []).map(s => s.moduleId));

    // Case 1: Skip none (all false)
    const skipNone = generatePlan({ ...FREE_BASE, experience: { ...INITIAL_EXPERIENCE } });
    testInvariants(skipNone, "Skip-Matrix: none", freeCatalogIds);
    const skipNoneIds = skippedIds(skipNone);
    assert(skipNoneIds.size === 0, `Skip none: 0 skipped subjects (got ${skipNoneIds.size})`);

    // Case 2: Skip one (python only)
    const skipOne = generatePlan({ ...FREE_BASE, experience: { ...INITIAL_EXPERIENCE, python: true } });
    testInvariants(skipOne, "Skip-Matrix: python", freeCatalogIds);
    const skipOneSubjects = planSubjectIds(skipOne);
    assert(!skipOneSubjects.has("free-python"), "Skip one (python): free-python removed");
    assert(skipOne.totalModules < skipNone.totalModules, "Skip one: fewer modules");

    // Case 3: Skip two (python + sql)
    const skipTwo = generatePlan({ ...FREE_BASE, experience: { ...INITIAL_EXPERIENCE, python: true, sql: true } });
    testInvariants(skipTwo, "Skip-Matrix: python+sql", freeCatalogIds);
    assert(skipTwo.totalModules <= skipOne.totalModules, "Skip two: fewer/equal modules than skip one");

    // Case 4: Skip many (all checked)
    const allChecked: ExperienceState = {
        python: true, sql: true, statistics: true, ml: true,
        dl: true, nlp: true, genai: true, mlops: true
    };
    const skipMany = generatePlan({ ...FREE_BASE, experience: allChecked });
    testInvariants(skipMany, "Skip-Matrix: all checked", freeCatalogIds);
    assert(skipMany.totalModules <= skipTwo.totalModules, "Skip many: fewer/equal modules than skip two");
    assert(skipMany.totalModules > 0, `Skip many: still has modules (${skipMany.totalModules}) — not everything is intro-level`);

    // Case 5: Skipped modules never appear in output
    [skipNone, skipOne, skipTwo, skipMany].forEach((plan, i) => {
        const labels = ['none', 'one', 'two', 'many'];
        const skipped = skippedIds(plan);
        const present = planSubjectIds(plan);
        const overlap = [...skipped].filter(id => present.has(id));
        assert(overlap.length === 0,
            `Skip ${labels[i]}: no skipped IDs appear in output`,
            overlap.length > 0 ? `overlap: ${overlap.join(', ')}` : undefined);
    });

    // Case 6: Unknown experience keys are safely ignored
    const withUnknown = { ...INITIAL_EXPERIENCE, FAKE_KEY: true } as any;
    let crashedOnUnknown = false;
    try {
        const planUnknown = generatePlan({ ...FREE_BASE, experience: withUnknown });
        testInvariants(planUnknown, "Skip-Matrix: unknown key", freeCatalogIds);
    } catch {
        crashedOnUnknown = true;
    }
    assert(!crashedOnUnknown, "Unknown experience keys do not crash the engine");
}

// =============================
// TEST 9: TITLE NORMALIZATION
// =============================
function testNormalization() {
    section("Title Normalization (normalizeTitle)");

    const cases: [string, string][] = [
        ["Week 3: Advanced Python", "Advanced Python"],
        ["Week 12, 13: DevOps and Deployment", "DevOps and Deployment"],
        ["Week 6, 7, 8: Math & Stats", "Math & Stats"],
        ["Week 6-8: Math & Stats for AI", "Math & Stats for AI"],
        ["Week 15-18: Deep Learning", "Deep Learning"],
        ["Week 33+: Career & Branding", "Career & Branding"],
        ["Week 19-21: NLP Specialization", "NLP Specialization"],
        ["Module 1: Python", "Python"],
        ["Module 3: Math & Statistics", "Math & Statistics"],
        ["1. Python Fundamentals", "Python Fundamentals"],
        ["2) SQL Basics", "SQL Basics"],
        ["Already Clean Title", "Already Clean Title"],
        ["  Week 1: Trimmed  ", "Trimmed"],
    ];

    cases.forEach(([input, expected]) => {
        const result = normalizeTitle(input);
        assert(result === expected, `normalizeTitle("${input}") => "${result}" === "${expected}"`);
    });
}

// =============================
// TEST 10: WEEK REFLOW
// =============================
function testWeekReflow() {
    section("Week Reflow (continuous after skips)");

    // Case A: No skips → Week 1..N continuous
    const noSkip = generatePlan(FREE_BASE);
    const noSkipLabels = noSkip.phases.map(p => p.displayLabel);
    const expectedNoSkip = noSkip.phases.map((_, i) => `Week ${i + 1}`);
    assert(
        JSON.stringify(noSkipLabels) === JSON.stringify(expectedNoSkip),
        `No skips: labels are Week 1..${noSkip.phases.length}`,
    );

    // Case B: With skips → still Week 1..M continuous (no gaps)
    const withSkips = generatePlan({ ...FREE_BASE, experience: { ...INITIAL_EXPERIENCE, python: true, sql: true } });
    const skipLabels = withSkips.phases.map(p => p.displayLabel);
    const expectedSkip = withSkips.phases.map((_, i) => `Week ${i + 1}`);
    assert(
        JSON.stringify(skipLabels) === JSON.stringify(expectedSkip),
        `With skips: labels are Week 1..${withSkips.phases.length} (continuous, no gaps)`,
    );

    // Case C: First phase always starts at Week 1
    assert(withSkips.phases[0].phaseIndex === 1, "First phase is always Week 1 even after skips");
    assert(withSkips.phases[0].displayLabel === "Week 1", "First displayLabel is always 'Week 1'");

    // Case D: Phase count decreases with skips but numbering is always dense
    assert(withSkips.phases.length < noSkip.phases.length,
        `Skips reduce phase count: ${withSkips.phases.length} < ${noSkip.phases.length}`);
    assert(withSkips.phases[withSkips.phases.length - 1].phaseIndex === withSkips.phases.length,
        `Last phaseIndex equals phase count (${withSkips.phases.length})`);

    // Case E: Bootcamp path also has continuous labels
    const bootcamp = generatePlan(BOOTCAMP_BASE);
    const bcLabels = bootcamp.phases.map(p => p.displayLabel);
    const expectedBc = bootcamp.phases.map((_, i) => `Week ${i + 1}`);
    assert(
        JSON.stringify(bcLabels) === JSON.stringify(expectedBc),
        `Bootcamp: labels are Week 1..${bootcamp.phases.length} (continuous)`,
    );
}

// =============================
// MAIN
// =============================
const freeCatalogIds = new Set((freeSyllabus.chapters as any[]).map((c: any) => c.id));
const bootcampCatalogIds = new Set((bootcampSyllabus.chapters as any[]).map((c: any) => c.id));

console.log("╔═══════════════════════════════════════╗");
console.log("║   VERIFICATION SUITE — FULL AUDIT     ║");
console.log("╚═══════════════════════════════════════╝");

testInvariants(generatePlan(FREE_BASE), "Free Beginner", freeCatalogIds);
testInvariants(generatePlan(BOOTCAMP_BASE), "Bootcamp Beginner", bootcampCatalogIds);
testInvariants(generatePlan({ ...FREE_BASE, background: "tech-pro" }), "Free Tech-Pro", freeCatalogIds);
testDeterminism();
testSkipLogic();
testTotalModulesCount();
testAvailabilityScaling();
testInputValidation();
testOrdering();
testSkipMatrix();
testNormalization();
testWeekReflow();

console.log("\n═══════════════════════════════════════");
console.log(`  RESULTS: ${passed} passed, ${failed} failed`);
if (failMessages.length > 0) {
    console.log("\n  FAILURES:");
    failMessages.forEach(m => console.log(`    • ${m}`));
}
console.log("═══════════════════════════════════════\n");
process.exit(failed > 0 ? 1 : 0);
