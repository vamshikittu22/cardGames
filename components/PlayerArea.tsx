
import React from 'react';
import { Player, TargetingMode } from '../types';
import { UI_TRANSITIONS } from '../constants';
import { PlayerSenaZone } from './PlayerSenaZone';

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

  return (
    <div className={`
      relative flex flex-col gap-8 p-10 rounded-[56px] ${UI_TRANSITIONS}
      ${isActive && !isGameOver ? 'bg-white/[0.04] ring-2 ring-[#F59E0B]/30' : 'bg-black/20'}
      w-full border border-white/5 shadow-2xl backdrop-blur-xl
    `}>
      {/* Identity & Status HUD */}
      <div className="flex items-center justify-between border-b border-white/5 pb-6">
        <div className="flex items-center gap-6">
          <div 
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg border border-white/10" 
            style={{ backgroundColor: player.color }}
          >
            {player.name[0]}
          </div>
          <div className="flex flex-col">
            <h3 className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-3">
              {player.name}
              {isCurrent && <span className="text-[8px] bg-white/10 px-2 py-0.5 rounded-full font-bold tracking-widest text-white/40">YOU</span>}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-500' : 'bg-white/10'}`} />
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-white/30">
                {isActive ? 'Current Manifestation Cycle' : 'Awaiting Flow'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-10">
           <div className="flex flex-col items-end">
              <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20 mb-1">Karma</span>
              <span className="text-3xl font-black text-[#F59E0B] tabular-nums leading-none">{player.karmaPoints}</span>
           </div>
           
           {/* Jail/Captured Assuras Indicator */}
           <div className="flex flex-col items-end border-l border-white/5 pl-10">
              <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20 mb-1">Captures</span>
              <div className="flex gap-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`w-2.5 h-2.5 rounded-sm border border-white/10 ${i < player.jail.length ? 'bg-red-500 shadow-[0_0_8px_rgba(220,38,38,0.4)]' : 'bg-transparent'}`}
                  />
                ))}
              </div>
           </div>
        </div>
      </div>

      {/* Main Army Zone */}
      <PlayerSenaZone 
        player={player} 
        isOpponent={isOpponent} 
        targetingMode={targetingMode} 
        onTargetSelect={onTargetSelect || (() => {})} 
      />

      {/* Sub-context Info */}
      <div className="flex justify-between items-center px-4">
        {isOpponent ? (
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Hand Projection</span>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(player.hand.length, 7) }).map((_, i) => (
                <div key={i} className="w-2.5 h-4 bg-white/5 border border-white/10 rounded-[2px]" />
              ))}
              {player.hand.length > 7 && <span className="text-[8px] text-white/20 font-bold">+{player.hand.length - 7}</span>}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
             <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/20">Army Strength</span>
                <span className="text-[10px] font-bold text-white/60">{player.sena.length}/6 Majors Deployed</span>
             </div>
          </div>
        )}
        
        <div className="flex items-center gap-2">
           <span className="text-[8px] font-black uppercase tracking-widest text-white/10">Sync status: active</span>
        </div>
      </div>
    </div>
  );
};
