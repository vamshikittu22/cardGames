import React from 'react';

interface PileProps {
  label: string;
  count: number;
  type: 'draw' | 'submerge';
  isEmpty?: boolean;
}

export const DeckPile: React.FC<PileProps> = ({ label, count, type, isEmpty }) => {
  const isLow = type === 'draw' && count < 10 && count > 0;
  
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">{label}</div>
      <div className={`
        relative w-24 h-32 rounded-lg border-2 flex items-center justify-center transition-all duration-500
        ${isEmpty ? 'border-dashed border-white/5 bg-transparent' : 'border-white/10 bg-[#111827] shadow-2xl'}
        ${isLow ? 'border-orange-500/50' : ''}
      `}>
        {/* Card Stacking Effect */}
        {!isEmpty && count > 1 && (
          <div className="absolute inset-0 translate-x-1 translate-y-1 bg-white/5 border border-white/10 rounded-lg -z-10"></div>
        )}
        {!isEmpty && count > 5 && (
          <div className="absolute inset-0 translate-x-2 translate-y-2 bg-white/5 border border-white/10 rounded-lg -z-20"></div>
        )}

        <div className={`
          text-2xl font-black transition-colors
          ${isEmpty ? 'text-white/5' : isLow ? 'text-orange-500' : 'text-white/20'}
        `}>
          {count}
        </div>

        {/* Texture */}
        {!isEmpty && (
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none"></div>
        )}
      </div>
    </div>
  );
};
