"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Home, Key } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        setMessage("");

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const result = await res.json();

            if (res.ok) {
                if (result.success || res.status === 200) { // Handle legacy 200 OK or new success:true
                    setMessage(result.message || "Reset link sent to your email.");
                    setTimeout(() => {
                        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
                    }, 2000);
                } else {
                    setError(result.message || "Failed to send reset link");
                    setIsLoading(false);
                }
            } else {
                setError(result.message || "Failed to send reset link");
                setIsLoading(false);
            }

        } catch (err) {
            setError("Something went wrong");
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

            {/* Background Ambience */}
            <div className="absolute top-[20%] right-[20%] w-64 h-64 bg-[rgb(var(--primary))] rounded-full blur-[128px] opacity-[0.1] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-[480px] p-4 relative z-10"
            >
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[rgb(var(--bg-surface))] border border-[rgb(var(--primary))/0.3] text-[rgb(var(--primary))] text-xs font-semibold mb-6">
                        <Key className="h-3 w-3" /> Password Recovery
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[rgb(var(--text-primary))] mb-3">
                        Forgot <span className="text-[rgb(var(--primary))]">Password</span>
                    </h1>
                    <p className="text-[rgb(var(--text-secondary))] text-lg">
                        Enter your email to receive a password reset link
                    </p>
                </div>

                <div className="ladder-card p-8 md:p-10 bg-[rgb(var(--bg-card))]">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            type="text"
                            label="Email or Username"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email or username"
                            required
                            className="bg-[rgb(var(--bg-surface))]"
                        />

                        {error && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center font-medium"
                            >
                                {error}
                            </motion.div>
                        )}
                        {message && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="p-3 rounded-lg bg-[rgb(var(--primary))/0.1] border border-[rgb(var(--primary))/0.2] text-[rgb(var(--primary))] text-sm text-center font-medium"
                            >
                                {message}
                            </motion.div>
                        )}

                        <Button type="submit" className="w-full text-base font-bold h-12 rounded-xl" size="lg" isLoading={isLoading}>
                            Send Reset Link <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </form>

                    <div className="mt-8 text-center">
                        <Link href="/login" className="text-sm text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] font-medium transition-colors">
                            Back to Login
                        </Link>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
