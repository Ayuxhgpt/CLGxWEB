"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/Card";
import { User, Mail, Lock, Phone, ArrowRight, ShieldCheck } from "lucide-react";

export default function RegisterPage() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [phone, setPhone] = useState("");
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
                body: JSON.stringify({ name, email, password, phone }),
            });

            const data = await res.json();

            if (res.ok) {
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
        <div className="min-h-screen flex items-center justify-center bg-bg relative overflow-hidden p-4">
            {/* Background Effects */}
            <div className="absolute top-0 right-1/2 translate-x-1/2 w-[1000px] h-[500px] bg-purple-500/20 rounded-full blur-[100px] pointer-events-none opacity-50" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="text-center mb-8">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 shadow-lg shadow-purple-500/30 mb-4">
                        <span className="text-2xl font-bold text-white">P</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-text">Create Account</h1>
                    <p className="text-text-secondary mt-2">Join PharmaElevate today</p>
                </div>

                <Card glass className="border-text/10 shadow-2xl">
                    <CardHeader>
                        <CardDescription className="text-center">Enter your details to get started.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <Input
                                type="text"
                                label="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Doe"
                                icon={<User className="h-4 w-4" />}
                                required
                            />
                            <Input
                                type="email"
                                label="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                icon={<Mail className="h-4 w-4" />}
                                required
                            />
                            <Input
                                type="tel"
                                label="Phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+91 98765 43210"
                                icon={<Phone className="h-4 w-4" />}
                                required
                            />
                            <Input
                                type="password"
                                label="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                icon={<Lock className="h-4 w-4" />}
                                required
                            />

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-sm p-3 rounded-md">
                                    {error}
                                </div>
                            )}

                            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                                Create Account <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </form>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4 border-t border-text/5 pt-6 bg-surface/30">
                        <p className="text-center text-sm text-text-secondary">
                            Already have an account?{" "}
                            <Link href="/login" className="font-semibold text-primary hover:text-primary/80 transition-colors">
                                Sign In
                            </Link>
                        </p>
                        <div className="flex items-center justify-center space-x-2 text-xs text-text-muted">
                            <ShieldCheck className="h-3 w-3" />
                            <span>Privacy protected & secure</span>
                        </div>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
}
