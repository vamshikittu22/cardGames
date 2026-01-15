import React, { useRef } from 'react';
import { GameCard as IGameCard } from '../types';
import { GameCard } from './GameCard';

interface PlayerHandProps {
  hand: IGameCard[];
  selectedCardId: string | null;
  onSelectCard: (id: string) => void;
  isGameOver: boolean;
}

export const PlayerHand: React.FC<PlayerHandProps> = ({ hand, selectedCardId, onSelectCard, isGameOver }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    if (scrollRef.current) {
      const amount = dir === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full h-full flex items-center justify-center relative group/hand pointer-events-auto overflow-visible">
      {/* Scroll Controls */}
      {hand.length > 6 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); scroll('left'); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-[110] w-10 h-10 rounded-full bg-black/80 border border-white/10 flex items-center justify-center hover:bg-[#F59E0B] transition-all opacity-0 group-hover/hand:opacity-100 shadow-xl"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); scroll('right'); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-[110] w-10 h-10 rounded-full bg-black/80 border border-white/10 flex items-center justify-center hover:bg-[#F59E0B] transition-all opacity-0 group-hover/hand:opacity-100 shadow-xl"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path d="M9 5l7 7-7 7" /></svg>
          </button>
        </>
      )}

      <div
        ref={scrollRef}
        className="flex gap-4 items-center justify-center px-12 py-4 overflow-x-auto scrollbar-hide w-full"
      >
        {hand.map((card, idx) => {
          const isSelected = selectedCardId === card.id;
          // Very minimal fanning
          const rotation = (idx - (hand.length - 1) / 2) * 0.5;

          return (
            <div
              key={card.id}
              onClick={() => onSelectCard(card.id)}
              className={`flex-shrink-0 relative transition-all duration-300 ${isSelected ? 'z-[60] scale-[1.15]' : 'hover:scale-105 hover:z-[50]'} cursor-pointer`}
              style={{
                transform: isSelected ? 'scale(1.15) rotate(0deg)' : `rotate(${rotation}deg)`,
              }}
            >
              <GameCard card={card} size="sm" isHeld={isSelected} />
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-[9px] font-black text-white/30 uppercase tracking-widest opacity-0 group-hover/hand:opacity-100">[{idx + 1}]</div>
            </div>
          );
        })}
        {hand.length === 0 && (
          <div className="py-8 px-20 text-white/5 uppercase font-black text-[9px] tracking-[0.5em] italic">Manifestations Depleted</div>
        )}
      </div>
    </div>
  );
};
