"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { User, Mail, Lock, ArrowRight, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
    const [name, setName] = useState("");
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
            const res = await fetch("/api/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();

            if (res.ok) {
                // Redirect to verification
                router.push(`/verify?email=${encodeURIComponent(email)}`);
            } else {
                setError(data.message || "Registration failed");
                setIsLoading(false);
            }
        } catch (error) {
            setError("Something went wrong");
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-[var(--bg-main)]">
            {/* Left: Brand / Visual */}
            <div className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center p-12">
                <div className="absolute inset-0 bg-gradient-to-tr from-[var(--bg-surface)] to-[var(--bg-main)] z-10" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-20 max-w-lg"
                >
                    <h2 className="text-3xl font-bold text-white mb-6">Join the Community</h2>
                    <div className="space-y-6">
                        {[
                            "Access premium pharmacy notes",
                            "Track your academic progress",
                            "Connect with resources & mentors",
                            "Secure & private profile"
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + (idx * 0.1) }}
                                className="flex items-center space-x-4 bg-white/5 p-4 rounded-xl backdrop-blur-sm border border-white/10"
                            >
                                <CheckCircle2 className="h-6 w-6 text-[var(--accent-primary)]" />
                                <span className="text-[var(--text-primary)] font-medium">{item}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Background Decor */}
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px]" />
            </div>

            {/* Right: Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-full max-w-md space-y-8"
                >
                    <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-[var(--text-primary)]">Create Account</h2>
                        <p className="mt-2 text-[var(--text-secondary)]">
                            Begin your journey with PharmaElevate today.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input
                            type="text"
                            label="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="John Doe"
                            icon={<User className="h-5 w-5" />}
                            required
                        />
                        <Input
                            type="email"
                            label="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            icon={<Mail className="h-5 w-5" />}
                            required
                        />
                        <Input
                            type="password"
                            label="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            icon={<Lock className="h-5 w-5" />}
                            required
                        />

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                            isLoading={isLoading}
                        >
                            Get Started <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                    </form>

                    <p className="mt-8 text-center text-sm text-[var(--text-secondary)]">
                        Already have an account?{" "}
                        <Link href="/login" className="font-semibold text-[var(--accent-primary)] hover:text-[var(--accent-hover)] transition-colors">
                            Log in
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
