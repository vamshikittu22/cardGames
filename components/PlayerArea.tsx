
import React from 'react';
import { Player, GameCard as IGameCard, TargetingMode } from '../types';
import { GameCard } from './GameCard';
import { UI_TRANSITIONS } from '../constants';

interface PlayerAreaProps {
  player: Player;
  isActive: boolean;
  isCurrent: boolean;
  position: 'top' | 'bottom' | 'left' | 'right';
  targetingMode?: TargetingMode;
  onTargetSelect?: (playerId: string, cardId: string) => void;
  selectedAttackerIds?: string[];
  isGameOver?: boolean;
}

const CLASSES = ['Vanas', 'Vahas', 'Dvas', 'Davis', 'Rishies', 'Kurus'];

export const PlayerArea: React.FC<PlayerAreaProps> = ({ 
  player, 
  isActive, 
  isCurrent, 
  position,
  targetingMode = 'none',
  onTargetSelect,
  selectedAttackerIds = [],
  isGameOver = false
}) => {
  const isOpponent = !isCurrent;
  const senaClasses = player.sena.map(c => c.classSymbol).filter(Boolean);
  const uniqueClassesCount = new Set(senaClasses).size;
  const isCloseToClassWin = uniqueClassesCount === 5;
  const isCloseToAssuraWin = player.jail.length === 2;

  return (
    <div className={`
      relative flex flex-col gap-4 p-4 md:p-6 rounded-[32px] ${UI_TRANSITIONS}
      ${isActive && !isGameOver ? 'bg-white/[0.04] ring-2 ring-[#F59E0B]/40 shadow-[0_0_80px_rgba(245,158,11,0.08)]' : 'bg-transparent'}
      ${position === 'top' ? 'flex-col-reverse' : 'flex-col'}
      ${isOpponent ? 'scale-90 md:scale-95' : 'scale-100'}
      ${isActive && !isGameOver ? 'animate-pulse-subtle' : ''}
      ${isGameOver ? 'opacity-60 grayscale-[0.2]' : ''}
      w-full max-w-6xl
    `}>
      {/* Jail Area / Captured Assuras */}
      <div className={`flex flex-col items-center gap-2 py-2 ${position === 'top' ? 'order-last mt-4' : 'order-first mb-4'}`}>
        <div className="flex gap-2 justify-center">
          {player.jail.map(assura => (
            <div key={assura.id} className="group relative">
              <GameCard card={assura} size="xs" className="ring-2 ring-red-500/30" isInteractive={false} />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full border border-white flex items-center justify-center shadow-lg">
                <span className="text-[6px] font-black text-white">⛓</span>
              </div>
            </div>
          ))}
          {Array.from({ length: 3 - player.jail.length }).map((_, i) => (
            <div key={i} className="w-8 h-12 rounded border border-white/5 bg-black/20 flex items-center justify-center opacity-20">
               <span className="text-[6px] font-black uppercase text-white/40">Slot</span>
            </div>
          ))}
        </div>
        <p className={`text-[8px] font-black uppercase tracking-widest ${isCloseToAssuraWin ? 'text-orange-500 animate-pulse font-black scale-110' : 'text-white/20'}`}>
          Assuras: {player.jail.length}/3
        </p>
      </div>

      {/* Class Tracker */}
      <div className={`flex flex-col items-center gap-1 ${position === 'top' ? 'mb-2' : 'mt-0'}`}>
        <div className="flex gap-1 justify-center">
          {CLASSES.map(cls => (
            <div 
              key={cls}
              title={cls}
              className={`w-6 h-6 rounded-sm border flex items-center justify-center text-[10px] font-black transition-all
                ${senaClasses.includes(cls) 
                  ? 'bg-yellow-500 border-yellow-300 text-black shadow-[0_0_12px_rgba(234,88,12,0.6)] scale-110' 
                  : 'bg-white/5 border-white/10 text-white/20'}`}
            >
              {cls[0]}
            </div>
          ))}
        </div>
        <p className={`text-[8px] font-black uppercase tracking-widest ${isCloseToClassWin ? 'text-yellow-500 animate-pulse font-black scale-110' : 'text-white/20'}`}>
          Classes: {uniqueClassesCount}/6
        </p>
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
          </div>
          <div>
            <h3 className="text-sm md:text-lg font-black uppercase tracking-tighter text-white">{player.name}</h3>
            <p className={`text-[8px] md:text-[10px] font-bold uppercase tracking-widest leading-none ${isActive ? 'text-[#F59E0B]' : 'text-white/20'}`}>
              {isGameOver ? 'Fates Revealed' : isActive ? 'Current Turn' : 'Waiting'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-8">
          <div className="text-center">
            <p className="text-[6px] md:text-[8px] font-black uppercase tracking-widest text-white/40 mb-1">Karma</p>
            <p className="text-xl md:text-3xl font-black text-[#F59E0B] leading-none">{player.karmaPoints}</p>
          </div>
        </div>
      </div>

      {/* Sena Area */}
      <div className="space-y-1 md:space-y-2">
        <h5 className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] text-white/20 px-2">Sena Forces</h5>
        <div className="flex gap-4 min-h-[120px] md:min-h-[160px] p-2 md:p-4 bg-black/30 rounded-2xl border border-white/5 relative overflow-x-auto scrollbar-hide">
          {player.sena.map(major => {
            const isSelectedAttacker = selectedAttackerIds.includes(major.id);
            const isTargetable = !isGameOver && (
              (targetingMode === 'astra' && isCurrent) || 
              (targetingMode === 'curse' && isOpponent) ||
              (targetingMode === 'invoke' && isCurrent && !major.invokedThisTurn)
            );

            return (
              <div key={major.id} className="relative group flex-shrink-0">
                <GameCard 
                  card={major} 
                  size="sm" 
                  className={`relative z-10 ${isTargetable ? 'ring-yellow-400 ring-offset-2' : ''} ${major.invokedThisTurn ? 'grayscale opacity-60' : ''} ${isSelectedAttacker ? 'ring-4 ring-red-500' : ''}`} 
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

      {/* Opponent Hand Display */}
      {isOpponent && (
        <div className="flex flex-col items-center mt-4">
          <div className="flex -space-x-8 md:-space-x-12 justify-center py-4 opacity-40">
            {Array.from({ length: Math.min(player.hand.length, 6) }).map((_, i) => (
              <div key={i} className="transform -rotate-6">
                 <GameCard card={{} as IGameCard} isBack size="xs" isInteractive={false} />
              </div>
            ))}
          </div>
          <div className="text-[10px] font-black text-white/20 uppercase tracking-widest">{player.hand.length} cards in hand</div>
        </div>
      )}
    </div>
  );
};
