
import React, { useRef } from 'react';
import { Player, TargetingMode, GameCard as IGameCard } from '../types';
import { GameCard } from './GameCard';

interface PlayerSenaZoneProps {
  player: Player;
  isOpponent: boolean;
  targetingMode: TargetingMode;
  onTargetSelect: (playerId: string, cardId: string) => void;
}

export const PlayerSenaZone: React.FC<PlayerSenaZoneProps> = ({ 
  player, 
  isOpponent, 
  targetingMode, 
  onTargetSelect 
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollSena = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = dir === 'left' ? -200 : 200;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center justify-between px-4">
        <h5 className="text-[10px] font-black uppercase tracking-[0.6em] text-white/40">Sena Forces</h5>
        {player.sena.length > 3 && (
          <div className="flex gap-2">
            <button onClick={() => scrollSena('left')} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 text-white/40 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button onClick={() => scrollSena('right')} className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 text-white/40 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        )}
      </div>

      <div 
        ref={scrollRef}
        className="flex gap-8 p-8 bg-black/40 rounded-[40px] border-2 border-white/5 min-h-[280px] overflow-x-auto scrollbar-hide shadow-inner relative transition-all"
      >
        {player.sena.length > 0 ? (
          player.sena.map(card => {
            const isAstraTarget = targetingMode === 'astra' && !isOpponent;
            const isCurseTarget = targetingMode === 'curse' && isOpponent;
            const isMayaTarget = targetingMode === 'maya';
            const canBeTargeted = isAstraTarget || isCurseTarget || isMayaTarget;

            return (
              <div key={card.id} className="flex-shrink-0 relative group">
                <GameCard 
                  card={card} 
                  size="sm" 
                  isInteractive={canBeTargeted} 
                  isTargetable={canBeTargeted}
                  onClick={() => canBeTargeted && onTargetSelect(player.id, card.id)}
                />
                
                {/* Stats & Attachments Tooltip */}
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                   <div className="bg-black/90 border border-white/20 px-3 py-1 rounded-full flex gap-2">
                      <span className="text-[8px] font-black text-white/60">STR: 7-11</span>
                      <span className="text-[8px] font-black text-blue-400">Class: {card.classSymbol}</span>
                   </div>
                </div>

                {/* Visual Attachment Indicators */}
                {(card.attachedAstras.length > 0 || card.curses.length > 0) && (
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex gap-1 z-30">
                    {card.attachedAstras.map((_, i) => (
                      <div key={`a-${i}`} className="w-2.5 h-2.5 rounded-full bg-yellow-500 shadow-[0_0_10px_#F59E0B] border border-white/40"></div>
                    ))}
                    {card.curses.map((_, i) => (
                      <div key={`c-${i}`} className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-[0_0_10px_#7F1D1D] border border-white/40"></div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-20 gap-3">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span className="text-[10px] font-black uppercase tracking-[0.8em] italic">Army Awaiting Manifestation</span>
          </div>
        )}
      </div>
    </div>
  );
};
