'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';

export default function RegisterPage() {
    const [step, setStep] = useState<'register' | 'verify'>('register');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        year: '1st Year',
    });
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();
            if (res.ok) {
                setStep('verify');
            } else {
                setError(data.message || 'Registration failed');
            }
        } catch (error) {
            console.error(error);
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: formData.email, otp }),
            });

            const data = await res.json();
            if (res.ok) {
                alert('Verification successful! You can now login.');
                router.push('/login');
            } else {
                setError(data.message || 'Verification failed');
            }
        } catch (error) {
            console.error(error);
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white">
            <Navbar />
            <div className="flex items-center justify-center py-20 px-4">
                <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
                    <h2 className="text-3xl font-bold text-center mb-6">
                        {step === 'register' ? 'Create Account' : 'Verify Email'}
                    </h2>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500 text-red-100 p-3 rounded mb-4 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {step === 'register' ? (
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400">Full Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400">Phone Number</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400">Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-400">Year</label>
                                <select
                                    name="year"
                                    value={formData.year}
                                    onChange={handleChange}
                                    className="w-full mt-1 p-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="1st Year">1st Year</option>
                                    <option value="2nd Year">2nd Year</option>
                                    <option value="3rd Year">3rd Year</option>
                                    <option value="4th Year">4th Year</option>
                                </select>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded font-bold transition duration-200 disabled:opacity-50"
                            >
                                {loading ? 'Registering...' : 'Register'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerify} className="space-y-6">
                            <div>
                                <p className="text-gray-400 text-sm mb-4 text-center">
                                    We sent a 6-digit code to <strong>{formData.email}</strong>.
                                </p>
                                <label className="block text-sm font-medium text-gray-400">Enter OTP</label>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    placeholder="123456"
                                    className="w-full mt-1 p-3 text-center bg-gray-700 border border-gray-600 rounded text-white text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-green-500"
                                    maxLength={6}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold transition duration-200 disabled:opacity-50"
                            >
                                {loading ? 'Verifying...' : 'Verify Email'}
                            </button>

                            <button
                                type="button"
                                onClick={() => setStep('register')}
                                className="w-full text-sm text-gray-400 hover:text-white"
                            >
                                Back to Registration
                            </button>
                        </form>
                    )}

                    {step === 'register' && (
                        <p className="mt-4 text-center text-gray-400">
                            Already have an account?{' '}
                            <Link href="/login" className="text-green-400 hover:underline">
                                Login
                            </Link>
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
