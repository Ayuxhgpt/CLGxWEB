"use client";

import Navbar from "@/components/Navbar";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { User, Mail, Lock, Shield, Bell, Save, Camera, Github, Twitter, Linkedin, Instagram, ArrowLeft } from "lucide-react";
import Image from "next/image";

export default function SettingsPage() {
    const [formData, setFormData] = useState({
        bio: "",
        year: "1st Year",
        image: "",
        socials: {
            instagram: "",
            linkedin: "",
            twitter: "",
        },
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    useEffect(() => {
        async function fetchProfile() {
            try {
                const res = await fetch("/api/user/profile");
                if (res.ok) {
                    const data = await res.json();
                    setFormData({
                        bio: data.bio || "",
                        year: data.year || "1st Year",
                        image: data.image || "",
                        socials: {
                            instagram: data.socials?.instagram || "",
                            linkedin: data.socials?.linkedin || "",
                            twitter: data.socials?.twitter || "",
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
        if (name.startsWith("social_")) {
            const socialKey = name.replace("social_", "");
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
        data.append("file", file);
        data.append("folder", "pharma_elevate_profiles");

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: data,
            });
            const result = await res.json();
            if (result.url) {
                setFormData(prev => ({ ...prev, image: result.url }));
            }
        } catch (err) {
            console.error("Upload failed", err);
            alert("Image upload failed.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch("/api/user/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (res.ok) {
                router.push("/profile");
            } else {
                alert("Failed to update profile");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return null; // Navbar skeleton handled by parent or just empty

    return (
        <div className="min-h-screen bg-[var(--bg-main)]">
            <Navbar />
            <main className="container mx-auto px-4 pt-24 pb-12 max-w-2xl">

                <div className="flex items-center mb-8">
                    <Button variant="ghost" size="sm" onClick={() => router.back()} className="mr-4">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--text-primary)]">Edit Profile</h1>
                        <p className="text-[var(--text-secondary)]">Update your personal preferences.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card className="space-y-8">

                        {/* Avatar Section */}
                        <div className="flex flex-col items-center pb-8 border-b border-[var(--border-subtle)]">
                            <div className="relative group cursor-pointer mb-4">
                                <div className="h-24 w-24 rounded-full overflow-hidden border-4 border-[var(--bg-surface-2)] bg-[var(--bg-main)]">
                                    {formData.image ? (
                                        <Image src={formData.image} alt="Avatar" width={96} height={96} className="w-full h-full object-cover" unoptimized />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)]">
                                            <User className="h-8 w-8" />
                                        </div>
                                    )}
                                </div>
                                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Camera className="h-6 w-6 text-white" />
                                </div>
                                <input
                                    type="file"
                                    onChange={handleImageUpload}
                                    accept="image/*"
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                            </div>
                            <p className="text-xs text-[var(--text-secondary)]">Click to upload new picture</p>
                        </div>

                        {/* Bio & Year */}
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">My Bio</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    rows={4}
                                    className="w-full rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] p-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all resize-none"
                                    placeholder="Tell us a bit about yourself..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-[var(--text-primary)] mb-2">Academic Year</label>
                                <div className="relative">
                                    <select
                                        name="year"
                                        value={formData.year}
                                        onChange={handleChange}
                                        className="w-full appearance-none rounded-xl bg-[var(--bg-main)] border border-[var(--border-subtle)] p-3 text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] focus:border-transparent transition-all cursor-pointer"
                                    >
                                        <option value="1st Year">1st Year</option>
                                        <option value="2nd Year">2nd Year</option>
                                        <option value="3rd Year">3rd Year</option>
                                        <option value="4th Year">4th Year</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Socials */}
                        <div className="space-y-4 pt-4 border-t border-[var(--border-subtle)]">
                            <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Social Links</h3>
                            <Input
                                icon={<Instagram className="h-4 w-4" />}
                                name="social_instagram"
                                value={formData.socials.instagram}
                                onChange={handleChange}
                                placeholder="Instagram Profile URL"
                            />
                            <Input
                                icon={<Linkedin className="h-4 w-4" />}
                                name="social_linkedin"
                                value={formData.socials.linkedin}
                                onChange={handleChange}
                                placeholder="LinkedIn Profile URL"
                            />
                            <Input
                                icon={<Twitter className="h-4 w-4" />}
                                name="social_twitter"
                                value={formData.socials.twitter}
                                onChange={handleChange}
                                placeholder="Twitter Profile URL"
                            />
                        </div>

                        <div className="pt-6 border-t border-[var(--border-subtle)] flex justify-end gap-4">
                            <Button variant="ghost" onClick={() => router.back()} disabled={saving}>Cancel</Button>
                            <Button type="submit" isLoading={saving}>
                                <Save className="h-4 w-4 mr-2" /> Save Changes
                            </Button>
                        </div>

                    </Card>
                </form>
            </main>
        </div>
    );
}
