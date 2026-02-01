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
        if (percentage > 60) return '#10b981'; // green
        if (percentage > 30) return '#eab308'; // yellow
        return '#ef4444'; // red
    };
    
    const strokeColor = getColor();
    const radius = 36;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    
    return (
        <div className="relative w-20 h-20 p-2">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Background circle */}
                <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.1)"
                    strokeWidth="6"
                />
                {/* Progress circle */}
                <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-linear"
                    style={{
                        filter: `drop-shadow(0 0 6px ${strokeColor})`
                    }}
                />
            </svg>
            {/* Time display in center */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-lg font-mono font-black text-white">
                    {minutes}:{seconds.toString().padStart(2, '0')}
                </span>
                {label && (
                    <span className="text-[7px] font-bold text-white/40 uppercase tracking-wider mt-0.5">
                        {label}
                    </span>
                )}
            </div>
        </div>
    );
}
