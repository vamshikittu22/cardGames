
import React, { useState, useEffect } from 'react';
import { UI_TRANSITIONS } from '../constants';

interface Action {
  label: string;
  cost: number;
  icon: string;
  color: string;
  oncePerTurn?: boolean;
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
  actionsUsed,
  deckEmpty = false
}) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [kpAnimation, setKpAnimation] = useState(false);

  useEffect(() => {
    setKpAnimation(true);
    const timer = setTimeout(() => setKpAnimation(false), 500);
    return () => clearTimeout(timer);
  }, [kp]);

  const actions: Action[] = [
    { label: 'Draw Card', cost: 1, icon: '🎴', color: '#0F766E' },
    { label: 'Play Maya', cost: 1, icon: '✨', color: '#2563EB' },
    { label: 'Play Astra', cost: 1, icon: '⚔️', color: '#D97706' },
    { label: 'Attach Curse', cost: 1, icon: '💀', color: '#7F1D1D' },
    { label: 'Introduce Major', cost: 1, icon: '👑', color: '#7C3AED', oncePerTurn: true },
    { label: 'Invoke Power', cost: 1, icon: '🔥', color: '#F59E0B', oncePerTurn: true },
    { label: 'Capture Assura', cost: 2, icon: '⛓️', color: '#047857' },
  ];

  const handleEndTurnClick = () => {
    if (kp > 0) {
      setShowConfirm(true);
    } else {
      onEndTurn();
    }
  };

  if (!isActive) {
    return (
      <div className="bg-black/60 backdrop-blur-3xl border-t border-white/5 px-12 py-8 rounded-t-[40px] flex items-center justify-center opacity-40 grayscale pointer-events-none">
        <p className="text-sm font-black uppercase tracking-[0.4em] text-white/40">Waiting for other players to act...</p>
      </div>
    );
  }

  return (
    <div className="bg-black/80 backdrop-blur-3xl border-t border-white/10 px-6 md:px-12 py-6 rounded-t-[40px] shadow-[0_-20px_60px_rgba(0,0,0,0.8)] animate-in slide-in-from-bottom duration-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-6">
        
        {/* Karma Counter */}
        <div className="flex-shrink-0 flex flex-col items-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#F59E0B]/60 mb-2">Karma Balance</p>
          <div className={`
            relative w-20 h-20 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] 
            flex items-center justify-center border-4 border-black/20 shadow-[0_0_20px_rgba(245,158,11,0.3)]
            ${kpAnimation ? 'scale-110 ring-4 ring-[#F59E0B]/50' : ''} ${UI_TRANSITIONS}
          `}>
             <span className="text-3xl font-black text-black">{kp}</span>
             {kp === 0 && (
               <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-black text-red-500 uppercase animate-pulse">
                 No KP Remaining
               </div>
             )}
          </div>
        </div>

        <div className="h-16 w-px bg-white/10 hidden md:block mx-4"></div>

        {/* Action Grid */}
        <div className="flex-1 flex gap-3 overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
          {actions.map((action) => {
            const canAfford = kp >= action.cost;
            const alreadyUsed = action.oncePerTurn && actionsUsed.includes(action.label);
            const isDeckActionDisabled = action.label === 'Draw Card' && deckEmpty;
            const isDisabled = !canAfford || alreadyUsed || isDeckActionDisabled;

            return (
              <button
                key={action.label}
                onClick={() => !isDisabled && onAction(action.label, action.cost)}
                disabled={isDisabled}
                className={`
                  relative flex-1 min-w-[110px] h-24 flex flex-col items-center justify-center gap-1 rounded-2xl border-2 ${UI_TRANSITIONS}
                  ${isDisabled 
                    ? 'border-white/5 bg-white/5 opacity-40 cursor-not-allowed' 
                    : 'border-white/10 hover:border-white/40 hover:-translate-y-1 hover:shadow-2xl'
                  }
                `}
                style={{ 
                  backgroundColor: !isDisabled ? `${action.color}22` : undefined,
                  borderColor: !isDisabled ? `${action.color}44` : undefined
                }}
                title={!canAfford ? `Needs ${action.cost} KP` : alreadyUsed ? 'Already used' : isDeckActionDisabled ? 'No cards remaining' : ''}
              >
                <span className="text-2xl">{alreadyUsed ? '✅' : action.icon}</span>
                <div className="text-center">
                  <p className="text-[8px] font-black uppercase tracking-widest text-white leading-tight">
                    {alreadyUsed ? 'Invoked' : action.label}
                  </p>
                  <p className={`text-[10px] font-bold ${!canAfford ? 'text-red-400' : 'text-white/60'}`}>
                    {isDeckActionDisabled ? 'Empty' : `${action.cost} KP`}
                  </p>
                </div>
                {!isDisabled && (
                   <div className="absolute inset-0 rounded-2xl ring-2 ring-white/5 ring-inset"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* End Turn Area */}
        <div className="flex-shrink-0 flex items-center pl-4 border-l border-white/10">
          {showConfirm ? (
            <div className="flex flex-col gap-2 items-center bg-white/5 p-3 rounded-2xl border border-white/10 animate-in fade-in zoom-in">
              <p className="text-[8px] font-black uppercase text-white/60">Confirm End Turn?</p>
              <div className="flex gap-2">
                <button 
                  onClick={() => { onEndTurn(); setShowConfirm(false); }}
                  className="px-4 py-2 bg-green-600 text-white text-[10px] font-black uppercase rounded-lg"
                >Yes</button>
                <button 
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 bg-white/10 text-white text-[10px] font-black uppercase rounded-lg"
                >No</button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleEndTurnClick}
              className={`
                group h-24 w-32 rounded-2xl bg-gradient-to-br from-[#EA580C] to-[#C2410C]
                flex flex-col items-center justify-center gap-1 shadow-xl hover:shadow-[#EA580C]/20 hover:scale-105 active:scale-95 ${UI_TRANSITIONS}
              `}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-white group-hover:rotate-12 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 10 4 15 9 20"/><path d="M20 4v7a4 4 0 0 1-4 4H4"/></svg>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">End Turn</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
