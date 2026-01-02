'use client';

import Navbar from '@/components/Navbar';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function ProfilePage() {
    const { data: session } = useSession();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchProfile() {
            if (session?.user?.email) {
                try {
                    const res = await fetch('/api/user/profile');
                    if (res.ok) {
                        const data = await res.json();
                        setProfile(data);
                    }
                } catch (error) {
                    console.error(error);
                } finally {
                    setLoading(false);
                }
            }
        }
        fetchProfile();
    }, [session]);

    if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center"><p>Loading...</p></div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />
            <div className="container mx-auto p-8 pt-24">
                <h1 className="text-3xl font-bold mb-6">User Profile</h1>
                <div className="p-8 bg-gray-800 rounded-lg border border-gray-700">
                    <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
                        <div className="w-32 h-32 relative">
                            <img
                                src={profile?.image || `https://ui-avatars.com/api/?name=${session?.user?.name}&background=10B981&color=fff`}
                                alt="Profile"
                                className="w-full h-full rounded-full object-cover border-4 border-green-500 shadow-lg"
                            />
                        </div>
                        <div className="text-center md:text-left">
                            <h2 className="text-3xl font-bold">{session?.user?.name}</h2>
                            <p className="text-gray-400">{session?.user?.email}</p>
                            <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                                <span className="px-3 py-1 bg-blue-900 text-blue-200 rounded-full text-sm font-semibold capitalize border border-blue-700">{profile?.role || 'Student'}</span>
                                <span className="px-3 py-1 bg-purple-900 text-purple-200 rounded-full text-sm font-semibold capitalize border border-purple-700">{profile?.year || '1st Year'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-6 bg-gray-900/50 rounded-xl border border-gray-700">
                            <h3 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2 text-accent">Academic Details</h3>
                            <p className="mb-3 flex justify-between"><span className="text-gray-400">Year:</span> <span>{profile?.year || '1st Year'}</span></p>
                            <p className="mb-3 flex justify-between"><span className="text-gray-400">Branch:</span> <span>{profile?.branch || 'B.Pharm'}</span></p>
                            <p className="mb-3 flex justify-between"><span className="text-gray-400">Joined:</span> <span>{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'N/A'}</span></p>
                        </div>
                        <div className="p-6 bg-gray-900/50 rounded-xl border border-gray-700">
                            <h3 className="text-xl font-bold mb-4 border-b border-gray-700 pb-2 text-accent">Bio & Socials</h3>
                            <p className="text-gray-300 italic mb-6 leading-relaxed">"{profile?.bio || 'Passionate pharmacy student.'}"</p>

                            <div className="flex gap-4 mb-6">
                                {profile?.socials?.instagram && (
                                    <a href={profile.socials.instagram} target="_blank" className="text-pink-500 hover:text-pink-400 text-2xl"><i className="fab fa-instagram"></i></a>
                                )}
                                {profile?.socials?.linkedin && (
                                    <a href={profile.socials.linkedin} target="_blank" className="text-blue-500 hover:text-blue-400 text-2xl"><i className="fab fa-linkedin"></i></a>
                                )}
                                {profile?.socials?.twitter && (
                                    <a href={profile.socials.twitter} target="_blank" className="text-sky-500 hover:text-sky-400 text-2xl"><i className="fab fa-twitter"></i></a>
                                )}
                            </div>

                            <Link href="/settings" className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 rounded text-white font-bold inline-block shadow-lg transition-transform transform hover:-translate-y-1">
                                Edit Profile
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
