
import React from 'react';
import { Player } from '../types';
import { UI_TRANSITIONS } from '../constants';

interface PlayerCardProps {
  player: Player;
  isSelf: boolean;
  onToggleReady?: () => void;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({ player, isSelf, onToggleReady }) => {
  return (
    <div className={`
      relative p-6 bg-white rounded-xl border-2 flex flex-col items-center gap-4 ${UI_TRANSITIONS}
      ${isSelf ? 'border-[#0F766E] ring-4 ring-[#0F766E]/5' : 'border-transparent shadow-sm'}
    `}>
      {/* Avatar Placeholder */}
      <div 
        className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-black uppercase shadow-inner"
        style={{ backgroundColor: player.color }}
      >
        {player.name.charAt(0)}
      </div>

      {/* Player Info */}
      <div className="text-center">
        <p className="font-bold text-lg text-gray-800 truncate max-w-[150px]">{player.name}</p>
        <p className="text-[10px] uppercase tracking-widest font-bold text-gray-400">
          {player.isCreator ? 'Room Host' : 'Player'}
        </p>
      </div>

      {/* Ready Indicator */}
      <div className="flex items-center gap-2">
        {player.isReady ? (
          <div className="flex items-center gap-1.5 text-green-600 font-bold text-xs uppercase tracking-tighter">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Ready
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-gray-400 font-bold text-xs uppercase tracking-tighter">
             <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
             Waiting
          </div>
        )}
      </div>

      {/* Toggle Action */}
      {isSelf && (
        <button 
          onClick={onToggleReady}
          className={`
            w-full mt-2 py-2 rounded-lg text-xs font-black uppercase tracking-widest border-2 ${UI_TRANSITIONS}
            ${player.isReady 
              ? 'border-green-100 bg-green-50 text-green-700 hover:bg-green-100' 
              : 'border-gray-100 bg-gray-50 text-gray-600 hover:bg-gray-100'
            }
          `}
        >
          {player.isReady ? 'Unready' : 'Set Ready'}
        </button>
      )}
    </div>
  );
};
