"use client";

import Navbar from "@/components/Navbar";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Image as ImageIcon, Calendar } from "lucide-react";
import Image from "next/image";

interface Album {
    _id: string;
    title: string;
    year: string;
    description: string;
    coverImage?: string;
    imageCount: number;
}

export default function AlbumsPage() {
    const [albums, setAlbums] = useState<Album[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterYear, setFilterYear] = useState("All");

    useEffect(() => {
        const fetchAlbums = async () => {
            try {
                const res = await fetch("/api/albums");
                const data = await res.json();
                setAlbums(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchAlbums();
    }, []);

    const filteredAlbums = filterYear === "All"
        ? albums
        : albums.filter(a => a.year === filterYear);

    const years = ["All", ...Array.from(new Set(albums.map(a => a.year))).sort().reverse()];

    return (
        <div className="min-h-screen bg-[var(--bg-main)]">
            <Navbar />
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">

                {/* Header & Filter */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-10 border-b border-[var(--border-subtle)] pb-6">
                    <div>
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent-primary)] to-blue-500">
                            Memory Lane
                        </h1>
                        <p className="text-[var(--text-secondary)] mt-2 text-lg">
                            Captured moments from our journey.
                        </p>
                    </div>

                    <div className="mt-4 md:mt-0 relative group">
                        <select
                            value={filterYear}
                            onChange={(e) => setFilterYear(e.target.value)}
                            className="appearance-none bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-[var(--text-primary)] pl-4 pr-10 py-2 rounded-lg cursor-pointer focus:ring-2 focus:ring-[var(--accent-primary)] focus:outline-none transition-all hover:bg-[var(--bg-surface-2)]"
                        >
                            {years.map(y => <option key={y} value={y}>{y === "All" ? "All Years" : y}</option>)}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)] group-hover:text-[var(--text-primary)]">
                            <Calendar className="h-4 w-4" />
                        </div>
                    </div>
                </div>

                {/* Grid */}
                <AnimatePresence mode="wait">
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3].map(i => (
                                <Card key={i} className="h-80 p-0 overflow-hidden border-0">
                                    <Skeleton className="h-full w-full" />
                                </Card>
                            ))}
                        </div>
                    ) : filteredAlbums.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredAlbums.map((album, idx) => (
                                <motion.div
                                    key={album._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <Link href={`/albums/${album._id}`}>
                                        <Card className="h-[320px] p-0 overflow-hidden group border-0 relative cursor-pointer shadow-lg hover:shadow-cyan-500/10 transition-shadow">
                                            {/* Image */}
                                            <div className="absolute inset-0">
                                                <img
                                                    src={album.coverImage || "/assets/scp.jpg"}
                                                    alt={album.title}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                />
                                                {/* Gradient Overlay */}
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                                            </div>

                                            {/* Content Overlay */}
                                            <div className="absolute inset-0 p-6 flex flex-col justify-end transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                                <div className="mb-2">
                                                    <span className="bg-[var(--accent-primary)] text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-sm">
                                                        {album.year}
                                                    </span>
                                                </div>
                                                <h2 className="text-2xl font-bold text-white mb-2 leading-tight">
                                                    {album.title}
                                                </h2>
                                                <p className="text-gray-300 text-sm line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                                                    {album.description}
                                                </p>

                                                <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                                    <span className="flex items-center">
                                                        <ImageIcon className="h-3 w-3 mr-1" />
                                                        {album.imageCount} Photos
                                                    </span>
                                                    <span className="text-[var(--accent-primary)] font-medium">View Gallery →</span>
                                                </div>
                                            </div>
                                        </Card>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            title="No albums found"
                            description={`We haven't uploaded any albums for ${filterYear} yet.`}
                            icon={ImageIcon}
                            className="py-20"
                        />
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
