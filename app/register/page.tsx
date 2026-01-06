"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SocialLoginButtons } from "@/components/SocialLoginButtons";
import { ArrowRight, Home, Eye, EyeOff, User, Mail, Lock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
    const [form, setForm] = useState({ name: "", username: "", email: "", phone: "", password: "", confirmPassword: "" });
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    // Username Verification State
    const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken' | 'invalid'>('idle');
    const [usernameMessage, setUsernameMessage] = useState("");

    const router = useRouter();

    // Debounced Username Check
    useEffect(() => {
        const checkUsername = async () => {
            if (!form.username || form.username.length < 3) {
                setUsernameStatus('idle');
                setUsernameMessage("");
                return;
            }

            const regex = /^[a-z0-9_.]{3,20}$/;
            if (!regex.test(form.username)) {
                setUsernameStatus('invalid');
                setUsernameMessage("Lowercase, alphanumeric, dots, underscores only.");
                return;
            }

            setUsernameStatus('checking');
            try {
                const res = await fetch(`/api/username/check?username=${form.username}`);
                const result = await res.json();
                if (result.success && result.data?.available) {
                    setUsernameStatus('available');
                    setUsernameMessage("Username is available!");
                } else {
                    setUsernameStatus('taken');
                    setUsernameMessage(result.message || "Username is taken.");
                }
            } catch (err) {
                setUsernameStatus('idle');
            }
        };

        const timeoutId = setTimeout(checkUsername, 500);
        return () => clearTimeout(timeoutId);
    }, [form.username]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: form.name,
                    username: form.username,
                    email: form.email,
                    phone: form.phone,
                    password: form.password,
                    role: 'student'
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Registration failed");

            // Redirect to verify page with email
            router.push(`/verify?email=${encodeURIComponent(form.email)}`);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[rgb(var(--bg-main))] flex items-center justify-center relative overflow-hidden font-sans py-12">

            {/* Top Left Back Button */}
            <div className="absolute top-6 left-6 z-20">
                <Link href="/">
                    <Button variant="secondary" className="rounded-full pl-3 pr-4 h-10 bg-[rgb(var(--bg-surface))] text-[rgb(var(--text-primary))] border-[rgb(var(--border-subtle))] hover:bg-[rgb(var(--bg-card))]">
                        <Home className="h-4 w-4 mr-2" /> Back to Home
                    </Button>
                </Link>
            </div>

            {/* Background Ambience */}
            <div className="absolute top-[10%] left-[5%] w-72 h-72 bg-[rgb(var(--primary))] rounded-full blur-[140px] opacity-[0.1] pointer-events-none" />
            <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-[rgb(var(--primary))] rounded-full blur-[180px] opacity-[0.06] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="w-full max-w-[500px] p-4 relative z-10"
            >
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgb(var(--bg-surface))] border border-[rgb(var(--primary))/0.3] text-[rgb(var(--primary))] text-xs font-semibold mb-6">
                        <User className="h-3 w-3" /> Join the Community
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[rgb(var(--text-primary))] mb-3">
                        Create <span className="text-[rgb(var(--primary))]">Account</span>
                    </h1>
                    <p className="text-[rgb(var(--text-secondary))] text-lg">
                        Start your AI-powered learning journey today
                    </p>
                </div>

                <div className="ladder-card p-8 md:p-10 bg-[rgb(var(--bg-card))]">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input
                            label="Full Name"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="John Doe"
                            required
                            className="bg-[rgb(var(--bg-surface))]"
                        />

                        <div className="relative">
                            <Input
                                label="Username"
                                value={form.username}
                                onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().trim() })}
                                placeholder="john_doe"
                                required
                                className={`bg-[rgb(var(--bg-surface))] ${usernameStatus === 'taken' || usernameStatus === 'invalid' ? 'border-red-500/50 focus:border-red-500' : usernameStatus === 'available' ? 'border-green-500/50 focus:border-green-500' : ''}`}
                            />
                            {usernameStatus === 'checking' && <span className="absolute right-3 top-[34px] text-xs text-[var(--text-muted)]">Checking...</span>}
                            {usernameStatus === 'available' && <span className="absolute right-3 top-[34px] text-green-500"><CheckCircle className="h-5 w-5" /></span>}
                            {usernameMessage && (
                                <p className={`text-xs mt-1 ${usernameStatus === 'available' ? 'text-green-500' : 'text-red-500'}`}>
                                    {usernameMessage}
                                </p>
                            )}
                        </div>
                        <Input
                            type="email"
                            label="Email Address"
                            value={form.email}
                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                            placeholder="your@email.com"
                            required
                            className="bg-[rgb(var(--bg-surface))]"
                        />

                        <Input
                            type="tel"
                            label="Phone Number"
                            value={form.phone}
                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                            placeholder="+91 9876543210"
                            required
                            className="bg-[rgb(var(--bg-surface))]"
                        />

                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                label="Password"
                                value={form.password}
                                onChange={(e) => setForm({ ...form, password: e.target.value })}
                                placeholder="Create a strong password"
                                required
                                className="bg-[rgb(var(--bg-surface))]"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-[34px] text-[rgb(var(--text-muted))] hover:text-[rgb(var(--text-primary))]"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>

                        <Input
                            type="password"
                            label="Confirm Password"
                            value={form.confirmPassword}
                            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                            placeholder="Retype your password"
                            required
                            className="bg-[rgb(var(--bg-surface))]"
                        />

                        {error && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-sm font-medium text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/20 text-center"
                            >
                                {error}
                            </motion.p>
                        )}

                        <Button type="submit" className="w-full text-base font-bold h-12 rounded-xl mt-4" size="lg" isLoading={isLoading}>
                            Create Account <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </form>

                    <SocialLoginButtons />
                </div>

                <p className="text-center text-[rgb(var(--text-muted))] text-sm mt-8">
                    Already have an account? <Link href="/login" className="text-[rgb(var(--primary))] font-semibold hover:underline">Sign In</Link>
                </p>

            </motion.div>
        </div>
    );
}
