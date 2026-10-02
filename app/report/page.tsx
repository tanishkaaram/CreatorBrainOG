'use client';

import React from 'react';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/PageHeader';
import { useCreatorStore } from '@/lib/store';
import { FileText, Download, Share2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function ReportPage({ params }: { params?: { id?: string } }) {
    const { dna, profile } = useCreatorStore();
    const reportId = params?.id || 'CBOG-LATEST';

    if (!dna || !profile) {
        return (
            <AppShell>
                <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col items-center justify-center min-h-[60vh] text-center">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                        <AlertCircle className="w-8 h-8 text-zinc-600" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">No Active DNA</h2>
                    <p className="text-zinc-500 max-w-md mb-8">
                        You need to complete a DNA analysis before you can generate a shareable report.
                    </p>
                    <Link href="/analyze">
                        <button className="btn-primary px-8">Run Analysis Now</button>
                    </Link>
                </div>
            </AppShell>
        );
    }

    return (
        <AppShell>
            <div className="max-w-7xl mx-auto px-6 py-12">
                <PageHeader
                    title="Performance Report"
                    subtitle="Creator Identity"
                    description={`Comprehensive content strategy and performance audit for @${profile.username}.`}
                    actions={
                        <div className="flex gap-4">
                            <button className="btn-secondary px-4 py-2 flex items-center gap-2 text-xs">
                                <Share2 className="w-4 h-4" /> Share Link
                            </button>
                            <button className="btn-primary px-4 py-2 flex items-center gap-2 text-xs">
                                <Download className="w-4 h-4" /> Download PDF
                            </button>
                        </div>
                    }
                />

                <div className="glass-card p-12 relative overflow-hidden bg-white/[0.01]">
                    {/* Watermark/Background decoration */}
                    <div className="absolute top-0 right-0 p-12 opacity-[0.03] uppercase font-black text-8xl tracking-widest pointer-events-none rotate-12">
                        {dna.archetype}
                    </div>

                    <div className="relative z-10 space-y-12">
                        <div className="pb-8 border-b border-white/5 flex justify-between items-end">
                            <div>
                                <h2 className="text-4xl font-black mb-2">{dna.archetype}</h2>
                                <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Public Strategy Protocol • Verified by CreatorBrainOG AI</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold">{new Date().toLocaleDateString()}</p>
                                <p className="text-[10px] text-zinc-700 uppercase font-black">Report ID: {reportId}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                            <div className="space-y-6">
                                <h3 className="text-xs font-black uppercase text-yellow-400">Content Archetype</h3>
                                <p className="text-sm leading-relaxed text-zinc-300">
                                    You are naturally aligned with the <strong>{dna.archetype}</strong> profile. This means your audience values
                                    {dna.radar_scores.relatability > 70 ? ' authentic connections ' : ' expertise and high-quality production '}
                                    above everything else.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase text-green-500">Top Strengths</h3>
                                <ul className="space-y-2">
                                    {dna.strengths.map((s, i) => (
                                        <li key={i} className="text-xs text-zinc-400 flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0" />
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xs font-black uppercase text-yellow-400">Core Themes</h3>
                                <div className="flex flex-wrap gap-2">
                                    {dna.top_themes.map((t, i) => (
                                        <span key={i} className="px-3 py-1 rounded-xl bg-white/5 border border-white/[0.08] text-[10px] font-bold text-zinc-400">
                                            #{t.toUpperCase()}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="pt-12 p-8 rounded-xl bg-yellow-500/5 border border-white/[0.08]">
                            <div className="flex flex-col md:flex-row gap-8 items-center">
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold mb-2">Performance DNA</h3>
                                    <p className="text-xs text-zinc-500 leading-relaxed">
                                        Your current engagement rate stands at <strong>{dna.engagement_rate}%</strong>, which is
                                        {dna.engagement_rate > dna.niche_avg_engagement ? ' above ' : ' near '}
                                        the average benchmark for the {profile.niche} niche ({dna.niche_avg_engagement}%).
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 shrink-0">
                                    <div className="px-6 py-4 rounded-xl bg-white/5 border border-white/[0.08] text-center">
                                        <p className="text-[10px] font-bold text-zinc-600 uppercase mb-1">Eng. Rate</p>
                                        <p className="text-xl font-black text-cyan-400">{dna.engagement_rate}%</p>
                                    </div>
                                    <div className="px-6 py-4 rounded-xl bg-white/5 border border-white/[0.08] text-center">
                                        <p className="text-[10px] font-bold text-zinc-600 uppercase mb-1">Consistency</p>
                                        <p className="text-xl font-black text-cyan-400">{dna.consistency_score}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-white/5 text-center">
                            <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-bold">This report was generated automatically by CreatorBrainOG Growth Intelligence Engine.</p>
                        </div>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}
