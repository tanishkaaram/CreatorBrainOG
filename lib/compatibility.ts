// ─────────────────────────────────────────────────────────────────────────────
// CreatorBrainOG Compatibility Scoring Algorithm
// 
// The score measures how well a content trend "fits" a specific creator.
// Formula:
//   score = (
//     Trend_Popularity_Score     × 0.25 +   // How big is this trend?
//     Niche_Relevance_Score      × 0.30 +   // Does it match the creator's niche?
//     Style_Match_Score          × 0.25 +   // Does it match their content style/archetype?
//     Past_Performance_Similarity × 0.20    // Have similar posts worked for them before?
//   ) × 100
// ─────────────────────────────────────────────────────────────────────────────

import { CreatorDNA, Trend, Suggestion, CompatibilityLevel, CompatibilityBreakdown } from '@/types';

// ─── Weight Constants (must sum to 1.0) ──────────────────────────────────────
const WEIGHTS = {
    trendPopularity: 0.25,     // How trending/viral is this content format?
    nicheRelevance: 0.30,      // Is the trend in the creator's niche?
    styleMatch: 0.25,          // Does the format match the creator's archetype/style?
    pastPerformance: 0.20,     // Have similar formats/durations worked for this creator?
};

// ─── Archetype → Style Affinity Map ─────────────────────────────────────────
// Maps creator archetypes to content formats they naturally excel at
const ARCHETYPE_FORMAT_AFFINITY: Record<string, string[]> = {
    'The Storyteller': ['Reel', 'Story'],
    'The Educator': ['Carousel', 'Reel'],
    'The Entertainer': ['Reel', 'Story'],
    'The Inspirer': ['Reel', 'Carousel'],
    'The Trendsetter': ['Reel', 'Story'],
    'The Community Builder': ['Carousel', 'Story', 'Image'],
    'The Expert': ['Carousel', 'Reel'],
    'The Humorist': ['Reel', 'Story'],
    'The Visual Artist': ['Image', 'Reel', 'Carousel'],
    'The Authentic Voice': ['Reel', 'Story'],
};

// ─── Score Component: Trend Popularity (0-100) ───────────────────────────────
// Directly uses the trend's popularity_score (already 0-100)
function scoreTrendPopularity(trend: Trend): number {
    return trend.popularity_score;
}

// ─── Score Component: Niche Relevance (0-100) ────────────────────────────────
// 100 if exact niche match, 60 if adjacent, 30 if unrelated
function scoreNicheRelevance(creatorNiche: string, trendNiche: string): number {
    if (creatorNiche === trendNiche) return 100;

    // Define adjacent niches (close content categories)
    const adjacentMap: Record<string, string[]> = {
        music: ['lifestyle', 'comedy', 'fashion'],
        education: ['tech', 'lifestyle', 'small_business'],
        fitness: ['food', 'lifestyle', 'small_business'],
        food: ['lifestyle', 'small_business', 'bharat_regional'],
        small_business: ['education', 'food', 'fashion', 'bharat_regional'],
        lifestyle: ['fashion', 'fitness', 'comedy', 'music'],
        comedy: ['music', 'lifestyle', 'bharat_regional'],
        tech: ['education', 'small_business'],
        fashion: ['lifestyle', 'small_business', 'fitness'],
        bharat_regional: ['food', 'small_business', 'comedy'],
    };

    const adjacent = adjacentMap[creatorNiche] || [];
    if (adjacent.includes(trendNiche)) return 60;
    return 30;
}

// ─── Score Component: Style Match (0-100) ────────────────────────────────────
// Compares the trend's format_type against the creator's archetype preferences
function scoreStyleMatch(archetype: string, suggestedFormat: string): number {
    const preferredFormats = ARCHETYPE_FORMAT_AFFINITY[archetype] || [];
    if (preferredFormats[0] === suggestedFormat) return 100; // perfect match
    if (preferredFormats.includes(suggestedFormat)) return 75;  // secondary match
    return 40; // not a natural fit
}

