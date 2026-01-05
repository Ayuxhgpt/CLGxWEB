"use client";

import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
    Video, FileText, BookOpen, Download,
    PlayCircle, HelpCircle, GraduationCap, Lock
} from "lucide-react";
import Link from "next/link";

export default function ResourcesPage() {
    const resources = [
        {
            category: "Study Materials",
            items: [
                { title: "GPAT Guide 2025", desc: "Comprehensive entrance exam preparation guide.", icon: GraduationCap, color: "text-blue-400", status: "Available" },
                { title: "PCI Syllabus Notes", desc: "Sem-wise curated notes for B.Pharm.", icon: FileText, color: "text-emerald-400", status: "Updated" },
                { title: "Past Year Papers", desc: "Last 5 years solved question papers.", icon: Download, color: "text-orange-400", status: "Coming Soon" },
            ]
        },
        {
            category: "Multimedia",
            items: [
                { title: "Video Lectures", desc: "Topic-wise playlists for core subjects.", icon: Video, color: "text-purple-400", status: "Coming Soon" },
                { title: "3D Drug Models", desc: "Interactive molecular structures.", icon: PlayCircle, color: "text-pink-400", status: "Premium" },
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-[var(--bg-main)]">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent-primary)] to-blue-500 mb-4">
                        Student Resources
                    </h1>
                    <p className="text-[var(--text-secondary)] text-lg max-w-2xl">
                        A collection of tools, guides, and materials to supercharge your pharmacy studies.
                    </p>
                </motion.div>

                <div className="space-y-16">
                    {resources.map((section, idx) => (
                        <div key={idx}>
                            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 flex items-center">
                                <BookOpen className="mr-2 h-6 w-6 text-[var(--accent-primary)]" />
                                {section.category}
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {section.items.map((item, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                    >
                                        <Card className="h-full group">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className={`p-3 rounded-xl bg-white/5 ${item.color}`}>
                                                    <item.icon className="h-6 w-6" />
                                                </div>
                                                <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider
                                                    ${item.status === 'Available' ? 'bg-green-500/10 text-green-400' :
                                                        item.status === 'Premium' ? 'bg-purple-500/10 text-purple-400' :
                                                            item.status === 'Updated' ? 'bg-blue-500/10 text-blue-400' :
                                                                'bg-gray-700/50 text-gray-400'}
                                                `}>
                                                    {item.status}
                                                </span>
                                            </div>

                                            <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 group-hover:text-[var(--accent-primary)] transition-colors">
                                                {item.title}
                                            </h3>
                                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed mb-6">
                                                {item.desc}
                                            </p>

                                            <div className="mt-auto">
                                                {item.status === "Coming Soon" ? (
                                                    <Button disabled variant="ghost" className="w-full opacity-50 cursor-not-allowed">
                                                        <Lock className="mr-2 h-4 w-4" /> Locked
                                                    </Button>
                                                ) : (
                                                    <Button variant="secondary" className="w-full group-hover:bg-[var(--accent-primary)] group-hover:text-white group-hover:border-transparent transition-all">
                                                        Access Now
                                                    </Button>
                                                )}
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Request Content Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="mt-20 p-8 rounded-2xl bg-gradient-to-r from-blue-900/20 to-[var(--bg-surface)] border border-[var(--border-subtle)] text-center"
                >
                    <HelpCircle className="h-10 w-10 text-[var(--accent-primary)] mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Need something specific?</h3>
                    <p className="text-[var(--text-secondary)] mb-6">
                        We are constantly updating our library. Let us know what notes or resources you need next.
                    </p>
                    <a href="mailto:support@pharmaelevate.in">
                        <Button>Request Resource</Button>
                    </a>
                </motion.div>
            </main>
        </div>
    );
}
