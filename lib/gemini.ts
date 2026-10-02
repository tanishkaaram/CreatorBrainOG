// ─────────────────────────────────────────────────────────────────────────────
// Gemini AI wrapper for CreatorBrainOG
// Using Gemini 1.5 Flash for high-precision, deep-context content analysis.
// ─────────────────────────────────────────────────────────────────────────────

import { GoogleGenerativeAI } from '@google/generative-ai';
import { CreatorProfile, CreatorDNA, Suggestion, Post } from '@/types';
import { detectLocalNiche } from './dna-engine';

function extractJson(text: string): string {
    if (!text) return '{}';
    // Clean markdown code blocks
    let cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    // Extract between first { or [ and last } or ]
    const firstBrace = cleaned.indexOf('{');
    const firstBracket = cleaned.indexOf('[');

    let startIdx = -1;
    if (firstBrace !== -1 && firstBracket !== -1) {
        startIdx = Math.min(firstBrace, firstBracket);
    } else if (firstBrace !== -1) {
        startIdx = firstBrace;
    } else if (firstBracket !== -1) {
        startIdx = firstBracket;
    }

    if (startIdx !== -1) {
        const lastBrace = cleaned.lastIndexOf('}');
        const lastBracket = cleaned.lastIndexOf(']');
        const endIdx = Math.max(lastBrace, lastBracket);
        if (endIdx > startIdx) {
            cleaned = cleaned.substring(startIdx, endIdx + 1);
        }
    }
    return cleaned;
}

async function analyzeWithGemini(systemPrompt: string, userPrompt: string): Promise<string> {
    const apiKey = (
        process.env.GEMINI_API_KEY ||
        process.env.GOOGLE_API_KEY ||
        process.env.GEMINI_KEY ||
        process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
        process.env.GROQ_API_KEY ||
        ''
    ).trim();

    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is missing in environment variables');
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
            temperature: 0.6,
        }
    });

    const combinedPrompt = `${systemPrompt}\n\nUSER REQUEST: ${userPrompt}\n\nIMPORTANT: Output ONLY pure valid JSON. No conversational filler, no markdown fences.`;

    const result = await model.generateContent(combinedPrompt);
    const response = await result.response;
    const rawText = response.text() || '{}';

    return extractJson(rawText);
}

// ─── Step 1: Detect Exact Niche via Gemini Flash ────────────────────────────

