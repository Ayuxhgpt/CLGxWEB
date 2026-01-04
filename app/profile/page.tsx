"use client";

import Navbar from "@/components/Navbar";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import Image from "next/image";
import {
    User, Mail, Calendar, BookOpen, Edit2,
    Instagram, Linkedin, Twitter, Share2
} from "lucide-react";

export default function ProfilePage() {
    const { data: session } = useSession();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProfile() {
            if (session?.user?.email) {
                try {
                    const res = await fetch("/api/user/profile");
                    if (res.ok) {
                        const data = await res.json();
                        setProfile(data);
                    }
                } catch (error) {
                    console.error(error);
                } finally {
                    setLoading(false);
                }
            }
        }
        fetchProfile();
    }, [session]);

    if (loading) return (
        <div className="min-h-screen bg-[var(--bg-main)]">
            <Navbar />
            <div className="pt-24 container mx-auto px-4 max-w-4xl">
                <Skeleton className="h-64 w-full rounded-2xl mb-8" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Skeleton className="h-48 w-full rounded-xl" />
                    <Skeleton className="h-48 w-full rounded-xl" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[var(--bg-main)]">
            <Navbar />
            <main className="container mx-auto px-4 pt-24 pb-12 max-w-5xl">

                {/* Header Card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }} /* Ladder1: 10px rise */
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <Card className="p-0 overflow-hidden mb-8 border border-[rgb(var(--border-subtle))] bg-[rgb(var(--bg-card))]"> {/* Strict Colors */}
                        {/* Banner - Subtle Ladder1 Deep Gradient */}
                        <div className="h-48 bg-gradient-to-r from-zinc-900 to-[rgb(var(--bg-surface))] opacity-50 relative">
                            {/* No noise needed if background is solid ladder style */}
                        </div>

                        <div className="px-8 pb-8 flex flex-col md:flex-row items-end -mt-16 gap-6">
                            {/* Avatar - Clean Cut */}
                            <div className="relative">
                                <div className="h-32 w-32 rounded-full p-1 bg-[rgb(var(--bg-card))]"> {/* Matches Card Bg */}
                                    <Image
                                        src={profile?.image || `https://ui-avatars.com/api/?name=${session?.user?.name}&background=10b981&color=fff`} /* Emerald default */
                                        alt="Profile"
                                        width={128}
                                        height={128}
                                        className="w-full h-full rounded-full object-cover border-4 border-[rgb(var(--bg-card))]"
                                        unoptimized
                                    />
                                </div>
                                <div className="absolute bottom-2 right-2 bg-green-500 h-5 w-5 rounded-full border-4 border-[rgb(var(--bg-card))]" title="Online" />
                            </div>

                            {/* Info */}
                            <div className="flex-1 mb-2">
                                <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))]">{session?.user?.name}</h1>
                                <p className="text-[rgb(var(--text-secondary))] flex items-center gap-2">
                                    <Mail className="h-4 w-4" /> {session?.user?.email}
                                </p>
                            </div>

                            {/* Actions - No Shadows */}
                            <div className="mb-2 flex gap-3">
                                <Link href="/settings">
                                    <Button variant="secondary">
                                        <Edit2 className="h-4 w-4 mr-2" /> Edit Profile
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Left Col */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-6"
                    >
                        <Card>
                            <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4 border-b border-[var(--border-subtle)] pb-2">
                                Academic Info
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-[var(--text-secondary)]">Current Year</label>
                                    <div className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-[var(--accent-primary)]" />
                                        {profile?.year || "First Year"}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-[var(--text-secondary)]">Department</label>
                                    <div className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
                                        <BookOpen className="h-4 w-4 text-purple-400" />
                                        {profile?.branch || "B.Pharm"}
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-[var(--text-secondary)]">Role</label>
                                    <div className="font-semibold text-[var(--text-primary)] flex items-center gap-2">
                                        <User className="h-4 w-4 text-orange-400" />
                                        {profile?.role || "Student"}
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card>
                            <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4 border-b border-[var(--border-subtle)] pb-2">
                                Socials
                            </h3>
                            <div className="flex gap-4">
                                {profile?.socials?.instagram ? (
                                    <a href={profile.socials.instagram} target="_blank" className="p-3 bg-pink-500/10 rounded-lg text-pink-400 hover:bg-pink-500 hover:text-white transition-all">
                                        <Instagram className="h-5 w-5" />
                                    </a>
                                ) : <div className="p-3 bg-[var(--bg-surface-2)] rounded-lg text-[var(--text-muted)] opacity-50"><Instagram className="h-5 w-5" /></div>}

                                {profile?.socials?.linkedin ? (
                                    <a href={profile.socials.linkedin} target="_blank" className="p-3 bg-blue-600/10 rounded-lg text-blue-500 hover:bg-blue-600 hover:text-white transition-all">
                                        <Linkedin className="h-5 w-5" />
                                    </a>
                                ) : <div className="p-3 bg-[var(--bg-surface-2)] rounded-lg text-[var(--text-muted)] opacity-50"><Linkedin className="h-5 w-5" /></div>}

                                {profile?.socials?.twitter ? (
                                    <a href={profile.socials.twitter} target="_blank" className="p-3 bg-sky-500/10 rounded-lg text-sky-400 hover:bg-sky-500 hover:text-white transition-all">
                                        <Twitter className="h-5 w-5" />
                                    </a>
                                ) : <div className="p-3 bg-[var(--bg-surface-2)] rounded-lg text-[var(--text-muted)] opacity-50"><Twitter className="h-5 w-5" /></div>}
                            </div>
                        </Card>
                    </motion.div>

                    {/* Right Col */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="md:col-span-2"
                    >
                        <Card className="h-full">
                            <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4 border-b border-[var(--border-subtle)] pb-2">
                                About Me
                            </h3>
                            <p className="text-[var(--text-secondary)] leading-relaxed whitespace-pre-line text-lg">
                                {profile?.bio || "No bio added yet. Click 'Edit Profile' to introduce yourself!"}
                            </p>

                            <div className="mt-8 p-4 bg-[var(--bg-surface-2)] rounded-xl border border-[var(--border-subtle)] flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold text-[var(--text-primary)]">Profile Visibility</h4>
                                    <p className="text-xs text-[var(--text-secondary)]">Your profile is visible to other students.</p>
                                </div>
                                <Button variant="ghost" size="sm"><Share2 className="h-4 w-4 mr-2" /> Share</Button>
                            </div>
                        </Card>
                    </motion.div>

                </div>
            </main>
        </div>
    );
}
