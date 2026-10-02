import { NextRequest, NextResponse } from 'next/server';
import {
    detectNicheWithGemini,
    buildCreatorDNAWithGemini,
    generateSuggestionsWithGemini
} from '@/lib/gemini';
import { buildLocalDNA } from '@/lib/dna-engine';
import { CreatorProfile, CreatorDNA, Post, Suggestion } from '@/types';

// API Timeout Config
export const maxDuration = 60;

function getFallbackData(username: string) {
    const mockPosts: Post[] = [
        {
            id: 'post_1',
            type: 'REEL',
            likes: 1240,
            comments: 89,
            video_views: 18500,
            caption: `Behind the scenes creating new content for @${username}! What do you think of this style? #creator #growth #content`,
            timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
            date: new Date(Date.now() - 86400000 * 2).toISOString(),
            is_video: true,
            hashtags: ['creator', 'growth', 'content'],
            duration: 28,
            engagement_rate: 7.2
        },
        {
            id: 'post_2',
            type: 'CAROUSEL_ALBUM',
            likes: 980,
            comments: 64,
            video_views: 0,
            caption: '5 key lessons I learned this month that doubled my engagement rate.',
            timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
            date: new Date(Date.now() - 86400000 * 5).toISOString(),
            is_video: false,
            hashtags: ['tips', 'strategy', 'instagram'],
            duration: undefined,
            engagement_rate: 6.5
        },
        {
            id: 'post_3',
            type: 'REEL',
            likes: 2400,
            comments: 180,
            video_views: 34000,
            caption: 'Hook your viewers in the first 3 seconds with this simple technique!',
            timestamp: new Date(Date.now() - 86400000 * 8).toISOString(),
            date: new Date(Date.now() - 86400000 * 8).toISOString(),
            is_video: true,
            hashtags: ['viral', 'reels', 'growth'],
            duration: 15,
            engagement_rate: 9.1
        }
    ];

    const profile: CreatorProfile = {
        id: `demo_${username}`,
        username: username,
        follower_count: 14500,
        following_count: 420,
        bio: `Digital Creator & Innovator | Content Strategy for @${username}`,
        profile_picture: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150`,
        niche: 'Education',
        posts: mockPosts,
        is_demo: true,
        bharat_mode: false,
        created_at: new Date().toISOString()
    };

    const dna: CreatorDNA = {
        archetype: 'The Strategy Architect',
        strengths: [
            'High viewer retention on short Reels (15-30s)',
            'Strong audience interaction in comment section',
            'Consistent posting schedule with clear content theme'
        ],
        weaknesses: [
            'Underutilizing Carousel format for deep value',
            'Hashtag optimization could reach wider non-follower audience'
        ],
        ideal_duration: '15-30s',
        best_time: 'Thursday at 6PM',
        engagement_rate: 7.6,
        niche_avg_engagement: 6.8,
        radar_scores: {
            entertainment: 75,
            education: 88,
            inspiration: 82,
            relatability: 90
        },
        top_themes: ['growth', 'strategy', 'reels', 'content', 'tips'],
        consistency_score: 85,
        best_post_type: 'REEL',
        detected_niche: 'Education',
        confidence: 92
    };

    const suggestions: Suggestion[] = [
        {
            id: 'sug_1',
            title: '3-Step Breakdown Reel',
            concept: 'Share a fast-paced tutorial showing your workflow behind the scenes.',
            hook: 'Stop making this mistake if you want your content to reach more people.',
            format: 'Reel',
            duration: '15-30s',
            compatibility_score: 95,
            compatibility_level: 'high',
            compatibility_breakdown: {
                trend_popularity: 90,
                niche_relevance: 98,
                style_match: 95,
                past_performance_similarity: 92
            },
            hashtags: ['#creatortips', '#contentstrategy', '#reelsviral', '#growthhacks'],
            why_it_fits: 'Matches your highest performing 15s Reel format and education archetype.',
            execution_tips: 'Use quick jump cuts every 2 seconds and dynamic caption overlays.',
            boost_prediction: '+25% above average'
        },
        {
            id: 'sug_2',
            title: 'Carousel Deep-Dive Guide',
            concept: 'A 7-slide visual guide summarizing your top strategy checklist.',
            hook: 'Swipe through to steal my exact content plan for this month.',
            format: 'Carousel',
            duration: 'N/A',
            compatibility_score: 88,
            compatibility_level: 'good',
            compatibility_breakdown: {
                trend_popularity: 85,
                niche_relevance: 90,
                style_match: 88,
                past_performance_similarity: 86
            },
            hashtags: ['#instagramguide', '#creatoreconomy', '#socialmediatips'],
            why_it_fits: 'Carousels generate high saves and shares, boosting overall profile authority.',
            execution_tips: 'Keep slide 1 minimal with bold title text to maximize swipe-throughs.',
            boost_prediction: '+18% above average'
        }
    ];

    return { profile, dna, suggestions };
}

export async function POST(request: NextRequest) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 55000); // 55s timeout

    try {
        const body = await request.json();
        const { username: rawUsername } = body;
        const username = rawUsername?.replace('@', '').trim();

        if (!username) {
            return NextResponse.json({ error: 'Username required' }, { status: 400 });
        }

        const apifyToken = process.env.APIFY_TOKEN;
        const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || process.env.GROQ_API_KEY;

        // If keys are missing, gracefully return fallback analysis to prevent app crash
        if (!apifyToken || !geminiApiKey) {
            console.warn(`[CreatorBrainOG] Missing API keys (APIFY_TOKEN: ${!!apifyToken}, GEMINI_API_KEY: ${!!geminiApiKey}). Returning fallback analysis.`);
            clearTimeout(timeoutId);
            const fallback = getFallbackData(username);
            return NextResponse.json({
                ...fallback,
                notice: 'Running in demo mode. Add APIFY_TOKEN and GEMINI_API_KEY to your environment variables for live Instagram scraping & AI analysis.'
            });
        }

        console.log(`[Gemini Flash AI] Starting live analysis for @${username}...`);

        // Step 1: Fetch via Apify
        const apifyUrl = `https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync-get-dataset-items?token=${apifyToken}`;

        const apifyResponse = await fetch(apifyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                usernames: [username],
                resultsLimit: 20
            }),
            signal: controller.signal
        });

        if (!apifyResponse.ok) {
            console.warn(`[Apify Error] HTTP ${apifyResponse.status}: ${apifyResponse.statusText}. Using fallback analysis.`);
            clearTimeout(timeoutId);
            const fallback = getFallbackData(username);
            return NextResponse.json({
                ...fallback,
                notice: `Instagram scraper returned ${apifyResponse.statusText}. Displaying sample analysis for @${username}.`
            });
        }

        const items = await apifyResponse.json();

        if (!items || items.length === 0) {
            clearTimeout(timeoutId);
            return NextResponse.json({ error: 'Profile not found or is private' }, { status: 404 });
        }

        const profileData = items[0] as any;

        const posts: Post[] = (profileData.latestPosts || []).map((post: any) => ({
            id: post.id || post.shortCode,
            type: post.type === 'Video' ? 'REEL' : (post.type === 'Sidecar' ? 'CAROUSEL_ALBUM' : 'IMAGE'),
            likes: post.likesCount || 0,
            comments: post.commentsCount || 0,
            video_views: post.videoViewCount || 0,
            caption: post.caption || '',
            timestamp: post.timestamp,
            date: post.timestamp,
            is_video: post.type === 'Video',
            hashtags: post.hashtags || [],
            duration: post.videoDuration || undefined,
            thumbnail: post.displayUrl
        }));

        const profile: CreatorProfile = {
            id: profileData.id || `id_${username}`,
            username: profileData.username || username,
            follower_count: profileData.followersCount || 0,
            following_count: profileData.followingCount || 0,
            bio: profileData.biography || '',
            profile_picture: profileData.profilePicUrl || '',
            niche: 'pending',
            posts: posts,
            is_demo: false,
            bharat_mode: false,
            created_at: new Date().toISOString(),
        };

        // Step 2: Niche Detection via Gemini Flash
        const nicheData = await detectNicheWithGemini(posts);
        profile.niche = nicheData.detected_niche as any;

        // Step 3: Local DNA Engine (for stats)
        const localDNA = buildLocalDNA(profile);

        // Step 4: Gemini Flash AI DNA Building
        const geminiDNA = await buildCreatorDNAWithGemini(profile, localDNA, nicheData);
        const finalDNA: CreatorDNA = {
            ...localDNA,
            ...geminiDNA,
            detected_niche: nicheData.detected_niche,
            confidence: nicheData.confidence,
            ideal_duration: localDNA.ideal_duration!,
            best_time: localDNA.best_time!,
            engagement_rate: localDNA.engagement_rate!,
            niche_avg_engagement: localDNA.niche_avg_engagement!,
            consistency_score: localDNA.consistency_score!,
            best_post_type: localDNA.best_post_type!,
        } as CreatorDNA;

        // Step 5: Suggestions via Gemini Flash (Niche-locked)
        const rawSuggestions = await generateSuggestionsWithGemini(profile, finalDNA, nicheData);
        const suggestions: Suggestion[] = rawSuggestions.map((sug, idx) => ({
            id: sug.id || `sug_${idx + 1}`,
            title: sug.title || 'Content Idea',
            concept: sug.concept || '',
            hook: sug.hook || '',
            format: (sug.format as any) || 'Reel',
            why_it_fits: sug.why_it_fits || '',
            execution_tips: sug.execution_tips || '',
            duration: sug.duration || '15-30s',
            compatibility_score: sug.compatibility_score || 85,
            compatibility_level: sug.compatibility_level || (sug.compatibility_score && sug.compatibility_score > 90 ? 'high' : 'good'),
            compatibility_breakdown: sug.compatibility_breakdown || {
                trend_popularity: 85,
                niche_relevance: 90,
                style_match: 85,
                past_performance_similarity: 80
            },
            hashtags: sug.hashtags || [],
            boost_prediction: sug.boost_prediction || '+20% engagement'
        }));

        clearTimeout(timeoutId);
        return NextResponse.json({ profile, dna: finalDNA, suggestions });

    } catch (error: any) {
        clearTimeout(timeoutId);
        console.error('[Analyze Error]:', error);

        // Handle timeout or unexpected errors gracefully with fallback data
        const body = await request.clone().json().catch(() => ({}));
        const username = body.username?.replace('@', '').trim() || 'creator';
        const fallback = getFallbackData(username);

        return NextResponse.json({
            ...fallback,
            notice: `Live analysis encountered an issue (${error.message || 'Timeout'}). Displaying sample intelligence for @${username}.`
        });
    }
}
