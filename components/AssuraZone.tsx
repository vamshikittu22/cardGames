
import React from 'react';
import { GameCard as IGameCard, TargetingMode } from '../types';
import { GameCard } from './GameCard';

interface AssuraZoneProps {
  assuras: IGameCard[];
  targetingMode?: TargetingMode;
  onAssuraSelect?: (id: string) => void;
  selectedAssuraId?: string | null;
}

export const AssuraZone: React.FC<AssuraZoneProps> = ({ assuras, targetingMode, onAssuraSelect, selectedAssuraId }) => {
  const isTargeting = targetingMode === 'capture-assura';

  return (
    <div className={`flex flex-col items-center gap-6 ${isTargeting ? 'z-[120]' : ''}`}>
      <div className="flex flex-col items-center">
        <h3 className="text-sm font-black uppercase tracking-[0.5em] text-white/20 mb-2">Assuras</h3>
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
      </div>
      
      <div className="flex gap-10 items-center justify-center p-12 bg-black/10 rounded-[60px] border border-white/5 backdrop-blur-sm relative overflow-visible">
        {/* Slot Backdrops */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="absolute w-[200px] h-[280px] border-2 border-white/5 rounded-lg -z-10" style={{ left: `${48 + i * 240}px`, opacity: 0.1 }}></div>
        ))}

        {assuras.slice(0, 3).map((assura) => {
          const isSelected = selectedAssuraId === assura.id;
          return (
            <div 
              key={assura.id} 
              className={`relative group transition-all duration-300 ${isTargeting ? 'cursor-crosshair scale-105 hover:scale-110' : ''} ${isSelected ? 'ring-4 ring-[#F59E0B] rounded-lg' : ''}`}
              onClick={() => isTargeting && onAssuraSelect?.(assura.id)}
            >
              <div className={`absolute -inset-4 bg-red-900/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition duration-500 ${isTargeting ? 'opacity-50 animate-pulse' : ''}`}></div>
              <GameCard 
                card={assura} 
                size="lg" 
                className={`shadow-[0_0_30px_rgba(127,29,29,0.3)] border-red-500/30 ${isTargeting ? 'ring-2 ring-yellow-400' : ''}`} 
                isInteractive={isTargeting}
                isTargetable={isTargeting}
              />
            </div>
          );
        })}

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
