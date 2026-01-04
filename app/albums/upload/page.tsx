"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
    const [errorMessage, setErrorMessage] = useState("");

    // Metadata State
    const [title, setTitle] = useState("");
    const [subject, setSubject] = useState("");
    const [semester, setSemester] = useState("Semester 1");

    const router = useRouter();

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles?.length > 0) {
            setFile(acceptedFiles[0]);
            setStatus("idle");
            setErrorMessage("");
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
            'application/pdf': ['.pdf']
        },
        maxFiles: 1,
        multiple: false
    });

    const removeFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFile(null);
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setProgress(10); // Start progress

        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", file.type.startsWith("image/") ? "pharma_elevate_albums" : "pharma_elevate_notes");

        try {
            // Simulate progress
            const interval = setInterval(() => {
                setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
            }, 300);

            // Step 1: Upload to Cloudinary
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Upload failed");
            }

            // Step 2: Save Metadata to DB (If it's a Note)
            if (!file.type.startsWith('image/')) {
                // It's a Note (PDF)
                // We need extra fields (subject/semester/title) which should be in the form
                // For now, we'll auto-fill standard values or check if we need to add inputs to the UI.
                // *Self-Correction*: The UI doesn't have inputs for Subject/Semester yet!
                // We need to add them. But for this specific bug fix (Data Loss), the user prompt didn't explicitly ask for UI changes,
                // but we CANNOT save a note without them.
                // We will default them to "General" / "Semester 1" if missing, OR better, 
                // prompt the user. But `UploadPage` currently has no inputs.
                // Let's assume for now we hardcode "Uncategorized" so at least it saves, 
                // OR we can parse filename.
                // *Decision*: Update UI to include fields in NEXT STEP.
                // Here we just make the call.

                // WAIT: If we don't have fields, the DB will reject it (Required fields).
                // I need to add inputs to the JSX first. 
                // Let's assume we pass dummy data for now to fix the *connectivity*, and I will add inputs in the next tool call.

                const noteRes = await fetch("/api/notes", {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: title || file.name.replace('.pdf', ''),
                        subject: subject || "General",
                        semester: semester,
                        pdfUrl: data.url
                    })
                });

                if (!noteRes.ok) {
                    // Transaction Safety: Rollback Cloudinary
                    // console.error("DB Save failed, rolling back Cloudinary...");
                    // await fetch("/api/upload/rollback", { ... }) // If implemented
                    throw new Error("Failed to save note metadata. Please try again.");
                }
            }

            clearInterval(interval);
            setProgress(100);

            setStatus("success");
            setTimeout(() => {
                router.push("/dashboard");
            }, 2000);

        } catch (error: any) {
            setStatus("error");
            setErrorMessage(error.message);
            setProgress(0);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-main)]">
            <Navbar />
            <main className="max-w-4xl mx-auto px-4 pt-24 pb-12">
                <motion.div
                    initial={{ opacity: 0, y: 10 }} /* Ladder1: 10px rise */
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                >
                    <Card> {/* Defaults to ladder-card, no 'glass' prop needed */}
                        <CardHeader>
                            <CardTitle>Upload Content</CardTitle>
                            <CardDescription>
                                Share notes or images with the community. Max size 10MB.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            {/* Metadata Inputs (Only for Notes/PDFs) */}
                            {file?.type === 'application/pdf' && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="space-y-4 p-4 bg-[rgb(var(--bg-surface))] rounded-xl border border-[rgb(var(--border-subtle))]"
                                >
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-[rgb(var(--text-secondary))]">Title</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Pharmaceutical Analysis Unit 1"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="w-full p-2 rounded-lg bg-[rgb(var(--bg-main))] border border-[rgb(var(--border-subtle))] focus:border-[rgb(var(--primary))] text-[rgb(var(--text-primary))] outline-none transition-all"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-[rgb(var(--text-secondary))]">Subject</label>
                                            <input
                                                type="text"
                                                placeholder="e.g. Analysis"
                                                value={subject}
                                                onChange={(e) => setSubject(e.target.value)}
                                                className="w-full p-2 rounded-lg bg-[rgb(var(--bg-main))] border border-[rgb(var(--border-subtle))] focus:border-[rgb(var(--primary))] text-[rgb(var(--text-primary))] outline-none transition-all"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-[rgb(var(--text-secondary))]">Semester</label>
                                            <select
                                                value={semester}
                                                onChange={(e) => setSemester(e.target.value)}
                                                className="w-full p-2 rounded-lg bg-[rgb(var(--bg-main))] border border-[rgb(var(--border-subtle))] focus:border-[rgb(var(--primary))] text-[rgb(var(--text-primary))] outline-none transition-all"
                                            >
                                                {['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'].map(s => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Dropzone - Ladder1 Strict */}
                            <div
                                {...getRootProps()}
                                className={`
                                    relative border-2 border-dashed rounded-xl p-10 transition-all duration-200 cursor-pointer flex flex-col items-center justify-center text-center group
                                    ${isDragActive
                                        ? "border-[rgb(var(--primary))] bg-[rgb(var(--primary))]/5"
                                        : "border-[rgb(var(--border-subtle))] hover:border-[rgb(var(--primary))] hover:bg-[rgb(var(--bg-surface))]"
                                    }
                                    ${file ? "bg-[rgb(var(--bg-surface))] border-solid border-[rgb(var(--primary))]/20" : ""}
                                `}
                            >
                                <input {...getInputProps()} />

                                <AnimatePresence mode="wait">
                                    {!file ? (
                                        <motion.div
                                            key="empty"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="space-y-4"
                                        >
                                            <div className="p-4 rounded-full bg-[var(--surface)] inline-flex group-hover:scale-110 transition-transform duration-300">
                                                <Upload className="h-8 w-8 text-[var(--text-muted)] group-hover:text-[var(--primary)]" />
                                            </div>
                                            <div>
                                                <p className="text-lg font-medium text-[var(--text)]">
                                                    Drag & drop or <span className="text-[var(--primary)]">browse</span>
                                                </p>
                                                <p className="text-sm text-[var(--text-muted)] mt-1">
                                                    Supports PDF, JPG, PNG
                                                </p>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="file"
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="w-full flex items-center justify-between p-2"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <div className="p-3 bg-[var(--primary)]/10 rounded-lg">
                                                    <FileText className="h-8 w-8 text-[var(--primary)]" />
                                                </div>
                                                <div className="text-left">
                                                    <p className="font-medium text-[var(--text)] truncate max-w-[200px] sm:max-w-md">
                                                        {file.name}
                                                    </p>
                                                    <p className="text-xs text-[var(--text-muted)]">
                                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                            </div>
                                            {!uploading && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={removeFile}
                                                    className="hover:bg-red-500/10 hover:text-red-500"
                                                >
                                                    <X className="h-5 w-5" />
                                                </Button>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Progress Bar overlay */}
                                {uploading && (
                                    <div className="absolute inset-x-0 bottom-0 h-1 bg-[var(--surface)] overflow-hidden rounded-b-xl">
                                        <motion.div
                                            className="h-full bg-[var(--primary)]"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress}%` }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Status Messages */}
                            <AnimatePresence>
                                {status === "error" && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-3"
                                    >
                                        <AlertCircle className="h-5 w-5" />
                                        <span className="text-sm font-medium">{errorMessage}</span>
                                    </motion.div>
                                )}
                                {status === "success" && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="p-4 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 flex items-center gap-3"
                                    >
                                        <CheckCircle2 className="h-5 w-5" />
                                        <span className="text-sm font-medium">Upload successful! Redirecting...</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Actions */}
                            <div className="flex justify-end pt-4">
                                <Button
                                    onClick={handleUpload}
                                    disabled={!file || uploading || status === "success"}
                                    isLoading={uploading}
                                    size="lg"
                                    className="w-full sm:w-auto"
                                >
                                    {uploading ? "Uploading..." : "Upload Content"}
                                </Button>
                            </div>

                        </CardContent>
                    </Card>
                </motion.div>
            </main>
        </div>
    );
}
