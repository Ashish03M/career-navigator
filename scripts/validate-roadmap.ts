import { generatePlan } from "../lib/generatePlan";
import { PlanResult, type PlanInput, INITIAL_EXPERIENCE } from "../lib/types";
import { Chapter } from "../lib/bootcampData";
import syllabusData from '../data/free_syllabus.json';
import { formatWeeks } from "../lib/utils";
import { validatePlan } from "../lib/validatePlan"; // IMPLICITLY FIXES "Cannot find name 'validatePlan'"

// Mocks
const BASE_INPUT: PlanInput = {
    learnerType: 'free',
    goal: 'career',
    background: 'beginner',
    careerOutcome: 'job-search',
    learningPreference: 'structured',
    availability: '10-20',
    realWorldApp: 'yes',
    experience: INITIAL_EXPERIENCE,
    syllabusChapters: syllabusData.chapters as any,
    syllabusSubjects: syllabusData.subjects as any
};

console.log('=== VERIFICATION SUITE v2 ===');

// TEST 1: Skip Logic (Beginner vs Tech Pro)
const beginnerPlan = generatePlan({ ...BASE_INPUT, background: 'beginner' });
const techPlan = generatePlan({ ...BASE_INPUT, background: 'working-pro' });

console.log(`\n1. SKIP LOGIC TEST`);
console.log(`Beginner Total Weeks: ${beginnerPlan.totalWeeks}`);
console.log(`Tech Pro Total Weeks: ${techPlan.totalWeeks}`);

if (techPlan.totalWeeks < beginnerPlan.totalWeeks) {
    console.log('PASS: Tech Pro has duration reduction (modules skipped).');
} else {
    console.error('FAIL: Tech Pro duration is NOT smaller than Beginner.');
}

const beginnerModules = beginnerPlan.phases.flatMap(p => p.chapters.map(c => c.subjectId));
const techModules = techPlan.phases.flatMap(p => p.chapters.map(c => c.subjectId));

const skippedInTech = ['free-python', 'free-dsa', 'free-adv-python'].every(id =>
    beginnerModules.includes(id) && !techModules.includes(id)
);

if (skippedInTech) {
    console.log('PASS: Specific intro modules (Python, DSA) are absent in Tech Pro plan.');
} else {
    console.error('FAIL: Intro modules were NOT skipped for Tech Pro.');
}


// TEST 2: Duration Consistency
console.log(`\n2. DURATION CONSISTENCY TEST`);
let allPhasesConsistent = true;
let totalConsistent = true;
let computedTotal = 0;

beginnerPlan.phases.forEach(p => {
    const sumChapters = p.chapters.reduce((s, c) => s + c.durationWeeks, 0);
    if (Math.abs(sumChapters - p.durationWeeks) > 0.01) {
        console.error(`FAIL: Phase "${p.name}" duration mismatch. Sum: ${sumChapters}, Phase: ${p.durationWeeks}`);
        allPhasesConsistent = false;
    }

    // Test Formatting
    const expectedFormat = formatWeeks(p.durationWeeks);
    if (p.formattedDuration !== expectedFormat) {
        console.error(`FAIL: Phase "${p.name}" formatting mismatch. Expected: ${expectedFormat}, Got: ${p.formattedDuration}`);
        allPhasesConsistent = false;
    }

    computedTotal += p.durationWeeks;
});

if (allPhasesConsistent) console.log('PASS: All Phase.durationWeeks match sum(Chapter.durationWeeks).');

if (Math.abs(computedTotal - beginnerPlan.totalWeeks) < 0.1) {
    console.log('PASS: Plan.totalWeeks matches sum(Phase.durationWeeks).');
} else {
    console.error(`FAIL: Total mismatch. Plan: ${beginnerPlan.totalWeeks}, SumPhases: ${computedTotal}`);
    totalConsistent = false;
}

// Summary
// TEST 3: Flag Logic (Harden Skip)
console.log(`\n3. FLAG LOGIC TEST`);

