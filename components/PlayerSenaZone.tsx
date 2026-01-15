
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

      {/* Battlefield - Standardized scrollable area */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-8 pt-24 px-4 min-h-[220px] bg-black/40 border-y border-white/10"
      >
        {player.sena.length > 0 ? (
          player.sena.map((card) => {
            const canBeTargeted = (targetingMode === 'astra' && !isOpponent) ||
              (targetingMode === 'curse' && isOpponent) ||
              (targetingMode === 'maya');

            return (
              <div key={card.id} className="flex-shrink-0 relative group">
                {/* Stacked Attachments Behind */}
                <div className="relative">
                  {/* Background stack of attached cards */}
                  {card.attachedAstras.map((astra, i) => (
                    <div
                      key={`astra-bg-${i}`}
                      className="absolute w-full h-full bg-gradient-to-br from-yellow-400/30 to-orange-500/30 rounded-lg border border-yellow-400/50"
                      style={{
                        top: `${(i + 1) * 3}px`,
                        left: `${(i + 1) * 3}px`,
                        zIndex: -(i + 1),
                      }}
                    />
                  ))}
                  {card.curses.map((curse, i) => (
                    <div
                      key={`curse-bg-${i}`}
                      className="absolute w-full h-full bg-gradient-to-br from-red-600/30 to-red-800/30 rounded-lg border border-red-500/50"
                      style={{
                        top: `${(card.attachedAstras.length + i + 1) * 3}px`,
                        left: `${(card.attachedAstras.length + i + 1) * 3}px`,
                        zIndex: -(card.attachedAstras.length + i + 1),
                      }}
                    />
                  ))}
                  {card.mayas.map((maya, i) => (
                    <div
                      key={`maya-bg-${i}`}
                      className="absolute w-full h-full bg-gradient-to-br from-blue-400/30 to-blue-600/30 rounded-lg border border-blue-400/50"
                      style={{
                        top: `${(card.attachedAstras.length + card.curses.length + i + 1) * 3}px`,
                        left: `${(card.attachedAstras.length + card.curses.length + i + 1) * 3}px`,
                        zIndex: -(card.attachedAstras.length + card.curses.length + i + 1),
                      }}
                    />
                  ))}

                  {/* Main Card */}
                  <div className="relative z-10">
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

                    {/* Attachment Count Badges - Bottom of card */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-30">
                      {card.attachedAstras.length > 0 && (
                        <div className="bg-yellow-500 border-2 border-yellow-300 rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                          <span className="text-[10px] font-black text-black">⚔{card.attachedAstras.length}</span>
                        </div>
                      )}
                      {card.curses.length > 0 && (
                        <div className="bg-red-600 border-2 border-red-400 rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                          <span className="text-[10px] font-black text-white">☠{card.curses.length}</span>
                        </div>
                      )}
                      {card.mayas.length > 0 && (
                        <div className="bg-blue-600 border-2 border-blue-400 rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                          <span className="text-[10px] font-black text-white">❉{card.mayas.length}</span>
                        </div>
                      )}
                    </div>

                    {/* Power Stats */}
                    <div className="mt-2 flex justify-center">
                      <div className="bg-black/60 border border-white/20 px-2 py-0.5 rounded text-[7px] font-black text-dharma-gold">
                        {card.powerRange?.[0]}-{card.powerRange?.[1]}
                      </div>
                    </div>

                    {/* Hover Tooltip - Callout Bubble Above */}
                    {(card.attachedAstras.length > 0 || card.curses.length > 0 || card.mayas.length > 0) && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-6 opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 transform group-hover:-translate-y-2 z-50 w-56">
                        <div className="bg-black/95 backdrop-blur-md border-2 border-white/20 rounded-xl p-3 shadow-[0_0_30px_rgba(0,0,0,0.8)] relative">
                          {/* Callout Tail */}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 w-4 h-4 bg-black/95 border-r-2 border-b-2 border-white/20 rotate-45 -mt-2"></div>

                          <div className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-3 text-center border-b border-white/10 pb-2">Manifestation Status</div>

                          {card.attachedAstras.length > 0 && (
                            <div className="mb-3">
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className="bg-yellow-500/20 text-yellow-400 text-[10px] font-black px-1.5 py-0.5 rounded border border-yellow-500/30">⚔ ASTRAS</span>
                                <span className="text-yellow-500/50 text-[10px] font-black">{card.attachedAstras.length}</span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {card.attachedAstras.map((astra, i) => (
                                  <div key={`tooltip-astra-${i}`} className="text-[9px] text-yellow-200/90 bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/20 font-medium">{astra.name}</div>
                                ))}
                              </div>
                            </div>
                          )}
                          {card.curses.length > 0 && (
                            <div className="mb-3">
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className="bg-red-500/20 text-red-400 text-[10px] font-black px-1.5 py-0.5 rounded border border-red-500/30">☠ CURSES</span>
                                <span className="text-red-500/50 text-[10px] font-black">{card.curses.length}</span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {card.curses.map((curse, i) => (
                                  <div key={`tooltip-curse-${i}`} className="text-[9px] text-red-200/90 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20 font-medium">{curse.name}</div>
                                ))}
                              </div>
                            </div>
                          )}
                          {card.mayas.length > 0 && (
                            <div>
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className="bg-blue-500/20 text-blue-400 text-[10px] font-black px-1.5 py-0.5 rounded border border-blue-500/30">❉ MAYAS</span>
                                <span className="text-blue-500/50 text-[10px] font-black">{card.mayas.length}</span>
                              </div>
                              <div className="flex flex-wrap gap-1">
                                {card.mayas.map((maya, i) => (
                                  <div key={`tooltip-maya-${i}`} className="text-[9px] text-blue-200/90 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20 font-medium">{maya.name}</div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
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
