/**
 * Hardened PDF Smoke Test
 * Validates: file exists, non-zero size, valid PDF header, generates from real plan data
 *
 * Run: npx tsx scripts/test-pdf-hardened.ts
 */
import React from "react";
import { pdf } from "@react-pdf/renderer";
import fs from "fs";
import path from "path";
import { type PdfInput, CareerRoadmapPdf } from "../lib/pdf/templates/CareerRoadmapPdf";
import { generatePlan } from "../lib/generatePlan";
import { INITIAL_EXPERIENCE, type PlanInput } from "../lib/types";
import { ensureFontsRegistered } from "../lib/pdf/registerFonts";
import freeSyllabus from "../data/free_syllabus.json";
import bootcampSyllabus from "../data/syllabus_v3.json";

let passed = 0;
let failed = 0;
const failMessages: string[] = [];

function assert(condition: boolean, label: string, detail?: string) {
    if (condition) {
        passed++;
        console.log(`  PASS: ${label}`);
    } else {
        failed++;
        const msg = detail ? `${label} — ${detail}` : label;
        failMessages.push(msg);
        console.error(`  FAIL: ${label}${detail ? ` (${detail})` : ""}`);
    }
}

const OUT_DIR = path.join(process.cwd(), ".test-pdf-output");

async function generateAndVerify(
    label: string,
    input: PdfInput,
    filename: string
): Promise<void> {
    const filepath = path.join(OUT_DIR, filename);

    // Generate
    const doc = React.createElement(CareerRoadmapPdf, input);
    const blob = await pdf(doc).toBlob();
    const buffer = Buffer.from(await blob.arrayBuffer());

    // Write
    fs.writeFileSync(filepath, buffer);

    // Verify: exists
    assert(fs.existsSync(filepath), `[${label}] file exists`);

    // Verify: non-zero size
    const stats = fs.statSync(filepath);
    assert(stats.size > 0, `[${label}] file is non-zero (${(stats.size / 1024).toFixed(1)} KB)`);

    // Verify: minimum reasonable size (a blank PDF is ~800 bytes, a real one should be >2KB)
    assert(stats.size > 2000, `[${label}] file size > 2KB (got ${stats.size})`);

    // Verify: valid PDF header (%PDF-)
    const header = buffer.subarray(0, 5).toString("ascii");
    assert(header === "%PDF-", `[${label}] valid PDF header`, `got "${header}"`);

    // Verify: PDF EOF marker (%%EOF should appear near end)
    const tail = buffer.subarray(buffer.length - 100).toString("ascii");
    assert(tail.includes("%%EOF"), `[${label}] has PDF EOF marker`);
}

