'use client';

import { useEffect, useState } from 'react';

interface BackendConnectionStatusProps {
  isConnected: boolean;
  showAfterDelay?: number; // ms to wait before showing (default 2000)
}

export function BackendConnectionStatus({ 
  isConnected, 
  showAfterDelay = 2000 
}: BackendConnectionStatusProps) {
  const [showLoading, setShowLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (!isConnected) {
      // Show loading indicator after a delay to avoid flashing on quick reconnects
      const timer = setTimeout(() => {
        setShowLoading(true);
      }, showAfterDelay);

      // Increment retry count for user feedback
      const retryTimer = setInterval(() => {
        setRetryCount(prev => prev + 1);
      }, 5000);

      return () => {
        clearTimeout(timer);
        clearInterval(retryTimer);
      };
    } else {
      setShowLoading(false);
      setRetryCount(0);
    }
  }, [isConnected, showAfterDelay]);

  if (!showLoading) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gray-900 border-2 border-red-500 rounded-lg p-8 max-w-md mx-4 text-center shadow-2xl">
        {/* Animated spinner */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-gray-700 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-red-500 rounded-full animate-spin"></div>
          <div className="absolute inset-2 border-4 border-transparent border-t-red-400 rounded-full animate-spin" style={{ animationDuration: '1.5s' }}></div>
        </div>

        {/* Main message */}
        <h2 className="text-2xl font-bold text-white mb-3">
          Connecting to Server
        </h2>
        
        <p className="text-gray-300 mb-2">
          {retryCount === 0 
            ? "Waking up the game server..."
            : "Still connecting..."}
        </p>
        
        {/* Explanation */}
        <div className="text-sm text-gray-400 bg-gray-800/50 rounded p-3 mt-4">
          <p className="mb-2">
            The server is starting up (free tier cold start).
          </p>
          <p className="text-xs text-gray-500">
            This usually takes 30-60 seconds on first visit.
          </p>
        </div>

        {/* Retry count indicator */}
        {retryCount > 0 && (
          <div className="mt-4 flex items-center justify-center gap-2 text-gray-400">
            <div className="flex gap-1">
              {[...Array(Math.min(retryCount, 5))].map((_, i) => (
                <div key={i} className="w-2 h-2 bg-red-500 rounded-full animate-pulse" 
                     style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
            <span className="text-xs">
              {retryCount * 5}s
            </span>
          </div>
        )}

        {/* Long wait message */}
        {retryCount >= 3 && (
          <div className="mt-4 text-sm text-yellow-400 bg-yellow-900/20 border border-yellow-700/30 rounded p-3">
            <p className="font-medium mb-1">Taking longer than expected?</p>
            <p className="text-xs text-yellow-300">
              Try refreshing the page or check your internet connection.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
