// ─────────────────────────────────────────────────────────────────────────────
// Gemini AI wrapper for CreatorBrainOG
// Using Gemini 1.5 Flash for high-performance content analysis.
// ─────────────────────────────────────────────────────────────────────────────

import { GoogleGenerativeAI } from '@google/generative-ai';
import { CreatorProfile, CreatorDNA, Suggestion, Post } from '@/types';

async function analyzeWithGemini(systemPrompt: string, userPrompt: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GROQ_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not configured in environment variables');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.7,
        }
    });

    const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;
    const result = await model.generateContent(combinedPrompt);
    const response = await result.response;
    let rawText = response.text() || '{}';

    // Clean markdown json fences if any returned
    rawText = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();

    return rawText;
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
  "confidence": 0-100,
  "evidence": ["keyword1", "keyword2", "keyword3"],
  "content_style": "description of their specific style",
  "archetype": "The [relevant title for this niche]",
  "top_content_themes": ["theme1", "theme2", "theme3"],
  "avoid_suggesting": ["unrelated niche1", "unrelated niche2"]
}
`;

    const userPrompt = `Determine niche and archetype for this creator based on captions and engagement.`;

    const raw = await analyzeWithGemini(systemPrompt, userPrompt);
    return JSON.parse(raw);
}

// ─── Step 2: Build Creator DNA via Gemini Flash ──────────────────────────────

export async function buildCreatorDNAWithGemini(
    profile: CreatorProfile,
    localAnalysis: Partial<CreatorDNA>,
    nicheData: any
): Promise<Partial<CreatorDNA>> {
    const systemPrompt = `You are CreatorBrainOG's AI engine powered by Gemini Flash. You analyze Instagram creator data and return a JSON object with:
{
  "archetype": "${nicheData.archetype}",
  "strengths": ["exactly 3 specific strengths based on ${nicheData.content_style}"],
  "weaknesses": ["exactly 2 specific weaknesses"],
  "radar_scores": {"entertainment": 0-100, "education": 0-100, "inspiration": 0-100, "relatability": 0-100},
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
    return JSON.parse(raw);
}

// ─── Step 3: Generate Smart Suggestions via Gemini Flash ──────────────────────

export async function generateSuggestionsWithGemini(
    profile: CreatorProfile,
    dna: CreatorDNA,
    nicheData: any
): Promise<Partial<Suggestion>[]> {
    const topPosts = [...profile.posts].sort((a, b) => (b.engagement_rate || 0) - (a.engagement_rate || 0)).slice(0, 5);

    const systemPrompt = `Creator niche is: ${nicheData.detected_niche}
Confidence: ${nicheData.confidence}%
Their content style: ${nicheData.content_style}
Do NOT suggest content from these niches: ${nicheData.avoid_suggesting.join(', ')}

This creator posts in multiple languages.
Suggestions must work across all languages they use.
Do not restrict to one regional language style.
Generate ALL suggestion hooks and captions in English only.
Even if the creator posts in Tamil, Hindi or other languages,
the hook text must always be written in English.
Never output hooks in Tamil, Hindi or any regional language.

Generate 6 content suggestions ONLY for ${nicheData.detected_niche} niche.
Every single suggestion must be clearly related to ${nicheData.detected_niche}.
No lifestyle, no dance, no generic content unless niche demands it.

Base suggestions on:
- Their top performing posts: ${topPosts.map(p => p.caption).join(' | ')}
- Their engagement patterns
- Current trends within ${nicheData.detected_niche} specifically

Each suggestion must include:
- title: specific to ${nicheData.detected_niche}
- concept: detailed idea
- hook: opening line for caption
- format: Reel | Carousel | Photo
- why_it_fits: explain connection to their actual content
- execution_tips: technical or creative tips for maximum impact
- compatibility_score: 0-100
- hashtags: ["hashtag1", "hashtag2", "hashtag3", "hashtag4", "hashtag5"] specific to ${nicheData.detected_niche}
`;

    const userPrompt = `Return JSON with "suggestions" array.`;

    const raw = await analyzeWithGemini(systemPrompt, userPrompt);
    const parsed = JSON.parse(raw);
    return parsed.suggestions || [];
}
