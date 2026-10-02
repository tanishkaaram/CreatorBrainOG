// ─────────────────────────────────────────────────────────────────────────────
// Gemini AI wrapper (formerly Groq) for CreatorBrainOG
// Re-exports functions from lib/gemini.ts using Gemini 1.5 Flash.
// ─────────────────────────────────────────────────────────────────────────────

import {
    detectNicheWithGemini,
    buildCreatorDNAWithGemini,
    generateSuggestionsWithGemini
} from './gemini';

export const detectNicheWithGroq = detectNicheWithGemini;
export const buildCreatorDNAWithGroq = buildCreatorDNAWithGemini;
export const generateSuggestionsWithGroq = generateSuggestionsWithGemini;
