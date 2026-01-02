'use client';

import Navbar from '@/components/Navbar';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
    const [formData, setFormData] = useState({
        bio: '',
        year: '1st Year',
        image: '',
        socials: {
            instagram: '',
            linkedin: '',
            twitter: '',
        },
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await fetch('/api/user/profile');
                if (res.ok) {
                    const data = await res.json();
                    setFormData({
                        bio: data.bio || '',
                        year: data.year || '1st Year',
                        image: data.image || '',
                        socials: {
                            instagram: data.socials?.instagram || '',
                            linkedin: data.socials?.linkedin || '',
                            twitter: data.socials?.twitter || '',
                        },
                    });
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        }
        fetchProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name.startsWith('social_')) {
            const socialKey = name.replace('social_', '');
            setFormData(prev => ({
                ...prev,
                socials: { ...prev.socials, [socialKey]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const data = new FormData();
        data.append('file', file);
        data.append('folder', 'pharma_elevate_profiles');
        data.append('upload_preset', 'pharma_elevate'); // Using unsigned preset if available, or backend sign
        // For MVP, we will use the existing /api/upload route logic? 
        // Actually the existing route is for Albums. We should reuse or adapt.
        // For now let's assume direct upload or use the same route if generic.
        // Simulating URL for now if backend logic is complex.

        // Ideally we call /api/upload
        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: data,
            });
            const result = await res.json();
            if (result.url) {
                setFormData(prev => ({ ...prev, image: result.url }));
            }
        } catch (err) {
            console.error("Upload failed", err);
            alert("Image upload failed. Ensure you are Admin or logic is updated for Users.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                alert('Profile updated successfully!');
                router.push('/profile');
            } else {
                alert('Failed to update profile');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center"><p>Loading...</p></div>;

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />
            <div className="container mx-auto p-8 pt-24 max-w-2xl">
                <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>

                <form onSubmit={handleSubmit} className="p-8 bg-gray-800 rounded-lg border border-gray-700 space-y-6">

                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Profile Picture</label>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-gray-700 overflow-hidden">
                                {formData.image ? (
                                    <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="w-full h-full flex items-center justify-center text-gray-500">No Img</span>
                                )}
                            </div>
                            <input type="file" onChange={handleImageUpload} className="text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-900 file:text-blue-200 hover:file:bg-blue-800" />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Upload feature reuses the album API for now.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Bio</label>
                        <textarea
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            rows={3}
                            className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:ring-2 focus:ring-blue-500"
                            placeholder="Tell us about yourself..."
                            maxLength={300}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">Academic Year</label>
                        <select
                            name="year"
                            value={formData.year}
                            onChange={handleChange}
                            className="w-full p-2 bg-gray-900 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="1st Year">1st Year</option>
                            <option value="2nd Year">2nd Year</option>
                            <option value="3rd Year">3rd Year</option>
                            <option value="4th Year">4th Year</option>
                        </select>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-bold border-b border-gray-700 pb-2">Social Links</h3>

                        <div>
                            <label className="block text-xs uppercase text-gray-500 mb-1">Instagram URL</label>
                            <input
                                type="url"
                                name="social_instagram"
                                value={formData.socials.instagram}
                                onChange={handleChange}
                                className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:ring-2 focus:ring-pink-500"
                                placeholder="https://instagram.com/username"
                            />
                        </div>

                        <div>
                            <label className="block text-xs uppercase text-gray-500 mb-1">LinkedIn URL</label>
                            <input
                                type="url"
                                name="social_linkedin"
                                value={formData.socials.linkedin}
                                onChange={handleChange}
                                className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:ring-2 focus:ring-blue-500"
                                placeholder="https://linkedin.com/in/username"
                            />
                        </div>

                        <div>
                            <label className="block text-xs uppercase text-gray-500 mb-1">Twitter URL</label>
                            <input
                                type="url"
                                name="social_twitter"
                                value={formData.socials.twitter}
                                onChange={handleChange}
                                className="w-full bg-gray-900 border border-gray-600 rounded p-2 text-white focus:ring-2 focus:ring-sky-500"
                                placeholder="https://twitter.com/username"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={() => router.back()} className="px-4 py-2 text-gray-400 hover:text-white">Cancel</button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded shadow-lg disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Profile'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
