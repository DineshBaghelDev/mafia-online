'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useGame } from '@/context/GameContext';
import { showToast } from '@/components/ui/Toast';

export default function ProfilePage() {
    const router = useRouter();
    const { user, isAuthenticated, isLoading, logout } = useAuth();
    const { username, setUsername } = useGame();
    const [displayName, setDisplayName] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isLoading) return;
        
        if (!isAuthenticated) {
            router.push('/login?next=/profile');
            return;
        }
        
        // Initialize with current username
        if (username) {
            setDisplayName(username);
        } else if (user) {
            setDisplayName(user.username);
        }
    }, [isAuthenticated, isLoading, router, username, user]);

    const handleSave = () => {
        if (!displayName.trim() || displayName.length < 3) {
            showToast('Username must be at least 3 characters', 'error');
            return;
        }
        
        setIsSaving(true);
        setTimeout(() => {
            setUsername(displayName.trim());
            showToast('Profile updated!', 'success');
            setIsSaving(false);
        }, 500);
    };

    const handleLogout = () => {
        logout();
        router.push('/');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background-dark text-white flex items-center justify-center">
                <div className="animate-spin material-symbols-outlined text-primary text-4xl">progress_activity</div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background-dark text-white font-display">
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]"></div>
            </div>

            {/* Navbar */}
            <nav className="relative z-20 w-full px-6 py-4 border-b border-white/5 bg-background-dark/50 backdrop-blur-md">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center gap-3"
                    >
                        <span className="material-symbols-outlined text-primary text-3xl">skull</span>
                        <h1 className="text-xl font-bold tracking-tight">M<span className="text-primary">A</span>FIA</h1>
                    </button>
                    <button
                        onClick={() => router.push('/')}
                        className="text-gray-400 hover:text-white transition-colors flex items-center gap-2"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                        <span className="hidden sm:inline">Back</span>
                    </button>
                </div>
            </nav>

            {/* Content */}
            <main className="relative z-10 max-w-2xl mx-auto p-6 pt-12">
                <div className="bg-surface-dark border border-white/10 rounded-2xl p-8 shadow-2xl">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="size-20 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-3xl font-bold border-2 border-primary/20">
                            {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Profile Settings</h1>
                            <p className="text-gray-400">{user.email}</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Display Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Display Name
                            </label>
                            <input
                                type="text"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                className="w-full h-12 px-4 bg-black/30 text-white placeholder-gray-500 border border-white/10 rounded-xl focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                                placeholder="Your display name"
                                minLength={3}
                                maxLength={20}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                This is the name other players will see in games (3-20 characters)
                            </p>
                        </div>

                        {/* Account Info */}
                        <div className="pt-6 border-t border-white/10">
                            <h3 className="text-lg font-bold mb-4">Account Information</h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-400">Email</span>
                                    <span className="font-medium">{user.email}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-400">User ID</span>
                                    <span className="font-mono text-sm text-gray-500">{user.id.slice(0, 8)}...</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-6 border-t border-white/10 space-y-3">
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="w-full h-12 bg-primary hover:bg-red-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSaving ? (
                                    <>
                                        <span className="animate-spin material-symbols-outlined">progress_activity</span>
                                        <span>SAVING...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined">save</span>
                                        <span>SAVE CHANGES</span>
                                    </>
                                )}
                            </button>
                            
                            <button
                                onClick={handleLogout}
                                className="w-full h-12 bg-white/5 hover:bg-white/10 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined">logout</span>
                                <span>LOGOUT</span>
                            </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
