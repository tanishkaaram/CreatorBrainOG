// ─────────────────────────────────────────────────────────────────────────────
// CreatorBrainOG TypeScript Type Definitions
// ─────────────────────────────────────────────────────────────────────────────

export type NicheType =
    | 'Singing/Music'
    | 'Dance'
    | 'Fitness'
    | 'Food'
    | 'Education'
    | 'Comedy'
    | 'Lifestyle'
    | 'Fashion'
    | 'Travel'
    | 'Business'
    | 'Gaming'
    | 'Art'
    | 'Motivation'
    | 'Regional/Bharat content'
    | 'pending';

export type PostType = 'REEL' | 'CAROUSEL_ALBUM' | 'IMAGE';

export type FormatType = 'Reel' | 'Carousel' | 'Story' | 'Image';

export type ArchetypeType =
    | 'The Storyteller'
    | 'The Educator'
    | 'The Entertainer'
    | 'The Inspirer'
    | 'The Trendsetter'
    | 'The Community Builder'
    | 'The Expert'
    | 'The Humorist'
    | 'The Visual Artist'
    | 'The Authentic Voice';

export type CompatibilityLevel = 'high' | 'good' | 'moderate' | 'low';

export type ReelDurationBucket = '0-15s' | '15-30s' | '30-60s' | '60s+';

// ─── Post ────────────────────────────────────────────────────────────────────

export interface Post {
    id: string;
    type: PostType;
    timestamp: string;           // ISO 8601
    likes: number;
    comments: number;
    views?: number;              // Reels only
    video_views?: number;        // Alias for views for compatibility
    saves?: number;
    reach?: number;
    impressions?: number;
    caption: string;
    hashtags?: string[];
    duration?: number;           // seconds, Reels only
    thumbnail?: string;          // URL
    engagement_rate?: number;    // calculated: (likes+comments+saves)/followers * 100
}

// ─── Creator DNA ─────────────────────────────────────────────────────────────

export interface RadarScores {
    entertainment: number;  // 0-100
    education: number;      // 0-100
    inspiration: number;    // 0-100
    relatability: number;   // 0-100
}

export interface CreatorDNA {
    archetype: string;             // Broadened from fixed list
    detected_niche: string;
    confidence: number;
    strengths: string[];          // top 3
    weaknesses: string[];         // top 2
    ideal_duration: ReelDurationBucket;
    best_time: string;            // e.g. "Tuesday 7–9 PM"
    engagement_rate: number;      // creator's average %
    niche_avg_engagement: number; // benchmark %
    radar_scores: RadarScores;
    top_themes: string[];         // extracted by GPT
    consistency_score: number;    // 0-100
    best_post_type: PostType;
}

// ─── Creator Profile ─────────────────────────────────────────────────────────

export interface CreatorProfile {
    id: string;
    instagram_id?: string;
    username: string;
    niche: NicheType;
    follower_count: number;
    following_count?: number;
    bio?: string;
    profile_picture?: string;
    posts: Post[];
    dna?: CreatorDNA;
    is_demo: boolean;
    bharat_mode: boolean;
    created_at: string;
    last_analyzed?: string;
}

// ─── Suggestion ─────────────────────────────────────────────────────────────

export interface CompatibilityBreakdown {
    trend_popularity: number;      // 0-100 (25% weight)
    niche_relevance: number;       // 0-100 (30% weight)
    style_match: number;           // 0-100 (25% weight)
    past_performance_similarity: number; // 0-100 (20% weight)
}

export interface Suggestion {
    id: string;
    title: string;
    concept: string;              // why it fits this creator's DNA
    hook: string;                 // suggested caption first line only
    format: FormatType;
    why_it_fits: string;
    execution_tips: string;
    duration?: string;            // e.g. "15-30s"
    compatibility_score: number;  // 0-100
    compatibility_level: CompatibilityLevel;
    compatibility_breakdown: CompatibilityBreakdown;
    hashtags: string[];           // 5: 2 niche, 2 trending, 1 branded
    boost_prediction: string;     // e.g. "+23% above your average"
    trend_reference?: string;     // which trend this maps to
}

// ─── Trend ──────────────────────────────────────────────────────────────────

export interface Trend {
    id: string;
    name: string;
    niche: NicheType;
    popularity_score: number;     // 0-100
    weekly_growth: string;        // e.g. "+34% this week"
    format_type: FormatType;
    example_caption_style: string;
    ideal_duration: string;       // e.g. "15-30s"
    is_bharat?: boolean;
    description?: string;
    peak_days?: string[];
    hashtags?: string[];
}

// ─── Analysis State ──────────────────────────────────────────────────────────

export interface AnalysisStep {
    id: number;
    label: string;
    status: 'pending' | 'running' | 'done';
}

// ─── Festival (Bharat Mode) ───────────────────────────────────────────────────

export interface Festival {
    name: string;
    date: string;              // ISO date
    languages: string[];
    content_opportunity: string;
    hashtags: string[];
}

// ─── Comparison ──────────────────────────────────────────────────────────────

export interface GapAnalysis {
    missing_formats: FormatType[];
    underused_themes: string[];
    opportunity_niches: string[];
    competitor_strengths: string[];
    opportunity_score: number;    // 0-100
}

// ─── API Response Wrappers ────────────────────────────────────────────────────

export interface ApiResponse<T> {
    data?: T;
    error?: string;
    success: boolean;
}

export interface AnalysisResponse {
    dna: CreatorDNA;
    suggestions: Suggestion[];
}
