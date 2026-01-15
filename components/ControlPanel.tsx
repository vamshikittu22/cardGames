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
    { label: 'Draw', cost: 1, icon: '🎴', color: '#14B8A6', shortcut: 'D' },
    { label: 'Major', cost: 1, icon: '👑', color: '#7C3AED', shortcut: 'M' },
    { label: 'Astra', cost: 1, icon: '⚔️', color: '#F59E0B', shortcut: 'A' },
    { label: 'Curse', cost: 1, icon: '💀', color: '#991B1B', shortcut: 'X' },
    { label: 'Maya', cost: 1, icon: '✨', color: '#2563EB', shortcut: 'Y' },
    { label: 'Capture', cost: 2, icon: '⛓️', color: '#059669', shortcut: 'C' },
  ];

  const handleActionClick = (label: string, cost: number) => {
    setLocalSyncing(true);
    let actionType = label;
    if (label === 'Major') actionType = 'Introduce Major';
    if (label === 'Capture') actionType = 'Capture Assura';
    if (label === 'Draw') actionType = 'Draw Card';
    if (label === 'Astra') actionType = 'Play Astra';
    if (label === 'Curse') actionType = 'Attach Curse';
    if (label === 'Maya') actionType = 'Play Maya';

    onAction(actionType, cost);
    setTimeout(() => setLocalSyncing(false), 300);
  };

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-[100] bg-black/80 backdrop-blur-3xl border-t border-white/5 pb-safe pt-4 transition-all duration-500 ${!isActive ? 'grayscale-[0.5] opacity-80' : 'opacity-100'}`}>
      <div className="max-w-6xl mx-auto px-6 flex items-center gap-6 h-20">
        
        {/* Karma Pool */}
        <div className="flex flex-col items-center justify-center bg-black/40 border border-white/10 rounded-2xl w-24 h-full relative group overflow-hidden">
          <div className="absolute inset-0 bg-dharma-gold/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <span className="text-[9px] font-black uppercase text-dharma-gold/60 tracking-widest leading-none mb-1">Karma</span>
          <span className="text-3xl font-black text-dharma-gold drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]">{kp}</span>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-dharma-gold/20">
            <div className="h-full bg-dharma-gold transition-all duration-1000" style={{ width: `${(kp / 10) * 100}%` }}></div>
          </div>
        </div>

        {/* Action Quick Bar */}
        <div className="flex-1 flex gap-3 h-full items-center overflow-x-auto scrollbar-hide px-2">
          {actions.map((action) => {
            const canAfford = kp >= action.cost && isActive;
            const isDisabled = !canAfford || (action.label === 'Draw' && deckEmpty);
            
            return (
              <button
                key={action.label}
                onClick={() => !isDisabled && handleActionClick(action.label, action.cost)}
                disabled={isDisabled}
                className={`
                  flex-1 min-w-[84px] h-[72px] rounded-xl border flex flex-col items-center justify-center gap-1 transition-all relative
                  ${isDisabled 
                    ? 'bg-white/[0.02] border-white/5 opacity-30 cursor-not-allowed' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 active:scale-95 shadow-lg group'}
                `}
              >
                {action.shortcut && (
                  <span className="absolute top-1.5 right-2 text-[6px] font-bold text-white/20">[{action.shortcut}]</span>
                )}
                <span className={`text-xl transition-transform ${!isDisabled && 'group-hover:scale-125'}`}>{action.icon}</span>
                <div className="flex flex-col items-center">
                  <span className="text-[8px] font-black uppercase tracking-wider text-white/70">{action.label}</span>
                  <span className={`text-[9px] font-bold ${canAfford ? 'text-dharma-gold' : 'text-red-500/70'}`}>-{action.cost}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Global Action: End Turn */}
        <button
          onClick={onEndTurn}
          disabled={!isActive}
          className={`
            w-32 h-full rounded-2xl flex flex-col items-center justify-center gap-1 transition-all shadow-2xl relative
            ${!isActive 
              ? 'bg-white/5 text-white/20 border border-white/5' 
              : 'bg-dharma-crimson text-white hover:bg-red-600 active:scale-95 border border-red-500/30'}
          `}
        >
          <span className="absolute top-1.5 right-2 text-[6px] font-bold opacity-40">[E]</span>
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Next Cycle</span>
        </button>
      </div>
    </div>
  );
};