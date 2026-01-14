
import React from 'react';
import { Player, GameCard as IGameCard, TargetingMode } from '../types';
import { GameCard } from './GameCard';
import { UI_TRANSITIONS } from '../constants';

interface PlayerAreaProps {
  player: Player;
  isActive: boolean;
  isCurrent: boolean;
  position: 'top' | 'bottom' | 'left' | 'right';
  selectedCardId?: string | null;
  onCardClick?: (id: string) => void;
  targetingMode?: TargetingMode;
  onTargetSelect?: (playerId: string, cardId: string) => void;
}

const CLASSES = ['Vanas', 'Vahas', 'Dvas', 'Davis', 'Rishies', 'Kurus'];

export const PlayerArea: React.FC<PlayerAreaProps> = ({ 
  player, 
  isActive, 
  isCurrent, 
  position,
  selectedCardId,
  onCardClick,
  targetingMode = 'none',
  onTargetSelect
}) => {
  const isOpponent = !isCurrent;
  const representedClasses = new Set(player.sena.map(c => c.classSymbol).filter(Boolean));

  return (
    <div className={`
      relative flex flex-col gap-4 p-4 md:p-6 rounded-[32px] ${UI_TRANSITIONS}
      ${isActive ? 'bg-white/[0.04] ring-2 ring-[#F59E0B]/40 shadow-[0_0_80px_rgba(245,158,11,0.08)]' : 'bg-transparent'}
      ${position === 'top' ? 'flex-col-reverse' : 'flex-col'}
      ${isOpponent ? 'scale-90 md:scale-95' : 'scale-100'}
      ${isActive ? 'animate-pulse-subtle' : ''}
      ${targetingMode !== 'none' && !isCurrent ? 'z-[110]' : ''}
    `}>
      {/* Class Tracker */}
      <div className={`flex gap-1 justify-center ${position === 'top' ? 'mb-2' : 'mt-0'}`}>
        {CLASSES.map(cls => (
          <div 
            key={cls}
            title={cls}
            className={`w-4 h-4 rounded-sm border flex items-center justify-center text-[8px] font-black transition-all
              ${representedClasses.has(cls) 
                ? 'bg-yellow-500 border-yellow-300 text-black shadow-[0_0_8px_rgba(234,88,12,0.5)]' 
                : 'bg-white/5 border-white/10 text-white/20'}`}
          >
            {cls[0]}
          </div>
        ))}
      </div>

      {/* Player Info Bar */}
      <div className={`
        flex items-center justify-between px-4 md:px-6 py-3 md:py-4 bg-black/40 rounded-2xl border-2
        ${isActive ? 'border-[#F59E0B]/50' : 'border-white/5'}
      `}>
        <div className="flex items-center gap-3 md:gap-4">
          <div className="relative">
            <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white text-base md:text-xl font-black uppercase shadow-inner`} style={{ backgroundColor: player.color }}>
              {player.name[0]}
            </div>
            {isActive && <div className="absolute -inset-2 border-2 border-[#F59E0B]/30 rounded-full animate-ping opacity-30"></div>}
          </div>
          <div>
            <h3 className="text-sm md:text-lg font-black uppercase tracking-tighter text-white">{player.name}</h3>
            <p className={`text-[8px] md:text-[10px] font-bold uppercase tracking-widest leading-none ${isActive ? 'text-[#F59E0B]' : 'text-white/20'}`}>
              {isActive ? 'Current Prophecy' : 'Observing'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-8">
          <div className="text-center">
            <p className="text-[6px] md:text-[8px] font-black uppercase tracking-widest text-white/40 mb-1">Karma</p>
            <div className="flex items-center gap-1">
               <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] shadow-[0_0_8px_#F59E0B]"></div>
               <p className="text-xl md:text-3xl font-black text-[#F59E0B] leading-none">{player.karmaPoints}</p>
            </div>
          </div>
          
          <div className="h-8 md:h-10 w-px bg-white/10"></div>

          <div className="text-right">
             <p className="text-[6px] md:text-[8px] font-black uppercase tracking-widest text-white/40 mb-1">Hand</p>
             <p className="text-sm font-black text-white/60">{player.hand.length} Cards</p>
          </div>
        </div>
      </div>

      {/* Sena Area */}
      <div className="space-y-1 md:space-y-2">
        <h5 className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] text-white/20 px-2">Sena Forces</h5>
        <div className="flex gap-4 min-h-[120px] md:min-h-[160px] p-2 md:p-4 bg-black/30 rounded-2xl border border-white/5 relative overflow-x-auto scrollbar-hide">
          {player.sena.map(major => {
            const isTargetable = 
              (targetingMode === 'astra' && isCurrent) || 
              (targetingMode === 'curse' && isOpponent);

            return (
              <div key={major.id} className="relative group flex-shrink-0">
                <GameCard 
                  card={major} 
                  size="sm" 
                  className={`relative z-10 ${isTargetable ? 'ring-yellow-400 ring-offset-2' : ''}`} 
                  isInteractive={isTargetable}
                  isTargetable={isTargetable}
                  onClick={() => isTargetable && onTargetSelect?.(player.id, major.id)}
                />
              </div>
            );
          })}
          {player.sena.length === 0 && (
            <div className="flex-1 flex items-center justify-center opacity-5">
              <span className="text-[10px] font-black uppercase tracking-widest italic">Awaiting Forces</span>
            </div>
          )}
        </div>
      </div>

      {/* Hand Area */}
      {isCurrent ? (
        <div className={`relative group h-48 md:h-64 flex flex-col items-center ${targetingMode !== 'none' ? 'opacity-20 pointer-events-none' : ''}`}>
          <div className="w-full flex items-center justify-center gap-1 py-4 md:py-8 px-6 md:px-12 relative overflow-x-auto scrollbar-hide min-w-[300px] max-w-5xl">
            <div className="flex gap-2 min-w-max px-20 pb-4">
              {player.hand.map((card, i) => {
                const isSelected = selectedCardId === card.id;
                return (
                  <div 
                    key={card.id} 
                    onClick={() => onCardClick?.(card.id)}
                    className={`transform ${UI_TRANSITIONS} cursor-pointer`}
                    style={{ 
                      zIndex: isSelected ? 200 : 30 + i,
                      transform: `scale(${isSelected ? 1.15 : 1}) ${isSelected ? 'translateY(-20px)' : ''}`,
                    }}
                  >
                    <GameCard 
                      card={card} 
                      size="md" 
                      isHeld={isSelected}
                      className={`${isSelected ? 'ring-4 ring-[#F59E0B] shadow-[0_0_40px_rgba(245,158,11,0.4)]' : ''}`} 
                      isInteractive={false}
                    />
                  </div>
                );
              })}
            </div>
          </div>
          <div className="absolute bottom-2 text-[8px] font-black uppercase tracking-widest text-white/20">
            {player.hand.length} cards in hand • Click to select
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <div className="flex -space-x-8 md:-space-x-12 justify-center py-4 opacity-40 hover:opacity-60 transition-opacity">
            {Array.from({ length: Math.min(player.hand.length, 6) }).map((_, i) => (
              <GameCard key={i} card={{} as IGameCard} isBack size="sm" isInteractive={false} />
            ))}
          </div>
          <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">{player.hand.length} cards</div>
        </div>
      )}
    </div>
  );
};
