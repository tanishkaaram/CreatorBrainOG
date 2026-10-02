'use client';

import React, { useState, Suspense } from 'react';
import AppShell from '@/components/AppShell';
import { Brain, Sparkles } from 'lucide-react';
import { useCreatorStore } from '@/lib/store';
import CreatorDNACard from '@/components/CreatorDNACard';
import SuggestionsGrid from '@/components/SuggestionsGrid';
import DebugDataSection from '@/components/DebugDataSection';
import { useSearchParams } from 'next/navigation';

const LOADING_STEPS = [
    'Fetching Instagram posts',
    'Detecting content niche',
    'Calculating engagement patterns',
    'Building Creator DNA',
    'Generating personalized strategy',
];

function AnalyzePageContent() {
    const searchParams = useSearchParams();
    const queryUsername = searchParams.get('username');
    const [username, setUsername] = useState(queryUsername || '');

    // STEP 5 - Standard State Pattern
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<any>(null);
    const [stepIndex, setStepIndex] = useState(0);

    const { setProfile, setAnalysisResults } = useCreatorStore();

    // STEP 5 - Standard Fetch Pattern
    async function fetchData() {
        if (!username) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });
            if (!res.ok) {
                let msg = 'Analysis failed';
                try {
                    const errorJson = await res.json();
                    msg = errorJson.error || errorJson.notice || errorJson.message || msg;
                } catch {
                    const errorText = await res.text();
                    msg = errorText || msg;
                }
                throw new Error(msg);
            }
            const result = await res.json();

            // Sync with global store for other components if needed
            setProfile(result.profile);
            setAnalysisResults(result.dna, result.suggestions);

            setData(result);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    }

    React.useEffect(() => {
        if (queryUsername && !data && !loading) {
            fetchData();
        }
    }, [queryUsername]);

    // Loading steps tick-off animation
    React.useEffect(() => {
        if (!loading) {
            setStepIndex(0);
            return;
        }
        let current = 0;
        setStepIndex(0);
        const interval = setInterval(() => {
            current += 1;
            if (current >= LOADING_STEPS.length) {
                clearInterval(interval);
                return;
            }
            setStepIndex(current);
        }, 1200);
        return () => clearInterval(interval);
    }, [loading]);

    // STEP 5 - Loading UI
    if (loading) return (
        <AppShell>
            <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center space-y-4">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400 mb-2" />
                <p className="text-white text-lg font-semibold">
                    Analyzing @{username}...
                </p>
                <p className="text-zinc-400 text-sm">
                    This takes 30-60 seconds, please wait
                </p>
                <div className="mt-4 text-left w-full max-w-sm mx-auto">
                    <ul className="space-y-2 text-xs">
                        {LOADING_STEPS.map((label, idx) => {
                            const done = idx <= stepIndex;
                            return (
                                <li key={label} className="flex items-center gap-2">
                                    <span className={done ? 'text-cyan-400' : 'text-zinc-600'}>
                                        {done ? '✓' : '•'}
                                    </span>
                                    <span className={done ? 'text-zinc-200' : 'text-zinc-500'}>
                                        {label}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </div>
        </AppShell>
    );

    // STEP 5 - Error UI
    if (error) return (
        <AppShell>
            <div className="flex flex-col items-center justify-center min-h-screen text-center px-6">
                <p className="text-red-400 text-lg">Analysis failed: {error}</p>
                <button onClick={fetchData}
                    className="mt-4 px-6 py-2 bg-yellow-500 text-black rounded-xl hover:bg-yellow-400 transition-colors text-xs font-bold">
                    Retry
                </button>
            </div>
        </AppShell>
    );

    return (
        <AppShell>
            <div className="max-w-7xl mx-auto px-6 py-6">
                {!data ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                        <div className="w-16 h-16 rounded-xl bg-yellow-500/10 flex items-center justify-center mb-6 border border-white/[0.08]">
                            <Brain className="w-8 h-8 text-yellow-400" />
                        </div>
                        <h1 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter font-jakarta">
                            Analyze Any <span className="text-yellow-400">Creator Persona</span>
                        </h1>
                        <p className="text-zinc-500 max-w-sm mb-6 text-sm">
                            Deep semantic analysis powered by Llama 3.3 70B to define archetype, content DNA, and growth markers.
                        </p>

                        <div className="relative w-full max-w-xs">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-zinc-500">
                                <span className="font-bold text-sm">@</span>
                            </div>
                            <input
                                type="text"
                                placeholder="instagram_username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-white/5 border border-yellow-500/20 rounded-xl py-3 pl-10 pr-6 text-white text-sm focus:outline-none focus:ring-1 focus:ring-yellow-500/50"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') fetchData();
                                }}
                            />
                            <button
                                onClick={fetchData}
                                className="mt-3 w-full bg-yellow-500 text-black rounded-xl py-3 text-sm font-bold hover:bg-yellow-400 transition-all active:scale-95 flex items-center justify-center gap-2"
                            >
                                <Sparkles className="w-4 h-4" /> Start Brain Analysis
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <section>
                            <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-yellow-400 mb-4 px-1 flex items-center gap-2">
                                <Brain className="w-3.5 h-3.5 text-yellow-400" /> Personal Content Blueprint
                            </h2>
                            <div className="max-w-4xl">
                                <CreatorDNACard dna={data.dna} />
                            </div>
                        </section>

                        <section>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-6">
                                <div>
                                    <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-yellow-400 px-1 mb-1">Growth Intelligence</h2>
                                    <h3 className="text-xl font-bold font-jakarta">Tailored Content Suggestions</h3>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 text-[10px] font-bold">
                                    <Sparkles className="w-3.5 h-3.5" /> Based on AI Detection
                                </div>
                            </div>
                            <SuggestionsGrid suggestions={data.suggestions} />
                        </section>

                        <DebugDataSection profile={data.profile} />
                    </div>
                )}
            </div>
        </AppShell>
    );
}

export default function AnalyzePage() {
    return (
        <Suspense fallback={
            <AppShell>
                <div className="flex flex-col items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-400" />
                </div>
            </AppShell>
        }>
            <AnalyzePageContent />
        </Suspense>
    );
}
