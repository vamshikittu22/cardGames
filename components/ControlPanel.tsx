
import React, { useState } from 'react';

interface Action {
  label: string;
  cost: number;
  icon: string;
  color: string;
  shortcut?: string;
}

interface ControlPanelProps {
  kp: number;
  onAction: (actionLabel: string, cost: number) => void;
  onEndTurn: () => void;
  isActive: boolean;
  actionsUsed: string[];
  deckEmpty?: boolean;
}

export const ControlPanel: React.FC<ControlPanelProps> = ({ 
  kp, 
  onAction, 
  onEndTurn, 
  isActive,
  deckEmpty = false,
}) => {
  const [localSyncing, setLocalSyncing] = useState(false);

  const actions: Action[] = [
    { label: 'Draw Card', cost: 1, icon: '🎴', color: '#0F766E', shortcut: 'D' },
    { label: 'Play Maya', cost: 1, icon: '✨', color: '#2563EB' },
    { label: 'Play Astra', cost: 1, icon: '⚔️', color: '#D97706' },
    { label: 'Attach Curse', cost: 1, icon: '💀', color: '#7F1D1D' },
    { label: 'Introduce Major', cost: 1, icon: '👑', color: '#7C3AED' },
    { label: 'Capture Assura', cost: 2, icon: '⛓️', color: '#047857', shortcut: 'C' },
  ];

  const handleActionClick = (label: string, cost: number) => {
    setLocalSyncing(true);
    onAction(label, cost);
    setTimeout(() => setLocalSyncing(false), 300);
  };

  return (
    <div className={`bg-black/95 backdrop-blur-3xl border-t-2 border-white/10 px-10 py-8 rounded-t-[60px] shadow-[0_-40px_120px_rgba(0,0,0,1)] transition-all pointer-events-auto ${!isActive ? 'opacity-70' : 'opacity-100'}`}>
      <div className="max-w-7xl mx-auto flex items-center gap-12">
        <div className="flex flex-col items-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#F59E0B] mb-2">Thy Karma</p>
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#EA580C] flex items-center justify-center border-4 border-black/50 shadow-2xl transition-transform hover:scale-110">
             <span className="text-4xl font-black text-black">{kp}</span>
          </div>
        </div>

        <div className="flex-1 flex gap-4 overflow-x-auto scrollbar-hide py-3">
          {actions.map((action) => {
            const canAfford = kp >= action.cost && isActive;
            const isDisabled = !canAfford || (action.label === 'Draw Card' && deckEmpty);
            return (
              <button
                key={action.label}
                onClick={() => !isDisabled && handleActionClick(action.label, action.cost)}
                disabled={isDisabled}
                className={`flex-1 min-w-[110px] h-28 flex flex-col items-center justify-center gap-2 rounded-[32px] border-2 transition-all relative ${isDisabled ? 'border-white/5 opacity-50 cursor-not-allowed bg-white/5' : 'border-white/10 hover:border-white/50 hover:-translate-y-3 active:scale-95 shadow-lg hover:shadow-2xl'}`}
                style={{ backgroundColor: !isDisabled ? `${action.color}55` : '#111827' }}
              >
                {action.shortcut && (
                   <span className="absolute top-2 right-4 text-[7px] font-black text-white/40 border border-white/10 px-1 rounded">[{action.shortcut}]</span>
                )}
                <span className={`text-3xl ${isDisabled ? 'filter grayscale opacity-30' : ''}`}>{action.icon}</span>
                <p className={`text-[9px] font-black uppercase tracking-widest ${isDisabled ? 'text-white/40' : 'text-white'}`}>{action.label}</p>
                <p className={`text-[12px] font-bold ${!canAfford && isActive ? 'text-red-500' : isDisabled ? 'text-white/20' : 'text-white/80'}`}>{action.cost} KP</p>
              </button>
            );
          })}
        </div>

        <div className="flex items-center pl-10 border-l-2 border-white/10">
          <button
            onClick={onEndTurn}
            disabled={!isActive}
            className={`group h-28 w-44 rounded-[40px] flex flex-col items-center justify-center gap-2 shadow-2xl transition-all relative ${!isActive ? 'bg-white/5 opacity-20' : 'bg-[#EA580C] hover:bg-[#F97316] hover:scale-105 active:scale-95'}`}
          >
            <span className="absolute top-2 right-4 text-[7px] font-black text-white/40">[E]</span>
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}><polyline points="9 10 4 15 9 20"/><path d="M20 4v7a4 4 0 0 1-4 4H4"/></svg>
            <span className="text-xs font-black uppercase tracking-[0.3em] text-white">End Turn</span>
          </button>
        </div>
      </div>
    </div>
  );
};
