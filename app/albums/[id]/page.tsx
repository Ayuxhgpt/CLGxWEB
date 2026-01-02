'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import { useParams } from 'next/navigation';

export default function AlbumDetails() {
    const { data: session } = useSession();
    const params = useParams();
    const [album, setAlbum] = useState<any>(null);
    const [images, setImages] = useState<any[]>([]);
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [caption, setCaption] = useState('');

    useEffect(() => {
        if (params?.id) {
            fetchDetails();
        }
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
        formData.append('file', file);
        formData.append('albumId', params?.id as string);
        formData.append('caption', caption);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                alert('Image uploaded! It will appear after admin approval.');
                setFile(null);
                setCaption('');
            } else {
                alert('Upload failed');
            }
        } catch (error) {
            console.error(error);
            alert('Upload error');
        } finally {
            setUploading(false);
        }
    };

    if (!album) return <div className="text-white p-8">Loading...</div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />
            <div className="container mx-auto p-8">
                <h1 className="text-3xl font-bold mb-2">{album.title}</h1>
                <p className="text-gray-400 mb-8">{album.description}</p>

                {session && (
                    <div className="mb-10 p-6 bg-gray-800 rounded border border-gray-700">
                        <h3 className="text-xl font-bold mb-4">Add Memory</h3>
                        <form onSubmit={handleUpload} className="space-y-4">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setFile(e.target.files?.[0] || null)}
                                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                            />
                            <input
                                type="text"
                                placeholder="Caption (optional)"
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                className="w-full p-2 bg-gray-700 rounded text-white"
                            />
                            <button
                                type="submit"
                                disabled={uploading}
                                className={`px-4 py-2 rounded font-bold ${uploading ? 'bg-gray-600' : 'bg-green-600 hover:bg-green-700'
                                    }`}
                            >
                                {uploading ? 'Uploading...' : 'Upload Image'}
                            </button>
                        </form>
                    </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {images.map((img) => (
                        <div key={img._id} className="relative group">
                            <img
                                src={img.imageUrl}
                                alt={img.caption}
                                className="w-full h-48 object-cover rounded-lg"
                            />
                            {img.caption && (
                                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 p-2 text-sm rounded-b-lg opacity-0 group-hover:opacity-100 transition">
                                    {img.caption}
                                </div>
                            )}
                        </div>
                    ))}
                    {images.length === 0 && (
                        <p className="text-gray-500 col-span-full text-center">No images yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
