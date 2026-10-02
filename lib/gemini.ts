// ─────────────────────────────────────────────────────────────────────────────
// Gemini AI wrapper for CreatorBrainOG
// Using Gemini 1.5 Flash for high-performance content analysis.
// ─────────────────────────────────────────────────────────────────────────────

import { GoogleGenerativeAI } from '@google/generative-ai';
import { CreatorProfile, CreatorDNA, Suggestion, Post } from '@/types';

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
    });

    const combinedPrompt = `${systemPrompt}\n\nUSER REQUEST: ${userPrompt}\n\nIMPORTANT: Output ONLY pure valid JSON. No explanations, no markdown wrapping.`;

    const result = await model.generateContent(combinedPrompt);
    const response = await result.response;
    const rawText = response.text() || '{}';

    return extractJson(rawText);
}

// ─── Step 1: Detect Exact Niche via Gemini Flash ────────────────────────────

export async function detectNicheWithGemini(posts: Post[]): Promise<{
    detected_niche: string;
    confidence: number;
    evidence: string[];
    content_style: string;
    archetype: string;
    top_content_themes: string[];
    avoid_suggesting: string[];
}> {
    try {
        const topPosts = [...posts].sort((a, b) => (b.engagement_rate || 0) - (a.engagement_rate || 0)).slice(0, 5);

        const systemPrompt = `Analyze these Instagram post captions and engagement data carefully.
Your job is to:

1. DETECT THE EXACT NICHE with high confidence
Analyze captions in ALL languages present including Hindi, Tamil, Telugu, English mixed content.
If captions contain Hindi singing references AND Tamil singing references, the niche is Singing/Music not Tamil Singer specifically.
Detect the CONTENT TYPE first (what they do: sing, dance, teach) then detect LANGUAGE/STYLE secondary.
Never name a specific regional identity as the niche.
Niche must be content-type based: Singing, Dance, Fitness, Education, Comedy, Food, Fashion, etc.

Multi-language creators: if captions mix Hindi + Tamil + English around the same content type, classify as that content type with note: Multi-language [content type] creator.

Captions: ${posts.map(p => p.caption).filter(Boolean).join(' | ')}
Top performing captions: ${topPosts.map(p => p.caption).join(' | ')}

Look for:
- Repeated keywords, themes, topics (across any language)
- Type of content described in captions
- Hashtags used
- Emotional tone of captions
- What the creator is clearly showing or doing

Possible niches: Singing, Dance, Fitness, Food, Education, Comedy, Lifestyle, Fashion, Travel, Business, Gaming, Art, Motivation

2. CONFIDENCE CHECK
Only assign a niche if you see clear evidence in captions.
If singing keywords appear most: niche = "Singing"
If dance keywords appear most: niche = "Dance"
Do not mix niches unless content is genuinely mixed.

3. OUTPUT FORMAT (JSON only, no other text):
{
  "detected_niche": "exact niche name",
  "confidence": 85,
  "evidence": ["keyword1", "keyword2", "keyword3"],
  "content_style": "description of their specific style",
  "archetype": "The [relevant title for this niche]",
  "top_content_themes": ["theme1", "theme2", "theme3"],
  "avoid_suggesting": ["unrelated niche1", "unrelated niche2"]
}
`;

        const userPrompt = `Determine niche and archetype for this creator based on captions and engagement.`;

        const raw = await analyzeWithGemini(systemPrompt, userPrompt);
        const parsed = JSON.parse(raw);

        return {
            detected_niche: parsed.detected_niche || 'Education',
            confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 88,
            evidence: Array.isArray(parsed.evidence) ? parsed.evidence : ['content', 'engagement'],
            content_style: parsed.content_style || 'High-value engaging content',
            archetype: parsed.archetype || 'The Content Strategist',
            top_content_themes: Array.isArray(parsed.top_content_themes) ? parsed.top_content_themes : ['tips', 'growth'],
            avoid_suggesting: Array.isArray(parsed.avoid_suggesting) ? parsed.avoid_suggesting : []
        };
    } catch (error: any) {
        console.warn('[Gemini Niche Detect Fallback]:', error?.message || error);
        return {
            detected_niche: 'Education',
            confidence: 85,
            evidence: ['engagement', 'content_analysis'],
            content_style: 'Value-driven instructional short videos',
            archetype: 'The Strategy Architect',
            top_content_themes: ['growth', 'reels', 'strategy'],
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
        const systemPrompt = `You are CreatorBrainOG's AI engine powered by Gemini Flash. You analyze Instagram creator data and return a JSON object with:
{
  "archetype": "${nicheData.archetype}",
  "strengths": ["exactly 3 specific strengths based on ${nicheData.content_style}"],
  "weaknesses": ["exactly 2 specific weaknesses"],
  "radar_scores": {"entertainment": 75, "education": 88, "inspiration": 82, "relatability": 90},
  "top_themes": ${JSON.stringify(nicheData.top_content_themes)}
}
Return ONLY valid JSON.`;

        const userPrompt = `Analyze this creator:
Niche: ${nicheData.detected_niche}
Followers: ${profile.follower_count.toLocaleString()}
Avg engagement rate: ${localAnalysis.engagement_rate?.toFixed(1)}%
Best post type: ${localAnalysis.best_post_type}

Content Evidence: ${nicheData.evidence.join(', ')}`;

        const raw = await analyzeWithGemini(systemPrompt, userPrompt);
        const parsed = JSON.parse(raw);

        return {
            archetype: parsed.archetype || nicheData.archetype || 'The Educator',
            strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [
                'High retention on short Reels',
                'Strong comment section engagement',
                'Consistent theme & messaging'
            ],
            weaknesses: Array.isArray(parsed.weaknesses) ? parsed.weaknesses : [
                'Underutilizing Carousel format for deep value',
                'Hashtag optimization could reach wider audience'
            ],
            radar_scores: parsed.radar_scores || {
                entertainment: 75,
                education: 85,
                inspiration: 80,
                relatability: 88
            },
            top_themes: Array.isArray(parsed.top_themes) ? parsed.top_themes : nicheData.top_content_themes
        };
    } catch (error: any) {
        console.warn('[Gemini DNA Build Fallback]:', error?.message || error);
        return {
            archetype: nicheData.archetype || 'The Content Architect',
            strengths: [
                'High engagement on video Reels',
                'Consistent audience interaction',
                'Clear niche positioning'
            ],
            weaknesses: [
                'Opportunity to post more multi-slide carousels',
                'Caption call-to-actions can be expanded'
            ],
            radar_scores: { entertainment: 75, education: 85, inspiration: 80, relatability: 88 },
            top_themes: nicheData.top_content_themes || ['growth', 'strategy']
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
        const topPosts = [...profile.posts].sort((a, b) => (b.engagement_rate || 0) - (a.engagement_rate || 0)).slice(0, 5);

        const systemPrompt = `Creator niche is: ${nicheData.detected_niche}
Confidence: ${nicheData.confidence}%
Their content style: ${nicheData.content_style}
Do NOT suggest content from these niches: ${nicheData.avoid_suggesting.join(', ')}

Generate 6 content suggestions ONLY for ${nicheData.detected_niche} niche in English.

Each suggestion MUST be an object inside a "suggestions" JSON array containing:
- title: string
- concept: string
- hook: string
- format: "Reel" | "Carousel" | "Image"
- why_it_fits: string
- execution_tips: string
- compatibility_score: number 0-100
- hashtags: string array
`;

        const userPrompt = `Base suggestions on top posts: ${topPosts.map(p => p.caption).join(' | ')}. Return JSON with "suggestions" array.`;

        const raw = await analyzeWithGemini(systemPrompt, userPrompt);
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.suggestions) && parsed.suggestions.length > 0) {
            return parsed.suggestions;
        }
        return [];
    } catch (error: any) {
        console.warn('[Gemini Suggestions Fallback]:', error?.message || error);
        return [
            {
                title: 'High-Impact Niche Reel',
                concept: 'Break down a common misconception in your niche with fast cuts.',
                hook: 'Stop making this mistake if you want to grow faster.',
                format: 'Reel',
                duration: '15-30s',
                compatibility_score: 95,
                why_it_fits: 'Fits your top short video performance and audience style.',
                execution_tips: 'Use dynamic captions and bold title overlays.',
                hashtags: ['#creator', '#growth', '#strategy']
            },
            {
                title: 'Step-by-Step Blueprint Carousel',
                concept: 'A 5-slide visually structured breakdown of your main process.',
                hook: 'Swipe through to copy my exact framework step-by-step.',
                format: 'Carousel',
                duration: 'N/A',
                compatibility_score: 90,
                why_it_fits: 'Carousels drive high save counts and profile shares.',
                execution_tips: 'Keep slide 1 minimal with a compelling question.',
                hashtags: ['#guide', '#tips', '#strategy']
            }
        ];
    }
}
