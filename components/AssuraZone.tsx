
import React from 'react';
import { GameCard as IGameCard } from '../types';
import { GameCard } from './GameCard';

interface AssuraZoneProps {
  assuras: IGameCard[];
}

export const AssuraZone: React.FC<AssuraZoneProps> = ({ assuras }) => {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex flex-col items-center">
        <h3 className="text-sm font-black uppercase tracking-[0.5em] text-white/20 mb-2">Assuras</h3>
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      </div>
      
      <div className="flex gap-10 items-center justify-center p-12 bg-black/10 rounded-[60px] border border-white/5 backdrop-blur-sm relative overflow-hidden">
        {/* Slot Backdrops */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="absolute w-[200px] h-[280px] border-2 border-white/5 rounded-lg -z-10" style={{ left: `${48 + i * 240}px`, opacity: 0.1 }}></div>
        ))}

        {assuras.slice(0, 3).map((assura) => (
          <div key={assura.id} className="relative group">
            <div className="absolute -inset-4 bg-red-900/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition duration-500"></div>
            <GameCard card={assura} size="lg" className="shadow-[0_0_30px_rgba(127,29,29,0.3)] border-red-500/30" />
          </div>
        ))}

        {Array.from({ length: Math.max(0, 3 - assuras.length) }).map((_, i) => (
          <div key={`empty-${i}`} className="w-[200px] h-[280px] rounded-lg border-2 border-dashed border-white/5 flex items-center justify-center">
            <div className="text-center opacity-10">
              <p className="text-[10px] font-black uppercase tracking-widest">Empty Slot</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
