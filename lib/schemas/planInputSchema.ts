import { z } from "zod";

export const PlanInputSchema = z.object({
    learnerType: z.string().min(1),
    background: z.string().min(1),
    goal: z.string().min(1),
    careerOutcome: z.string().min(1),
    availability: z.string().min(1),
    learningPreference: z.string().min(1),
    realWorldApp: z.union([z.array(z.string()), z.string()]),
    experience: z.object({
        python: z.boolean(),
        sql: z.boolean(),
        statistics: z.boolean(),
        ml: z.boolean(),
        dl: z.boolean(),
        nlp: z.boolean(),
        genai: z.boolean(),
        mlops: z.boolean(),
    }),
    syllabusChapters: z.array(z.any()).min(1),
    syllabusSubjects: z.array(z.any()),
    hasPythonBasics: z.boolean().optional(),
    hasgitBasics: z.boolean().optional(),
    hasDSABasics: z.boolean().optional(),
    hasAIIntro: z.boolean().optional(),
});
