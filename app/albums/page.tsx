'use client';

import Navbar from '@/components/Navbar';
import { useState, useEffect } from 'react';
import Link from 'next/link';

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
    const [filterYear, setFilterYear] = useState('All');

    useEffect(() => {
        fetchAlbums();
    }, []);

    const fetchAlbums = async () => {
        try {
            const res = await fetch('/api/albums');
            const data = await res.json();
            setAlbums(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const filteredAlbums = filterYear === 'All'
        ? albums
        : albums.filter(a => a.year === filterYear);

    const years = ['All', ...Array.from(new Set(albums.map(a => a.year))).sort().reverse()];

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />
            <div className="container mx-auto p-8 pt-24">
                <div className="flex flex-col md:flex-row justify-between items-end mb-8 border-b border-gray-800 pb-4">
                    <div>
                        <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">Memory Lane</h1>
                        <p className="text-gray-400">Captured moments from our college journey.</p>
                    </div>

                    <div className="mt-4 md:mt-0">
                        <label className="text-xs uppercase text-gray-500 font-bold mr-2">Filter Year</label>
                        <select
                            value={filterYear}
                            onChange={(e) => setFilterYear(e.target.value)}
                            className="bg-gray-800 border border-gray-700 rounded p-2 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 animate-pulse">
                                <div className="h-48 bg-gray-700"></div>
                                <div className="p-4 space-y-2">
                                    <div className="h-6 bg-gray-700 w-3/4 rounded"></div>
                                    <div className="h-4 bg-gray-700 w-1/2 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredAlbums.length === 0 ? (
                            <div className="col-span-full py-20 text-center text-gray-500">
                                <p>No albums found for this year.</p>
                            </div>
                        ) : (
                            filteredAlbums.map((album) => (
                                <Link href={`/albums/${album._id}`} key={album._id} className="group block bg-gray-800 rounded-xl overflow-hidden border border-gray-700 shadow-lg hover:shadow-2xl transition hover:-translate-y-2">
                                    <div className="relative h-56 overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10"></div>
                                        <img
                                            src={album.coverImage || '/assists/scp.jpg'} // Fallback img
                                            alt={album.title}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition duration-700"
                                        />
                                        <div className="absolute bottom-4 left-4 z-20">
                                            <span className="bg-blue-600 text-xs font-bold px-2 py-1 rounded mb-2 inline-block shadow">{album.year}</span>
                                            <h2 className="text-2xl font-bold text-white leading-tight">{album.title}</h2>
                                        </div>
                                    </div>
                                    <div className="p-5">
                                        <p className="text-gray-400 text-sm line-clamp-2 mb-4">{album.description}</p>
                                        <div className="flex items-center justify-between text-xs text-gray-500 border-t border-gray-700 pt-3">
                                            <span><i className="fa-regular fa-images mr-1"></i> {album.imageCount || 0} Photos</span>
                                            <span className="text-blue-400 group-hover:underline">View Gallery →</span>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
