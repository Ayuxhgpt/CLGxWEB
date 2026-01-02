"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import {
    Upload, FileText, CheckCircle, XCircle,
    ShieldAlert, Search, RefreshCw, Calendar
} from "lucide-react";

interface PendingImage {
    _id: string;
    url: string;
    caption: string;
    uploadedBy: {
        name: string;
        email: string;
    };
    album: {
        title: string;
    };
    createdAt: string;
}

export default function AdminDashboard() {
    const { data: session } = useSession();
    const [pendingImages, setPendingImages] = useState<PendingImage[]>([]);
    const [loading, setLoading] = useState(true);

    // Note Upload State
    const [noteForm, setNoteForm] = useState({
        title: "",
        semester: "Semester 1",
        subject: "",
        pdfUrl: ""
    });
    const [uploadingNote, setUploadingNote] = useState(false);

    const router = useRouter();

    useEffect(() => {
        if (session && session.user.role !== "admin") {
            // Client-side redirect if not admin
            router.push("/dashboard");
        } else if (session) {
            fetchPending();
        }
    }, [session]);

    const fetchPending = async () => {
        try {
            const res = await fetch("/api/admin/pending");
            const data = await res.json();
            setPendingImages(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, action: "approve" | "delete") => {
        try {
            await fetch("/api/admin/approve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, action }),
            });
            fetchPending(); // Refresh list
        } catch (error) {
            console.error(error);
        }
    };

    const handleNoteUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploadingNote(true);
        try {
            const res = await fetch("/api/notes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(noteForm)
            });
            if (res.ok) {
                alert("Note published successfully!");
                setNoteForm({ title: "", semester: "Semester 1", subject: "", pdfUrl: "" });
            } else {
                alert("Failed to upload note.");
            }
        } catch (err) {
            console.error(err);
        } finally {
            setUploadingNote(false);
        }
    }

    const handlePdfSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const data = new FormData();
        data.append("file", file);
        data.append("folder", "pharma_elevate_notes");

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: data,
            });
            const result = await res.json();
            if (result.url) {
                setNoteForm(prev => ({ ...prev, pdfUrl: result.url }));
            }
        } catch (err) {
            alert("Upload failed.");
        }
    };

    if (loading) return null;

    return (
        <div className="min-h-screen bg-[var(--bg-main)]">
            <Navbar />
            <main className="container mx-auto px-4 pt-24 pb-12">

                <header className="mb-10 flex items-center gap-4">
                    <div className="p-3 bg-red-500/10 rounded-xl text-red-500">
                        <ShieldAlert className="h-8 w-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Admin Console</h1>
                        <p className="text-[var(--text-secondary)]">Manage content and community submissions.</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Note Upload Panel */}
                    <section>
                        <Card className="h-full border-l-4 border-l-blue-500">
                            <div className="flex items-center gap-3 mb-6 border-b border-[var(--border-subtle)] pb-4">
                                <Upload className="h-5 w-5 text-blue-400" />
                                <h2 className="text-xl font-bold text-[var(--text-primary)]">Publish Material</h2>
                            </div>

                            <form onSubmit={handleNoteUpload} className="space-y-6">
                                <Input
                                    label="Title"
                                    placeholder="e.g. Pharmaceutics Unit 1"
                                    value={noteForm.title}
                                    onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                                />

                                <div>
                                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Subject</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Pharmacology"
                                        value={noteForm.subject}
                                        onChange={(e) => setNoteForm({ ...noteForm, subject: e.target.value })}
                                        className="w-full bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl p-3 text-[var(--text-primary)] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Semester</label>
                                        <select
                                            value={noteForm.semester}
                                            onChange={(e) => setNoteForm({ ...noteForm, semester: e.target.value })}
                                            className="w-full bg-[var(--bg-main)] border border-[var(--border-subtle)] rounded-xl p-3 text-[var(--text-primary)] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        >
                                            {Array.from({ length: 8 }, (_, i) => `Semester ${i + 1}`).map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Resource File</label>
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept="application/pdf"
                                                onChange={handlePdfSelect}
                                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                                            />
                                            <div className={`w-full p-3 rounded-xl border border-dashed flex items-center justify-center gap-2 transition-colors ${noteForm.pdfUrl ? 'border-green-500/50 bg-green-500/10 text-green-400' : 'border-[var(--border-subtle)] bg-[var(--bg-main)] text-[var(--text-muted)]'}`}>
                                                {noteForm.pdfUrl ? <CheckCircle className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                                                <span className="text-xs font-bold truncate">{noteForm.pdfUrl ? 'Ready to Publish' : 'Select PDF'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full"
                                    disabled={uploadingNote || !noteForm.pdfUrl}
                                    isLoading={uploadingNote}
                                >
                                    Publish Note
                                </Button>
                            </form>
                        </Card>
                    </section>

                    {/* Pending Approvals Panel */}
                    <section>
                        <h2 className="text-xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                            Pending Approvals <span className="bg-red-500/20 text-red-400 text-xs px-2 py-1 rounded-full">{pendingImages.length}</span>
                        </h2>

                        <div className="space-y-4">
                            <AnimatePresence>
                                {pendingImages.length === 0 ? (
                                    <EmptyState
                                        title="All Caught Up"
                                        description="There are no pending images to review."
                                        icon={CheckCircle}
                                    />
                                ) : (
                                    pendingImages.map((img) => (
                                        <motion.div
                                            key={img._id}
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: "auto" }}
                                            exit={{ opacity: 0, height: 0 }}
                                        >
                                            <Card className="flex gap-4 p-4 items-start">
                                                <div className="h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-[var(--bg-main)]">
                                                    <img src={img.url} alt="Pending" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4 className="font-bold text-[var(--text-primary)] truncate" title={img.album.title}>{img.album.title}</h4>
                                                        <span className="text-[10px] bg-[var(--bg-surface-2)] px-2 py-0.5 rounded text-[var(--text-secondary)]">
                                                            {new Date(img.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-[var(--text-secondary)] mb-2 italic">"{img.caption || 'No caption'}"</p>
                                                    <p className="text-xs text-[var(--text-muted)] mb-3">By: {img.uploadedBy.name}</p>

                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            className="h-8 bg-green-600 hover:bg-green-700 text-white border-0"
                                                            onClick={() => handleAction(img._id, 'approve')}
                                                        >
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="destructive"
                                                            className="h-8"
                                                            onClick={() => handleAction(img._id, 'delete')}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </div>
                                                </div>
                                            </Card>
                                        </motion.div>
                                    ))
                                )}
                            </AnimatePresence>
                        </div>
                    </section>
                </div>

            </main>
        </div>
    );
}
