"use client";

import Navbar from "@/components/Navbar";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import {
    Book, Activity, Pill, FlaskConical, Stethoscope,
    TrendingUp, Briefcase, ChevronDown, ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function PharmaKnowledge() {
    const [activeSection, setActiveSection] = useState("core");

    const scrollTo = (id: string) => {
        setActiveSection(id);
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const navItems = [
        { id: "core", label: "Core Concepts", icon: Book },
        { id: "profiles", label: "Drug Profiles", icon: Pill },
        { id: "pkpd", label: "PK / PD", icon: Activity },
        { id: "trials", label: "Clinical Trials", icon: FlaskConical },
        { id: "trends", label: "Future Trends", icon: TrendingUp },
    ];

    return (
        <div className="min-h-screen bg-[var(--bg-main)]">
            <Navbar />

            {/* Hero Header */}
            <div className="relative pt-32 pb-16 px-4 bg-gradient-to-b from-[var(--bg-surface-2)] to-[var(--bg-main)] border-b border-[var(--border-subtle)]">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-blue-500 mb-4"
                    >
                        Pharma Knowledge
                    </motion.h1>
                    <p className="text-lg text-[var(--text-secondary)] max-w-2xl mx-auto">
                        The complete guide for B.Pharm students. Master core concepts, drug profiles, and modern trends.
                    </p>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col lg:flex-row gap-8">

                {/* Sticky Sidebar Navigation */}
                <aside className="lg:w-64 flex-shrink-0">
                    <div className="sticky top-24 space-y-2">
                        <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4 px-2">
                            Contents
                        </h3>
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => scrollTo(item.id)}
                                className={cn(
                                    "w-full flex items-center p-3 rounded-lg text-sm font-medium transition-all duration-200",
                                    activeSection === item.id
                                        ? "bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] shadow-sm border border-[var(--accent-primary)]/20"
                                        : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)]"
                                )}
                            >
                                <item.icon className="h-4 w-4 mr-3 opacity-70" />
                                {item.label}
                                {activeSection === item.id && <ChevronRight className="h-3 w-3 ml-auto" />}
                            </button>
                        ))}
                    </div>
                </aside>

                {/* Content Area */}
                <div className="flex-1 space-y-16">

                    {/* Core Concepts */}
                    <section id="core" className="scroll-mt-24">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400"><Book className="h-6 w-6" /></div>
                            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Core Concepts</h2>
                        </div>
                        <div className="space-y-4">
                            <details className="group bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] open:border-[var(--accent-primary)]/50 transition-colors">
                                <summary className="flex items-center justify-between p-4 cursor-pointer list-none font-medium text-[var(--text-primary)]">
                                    <span className="flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-[var(--accent-primary)]" />
                                        Drug–Target Interaction
                                    </span>
                                    <ChevronDown className="h-4 w-4 text-[var(--text-muted)] group-open:rotate-180 transition-transform" />
                                </summary>
                                <div className="px-4 pb-4 pl-9 text-[var(--text-secondary)] leading-relaxed text-sm">
                                    Most drugs produce effects by binding to biological targets (receptors, ion channels, enzymes). Understand agonists (activate receptor), antagonists (block receptor), partial agonists, and allosteric modulators.
                                </div>
                            </details>

                            <details className="group bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] open:border-[var(--accent-primary)]/50 transition-colors">
                                <summary className="flex items-center justify-between p-4 cursor-pointer list-none font-medium text-[var(--text-primary)]">
                                    <span className="flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-purple-500" />
                                        Pharmacodynamics (PD)
                                    </span>
                                    <ChevronDown className="h-4 w-4 text-[var(--text-muted)] group-open:rotate-180 transition-transform" />
                                </summary>
                                <div className="px-4 pb-4 pl-9 text-[var(--text-secondary)] leading-relaxed text-sm">
                                    PD studies the relationship between drug concentration and effect. Key terms: potency (EC50), efficacy (Emax), therapeutic window, and tolerance.
                                </div>
                            </details>

                            <details className="group bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] open:border-[var(--accent-primary)]/50 transition-colors">
                                <summary className="flex items-center justify-between p-4 cursor-pointer list-none font-medium text-[var(--text-primary)]">
                                    <span className="flex items-center gap-3">
                                        <div className="h-2 w-2 rounded-full bg-orange-500" />
                                        Pharmacokinetics (ADME)
                                    </span>
                                    <ChevronDown className="h-4 w-4 text-[var(--text-muted)] group-open:rotate-180 transition-transform" />
                                </summary>
                                <div className="px-4 pb-4 pl-9 text-[var(--text-secondary)] leading-relaxed text-sm">
                                    <ul className="space-y-2 list-disc pl-4">
                                        <li><b>Absorption:</b> Bioavailability, first-pass effect.</li>
                                        <li><b>Distribution:</b> Volume of distribution (Vd), protein binding.</li>
                                        <li><b>Metabolism:</b> Phase I (CYP450), Phase II (conjugation).</li>
                                        <li><b>Excretion:</b> Renal filtration, tubular secretion.</li>
                                    </ul>
                                </div>
                            </details>
                        </div>
                    </section>

                    {/* Drug Profiles */}
                    <section id="profiles" className="scroll-mt-24">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400"><Pill className="h-6 w-6" /></div>
                            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Drug Profiles</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { name: "Paracetamol", class: "Analgesic", dose: "500-1000 mg", warn: "Hepatotoxicity", color: "text-blue-400" },
                                { name: "Ibuprofen", class: "NSAID", dose: "200-400 mg", warn: "GI Bleeding", color: "text-orange-400" },
                                { name: "Amoxicillin", class: "Antibiotic", dose: "250-500 mg", warn: "Penicillin Allergy", color: "text-green-400" },
                                { name: "Metformin", class: "Biguanide", dose: "500 mg - 2g", warn: "Lactic Acidosis", color: "text-pink-400" },
                            ].map((drug, i) => (
                                <Card key={i} className="p-5 border-l-4" style={{ borderLeftColor: 'var(--border-subtle)' }}>
                                    <h4 className={`text-xl font-bold mb-1 ${drug.color}`}>{drug.name}</h4>
                                    <span className="text-xs uppercase tracking-wide text-[var(--text-muted)] font-bold">{drug.class}</span>
                                    <div className="mt-4 space-y-2 text-sm text-[var(--text-secondary)]">
                                        <div className="flex justify-between border-b border-[var(--border-subtle)] pb-1">
                                            <span>Dose</span>
                                            <span className="font-mono text-[var(--text-primary)]">{drug.dose}</span>
                                        </div>
                                        <div className="flex justify-between pt-1">
                                            <span>Caution</span>
                                            <span className="text-red-400 font-medium">{drug.warn}</span>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </section>

                    {/* Placeholder Sections */}
                    <section id="pkpd" className="scroll-mt-24">
                        <Card className="bg-[var(--bg-surface-2)]/30 border-dashed">
                            <div className="flex flex-col items-center py-12 text-center">
                                <Activity className="h-12 w-12 text-[var(--text-muted)] mb-4" />
                                <h3 className="text-xl font-bold text-[var(--text-primary)]">PK / PD Deep Dive</h3>
                                <p className="text-[var(--text-secondary)]">Detailed graphs and calculations coming soon.</p>
                            </div>
                        </Card>
                    </section>

                </div>
            </main>
        </div>
    );
}
