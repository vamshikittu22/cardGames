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
    const name = (card.name || '').toLowerCase();

    // Type-based icons with distinct SVG paths
    switch (card.type) {
      case 'Major':
        return (
          <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.5 17.5L3 6V3h3l11.5 11.5" />
            <path d="M13 19l6-6" />
            <path d="M16 16l3 3" />
            <path d="M19 13l3 3" />
          </g>
        );
      case 'Astra':
        return (
          <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </g>
        );
      case 'Curse':
        return (
          <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 10c0-1.657 1.343-3 3-3s3 1.343 3 3c0 3-3 3-3 6" />
            <circle cx="12" cy="19" r="1" fill="currentColor" />
            <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
          </g>
        );
      case 'Maya':
        return (
          <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
            <path d="M12 5v2m0 10v2M5 12H3m18 0h-2" />
          </g>
        );
      case 'Assura':
        return (
          <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 4l3 12 7-10 7 10 3-12" />
            <path d="M2 20h20" />
            <path d="M7 20v-2a5 5 0 0 1 10 0v2" />
          </g>
        );
      case 'Shakny':
        return (
          <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="4" width="16" height="16" rx="2" />
            <circle cx="8" cy="8" r="1" fill="currentColor" />
            <circle cx="16" cy="16" r="1" fill="currentColor" />
            <circle cx="12" cy="12" r="1" fill="currentColor" />
          </g>
        );
      case 'Clash':
        return (
          <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7 7l10 10M7 17L17 7" />
            <path d="M12 2v2M12 20v2M2 12h2m16 0h2" />
          </g>
        );
      case 'General':
        return (
          <g fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41m11.32-11.32l1.41-1.41" />
          </g>
        );
      default:
        return <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" fill="none" />;
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
      case 'Shakny': return 'from-orange-500/30 to-red-800/40';
      case 'Clash': return 'from-red-500/30 to-red-900/40';
      default: return 'from-slate-700 to-slate-900';
    }
  };

  return (
    <div className={`flex-1 rounded-xl flex items-center justify-center relative overflow-hidden border border-white/5 mb-2 bg-gradient-to-br ${getGradient()}`}>
      <svg
        className="w-1/2 h-1/2 text-white/80 drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]"
        viewBox="0 0 24 24"
      >
        {getIcon()}
      </svg>
    </div>
  );
};

export const GameCard: React.FC<CardProps> = ({
  card, isBack = false, size = 'md', isInteractive = true, className = '', isHeld = false, isTargetable = false, onClick
}) => {
  const theme = isBack ? { bg: '#1e293b', text: 'white' } : (CARD_THEMES[card?.type] || CARD_THEMES.General);

  const dims = {
    xs: 'w-16 h-24',
    sm: 'w-32 h-48',
    md: 'w-40 h-60',
    lg: 'w-56 h-84'
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
          ${dims[size]} rounded-2xl border-2 flex flex-col p-3 shadow-2xl transition-all duration-300 relative overflow-hidden cursor-pointer
          ${isHeld ? 'card-selected-glow' : 'hover:-translate-y-2'}
          ${isTargetable ? 'ring-4 ring-dharma-gold animate-pulse scale-105' : 'border-white/10'}
          ${className}
        `}
        style={{ backgroundColor: theme.bg }}
      >
        <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>

        <div className="absolute top-2 right-2 flex flex-col gap-1 z-20">
          {curseCount > 0 && (
            <div className="bg-red-600 text-white px-2 py-1 rounded-full text-[9px] font-black border border-white/20 shadow-lg">☠ {curseCount}</div>
          )}
          {astraCount > 0 && (
            <div className="bg-dharma-gold text-black px-2 py-1 rounded-full text-[9px] font-black border border-white/20 shadow-lg">⚔ {astraCount}</div>
          )}
        </div>

        <div className="flex justify-between items-start mb-2 z-10">
          <span className="text-[11px] font-black uppercase tracking-tight truncate max-w-[70%] text-white leading-none">{card.name}</span>
          <span className="text-[8px] font-bold bg-white/10 px-1.5 py-0.5 rounded uppercase tracking-widest text-white/50">{card.type[0]}</span>
        </div>

        <CardIllustration card={card} size={size} />

        <div className="flex flex-col gap-1.5 z-10">
          {card.type === 'Assura' ? (
            <div className="grid grid-cols-2 gap-1.5">
              <div className="bg-black/40 rounded p-1.5 text-center border border-green-500/20">
                <span className="block text-[7px] text-white/40 uppercase font-black">Cap</span>
                <span className="text-[11px] font-black text-green-400">{card.captureRange?.[0]}+</span>
              </div>
              <div className="bg-black/40 rounded p-1.5 text-center border border-red-500/20">
                <span className="block text-[7px] text-white/40 uppercase font-black">Ret</span>
                <span className="text-[11px] font-black text-red-500">{card.retaliationRange?.[0]}+</span>
              </div>
            </div>
          ) : (
            <>
              <p className="text-[8px] font-medium leading-snug text-white/90 line-clamp-3 italic opacity-95 mb-1">{card.description}</p>
              {(card.type === 'Major' || card.type === 'General') && (
                <div className="flex justify-between items-center bg-black/20 px-2 py-1 rounded border border-white/5">
                  <span className="text-[8px] font-black text-white/50">{card.classSymbol}</span>
                  <span className="text-[9px] font-black text-dharma-gold">{card.powerRange?.[0] || '?'}-{card.powerRange?.[1] || '?'}</span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
