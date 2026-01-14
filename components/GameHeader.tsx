
import React, { useState, useEffect } from 'react';
import { Player } from '../types';

interface GameHeaderProps {
  turnNumber: number;
  activePlayer: Player;
  turnStartTime: number;
}

export const GameHeader: React.FC<GameHeaderProps> = ({ turnNumber, activePlayer, turnStartTime }) => {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    // Reset timer when turnStartTime changes
    const start = Math.floor(turnStartTime / 1000);
    const update = () => {
      const now = Math.floor(Date.now() / 1000);
      setSeconds(now - start);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [turnStartTime]);

  const formatTime = (s: number) => {
    const mins = Math.floor(Math.max(0, s) / 60);
    const secs = Math.max(0, s) % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-4 md:py-6 bg-gradient-to-b from-black/90 to-transparent flex items-center justify-between pointer-events-none">
      <div className="flex items-center gap-8 pointer-events-auto">
        <div className="hidden md:block space-y-1">
          <h1 className="text-2xl font-black uppercase tracking-tighter text-white leading-none">Tales of Dharma</h1>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Chapter 1: The Gathering</span>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center bg-white/5 border border-white/10 px-4 py-1 rounded-lg">
           <span className="text-[8px] font-black uppercase tracking-[0.2em] text-[#F59E0B]">Cycle</span>
           <span className="text-lg font-black text-white">{turnNumber}</span>
        </div>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-4 bg-black/40 backdrop-blur-2xl px-6 md:px-10 py-3 rounded-full border border-white/10 pointer-events-auto shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <div className="w-3 h-3 rounded-full animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.5)]" style={{ backgroundColor: activePlayer.color }}></div>
        <h2 className="text-sm md:text-xl font-black uppercase tracking-widest text-white whitespace-nowrap">
          {activePlayer.name}'s Turn
        </h2>
        <div className="h-6 w-px bg-white/10 mx-2"></div>
        <p className="text-sm font-mono font-bold text-white/50">{formatTime(seconds)}</p>
      </div>

      <div className="flex items-center gap-6 pointer-events-auto">
        <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white hover:bg-red-500/20 hover:border-red-500/40 transition-all">
          Leave
        </button>
      </div>
    </header>
  );
};
