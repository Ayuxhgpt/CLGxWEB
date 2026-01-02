'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

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
        title: '',
        semester: 'Semester 1',
        subject: '',
        pdfUrl: ''
    });
    const [uploadingNote, setUploadingNote] = useState(false);

    const router = useRouter();

    useEffect(() => {
        if (session?.user?.role !== 'admin') {
            // Middleware handles redirect, but good for client-side safety
        }

        fetchPending();
    }, [session]);

    const fetchPending = async () => {
        try {
            const res = await fetch('/api/admin/pending');
            const data = await res.json();
            setPendingImages(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: string, action: 'approve' | 'delete') => {
        try {
            await fetch('/api/admin/approve', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
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
            const res = await fetch('/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(noteForm)
            });
            if (res.ok) {
                alert('Note uploaded successfully!');
                setNoteForm({ title: '', semester: 'Semester 1', subject: '', pdfUrl: '' });
            } else {
                alert('Failed to upload note.');
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
        data.append('file', file);
        data.append('folder', 'pharma_elevate_notes');
        data.append('upload_preset', 'pharma_elevate');

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
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

    if (!session || session.user.role !== 'admin') {
        return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center"><p>Access Denied</p></div>;
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />
            <div className="container mx-auto p-8 pt-24">
                <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

                {/* Notes Upload Section */}
                <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 mb-12 shadow-lg">
                    <h2 className="text-xl font-bold mb-4 text-accent border-b border-gray-700 pb-2">Upload Academic Note/PDF</h2>
                    <form onSubmit={handleNoteUpload} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Title</label>
                            <input
                                type="text"
                                placeholder="e.g. Unit 1 Notes"
                                value={noteForm.title}
                                onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                                className="w-full bg-gray-700 p-2 rounded text-white border border-gray-600 focus:border-blue-500 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Semester</label>
                            <select
                                value={noteForm.semester}
                                onChange={(e) => setNoteForm({ ...noteForm, semester: e.target.value })}
                                className="w-full bg-gray-700 p-2 rounded text-white border border-gray-600 focus:border-blue-500 outline-none"
                            >
                                {['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'].map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Subject</label>
                            <input
                                type="text"
                                placeholder="e.g. Pharmaceutics I"
                                value={noteForm.subject}
                                onChange={(e) => setNoteForm({ ...noteForm, subject: e.target.value })}
                                className="w-full bg-gray-700 p-2 rounded text-white border border-gray-600 focus:border-blue-500 outline-none"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">PDF File</label>
                            <div className="flex items-center gap-4 bg-gray-700 p-1.5 rounded border border-gray-600">
                                <input type="file" accept="application/pdf" onChange={handlePdfSelect} className="text-sm text-gray-300 w-full file:mr-4 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-gray-600 file:text-white" />
                                {noteForm.pdfUrl && <span className="text-green-500 text-xs font-bold px-2 whitespace-nowrap">Ready ✓</span>}
                            </div>
                        </div>
                        <button type="submit" disabled={uploadingNote || !noteForm.pdfUrl} className="col-span-1 md:col-span-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 p-2 rounded font-bold disabled:opacity-50 transition shadow-lg">
                            {uploadingNote ? 'Uploading...' : 'Publish Note'}
                        </button>
                    </form>
                </div>

                <h2 className="text-xl font-bold mb-4 text-accent">Pending Image Approvals</h2>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingImages.length === 0 ? (
                            <p className="text-gray-400">No pending images.</p>
                        ) : (
                            pendingImages.map((img) => (
                                <div key={img._id} className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
                                    <img src={img.url} alt={img.caption} className="w-full h-48 object-cover" />
                                    <div className="p-4">
                                        <p className="font-bold text-white mb-1">{img.album.title}</p>
                                        <p className="text-sm text-gray-300 mb-2">{img.caption}</p>
                                        <div className="flex justify-between text-xs text-gray-500 mb-4">
                                            <span>By: {img.uploadedBy.name}</span>
                                            <span>{new Date(img.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleAction(img._id, 'approve')}
                                                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1 rounded text-sm font-bold"
                                            >
                                                Approve
                                            </button>
                                            <button
                                                onClick={() => handleAction(img._id, 'delete')}
                                                className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1 rounded text-sm font-bold"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
