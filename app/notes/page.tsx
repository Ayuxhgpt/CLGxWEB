"use client";

import Navbar from "@/components/Navbar";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Search, FileText, Download, Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface Note {
    _id: string;
    title: string;
    subject: string;
    semester: string;
    pdfUrl: string;
    uploadedBy: { name: string };
    createdAt: string;
}

const semesters = [
    "Semester 1", "Semester 2", "Semester 3", "Semester 4",
    "Semester 5", "Semester 6", "Semester 7", "Semester 8"
];

export default function NotesPage() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSemester, setSelectedSemester] = useState("Semester 1");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchNotes = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams();
                if (selectedSemester) params.append("semester", selectedSemester);
                if (searchQuery) params.append("subject", searchQuery);

                const res = await fetch(`/api/notes?${params.toString()}`);
                if (res.ok) {
                    const result = await res.json();
                    if (result.success && result.data) {
                        setNotes(result.data);
                    }
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        const debounce = setTimeout(fetchNotes, 300);
        return () => clearTimeout(debounce);
    }, [selectedSemester, searchQuery]);

    return (
        <div className="min-h-screen bg-[var(--bg-main)]">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Study Notes</h1>
                        <p className="text-[var(--text-secondary)] mt-1">
                            Curated resources sorted by semester.
                        </p>
                    </div>
                    <div className="w-full md:w-72">
                        <Input
                            placeholder="Search subjects..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            icon={<Search className="h-4 w-4" />}
                        />
                    </div>
                </div>

                {/* Semester Pills */}
                <div className="mb-8 overflow-x-auto pb-2 scrollbar-hide">
                    <div className="flex space-x-2">
                        {semesters.map((sem) => (
                            <button
                                key={sem}
                                onClick={() => setSelectedSemester(sem)}
                                className={cn(
                                    "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                                    selectedSemester === sem
                                        ? "bg-[var(--accent-primary)] text-white shadow-lg shadow-cyan-500/20"
                                        : "bg-[var(--bg-surface-2)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]"
                                )}
                            >
                                {sem}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Grid */}
                <AnimatePresence mode="wait">
                    {loading ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <Card key={i} className="h-48">
                                    <Skeleton className="h-6 w-3/4 mb-4" />
                                    <Skeleton className="h-4 w-1/2 mb-2" />
                                    <Skeleton className="h-4 w-1/3 mb-6" />
                                    <Skeleton className="h-10 w-full mt-auto" />
                                </Card>
                            ))}
                        </motion.div>
                    ) : notes.length > 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {notes.map((note) => (
                                <Card key={note._id} className="group flex flex-col h-full hover:border-blue-500/50 transition-all duration-300">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 text-xs font-semibold uppercase tracking-wider border border-blue-500/20">
                                            {note.subject}
                                        </span>
                                        <span className="text-[var(--text-muted)] text-xs flex items-center">
                                            <Calendar className="h-3 w-3 mr-1" />
                                            {new Date(note.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className="mb-4 flex-grow">
                                        <h3 className="text-lg font-bold text-[var(--text-primary)] line-clamp-2 leading-tight group-hover:text-[var(--accent-primary)] transition-colors">
                                            {note.title}
                                        </h3>
                                        <div className="flex items-center mt-2 text-xs text-[var(--text-secondary)]">
                                            <User className="h-3 w-3 mr-1" />
                                            Uploaded by {note.uploadedBy?.name || "Admin"}
                                        </div>
                                    </div>

                                    <div className="mt-auto pt-4 border-t border-[var(--border-subtle)]">
                                        <a href={`/api/notes/download?id=${note._id}`} target="_blank" rel="noopener noreferrer">
                                            <Button variant="secondary" className="w-full group-hover:bg-[var(--accent-primary)] group-hover:text-white group-hover:border-transparent transition-all">
                                                <Download className="mr-2 h-4 w-4" /> Download PDF
                                            </Button>
                                        </a>
                                    </div>
                                </Card>
                            ))}
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                        >
                            <EmptyState
                                title={`No notes found for ${selectedSemester}`}
                                description="Be the first to contribute notes for this semester!"
                                icon={FileText}
                                className="py-20"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
