'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useGame } from '@/context/GameContext';

function UsernameForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { username, setUsername } = useGame();
    const [localUsername, setLocalUsername] = useState(username || '');
    const [error, setError] = useState('');
    
    const nextPage = searchParams.get('next') || '/';

    useEffect(() => {
        // If username already set, redirect to next page
        if (username) {
            router.push(nextPage);
        }
    }, [username, nextPage, router]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = localUsername.trim();
        
        if (trimmed.length < 2) {
            setError('Username must be at least 2 characters');
            return;
        }
        
        if (trimmed.length > 12) {
            setError('Username must be 12 characters or less');
            return;
        }
        
        setUsername(trimmed);
        router.push(nextPage);
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-6 relative overflow-hidden font-display">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[70%] h-[50%] bg-primary/5 rounded-full blur-[120px] opacity-60"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[40%] bg-blue-900/5 rounded-full blur-[100px]"></div>
            </div>

            {/* Main Card */}
            <div className="relative z-10 w-full max-w-md animate-fade-in">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 border-2 border-primary/20 mb-6">
                        <span className="material-symbols-outlined text-primary text-4xl">person</span>
                    </div>
                    <h1 className="text-4xl font-black text-white mb-2 tracking-tight">Welcome</h1>
                    <p className="text-gray-400 tracking-wide">Enter your name to continue</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <input
                            type="text"
                            value={localUsername}
                            onChange={(e) => {
                                setLocalUsername(e.target.value);
                                setError('');
                            }}
                            maxLength={12}
                            autoFocus
                            placeholder="Enter your name"
                            className="w-full h-16 px-6 bg-white/5 border-2 border-white/10 rounded-xl text-white text-lg font-bold tracking-wide placeholder:text-gray-600 placeholder:font-normal focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 text-sm font-mono">
                            {localUsername.length}/12
                        </div>
                    </div>

                    {error && (
                        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                            <span className="material-symbols-outlined text-lg">error</span>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={localUsername.trim().length < 2}
                        className="w-full h-14 bg-primary hover:bg-red-600 disabled:bg-gray-800 disabled:text-gray-600 disabled:cursor-not-allowed text-white font-bold text-lg tracking-wide rounded-xl transition-all duration-200 flex items-center justify-center gap-3 shadow-lg shadow-primary/20 hover:shadow-primary/30 disabled:shadow-none active:scale-[0.98]"
                    >
                        <span>CONTINUE</span>
                        <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                </form>

                {/* Info */}
                <div className="mt-8 text-center space-y-2">
                    <p className="text-gray-500 text-sm">
                        <span className="material-symbols-outlined text-xs align-middle mr-1">info</span>
                        This name will be visible to other players
                    </p>
                </div>

                {/* Back Link */}
                <button
                    onClick={() => router.push('/')}
                    className="absolute -top-16 left-0 flex items-center gap-2 text-gray-500 hover:text-white transition-colors"
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                    <span className="font-medium">Back</span>
                </button>
            </div>
        </div>
    );
}

export default function UsernamePage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background-dark flex items-center justify-center">
                <div className="animate-pulse text-white">Loading...</div>
            </div>
        }>
            <UsernameForm />
        </Suspense>
    );
}
