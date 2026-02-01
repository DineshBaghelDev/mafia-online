'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const nextUrl = searchParams.get('next') || '/';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, password);
            router.push(nextUrl);
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background-dark text-white flex items-center justify-center p-6 font-display">
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]"></div>
            </div>

            <div className="relative w-full max-w-md">
                <div className="bg-surface-dark border border-white/10 rounded-2xl p-8 shadow-2xl">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center size-16 bg-primary/10 rounded-2xl mb-4">
                            <span className="material-symbols-outlined text-primary text-3xl">login</span>
                        </div>
                        <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
                        <p className="text-gray-400">Sign in to continue playing</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full h-12 px-4 bg-black/30 text-white placeholder-gray-500 border border-white/10 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full h-12 px-4 bg-black/30 text-white placeholder-gray-500 border border-white/10 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full h-12 bg-primary hover:bg-red-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <span className="animate-spin material-symbols-outlined">progress_activity</span>
                                    <span>SIGNING IN...</span>
                                </>
                            ) : (
                                <>
                                    <span>SIGN IN</span>
                                    <span className="material-symbols-outlined">arrow_forward</span>
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-gray-400 text-sm">
                            Don't have an account?{' '}
                            <Link 
                                href={`/signup${nextUrl ? `?next=${nextUrl}` : ''}`}
                                className="text-primary hover:text-red-400 font-medium transition-colors"
                            >
                                Sign up
                            </Link>
                        </p>
                    </div>

                    <div className="mt-6 pt-6 border-t border-white/10">
                        <button
                            onClick={() => router.push('/')}
                            className="w-full text-gray-400 hover:text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined text-lg">arrow_back</span>
                            <span>Back to Home</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background-dark text-white flex items-center justify-center">
                <div className="animate-spin material-symbols-outlined text-primary text-4xl">progress_activity</div>
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
}
