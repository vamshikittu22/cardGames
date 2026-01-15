import React from 'react';
import { GameCard as IGameCard } from '../types';
import { CARD_THEMES } from '../constants';

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

const CardIllustration: React.FC<{ card: IGameCard; size: string }> = ({ card }) => {
  const getIcon = () => {
    const name = card.name.toLowerCase();
    
    // Named hero icons
    if (name.includes('arjuna')) {
      return (
        <g strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
          <path d="M12 3L4 21h16L12 3z" />
          <path d="M12 8v10M9 13h6" />
        </g>
      );
    }
    if (name.includes('krishna')) {
      return (
        <g strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v10M7 12h10" />
          <path d="M15 9l-6 6M9 9l6 6" />
        </g>
      );
    }
    
    // Type-based icons
    switch (card.type) {
      case 'Major':
        return (
          <g strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
          </g>
        );
      case 'Astra':
        return (
          <g strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </g>
        );
      case 'Curse':
        return (
          <g strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
            <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2z" />
            <path d="M9 10l6 4M15 10l-6 4" />
          </g>
        );
      case 'Maya':
        return (
          <g strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
            <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path d="M12 8v4l3 3" />
          </g>
        );
      case 'Assura':
        return (
          <g strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
            <path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z" />
            <path d="M8 10h8" />
          </g>
        );
      case 'General':
        return (
          <g strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </g>
        );
      default:
        return <circle cx="12" cy="12" r="10" strokeWidth="1.5" />;
    }
  };

  const getGradient = () => {
    switch (card.type) {
      case 'Major': return 'from-purple-600/30 to-blue-900/40';
      case 'Astra': return 'from-yellow-500/30 to-orange-700/40';
      case 'Curse': return 'from-red-900/50 to-black/80';
      case 'Maya': return 'from-blue-500/30 to-indigo-900/40';
      case 'Assura': return 'from-red-600/40 to-black/90';
      case 'General': return 'from-teal-400/30 to-emerald-900/40';
      default: return 'from-slate-700 to-slate-900';
    }
  };

  return (
    <div className={`flex-1 rounded-xl flex items-center justify-center relative overflow-hidden border border-white/5 mb-2 bg-gradient-to-br ${getGradient()}`}>
      <svg 
        className="w-1/2 h-1/2 text-white/80 drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor"
      >
        {getIcon()}
      </svg>
    </div>
  );
};

export const GameCard: React.FC<CardProps> = ({ 
  card, isBack = false, size = 'md', isInteractive = true, className = '', isHeld = false, isTargetable = false, onClick
}) => {
  const theme = isBack ? { bg: 'bg-[#1e293b]', text: 'text-white' } : (CARD_THEMES[card?.type] || CARD_THEMES.General);
  
  const dims = {
    xs: 'w-12 h-18',
    sm: 'w-24 h-36',
    md: 'w-32 h-48',
    lg: 'w-48 h-72'
  };

  if (isBack || !card) {
    return (
      <div className={`${dims[size]} rounded-xl border-2 border-white/10 bg-[#0F172A] relative flex items-center justify-center overflow-hidden shadow-2xl ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
        <div className="w-1/2 h-1/2 border-2 border-white/5 rounded-full flex items-center justify-center">
          <span className="text-[6px] font-black uppercase tracking-widest text-white/10 rotate-[-45deg]">Dharma</span>
        </div>
      </div>
    );
  }

  const astraCount = card.attachedAstras?.length || 0;
  const curseCount = card.curses?.length || 0;

  return (
    <div className={`relative ${isHeld ? 'z-[100]' : ''}`} onClick={onClick}>
      <div 
        className={`
          ${dims[size]} rounded-2xl border-2 flex flex-col p-2.5 shadow-2xl transition-all duration-300 relative overflow-hidden cursor-pointer
          ${isHeld ? 'card-selected-glow' : 'hover:-translate-y-4'}
          ${isTargetable ? 'ring-4 ring-dharma-gold animate-pulse scale-105' : 'border-white/10'}
          ${className}
        `}
        style={{ backgroundColor: theme.bg.startsWith('#') ? theme.bg : undefined }}
      >
        <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>

        <div className="absolute top-2 right-2 flex flex-col gap-1 z-20">
          {curseCount > 0 && (
            <div className="bg-red-600 text-white px-1.5 py-0.5 rounded-full text-[7px] font-black border border-white/20 shadow-lg">☠ {curseCount}</div>
          )}
          {astraCount > 0 && (
            <div className="bg-dharma-gold text-black px-1.5 py-0.5 rounded-full text-[7px] font-black border border-white/20 shadow-lg">⚔ {astraCount}</div>
          )}
        </div>

        <div className="flex justify-between items-start mb-1.5 z-10">
          <span className="text-[8px] font-black uppercase tracking-tighter truncate max-w-[70%] text-white leading-none">{card.name}</span>
          <span className="text-[6px] font-bold bg-white/10 px-1 rounded uppercase tracking-widest text-white/50">{card.type[0]}</span>
        </div>

        <CardIllustration card={card} size={size} />

        <div className="flex flex-col gap-1 z-10">
          {card.type === 'Assura' ? (
            <div className="grid grid-cols-2 gap-1">
              <div className="bg-black/40 rounded p-1 text-center border border-green-500/20">
                <span className="block text-[5px] text-white/40 uppercase font-black">Cap</span>
                <span className="text-[9px] font-black text-green-400">{card.captureRange?.[0]}+</span>
              </div>
              <div className="bg-black/40 rounded p-1 text-center border border-red-500/20">
                <span className="block text-[5px] text-white/40 uppercase font-black">Ret</span>
                <span className="text-[9px] font-black text-red-500">{card.retaliationRange?.[0]}+</span>
              </div>
            </div>
          ) : (
            <>
              <p className="text-[6.5px] font-medium leading-tight text-white/80 line-clamp-3 italic opacity-90 mb-1">{card.description}</p>
              {card.type === 'Major' && (
                <div className="flex justify-between items-center bg-black/20 px-1.5 py-0.5 rounded border border-white/5">
                  <span className="text-[6px] font-black text-white/40">{card.classSymbol}</span>
                  <span className="text-[7px] font-black text-dharma-gold">{card.powerRange?.[0]}-{card.powerRange?.[1]}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};