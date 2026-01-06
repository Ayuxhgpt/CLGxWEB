"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Upload, FileText, Activity, Clock, ArrowRight, TrendingUp, Book } from "lucide-react";

export default function Dashboard() {
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(true);

    const [stats, setStats] = useState({
        notes: 0,
        uploads: 0,
        reputation: 0,
        streak: 0,
        recentUploads: []
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/user/stats');
                if (res.ok) {
                    const result = await res.json();
                    if (result.success && result.data) {
                        const data = result.data;
                        setStats({
                            notes: data.notesSaved || 0,
                            uploads: data.uploads || 0,
                            streak: data.streak || 0,
                            reputation: (data.uploads || 0) * 10,
                            recentUploads: data.recentUploads || []
                        });
                    }
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
        <div className="min-h-screen bg-page p-6 md:p-12 pt-28 font-sans transition-colors duration-300">
            <div className="max-w-6xl mx-auto space-y-12">

                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border-subtle"
                >
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="relative flex h-2 w-2">
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-xs font-mono text-emerald-500 uppercase tracking-widest">System Online</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-text-primary">
                            {greeting}, <span className="text-text-secondary">{session?.user?.name?.split(' ')[0] || 'Student'}</span>
                        </h1>
                        <p className="text-text-secondary mt-2 text-lg">
                            Your command center for academic resources.
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/">
                            <Button variant="outline" className="h-11 px-4 rounded-lg hidden md:flex border-border-subtle hover:bg-bg-surface">
                                <ArrowRight className="mr-2 h-4 w-4 rotate-180" /> Back to Home
                            </Button>
                        </Link>
                        <Link href="/albums/upload">
                            <Button className="h-11 px-6 rounded-lg text-sm font-semibold tracking-wide">
                                <Upload className="mr-2 h-4 w-4" /> Upload Resource
                            </Button>
                        </Link>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        label="Total Contributions"
                        value={stats.uploads}
                        icon={Upload}
                        isLoading={isLoading}
                        trend={stats.uploads > 0 ? `Level ${Math.floor(stats.uploads / 5) + 1}` : "Beginner"}
                        color="text-primary"
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
                        icon={TrendingUp}
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

                    {/* Recent Uploads */}
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1, duration: 0.3 }}
                        className="lg:col-span-2 space-y-6"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-text-primary">Recent Activity</h2>
                        </div>

                        {isLoading ? (
                            <div className="space-y-4">
                                <Skeleton className="h-24 w-full" />
                                <Skeleton className="h-24 w-full" />
                            </div>
                        ) : stats.recentUploads.length === 0 ? (
                            <EmptyState
                                title="Start your journey"
                                description="You haven't uploaded any notes yet. Uploading verified resources is the fastest way to build your reputation."
                                icon={Activity}
                                className="min-h-[250px]"
                            >
                                <div className="mt-4">
                                    <Link href="/albums/upload">
                                        <Button>Initiate Upload</Button>
                                    </Link>
                                </div>
                            </EmptyState>
                        ) : (
                            <div className="space-y-4">
                                {stats.recentUploads.map((item: any) => (
                                    <div key={item._id} className="saas-card p-4 flex items-center justify-between group hover:border-border-highlight transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-lg bg-bg-surface border border-border-subtle flex items-center justify-center text-text-secondary">
                                                {item.type === 'note' ? <FileText className="h-5 w-5" /> : <Activity className="h-5 w-5" />}
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-text-primary text-sm group-hover:text-primary transition-colors">{item.title || "Untitled Resource"}</h4>
                                                <p className="text-xs text-text-muted">Uploaded on {new Date(item.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <Badge variant={item.status === 'approved' ? 'default' : item.status === 'rejected' ? 'destructive' : 'secondary'}>
                                            {item.status || 'Pending'}
                                        </Badge>
                                    </div>
                                ))}
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
                        <h2 className="text-xl font-bold text-text-primary">Quick Access</h2>
                        <div className="saas-card p-4 space-y-2">
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
                        <div className="saas-card p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="font-semibold text-sm text-text-primary">Contribution Level</h4>
                                <Badge variant="outline" className="text-xs">{(stats.uploads * 5)} / 100 XP</Badge>
                            </div>
                            <div className="h-2 w-full bg-bg-surface rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                                    style={{ width: `${Math.min((stats.uploads * 5), 100)}%` }}
                                />
                            </div>
                            <p className="text-xs text-text-muted mt-3">
                                Upload <strong>{20 - Math.min(stats.uploads, 20)} more files</strong> to reach the next tier.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

// Sub-components
function StatCard({ label, value, icon: Icon, isLoading, trend, color, suffix = "" }: any) {
    return (
        <div className="saas-card p-6 relative overflow-hidden group hover:border-border-highlight">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2.5 rounded-lg bg-bg-surface border border-border-subtle group-hover:border-border-highlight`}>
                    <Icon className={`h-5 w-5 ${color}`} />
                </div>
                {isLoading ? <Skeleton className="h-5 w-16" /> : (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-full bg-bg-surface text-text-muted border border-border-subtle">
                        {trend}
                    </span>
                )}
            </div>
            <div className="space-y-1">
                <h3 className="text-xs font-medium text-text-secondary uppercase tracking-wider">{label}</h3>
                {isLoading ? <Skeleton className="h-8 w-12" /> : (
                    <div className="text-3xl font-bold text-text-primary font-mono">
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
            <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-bg-surface transition-colors">
                <div className={`h-10 w-10 rounded-full bg-bg-page border border-border-subtle flex items-center justify-center ${color}`}>
                    <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                    <h4 className="font-semibold text-sm text-text-primary group-hover:text-primary transition-colors">{title}</h4>
                    <p className="text-xs text-text-secondary">{desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
        </Link>
    )
}
