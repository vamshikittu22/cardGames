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
    <div className={`flex flex-col items-center gap-4 ${isTargeting ? 'z-[120]' : ''}`}>
      <div className="flex flex-col items-center">
        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20 mb-1">Central Assura Realm</h3>
        <div className="h-px w-16 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
      </div>
      
      <div className="flex gap-6 items-center justify-center p-6 relative overflow-visible">
        {assuras.slice(0, 3).map((assura) => {
          const isSelected = selectedAssuraId === assura.id;
          return (
            <div 
              key={assura.id} 
              className={`relative group transition-all duration-500 ${isTargeting ? 'cursor-crosshair hover:scale-105' : ''}`}
              onClick={() => isTargeting && onAssuraSelect?.(assura.id)}
            >
              {/* Divine Glow for Targetables */}
              <div className={`absolute -inset-2 bg-red-600/10 rounded-2xl blur-xl transition duration-500 ${isTargeting ? 'opacity-100 animate-pulse' : 'opacity-0'}`}></div>
              
              <GameCard 
                card={assura} 
                size="md" 
                className={`shadow-2xl border-white/5 ${isTargeting ? 'ring-2 ring-yellow-400/50' : ''} ${isSelected ? 'ring-4 ring-[#F59E0B]' : ''}`} 
                isInteractive={isTargeting}
                isTargetable={isTargeting}
              />
            </div>
          );
        })}

        {Array.from({ length: Math.max(0, 3 - assuras.length) }).map((_, i) => (
          <div key={`empty-${i}`} className="w-32 h-48 rounded-xl border border-dashed border-white/5 flex items-center justify-center bg-white/[0.02]">
            <div className="text-center opacity-5">
              <p className="text-[8px] font-black uppercase tracking-widest">Awaiting Chaos</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};