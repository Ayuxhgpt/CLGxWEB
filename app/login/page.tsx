"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { SocialLoginButtons } from "@/components/SocialLoginButtons";
import { ArrowRight, Home, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (res?.error) {
                setError("Invalid credentials.");
                setIsLoading(false);
                return;
            }

            router.push("/dashboard");
            router.refresh();
        } catch (error) {
            setError("Something went wrong.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[rgb(var(--bg-main))] flex items-center justify-center relative overflow-hidden font-sans">

            {/* Top Left Back Button */}
            <div className="absolute top-6 left-6 z-20">
                <Link href="/">
                    <Button variant="secondary" className="rounded-full pl-3 pr-4 h-10 bg-[rgb(var(--bg-surface))] text-[rgb(var(--text-primary))] border-[rgb(var(--border-subtle))] hover:bg-[rgb(var(--bg-card))]">
                        <Home className="h-4 w-4 mr-2" /> Back to Home
                    </Button>
                </Link>
            </div>

            {/* Background Ambience - Ladder1 Style (Subtle Green Blobs) */}
            <div className="absolute top-[20%] right-[10%] w-64 h-64 bg-[rgb(var(--primary))] rounded-full blur-[128px] opacity-[0.15] pointer-events-none" />
            <div className="absolute bottom-[10%] left-[10%] w-96 h-96 bg-[rgb(var(--primary))] rounded-full blur-[150px] opacity-[0.08] pointer-events-none" />

            {/* Login Card */}
            <motion.div
                initial={{ opacity: 0, y: 10 }} /* Ladder1 Rule: Slight Y rise, no scale */
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }} /* Fast 300ms ease-out */
                className="w-full max-w-[480px] p-4 relative z-10"
            >
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgb(var(--bg-surface))] border border-[rgb(var(--primary))/0.3] text-[rgb(var(--primary))] text-xs font-semibold mb-6">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        Secure Login
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[rgb(var(--text-primary))] mb-3">
                        Welcome <span className="text-[rgb(var(--primary))]">Back</span>
                    </h1>
                    <p className="text-[rgb(var(--text-secondary))] text-lg">
                        Continue your learning journey with AI-powered roadmaps
                    </p>
                </div>

                <div className="ladder-card p-8 md:p-10 bg-[rgb(var(--bg-card))]">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            type="email"
                            label="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                            required
                            className="bg-[rgb(var(--bg-surface))]"
                        />

                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                label="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your password"
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

                        {error && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-sm font-medium text-red-500 bg-red-500/10 p-3 rounded-lg border border-red-500/20 text-center"
                            >
                                {error}
                            </motion.p>
                        )}

                        <Button type="submit" className="w-full text-base font-bold h-12 rounded-xl" size="lg" isLoading={isLoading}>
                            Sign In <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </form>

                    <SocialLoginButtons />

                    <div className="mt-6 text-center">
                        <Link href="/forgot-password" className="text-sm text-[rgb(var(--primary))] hover:underline font-medium block mb-4">
                            Forgot Password?
                        </Link>
                    </div>
                </div>

                <p className="text-center text-[rgb(var(--text-muted))] text-sm mt-8">
                    Don't have an account? <Link href="/register" className="text-[rgb(var(--primary))] font-semibold hover:underline">Create Account</Link>
                </p>

            </motion.div>
        </div>
    );
}
