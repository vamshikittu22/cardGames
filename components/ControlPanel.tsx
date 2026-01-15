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
    { label: 'Intro Major', cost: 1, icon: '👑', color: '#7C3AED' },
    { label: 'Capture', cost: 2, icon: '⛓️', color: '#047857', shortcut: 'C' },
  ];

  const handleActionClick = (label: string, cost: number) => {
    setLocalSyncing(true);
    onAction(label === 'Intro Major' ? 'Introduce Major' : label === 'Capture' ? 'Capture Assura' : label, cost);
    setTimeout(() => setLocalSyncing(false), 300);
  };

  return (
    <div className={`bg-black/90 backdrop-blur-2xl border-t border-white/10 px-8 py-4 rounded-t-[40px] shadow-[0_-20px_60px_rgba(0,0,0,0.8)] transition-all pointer-events-auto ${!isActive ? 'opacity-60 saturate-50' : 'opacity-100'}`}>
      <div className="max-w-7xl mx-auto flex items-center gap-8">
        {/* KP Ring */}
        <div className="flex flex-col items-center">
          <div className="relative w-16 h-16 rounded-full bg-black flex items-center justify-center border-2 border-[#F59E0B]/50 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
             <div className="absolute inset-0 rounded-full border border-white/5"></div>
             <span className="text-2xl font-black text-[#F59E0B]">{kp}</span>
             <span className="absolute -bottom-1 bg-[#F59E0B] text-[7px] text-black font-black px-1.5 rounded-full uppercase tracking-tighter">KP</span>
          </div>
        </div>

        {/* Action Grid */}
        <div className="flex-1 flex gap-3 overflow-x-auto scrollbar-hide py-2">
          {actions.map((action) => {
            const canAfford = kp >= action.cost && isActive;
            const isDisabled = !canAfford || (action.label === 'Draw Card' && deckEmpty);
            return (
              <button
                key={action.label}
                onClick={() => !isDisabled && handleActionClick(action.label, action.cost)}
                disabled={isDisabled}
                className={`flex-1 min-w-[90px] h-20 flex flex-col items-center justify-center gap-1 rounded-2xl border transition-all relative group ${isDisabled ? 'border-white/5 opacity-40 bg-white/5 cursor-not-allowed' : 'border-white/10 hover:border-white/30 hover:bg-white/5 active:scale-95 shadow-md'}`}
              >
                {action.shortcut && (
                   <span className="absolute top-1 right-2 text-[6px] font-black text-white/20 border border-white/10 px-1 rounded">[{action.shortcut}]</span>
                )}
                <span className={`text-xl ${isDisabled ? 'filter grayscale opacity-30' : 'group-hover:scale-110 transition-transform'}`}>{action.icon}</span>
                <p className={`text-[8px] font-black uppercase tracking-wider ${isDisabled ? 'text-white/30' : 'text-white/80'}`}>{action.label}</p>
                <p className={`text-[10px] font-bold ${!canAfford && isActive ? 'text-red-500' : isDisabled ? 'text-white/10' : 'text-[#F59E0B]'}`}>{action.cost} KP</p>
              </button>
            );
          })}
        </div>

        {/* End Turn */}
        <div className="pl-6 border-l border-white/10">
          <button
            onClick={onEndTurn}
            disabled={!isActive}
            className={`group h-20 w-28 rounded-2xl flex flex-col items-center justify-center gap-1 shadow-lg transition-all relative ${!isActive ? 'bg-white/5 text-white/20' : 'bg-[#EA580C] hover:bg-[#F97316] active:scale-95'}`}
          >
            <span className="absolute top-1 right-2 text-[6px] font-black text-white/40">[E]</span>
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><polyline points="9 10 4 15 9 20"/><path d="M20 4v7a4 4 0 0 1-4 4H4"/></svg>
            <span className="text-[10px] font-black uppercase tracking-widest text-white">End Cycle</span>
          </button>
        </div>
      </div>
    </div>
  );
};