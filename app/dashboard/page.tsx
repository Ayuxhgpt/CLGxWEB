"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { Upload, FileText, Activity, Clock, ArrowUpRight, Zap, ArrowRight, Book, TrendingUp } from "lucide-react";

export default function Dashboard() {
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(true);

    // Initial State is LOADING (Skeleton Mode)
    const [stats, setStats] = useState({
        notes: 0,
        uploads: 0,
        reputation: 0,
        streak: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/user/stats');
                if (res.ok) {
                    const data = await res.json();
                    setStats({
                        notes: data.notesSaved || 0,
                        uploads: data.uploads || 0,
                        streak: data.streak || 0,
                        reputation: (data.uploads || 0) * 10
                    });
                }
            } catch (err) {
                console.error("Failed to fetch stats");
            } finally {
                setIsLoading(false);
            }
        };

        if (session?.user) {
            fetchStats();
        }
    }, [session]);

    // Time-based greeting logic
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

    return (
        <div className="min-h-screen bg-[rgb(var(--bg-main))] p-6 md:p-12 pt-28 font-sans">
            <div className="max-w-6xl mx-auto space-y-12">

                {/* Header Section: Confidence & Ownership */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[rgb(var(--border-subtle))]"
                >
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-[rgb(var(--primary))]"></span>
                            </span>
                            <span className="text-xs font-mono text-[rgb(var(--primary))] uppercase tracking-widest">System Online</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[rgb(var(--text-primary))]">
                            {greeting}, <span className="text-white">{session?.user?.name?.split(' ')[0] || 'Student'}</span>
                        </h1>
                        <p className="text-[rgb(var(--text-secondary))] mt-2 text-lg">
                            Your command center for academic resources.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/albums/upload">
                            <Button className="h-11 px-6 rounded-lg text-sm font-semibold tracking-wide">
                                <Upload className="mr-2 h-4 w-4" /> Upload Resource
                            </Button>
                        </Link>
                    </div>
                </motion.div>

                {/* Stats Grid: Real Data or Skeletons */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        label="Total Contributions"
                        value={stats.uploads}
                        icon={Upload}
                        isLoading={isLoading}
                        trend={stats.uploads > 0 ? `Level ${Math.floor(stats.uploads / 5) + 1}` : "Beginner"}
                        color="text-[rgb(var(--primary))]"
                    />
                    <StatCard
                        label="Library Notes"
                        value={stats.notes}
                        icon={FileText}
                        isLoading={isLoading}
                        trend="Personal Collection"
                        color="text-blue-500"
                    />
                    <StatCard
                        label="Reputation Score"
                        value={stats.reputation}
                        icon={Zap}
                        isLoading={isLoading}
                        trend={stats.reputation > 50 ? "Rising Star" : "Novice"}
                        color="text-yellow-500"
                    />
                    <StatCard
                        label="Activity Streak"
                        value={stats.streak}
                        suffix="Days"
                        icon={Clock}
                        isLoading={isLoading}
                        trend="Keep it up!"
                        color="text-purple-500"
                    />
                </div>

                {/* Main Content Areas */}
                <div className="grid gap-8 lg:grid-cols-3">

                    {/* Recent Uploads with Optimistic Empty State */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.3 }}
                        className="lg:col-span-2 space-y-6"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-[rgb(var(--text-primary))]">Recent Activity</h2>
                        </div>

                        {isLoading ? (
                            <div className="space-y-4">
                                <Skeleton className="h-24 w-full" />
                                <Skeleton className="h-24 w-full" />
                            </div>
                        ) : stats.uploads === 0 ? (
                            /* Optimistic Empty State */
                            <div className="group ladder-card min-h-[250px] flex flex-col items-center justify-center p-8 text-center border-dashed border-2 border-[rgb(var(--border-subtle))] bg-transparent">
                                <div className="h-14 w-14 rounded-full bg-[rgb(var(--bg-card))] flex items-center justify-center mb-4 border border-[rgb(var(--border-subtle))] group-hover:border-[rgb(var(--primary))] transition-colors">
                                    <Activity className="h-6 w-6 text-[rgb(var(--text-muted))] group-hover:text-[rgb(var(--primary))] transition-colors" />
                                </div>
                                <h3 className="text-lg font-medium text-[rgb(var(--text-primary))] mb-2">Start your journey</h3>
                                <p className="text-[rgb(var(--text-secondary))] max-w-sm mb-6 text-sm">
                                    You haven't uploaded any notes yet. Uploading verified resources is the fastest way to build your reputation.
                                </p>
                                <Link href="/albums/upload">
                                    <Button variant="secondary" size="sm">Initiate Upload</Button>
                                </Link>
                            </div>
                        ) : (
                            /* Real Activity List would go here */
                            <div className="ladder-card p-6 flex flex-col items-center justify-center text-[rgb(var(--text-secondary))]">
                                A list of your {stats.uploads} uploads would appear here.
                            </div>
                        )}
                    </motion.div>

                    {/* Quick Access Sidebar */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.3 }}
                        className="space-y-6"
                    >
                        <h2 className="text-xl font-bold text-[rgb(var(--text-primary))]">Quick Access</h2>
                        <div className="ladder-card p-4 space-y-2">
                            <QuickLink
                                href="/notes"
                                icon={Book}
                                title="Browse Library"
                                desc="Access verified study materials"
                                color="text-blue-500"
                            />
                            <QuickLink
                                href="/profile"
                                icon={TrendingUp}
                                title="My Progress"
                                desc="View your growth analytics"
                                color="text-purple-500"
                            />
                        </div>

                        {/* Gamification Widget */}
                        <div className="ladder-card p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-semibold text-sm text-[rgb(var(--text-primary))]">Contribution Level</h4>
                                <Badge variant="outline" className="text-xs">{(stats.uploads * 5)} / 100 XP</Badge>
                            </div>
                            <div className="h-2 w-full bg-[rgb(var(--bg-surface))] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[rgb(var(--primary))] rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${Math.min((stats.uploads * 5), 100)}%` }}
                                />
                            </div>
                            <p className="text-xs text-[rgb(var(--text-muted))] mt-3">
                                Upload <strong>{20 - Math.min(stats.uploads, 20)} more files</strong> to reach the next tier.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

// Sub-components for cleaner code
function StatCard({ label, value, icon: Icon, isLoading, trend, color, suffix = "" }: any) {
    return (
        <div className="ladder-card p-6 relative overflow-hidden group hover:border-zinc-700">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-lg bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-subtle))] group-hover:border-[rgb(var(--border-subtle))]/50`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                </div>
                {isLoading ? <Skeleton className="h-5 w-16" /> : (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full bg-[rgb(var(--bg-surface))] text-[rgb(var(--text-muted))] border border-[rgb(var(--border-subtle))]">
                        {trend}
                    </span>
                )}
            </div>
            <div className="space-y-1">
                <h3 className="text-xs font-medium text-[rgb(var(--text-secondary))] uppercase tracking-wider">{label}</h3>
                {isLoading ? <Skeleton className="h-8 w-12" /> : (
                    <div className="text-3xl font-bold text-[rgb(var(--text-primary))] font-mono">
                        {value}{suffix}
                    </div>
                )}
            </div>
        </div>
    )
}

function QuickLink({ href, icon: Icon, title, desc, color }: any) {
    return (
        <Link href={href} className="block group">
            <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-[rgb(var(--bg-surface))] transition-colors">
                <div className={`h-10 w-10 rounded-full bg-[rgb(var(--bg-main))] border border-[rgb(var(--border-subtle))] flex items-center justify-center ${color}`}>
                    <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                    <h4 className="font-semibold text-sm text-[rgb(var(--text-primary))] group-hover:text-white transition-colors">{title}</h4>
                    <p className="text-xs text-[rgb(var(--text-secondary))]">{desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-[rgb(var(--text-muted))] group-hover:text-[rgb(var(--primary))] group-hover:translate-x-1 transition-all" />
            </div>
        </Link>
    )
}
