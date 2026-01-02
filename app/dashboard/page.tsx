"use client";

import Navbar from "@/components/Navbar";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import {
    Upload, Bookmark, Flame, Layout,
    BookOpen, Image as ImageIcon, Settings, ShieldAlert
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
    const { data: session } = useSession();
    const [stats, setStats] = useState({ uploads: 0, notesSaved: 0, streak: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            if (session?.user) {
                try {
                    const res = await fetch("/api/user/stats");
                    if (res.ok) {
                        const data = await res.json();
                        setStats(data);
                    }
                } catch (error) {
                    console.error(error);
                } finally {
                    setLoading(false);
                }
            }
        }
        fetchStats();
    }, [session]);

    const firstName = session?.user?.name?.split(" ")[0] || "Scholar";
    const userImage = session?.user?.image || `https://ui-avatars.com/api/?name=${session?.user?.name}&background=random`;

    const statCards = [
        { label: "Memories Shared", value: stats.uploads, icon: Upload, color: "text-blue-400", bg: "bg-blue-400/10" },
        { label: "Resources Saved", value: stats.notesSaved, icon: Bookmark, color: "text-[var(--accent-primary)]", bg: "bg-[var(--accent-primary)]/10" },
        { label: "Day Streak", value: stats.streak, icon: Flame, color: "text-orange-500", bg: "bg-orange-500/10" },
    ];

    return (
        <div className="min-h-screen bg-[var(--bg-main)]">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">

                {/* Header */}
                <header className="mb-10">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-3xl font-bold text-[var(--text-primary)]">
                            Welcome back, <span className="text-[var(--accent-primary)]">{firstName}</span> 👋
                        </h1>
                        <p className="text-[var(--text-secondary)] mt-1">
                            Here's what's happening with your learning journey.
                        </p>
                    </motion.div>
                </header>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column (Stats & Actions) */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Stats Row */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {statCards.map((stat, idx) => (
                                <Card
                                    key={idx}
                                    hoverEffect
                                    className="flex items-center space-x-4 p-5"
                                >
                                    <div className={cn("p-3 rounded-xl", stat.bg, stat.color)}>
                                        <stat.icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                                            {stat.label}
                                        </p>
                                        <h3 className="text-2xl font-bold text-[var(--text-primary)]">
                                            {loading ? <Skeleton className="h-8 w-12" /> : stat.value}
                                        </h3>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* Recent Activity (Placeholder for V2) */}
                        <section>
                            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Recent Activity</h2>
                            <EmptyState
                                title="No recent activity"
                                description="Your recent uploads and saved notes will appear here."
                                icon={Layout}
                            />
                        </section>

                        {/* Quick Actions */}
                        <section>
                            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Quick Actions</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Link href="/notes">
                                    <Card hoverEffect className="group flex items-center p-4 space-x-4 hover:border-[var(--accent-primary)] transition-colors">
                                        <div className="bg-blue-500/10 p-3 rounded-lg text-blue-400 group-hover:text-white group-hover:bg-blue-500 transition">
                                            <BookOpen className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[var(--text-primary)]">Browse Notes</h4>
                                            <p className="text-xs text-[var(--text-secondary)]">Access study materials</p>
                                        </div>
                                    </Card>
                                </Link>

                                <Link href="/albums">
                                    <Card hoverEffect className="group flex items-center p-4 space-x-4 hover:border-pink-500 transition-colors">
                                        <div className="bg-pink-500/10 p-3 rounded-lg text-pink-400 group-hover:text-white group-hover:bg-pink-500 transition">
                                            <ImageIcon className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[var(--text-primary)]">Photo Gallery</h4>
                                            <p className="text-xs text-[var(--text-secondary)]">View campus memories</p>
                                        </div>
                                    </Card>
                                </Link>

                                <Link href="/settings">
                                    <Card hoverEffect className="group flex items-center p-4 space-x-4 hover:border-orange-500 transition-colors">
                                        <div className="bg-orange-500/10 p-3 rounded-lg text-orange-400 group-hover:text-white group-hover:bg-orange-500 transition">
                                            <Settings className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[var(--text-primary)]">Settings</h4>
                                            <p className="text-xs text-[var(--text-secondary)]">Update your profile</p>
                                        </div>
                                    </Card>
                                </Link>

                                {session?.user?.role === 'admin' && (
                                    <Link href="/admin">
                                        <Card hoverEffect className="group flex items-center p-4 space-x-4 hover:border-red-500 transition-colors">
                                            <div className="bg-red-500/10 p-3 rounded-lg text-red-400 group-hover:text-white group-hover:bg-red-500 transition">
                                                <ShieldAlert className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-[var(--text-primary)]">Admin Panel</h4>
                                                <p className="text-xs text-[var(--text-secondary)]">Manage content</p>
                                            </div>
                                        </Card>
                                    </Link>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Right Column (Profile Summary) */}
                    <div>
                        <Card className="sticky top-24 border-0 bg-gradient-to-b from-[var(--bg-surface-2)] to-[var(--bg-surface)] p-0 overflow-hidden">
                            <div className="h-24 bg-gradient-to-r from-[var(--accent-primary)] to-blue-600 opacity-20" />
                            <div className="px-6 pb-6 -mt-12 flex flex-col items-center text-center">
                                <div className="p-1 bg-[var(--bg-surface)] rounded-full mb-3">
                                    <Image
                                        src={userImage}
                                        alt={session?.user?.name || "User"}
                                        width={96}
                                        height={96}
                                        className="w-full h-full rounded-full object-cover border-4 border-[var(--bg-surface)]"
                                        unoptimized
                                    />
                                </div>
                                <h2 className="text-xl font-bold text-[var(--text-primary)]">{session?.user?.name}</h2>
                                <p className="text-sm text-[var(--text-secondary)] mb-6">{session?.user?.email}</p>

                                <Link href="/profile" className="w-full">
                                    <Button variant="secondary" className="w-full">View Profile</Button>
                                </Link>

                                <div className="w-full border-t border-[var(--border-subtle)] mt-6 pt-6 grid grid-cols-2 gap-4 text-center">
                                    <div>
                                        <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.uploads}</div>
                                        <div className="text-xs text-[var(--text-muted)] uppercase">Shared</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-[var(--text-primary)]">{stats.notesSaved}</div>
                                        <div className="text-xs text-[var(--text-muted)] uppercase">Saved</div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}
