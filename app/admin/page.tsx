"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import {
    Upload, FileText, CheckCircle, ShieldAlert, Check, X
} from "lucide-react";
import NextImage from "next/image";

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
    const [pendingData, setPendingData] = useState<{ images: any[]; notes: any[] }>({ images: [], notes: [] });
    const [activeTab, setActiveTab] = useState<'images' | 'notes'>('images');
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
            router.push("/dashboard");
        } else if (session) {
            fetchPending();
        }
    }, [session]);

    const fetchPending = async () => {
        try {
            const res = await fetch("/api/admin/pending");
            const data = await res.json();
            // Handle both legacy array (if any) and new object
            if (Array.isArray(data)) {
                setPendingData({ images: data, notes: [] });
            } else {
                setPendingData({ images: data.images || [], notes: data.notes || [] });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, action: "approve" | "delete", type: "image" | "note") => {
        try {
            await fetch("/api/admin/approve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, action, type }),
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

                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10 flex items-center gap-4"
                >
                    <div className="p-3 bg-red-500/10 rounded-xl text-red-500 ring-1 ring-red-500/20">
                        <ShieldAlert className="h-8 w-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Admin Console</h1>
                        <p className="text-[var(--text-secondary)]">Manage content and community submissions.</p>
                    </div>
                </motion.header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Note Upload Panel */}
                    <motion.section
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card glass className="h-full border-l-4 border-l-blue-500">
                            <CardHeader className="border-b border-[var(--border-subtle)]/50 pb-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                        <Upload className="h-5 w-5" />
                                    </div>
                                    <CardTitle>Publish Material</CardTitle>
                                </div>
                                <CardDescription>Upload course notes for students.</CardDescription>
                            </CardHeader>

                            <CardContent>
                                <form onSubmit={handleNoteUpload} className="space-y-5">
                                    <Input
                                        label="Title"
                                        placeholder="e.g. Pharmaceutics Unit 1"
                                        value={noteForm.title}
                                        onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                                        required
                                    />

                                    <div>
                                        <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Subject</label>
                                        <Input
                                            type="text"
                                            placeholder="e.g. Pharmacology"
                                            value={noteForm.subject}
                                            onChange={(e) => setNoteForm({ ...noteForm, subject: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Semester</label>
                                            <select
                                                value={noteForm.semester}
                                                onChange={(e) => setNoteForm({ ...noteForm, semester: e.target.value })}
                                                className="glass-input w-full rounded-md px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                                            >
                                                {Array.from({ length: 8 }, (_, i) => `Semester ${i + 1}`).map(s => <option key={s} value={s} className="bg-[var(--bg-surface)]">{s}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Resource File</label>
                                            <div className="relative group cursor-pointer">
                                                <input
                                                    type="file"
                                                    accept="application/pdf"
                                                    onChange={handlePdfSelect}
                                                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                                                />
                                                <div className={`w-full p-2.5 rounded-md border border-dashed flex items-center justify-center gap-2 transition-all ${noteForm.pdfUrl ? 'border-green-500/50 bg-green-500/10 text-green-400' : 'border-[var(--text)/0.2] bg-[var(--surface)/0.5] text-[var(--text-muted)] group-hover:bg-[var(--surface)] group-hover:border-[var(--primary)/0.5]'}`}>
                                                    {noteForm.pdfUrl ? <CheckCircle className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                                                    <span className="text-sm font-medium truncate">{noteForm.pdfUrl ? 'Ready' : 'Select PDF'}</span>
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
                            </CardContent>
                        </Card>
                    </motion.section>

                    {/* Pending Approvals Panel */}
                    <motion.section
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-[var(--text-primary)] flex items-center gap-2">
                                Pending Approvals
                            </h2>
                            <div className="flex bg-[var(--bg-surface-2)] p-1 rounded-lg">
                                <button
                                    onClick={() => setActiveTab('images')}
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${activeTab === 'images' ? 'bg-white text-black shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                                >
                                    Images ({pendingData.images.length})
                                </button>
                                <button
                                    onClick={() => setActiveTab('notes')}
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${activeTab === 'notes' ? 'bg-white text-black shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                                >
                                    Notes ({pendingData.notes.length})
                                </button>
                            </div>
                        </div>

                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                            <AnimatePresence mode="wait">
                                {activeTab === 'images' ? (
                                    pendingData.images.length === 0 ? (
                                        <EmptyState
                                            key="empty-images"
                                            title="No Pending Images"
                                            description="All caught up on image approvals."
                                            icon={CheckCircle}
                                        />
                                    ) : (
                                        pendingData.images.map((img) => (
                                            <motion.div
                                                key={img._id}
                                                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                                animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                                                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                            >
                                                <Card className="flex flex-col sm:flex-row gap-4 p-4 items-start bg-[var(--surface)]/50 border-[var(--border-subtle)] hover:bg-[var(--surface)] transition-colors">
                                                    <div className="h-24 w-24 flex-shrink-0 rounded-lg overflow-hidden bg-[var(--bg-main)] border border-[var(--border-subtle)] shadow-sm group">
                                                        <NextImage
                                                            src={img.imageUrl || img.url} // Handle legacy naming if needed
                                                            alt="Pending"
                                                            width={96}
                                                            height={96}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                            unoptimized
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0 w-full">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <h4 className="font-bold text-[var(--text-primary)] truncate pr-2" title={img.album?.title}>{img.album?.title || 'No Album'}</h4>
                                                            <span className="text-[10px] bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] px-2 py-1 rounded text-[var(--text-secondary)] whitespace-nowrap">
                                                                {new Date(img.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-[var(--text-secondary)] mb-3 line-clamp-2">"{img.caption || 'No caption'}"</p>
                                                        <div className="flex items-center justify-between mt-auto">
                                                            <p className="text-xs text-[var(--text-muted)]">By: <span className="text-[var(--text-primary)] font-medium">{img.uploadedBy?.name || 'Unknown'}</span></p>

                                                            <div className="flex gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    className="h-8 bg-green-500 hover:bg-green-600 text-white border-0 shadow-lg shadow-green-500/20"
                                                                    onClick={() => handleAction(img._id, 'approve', 'image')}
                                                                >
                                                                    <Check className="h-4 w-4 mr-1" /> Approve
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    className="h-8 shadow-lg shadow-red-500/20"
                                                                    onClick={() => handleAction(img._id, 'delete', 'image')}
                                                                >
                                                                    <X className="h-4 w-4 mr-1" /> Reject
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Card>
                                            </motion.div>
                                        ))
                                    )
                                ) : (
                                    pendingData.notes.length === 0 ? (
                                        <EmptyState
                                            key="empty-notes"
                                            title="No Pending Notes"
                                            description="All caught up on note approvals."
                                            icon={FileText}
                                        />
                                    ) : (
                                        pendingData.notes.map((note) => (
                                            <motion.div
                                                key={note._id}
                                                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                                                animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                                                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                                            >
                                                <Card className="flex flex-col sm:flex-row gap-4 p-4 items-start bg-[var(--surface)]/50 border-[var(--border-subtle)] hover:bg-[var(--surface)] transition-colors">
                                                    <div className="h-24 w-24 flex-shrink-0 flex items-center justify-center rounded-lg bg-[var(--bg-main)] border border-[var(--border-subtle)] shadow-sm">
                                                        <FileText className="h-10 w-10 text-[var(--primary)]" />
                                                    </div>
                                                    <div className="flex-1 min-w-0 w-full">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <h4 className="font-bold text-[var(--text-primary)] truncate pr-2" title={note.title}>{note.title}</h4>
                                                            <span className="text-[10px] bg-[var(--bg-surface-2)] border border-[var(--border-subtle)] px-2 py-1 rounded text-[var(--text-secondary)] whitespace-nowrap">
                                                                {new Date(note.createdAt).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-[var(--text-secondary)] line-clamp-1">{note.subject} • {note.semester}</p>
                                                        <a href={note.pdfUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--primary)] hover:underline mb-3 block">View PDF</a>

                                                        <div className="flex items-center justify-between mt-auto">
                                                            <p className="text-xs text-[var(--text-muted)]">By: <span className="text-[var(--text-primary)] font-medium">{note.uploadedBy?.name || 'Unknown'}</span></p>

                                                            <div className="flex gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    className="h-8 bg-green-500 hover:bg-green-600 text-white border-0 shadow-lg shadow-green-500/20"
                                                                    onClick={() => handleAction(note._id, 'approve', 'note')}
                                                                >
                                                                    <Check className="h-4 w-4 mr-1" /> Approve
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="destructive"
                                                                    className="h-8 shadow-lg shadow-red-500/20"
                                                                    onClick={() => handleAction(note._id, 'delete', 'note')}
                                                                >
                                                                    <X className="h-4 w-4 mr-1" /> Reject
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Card>
                                            </motion.div>
                                        ))
                                    )
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.section>
                </div>

            </main>
        </div>
    );
}
