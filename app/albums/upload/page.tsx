"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, FileText, CheckCircle2, AlertCircle, Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import Link from "next/link";

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);

    // Metadata State
    const [title, setTitle] = useState("");
    const [subject, setSubject] = useState("");
    const [semester, setSemester] = useState("Semester 1");
    const [albumId, setAlbumId] = useState("");
    const [albums, setAlbums] = useState<any[]>([]);
    const [loadingAlbums, setLoadingAlbums] = useState(false);

    const router = useRouter();
    const { toast } = useToast();

    const fetchAlbums = useCallback(async () => {
        setLoadingAlbums(true);
        try {
            const res = await fetch("/api/albums");
            if (res.ok) {
                const result = await res.json();
                if (result.success && result.data) {
                    const data = result.data;
                    setAlbums(data);
                    if (data.length > 0) setAlbumId(data[0]._id);
                }
            }
        } catch (error) {
            console.error("Failed to fetch albums:", error);
        } finally {
            setLoadingAlbums(false);
        }
    }, []);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles?.length > 0) {
            const droppedFile = acceptedFiles[0];
            setFile(droppedFile);
            if (droppedFile.type.startsWith("image/")) {
                fetchAlbums();
            }
        }
    }, [fetchAlbums]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
            'application/pdf': ['.pdf']
        },
        maxFiles: 1,
        maxSize: 4 * 1024 * 1024,
        multiple: false,
        onDropRejected: (fileRejections) => {
            const file = fileRejections[0];
            toast({
                type: "error",
                message: "File Upload Error",
                description: file.errors[0].message || "File rejected."
            });
        }
    });

    const removeFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFile(null);
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setProgress(5);

        try {
            // 1. Get Signature from our backend
            const folder = file.type.startsWith("image/") ? "pharma_elevate_albums" : "pharma_elevate_notes";
            const timestamp = Math.round(new Date().getTime() / 1000);

            const signRes = await fetch("/api/upload/sign", {
                method: "POST",
                body: JSON.stringify({ folder, timestamp }),
            });

            if (!signRes.ok) throw new Error("Failed to get upload signature");
            const { signature, api_key, cloud_name } = await signRes.json();

            setProgress(20);

            // 2. Upload DIRECTLY to Cloudinary
            const clData = new FormData();
            clData.append("file", file);
            clData.append("api_key", api_key);
            clData.append("timestamp", timestamp.toString());
            clData.append("signature", signature);
            clData.append("folder", folder);
            clData.append("access_mode", "public");

            const resourceType = file.type === 'application/pdf' ? 'raw' : 'image';
            const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloud_name}/${resourceType}/upload`;

            const clRes = await fetch(cloudinaryUrl, {
                method: "POST",
                body: clData,
            });

            if (!clRes.ok) {
                const errorData = await clRes.json();
                throw new Error(errorData.error?.message || "Cloudinary upload failed");
            }

            const clResult = await clRes.json();
            setProgress(70);

            // 3. Send Metadata to our backend for DB entry
            const backendPayload = {
                secure_url: clResult.secure_url,
                public_id: clResult.public_id,
                folder,
                albumId: file.type.startsWith("image/") ? albumId : null,
                title,
                subject,
                semester,
            };

            const backendRes = await fetch("/api/upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(backendPayload),
            });

            if (!backendRes.ok) {
                const errorData = await backendRes.json();
                throw new Error(errorData.message || "Database synchronization failed");
            }

            setProgress(100);
            toast({
                type: "success",
                message: "Upload Successful",
                description: "Your content has been submitted for review."
            });

            setTimeout(() => {
                router.push("/dashboard");
            }, 2000);

        } catch (error: any) {
            console.error("v3.0 Upload Pipeline Failure:", error);
            toast({
                type: "error",
                message: "Upload Failed",
                description: error.message || "Something went wrong."
            });
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
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                >
                    <Link href="/dashboard" className="inline-flex items-center text-sm text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--primary))] mb-6 transition-colors">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
                    </Link>
                    <Card> {/* Defaults to ladder-card, no 'glass' prop needed */}
                        <CardHeader>
                            <CardTitle>Upload Content</CardTitle>
                            <CardDescription>
                                Share notes or images with the community. Max size 4MB.
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

                            {/* Album Selection (Only for Images) */}
                            {file?.type.startsWith('image/') && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="space-y-4 p-4 bg-[rgb(var(--bg-surface))] rounded-xl border border-[rgb(var(--border-subtle))]"
                                >
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-[rgb(var(--text-secondary))]">Select Album</label>
                                        {loadingAlbums ? (
                                            <div className="flex items-center space-x-2 text-sm text-[rgb(var(--text-secondary))] italic">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span>Loading albums...</span>
                                            </div>
                                        ) : albums.length > 0 ? (
                                            <select
                                                value={albumId}
                                                onChange={(e) => setAlbumId(e.target.value)}
                                                className="w-full p-2 rounded-lg bg-[rgb(var(--bg-main))] border border-[rgb(var(--border-subtle))] focus:border-[rgb(var(--primary))] text-[rgb(var(--text-primary))] outline-none transition-all"
                                            >
                                                {albums.map((album) => (
                                                    <option key={album._id} value={album._id}>
                                                        {album.title} ({album.year})
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <p className="text-sm text-amber-500">No albums found. Admins must create an album first.</p>
                                        )}
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
                            {/* Actions */}
                            <div className="flex justify-end pt-4">
                                <Button
                                    onClick={handleUpload}
                                    disabled={!file || uploading}
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
