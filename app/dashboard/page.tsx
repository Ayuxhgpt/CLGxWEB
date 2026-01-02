'use client';

import Navbar from '@/components/Navbar';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
    const { data: session } = useSession();
    const [stats, setStats] = useState({ uploads: 0, notesSaved: 0, streak: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            if (session?.user) {
                try {
                    const res = await fetch('/api/user/stats');
                    if (res.ok) {
                        const data = await res.json();
                        setStats(data);
                    }
                } catch (error) {
                    console.error(error);
                } finally {
                    setLoading(false);
                }
            }
        }
        fetchStats();
    }, [session]);

    const firstName = session?.user?.name?.split(' ')[0] || 'Scholar';

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />
            <div className="container mx-auto p-4 md:p-8 pt-24">

                {/* Welcome Section */}
                <div className="mb-10 text-center md:text-left animate-fade-in-down">
                    <h1 className="text-4xl font-bold mb-2">
                        Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">{firstName}</span> 👋
                    </h1>
                    <p className="text-gray-400 text-lg">Your learning journey continues here.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {/* Stat Card 1 */}
                    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg flex items-center gap-4 hover:border-blue-500 transition cursor-default">
                        <div className="w-14 h-14 rounded-full bg-blue-900/50 flex items-center justify-center text-blue-400 text-2xl">
                            <i className="fa-regular fa-image"></i>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm font-medium uppercase">Memories Shared</p>
                            <h3 className="text-3xl font-bold">{loading ? '-' : stats.uploads}</h3>
                        </div>
                    </div>

                    {/* Stat Card 2 */}
                    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg flex items-center gap-4 hover:border-green-500 transition cursor-default">
                        <div className="w-14 h-14 rounded-full bg-green-900/50 flex items-center justify-center text-green-400 text-2xl">
                            <i className="fa-regular fa-bookmark"></i>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm font-medium uppercase">Resources Saved</p>
                            <h3 className="text-3xl font-bold">{loading ? '-' : stats.notesSaved}</h3>
                        </div>
                    </div>

                    {/* Stat Card 3 */}
                    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 shadow-lg flex items-center gap-4 hover:border-purple-500 transition cursor-default">
                        <div className="w-14 h-14 rounded-full bg-purple-900/50 flex items-center justify-center text-purple-400 text-2xl">
                            <i className="fa-solid fa-fire"></i>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm font-medium uppercase">Day Streak</p>
                            <h3 className="text-3xl font-bold">{loading ? '-' : stats.streak}</h3>
                        </div>
                    </div>
                </div>

                {/* Main Actions Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Quick Actions */}
                    <div className="lg:col-span-2 bg-gray-800 rounded-2xl p-8 border border-gray-700 shadow-xl">
                        <h2 className="text-2xl font-bold mb-6 text-white border-b border-gray-700 pb-4">Quick Actions</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <Link href="/notes" className="group p-4 bg-gray-700/50 rounded-xl hover:bg-blue-600 transition flex items-center gap-4 border border-transparent hover:border-blue-400">
                                <div className="bg-blue-500/20 w-12 h-12 rounded-lg flex items-center justify-center text-blue-300 group-hover:text-white group-hover:bg-white/20 transition">
                                    <i className="fa-solid fa-book-open"></i>
                                </div>
                                <div>
                                    <h4 className="font-bold">Browse Notes</h4>
                                    <p className="text-xs text-gray-400 group-hover:text-blue-100">Find study materials</p>
                                </div>
                            </Link>

                            <Link href="/albums" className="group p-4 bg-gray-700/50 rounded-xl hover:bg-pink-600 transition flex items-center gap-4 border border-transparent hover:border-pink-400">
                                <div className="bg-pink-500/20 w-12 h-12 rounded-lg flex items-center justify-center text-pink-300 group-hover:text-white group-hover:bg-white/20 transition">
                                    <i className="fa-solid fa-camera"></i>
                                </div>
                                <div>
                                    <h4 className="font-bold">View Gallery</h4>
                                    <p className="text-xs text-gray-400 group-hover:text-pink-100">Upload new memories</p>
                                </div>
                            </Link>

                            <Link href="/settings" className="group p-4 bg-gray-700/50 rounded-xl hover:bg-orange-600 transition flex items-center gap-4 border border-transparent hover:border-orange-400">
                                <div className="bg-orange-500/20 w-12 h-12 rounded-lg flex items-center justify-center text-orange-300 group-hover:text-white group-hover:bg-white/20 transition">
                                    <i className="fa-solid fa-user-pen"></i>
                                </div>
                                <div>
                                    <h4 className="font-bold">Edit Profile</h4>
                                    <p className="text-xs text-gray-400 group-hover:text-orange-100">Update bio & socials</p>
                                </div>
                            </Link>

                            {session?.user?.role === 'admin' && (
                                <Link href="/admin" className="group p-4 bg-gray-700/50 rounded-xl hover:bg-red-600 transition flex items-center gap-4 border border-transparent hover:border-red-400">
                                    <div className="bg-red-500/20 w-12 h-12 rounded-lg flex items-center justify-center text-red-300 group-hover:text-white group-hover:bg-white/20 transition">
                                        <i className="fa-solid fa-shield-halved"></i>
                                    </div>
                                    <div>
                                        <h4 className="font-bold">Admin Panel</h4>
                                        <p className="text-xs text-gray-400 group-hover:text-red-100">Manage content</p>
                                    </div>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Profile Card Summary */}
                    <div className="bg-gradient-to-br from-indigo-900 to-blue-900 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="w-24 h-24 mb-4 rounded-full border-4 border-white/20 shadow-xl overflow-hidden">
                                <img
                                    src={`https://ui-avatars.com/api/?name=${session?.user?.name}&background=random`}
                                    className="w-full h-full object-cover"
                                    alt="Avatar"
                                />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-1">{session?.user?.name}</h2>
                            <p className="text-blue-200 text-sm mb-6">{session?.user?.email}</p>

                            <Link href="/profile" className="w-full py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-center font-bold transition">
                                View Full Profile
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
