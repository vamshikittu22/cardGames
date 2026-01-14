
import React from 'react';
import { LogEntry } from '../types';

interface GameLogProps {
  logs: LogEntry[];
  isOpen: boolean;
  onClose: () => void;
}

export const GameLog: React.FC<GameLogProps> = ({ logs, isOpen, onClose }) => {
  return (
    <div className={`
      fixed top-0 right-0 h-full w-80 bg-[#111827] border-l border-white/10 z-[100] shadow-2xl transform transition-transform duration-500
      ${isOpen ? 'translate-x-0' : 'translate-x-full'}
    `}>
      <div className="p-6 h-full flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-sm font-black uppercase tracking-[0.3em] text-white">Chronicles</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-hide">
          {logs.slice().reverse().map((log) => (
            <div key={log.id} className="bg-white/5 border border-white/5 p-4 rounded-xl flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[8px] font-black uppercase tracking-widest text-[#F59E0B]">Turn {log.turn}</span>
                <span className="text-[8px] text-white/20">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <p className="text-xs text-white/80 leading-snug">
                <span className="font-black text-white">{log.playerName}</span> {log.action}
              </p>
              {log.kpSpent > 0 && (
                <div className="flex items-center gap-1 text-[8px] font-bold text-red-400">
                  <div className="w-1 h-1 rounded-full bg-red-400"></div>
                  -{log.kpSpent} Karma Point
                </div>
              )}
            </div>
          ))}
          {logs.length === 0 && (
             <div className="flex flex-col items-center justify-center h-full opacity-20 gap-4 text-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                <p className="text-[10px] font-black uppercase tracking-widest">No chronicles recorded yet</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};
