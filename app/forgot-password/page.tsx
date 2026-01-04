"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/Card";
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
        <div className="min-h-screen flex items-center justify-center bg-bg relative overflow-hidden p-4">
            {/* Background Effects */}
            <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="mb-6">
                    <Link href="/login" className="flex items-center text-sm text-text-muted hover:text-text transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Login
                    </Link>
                </div>

                <Card glass className="border-text/10 shadow-xl">
                    <CardHeader>
                        <h1 className="text-2xl font-bold text-text">Recover Account</h1>
                        <CardDescription>Enter your email address to receive a verification code.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                type="email"
                                label="Email Address"
                                placeholder="student@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                icon={<Mail className="h-4 w-4" />}
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
                    </CardContent>
                    <CardFooter className="bg-surface/30 pt-6">
                        <p className="text-xs text-center w-full text-text-muted">
                            We'll send a 6-digit code to your email.
                        </p>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
}
