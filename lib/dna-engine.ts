// ─────────────────────────────────────────────────────────────────────────────
// CreatorBrainOG DNA Engine — Local Analysis Logic
// Calculates engagement metrics, patterns, and consistency from post data.
// GPT is called AFTER this to add semantic analysis (archetype, themes).
// ─────────────────────────────────────────────────────────────────────────────

import { CreatorProfile, Post, CreatorDNA, PostType, ReelDurationBucket } from '@/types';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Niche benchmark averages (% engagement rate)
const NICHE_BENCHMARKS: Record<string, number> = {
    'Singing/Music': 7.2,
    'Dance': 8.5,
    'Fitness': 6.4,
    'Food': 5.9,
    'Education': 7.2,
    'Comedy': 8.1,
    'Lifestyle': 5.3,
    'Fashion': 4.7,
    'Travel': 6.8,
    'Business': 4.9,
    'Gaming': 7.5,
    'Art': 6.2,
    'Motivation': 8.8,
    'Regional/Bharat content': 9.2,
};

// ─── Engagement Rate per Post ────────────────────────────────────────────────

export function calculateEngagementRate(post: Post, followerCount: number): number {
    if (!followerCount || followerCount === 0) return 0;
    // Section 5 Formula: ((likes + comments + views) / followers * 100)
    const interactions = post.likes + post.comments + (post.video_views || post.views || 0);
    return parseFloat(((interactions / followerCount) * 100).toFixed(2));
}

// ─── Average Engagement by Post Type ─────────────────────────────────────────

