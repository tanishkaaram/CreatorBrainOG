'use client';

import React from 'react';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/PageHeader';
import GlassCard from '@/components/GlassCard';
import { Settings, Shield, Globe, Bell, Trash2, LogOut } from 'lucide-react';
import { useCreatorStore } from '@/lib/store';
import toast from 'react-hot-toast';

export default function SettingsPage() {
    const { profile, reset, bharatMode, setBharatMode, isDemoMode, setDemoMode } = useCreatorStore();

    const handleReset = () => {
        if (confirm("Are you sure you want to clear all data and disconnect your account?")) {
            reset();
            toast.success("All data cleared.");
        }
    };

    return (
        <AppShell>
            <div className="max-w-4xl mx-auto px-6 py-12">
                <PageHeader
                    title="Settings"
                    subtitle="Configure Brain"
                    description="Manage your account, API integrations, and application preferences."
                />

                <div className="space-y-8">
                    <GlassCard title="Preferences" icon={Settings}>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h4 className="text-sm font-bold">Bharat Mode</h4>
                                    <p className="text-xs text-zinc-500">Enable regional Indian trends and festival alerts.</p>
                                </div>
                                <Toggle active={bharatMode} onToggle={() => setBharatMode(!bharatMode)} />
                            </div>
                            <div className="flex items-center justify-between border-t border-white/5 pt-6">
                                <div>
                                    <h4 className="text-sm font-bold">Demo Mode</h4>
                                    <p className="text-xs text-zinc-500">Use mock data for testing features without connecting Instagram.</p>
                                </div>
                                <Toggle active={isDemoMode} onToggle={() => setDemoMode(!isDemoMode)} />
                            </div>
                        </div>
                    </GlassCard>

                    <GlassCard title="Account Connection" icon={Shield}>
                        {profile ? (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <img src={profile.profile_picture || ''} loading="lazy" className="w-12 h-12 rounded-full border border-white/10" />
                                    <div>
                                        <h4 className="text-sm font-bold">@{profile.username}</h4>
                                        <p className="text-[10px] text-emerald-400 font-bold uppercase">Connected via Instagram</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleReset}
                                    className="flex items-center gap-2 text-xs font-bold text-red-500 hover:text-red-400 transition-colors"
                                >
                                    <LogOut className="w-4 h-4" /> Disconnect Account
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <p className="text-sm text-zinc-500 mb-6">No Instagram account connected.</p>
                                <button className="btn-primary px-8">Connect Instagram</button>
                            </div>
                        )}
                    </GlassCard>

                    <div className="pt-8 flex flex-col items-center gap-4">
                        <button
                            onClick={handleReset}
                            className="flex items-center gap-2 text-xs font-bold text-zinc-600 hover:text-red-500 transition-colors"
                        >
                            <Trash2 className="w-4 h-4" /> Reset Application Cache
                        </button>
                        <p className="text-[10px] text-zinc-700 uppercase tracking-widest font-black">CreatorBrainOG v1.0.0-beta</p>
                    </div>
                </div>
            </div>
        </AppShell>
    );
}

function Toggle({ active, onToggle }: { active: boolean, onToggle: () => void }) {
    return (
        <div
            onClick={onToggle}
            className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${active ? 'bg-yellow-500' : 'bg-zinc-800'}`}
        >
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${active ? 'left-7' : 'left-1'}`} />
        </div>
    );
}
