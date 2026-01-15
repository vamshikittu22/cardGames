
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
      const amount = dir === 'left' ? -240 : 240;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full group/sena">
      {/* Sena Header with Tactical Info */}
      <div className="flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30">Army Status</h5>
          <div className="flex gap-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full border border-white/10 ${i < player.sena.length ? 'bg-[#F59E0B]' : 'bg-transparent'}`}
              />
            ))}
          </div>
        </div>

        {player.sena.length > 3 && (
          <div className="flex gap-2">
            <button
              onClick={() => scrollSena('left')}
              className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 text-white/40 transition-all active:scale-90"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button
              onClick={() => scrollSena('right')}
              className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 text-white/40 transition-all active:scale-90"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        )}
      </div>

      {/* Army Battlefield Area */}
      <div
        ref={scrollRef}
        className="flex gap-6 p-8 bg-[#0F172A]/40 backdrop-blur-md rounded-[32px] border-2 border-white/5 min-h-[360px] overflow-x-auto scrollbar-hide shadow-inner relative transition-all group-hover/sena:border-white/10"
      >
        {player.sena.length > 0 ? (
          player.sena.map((card) => {
            const isAstraTarget = targetingMode === 'astra' && !isOpponent;
            const isCurseTarget = targetingMode === 'curse' && isOpponent;
            const isMayaTarget = targetingMode === 'maya';
            const canBeTargeted = isAstraTarget || isCurseTarget || isMayaTarget;

            return (
              <div key={card.id} className="flex-shrink-0 relative group/unit">
                {/* Tactical HUD Overlay for each unit */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 z-30 opacity-80">
                  <span className="bg-black/80 border border-white/20 px-2 py-0.5 rounded text-[8px] font-black text-[#F59E0B] shadow-lg">
                    {card.classSymbol}
                  </span>
                </div>

                {/* The Warrior Card */}
                <GameCard
                  card={card}
                  size="sm"
                  isInteractive={canBeTargeted}
                  isTargetable={canBeTargeted}
                  onClick={() => canBeTargeted && onTargetSelect(player.id, card.id)}
                  className={`${canBeTargeted ? 'ring-2 ring-yellow-400' : ''}`}
                />

                {/* Stats Bar */}
                <div className="mt-3 flex flex-col gap-1.5 px-1">
                  <div className="flex justify-between items-center text-[7px] font-black text-white/40 uppercase tracking-widest">
                    <span>Power</span>
                    <span className="text-white/80">{card.powerRange?.[0]}-{card.powerRange?.[1]}</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500/40 rounded-full" style={{ width: '70%' }}></div>
                  </div>
                </div>

                {/* Attachments Section */}
                <div className="absolute -right-2 top-0 bottom-0 flex flex-col justify-center gap-1.5 z-20">
                  {card.attachedAstras.map((astra, i) => (
                    <div
                      key={`astra-${i}`}
                      className="w-3 h-3 rounded-full bg-yellow-500 border border-white/40 shadow-[0_0_10px_rgba(245,158,11,0.6)] animate-pulse"
                      title={`Astra: ${astra.name}`}
                    />
                  ))}
                  {card.curses.map((curse, i) => (
                    <div
                      key={`curse-${i}`}
                      className="w-3 h-3 rounded-full bg-red-600 border border-white/40 shadow-[0_0_10px_rgba(220,38,38,0.6)]"
                      title={`Curse: ${curse.name}`}
                    />
                  ))}
                </div>

                {/* Targeting Overlay */}
                {canBeTargeted && (
                  <div className="absolute inset-0 bg-yellow-400/10 rounded-lg animate-pulse pointer-events-none ring-1 ring-inset ring-yellow-400/50"></div>
                )}
              </div>
            );
          })
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center opacity-10 gap-4">
            <div className="w-16 h-16 border-2 border-dashed border-white/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-center max-w-[120px]">Deploy Warriors to establish Sena</p>
          </div>
        )}
      </div>
    </div>
  );
};
