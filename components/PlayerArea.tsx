
import React, { useRef } from 'react';
import { Player, TargetingMode } from '../types';
import { GameCard } from './GameCard';
import { UI_TRANSITIONS } from '../constants';

interface PlayerAreaProps {
  player: Player;
  isActive: boolean;
  isCurrent: boolean;
  position: 'top' | 'bottom';
  targetingMode?: TargetingMode;
  onTargetSelect?: (playerId: string, cardId: string) => void;
  isGameOver?: boolean;
}

export const PlayerArea: React.FC<PlayerAreaProps> = ({ 
  player, 
  isActive, 
  isCurrent, 
  position,
  targetingMode = 'none',
  onTargetSelect,
  isGameOver = false
}) => {
  const isOpponent = !isCurrent;
  const sena = player.sena;
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollSena = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = dir === 'left' ? -200 : 200;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  return (
    <div className={`
      relative flex flex-col gap-6 p-10 rounded-[60px] ${UI_TRANSITIONS}
      ${isActive && !isGameOver ? 'bg-white/5 ring-4 ring-[#F59E0B]/50' : 'bg-black/20'}
      w-full border-2 border-white/5 shadow-2xl
    `}>
      {/* Identity Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-3xl font-black uppercase shadow-inner border-4 border-white/10" style={{ backgroundColor: player.color }}>
            {player.name[0]}
          </div>
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tighter text-white">{player.name} {isCurrent && '(Thou)'}</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">{isActive ? 'Manifesting Cycle' : 'Awaiting Karma'}</p>
          </div>
        </div>

        <div className="flex gap-8 items-center border-l border-white/10 pl-10">
           <div className="text-right">
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">Karma</p>
              <p className="text-4xl font-black text-[#F59E0B] leading-none">{player.karmaPoints}</p>
           </div>
        </div>
      </div>

      {/* Forces Zone */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-4">
          <h5 className="text-[10px] font-black uppercase tracking-[0.6em] text-white/20">Sena Forces</h5>
          {sena.length > 3 && (
            <div className="flex gap-2">
              <button onClick={() => scrollSena('left')} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 text-white/40">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button onClick={() => scrollSena('right')} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 text-white/40">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          )}
        </div>
        <div 
          ref={scrollRef}
          className="flex gap-8 p-10 bg-black/40 rounded-[40px] border-4 border-white/5 min-h-[220px] overflow-x-auto scrollbar-hide shadow-inner relative"
        >
           {sena.map(card => {
             const canBeTargeted = 
               (targetingMode === 'curse' && isOpponent) || 
               (targetingMode === 'astra' && isCurrent) || 
               (targetingMode === 'maya');

             return (
               <div key={card.id} className="flex-shrink-0 relative group">
                  <GameCard 
                    card={card} 
                    size="sm" 
                    isInteractive={canBeTargeted} 
                    isTargetable={canBeTargeted}
                    onClick={() => canBeTargeted && onTargetSelect?.(player.id, card.id)}
                  />
                  {canBeTargeted && (
                    <div className="absolute -inset-2 border-2 border-yellow-400 rounded-xl animate-pulse pointer-events-none"></div>
                  )}
               </div>
             );
           })}
           {sena.length === 0 && (
              <div className="flex-1 flex items-center justify-center opacity-10">
                <span className="text-[11px] font-black uppercase tracking-[0.8em] italic">Army Awaiting Summon</span>
              </div>
           )}
        </div>
      </div>

      {/* Hand Hint for Opponents */}
      {isOpponent && (
        <div className="flex items-center justify-center gap-2 pt-4">
          {Array.from({ length: Math.min(player.hand.length, 5) }).map((_, i) => (
            <div key={i} className="w-4 h-6 bg-white/5 border border-white/10 rounded-sm"></div>
          ))}
          <span className="text-[10px] font-black text-white/20 ml-2">{player.hand.length} CARDS</span>
        </div>
      )}
    </div>
  );
};
