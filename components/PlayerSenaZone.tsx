
import React, { useRef } from 'react';
import { Player, TargetingMode, GameCard as IGameCard } from '../types';
import { GameCard } from './GameCard';
import { UI_TRANSITIONS } from '../constants';

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
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-4">
        <h5 className="text-[10px] font-black uppercase tracking-[0.6em] text-white/20">Sena Forces</h5>
        {player.sena.length > 3 && (
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
        className="flex gap-8 p-10 bg-black/40 rounded-[40px] border-4 border-white/5 min-h-[260px] overflow-x-auto scrollbar-hide shadow-inner relative"
      >
        {player.sena.map(card => {
          const canBeTargeted = 
            (targetingMode === 'curse' && isOpponent) || 
            (targetingMode === 'astra' && !isOpponent) || 
            (targetingMode === 'maya');

          return (
            <div key={card.id} className="flex-shrink-0 relative">
              <GameCard 
                card={card} 
                size="sm" 
                isInteractive={canBeTargeted} 
                isTargetable={canBeTargeted}
                onClick={() => canBeTargeted && onTargetSelect(player.id, card.id)}
              />
              {/* Tooltip for attachments if any */}
              {(card.attachedAstras.length > 0 || card.curses.length > 0) && (
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-20">
                  {card.attachedAstras.map((_, i) => (
                    <div key={`a-${i}`} className="w-2 h-2 rounded-full bg-[#F59E0B] shadow-[0_0_8px_#F59E0B]"></div>
                  ))}
                  {card.curses.map((_, i) => (
                    <div key={`c-${i}`} className="w-2 h-2 rounded-full bg-[#7F1D1D] shadow-[0_0_8px_#7F1D1D]"></div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {player.sena.length === 0 && (
          <div className="flex-1 flex items-center justify-center opacity-10">
            <span className="text-[11px] font-black uppercase tracking-[0.8em] italic">Army Awaiting Summon</span>
          </div>
        )}
      </div>
    </div>
  );
};
