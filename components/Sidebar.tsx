'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    BarChart2,
    Brain,
    TrendingUp,
    Users,
    Settings,
    LogOut,
    LayoutDashboard,
    Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCreatorStore } from '@/lib/store';

const navItems = [
    { label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
    { label: 'Analyze DNA', icon: Brain, href: '/analyze' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { profile, notifications } = useCreatorStore();
    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <aside className="w-64 h-full border-r border-white/5 bg-[#0A0A0F] flex flex-col">
            <div className="p-6">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-600 to-yellow-500 flex items-center justify-center font-bold text-lg">
                        C
                    </div>
                    <span className="font-bold text-xl tracking-tight">CreatorBrainOG</span>
                </Link>
            </div>

            <nav className="flex-1 px-4 py-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                                isActive
                                    ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <item.icon className={cn(
                                "w-5 h-5",
                                isActive ? "text-yellow-400" : "group-hover:text-yellow-400"
                            )} />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 mt-auto border-t border-white/5 space-y-1">
                <Link
                    href="/settings"
                    className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all",
                        pathname === '/settings' && "bg-white/5 text-white"
                    )}
                >
                    <Settings className="w-5 h-5" />
                    <span className="font-medium">Settings</span>
                </Link>

                <div className="p-4 rounded-2xl bg-white/5 mt-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 overflow-hidden">
                            {profile?.profile_picture ? (
                                <img src={profile.profile_picture} loading="lazy" alt={profile.username} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-500">
                                    <Users className="w-5 h-5" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{profile?.username || 'Not enough data'}</p>
                            <p className="text-xs text-zinc-500 truncate">@{profile?.niche || 'Not enough data'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
