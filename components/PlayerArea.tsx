
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

      {/* Forces Zone (Sena) */}
      <PlayerSenaZone 
        player={player} 
        isOpponent={isOpponent} 
        targetingMode={targetingMode} 
        onTargetSelect={onTargetSelect || (() => {})} 
      />

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