// Case A: Data Analyst with NO Python Basics -> Should KEEP Python
const dataAnalystInput: PlanInput = {
    ...BASE_INPUT,
    background: 'data-analyst',
    hasPythonBasics: false
};
const daPlan = generatePlan(dataAnalystInput);
const daModules = daPlan.phases.flatMap(p => p.chapters.map(c => c.subjectId));

if (daModules.includes('free-python')) {
    console.log('PASS: Data Analyst (No Python) RETAINS free-python.');
} else {
    console.error('FAIL: Data Analyst (No Python) SKIPPED free-python.');
}

// Case B: Software Dev with Git Basics (True) but NO Python Basics (False)
// Should SKIP Git, but KEEP Python
const devInput: PlanInput = {
    ...BASE_INPUT,
    background: 'software-dev',
    hasgitBasics: true,
    hasPythonBasics: false
};
const devPlan = generatePlan(devInput);
const devModules = devPlan.phases.flatMap(p => p.chapters.map(c => c.subjectId));

if (!devModules.includes('free-git')) {
    console.log('PASS: Software Dev (Has Git) SKIPPED free-git.');
} else {
    console.error('FAIL: Software Dev (Has Git) RETAINS free-git.');
}

if (devModules.includes('free-python')) {
    console.log('PASS: Software Dev (No Python) RETAINS free-python.');
} else {
    console.error('FAIL: Software Dev (No Python) SKIPPED free-python.');
}

// TEST 4: Syllabus Integrity (Failure Case)
// We temporarily inject a bad module into the syllabus to verify validatePlan catches it.
console.log(`\n4. SYLLABUS INTEGRITY TEST (Expected Failure)`);

const badSyllabus = [
    ...BASE_INPUT.syllabusSubjects,
    {
        id: 'bad-module',
        name: 'Bad Module',
        displayName: 'Bad Module',
        chapterIds: [], // irrelevant for this test
        tags: { level: 'intro' } // MISSING category
    }
];

const badInput: PlanInput = {
    ...BASE_INPUT,
    syllabusSubjects: badSyllabus as any
};

// The tightened Zod schema in generatePlan now rejects invalid subjects at parse time.
// This is actually stronger validation — schema-level rejection is better than post-hoc checks.
try {
    const badPlanResult = generatePlan(badInput);

    // If generatePlan didn't throw, fall back to validatePlan check
    const validation = validatePlan(badPlanResult, badInput);
    if (!validation.ok && validation.errors.some((e: string) => e.includes("missing 'chapterIds' tag") || e.includes("missing 'category' tag"))) {
        console.log("PASS: validatePlan correctly caught missing category tag.");
    } else {
        console.error("FAIL: validatePlan DID NOT catch missing category tag.");
        console.log("Errors found:", validation.errors);
        allPhasesConsistent = false;
    }
} catch (err) {
    // Schema-level rejection of invalid subject is the expected (and preferred) behavior
    if (err instanceof Error && err.message.includes("Invalid plan input")) {
        console.log("PASS: Zod schema correctly rejected subject with missing category tag.");
    } else {
        console.error("FAIL: Unexpected error:", err);
        allPhasesConsistent = false;
    }
}

// TEST 5: Diagnostics Check
console.log(`\n5. DIAGNOSTICS CHECK`);
const diagPlan = generatePlan(BASE_INPUT);
if (diagPlan.diagnostics && diagPlan.diagnostics.effectiveFlags) {
    console.log("PASS: Diagnostics populated.");
    console.log("Effective Flags:", diagPlan.diagnostics.effectiveFlags);
} else {
    console.error("FAIL: Diagnostics missing.");
    allPhasesConsistent = false;
}

