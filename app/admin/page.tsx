"use client";

import { useState, useEffect } from "react";
import { logFrontendAudit } from "@/lib/audit-client";
import Navbar from "@/components/Navbar";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import {
    Upload, FileText, CheckCircle, ShieldAlert, Check, X,
    MoreHorizontal, Filter, Search, Calendar, User, ArrowRight, FolderPlus
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

    // Album Creation State
    const [albumForm, setAlbumForm] = useState({ title: "", description: "", year: new Date().getFullYear().toString() });
    const [creatingAlbum, setCreatingAlbum] = useState(false);

    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        if (session && session.user.role !== "admin") {
            router.push("/dashboard");
        } else if (session) {
            logFrontendAudit({
                domain: 'ADMIN',
                action: 'ADMIN_DASHBOARD_VIEW',
                result: 'SUCCESS',
            });
            fetchPendingContent();
        }
    }, [session]);

    // Track Admin View
    useEffect(() => {
        if (session?.user) {
            logFrontendAudit({
                domain: 'ADMIN',
                action: 'ADMIN_DASHBOARD_VIEW',
                result: 'SUCCESS',
            });
        }
    }, [session]);

    // Track Tab Switch
    const handleTabChange = (tab: 'images' | 'notes') => {
        setActiveTab(tab);
        logFrontendAudit({
            domain: 'ADMIN',
            action: 'ADMIN_VIEW_TAB',
            result: 'SUCCESS',
            metadata: { tab }
        });
    };

    const fetchPendingContent = async () => {
        try {
            const res = await fetch("/api/admin/pending");
            const data = await res.json();
            if (Array.isArray(data)) {
                setPendingData({ images: data, notes: [] });
            } else {
                const images = data.images || [];
                const notes = data.notes || [];
                setPendingData({ images, notes });

                // UX Improvement: Auto-switch to notes if images are empty but notes are pending
                if (images.length === 0 && notes.length > 0) {
                    handleTabChange('notes'); // Use handleTabChange here
                }
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, action: "approve" | "delete", type: "image" | "note") => {
        const auditAction = action === 'approve' ? 'CONTENT_APPROVE' : 'CONTENT_REJECT';

        try {
            logFrontendAudit({
                domain: 'ADMIN',
                action: `${auditAction}_ATTEMPT`,
                result: 'SUCCESS',
                metadata: { id, type }
            });

            const res = await fetch("/api/admin/approve", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, action, type }),
            });

            const data = await res.json();

            if (res.ok) {
                logFrontendAudit({
                    domain: 'ADMIN',
                    action: `${auditAction}_SUCCESS`,
                    result: 'SUCCESS',
                    metadata: { id, type }
                });
                toast({
                    type: "success",
                    message: "Status Updated",
                    description: `Successfully ${action}d the ${type}.`
                });
                fetchPending();
            } else {
                logFrontendAudit({
                    domain: 'ADMIN',
                    action: `${auditAction}_FAIL`,
                    result: 'FAIL',
                    errorCategory: 'API',
                    errorMessage: data.message,
                    metadata: { id, type }
                });
                toast({
                    type: "error",
                    message: "Action Failed",
                    description: data.message || "Something went wrong."
                });
            }
        } catch (error: any) {
            console.error(error);
            logFrontendAudit({
                domain: 'ADMIN',
                action: `${auditAction}_CRASH`,
                result: 'FAIL',
                errorCategory: 'UNKNOWN',
                errorMessage: error.message,
                metadata: { id, type }
            });
            toast({
                type: "error",
                message: "System Error",
                description: "Failed to communicate with the server."
            });
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
            // 1. Get Signature
            const folder = "pharma_elevate_notes";
            const timestamp = Math.round(new Date().getTime() / 1000);

            const signRes = await fetch("/api/upload/sign", {
                method: "POST",
                body: JSON.stringify({ folder, timestamp }),
            });

            if (!signRes.ok) throw new Error("Failed to get upload signature");
            const { signature, api_key, cloud_name } = await signRes.json();

            // 2. Direct Cloudinary Upload
            const clData = new FormData();
            clData.append("file", selectedFile);
            clData.append("api_key", api_key);
            clData.append("timestamp", timestamp.toString());
            clData.append("signature", signature);
            clData.append("folder", folder);
            clData.append("access_mode", "public");

            const clRes = await fetch(`https://api.cloudinary.com/v1_1/${cloud_name}/raw/upload`, {
                method: "POST",
                body: clData,
            });

            if (!clRes.ok) {
                const errorData = await clRes.json();
                throw new Error(errorData.error?.message || "Cloudinary upload failed");
            }

            const clResult = await clRes.json();

            // 3. Metadata Sync
            const res = await fetch("/api/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    secure_url: clResult.secure_url,
                    public_id: clResult.public_id,
                    folder,
                    title: noteForm.title,
                    subject: noteForm.subject,
                    semester: noteForm.semester
                })
            });

            if (res.ok) {
                toast({
                    type: "success",
                    message: "Note Published",
                    description: "Note published and auto-approved successfully."
                });
                setNoteForm({ title: "", semester: "Semester 1", subject: "" });
                setSelectedFile(null);
            } else {
                const data = await res.json();
                toast({
                    type: "error",
                    message: "Upload Failed",
                    description: data.message || "Unknown error"
                });
            }
        } catch (err: any) {
            console.error("Admin Upload Pipeline Failure:", err);
            setUploadError(err.message || "Upload failed.");
        } finally {
            setUploadingNote(false);
        }
    };

    const handleAlbumCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreatingAlbum(true);

        try {
            const res = await fetch("/api/albums", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(albumForm),
            });

            if (res.ok) {
                toast({
                    type: "success",
                    message: "Album Created",
                    description: `Album "${albumForm.title}" created successfully.`
                });
                setAlbumForm({ title: "", description: "", year: new Date().getFullYear().toString() });
            } else {
                const data = await res.json();
                toast({
                    type: "error",
                    message: "Creation Failed",
                    description: data.error || "Failed to create album."
                });
            }
        } catch (error) {
            console.error(error);
            toast({
                type: "error",
                message: "System Error",
                description: "Failed to communicate with the server."
            });
        } finally {
            setCreatingAlbum(false);
        }
    };

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
                                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                                    <FolderPlus className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-text-primary">Create Album</h3>
                                    <p className="text-xs text-text-secondary">For event photos.</p>
                                </div>
                            </div>

                            <form onSubmit={handleAlbumCreate} className="space-y-4">
                                <Input
                                    label="Album Title"
                                    placeholder="e.g. Annual Fest 2026"
                                    value={albumForm.title}
                                    onChange={(e) => setAlbumForm({ ...albumForm, title: e.target.value })}
                                    className="saas-input"
                                    required
                                />
                                <Input
                                    label="Description"
                                    placeholder="Short description..."
                                    value={albumForm.description}
                                    onChange={(e) => setAlbumForm({ ...albumForm, description: e.target.value })}
                                    className="saas-input"
                                />
                                <Input
                                    label="Year"
                                    type="number"
                                    value={albumForm.year}
                                    onChange={(e) => setAlbumForm({ ...albumForm, year: e.target.value })}
                                    className="saas-input"
                                    required
                                />
                                <Button
                                    type="submit"
                                    className="w-full mt-2 bg-purple-600 hover:bg-purple-700"
                                    disabled={creatingAlbum}
                                    isLoading={creatingAlbum}
                                >
                                    Create Album
                                </Button>
                            </form>
                        </div>

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
