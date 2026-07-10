'use client';

import React from 'react';
import Link from 'next/link';
import HeroSection from './HeroSection';
import FeatureHighlights from './FeatureHighlights';
import HowItWorksSteps from './HowItWorksSteps';

export default function LandingPage() {
    return (
        <div className="min-h-screen relative bg-[#0A0A0F] selection:bg-cyan-500/30">
            {/* Background Details */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                {/* Subtle Grid Overlay */}
                <div className="absolute inset-0 grid-overlay opacity-30" />

                {/* Top Center Cyan Glow */}
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] opacity-40"
                    style={{
                        background: 'radial-gradient(ellipse at 50% 0%, rgba(6,182,212,0.08) 0%, transparent 60%)'
                    }}
                />
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 h-16 border-b border-white/5 bg-[#0A0A12]/80 backdrop-blur-md z-50">
                <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-xl tracking-tight text-white flex items-center">
                            CreatorBrainOG<span className="w-1.5 h-1.5 bg-cyan-500 rounded-full ml-1" />
                        </span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
                        <a href="#features" className="hover:text-white transition-colors">Features</a>
                        <a href="#how-it-works" className="hover:text-white transition-colors">Steps</a>
                        <Link href="/analyze" className="hover:text-white transition-colors">Analyze</Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="/auth/signin" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors px-4">
                            Login
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="relative z-10">
                <HeroSection />
                <FeatureHighlights />
                <HowItWorksSteps />
            </main>

            {/* Footer */}
            <footer className="relative z-10 border-t border-white/5 py-16 px-6 bg-[#0A0A12]/50">
                <div className="max-w-4xl mx-auto text-center space-y-4">
                    <p className="text-zinc-300 font-medium">CreatorBrainOG — AI Growth Intelligence</p>
                    <p className="text-zinc-500 text-sm">Built for creators everywhere</p>
                </div>
            </footer>
        </div>
    );
}