export function avgEngagementByType(
    posts: Post[],
    followerCount: number
): Record<PostType, number> {
    const groups: Record<PostType, number[]> = {
        REEL: [],
        CAROUSEL_ALBUM: [],
        IMAGE: [],
    };

    for (const post of posts) {
        const rate = post.engagement_rate ?? calculateEngagementRate(post, followerCount);
        groups[post.type].push(rate);
    }

    const avg = (arr: number[]) =>
        arr.length ? parseFloat((arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(2)) : 0;

    return {
        REEL: avg(groups.REEL),
        CAROUSEL_ALBUM: avg(groups.CAROUSEL_ALBUM),
        IMAGE: avg(groups.IMAGE),
    };
}

// ─── Total Reach Estimate ────────────────────────────────────────────────────
// Section 5 Formula: sum of all video_views + (likes * 8 estimated)

export function calculateTotalReach(posts: Post[]): number {
    return posts.reduce((acc, post) => {
        const views = post.video_views || post.views || 0;
        const estimatedReach = views + (post.likes * 8); // Section 5: views + (likes * 8)
        return acc + estimatedReach;
    }, 0);
}

// ─── Best Reel Duration Bucket ────────────────────────────────────────────────

export function bestReelDurationBucket(posts: Post[]): ReelDurationBucket {
    const buckets: Record<ReelDurationBucket, number[]> = {
        '0-15s': [],
        '15-30s': [],
        '30-60s': [],
        '60s+': [],
    };

    for (const post of posts) {
        if (post.type !== 'REEL' || !post.duration) continue;
        const rate = post.engagement_rate || 0;
        if (post.duration <= 15) buckets['0-15s'].push(rate);
        else if (post.duration <= 30) buckets['15-30s'].push(rate);
        else if (post.duration <= 60) buckets['30-60s'].push(rate);
        else buckets['60s+'].push(rate);
    }

    const avg = (arr: number[]) =>
        arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

    let best: ReelDurationBucket = '30-60s';
    let bestAvg = -1;

    for (const [bucket, rates] of Object.entries(buckets)) {
        const a = avg(rates);
        if (a > bestAvg && rates.length > 0) {
            bestAvg = a;
            best = bucket as ReelDurationBucket;
        }
    }
    return best;
}

// ─── Best Posting Time Slot ───────────────────────────────────────────────────
// Section 3 FIX: day + hour combo with highest engagement

export function bestPostingTimeSlot(posts: Post[]): string {
    if (posts.length < 5) return 'Need more posts to determine best time';

    const slotMap: Record<string, number[]> = {};

    for (const post of posts) {
        const date = new Date(post.timestamp);
        const day = DAYS[date.getDay()];
        const hour = date.getHours(); // 0-23
        const key = `${day}:${hour}`;

        slotMap[key] = slotMap[key] || [];
        slotMap[key].push(post.engagement_rate || 0);
    }

    let bestKey = '';
    let bestAvg = -1;

    for (const [key, rates] of Object.entries(slotMap)) {
        const avg = rates.reduce((a, b) => a + b, 0) / rates.length;
        if (avg > bestAvg) {
            bestAvg = avg;
            bestKey = key;
        }
    }

    if (!bestKey) return 'Need more posts to determine best time';

    const [day, hourStr] = bestKey.split(':');
    const hour = parseInt(hourStr);
    const fmt = (h: number) => {
        const period = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 || 12;
        return `${displayH}${period}`;
    };

    return `${day} at ${fmt(hour)}`;
}

/** Returns { day, hour, hourEnd, label } for dashboard display. */
export function bestPostingTimeSlotDetail(posts: Post[]): { day: string; hour: number; hourEnd: number; label: string; postCount: number } | null {
    if (posts.length < 5) return null;
    const slotMap: Record<string, number[]> = {};
    for (const post of posts) {
        const date = new Date(post.timestamp);
        const day = DAYS[date.getDay()];
        const hour = date.getHours();
        const key = `${day}:${hour}`;
        slotMap[key] = slotMap[key] || [];
        slotMap[key].push(post.engagement_rate || 0);
    }
    let bestKey = '';
    let bestAvg = -1;
    for (const [key, rates] of Object.entries(slotMap)) {
        const avg = rates.reduce((a, b) => a + b, 0) / rates.length;
        if (avg > bestAvg) {
            bestAvg = avg;
            bestKey = key;
        }
    }
    if (!bestKey) return null;
    const [day, hourStr] = bestKey.split(':');
    const hour = parseInt(hourStr);
    const hourEnd = Math.min(23, hour + 1);
    const fmt = (h: number) => {
        const period = h >= 12 ? 'PM' : 'AM';
        const displayH = h % 12 || 12;
        return `${displayH}${period}`;
    };
    const label = hourEnd > hour ? `${day} between ${fmt(hour)}–${fmt(hourEnd)}` : `${day} at ${fmt(hour)}`;
    return { day, hour, hourEnd, label, postCount: posts.length };
}

/** Engagement rate formula: sum(likes+comments+views) / (posts * followers) * 100 */
export function realEngagementRateFromPosts(posts: Post[], followerCount: number): number | null {
    if (!posts.length || !followerCount) return null;
    const total = posts.reduce(
        (acc, p) => acc + p.likes + p.comments + (p.video_views ?? p.views ?? 0),
        0
    );
    return parseFloat(((total / (posts.length * followerCount)) * 100).toFixed(2));
}

// ─── Content themes from real captions (keyword frequency) ────────────────────

const STOP_WORDS = new Set([
    'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare', 'to', 'of', 'in',
    'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'and', 'but', 'or', 'so', 'if',
    'then', 'than', 'when', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my',
    'your', 'our', 'me', 'him', 'her', 'us', 'them', 'what', 'which', 'who', 'how', 'all', 'each', 'every', 'both',
    'few', 'more', 'most', 'other', 'some', 'such', 'no', 'not', 'only', 'own', 'same', 'just', 'about', 'out',
    'up', 'down', 'off', 'over', 'again', 'here', 'there', 'am', 'pm', 're', 've', 'll', 'rt', 'ig', 'instagram'
]);

export interface ThemeWithCount { name: string; value: number }

export function extractContentThemes(posts: Post[]): ThemeWithCount[] {
    const count: Record<string, number> = {};
    for (const post of posts) {
        const text = (post.caption || '').toLowerCase()
            .replace(/#\w+/g, ' ')
            .replace(/https?:\/\/\S+/g, ' ')
            .replace(/[^\w\s]+/g, ' '); // More robust cleaning
        const words = text.split(/\s+/).filter(w => w.length > 3 && !STOP_WORDS.has(w) && !/^\d+$/.test(w));
        for (const w of words) {
            count[w] = (count[w] || 0) + 1;
        }
    }
    const sorted = Object.entries(count)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

    // Calculate relative frequency for bar width
    const total = sorted.reduce((acc, [_, v]) => acc + v, 0);
    return sorted.map(([name, value]) => ({ name, value }));
}

// ─── Consistency Metics ───────────────────────────────────────────────────────
// Returns avg days between posts and a 0-100 score

export function calculateConsistency(posts: Post[]): { avgDays: number; score: number } {
    if (posts.length < 2) return { avgDays: 0, score: 0 };

    const sorted = [...posts].sort(
        (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    const intervals: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
        const diff = new Date(sorted[i].timestamp).getTime() - new Date(sorted[i - 1].timestamp).getTime();
        intervals.push(diff / (1000 * 60 * 60 * 24));
    }

    const avgDays = parseFloat((intervals.reduce((a, b) => a + b, 0) / intervals.length).toFixed(1));

    // Score calculation: 1 day = 100, 3 days = 80, 7 days = 50, 14 days = 20, 30+ days = 0
    let score = 0;
    if (avgDays <= 1) score = 100;
    else if (avgDays <= 3) score = 100 - (avgDays - 1) * 10;
    else if (avgDays <= 7) score = 80 - (avgDays - 3) * 7.5;
    else if (avgDays <= 14) score = 50 - (avgDays - 7) * 4.2;
    else score = Math.max(0, 20 - (avgDays - 14) * 1.25);

    return { avgDays, score: Math.round(score) };
}

// ─── Best Post Type ───────────────────────────────────────────────────────────

export function bestPostType(avgByType: Record<PostType, number>): PostType {
    const entries = Object.entries(avgByType) as [PostType, number][];
    return entries.sort((a, b) => b[1] - a[1])[0]?.[0] || 'REEL';
}

// ─── Overall Average Engagement Rate ─────────────────────────────────────────

export function overallEngagementRate(posts: Post[], followerCount: number): number {
    if (posts.length === 0) return 0;
    const rates = posts.map(
        (p) => p.engagement_rate ?? calculateEngagementRate(p, followerCount)
    );
    return parseFloat(
        (rates.reduce((a, b) => a + b, 0) / rates.length).toFixed(2)
    );
}

// ─── Main DNA Builder ─────────────────────────────────────────────────────────

export function buildLocalDNA(profile: CreatorProfile): Partial<CreatorDNA> {
    const { posts, follower_count, niche } = profile;

    const enrichedPosts = posts.map((p) => ({
        ...p,
        engagement_rate: p.engagement_rate ?? calculateEngagementRate(p, follower_count),
    }));

    const byType = avgEngagementByType(enrichedPosts, follower_count);
    const idealDuration = bestReelDurationBucket(enrichedPosts);
    const bestTime = bestPostingTimeSlot(enrichedPosts);
    const { avgDays, score: consistency } = calculateConsistency(enrichedPosts);
    const engagementRate = overallEngagementRate(enrichedPosts, follower_count);
    const best = bestPostType(byType);
    const realThemes = extractContentThemes(enrichedPosts);

    return {
        ideal_duration: idealDuration,
        best_time: bestTime,
        engagement_rate: engagementRate,
        niche_avg_engagement: NICHE_BENCHMARKS[niche] || 5.5,
        consistency_score: consistency,
        best_post_type: best,
        top_themes: realThemes.map(t => t.name),
    };
}

// ─── Heatmap Data Generator ───────────────────────────────────────────────────

export function buildEngagementHeatmap(posts: Post[]): number[][] {
    const grid: number[][] = Array.from({ length: 7 }, () => new Array(24).fill(0));
    const counts: number[][] = Array.from({ length: 7 }, () => new Array(24).fill(0));

    for (const post of posts) {
        const d = new Date(post.timestamp);
        const day = d.getDay();
        const hour = d.getHours();
        grid[day][hour] += post.engagement_rate || 0;
        counts[day][hour]++;
    }

    for (let d = 0; d < 7; d++) {
        for (let h = 0; h < 24; h++) {
            grid[d][h] = counts[d][h] > 0
                ? parseFloat((grid[d][h] / counts[d][h]).toFixed(2))
                : 0;
        }
    }
    return grid;
}
