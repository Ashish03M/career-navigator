import { Chapter } from "./bootcampData";

/** @deprecated Use Chapter instead */
export type { RoadmapItem } from "./bootcampData";

export type SubjectCategory = 'foundation' | 'core-ai' | 'specialization' | 'career';

export type Subject = {
    id: string;
    name: string;
    displayName: string;
    color: string;
    category: SubjectCategory;
    chapterIds: string[];
    tags?: { category: string; level: string };
};

export type SyllabusData = {
    subjects: Subject[];
    chapters: Chapter[];
};
