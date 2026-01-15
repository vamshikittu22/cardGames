
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
    <div className="flex flex-col gap-2 w-full">
      {/* Army Header */}
      <div className="flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <h5 className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">Army</h5>
          <div className="flex gap-1">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`w-1 h-1 rounded-full ${i < player.sena.length ? 'bg-[#F59E0B]' : 'bg-white/10'}`}
              />
            ))}
          </div>
          <span className="text-[8px] font-bold text-white/30">{player.sena.length}/6</span>
        </div>

        {player.sena.length > 4 && (
          <div className="flex gap-1">
            <button
              onClick={() => scrollSena('left')}
              className="w-5 h-5 rounded bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 text-white/40 transition-all"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M15 19l-7-7 7-7" /></svg>
            </button>
            <button
              onClick={() => scrollSena('right')}
              className="w-5 h-5 rounded bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 text-white/40 transition-all"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        )}
      </div>

      {/* Battlefield - Like a real card game board */}
      <div
        ref={scrollRef}
        className="flex gap-3 p-3 bg-gradient-to-b from-[#1a2332] to-[#0d1117] rounded-xl border border-white/20 min-h-[180px] max-h-[260px] overflow-y-auto scrollbar-hide relative"
        style={{
          backgroundImage: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 1px, transparent 1px, transparent 40px)',
        }}
      >
        {/* Grid pattern like a game board */}
        <div className="absolute inset-0 pointer-events-none opacity-5">
          <div className="w-full h-full" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        {player.sena.length > 0 ? (
          player.sena.map((card) => {
            const isAstraTarget = targetingMode === 'astra' && !isOpponent;
            const isCurseTarget = targetingMode === 'curse' && isOpponent;
            const isMayaTarget = targetingMode === 'maya';
            const canBeTargeted = isAstraTarget || isCurseTarget || isMayaTarget;

            return (
              <div key={card.id} className="flex-shrink-0 relative group/unit">
                {/* Class Badge */}
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 z-30">
                  <span className="bg-black/90 border border-white/30 px-2 py-0.5 rounded text-[7px] font-black text-[#F59E0B] shadow-lg">
                    {card.classSymbol}
                  </span>
                </div>

                {/* The Card */}
                <GameCard
                  card={card}
                  size="sm"
                  isInteractive={canBeTargeted}
                  isTargetable={canBeTargeted}
                  onClick={() => canBeTargeted && onTargetSelect(player.id, card.id)}
                  className={`${canBeTargeted ? 'ring-2 ring-yellow-400' : ''}`}
                />

                {/* Power Stats */}
                <div className="mt-2 flex justify-center">
                  <div className="bg-black/60 border border-white/20 px-2 py-0.5 rounded text-[7px] font-black text-dharma-gold">
                    {card.powerRange?.[0]}-{card.powerRange?.[1]}
                  </div>
                </div>

                {/* Attachments */}
                <div className="absolute -right-1 top-0 flex flex-col gap-1 z-20">
                  {card.attachedAstras.map((astra, i) => (
                    <div
                      key={`astra-${i}`}
                      className="w-3 h-3 rounded-full bg-yellow-500 border border-white/40 shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                      title={`Astra: ${astra.name}`}
                    />
                  ))}
                  {card.curses.map((curse, i) => (
                    <div
                      key={`curse-${i}`}
                      className="w-3 h-3 rounded-full bg-red-600 border border-white/40 shadow-[0_0_8px_rgba(220,38,38,0.6)]"
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
          <div className="flex-1 flex flex-col items-center justify-center opacity-20">
            <div className="w-12 h-12 border-2 border-dashed border-white/30 rounded-lg flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            </div>
            <p className="text-[9px] font-black uppercase tracking-[0.4em] text-white/30 text-center">Deploy Warriors</p>
          </div>
        )}
      </div>
    </div>
  );
};