export async function detectNicheWithGemini(posts: Post[], bio: string = ''): Promise<{
    detected_niche: string;
    confidence: number;
    evidence: string[];
    content_style: string;
    archetype: string;
    top_content_themes: string[];
    avoid_suggesting: string[];
}> {
    const allText = posts.map(p => p.caption).join(' ') + ' ' + bio;
    const localDetected = detectLocalNiche(allText);

    try {
        const postSummary = posts.slice(0, 10).map((p, idx) =>
            `[Post ${idx + 1}] Type: ${p.type} | Likes: ${p.likes} | Views: ${p.video_views || 0} | Caption: "${p.caption}" | Hashtags: ${p.hashtags?.join(', ') || 'none'}`
        ).join('\n');

        const systemPrompt = `You are a world-class Instagram Content Strategist. Analyze this creator's Instagram bio and recent posts carefully.

PROFILE BIO: "${bio}"

RECENT POSTS SUMMARY:
${postSummary}

YOUR JOB:
1. Detect their EXACT content niche (e.g. Singing/Music, Dance, Fitness, Food, Education, Comedy, Fashion, Art, Travel, Business, Tech, Gaming, Lifestyle).
2. Primary Rule: Classify by WHAT THEY ACTUALLY DO in their videos/captions. If they sing or post music covers, classify as Singing/Music. If they dance, classify as Dance. If they share recipes, classify as Food.
3. Identify their unique creative style and archetype (e.g., "The Acoustic Vocal Innovator", "The Choreography Performer", "The High-Energy Humorist").

RETURN JSON ONLY:
{
  "detected_niche": "Singing/Music" | "Dance" | "Fitness" | "Food" | "Education" | "Comedy" | "Fashion" | "Art" | "Travel" | "Lifestyle",
  "confidence": 90,
  "evidence": ["exact keyword or pattern 1", "exact keyword or pattern 2"],
  "content_style": "detailed description of their unique visual & messaging style based on real posts",
  "archetype": "The [Custom Creative Archetype Title]",
  "top_content_themes": ["theme1", "theme2", "theme3"],
  "avoid_suggesting": ["unrelated niche 1", "unrelated niche 2"]
}
`;

        const userPrompt = `Determine the precise niche, archetype, and style for this creator.`;

        const raw = await analyzeWithGemini(systemPrompt, userPrompt);
        const parsed = JSON.parse(raw);

        return {
            detected_niche: parsed.detected_niche || localDetected.niche,
            confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 90,
            evidence: Array.isArray(parsed.evidence) && parsed.evidence.length > 0 ? parsed.evidence : localDetected.evidence,
            content_style: parsed.content_style || localDetected.content_style,
            archetype: parsed.archetype || localDetected.archetype,
            top_content_themes: Array.isArray(parsed.top_content_themes) && parsed.top_content_themes.length > 0 ? parsed.top_content_themes : localDetected.top_content_themes,
            avoid_suggesting: Array.isArray(parsed.avoid_suggesting) ? parsed.avoid_suggesting : []
        };
    } catch (error: any) {
        console.warn('[Gemini Niche Detect Fallback]:', error?.message || error);
        return {
            detected_niche: localDetected.niche,
            confidence: 85,
            evidence: localDetected.evidence,
            content_style: localDetected.content_style,
            archetype: localDetected.archetype,
            top_content_themes: localDetected.top_content_themes,
            avoid_suggesting: []
        };
    }
}

// ─── Step 2: Build Creator DNA via Gemini Flash ──────────────────────────────

export async function buildCreatorDNAWithGemini(
    profile: CreatorProfile,
    localAnalysis: Partial<CreatorDNA>,
    nicheData: any
): Promise<Partial<CreatorDNA>> {
    try {
        const topPosts = [...profile.posts].sort((a, b) => (b.likes + (b.video_views || 0)) - (a.likes + (a.video_views || 0))).slice(0, 5);

        const postList = topPosts.map((p, idx) =>
            `Top Post ${idx + 1} (${p.type}): Likes: ${p.likes}, Views: ${p.video_views || 0}, Comments: ${p.comments}, Caption: "${p.caption}"`
        ).join('\n');

        const systemPrompt = `You are CreatorBrainOG's AI engine. Perform a deep, accurate content DNA analysis for creator @${profile.username}.

CREATOR DETAILS:
- Username: @${profile.username}
- Bio: "${profile.bio || 'None'}"
- Followers: ${profile.follower_count.toLocaleString()}
- Detected Niche: ${nicheData.detected_niche}
- Archetype: ${nicheData.archetype}
- Content Style: ${nicheData.content_style}
- Avg Engagement Rate: ${localAnalysis.engagement_rate?.toFixed(1)}%

TOP PERFORMING POSTS:
${postList}

YOUR TASK:
Analyze the actual captions and post performance to output a JSON object:
{
  "archetype": "${nicheData.archetype}",
  "strengths": [
    "strength 1: highly specific insight referencing their real content tone or format",
    "strength 2: specific observation about their audience engagement or style",
    "strength 3: specific strength based on top performing posts"
  ],
  "weaknesses": [
    "weakness 1: concrete content or format gap",
    "weakness 2: optimization opportunity"
  ],
  "radar_scores": {
    "entertainment": 0-100,
    "education": 0-100,
    "inspiration": 0-100,
    "relatability": 0-100
  },
  "top_themes": ["theme1", "theme2", "theme3", "theme4", "theme5"]
}
`;

        const userPrompt = `Generate personalized Creator DNA for @${profile.username}.`;

        const raw = await analyzeWithGemini(systemPrompt, userPrompt);
        const parsed = JSON.parse(raw);

        return {
            archetype: parsed.archetype || nicheData.archetype,
            strengths: Array.isArray(parsed.strengths) && parsed.strengths.length >= 2 ? parsed.strengths : [
                `High audience engagement on ${nicheData.detected_niche} content`,
                'Strong authentic connection in post captions',
                'Consistent theme & positioning'
            ],
            weaknesses: Array.isArray(parsed.weaknesses) && parsed.weaknesses.length >= 1 ? parsed.weaknesses : [
                'Underutilizing multi-slide Carousel format for deep value',
                'Caption call-to-actions could be optimized for higher saves'
            ],
            radar_scores: parsed.radar_scores || {
                entertainment: nicheData.detected_niche === 'Singing/Music' || nicheData.detected_niche === 'Dance' || nicheData.detected_niche === 'Comedy' ? 92 : 75,
                education: nicheData.detected_niche === 'Education' ? 88 : 70,
                inspiration: 84,
                relatability: 88
            },
            top_themes: Array.isArray(parsed.top_themes) && parsed.top_themes.length > 0 ? parsed.top_themes : nicheData.top_content_themes
        };
    } catch (error: any) {
        console.warn('[Gemini DNA Build Fallback]:', error?.message || error);
        return {
            archetype: nicheData.archetype,
            strengths: [
                `High engagement on ${nicheData.detected_niche} posts`,
                'Strong personal style and audience interaction',
                'Clear content positioning'
            ],
            weaknesses: [
                'Opportunity to post more multi-slide carousels',
                'Hashtag optimization can be improved'
            ],
            radar_scores: { entertainment: 82, education: 75, inspiration: 85, relatability: 88 },
            top_themes: nicheData.top_content_themes
        };
    }
}

