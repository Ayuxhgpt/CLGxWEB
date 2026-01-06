"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import {
    Upload, FileText, CheckCircle, ShieldAlert, Check, X,
    MoreHorizontal, Filter, Search, Calendar, User, ArrowRight
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
        // pdfUrl removed from form logic, using selectedFile
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [uploadingNote, setUploadingNote] = useState(false);
    const [uploadError, setUploadError] = useState("");
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
            fetchPending();
        } catch (error) {
            console.error(error);
        }
    };

    const handleNoteUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploadError("");

        if (!selectedFile) {
            setUploadError("Please upload a PDF file first.");
            return;
        }

        setUploadingNote(true);
        try {
            const formData = new FormData();
            formData.append("file", selectedFile);
            formData.append("folder", "pharma_elevate_notes");
            formData.append("title", noteForm.title);
            formData.append("subject", noteForm.subject);
            formData.append("semester", noteForm.semester);

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData
            });

            if (res.ok) {
                alert("Note published successfully!");
                setNoteForm({ title: "", semester: "Semester 1", subject: "" });
                setSelectedFile(null);
                // If it was pending (non-admin?), we'd fetchPending(). But admin auto-approves.
            } else {
                const data = await res.json();
                alert("Failed to upload note: " + (data.error || "Unknown error"));
            }
        } catch (err) {
            console.error(err);
            setUploadError("Upload failed.");
        } finally {
            setUploadingNote(false);
        }
    }

    const handlePdfSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            setUploadError("");
        }
    };

    if (loading) return null;

    return (
        <div className="min-h-screen bg-bg-page transition-colors duration-300">
            <Navbar />
            <main className="container mx-auto px-4 pt-24 pb-12 max-w-7xl">

                <motion.header
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500 border border-red-500/20">
                            <ShieldAlert className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-text-primary">Admin Console</h1>
                            <p className="text-text-secondary text-sm">Manage content and community submissions.</p>
                        </div>
                    </div>

                    <div className="flex bg-bg-surface p-1 rounded-lg border border-border-subtle">
                        <button
                            onClick={() => setActiveTab('images')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${activeTab === 'images' ? 'bg-bg-card shadow-sm text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
                        >
                            <User className="h-4 w-4" /> Images
                            <Badge variant={activeTab === 'images' ? "default" : "secondary"} className="ml-1 h-5 px-1.5 min-w-[1.25rem]">{pendingData.images.length}</Badge>
                        </button>
                        <button
                            onClick={() => setActiveTab('notes')}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${activeTab === 'notes' ? 'bg-bg-card shadow-sm text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
                        >
                            <FileText className="h-4 w-4" /> Notes
                            <Badge variant={activeTab === 'notes' ? "default" : "secondary"} className="ml-1 h-5 px-1.5 min-w-[1.25rem]">{pendingData.notes.length}</Badge>
                        </button>
                    </div>
                </motion.header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Table Area */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-2 space-y-4"
                    >
                        <div className="bg-bg-card border border-border-subtle rounded-xl overflow-hidden shadow-sm">
                            <div className="p-4 border-b border-border-subtle flex items-center justify-between bg-bg-surface/50">
                                <h3 className="font-semibold text-text-primary">Pending {activeTab === 'images' ? 'Images' : 'Notes'}</h3>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><Filter className="h-4 w-4" /></Button>
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                                </div>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs text-text-muted uppercase bg-[var(--bg-page)] border-b border-border-subtle h-10">
                                        <tr>
                                            <th className="px-6 font-medium w-1/3">Item</th>
                                            <th className="px-6 font-medium">Uploader</th>
                                            <th className="px-6 font-medium">Date</th>
                                            <th className="px-6 font-medium text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border-subtle">
                                        {activeTab === 'images' ? (
                                            pendingData.images.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="p-8">
                                                        <EmptyState title="No Images" description="Queue is empty." icon={CheckCircle} className="border-0 shadow-none bg-transparent" />
                                                    </td>
                                                </tr>
                                            ) : (
                                                pendingData.images.map((img) => (
                                                    <tr key={img._id} className="bg-bg-card hover:bg-bg-surface transition-colors h-16">
                                                        <td className="px-6 py-2">
                                                            <div className="flex items-center gap-4">
                                                                <div className="h-10 w-10 rounded bg-bg-surface border border-border-subtle overflow-hidden flex-shrink-0">
                                                                    <NextImage src={img.imageUrl || img.url} alt="" width={40} height={40} className="w-full h-full object-cover" unoptimized />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <div className="font-medium text-text-primary truncate max-w-[200px]">{img.album?.title || 'Unknown Album'}</div>
                                                                    <div className="text-xs text-text-secondary truncate max-w-[200px]">{img.caption}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold ring-1 ring-primary/20">
                                                                    {img.uploadedBy?.name?.[0] || '?'}
                                                                </div>
                                                                <span className="text-text-secondary truncate max-w-[120px]">{img.uploadedBy?.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-2 text-text-muted whitespace-nowrap text-xs">
                                                            {new Date(img.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-2 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-green-500 hover:text-green-600 hover:bg-green-500/10 border-green-500/20" onClick={() => handleAction(img._id, 'approve', 'image')}>
                                                                    <Check className="h-4 w-4" />
                                                                </Button>
                                                                <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10 border-red-500/20" onClick={() => handleAction(img._id, 'delete', 'image')}>
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )
                                        ) : (
                                            pendingData.notes.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="p-8">
                                                        <EmptyState title="No Notes" description="Queue is empty." icon={CheckCircle} className="border-0 shadow-none bg-transparent" />
                                                    </td>
                                                </tr>
                                            ) : (
                                                pendingData.notes.map((note) => (
                                                    <tr key={note._id} className="bg-bg-card hover:bg-bg-surface transition-colors h-16">
                                                        <td className="px-6 py-2">
                                                            <div className="flex items-center gap-4">
                                                                <div className="h-10 w-10 rounded bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                                                                    <FileText className="h-5 w-5" />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <div className="font-medium text-text-primary truncate max-w-[200px]">{note.title}</div>
                                                                    <a href={note.pdfUrl} target="_blank" className="text-xs text-primary hover:underline flex items-center gap-1">View PDF <ArrowRight className="h-3 w-3" /></a>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold ring-1 ring-primary/20">
                                                                    {note.uploadedBy?.name?.[0] || '?'}
                                                                </div>
                                                                <span className="text-text-secondary truncate max-w-[120px]">{note.uploadedBy?.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-2 text-text-muted whitespace-nowrap text-xs">
                                                            {new Date(note.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-2 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-green-500 hover:text-green-600 hover:bg-green-500/10 border-green-500/20" onClick={() => handleAction(note._id, 'approve', 'note')}>
                                                                    <Check className="h-4 w-4" />
                                                                </Button>
                                                                <Button size="sm" variant="outline" className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10 border-red-500/20" onClick={() => handleAction(note._id, 'delete', 'note')}>
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </motion.div>

                    {/* Sidebar Upload Panel */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-6"
                    >
                        <div className="bg-bg-card border border-border-subtle rounded-xl p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                    <Upload className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-text-primary">Publish Material</h3>
                                    <p className="text-xs text-text-secondary">Upload simplified notes.</p>
                                </div>
                            </div>

                            <form onSubmit={handleNoteUpload} className="space-y-4">
                                <Input
                                    label="Title"
                                    placeholder="e.g. Pharmaceutics Unit 1"
                                    value={noteForm.title}
                                    onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                                    className="saas-input"
                                    required
                                />

                                <div>
                                    <label className="block text-xs font-medium text-text-secondary mb-1.5">Subject</label>
                                    <Input
                                        type="text"
                                        placeholder="e.g. Pharmacology"
                                        value={noteForm.subject}
                                        onChange={(e) => setNoteForm({ ...noteForm, subject: e.target.value })}
                                        className="saas-input"
                                        required
                                    />
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-text-secondary mb-1.5">Semester</label>
                                        <select
                                            value={noteForm.semester}
                                            onChange={(e) => setNoteForm({ ...noteForm, semester: e.target.value })}
                                            className="w-full rounded-lg bg-bg-surface border border-border-subtle px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-text-primary"
                                        >
                                            {Array.from({ length: 8 }, (_, i) => `Semester ${i + 1}`).map(s => <option key={s} value={s} className="bg-bg-card">{s}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-text-secondary mb-1.5">Resource File {selectedFile && <span className="text-green-500 ml-2 text-[10px] uppercase tracking-wider font-bold">Selected</span>}</label>
                                        <div className="relative group cursor-pointer">
                                            <input
                                                type="file"
                                                accept="application/pdf"
                                                onChange={handlePdfSelect}
                                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                                            />
                                            <div className={`w-full p-2.5 rounded-lg border border-dashed flex items-center justify-center gap-2 transition-all ${selectedFile ? 'border-green-500/50 bg-green-500/10 text-green-500' : 'border-border-subtle bg-bg-surface text-text-muted group-hover:bg-bg-surface/80 group-hover:border-primary/50'}`}>
                                                {selectedFile ? <CheckCircle className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                                                <span className="text-sm font-medium truncate">{selectedFile ? selectedFile.name : 'Select PDF'}</span>
                                            </div>
                                        </div>
                                        {uploadError && <p className="text-xs text-red-500 mt-1">{uploadError}</p>}
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full mt-2"
                                    disabled={uploadingNote || !selectedFile}
                                    isLoading={uploadingNote}
                                >
                                    Publish Note
                                </Button>
                            </form>
                        </div>
                    </motion.div>

                </div>

            </main>
        </div>
    );
}
