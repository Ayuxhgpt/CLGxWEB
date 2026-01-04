"use client";

import Navbar from "@/components/Navbar";
import { facultyList } from "@/data/facultyList";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/Card";
import { User, Mail, GraduationCap } from "lucide-react";
import Image from "next/image";

export default function FacultyPage() {
    return (
        <div className="min-h-screen bg-[var(--bg-main)]">
            <Navbar />

            <main className="pt-24 pb-12 px-4">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center mb-16"
                    >
                        <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">Our Faculty</h1>
                        <p className="text-[var(--text-secondary)] text-lg">Meet the minds shaping the future of pharmacy.</p>
                    </motion.div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
                        {facultyList.map((faculty, i) => (
                            <motion.div
                                key={faculty.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                            >
                                <Card className="overflow-hidden flex flex-col md:flex-row h-full">
                                    <div className="w-full md:w-48 h-48 md:h-auto bg-[var(--bg-surface-2)] relative flex-shrink-0">
                                        {/* Placeholder generic avatar if no real image */}
                                        <div className="absolute inset-0 flex items-center justify-center text-[var(--text-muted)]">
                                            <User className="h-16 w-16" />
                                        </div>
                                    </div>
                                    <div className="p-6 flex flex-col justify-center w-full">
                                        <h3 className="text-xl font-bold text-[var(--text-primary)] mb-1">{faculty.name}</h3>
                                        <p className="text-[var(--primary)] font-medium mb-3">{faculty.role}</p>

                                        <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] mb-4">
                                            <GraduationCap className="h-4 w-4" />
                                            <span>{faculty.qualification}</span>
                                        </div>

                                        <p className="text-sm text-[var(--text-muted)] italic leading-relaxed">
                                            "{faculty.bio}"
                                        </p>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
