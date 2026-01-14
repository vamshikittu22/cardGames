
import React, { useEffect, useState } from 'react';
import { Player, WinnerInfo, GameCard as IGameCard } from '../types';
import { UI_TRANSITIONS } from '../constants';
import { GameCard } from './GameCard';

interface VictoryScreenProps {
  roomName: string;
  winner: WinnerInfo;
  players: Player[];
  turnCount: number;
  onReturnToLobby: () => void;
  onExit: () => void;
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({ 
  roomName, 
  winner, 
  players, 
  turnCount,
  onReturnToLobby, 
  onExit 
}) => {
  const [showStats, setShowStats] = useState(false);
  const winningPlayer = players.find(p => p.id === winner.id)!;

  useEffect(() => {
    const timer = setTimeout(() => setShowStats(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-[500] bg-[#0F172A] flex items-center justify-center p-6 overflow-y-auto">
      {/* Background Animated Elements (Confetti placeholder) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 40 }).map((_, i) => (
          <div 
            key={i}
            className="absolute w-2 h-2 rounded-full animate-bounce opacity-40"
            style={{ 
              top: `${Math.random() * 100}%`, 
              left: `${Math.random() * 100}%`,
              backgroundColor: ['#F59E0B', '#EA580C', '#7C3AED', '#0F766E'][i % 4],
              animationDuration: `${2 + Math.random() * 3}s`,
              animationDelay: `${Math.random() * 5}s`
            }}
          />
        ))}
      </div>

      <div className="max-w-4xl w-full bg-black/40 backdrop-blur-3xl border-2 border-white/10 rounded-[48px] p-8 md:p-16 relative shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col items-center text-center animate-in zoom-in duration-700">
        
        {/* Victory Badge */}
        <div className="mb-10 relative">
           <div className="absolute -inset-12 bg-yellow-500/20 rounded-full blur-3xl animate-pulse"></div>
           <div className="w-32 h-32 rounded-full bg-gradient-to-br from-yellow-400 via-orange-500 to-red-600 flex items-center justify-center border-4 border-white/20 shadow-[0_0_50px_rgba(245,158,11,0.5)]">
              <span className="text-6xl">🏆</span>
           </div>
        </div>

        <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter text-white mb-2 leading-none drop-shadow-2xl">
          {winner.name} Wins!
        </h1>
        <p className="text-xl md:text-2xl font-black uppercase tracking-[0.5em] text-yellow-500 mb-12 drop-shadow-lg">
          {winner.condition === 'assura-capture' ? 'VICTORY BY ASSURA CAPTURE' : 'VICTORY BY CLASS MASTERY'}
        </p>

        {/* Highlight Winner Achievement */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full mb-12 items-center">
           <div className="flex flex-col items-center gap-6">
              <div className="w-40 h-40 rounded-full border-[12px] border-white/5 flex items-center justify-center text-white text-7xl font-black shadow-2xl relative" style={{ backgroundColor: winner.color }}>
                 {winner.name[0]}
                 <div className="absolute -bottom-2 -right-2 bg-yellow-500 text-black px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest shadow-xl">WINNER</div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Divine Order has been restored in</p>
                <p className="text-lg font-black text-white uppercase tracking-tight">{roomName}</p>
              </div>
           </div>

           <div className="bg-white/5 rounded-[40px] border border-white/10 p-8 flex flex-col items-center shadow-inner">
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 mb-6">Army Achievement</h3>
              {winner.condition === 'assura-capture' ? (
                <div className="flex gap-3 justify-center flex-wrap">
                   {winningPlayer.jail.map(a => (
                     <GameCard key={a.id} card={a} size="sm" className="scale-90" isInteractive={false} />
                   ))}
                </div>
              ) : (
                <div className="flex flex-wrap justify-center gap-3">
                   {/* Show one of each unique class represented */}
                   {Array.from(new Set(winningPlayer.sena.map(m => m.classSymbol))).map(cls => (
                      <div key={cls} className="w-12 h-12 rounded-xl bg-yellow-500 flex flex-col items-center justify-center text-black shadow-lg transform hover:scale-110 transition-transform">
                        <span className="font-black text-lg">{cls![0]}</span>
                        <span className="text-[6px] font-bold uppercase -mt-1">{cls}</span>
                      </div>
                   ))}
                </div>
              )}
           </div>
        </div>

        {/* Leaderboard / Runner-ups */}
        <div className={`w-full space-y-3 transition-all duration-1000 ${showStats ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
           <div className="flex items-center justify-between mb-4 border-b border-white/5 pb-2">
              <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">The Hall of Records</h4>
              <span className="text-[10px] font-black text-white/20 uppercase tracking-widest">Duration: {turnCount} Turns</span>
           </div>
           
           {players.sort((a, b) => {
              // Win condition weighting: captured + classes
              const aProgress = a.jail.length * 2 + new Set(a.sena.map(m => m.classSymbol)).size;
              const bProgress = b.jail.length * 2 + new Set(b.sena.map(m => m.classSymbol)).size;
              return bProgress - aProgress;
           }).map((p, idx) => (
             <div key={p.id} className={`flex items-center justify-between p-5 rounded-[24px] border ${p.id === winner.id ? 'bg-yellow-500/10 border-yellow-500/40 shadow-[0_0_30px_rgba(234,88,12,0.1)]' : 'bg-white/[0.02] border-white/5'}`}>
                <div className="flex items-center gap-6">
                   <span className="text-xs font-black text-white/20 tabular-nums">#{idx + 1}</span>
                   <div className="w-10 h-10 rounded-full border-2 border-white/10" style={{ backgroundColor: p.color }}></div>
                   <div className="text-left">
                     <span className="text-sm font-black uppercase text-white tracking-tight">{p.name}</span>
                     <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest">{p.isCreator ? 'Scribe' : 'Seeker'}</p>
                   </div>
                </div>
                <div className="flex gap-8">
                   <div className="text-right">
                      <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest mb-1">Assuras</p>
                      <p className={`text-lg font-black ${p.jail.length === 2 ? 'text-orange-500 animate-pulse' : 'text-white'}`}>{p.jail.length}/3</p>
                   </div>
                   <div className="text-right">
                      <p className="text-[8px] font-bold text-white/40 uppercase tracking-widest mb-1">Classes</p>
                      <p className={`text-lg font-black ${new Set(p.sena.map(m => m.classSymbol)).size === 5 ? 'text-yellow-500 animate-pulse' : 'text-white'}`}>{new Set(p.sena.map(m => m.classSymbol)).size}/6</p>
                   </div>
                </div>
             </div>
           ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-6 mt-16 w-full max-w-lg">
           <button 
            onClick={onReturnToLobby}
            className="flex-1 py-5 bg-white text-black rounded-[24px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all hover:scale-105 active:scale-95 shadow-2xl"
           >
             Return to Lobby
           </button>
           <button 
            onClick={onExit}
            className="flex-1 py-5 bg-white/5 text-white border border-white/10 rounded-[24px] font-black uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95"
           >
             Exit to Hub
           </button>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 text-[10px] font-black uppercase tracking-[0.4em] text-white/10">
           CHAPTER 1: THE GATHERING — COMPLETED
        </div>
      </div>
    </div>
  );
};
