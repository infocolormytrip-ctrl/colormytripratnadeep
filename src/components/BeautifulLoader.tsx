import React, { useEffect, useState } from 'react';
import { Compass, Sparkles, ShieldCheck } from 'lucide-react';

interface BeautifulLoaderProps {
  message?: string;
  subMessage?: string;
  className?: string;
  isDark?: boolean;
}

export default function BeautifulLoader({ 
  message = "Syncing Dashboard Desk", 
  subMessage = "Connecting to administrative databases...",
  className = "",
  isDark = false
}: BeautifulLoaderProps) {
  const [loadingText, setLoadingText] = useState(message);
  const [progress, setProgress] = useState(10);

  // Rotate messages for a professional, alive feel during slightly longer transitions
  useEffect(() => {
    const messages = [
      "Securing connection...",
      "Resolving authorization role...",
      "Syncing dashboard configurations...",
      "Fetching real-time enquiries...",
      "Calculating affiliate commission metrics...",
      "Loading CMS panel settings..."
    ];
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % messages.length;
      setLoadingText(messages[currentIndex]);
    }, 1800);

    return () => clearInterval(interval);
  }, []);

  // Simulate smooth progress loader
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? 90 : prev + Math.floor(Math.random() * 15) + 5));
    }, 400);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className={`min-h-[400px] w-full flex flex-col items-center justify-center p-8 rounded-3xl border backdrop-blur-xl transition-all duration-350 ${
      isDark 
        ? 'bg-slate-900/80 border-slate-800 shadow-2xl text-slate-100' 
        : 'bg-white/90 border-slate-100 shadow-xl text-slate-800'
    } ${className}`}>
      <div className="relative flex items-center justify-center mb-8">
        
        {/* Glow effect backdrops */}
        <div className="absolute w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl animate-pulse" />
        <div className="absolute w-16 h-16 bg-sky-500/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />

        {/* Triple Spinning concentric loaders */}
        <div className={`w-20 h-20 rounded-full border-4 ${isDark ? 'border-slate-800' : 'border-slate-100'} border-t-indigo-600 animate-spin`} />
        <div className="absolute w-16 h-16 rounded-full border-4 border-transparent border-b-sky-450 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }} />
        <div className="absolute w-12 h-12 rounded-full border-4 border-transparent border-t-pink-400 animate-spin" style={{ animationDuration: '2.5s' }} />

        {/* Center pulsing icon */}
        <div className={`absolute flex items-center justify-center w-10 h-10 rounded-full shadow-md text-indigo-650 animate-bounce ${isDark ? 'bg-slate-850' : 'bg-white'}`}>
          <Compass className="w-5 h-5 animate-spin" style={{ animationDuration: '8s' }} />
        </div>
      </div>

      {/* Title */}
      <h3 className={`text-lg font-bold tracking-tight flex items-center gap-2 ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
        <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
        <span>{message}</span>
      </h3>

      {/* Rotating Status Messages */}
      <p className="text-xs font-semibold uppercase tracking-wider text-indigo-500 mt-2.5 h-4 animate-pulse">
        {loadingText}
      </p>
      
      {/* Sub message */}
      <p className={`text-xs mt-1 text-center max-w-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
        {subMessage}
      </p>

      {/* Progress Bar Container */}
      <div className={`w-48 h-1.5 rounded-full overflow-hidden mt-6 border ${isDark ? 'bg-slate-800/80 border-slate-700/50' : 'bg-slate-100 border-slate-200/50'}`}>
        <div 
          className="h-full bg-gradient-to-r from-indigo-500 via-sky-400 to-indigo-500 transition-all duration-300 ease-out rounded-full" 
          style={{ width: `${progress}%` }} 
        />
      </div>

      <div className={`flex items-center gap-1.5 mt-8 text-[10px] font-bold px-3 py-1.5 rounded-full border shadow-sm ${
        isDark ? 'bg-slate-850 border-slate-800 text-slate-400' : 'bg-slate-50 border-slate-150 text-slate-500'
      }`}>
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
        <span>SECURE SHIELD CONNECTED</span>
      </div>
    </div>
  );
}
