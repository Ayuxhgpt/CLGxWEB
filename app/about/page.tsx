"use client";

import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/Card";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[var(--bg-main)]">
            <Navbar />

            <main className="pt-24 pb-12 px-4">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-8 text-center">About The Project</h1>

                    <Card className="p-8 md:p-12 leading-relaxed">
                        <section className="mb-8">
                            <h2 className="text-2xl font-bold text-[var(--primary)] mb-4">About This Project</h2>
                            <p className="text-[var(--text-secondary)] mb-4">
                                <strong>PharmaElevate</strong> is a web project created as part of the Bachelor of Pharmacy curriculum at <strong>Satyadev College Of Pharmacy</strong>. The goal is to present pharmacy knowledge, student resources, and healthcare awareness in a clean, professional, and educational format.
                            </p>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Project Credits</h2>
                            <ul className="list-disc pl-5 space-y-2 text-[var(--text-secondary)]">
                                <li><strong>Main Lead:</strong> Ayush Gupta — Lead Developer & Designer</li>
                                <li><strong>Support & Research:</strong> Saksham Gupta — Content Contributor & Research Assistant</li>
                            </ul>
                        </section>

                        <section className="mb-8">
                            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4">Acknowledgements</h2>
                            <p className="text-[var(--text-secondary)]">
                                We thank our faculty and mentors at Satyadev College Of Pharmacy for guidance and support during this project.
                            </p>
                        </section>

                        <section className="pt-6 border-t border-[var(--border-subtle)]">
                            <h2 className="text-lg font-bold text-[var(--text-muted)] mb-2 uppercase tracking-wide">Purpose & Limitations</h2>
                            <p className="text-sm text-[var(--text-muted)]">
                                This site is a student-built demo: the drug information provided is a simplified educational summary and is not a substitute for professional medical advice or prescriptions.
                            </p>
                        </section>
                    </Card>
                </div>
            </main>
        </div>
    );
}
