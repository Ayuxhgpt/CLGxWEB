"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Mail, Lock, ShieldCheck, ArrowRight } from "lucide-react";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
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
                setError("Review your credentials and try again.");
                setIsLoading(false);
                return;
            }

            router.push("/dashboard");
            router.refresh();
        } catch (error) {
            console.log(error);
            setError("Something went wrong. Please try again later.");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-[var(--bg-main)]">
            {/* Left: Brand / Visual */}
            <div className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center p-12">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-[var(--bg-main)] z-10" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-20 max-w-lg text-center"
                >
                    <div className="mb-8 flex justify-center">
                        <div className="h-20 w-20 bg-gradient-to-br from-[var(--accent-primary)] to-blue-600 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(6,182,212,0.4)]">
                            <span className="text-4xl font-bold text-white">P</span>
                        </div>
                    </div>
                    <h1 className="text-5xl font-bold text-white mb-4 tracking-tight">
                        Pharma<span className="text-[var(--accent-primary)]">Elevate</span>
                    </h1>
                    <p className="text-lg text-[var(--text-secondary)]">
                        Your professional gateway to pharmacy excellence. Access resources, track progress, and elevate your learning.
                    </p>
                </motion.div>

                {/* Background Decor */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--accent-primary)]/10 rounded-full blur-[100px]" />
            </div>

            {/* Right: Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 relative">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-full max-w-md space-y-8"
                >
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-[var(--text-primary)]">Welcome back</h2>
                        <p className="mt-2 text-[var(--text-secondary)]">
                            Enter your credentials to access your workspace.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <Input
                                type="email"
                                label="Email Address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                icon={<Mail className="h-5 w-5" />}
                                required
                            />
                            <div className="space-y-1">
                                <Input
                                    type="password"
                                    label="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    icon={<Lock className="h-5 w-5" />}
                                    required
                                />
                                <div className="flex justify-end">
                                    <Link href="/forgot-password" className="text-sm text-[var(--accent-primary)] hover:text-[var(--accent-hover)] font-medium">
                                        Forgot password?
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg flex items-center"
                            >
                                <span className="mr-2">⚠️</span> {error}
                            </motion.div>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                            isLoading={isLoading}
                        >
                            Continue to PharmaElevate <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </form>

                    <div className="pt-6 border-t border-[var(--border-subtle)]">
                        <div className="flex items-center justify-center space-x-2 text-sm text-[var(--text-secondary)]">
                            <ShieldCheck className="h-4 w-4 text-[var(--status-success)]" />
                            <span>Your data is securely encrypted.</span>
                        </div>
                        <p className="mt-4 text-center text-sm text-[var(--text-secondary)]">
                            Don't have an account?{" "}
                            <Link href="/register" className="font-semibold text-[var(--accent-primary)] hover:text-[var(--accent-hover)] transition-colors">
                                Create account
                            </Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
