
import React, { useState, useEffect } from 'react';
import { UI_TRANSITIONS } from '../constants';

interface InterruptWindowProps {
  type: 'clash' | 'shakny';
  endTime: number;
  onAction: () => void;
  isActor: boolean;
}

export const InterruptWindow: React.FC<InterruptWindowProps> = ({ type, endTime, onAction, isActor }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = Math.max(0, endTime - Date.now());
      setTimeLeft(remaining);
      if (remaining <= 0) clearInterval(timer);
    }, 50);
    return () => clearInterval(timer);
  }, [endTime]);

  const progress = (timeLeft / 3000) * 100;
  const isClash = type === 'clash';

  return (
    <div className={`fixed inset-x-0 top-0 z-[150] h-20 bg-black/80 backdrop-blur-xl border-b flex items-center justify-between px-12 animate-in slide-in-from-top duration-300 ${isClash ? 'border-red-500/50' : 'border-orange-500/50'}`}>
      <div className="flex items-center gap-6">
        <div className="relative w-12 h-12 flex items-center justify-center">
           <svg className="absolute inset-0 w-full h-full -rotate-90">
             <circle cx="24" cy="24" r="20" className="fill-none stroke-white/5" strokeWidth="4" />
             <circle 
               cx="24" cy="24" r="20" 
               className={`fill-none ${isClash ? 'stroke-red-500' : 'stroke-orange-500'} transition-all duration-75`}
               strokeWidth="4"
               strokeDasharray="125.6"
               strokeDashoffset={125.6 - (125.6 * progress / 100)}
             />
           </svg>
           <span className="text-xl font-black text-white">{(timeLeft / 1000).toFixed(1)}</span>
        </div>
        
        <div>
           <h3 className={`text-sm font-black uppercase tracking-widest ${isClash ? 'text-red-500' : 'text-orange-500'}`}>
             {isClash ? 'CLASH WINDOW OPEN' : 'SHAKNY WINDOW OPEN'}
           </h3>
           <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
             {isClash ? 'Opponents may challenge this divine action' : 'All players may modify the roll of fate'}
           </p>
        </div>
      </div>

      {!isActor && (
        <button 
          onClick={onAction}
          className={`px-8 py-3 rounded-lg font-black uppercase tracking-widest animate-pulse hover:scale-105 active:scale-95 ${UI_TRANSITIONS} ${isClash ? 'bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.5)]' : 'bg-orange-600 text-white shadow-[0_0_20px_rgba(234,88,12,0.5)]'}`}
        >
          {isClash ? 'PLAY CLASH' : 'PLAY SHAKNY'}
        </button>
      )}

      {isActor && (
        <div className="px-8 py-3 bg-white/5 rounded-lg text-white/40 text-[10px] font-black uppercase tracking-widest border border-white/10">
           Awaiting player reactions...
        </div>
      )}
    </div>
  );
};
