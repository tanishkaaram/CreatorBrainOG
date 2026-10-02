'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
    const router = useRouter();

    useEffect(() => {
        // Direct non-authenticated app: redirect straight to analysis tool
        router.replace('/analyze');
    }, [router]);

    return (
        <div className="min-h-screen bg-[#0A0A0F] text-white flex items-center justify-center p-6">
            <div className="text-center space-y-4">
                <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-zinc-400 text-sm">Redirecting to CreatorBrainOG Analysis Hub...</p>
            </div>
        </div>
    );
}
