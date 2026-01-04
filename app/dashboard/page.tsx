"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Upload, FileText, Activity, Clock, Plus, ArrowUpRight, Zap, ArrowRight } from "lucide-react";

export default function Dashboard() {
    const { data: session } = useSession();

    // In a real app, fetch these stats from API
    const stats = [
        { label: "My Notes", value: "12", icon: FileText, color: "text-blue-500", bg: "bg-blue-500/10" },
        { label: "Pending Uploads", value: "3", icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10" },
        { label: "Approvals", value: "8", icon: ArrowUpRight, color: "text-green-500", bg: "bg-green-500/10" },
        { label: "Activity Score", value: "98%", icon: Zap, color: "text-purple-500", bg: "bg-purple-500/10" },
    ];

    return (
        <div className="min-h-screen bg-bg p-4 md:p-8 pt-24">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-text">Dashboard</h1>
                        <p className="text-text-secondary">Welcome back, {session?.user?.name}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link href="/albums/upload">
                            <Button className="shadow-lg shadow-primary/25">
                                <Upload className="mr-2 h-4 w-4" /> Upload Content
                            </Button>
                        </Link>
                    </div>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card glass hover className="border-text/5">
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium text-text-secondary">
                                        {stat.label}
                                    </CardTitle>
                                    <div className={`p-2 rounded-lg ${stat.bg}`}>
                                        <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-text">{stat.value}</div>
                                    <p className="text-xs text-text-muted mt-1">+20.1% from last month</p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Main Content Areas */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    {/* Recent Uploads / Quick Actions */}
                    <Card className="col-span-4 border-text/10 bg-surface/30">
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>Your latest contributions to the platform.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[1, 2, 3].map((_, i) => (
                                    <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface/50 transition-colors border border-transparent hover:border-text/5">
                                        <div className="h-10 w-10 rounded-lg bg-surface flex items-center justify-center border border-text/10">
                                            <FileText className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-text">Pharmacy Practice Notes v{i + 1}.pdf</p>
                                            <p className="text-xs text-text-secondary">Uploaded 2 hours ago</p>
                                        </div>
                                        <div className="text-xs px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20">
                                            Pending
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button variant="ghost" className="w-full text-text-secondary" size="sm">
                                View All Activity <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </CardFooter>
                    </Card>

                    {/* Quick Access / System Status */}
                    <Card className="col-span-3 border-text/10 bg-surface/30">
                        <CardHeader>
                            <CardTitle>Quick Access</CardTitle>
                            <CardDescription>Frequently used tools and resources.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-2">
                            <Link href="/notes">
                                <Button variant="outline" className="w-full justify-start h-auto py-3 border-text/10 hover:border-primary/50 hover:bg-primary/5">
                                    <BookOpen className="mr-3 h-5 w-5 text-blue-500" />
                                    <div className="text-left">
                                        <div className="font-medium text-text">Browse Notes</div>
                                        <div className="text-xs text-text-secondary">Access standard study materials</div>
                                    </div>
                                </Button>
                            </Link>
                            <Link href="/profile">
                                <Button variant="outline" className="w-full justify-start h-auto py-3 border-text/10 hover:border-primary/50 hover:bg-primary/5">
                                    <Activity className="mr-3 h-5 w-5 text-purple-500" />
                                    <div className="text-left">
                                        <div className="font-medium text-text">Track Progress</div>
                                        <div className="text-xs text-text-secondary">View your academic growth</div>
                                    </div>
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function BookOpen(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
    )
}
