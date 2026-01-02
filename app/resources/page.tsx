'use client';

import Navbar from '@/components/Navbar';

export default function ResourcesPage() {
    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />
            <div className="container mx-auto p-8 pt-24">
                <h1 className="text-3xl font-bold mb-6">Student Resources</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Cards migrated from legacy html will go here */}
                    <div className="p-6 bg-gray-800 rounded border border-gray-700">
                        <h3 className="text-xl font-bold mb-2">Video Lectures</h3>
                        <p className="text-gray-400 mb-4">Curated playlists for B.Pharm subjects.</p>
                        <div className="text-blue-400 font-bold">Coming Soon</div>
                    </div>
                    <div className="p-6 bg-gray-800 rounded border border-gray-700">
                        <h3 className="text-xl font-bold mb-2">GPAT Guides</h3>
                        <p className="text-gray-400 mb-4">Entrance exam preparation material.</p>
                        <div className="text-blue-400 font-bold">Coming Soon</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