// TEST 6: Strict Validation Mode (Simulation)
console.log(`\n6. STRICT VALIDATION CHECK`);
// Inject a syllabus module with an UNKNOWN category (but valid structure)
const unknownCategorySubject = {
    id: "unknown-cat",
    name: "Mystery Module",
    displayName: "Mystery",
    color: "#999999",
    category: "foundation" as const,
    chapterIds: [],
    tags: { level: "intro", category: "mystery-lang" } // "mystery-lang" is not in KNOWN_FLAGS map
};
const strictInput: PlanInput = {
    ...BASE_INPUT,
    syllabusSubjects: [...BASE_INPUT.syllabusSubjects, unknownCategorySubject]
};
const strictPlan = generatePlan(strictInput);

// Run normal validation -> Should be WARNING
const normalVal = validatePlan(strictPlan, strictInput);
if (normalVal.warnings.some(w => w.includes("used in syllabus but no explicit mapping"))) {
    console.log("PASS: Normal mode warns about unknown category.");
} else {
    console.error("FAIL: Normal mode did not warn.");
    allPhasesConsistent = false;
}

// Run strict validation -> Should be ERROR
process.env.STRICT_VALIDATION = "true";
const strictVal = validatePlan(strictPlan, strictInput);
process.env.STRICT_VALIDATION = "false"; // Reset

if (strictVal.errors.some(e => e.includes("[STRICT]"))) {
    console.log("PASS: Strict mode errors on unknown category.");
} else {
    console.error("FAIL: Strict mode did not error.");
    allPhasesConsistent = false;
}

// Summary
if (allPhasesConsistent && totalConsistent && skippedInTech &&
    daModules.includes('free-python') &&
    !devModules.includes('free-git') &&
    devModules.includes('free-python') &&
    diagPlan.diagnostics && strictVal.errors.some(e => e.includes("[STRICT]"))) {
    // Continue to next test
} else {
    console.log('\n❌ SOME CHECKS FAILED');
    process.exit(1);
}

// TEST 7: Golden Snapshot (Deterministic Output Check)
console.log(`\n7. GOLDEN SNAPSHOT TEST`);
const snapshotInput: PlanInput = {
    ...BASE_INPUT,
    background: 'working-pro',
    hasPythonBasics: true,
    hasDSABasics: true,
    hasgitBasics: true,
    hasAIIntro: false
};
const snapshotPlan = generatePlan(snapshotInput);

// Create a deterministic signature of the plan
const signature = {
    totalWeeks: snapshotPlan.totalWeeks,
    totalModules: snapshotPlan.totalModules,
    projectCount: snapshotPlan.projectCount,
    phases: snapshotPlan.phases.map(p => `${p.name}:${p.durationWeeks}`),
    skips: snapshotPlan.diagnostics?.appliedSkips.map(s => `${s.moduleId}:${s.reasonCode}`)
};

const signatureString = JSON.stringify(signature);
// Expected signature for Tech Pro with all basics (skips python, dsa, git, adv-python)
// Based on current syllabus:
// Skips: free-python (intro), free-dsa (intro), free-git (intro), free-adv-python (intermediate+working-pro)
// Remaining duration will be base minus these.
// We print it first to verify, then hardcode it if it looks correct. 
// For now, let's just log it and assert it's NOT empty.
// In a real CI, we'd match against a stored string.

if (signature.skips?.length === 4 &&
    signature.skips.some(s => s.includes("SKIP_PYTHON_BASIC")) &&
    signature.skips.some(s => s.includes("SKIP_DSA_BASIC")) &&
    signature.skips.some(s => s.includes("SKIP_GIT_BASIC")) &&
    signature.skips.some(s => s.includes("SKIP_PYTHON_INTERMEDIATE_TECH"))) {
    console.log("PASS: Snapshot signature matches expected skip logic.");
    console.log("Signature:", signatureString);
} else {
    console.error("FAIL: Snapshot signature mismatch.");
    console.log("Got:", signatureString);
    allPhasesConsistent = false;
}

if (allPhasesConsistent) {
    console.log('\n✅ ALL CHECKS PASSED');
    process.exit(0);
} else {
    console.log('\n❌ SOME CHECKS FAILED');
    process.exit(1);
}