// ─── Step 3: Generate Smart Suggestions via Gemini Flash ──────────────────────

export async function generateSuggestionsWithGemini(
    profile: CreatorProfile,
    dna: CreatorDNA,
    nicheData: any
): Promise<Partial<Suggestion>[]> {
    try {
        const topPosts = [...profile.posts].sort((a, b) => (b.likes + (b.video_views || 0)) - (a.likes + (a.video_views || 0))).slice(0, 5);

        const postList = topPosts.map((p, idx) =>
            `Post ${idx + 1} (${p.type}): Caption: "${p.caption}" | Likes: ${p.likes}`
        ).join('\n');

        const systemPrompt = `You are CreatorBrainOG's elite AI strategist. Generate 6 hyper-customized content ideas for Instagram creator @${profile.username}.

CREATOR DATA:
- Niche: ${nicheData.detected_niche}
- Archetype: ${dna.archetype}
- Content Style: ${nicheData.content_style}
- Bio: "${profile.bio || ''}"

THEIR TOP PERFORMING POSTS:
${postList}

RULES:
1. Every suggestion must be 100% relevant to ${nicheData.detected_niche} and build directly on their real top content.
2. Write ALL caption hooks and text in English.
3. Include specific execution tips and high-converting hashtag strategies.

OUTPUT JSON FORMAT:
{
  "suggestions": [
    {
      "title": "Specific, compelling title matching their niche",
      "concept": "Detailed creative concept describing what to film or create",
      "hook": "High-converting opening line for the caption",
      "format": "Reel" | "Carousel" | "Image",
      "duration": "15-30s" or "N/A",
      "why_it_fits": "Explanation directly connecting to their actual top performing posts",
      "execution_tips": "Technical filming/editing advice",
      "compatibility_score": 92,
      "boost_prediction": "+28% engagement",
      "hashtags": ["#tag1", "#tag2", "#tag3", "#tag4", "#tag5"]
    }
  ]
}
`;

        const userPrompt = `Generate 6 hyper-specific content suggestions for @${profile.username}.`;

        const raw = await analyzeWithGemini(systemPrompt, userPrompt);
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0) {
            return parsed.suggestions;
        }
        return [];
    } catch (error: any) {
        console.warn('[Gemini Suggestions Fallback]:', error?.message || error);
        return [];
    }
}
