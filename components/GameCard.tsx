
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

const CardIllustration: React.FC<{ card: IGameCard; size: string }> = ({ card, size }) => {
  const isLarge = size === 'lg' || size === 'md';
  
  // High-fidelity themed SVG icons for mythological elements
  const getIcon = () => {
    const name = card.name.toLowerCase();
    
    // Specific Hero/General Icons
    if (name.includes('arjuna')) return (
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10zM8 10h8M12 7v6m-2-2l2 2 2-2" stroke="currentColor" fill="none" strokeWidth="1.5"/>
    );
    if (name.includes('krishna') || name.includes('flute')) return (
      <path d="M6 12h12M6 8h12M6 16h12M18 6v12M6 6v12" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round"/>
    );
    if (name.includes('bheema') || name.includes('mace')) return (
      <path d="M12 2v4m0 12v4M2 12h4m12 0h4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83" stroke="currentColor" fill="none" strokeWidth="1.5"/>
    );
    if (name.includes('shakuni') || name.includes('dice')) return (
      <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" fill="none" strokeWidth="1.5"/>
    );

    // Type Based Icons
    switch (card.type) {
      case 'Major':
        return <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" fill="none" strokeWidth="1.5"/>;
      case 'Astra':
        return <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke="currentColor" fill="none" strokeWidth="1.5"/>;
      case 'Curse':
        return <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" stroke="currentColor" fill="none" strokeWidth="1.5"/>;
      case 'Maya':
        return <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" fill="none" strokeWidth="1.5"/>;
      case 'Assura':
        return <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" stroke="currentColor" fill="none" strokeWidth="2"/>;
      case 'General':
        return <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" fill="none" strokeWidth="1.5"/>;
      default:
        return <circle cx="12" cy="12" r="10" stroke="currentColor" fill="none" strokeWidth="1.5"/>;
    }
  };

  const getGradient = () => {
    switch (card.type) {
      case 'Major': return 'from-purple-500/40 via-blue-500/20 to-transparent';
      case 'Astra': return 'from-yellow-400/40 via-orange-500/20 to-transparent';
      case 'Curse': return 'from-red-900/40 via-black/20 to-transparent';
      case 'Maya': return 'from-blue-400/40 via-cyan-500/20 to-transparent';
      case 'Assura': return 'from-red-600/40 via-maroon-900/60 to-black/80';
      case 'General': return 'from-teal-400/40 via-emerald-600/20 to-transparent';
      default: return 'from-gray-500/40 to-transparent';
    }
  };

  return (
    <div className={`flex-1 rounded-md flex items-center justify-center relative overflow-hidden border border-white/5 mb-1 bg-gradient-to-br ${getGradient()}`}>
      {/* Background Decorative Patterns */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      {/* Main Illustration Icon */}
      <svg 
        className={`w-1/2 h-1/2 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] transition-all duration-700 group-hover/card:scale-110`} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor"
        strokeWidth="1.5"
      >
        {getIcon()}
      </svg>

      {/* Atmospheric Particles */}
      <div className="absolute inset-0 pointer-events-none">
         <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-white rounded-full animate-pulse opacity-40"></div>
         <div className="absolute top-3/4 left-2/3 w-1.5 h-1.5 bg-white rounded-full animate-pulse delay-700 opacity-20"></div>
         <div className="absolute top-1/2 left-4/5 w-0.5 h-0.5 bg-white rounded-full animate-pulse delay-300 opacity-60"></div>
      </div>
    </div>
  );
};

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
          <div className="text-center">
            <span className="font-black text-white/10 uppercase tracking-[0.2em] transform -rotate-45 block text-[10px]">Tales of</span>
            <span className="font-black text-white/10 uppercase tracking-[0.2em] transform -rotate-45 block text-[10px]">Dharma</span>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-50"></div>
      </div>
    );
  }

  const astraCount = card.attachedAstras?.length || 0;
  const curseCount = card.curses?.length || 0;

  return (
    <div className={`relative group/card ${isHeld ? 'z-50' : ''}`} onClick={onClick}>
      <div className={`
        ${dimensions[size]} ${theme.bg} ${theme.text} 
        rounded-lg border-2 border-white/20 flex flex-col ${contentPadding[size]} shadow-2xl relative overflow-hidden
        ${isInteractive ? `hover:z-50 ${UI_TRANSITIONS} cursor-pointer` : ''}
        ${isHeld ? 'card-selected-glow ring-4 ring-[#F59E0B]' : 'hover:-translate-y-2'}
        ${isTargetable ? 'ring-4 ring-yellow-400 animate-pulse-subtle scale-105 cursor-crosshair shadow-[0_0_30px_rgba(250,204,21,0.5)]' : ''}
        ${curseCount > 0 ? 'grayscale-[0.3]' : ''}
        ${className}
      `}>
        {/* Subtle Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]"></div>

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

        {/* Corner Accents */}
        <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-white/40"></div>
        <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-white/40"></div>
        <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-white/40"></div>
        <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-white/40"></div>

        {/* Header */}
        <div className="border-b border-white/10 pb-1 mb-1 flex justify-between items-start z-10">
          <h4 className="text-[9px] font-black uppercase tracking-tight truncate leading-tight pr-2">{card.name}</h4>
          <div className="bg-white/10 rounded-full px-1.5 py-0.5 text-[6px] font-bold uppercase whitespace-nowrap">{card.type}</div>
        </div>

        {/* Illustration Area */}
        <CardIllustration card={card} size={size} />

        {/* Content Area */}
        <div className="flex flex-col gap-1 overflow-hidden min-h-[44px] z-10">
          {card.type === 'Assura' ? (
            <div className="space-y-1">
              <div className="bg-green-900/60 px-2 py-0.5 rounded flex justify-between items-center border border-green-400/30">
                <span className="text-[6px] uppercase font-black text-green-200">Capture</span>
                <span className="text-[9px] font-black tracking-widest">{card.captureRange?.[0]}-{card.captureRange?.[1]}</span>
              </div>
              <div className="bg-red-900/40 px-2 py-0.5 rounded flex justify-between items-center border border-red-500/20">
                <span className="text-[6px] uppercase font-black text-red-200">Retaliate</span>
                <span className="text-[9px] font-black tracking-widest">{card.retaliationRange?.[0]}-{card.retaliationRange?.[1]}</span>
              </div>
            </div>
          ) : (
            <div className="relative">
              <p className="text-[7px] leading-[1.3] font-bold opacity-90 text-justify line-clamp-3">
                {card.description}
              </p>
              {card.type === 'Major' && (
                <div className="mt-1 flex gap-1 items-center">
                   <span className="text-[6px] font-black bg-white/20 px-1 rounded uppercase tracking-tighter">Class: {card.classSymbol}</span>
                   <span className="text-[6px] font-black text-blue-300">Power: {card.powerRange?.[0]}-{card.powerRange?.[1]}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto pt-1 flex justify-between items-center z-10">
          <div className="w-3.5 h-3.5 bg-white/10 rounded-full flex items-center justify-center text-[5px] font-black border border-white/5">
            {card.classSymbol?.charAt(0) || 'D'}
          </div>
          <div className="h-[1px] flex-1 mx-2 bg-gradient-to-r from-white/20 via-white/5 to-white/20"></div>
          <div className="w-1.5 h-1.5 rounded-sm bg-white/10 rotate-45 border border-white/5"></div>
        </div>
      </div>
    </div>
  );
};
