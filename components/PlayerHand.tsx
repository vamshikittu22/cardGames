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
    <div className="w-full max-w-7xl mx-auto px-8 relative group/hand pointer-events-auto">
      {/* Scroll Controls */}
      {hand.length > 6 && (
        <>
          <button 
            onClick={(e) => { e.stopPropagation(); scroll('left'); }}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-[110] w-10 h-10 rounded-full bg-black/80 border border-white/10 flex items-center justify-center hover:bg-[#F59E0B] transition-all opacity-0 group-hover/hand:opacity-100 shadow-xl"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); scroll('right'); }}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-[110] w-10 h-10 rounded-full bg-black/80 border border-white/10 flex items-center justify-center hover:bg-[#F59E0B] transition-all opacity-0 group-hover/hand:opacity-100 shadow-xl"
          >
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><path d="M9 5l7 7-7 7" /></svg>
          </button>
        </>
      )}

      <div className="flex justify-center items-end h-[160px]">
        <div 
          ref={scrollRef} 
          className="flex gap-2 items-end px-12 py-4 overflow-x-auto scrollbar-hide max-w-full"
        >
          {hand.map((card, idx) => {
            const isSelected = selectedCardId === card.id;
            // Divine Fanning Logic
            const rotation = (idx - (hand.length - 1) / 2) * 2;
            const yOffset = Math.abs(idx - (hand.length - 1) / 2) * 4;

            return (
              <div 
                key={card.id} 
                onClick={() => onSelectCard(card.id)} 
                className={`flex-shrink-0 relative transition-all duration-300 origin-bottom ${isSelected ? 'z-[60] -translate-y-8 scale-110' : 'hover:-translate-y-6 hover:z-[50]'} cursor-pointer`}
                style={{ 
                  transform: isSelected ? 'translateY(-32px) scale(1.1)' : `rotate(${rotation}deg) translateY(${yOffset}px)`,
                }}
              >
                <GameCard card={card} size="sm" isHeld={isSelected} />
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[7px] font-black text-white/10 uppercase tracking-widest opacity-0 group-hover/hand:opacity-100">[{idx + 1}]</div>
              </div>
            );
          })}
          {hand.length === 0 && (
            <div className="py-8 px-20 text-white/5 uppercase font-black text-[9px] tracking-[0.5em] italic">Manifestations Depleted</div>
          )}
        </div>
      </div>
    </div>
  );
};