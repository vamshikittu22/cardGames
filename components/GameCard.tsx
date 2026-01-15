
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
      <div className={`${dimensions[size]} bg-[#111827] rounded-lg border-2 border-white/10 flex items-center justify-center relative overflow-hidden group shadow-xl ${className}`}>
        <div 
          className="absolute inset-1 rounded flex items-center justify-center opacity-80"
          style={{ backgroundColor: theme.bg }}
        >
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <span className="font-black text-white/20 uppercase tracking-[0.2em] transform -rotate-45 text-[10px] text-center">
            Tales of Dharma
          </span>
        </div>
      </div>
    );
  }

  const hasCurse = card.curses && card.curses.length > 0;
  const astraCount = card.attachedAstras?.length || 0;

  return (
    <div className={`relative group/card ${isHeld ? 'z-50' : ''}`} onClick={onClick}>
      {/* Astra Stacking Offset Visuals */}
      {card.attachedAstras?.slice(0, 3).map((_, i) => (
        <div 
          key={i}
          className={`absolute inset-0 rounded-lg border border-white/10 -z-[10] ${dimensions[size]}`}
          style={{ 
            backgroundColor: CARD_THEMES.Astra.bg,
            transform: `translate(${(i + 1) * 4}px, ${(i + 1) * 4}px)` 
          }}
        />
      ))}

      <div className={`
        ${dimensions[size]} ${theme.bg} ${theme.text} 
        rounded-lg border-2 border-white/20 flex flex-col ${contentPadding[size]} shadow-2xl relative
        ${isInteractive ? `hover:z-50 ${UI_TRANSITIONS} cursor-pointer` : ''}
        ${isHeld ? 'card-selected-glow ring-4 ring-[#F59E0B]' : 'hover:-translate-y-2'}
        ${isTargetable ? 'ring-4 ring-yellow-400 animate-pulse-subtle scale-105 cursor-crosshair shadow-[0_0_30px_rgba(250,204,21,0.5)]' : ''}
        ${hasCurse ? 'grayscale-[0.5] sepia-[0.3]' : ''}
        ${className}
      `}>
        {/* Selection Glow for Active Card */}
        {isHeld && (
          <div className="absolute -inset-1 bg-yellow-500/30 rounded-lg blur-md -z-10 animate-pulse"></div>
        )}

        {/* Curse Badge */}
        {hasCurse && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 rounded-full flex items-center justify-center border-2 border-white shadow-lg z-20 animate-bounce">
            <span className="text-[10px] font-black">☠</span>
          </div>
        )}

        {/* Astra Indicator */}
        {astraCount > 0 && (
          <div className="absolute -bottom-2 -left-2 px-2 py-0.5 bg-yellow-500 rounded-full border border-white/20 shadow-md z-20">
             <span className="text-[8px] font-black text-black">+{astraCount} ASTRA</span>
          </div>
        )}

        {/* Decorative Corners (Swiss Minimalist) */}
        <div className="absolute top-1 left-1 w-1 h-1 border-t border-l border-white/40"></div>
        <div className="absolute top-1 right-1 w-1 h-1 border-t border-r border-white/40"></div>
        <div className="absolute bottom-1 left-1 w-1 h-1 border-b border-l border-white/40"></div>
        <div className="absolute bottom-1 right-1 w-1 h-1 border-b border-r border-white/40"></div>

        {/* Header */}
        <div className="border-b border-white/20 pb-1 mb-1 flex justify-between items-start">
          <h4 className="text-[10px] font-black uppercase tracking-tight truncate leading-tight">{card.name}</h4>
          <div className="bg-white/10 rounded-full px-1 py-0.5 text-[6px] font-bold uppercase">{card.type}</div>
        </div>

        {/* Illustration Area */}
        <div className="flex-1 bg-black/20 rounded-md flex items-center justify-center relative overflow-hidden border border-white/5 mb-1">
           <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
           <div className="w-full h-full flex items-center justify-center">
              <svg className={`w-1/2 h-1/2 opacity-20 ${astraCount > 0 ? 'text-yellow-400 opacity-50' : ''}`} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
              </svg>
           </div>
        </div>

        {/* Card Content */}
        <div className="flex flex-col gap-1 overflow-hidden">
          {card.type === 'Assura' ? (
            <div className="space-y-0.5">
              <div className="bg-black/40 px-1 py-0.5 rounded flex justify-between items-center">
                <span className="text-[6px] uppercase font-bold text-white/50">Req</span>
                <span className="text-[7px] font-black">{card.requirement || 'None'}</span>
              </div>
              <div className="grid grid-cols-1 gap-0.5">
                <div className="bg-green-900/40 px-1 py-0.5 rounded flex justify-between items-center border border-green-500/20">
                  <span className="text-[6px] uppercase font-bold text-green-200">Cap</span>
                  <span className="text-[8px] font-black">{card.captureRange?.[0]}-{card.captureRange?.[1]}</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-[8px] leading-tight font-medium opacity-80 text-justify line-clamp-3">
              {card.description}
            </p>
          )}
        </div>

        {/* Class Symbol / Footer */}
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
