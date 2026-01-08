'use client';

import { useEffect, useState } from 'react';

interface TimerProps {
    timerEnd?: number;
    duration?: number;
    label?: string;
}

export function Timer({ timerEnd, duration, label = 'Time Left' }: TimerProps) {
    const [timeLeft, setTimeLeft] = useState<number>(0);
    
    useEffect(() => {
        if (timerEnd) {
            const updateTimer = () => {
                const remaining = Math.max(0, Math.ceil((timerEnd - Date.now()) / 1000));
                setTimeLeft(remaining);
            };
            
            updateTimer();
            const interval = setInterval(updateTimer, 1000);
            
            return () => clearInterval(interval);
        } else if (duration) {
            setTimeLeft(duration);
        }
    }, [timerEnd, duration]);
    
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const percentage = duration ? Math.min(100, Math.max(0, (timeLeft / duration) * 100)) : 100;
    
    // Color changes as time runs out
    const getColor = () => {
        if (percentage > 60) return 'bg-green-500';
        if (percentage > 30) return 'bg-yellow-500';
        return 'bg-red-500';
    };
    
    return (
        <div className="w-full max-w-md mx-auto">
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white/60 uppercase tracking-wider">{label}</span>
                <span className="text-2xl font-mono font-bold text-white">
                    {minutes}:{seconds.toString().padStart(2, '0')}
                </span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div 
                    className={`h-full ${getColor()} transition-all duration-1000 ease-linear`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
