"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ShieldCheck, RefreshCw, ArrowRight } from 'lucide-react';

function VerifyContent() {
    const searchParams = useSearchParams();
    const email = searchParams.get('email');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isResendDisabled, setIsResendDisabled] = useState(false);
    const [timer, setTimer] = useState(0);
    const router = useRouter();

    // Timer logic for resend
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer > 0) {
            interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
        } else {
            setIsResendDisabled(false);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp }),
            });

            const data = await res.json();

            if (res.ok) {
                setMessage('Verification successful! Redirecting...');
                setTimeout(() => router.push('/login'), 1500);
            } else {
                setError(data.message || 'Invalid OTP');
                setIsLoading(false);
            }
        } catch (error) {
            setError('Something went wrong');
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        setIsResendDisabled(true);
        setTimer(60); // 60s cooldown
        setMessage('');
        setError('');

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, isResend: true }),
            });

            if (res.ok) {
                setMessage('New OTP sent to your email.');
            } else {
                setError('Failed to resend OTP.');
                setIsResendDisabled(false);
                setTimer(0);
            }
        } catch (err) {
            setError('Network error.');
            setIsResendDisabled(false);
            setTimer(0);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-main)] p-4">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl p-8 shadow-2xl relative overflow-hidden"
            >
                {/* Decorative glow */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--accent-primary)] to-transparent" />

                <div className="text-center mb-8">
                    <div className="mx-auto w-16 h-16 bg-[var(--bg-surface-2)] rounded-full flex items-center justify-center mb-4 text-[var(--accent-primary)] border border-[var(--border-highlight)]">
                        <ShieldCheck className="h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-[var(--text-primary)]">Verify Account</h2>
                    <p className="text-[var(--text-secondary)] mt-2 text-sm">
                        Enter the 6-digit code sent to <br />
                        <span className="font-semibold text-[var(--text-primary)]">{email}</span>
                    </p>
                </div>

                <form onSubmit={handleVerify} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] text-center block">
                            One-Time Password
                        </label>
                        <input
                            type="text"
                            maxLength={6}
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                            className="w-full text-center text-3xl font-mono tracking-[0.5em] h-16 bg-[var(--bg-main)] border-2 border-[var(--border-subtle)] rounded-xl focus:border-[var(--accent-primary)] focus:ring-0 text-[var(--text-primary)] transition-all placeholder:text-[var(--text-muted)]/20"
                            placeholder="000000"
                            required
                        />
                    </div>

                    {error && (
                        <div className="bg-red-500/10 text-red-500 text-sm p-3 rounded-lg text-center animate-shake">
                            {error}
                        </div>
                    )}

                    {message && (
                        <div className="bg-green-500/10 text-green-500 text-sm p-3 rounded-lg text-center">
                            {message}
                        </div>
                    )}

                    <Button
                        type="submit"
                        size="lg"
                        className="w-full"
                        isLoading={isLoading}
                        disabled={otp.length !== 6}
                    >
                        Verify & Continue <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </form>

                <div className="mt-8 text-center">
                    <button
                        onClick={handleResend}
                        disabled={isResendDisabled}
                        className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] flex items-center justify-center mx-auto transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <RefreshCw className={`h-3 w-3 mr-2 ${isResendDisabled ? 'animate-spin' : ''}`} />
                        {isResendDisabled ? `Resend code in ${timer}s` : "Didn't receive code? Resend"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

export default function VerifyPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyContent />
        </Suspense>
    );
}
