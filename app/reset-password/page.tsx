"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Lock, Key, CheckCircle2 } from "lucide-react";

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const email = searchParams.get("email") || "";

    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp, newPassword }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage("Password Reset Successful!");
                setTimeout(() => {
                    router.push("/login");
                }, 2000);
            } else {
                setError(data.message || "Reset failed");
                setIsLoading(false);
            }
        } catch (err) {
            setError("Something went wrong");
            setIsLoading(false);
        }
    };

    if (message) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                <div className="h-16 w-16 bg-green-500/20 rounded-full flex items-center justify-center mb-6 text-green-500">
                    <CheckCircle2 className="h-8 w-8" />
                </div>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Success!</h2>
                <p className="text-[var(--text-secondary)]">Your password has been updated.</p>
                <p className="text-sm text-[var(--text-muted)] mt-4">Redirecting to login...</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-sm">
            <h2 className="text-3xl font-bold mb-2 text-[var(--text-primary)]">Reset Password</h2>
            <p className="text-[var(--text-secondary)] mb-8">
                Enter the OTP sent to <span className="text-[var(--accent-primary)] font-mono">{email}</span>
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Input
                    type="text"
                    label="Enter OTP"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    icon={<Key className="h-5 w-5" />}
                    required
                />

                <Input
                    type="password"
                    label="New Password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    icon={<Lock className="h-5 w-5" />}
                    required
                />

                {error && (
                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
                        {error}
                    </div>
                )}

                <Button type="submit" className="w-full" isLoading={isLoading}>
                    Update Password
                </Button>
            </form>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)] p-4">
            <Suspense fallback={<div>Loading...</div>}>
                <ResetPasswordContent />
            </Suspense>
        </div>
    );
}
