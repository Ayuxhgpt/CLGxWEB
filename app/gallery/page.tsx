"use client";

import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/Card";
import { UploadCloud, Image as ImageIcon } from "lucide-react";

export default function GalleryPage() {
    return (
        <div className="min-h-screen bg-[var(--bg-main)]">
            <Navbar />

            <main className="pt-24 pb-12 px-4">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">Gallery</h1>
                        <p className="text-[var(--text-secondary)]">Highlights from Satyadev College of Pharmacy.</p>
                    </div>

                    {/* Pending / Upload Section would go here (Referenced in legacy) */}

                    <section>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
                            <ImageIcon className="h-6 w-6 text-[var(--primary)]" /> Approved Photos
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                            <div className="aspect-video bg-[var(--bg-card)] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <img
                                    src="/assets/Building.jpg"
                                    alt="College Building"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="aspect-video bg-[var(--bg-card)] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <img
                                    src="/assets/pic1.jpg"
                                    alt="Campus View"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="aspect-video bg-[var(--bg-card)] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                <img
                                    src="/assets/scp.jpg"
                                    alt="College Logo"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </section>
                </div>
            </main >
        </div >
    );
}
