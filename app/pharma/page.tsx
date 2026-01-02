'use client';

import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function PharmaKnowledge() {
    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />

            {/* HERO */}
            <section className="hero py-14 px-5">
                <div className="container narrow text-left text-white">
                    <h1 className="text-4xl font-bold mb-2 text-white">Pharma Knowledge — Complete Guide for B.Pharm</h1>
                    <p className="lead text-lg text-blue-100 mb-4">
                        Core concepts, drug profiles, safe use, pharmacology basics, clinical insights, and the modern trends shaping pharmacy careers.
                    </p>
                    <div className="flex gap-3 flex-wrap mt-3">
                        <a href="#core" className="btn btn-primary">Start Learning</a>
                        <a href="#profiles" className="btn btn-ghost">Drug Profiles</a>
                        <Link href="/gallery" className="btn btn-ghost">Open Gallery</Link>
                    </div>
                </div>
            </section>

            <main className="container narrow pb-20">
                {/* TOC */}
                <nav aria-label="Page sections" className="my-6 flex gap-3 flex-wrap">
                    <a className="btn btn-ghost text-sm py-2 px-4" href="#core">Core Concepts</a>
                    <a className="btn btn-ghost text-sm py-2 px-4" href="#profiles">Drug Profiles</a>
                    <a className="btn btn-ghost text-sm py-2 px-4" href="#pkpd">PK / PD</a>
                    <a className="btn btn-ghost text-sm py-2 px-4" href="#trials">Clinical Trials</a>
                    <a className="btn btn-ghost text-sm py-2 px-4" href="#pv">Pharmacovigilance</a>
                    <a className="btn btn-ghost text-sm py-2 px-4" href="#trends">Trends</a>
                    <a className="btn btn-ghost text-sm py-2 px-4" href="#careers">Careers</a>
                </nav>

                {/* CORE CONCEPTS */}
                <section id="core" className="section py-10">
                    <h2 className="text-2xl font-bold text-accent mb-4">Core Concepts — the foundation</h2>
                    <p className="lead text-gray-400 mb-6">These are the core ideas every pharmacy student should master: drug–target interactions, ADME, PD (dose–effect), safety margins and interactions.</p>

                    <div className="space-y-4">
                        <details open className="bg-white/5 rounded-xl p-4 shadow-lg group">
                            <summary className="cursor-pointer font-bold text-lg flex items-center gap-3 list-none">
                                <i className="fa fa-dot-circle text-accent"></i> Drug–Target Interaction
                            </summary>
                            <div className="mt-3 text-gray-300 leading-relaxed pl-7">
                                <p>Most drugs produce effects by binding to biological targets (receptors, ion channels, enzymes). Understand agonists (activate receptor), antagonists (block receptor), partial agonists, inverse agonists and allosteric modulators. Receptor occupancy and downstream signalling determine magnitude of response.</p>
                            </div>
                        </details>

                        <details className="bg-white/5 rounded-xl p-4 shadow-lg group">
                            <summary className="cursor-pointer font-bold text-lg flex items-center gap-3 list-none">
                                <i className="fa fa-vial text-accent"></i> Pharmacodynamics (PD)
                            </summary>
                            <div className="mt-3 text-gray-300 leading-relaxed pl-7">
                                <p>PD studies the relationship between drug concentration at the site of action and the resulting effect. Key terms: potency (EC<sub>50</sub>), efficacy (Emax), therapeutic window, and tolerance. Visualise dose–response curves to compare agents.</p>
                            </div>
                        </details>

                        <details className="bg-white/5 rounded-xl p-4 shadow-lg group">
                            <summary className="cursor-pointer font-bold text-lg flex items-center gap-3 list-none">
                                <i className="fa fa-exchange-alt text-accent"></i> Pharmacokinetics (ADME)
                            </summary>
                            <div className="mt-3 text-gray-300 leading-relaxed pl-7">
                                <p>ADME = Absorption, Distribution, Metabolism, Excretion. These determine the time-course and intensity of drug action:</p>
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li><b>Absorption</b> — oral bioavailability, first-pass effect.</li>
                                    <li><b>Distribution</b> — volume of distribution (Vd), protein binding differences.</li>
                                    <li><b>Metabolism</b> — Phase I (CYP450 oxidation), Phase II (conjugation). Enzyme induction/inhibition cause interactions.</li>
                                    <li><b>Excretion</b> — renal (glomerular filtration, tubular secretion) and biliary routes.</li>
                                </ul>
                                <div className="mt-4 p-3 bg-yellow-900/30 border-l-4 border-yellow-500 rounded text-yellow-100 text-sm">
                                    <strong>Tip:</strong> Half-life (t<sub>1/2</sub>) and clearance (Cl) control dosing intervals. Formula: <span className="font-mono bg-black/30 px-1 rounded">t1/2 = 0.693 × Vd / Cl</span>
                                </div>
                            </div>
                        </details>
                    </div>
                </section>

                {/* DRUG PROFILES */}
                <section id="profiles" className="section py-10">
                    <h2 className="text-2xl font-bold text-accent mb-4">Drug Profiles — quick reference</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                        <div className="bg-white/5 p-4 rounded-xl shadow-lg hover:translate-y-[-5px] transition-transform duration-300">
                            <h4 className="text-xl font-bold text-blue-400 mb-2">Paracetamol</h4>
                            <p className="text-sm text-gray-300"><b>Class:</b> Analgesic / antipyretic</p>
                            <p className="text-sm text-gray-300 mt-1"><b>Dose:</b> 500–1000 mg q4–6h</p>
                            <div className="mt-3 text-xs bg-red-900/30 text-red-200 p-2 rounded">Caution: Hepatotoxicity in overdose.</div>
                        </div>

                        <div className="bg-white/5 p-4 rounded-xl shadow-lg hover:translate-y-[-5px] transition-transform duration-300">
                            <h4 className="text-xl font-bold text-blue-400 mb-2">Ibuprofen</h4>
                            <p className="text-sm text-gray-300"><b>Class:</b> NSAID</p>
                            <p className="text-sm text-gray-300 mt-1"><b>Dose:</b> 200–400 mg q4–6h</p>
                            <div className="mt-3 text-xs bg-red-900/30 text-red-200 p-2 rounded">Caution: GI bleeding, renal impairment.</div>
                        </div>

                        <div className="bg-white/5 p-4 rounded-xl shadow-lg hover:translate-y-[-5px] transition-transform duration-300">
                            <h4 className="text-xl font-bold text-blue-400 mb-2">Amoxicillin</h4>
                            <p className="text-sm text-gray-300"><b>Class:</b> β-lactam antibiotic</p>
                            <p className="text-sm text-gray-300 mt-1"><b>Dose:</b> 250–500 mg q8h</p>
                            <div className="mt-3 text-xs bg-red-900/30 text-red-200 p-2 rounded">Caution: Penicillin allergy.</div>
                        </div>

                        <div className="bg-white/5 p-4 rounded-xl shadow-lg hover:translate-y-[-5px] transition-transform duration-300">
                            <h4 className="text-xl font-bold text-blue-400 mb-2">Metformin</h4>
                            <p className="text-sm text-gray-300"><b>Class:</b> Biguanide</p>
                            <p className="text-sm text-gray-300 mt-1"><b>Dose:</b> 500 mg BID to 2g/day</p>
                            <div className="mt-3 text-xs bg-red-900/30 text-red-200 p-2 rounded">Caution: Lactic acidosis (rare), renal check.</div>
                        </div>
                    </div>
                </section>

                {/* References */}
                <section id="references" className="section py-10 border-t border-white/10">
                    <h2 className="text-xl font-bold mb-4">References</h2>
                    <ol className="list-decimal pl-5 text-gray-400 text-sm space-y-2">
                        <li>WHO — Pharmacovigilance: definition, objectives & programme overview.</li>
                        <li>Comprehensive review: AI in drug discovery (PMC).</li>
                        <li>Telepharmacy reviews & evidence summaries (PMC, MDPI).</li>
                        <li>FDA — Drug development & clinical research phases.</li>
                    </ol>
                </section>

            </main>

            {/* FOOTER */}
            <footer className="footer py-8 bg-black/50 border-t border-white/10">
                <div className="container text-center">
                    <p className="text-gray-400 text-sm">© 2025 PharmaElevate — Developed by Ayush & Saksham</p>
                </div>
            </footer>
        </div>
    );
}
