/**
 * Branded PDF Generator — Public API.
 *
 * This file re-exports the premium template and types.
 * All rendering logic lives in templates/CareerRoadmapPdf.tsx.
 */

export {
    generateBrandedPdf,
    type PdfInput,
    type PdfMeta,
    type PdfUserInfo,
    type PdfPersonalization,
} from "./templates/CareerRoadmapPdf";
