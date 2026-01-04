"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import {
    Image as ImageIcon, UploadCloud, ArrowLeft, Calendar, User, Download, Share2, ChevronLeft, X
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AlbumDetails() {
    const { data: session } = useSession();
    const params = useParams();
    const [album, setAlbum] = useState<any>(null);
    const [images, setImages] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);
    const [albumId, setAlbumId] = useState<string | null>(null);

    // Upload Form State
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [caption, setCaption] = useState("");

    useEffect(() => {
        if (params?.id) fetchDetails();
    }, [params?.id]);

    const fetchDetails = async () => {
        const res = await fetch(`/api/albums/${params?.id}`);
        if (res.ok) {
            const data = await res.json();
            setAlbum(data.album);
            setImages(data.images);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) return;
        setUploading(true);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("albumId", params?.id as string);
        formData.append("caption", caption);

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                alert("Memory uploaded successfully! It will appear after approval.");
                setFile(null);
                setCaption("");
                setIsUploadOpen(false);
            } else {
                alert("Upload failed");
            }
        } catch (error) {
            console.error(error);
            alert("Upload error");
        } finally {
            setUploading(false);
        }
    };

    if (!album) return (
        <div className="min-h-screen bg-[var(--bg-main)]">
            <Navbar />
            <div className="container mx-auto pt-32 px-4 text-center">Loading...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[var(--bg-main)]">
            <Navbar />

            {/* Hero / Header */}
            <div className="relative pt-32 pb-12 px-4 bg-gradient-to-b from-[var(--bg-surface-2)] to-[var(--bg-main)] border-b border-[var(--border-subtle)]">
                <div className="container mx-auto max-w-7xl">
                    <Link href="/albums" className="inline-flex items-center text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] mb-6 transition-colors">
                        <ChevronLeft className="h-4 w-4 mr-1" /> Back to Albums
                    </Link>

                    <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 rounded-full bg-[var(--accent-primary)]/10 text-[var(--accent-primary)] text-xs font-bold uppercase tracking-wider">
                                    {album.year}
                                </span>
                                <span className="text-[var(--text-muted)] text-sm flex items-center">
                                    <ImageIcon className="h-3 w-3 mr-1" /> {images.length} Photos
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-4">{album.title}</h1>
                            <p className="text-lg text-[var(--text-secondary)] max-w-2xl">{album.description}</p>
                        </div>

                        {session && (
                            <Button
                                onClick={() => setIsUploadOpen(!isUploadOpen)}
                                className="shadow-lg shadow-[var(--accent-primary)]/20"
                            >
                                <UploadCloud className="mr-2 h-4 w-4" /> Add Memory
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <main className="container mx-auto px-4 py-12 max-w-7xl">

                {/* Upload Section (Collapsible) */}
                <AnimatePresence>
                    {isUploadOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                            animate={{ opacity: 1, height: "auto", marginBottom: 48 }}
                            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                            className="overflow-hidden"
                        >
                            <Card className="bg-[var(--bg-surface)] border-[var(--accent-primary)]/30 relative">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsUploadOpen(false)}
                                    className="absolute top-2 right-2"
                                >
                                    <X className="h-4 w-4" />
                                </Button>

                                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-4">Upload a new photo</h3>
                                <form onSubmit={handleUpload} className="flex flex-col md:flex-row gap-4 items-end">
                                    <div className="flex-1 w-full">
                                        <label className="block text-xs font-medium text-[var(--text-secondary)] mb-1">Select Photo</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setFile(e.target.files?.[0] || null)}
                                            className="block w-full text-sm text-[var(--text-secondary)] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[var(--accent-primary)]/10 file:text-[var(--accent-primary)] hover:file:bg-[var(--accent-primary)]/20 cursor-pointer"
                                        />
                                    </div>
                                    <div className="flex-1 w-full">
                                        <Input
                                            placeholder="Write a caption..."
                                            value={caption}
                                            onChange={(e) => setCaption(e.target.value)}
                                        />
                                    </div>
                                    <Button type="submit" isLoading={uploading} disabled={!file || uploading}>
                                        Upload
                                    </Button>
                                </form>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Masonry Grid */}
                {images.length > 0 ? (
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                        {images.map((img, idx) => (
                            <motion.div
                                key={img._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="break-inside-avoid"
                            >
                                <div className="relative group rounded-xl overflow-hidden bg-[var(--bg-surface)] shadow-lg hover:shadow-2xl transition-all duration-300">
                                    <Image
                                        src={img.imageUrl}
                                        alt={img.caption}
                                        width={800}
                                        height={600}
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        unoptimized
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                                        <div>
                                            <p className="text-white font-medium mb-1">{img.caption}</p>
                                            <div className="flex items-center text-xs text-gray-400">
                                                <User className="h-3 w-3 mr-1" /> {img.uploadedBy?.name || "Member"}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        title="No photos yet"
                        description="Be the first to add a memory to this album!"
                        icon={ImageIcon}
                        className="py-20"
                    />
                )}
            </main>
        </div>
    );
}
