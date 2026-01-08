'use client';

import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

let toastQueue: Toast[] = [];
let listeners: Array<(toasts: Toast[]) => void> = [];

function notifyListeners() {
    listeners.forEach(listener => listener([...toastQueue]));
}

export function showToast(message: string, type: ToastType = 'info') {
    const toast: Toast = {
        id: Math.random().toString(36).substr(2, 9),
        message,
        type
    };
    
    toastQueue.push(toast);
    notifyListeners();
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        removeToast(toast.id);
    }, 5000);
}

export function removeToast(id: string) {
    toastQueue = toastQueue.filter(t => t.id !== id);
    notifyListeners();
}

export function ToastContainer() {
    const [toasts, setToasts] = useState<Toast[]>([]);
    
    useEffect(() => {
        const listener = (newToasts: Toast[]) => {
            setToasts(newToasts);
        };
        
        listeners.push(listener);
        
        return () => {
            listeners = listeners.filter(l => l !== listener);
        };
    }, []);
    
    if (toasts.length === 0) return null;
    
    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm">
            {toasts.map(toast => (
                <div
                    key={toast.id}
                    className={`
                        px-6 py-4 rounded-xl shadow-2xl border backdrop-blur-sm
                        flex items-center gap-3 animate-slide-in-right
                        ${toast.type === 'error' ? 'bg-red-500/20 border-red-500/50 text-red-100' : ''}
                        ${toast.type === 'success' ? 'bg-green-500/20 border-green-500/50 text-green-100' : ''}
                        ${toast.type === 'warning' ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-100' : ''}
                        ${toast.type === 'info' ? 'bg-blue-500/20 border-blue-500/50 text-blue-100' : ''}
                    `}
                >
                    <span className="material-symbols-outlined text-2xl">
                        {toast.type === 'error' && 'error'}
                        {toast.type === 'success' && 'check_circle'}
                        {toast.type === 'warning' && 'warning'}
                        {toast.type === 'info' && 'info'}
                    </span>
                    <p className="flex-1 font-medium">{toast.message}</p>
                    <button
                        onClick={() => removeToast(toast.id)}
                        className="text-white/60 hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined text-xl">close</span>
                    </button>
                </div>
            ))}
        </div>
    );
}