async function run() {
    console.log("=== HARDENED PDF SMOKE TEST ===\n");

    // Register fonts before generating any PDFs
    ensureFontsRegistered();

    // Create output dir
    if (!fs.existsSync(OUT_DIR)) {
        fs.mkdirSync(OUT_DIR, { recursive: true });
    }

    const mockUser = { name: "Test User", email: "test@example.com" };
    const mockMeta = {
        targetRoleLabel: "Data Scientist",
        durationLabel: "6 Months",
        weeklyHoursLabel: "15h/week",
        sourceLabel: "100% Free Resources",
    };

    // TEST 1: Generate from real free syllabus plan
    console.log("--- Test 1: Free syllabus plan ---");
    const freePlan = generatePlan({
        learnerType: "free",
        goal: "fullstack-ds",
        background: "beginner",
        careerOutcome: "job-search",
        learningPreference: "practical",
        availability: "10-20",
        realWorldApp: "provided",
        experience: INITIAL_EXPERIENCE,
        syllabusChapters: freeSyllabus.chapters as any,
        syllabusSubjects: freeSyllabus.subjects as any,
    });

    await generateAndVerify("free-beginner", {
        user: mockUser,
        plan: freePlan,
        meta: mockMeta,
    }, "test-free-beginner.pdf");

    // TEST 2: Generate from real bootcamp syllabus plan (moderate availability to avoid tiny durations)
    console.log("\n--- Test 2: Bootcamp syllabus plan ---");
    const bcPlan = generatePlan({
        learnerType: "bootcamp",
        goal: "ml-engineer",
        background: "software-dev",
        careerOutcome: "job-search",
        learningPreference: "practical",
        availability: "10-20",
        realWorldApp: "job-prep",
        experience: { ...INITIAL_EXPERIENCE, python: true },
        syllabusChapters: bootcampSyllabus.chapters as any,
        syllabusSubjects: bootcampSyllabus.subjects as any,
    });

    try {
        await generateAndVerify("bc-softwaredev", {
            user: { name: "Jane Developer", email: "jane@dev.com" },
            plan: bcPlan,
            meta: { ...mockMeta, targetRoleLabel: "ML Engineer", durationLabel: `${bcPlan.estimatedMonths} months`, sourceLabel: "Codebasics Bootcamp" },
        }, "test-bc-softwaredev.pdf");
    } catch (err) {
        // @react-pdf can crash on very large plans — record as failure but don't abort
        assert(false, "[bc-softwaredev] PDF generation", `@react-pdf crash: ${err instanceof Error ? err.message : String(err)}`);
    }

    // TEST 3: Minimal plan (1 phase, 1 chapter) — edge case
    console.log("\n--- Test 3: Minimal plan ---");
    const minPlan = generatePlan({
        learnerType: "free",
        goal: "genai-specialist",
        background: "working-pro",
        careerOutcome: "upskill",
        learningPreference: "fast-track",
        availability: "full-time",
        realWorldApp: "provided",
        experience: ALL_KNOWN_EXP(),
        syllabusChapters: freeSyllabus.chapters as any,
        syllabusSubjects: freeSyllabus.subjects as any,
    });

    try {
        await generateAndVerify("minimal", {
            user: { name: "A", email: "a@b.com" },
            plan: minPlan,
            meta: { ...mockMeta, targetRoleLabel: "GenAI Specialist" },
        }, "test-minimal.pdf");
    } catch (err) {
        assert(false, "[minimal] PDF generation", `@react-pdf crash: ${err instanceof Error ? err.message : String(err)}`);
    }

    // TEST 4: Large plan (all modules, beginner, slow pace)
    console.log("\n--- Test 4: Large plan ---");
    const largePlan = generatePlan({
        learnerType: "free",
        goal: "fullstack-ds",
        background: "beginner",
        careerOutcome: "job-search",
        learningPreference: "comprehensive",
        availability: "3-5",
        realWorldApp: "job-prep",
        experience: INITIAL_EXPERIENCE,
        syllabusChapters: freeSyllabus.chapters as any,
        syllabusSubjects: freeSyllabus.subjects as any,
    });

    try {
        await generateAndVerify("large-slow", {
            user: { name: "Beginner Learner With A Very Long Name", email: "longname@example.com" },
            plan: largePlan,
            meta: { ...mockMeta, durationLabel: `${largePlan.estimatedMonths} months` },
        }, "test-large-slow.pdf");
    } catch (err) {
        assert(false, "[large-slow] PDF generation", `@react-pdf crash: ${err instanceof Error ? err.message : String(err)}`);
    }

    // TEST 5: Data Analyst plan PDF
    console.log("\n--- Test 5: Data Analyst plan ---");
    const daPlan = generatePlan({
        learnerType: "free",
        goal: "data-analyst",
        background: "beginner",
        careerOutcome: "job-search",
        learningPreference: "balanced",
        availability: "10-20",
        realWorldApp: "provided",
        experience: INITIAL_EXPERIENCE,
        syllabusChapters: freeSyllabus.chapters as any,
        syllabusSubjects: freeSyllabus.subjects as any,
    });

    try {
        await generateAndVerify("da-beginner", {
            user: { name: "DA Learner", email: "da@example.com" },
            plan: daPlan,
            meta: { ...mockMeta, targetRoleLabel: "Data Analyst", durationLabel: `${daPlan.estimatedMonths} months` },
        }, "test-da-beginner.pdf");
    } catch (err) {
        assert(false, "[da-beginner] PDF generation", `@react-pdf crash: ${err instanceof Error ? err.message : String(err)}`);
    }

    // TEST 6: Data Engineer plan PDF
    console.log("\n--- Test 6: Data Engineer plan ---");
    const dePlan = generatePlan({
        learnerType: "free",
        goal: "data-engineer",
        background: "software-dev",
        careerOutcome: "job-search",
        learningPreference: "practical",
        availability: "10-20",
        realWorldApp: "job-prep",
        experience: { ...INITIAL_EXPERIENCE, python: true, sql: true },
        syllabusChapters: freeSyllabus.chapters as any,
        syllabusSubjects: freeSyllabus.subjects as any,
    });

    try {
        await generateAndVerify("de-softwaredev", {
            user: { name: "DE Learner", email: "de@example.com" },
            plan: dePlan,
            meta: { ...mockMeta, targetRoleLabel: "Data Engineer", durationLabel: `${dePlan.estimatedMonths} months` },
        }, "test-de-softwaredev.pdf");
    } catch (err) {
        assert(false, "[de-softwaredev] PDF generation", `@react-pdf crash: ${err instanceof Error ? err.message : String(err)}`);
    }

    // Cleanup
    console.log(`\n--- Cleanup ---`);
    console.log(`  Output files in: ${OUT_DIR}`);

    // Summary
    console.log(`\n=== RESULTS: ${passed} passed, ${failed} failed ===`);
    if (failMessages.length > 0) {
        console.log("\nFAILURES:");
        failMessages.forEach(m => console.log(`  - ${m}`));
    }
    process.exit(failed > 0 ? 1 : 0);
}

function ALL_KNOWN_EXP() {
    return {
        python: true, sql: true, statistics: true, ml: true,
        dl: true, nlp: true, genai: true, mlops: true,
    };
}

run().catch(err => {
    console.error("Fatal error:", err);
    process.exit(1);
});