// ─── Score Component: Past Performance Similarity (0-100) ────────────────────
// If the trend's format/duration matches the creator's best performing category
function scorePastPerformance(dna: CreatorDNA, trend: Trend): number {
    let score = 50; // baseline

    // Does the trend format match what performs best for this creator?
    const formatMap: Record<string, string[]> = {
        REEL: ['Reel'],
        CAROUSEL_ALBUM: ['Carousel'],
        IMAGE: ['Image'],
    };
    const bestFormats = formatMap[dna.best_post_type] || [];
    if (bestFormats.includes(trend.format_type)) score += 30;

    // Does the trend's duration match the creator's ideal duration?
    if (trend.ideal_duration === dna.ideal_duration) score += 20;
    else if (trend.ideal_duration !== 'N/A') score += 5;

    return Math.min(100, score);
}

// ─── Color-coded Level Based on Score ────────────────────────────────────────
export function getCompatibilityLevel(score: number): CompatibilityLevel {
    if (score >= 80) return 'high';      // 🔥 High Fit
    if (score >= 60) return 'good';      // ✅ Good Fit
    if (score >= 40) return 'moderate';  // ⚠️ Moderate Fit
    return 'low';                         // ❌ Low Fit
}

export function getCompatibilityLabel(level: CompatibilityLevel): string {
    const labels: Record<CompatibilityLevel, string> = {
        high: '🔥 High Fit',
        good: '✅ Good Fit',
        moderate: '⚠️ Moderate Fit',
        low: '❌ Low Fit',
    };
    return labels[level];
}

export function getCompatibilityColor(level: CompatibilityLevel): string {
    const colors: Record<CompatibilityLevel, string> = {
        high: '#F59E0B',    // amber
        good: '#10B981',    // green
        moderate: '#F97316', // orange
        low: '#EF4444',     // red
    };
    return colors[level];
}

// ─── Main Scoring Function ────────────────────────────────────────────────────
export function calculateCompatibilityScore(
    dna: CreatorDNA,
    trend: Trend,
    suggestedFormat: string
): { score: number; level: CompatibilityLevel; breakdown: CompatibilityBreakdown } {
    // Calculate each component
    const trendPopularity = scoreTrendPopularity(trend);
    const nicheRelevance = scoreNicheRelevance(dna.archetype ? dna.archetype : trend.niche, trend.niche);
    const styleMatch = scoreStyleMatch(dna.archetype, suggestedFormat);
    const pastPerformance = scorePastPerformance(dna, trend);

    // Apply weighted formula
    const weightedScore =
        trendPopularity * WEIGHTS.trendPopularity +
        nicheRelevance * WEIGHTS.nicheRelevance +
        styleMatch * WEIGHTS.styleMatch +
        pastPerformance * WEIGHTS.pastPerformance;

    const finalScore = Math.round(Math.min(100, Math.max(0, weightedScore)));
    const level = getCompatibilityLevel(finalScore);

    return {
        score: finalScore,
        level,
        breakdown: {
            trend_popularity: Math.round(trendPopularity),
            niche_relevance: Math.round(nicheRelevance),
            style_match: Math.round(styleMatch),
            past_performance_similarity: Math.round(pastPerformance),
        },
    };
}

// ─── Attach Scores to Suggestions ────────────────────────────────────────────
export function attachCompatibilityScores(
    suggestions: Partial<Suggestion>[],
    dna: CreatorDNA,
    trends: import('@/types').Trend[]
): Suggestion[] {
    return suggestions.map((s, i) => {
        const trend = trends[i % trends.length]; // pair suggestion to a trend
        const { score, level, breakdown } = calculateCompatibilityScore(
            dna,
            trend,
            s.format || 'Reel'
        );

        return {
            id: `sug_${Date.now()}_${i}`,
            title: s.title || `Content Idea ${i + 1}`,
            concept: s.concept || '',
            hook: s.hook || '',
            format: s.format || 'Reel',
            duration: s.duration,
            compatibility_score: score,
            compatibility_level: level,
            compatibility_breakdown: breakdown,
            hashtags: s.hashtags || [],
            boost_prediction: s.boost_prediction || '+15% above your average',
            trend_reference: trend.name,
        } as Suggestion;
    });
}
