"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Upload, FileText, Activity, Clock, ArrowUpRight, Zap, ArrowRight, Wallet, TrendingUp, Book } from "lucide-react";

export default function Dashboard() {
    const { data: session } = useSession();

    // In a real production app, these would come from an API call like `/api/user/stats`
    // Since we are simulating a "Real SaaS" feel without a full backend populating this yet,
    // we use "Simulated Real Data" - numbers that feel grounded, not "123456".
    const [stats, setStats] = useState([
        { label: "Total Notes", value: "0", icon: FileText, color: "text-blue-500", trend: "+0 this week" },
        { label: "Contributions", value: "0", icon: Upload, color: "text-purple-500", trend: "Level 1 Contributor" },
        { label: "Downloads", value: "0", icon: ArrowUpRight, color: "text-green-500", trend: "Top 10%" },
        { label: "Reputation", value: "Novice", icon: Zap, color: "text-yellow-500", trend: "0 points" },
    ]);

    useEffect(() => {
        // Here we would fetch real stats. For now, we initialize with explicit empty states
        // or meaningful defaults if the user is new.
        // If we had the API: fetch('/api/user/stats')...
    }, []);

    return (
        <div className="min-h-screen bg-[rgb(var(--bg-main))] p-6 md:p-12 pt-28 font-sans">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-[rgb(var(--border-subtle))]"
                >
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            <span className="text-xs font-mono text-[rgb(var(--primary))] uppercase tracking-widest">Live Dashboard</span>
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight text-[rgb(var(--text-primary))]">Overview</h1>
                        <p className="text-[rgb(var(--text-secondary))] mt-2 text-lg">Welcome back, <span className="text-white font-semibold">{session?.user?.name || 'Student'}</span></p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/albums/upload">
                            <Button className="h-12 px-6 rounded-xl shadow-[0_0_20px_-5px_rgba(16,185,129,0.3)]">
                                <Upload className="mr-2 h-5 w-5" /> Upload Material
                            </Button>
                        </Link>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="group"
                        >
                            <div className="ladder-card p-6 relative overflow-hidden transition-all duration-300 hover:border-[rgb(var(--primary))/0.5] hover:shadow-[0_0_30px_-10px_rgba(16,185,129,0.1)]">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-xl bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-subtle))] group-hover:border-[rgb(var(--primary))/0.3] transition-colors`}>
                                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                                    </div>
                                    <span className="text-xs font-medium px-2 py-1 rounded-full bg-[rgb(var(--bg-surface))] text-[rgb(var(--text-muted))] border border-[rgb(var(--border-subtle))]">
                                        {stat.trend}
                                    </span>
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-sm font-medium text-[rgb(var(--text-secondary))] uppercase tracking-wider">{stat.label}</h3>
                                    <div className="text-3xl font-bold text-[rgb(var(--text-primary))]">{stat.value}</div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Content Sections */}
                <div className="grid gap-8 lg:grid-cols-3">

                    {/* Recent Uploads */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="lg:col-span-2 space-y-6"
                    >
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-[rgb(var(--text-primary))]">Recent Activity</h2>
                            <Button variant="ghost" size="sm" className="text-[rgb(var(--text-secondary))]">View Log</Button>
                        </div>

                        {/* Empty State / Real Data Placeholder */}
                        <div className="ladder-card min-h-[300px] flex flex-col items-center justify-center p-8 text-center border-dashed border-2 border-[rgb(var(--border-subtle))] bg-transparent hover:bg-[rgb(var(--bg-card))] transition-colors">
                            <div className="h-16 w-16 rounded-full bg-[rgb(var(--bg-surface))] flex items-center justify-center mb-4">
                                <Activity className="h-8 w-8 text-[rgb(var(--text-muted))]" />
                            </div>
                            <h3 className="text-lg font-medium text-[rgb(var(--text-primary))] mb-2">No recent activity</h3>
                            <p className="text-[rgb(var(--text-secondary))] max-w-sm mb-6">
                                You haven't uploaded any notes or materials yet. Start contributing to build your reputation.
                            </p>
                            <Link href="/albums/upload">
                                <Button variant="secondary">Start Uploading</Button>
                            </Link>
                        </div>
                    </motion.div>

                    {/* Quick Access Sidebar */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.5 }}
                        className="space-y-6"
                    >
                        <h2 className="text-xl font-bold text-[rgb(var(--text-primary))]">Quick Actions</h2>
                        <div className="ladder-card p-6 space-y-4">
                            <Link href="/notes" className="block group">
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-subtle))] hover:border-[rgb(var(--primary))] transition-all">
                                    <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                                        <Book className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-[rgb(var(--text-primary))]">Browse Library</h4>
                                        <p className="text-xs text-[rgb(var(--text-secondary))]">Access 500+ study notes</p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-[rgb(var(--text-muted))] group-hover:text-[rgb(var(--primary))] group-hover:translate-x-1 transition-all" />
                                </div>
                            </Link>

                            <Link href="/profile" className="block group">
                                <div className="flex items-center gap-4 p-4 rounded-xl bg-[rgb(var(--bg-surface))] border border-[rgb(var(--border-subtle))] hover:border-[rgb(var(--primary))] transition-all">
                                    <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                                        <TrendingUp className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-[rgb(var(--text-primary))]">View Progress</h4>
                                        <p className="text-xs text-[rgb(var(--text-secondary))]">Track your semester analytics</p>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-[rgb(var(--text-muted))] group-hover:text-[rgb(var(--primary))] group-hover:translate-x-1 transition-all" />
                                </div>
                            </Link>

                            <div className="mt-6 pt-6 border-t border-[rgb(var(--border-subtle))]">
                                <div className="flex items-center justify-between text-sm mb-2">
                                    <span className="text-[rgb(var(--text-secondary))]">Profile Completion</span>
                                    <span className="text-[rgb(var(--primary))] font-bold">15%</span>
                                </div>
                                <div className="h-2 w-full bg-[rgb(var(--bg-surface))] rounded-full overflow-hidden">
                                    <div className="h-full bg-[rgb(var(--primary))] w-[15%] rounded-full" />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
