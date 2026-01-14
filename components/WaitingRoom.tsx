
import React, { useState } from 'react';
import { Room, Player } from '../types';
import { PlayerCard } from './PlayerCard';
import { Chat } from './Chat';
import { Button } from './Button';
import { UI_TRANSITIONS } from '../constants';

interface WaitingRoomProps {
  room: Room;
  currentPlayerId: string;
  onToggleReady: () => void;
  onSendMessage: (text: string) => void;
  onStartGame: () => void;
  onLeaveRoom: () => void;
}

export const WaitingRoom: React.FC<WaitingRoomProps> = ({ 
  room, 
  currentPlayerId, 
  onToggleReady, 
  onSendMessage, 
  onStartGame,
  onLeaveRoom
}) => {
  const [copied, setCopied] = useState(false);
  const readyCount = room.players.filter(p => p.isReady).length;
  const totalCount = room.players.length;
  const isAllReady = readyCount === totalCount && totalCount >= 2;
  const isCreator = room.players.find(p => p.id === currentPlayerId)?.isCreator;
  const currentPlayer = room.players.find(p => p.id === currentPlayerId);

  const handleCopy = () => {
    navigator.clipboard.writeText(room.roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col p-4 md:p-12 gap-8 max-w-7xl mx-auto">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b-4 border-gray-100 pb-8">
        <div>
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-[#1F2937]">
            {room.roomName}
          </h2>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Room Status:</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></div>
              <span className="text-xs font-black uppercase text-[#EA580C]">Gathering Spirits</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-xl border-2 border-gray-100 flex flex-col items-center gap-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Access Key</p>
          <div className="flex items-center gap-4">
            <span className="text-4xl font-black font-mono tracking-widest text-[#0F766E]">{room.roomCode}</span>
            <button 
              onClick={handleCopy}
              className={`p-3 rounded-lg ${copied ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'} transition-all hover:scale-110 shadow-sm`}
            >
              {copied ? (
                <div className="flex items-center gap-2 text-xs font-bold">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Synced
                </div>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1">
        {/* Players Grid */}
        <div className="lg:col-span-3 space-y-8">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black uppercase tracking-tight text-gray-800">
              Soul Gathering <span className="ml-2 text-gray-300">({totalCount}/{room.maxPlayers})</span>
            </h3>
            <div className="flex items-center gap-4">
               <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Harmony</p>
                  <p className="font-bold text-sm">{readyCount} of {totalCount} Aligned</p>
               </div>
               <div className="w-12 h-12 rounded-full border-4 border-gray-100 flex items-center justify-center font-black text-[#0F766E]">
                  {Math.round((readyCount/totalCount)*100)}%
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {room.players.map(player => (
              <PlayerCard 
                key={player.id} 
                player={player} 
                isSelf={player.id === currentPlayerId}
                onToggleReady={onToggleReady}
              />
            ))}
            {/* Empty Slots */}
            {Array.from({ length: room.maxPlayers - totalCount }).map((_, i) => (
              <div key={i} className="border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center p-6 h-[200px] opacity-40">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 animate-pulse">Awaiting Soul Presence</p>
              </div>
            ))}
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-12 items-center justify-between">
            <Button variant="ghost" onClick={onLeaveRoom}>Dissolve Presence</Button>
            
            {isCreator ? (
               <Button 
                onClick={onStartGame}
                disabled={!isAllReady}
                className={`w-full sm:w-80 h-16 text-xl shadow-xl hover:shadow-2xl hover:-translate-y-1 ${!isAllReady ? 'grayscale opacity-50' : 'animate-pulse'}`}
              >
                Begin Journey
              </Button>
            ) : (
              <div className="px-8 py-4 bg-gray-50 border border-gray-200 rounded-xl text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 animate-pulse">
                Aligning with Host Intent...
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Chat */}
        <div className="lg:col-span-1 h-full min-h-[500px]">
          <Chat 
            messages={room.messages} 
            onSendMessage={onSendMessage} 
            playerName={currentPlayer?.name || 'Unknown'} 
          />
        </div>
      </div>
    </div>
  );
};
