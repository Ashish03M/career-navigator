
import { generatePlan } from "./lib/generatePlan";
import { INITIAL_EXPERIENCE, type PlanInput } from "./lib/types";
import syllabusData from './data/free_syllabus.json';

const TEST_CASES = [
    // 1. Beginner, 10-20h (Baseline)
    { learnerType: 'free', background: 'beginner', availability: '10-20', label: '6-8 months' },
    // 2. Beginner, 5-10h (Should be longer)
    { learnerType: 'free', background: 'beginner', availability: '5-10', label: '8-12 months' },
    // 3. Tech Pro, 10-20h (Should be faster)
    { learnerType: 'bootcamp', background: 'tech-pro', availability: '10-20', label: '4-6 months' },
    // 4. Full Time, Beginner (Should be fastest for beginner)
    { learnerType: 'free', background: 'beginner', availability: 'full-time', label: '3-4 months' }
];

console.log('Learner | Background | Avail | Label | Est. Months | Weeks | Proj | Intern');
console.log('-------------------------------------------------------------------------');

TEST_CASES.forEach(test => {
    const input: PlanInput = {
        learnerType: test.learnerType,
        goal: 'career',
        background: test.background,
        careerOutcome: 'job-search',
        learningPreference: 'structured',
        availability: test.availability,
        realWorldApp: ['own-project'],
        experience: INITIAL_EXPERIENCE,
        syllabusChapters: syllabusData.chapters as any,
        syllabusSubjects: syllabusData.subjects as any
    };

    const plan = generatePlan(input);

    console.log(
        `${test.learnerType.padEnd(8)} | ` +
        `${test.background.padEnd(10)} | ` +
        `${test.availability.padEnd(5)} | ` +
        `${test.label.padEnd(11)} | ` +
        `${plan.estimatedMonths.toString().padEnd(11)} | ` +
        `${plan.totalWeeks.toString().padEnd(5)} | ` +
        `${plan.projectCount}    | ` +
        `${plan.internshipCount}`
    );
});
