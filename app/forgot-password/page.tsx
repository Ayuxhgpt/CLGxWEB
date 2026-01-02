"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Mail, ArrowRight, ArrowLeft } from "lucide-react";

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

            const data = await res.json();

            if (res.ok) {
                setMessage("OTP sent! Redirecting...");
                setTimeout(() => {
                    router.push(`/reset-password?email=${encodeURIComponent(email)}`);
                }, 1500);
            } else {
                setError(data.message || "Failed to send OTP");
                setIsLoading(false);
            }
        } catch (err) {
            setError("Something went wrong");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[var(--bg-main)]">
            {/* Visual Side */}
            <div className="hidden lg:flex flex-col justify-center items-center bg-[var(--bg-surface)] p-12 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-600/5 z-0" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative z-10 max-w-md"
                >
                    <h1 className="text-4xl font-bold mb-6 text-[var(--accent-primary)]">Recover Account</h1>
                    <p className="text-lg text-[var(--text-secondary)]">
                        Don't worry, it happens! We'll help you get back to your studies in no time.
                    </p>
                </motion.div>
            </div>

            {/* Form Side */}
            <div className="flex flex-col justify-center items-center p-6 lg:p-24 relative">
                <div className="w-full max-w-sm">
                    <Link href="/login" className="flex items-center text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-8 transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Login
                    </Link>

                    <h2 className="text-3xl font-bold mb-2 text-[var(--text-primary)]">Forgot Password?</h2>
                    <p className="text-[var(--text-secondary)] mb-8">Enter your email to receive a reset code.</p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            type="email"
                            label="Email Address"
                            placeholder="student@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            icon={<Mail className="h-5 w-5" />}
                            required
                        />

                        {error && (
                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                                {error}
                            </div>
                        )}
                        {message && (
                            <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500 text-sm">
                                {message}
                            </div>
                        )}

                        <Button type="submit" className="w-full" isLoading={isLoading}>
                            Send OTP <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
