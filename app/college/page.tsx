"use client";

import Navbar from "@/components/Navbar";
import { collegeInfo } from "@/data/collegeInfo";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/Card";
import { ArrowRight, BookOpen, GraduationCap, Users, Trophy } from "lucide-react";

export default function CollegePage() {
    return (
        <div className="min-h-screen bg-[var(--bg-main)]">
            <Navbar />

            <main className="pt-24 pb-12">
                {/* Hero Section */}
                <section className="relative px-4 mb-16">
                    <div className="max-w-6xl mx-auto text-center">
                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-6xl font-bold text-[var(--text-primary)] mb-6"
                        >
                            {collegeInfo.name}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-[var(--text-secondary)] max-w-3xl mx-auto mb-8"
                        >
                            {collegeInfo.tagline}
                        </motion.p>
                    </div>
                </section>

                {/* Founders Section */}
                <section className="px-4 mb-20">
                    <div className="max-w-6xl mx-auto text-center mb-12">
                        <h2 className="text-3xl font-bold mb-8 text-[var(--text-primary)]">Our Leadership</h2>
                        <div className="flex flex-col md:flex-row justify-center gap-8">
                            {collegeInfo.founders.map((founder, i) => (
                                <Card key={i} className="max-w-md mx-auto overflow-hidden">
                                    <div className="h-64 overflow-hidden">
                                        <img src={founder.image} alt={founder.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-[var(--text-primary)]">{founder.name}</h3>
                                        <p className="text-[var(--primary)] font-medium mb-2">{founder.role}</p>
                                        <p className="text-[var(--text-secondary)] text-sm">{founder.bio}</p>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </section>

                {/* About & Vision Section */}
                <section className="px-4 mb-20 bg-[var(--bg-surface-2)]/30 py-16">
                    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
                        <div>
                            <h2 className="text-2xl font-bold mb-6 text-[var(--primary)] flex items-center gap-2">
                                <BookOpen className="h-6 w-6" /> About Us
                            </h2>
                            <p className="text-lg text-[var(--text-primary)] leading-relaxed mb-6">
                                {collegeInfo.description}
                            </p>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold mb-6 text-[var(--primary)] flex items-center gap-2">
                                <Trophy className="h-6 w-6" /> Our Vision
                            </h2>
                            <p className="text-lg text-[var(--text-primary)] leading-relaxed">
                                {collegeInfo.vision}
                            </p>
                        </div>
                    </div>
                </section>

                {/* Affiliation Section */}
                <section className="px-4 mb-20">
                    <div className="max-w-4xl mx-auto">
                        <Card className="p-8 border-l-4 border-l-[var(--primary)]">
                            <h2 className="text-2xl font-bold mb-6 text-[var(--text-primary)]">Affiliation & Approvals</h2>
                            <ul className="space-y-4">
                                {collegeInfo.affiliation.map((item, i) => (
                                    <li key={i} className="flex gap-4">
                                        <span className="font-bold text-[var(--primary)] min-w-[80px]">{item.course}:</span>
                                        <span className="text-[var(--text-secondary)]">{item.details}</span>
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    </div>
                </section>

                {/* Values & Facilities Grid */}
                <section className="px-4 mb-20">
                    <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Values */}
                        <div>
                            <h2 className="text-2xl font-bold mb-8 text-center text-[var(--text-primary)]">Our Values</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {collegeInfo.values.map((val, i) => (
                                    <Card key={i} className="p-4 hover:border-[var(--primary)] transition-colors">
                                        <h3 className="font-bold text-[var(--primary)] mb-2">{val.title}</h3>
                                        <p className="text-sm text-[var(--text-secondary)]">{val.desc}</p>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* Facilities */}
                        <div>
                            <h2 className="text-2xl font-bold mb-8 text-center text-[var(--text-primary)]">Facilities & Support</h2>
                            <Card className="p-6 h-full">
                                <ul className="space-y-4">
                                    {collegeInfo.facilities.map((fac, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <div className="h-2 w-2 rounded-full bg-[var(--primary)] mt-2 flex-shrink-0" />
                                            <span className="text-[var(--text-secondary)]">{fac}</span>
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        </div>
                    </div>
                </section>

                {/* Address */}
                <section className="px-4 mb-12">
                    <div className="max-w-md mx-auto text-center">
                        <Card className="p-8 bg-[var(--bg-surface-2)]">
                            <h2 className="text-xl font-bold mb-4">📍 Address</h2>
                            <p className="text-[var(--text-primary)] font-semibold mb-2">Satyadev College of Pharmacy</p>
                            <p className="text-[var(--text-secondary)]">{collegeInfo.address.line1}</p>
                            <p className="text-[var(--text-muted)] text-sm mt-2">College Code: <b>{collegeInfo.address.code}</b></p>
                        </Card>
                    </div>
                </section>
            </main>
        </div>
    );
}
