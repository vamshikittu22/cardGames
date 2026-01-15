
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
    <div className="w-full max-w-7xl mx-auto px-12 relative group/hand pointer-events-auto">
      {/* Scroll Controls - High Z-index and active */}
      {hand.length > 5 && (
        <>
          <button 
            onClick={(e) => { e.stopPropagation(); scroll('left'); }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-[100] w-12 h-12 rounded-full bg-black/80 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-[#F59E0B] transition-all opacity-0 group-hover/hand:opacity-100 shadow-xl"
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); scroll('right'); }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-[100] w-12 h-12 rounded-full bg-black/80 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-[#F59E0B] transition-all opacity-0 group-hover/hand:opacity-100 shadow-xl"
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M9 5l7 7-7 7" /></svg>
          </button>
        </>
      )}

      <div className="flex justify-center items-end min-h-[220px] pb-4">
        <div 
          ref={scrollRef} 
          className="flex gap-6 items-end px-16 py-8 bg-black/80 backdrop-blur-3xl rounded-t-[60px] border-x-2 border-t-2 border-white/10 overflow-x-auto scrollbar-hide shadow-[0_-30px_100px_rgba(0,0,0,1)] max-w-full"
        >
          {hand.map((card, idx) => (
            <div 
              key={card.id} 
              onClick={() => onSelectCard(card.id)} 
              className="flex-shrink-0 relative transition-transform hover:scale-105"
            >
              <GameCard card={card} size="md" isHeld={selectedCardId === card.id} />
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[8px] font-black text-white/20 uppercase tracking-widest">[{idx + 1}]</div>
            </div>
          ))}
          {hand.length === 0 && (
            <div className="py-20 px-40 text-white/10 uppercase font-black text-xs tracking-[0.5em] italic">Manifestations Depleted</div>
          )}
        </div>
      </div>
    </div>
  );
};
