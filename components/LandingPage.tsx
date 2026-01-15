import React from 'react';
import { Button } from './Button';

interface LandingPageProps {
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  onSinglePlayer: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onCreateRoom, onJoinRoom, onSinglePlayer }) => {
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-8 bg-dharma-dark overflow-hidden">
      {/* Animated Mandala Background */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <svg className="w-[150%] h-[150%] text-dharma-gold/5 animate-spin-slow opacity-20" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <path fill="currentColor" d="M100,10 A90,90 0 1,1 100,190 A90,90 0 1,1 100,10 M100,30 A70,70 0 1,0 100,170 A70,70 0 1,0 100,30" />
          <g transform="translate(100,100)">
            {Array.from({ length: 12 }).map((_, i) => (
              <rect key={i} x="-2" y="-95" width="4" height="20" transform={`rotate(${i * 30})`} fill="currentColor" />
            ))}
          </g>
        </svg>
      </div>

      {/* Decorative Orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-dharma-teal/10 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-dharma-crimson/10 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-4xl w-full text-center space-y-12 relative z-10">
        {/* Header Section */}
        <header className="space-y-6 animate-in fade-in slide-in-from-top duration-1000">
          <div className="inline-block px-4 py-1.5 rounded-full bg-dharma-gold/10 border border-dharma-gold/20 text-dharma-gold text-[10px] font-black uppercase tracking-[0.4em] mb-4">
            Mythological Strategy Card Game
          </div>
          <h1 className="text-7xl md:text-9xl font-black text-white tracking-tighter uppercase leading-none drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            Tales <span className="text-dharma-gold">of</span> <br /> Dharma
          </h1>
          <p className="text-lg md:text-xl font-medium text-white/40 uppercase tracking-[0.3em] max-w-2xl mx-auto">
            Chapter I: The Gathering of Souls
          </p>
        </header>

        {/* Feature Display */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom duration-1000 delay-300">
          <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-dharma-teal">Players</span>
            <p className="text-2xl font-bold text-white">2 — 6</p>
          </div>
          <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-dharma-gold">Strategy</span>
            <p className="text-2xl font-bold text-white">Advanced</p>
          </div>
          <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Duration</span>
            <p className="text-2xl font-bold text-white">45 Mins</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8 animate-in fade-in duration-1000 delay-500">
          <button 
            onClick={onSinglePlayer}
            className="w-full sm:w-64 h-16 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-dharma-gold transition-all transform hover:scale-105 active:scale-95 shadow-2xl"
          >
            Ascend Alone
          </button>
          <div className="flex gap-4 w-full sm:w-auto">
            <button 
              onClick={onCreateRoom}
              className="flex-1 sm:w-48 h-16 bg-dharma-teal text-white font-black uppercase tracking-widest rounded-2xl hover:bg-teal-400 transition-all transform hover:scale-105 active:scale-95 border border-teal-300/20"
            >
              Forge Realm
            </button>
            <button 
              onClick={onJoinRoom}
              className="flex-1 sm:w-48 h-16 bg-white/5 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all border border-white/10"
            >
              Enter Code
            </button>
          </div>
        </div>
      </div>

      <footer className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[9px] font-black uppercase tracking-[0.6em] text-white/20 whitespace-nowrap">
        Built for the Divine Cycle • Chapter 1.0.4
      </footer>
    </div>
  );
};