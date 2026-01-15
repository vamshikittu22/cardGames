
import React from 'react';
import { Player, TargetingMode } from '../types';
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
      relative flex flex-col gap-6 p-6 md:p-8 rounded-[48px] ${UI_TRANSITIONS}
      ${isActive && !isGameOver ? 'bg-white/[0.08] ring-4 ring-[#F59E0B]/50 shadow-[0_0_120px_rgba(245,158,11,0.15)]' : 'bg-black/20'}
      ${position === 'top' ? 'flex-col-reverse' : 'flex-col'}
      ${isOpponent ? 'scale-100' : 'scale-100'}
      w-full max-w-7xl mx-auto border-2 border-white/5
    `}>
      {/* Jail Area / Captured Assuras */}
      <div className={`flex flex-col items-center gap-3 ${position === 'top' ? 'order-last mt-6' : 'order-first mb-6'}`}>
        <div className="flex gap-4 justify-center">
          {player.jail.map(assura => (
            <div key={assura.id} className="group relative transform hover:scale-110 transition-transform">
              <GameCard card={assura} size="xs" className="ring-2 ring-red-500/50" isInteractive={false} />
              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-600 rounded-full border-2 border-white flex items-center justify-center shadow-lg">
                <span className="text-[10px] font-black text-white">⛓</span>
              </div>
            </div>
          ))}
          {Array.from({ length: 3 - player.jail.length }).map((_, i) => (
            <div key={i} className="w-12 h-16 rounded-xl border-2 border-dashed border-white/10 bg-black/40 flex items-center justify-center opacity-20">
               <span className="text-[8px] font-black uppercase text-white/40">Open</span>
            </div>
          ))}
        </div>
        <p className={`text-[10px] font-black uppercase tracking-[0.4em] ${isCloseToAssuraWin ? 'text-orange-500 animate-pulse' : 'text-white/30'}`}>
          Assura Jail: {player.jail.length}/3
        </p>
      </div>

      {/* Identity Bar */}
      <div className={`
        flex items-center justify-between px-10 py-6 bg-black/80 rounded-[40px] border-2
        ${isActive ? 'border-[#F59E0B] shadow-[0_0_40px_rgba(245,158,11,0.2)]' : 'border-white/10'}
      `}>
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-3xl font-black uppercase shadow-2xl border-4 border-white/20`} style={{ backgroundColor: player.color }}>
              {player.name[0]}
            </div>
            {isActive && <div className="absolute -inset-2 bg-white/10 rounded-full animate-ping pointer-events-none"></div>}
          </div>
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tighter text-white">{player.name} {isCurrent && '(Thou)'}</h3>
            <p className={`text-[10px] font-black uppercase tracking-[0.3em] leading-none mt-1 ${isActive ? 'text-[#F59E0B] animate-pulse' : 'text-white/30'}`}>
              {isGameOver ? 'Dharma Restored' : isActive ? 'MANIFESTING CYCLE' : 'AWAITING DHARMA'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-12">
          {/* Class Mastery Dashboard */}
          <div className="flex gap-2.5">
            {CLASSES.map(cls => (
              <div 
                key={cls}
                title={cls}
                className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center text-[11px] font-black transition-all
                  ${senaClasses.includes(cls) 
                    ? 'bg-yellow-500 border-white/40 text-black shadow-lg scale-110' 
                    : 'bg-white/5 border-white/5 text-white/10'}`}
              >
                {cls[0]}
              </div>
            ))}
          </div>

          <div className="text-center min-w-[70px] border-l border-white/10 pl-12">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40 mb-1">Karma</p>
            <p className="text-4xl font-black text-[#F59E0B] leading-none drop-shadow-xl">{player.karmaPoints}</p>
          </div>
        </div>
      </div>

      {/* Sena Forces (Warrior Army) Zone */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
             <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-pulse"></span>
             <h5 className="text-[11px] font-black uppercase tracking-[0.6em] text-white/40">Sena forces</h5>
          </div>
          {isCloseToClassWin && <span className="text-[9px] font-black text-yellow-500 animate-pulse uppercase tracking-[0.3em]">6-Class Mastery Imminent</span>}
        </div>
        
        <div className={`
          flex gap-8 min-h-[240px] p-8 bg-black/60 rounded-[50px] border-4 relative overflow-x-auto scrollbar-hide shadow-2xl transition-all
          ${isActive ? 'border-[#F59E0B]/20' : 'border-white/5'}
        `}>
          {player.sena.map(major => {
            const isTargetable = !isGameOver && (
              (targetingMode === 'astra' && isCurrent) || 
              (targetingMode === 'curse' && isOpponent)
            );

            return (
              <div key={major.id} className="relative group flex-shrink-0 animate-in zoom-in slide-in-from-bottom-4 duration-500">
                <GameCard 
                  card={major} 
                  size="sm" 
                  className={`
                    relative z-10 transition-all 
                    ${isTargetable ? 'ring-4 ring-yellow-400 scale-110 shadow-[0_0_30px_rgba(250,204,21,0.4)] cursor-crosshair' : ''} 
                    ${major.invokedThisTurn ? 'grayscale opacity-50' : ''}
                  `} 
                  isInteractive={isTargetable}
                  isTargetable={isTargetable}
                  onClick={() => isTargetable && onTargetSelect?.(player.id, major.id)}
                />
                {major.invokedThisTurn && (
                  <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                    <span className="bg-black/60 px-2 py-1 rounded text-[8px] font-black uppercase text-white/80 border border-white/20">Invoked</span>
                  </div>
                )}
              </div>
            );
          })}
          {player.sena.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center opacity-10 gap-5 border-2 border-dashed border-white/5 rounded-[40px]">
              <div className="w-20 h-20 rounded-full border-2 border-white/20 flex items-center justify-center">
                 <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4"/></svg>
              </div>
              <span className="text-[14px] font-black uppercase tracking-[0.6em] italic text-white/40">Army Awaiting Manifestation</span>
            </div>
          )}
        </div>
      </div>

      {/* Opponent Strategic Information */}
      {isOpponent && (
        <div className="flex flex-col items-center">
          <div className="flex -space-x-12 justify-center py-6 opacity-30">
            {Array.from({ length: Math.min(player.hand.length, 5) }).map((_, i) => (
              <div key={i} className="transform -rotate-6 transition-transform hover:-translate-y-6 hover:rotate-0">
                 <GameCard card={{} as any} isBack size="xs" isInteractive={false} />
              </div>
            ))}
          </div>
          <div className="text-[11px] font-black text-white/20 uppercase tracking-[0.5em]">{player.hand.length} Divine Cards Manifested</div>
        </div>
      )}
    </div>
  );
};
