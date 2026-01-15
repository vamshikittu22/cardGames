
import React from 'react';
import { GameCard as IGameCard, CardType } from '../types';
import { CARD_THEMES, UI_TRANSITIONS } from '../constants';

interface CardProps {
  card: IGameCard;
  isBack?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  isInteractive?: boolean;
  className?: string;
  isHeld?: boolean;
  isTargetable?: boolean;
  onClick?: () => void;
}

export const GameCard: React.FC<CardProps> = ({ 
  card, 
  isBack = false, 
  size = 'md', 
  isInteractive = true,
  className = '',
  isHeld = false,
  isTargetable = false,
  onClick
}) => {
  const theme = isBack ? { bg: '#111827', text: 'white' } : (CARD_THEMES[card?.type] || CARD_THEMES.General);
  
  const dimensions = {
    xs: 'w-12 h-16',
    sm: 'w-24 h-36',
    md: 'w-32 h-48',
    lg: 'w-[200px] h-[280px]'
  };

  const contentPadding = {
    xs: 'p-0.5',
    sm: 'p-1',
    md: 'p-2',
    lg: 'p-4'
  };

  if (isBack || !card) {
    return (
      <div className={`${dimensions[size]} bg-[#111827] rounded-lg border-2 border-white/10 flex items-center justify-center relative overflow-hidden shadow-xl ${className}`}>
        <div className="absolute inset-1 rounded bg-[#1F2937] flex items-center justify-center opacity-80">
          <span className="font-black text-white/10 uppercase tracking-[0.2em] transform -rotate-45 text-[10px] text-center">Tales of Dharma</span>
        </div>
      </div>
    );
  }

  const astraCount = card.attachedAstras?.length || 0;
  const curseCount = card.curses?.length || 0;

  return (
    <div className={`relative group/card ${isHeld ? 'z-50' : ''}`} onClick={onClick}>
      <div className={`
        ${dimensions[size]} ${theme.bg} ${theme.text} 
        rounded-lg border-2 border-white/20 flex flex-col ${contentPadding[size]} shadow-2xl relative
        ${isInteractive ? `hover:z-50 ${UI_TRANSITIONS} cursor-pointer` : ''}
        ${isHeld ? 'card-selected-glow ring-4 ring-[#F59E0B]' : 'hover:-translate-y-2'}
        ${isTargetable ? 'ring-4 ring-yellow-400 animate-pulse-subtle scale-105 cursor-crosshair shadow-[0_0_30px_rgba(250,204,21,0.5)]' : ''}
        ${curseCount > 0 ? 'grayscale-[0.3]' : ''}
        ${className}
      `}>
        {/* Curse Indicator (☠ Count) */}
        {curseCount > 0 && (
          <div className="absolute -top-4 -right-4 px-3 py-1 bg-red-600 text-white rounded-full flex items-center justify-center gap-1 border-2 border-white shadow-[0_0_15px_rgba(220,38,38,0.6)] z-30 animate-in zoom-in">
            <span className="text-xs font-black">☠</span>
            <span className="text-sm font-black">{curseCount}</span>
          </div>
        )}

        {/* Astra Indicator (+ Count) */}
        {astraCount > 0 && (
          <div className="absolute -top-4 -left-4 px-3 py-1 bg-[#F59E0B] text-black rounded-full flex items-center justify-center gap-1 border-2 border-white shadow-[0_0_15px_rgba(245,158,11,0.6)] z-30 animate-in zoom-in">
            <span className="text-xs font-black">+</span>
            <span className="text-sm font-black">{astraCount}</span>
          </div>
        )}

        <div className="absolute top-1 left-1 w-1 h-1 border-t border-l border-white/40"></div>
        <div className="absolute top-1 right-1 w-1 h-1 border-t border-r border-white/40"></div>

        {/* Header */}
        <div className="border-b border-white/20 pb-1 mb-1 flex justify-between items-start">
          <h4 className="text-[10px] font-black uppercase tracking-tight truncate leading-tight pr-2">{card.name}</h4>
          <div className="bg-white/10 rounded-full px-1.5 py-0.5 text-[6px] font-bold uppercase">{card.type}</div>
        </div>

        {/* Illustration Area */}
        <div className="flex-1 bg-black/20 rounded-md flex items-center justify-center relative overflow-hidden border border-white/5 mb-1">
           <svg className={`w-1/2 h-1/2 opacity-20 ${astraCount > 0 ? 'text-yellow-400 opacity-60' : ''}`} viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
           </svg>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-1 overflow-hidden min-h-[40px]">
          {card.type === 'Assura' ? (
            <div className="space-y-0.5">
              <div className="bg-green-900/40 px-1 py-0.5 rounded flex justify-between items-center border border-green-500/20">
                <span className="text-[6px] uppercase font-bold text-green-200">Cap</span>
                <span className="text-[8px] font-black">{card.captureRange?.[0]}-{card.captureRange?.[1]}</span>
              </div>
            </div>
          ) : (
            <p className="text-[8px] leading-tight font-medium opacity-80 text-justify line-clamp-3">
              {card.description}
            </p>
          )}
        </div>

        <div className="mt-auto pt-1 flex justify-between items-center">
          <div className="w-3 h-3 bg-white/10 rounded-full flex items-center justify-center text-[5px] font-black">
            {card.classSymbol || 'D'}
          </div>
          <div className="h-0.5 flex-1 mx-2 bg-white/10 rounded-full"></div>
          <div className="w-1.5 h-1.5 rounded-sm bg-white/20 rotate-45"></div>
        </div>
      </div>
    </div>
  );
};
