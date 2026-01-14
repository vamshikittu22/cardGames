
import React from 'react';
import { Player } from '../types';
import { UI_TRANSITIONS } from '../constants';

interface ClashDuelProps {
  actor: Player;
  clasher: Player;
  actorRoll?: number;
  clasherRoll?: number;
  isRolling: boolean;
}

export const ClashDuel: React.FC<ClashDuelProps> = ({ actor, clasher, actorRoll, clasherRoll, isRolling }) => {
  return (
    <div className="fixed inset-0 z-[250] bg-black/90 backdrop-blur-2xl flex items-center justify-center p-12 animate-in zoom-in duration-500">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(220,38,38,0.2)_0%,transparent_70%)] animate-pulse"></div>
      
      <div className="max-w-6xl w-full grid grid-cols-2 gap-24 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
           <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border-8 border-[#111827] shadow-[0_0_60px_rgba(255,255,255,0.2)]">
              <span className="text-4xl font-black text-black tracking-tighter italic">VS</span>
           </div>
        </div>

        {/* Actor Side */}
        <div className="flex flex-col items-center gap-12 animate-in slide-in-from-left duration-700">
           <div className="relative group">
              <div className="absolute -inset-4 bg-blue-500/20 rounded-full blur-2xl animate-pulse"></div>
              <div className="w-48 h-48 rounded-full bg-white flex items-center justify-center border-[12px] border-white/10 overflow-hidden shadow-2xl transition-transform hover:scale-110" style={{ backgroundColor: actor.color }}>
                 <span className="text-7xl font-black text-white">{actor.name[0]}</span>
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white text-black px-6 py-1 rounded-full text-sm font-black uppercase tracking-widest whitespace-nowrap shadow-xl">
                {actor.name} (ACTIVE)
              </div>
           </div>
           
           <div className={`text-9xl font-black text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.2)] ${isRolling ? 'animate-bounce opacity-50' : 'animate-in zoom-in'}`}>
              {actorRoll || '?'}
           </div>
        </div>

        {/* Clasher Side */}
        <div className="flex flex-col items-center gap-12 animate-in slide-in-from-right duration-700">
           <div className="relative group">
              <div className="absolute -inset-4 bg-red-600/20 rounded-full blur-2xl animate-pulse"></div>
              <div className="w-48 h-48 rounded-full bg-white flex items-center justify-center border-[12px] border-white/10 overflow-hidden shadow-2xl transition-transform hover:scale-110" style={{ backgroundColor: clasher.color }}>
                 <span className="text-7xl font-black text-white">{clasher.name[0]}</span>
              </div>
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-1 rounded-full text-sm font-black uppercase tracking-widest whitespace-nowrap shadow-xl">
                {clasher.name} (CHALLENGER)
              </div>
           </div>

           <div className={`text-9xl font-black text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.2)] ${isRolling ? 'animate-bounce opacity-50' : 'animate-in zoom-in'}`}>
              {clasherRoll || '?'}
           </div>
        </div>
      </div>

      <div className="absolute bottom-20 text-center">
         <h2 className="text-3xl font-black uppercase tracking-[0.6em] text-white mb-4">CLASH OF WILLS</h2>
         <p className="text-white/40 text-sm font-bold uppercase tracking-widest">
           {isRolling ? 'Dueling the divine currents...' : (clasherRoll || 0) > (actorRoll || 0) ? 'CHALLENGE SUCCESSFUL' : 'ACTION PROCEEDS'}
         </p>
      </div>
    </div>
  );
};
