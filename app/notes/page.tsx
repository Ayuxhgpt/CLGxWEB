'use client';

import Navbar from '@/components/Navbar';
import { useState, useEffect } from 'react';

interface Note {
    _id: string;
    title: string;
    subject: string;
    semester: string;
    pdfUrl: string;
    uploadedBy: { name: string };
    createdAt: string;
}

export default function NotesPage() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [semester, setSemester] = useState('Semester 1');
    const [subject, setSubject] = useState('');

    const semesters = ['Semester 1', 'Semester 2', 'Semester 3', 'Semester 4', 'Semester 5', 'Semester 6', 'Semester 7', 'Semester 8'];

    useEffect(() => {
        fetchNotes();
    }, [semester, subject]);

    const fetchNotes = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (semester) params.append('semester', semester);
            if (subject) params.append('subject', subject);

            const res = await fetch(`/api/notes?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setNotes(data);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />
            <div className="container mx-auto p-8 pt-24">
                <h1 className="text-3xl font-bold mb-2">Study Notes</h1>
                <p className="text-gray-400 mb-8">Access curated notes, PDFs, and previous year papers.</p>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-8 bg-gray-800 p-4 rounded-xl border border-gray-700">
                    <select
                        value={semester}
                        onChange={(e) => setSemester(e.target.value)}
                        className="bg-gray-700 p-3 rounded text-white border border-gray-600 focus:border-blue-500 outline-none min-w-[200px]"
                    >
                        {semesters.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <input
                        type="text"
                        placeholder="Search Subject..."
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="flex-1 bg-gray-700 p-3 rounded text-white border border-gray-600 focus:border-blue-500 outline-none"
                    />
                </div>

                {/* Notes Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => <div key={i} className="h-40 bg-gray-800 animate-pulse rounded-xl"></div>)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {notes.length === 0 ? (
                            <div className="col-span-full text-center py-20 text-gray-500">
                                <i className="fa-regular fa-folder-open text-4xl mb-3"></i>
                                <p>No notes found for this selection.</p>
                            </div>
                        ) : (
                            notes.map(note => (
                                <div key={note._id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-blue-500 transition shadow-lg hover:-translate-y-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="bg-blue-900 text-blue-200 text-xs px-2 py-1 rounded uppercase font-bold">{note.subject}</span>
                                        <span className="text-gray-500 text-xs">{new Date(note.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 text-white truncate" title={note.title}>{note.title}</h3>
                                    <p className="text-sm text-gray-400 mb-4">Uploaded by {note.uploadedBy?.name || 'Admin'}</p>

                                    <a href={note.pdfUrl} target="_blank" className="w-full block text-center bg-gray-700 hover:bg-blue-600 text-white py-2 rounded font-bold transition">
                                        <i className="fa-regular fa-file-pdf mr-2"></i> View PDF
                                    </a>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
