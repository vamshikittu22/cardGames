
import React, { useState, useEffect } from 'react';
import { LandingPage } from './components/LandingPage';
import { CreateRoomForm, JoinRoomForm, SinglePlayerForm } from './components/RoomForms';
import { WaitingRoom } from './components/WaitingRoom';
import { Board } from './components/Board';
import { Room, ViewState, Player, ChatMessage } from './types';
import { getRandomColor, generateId } from './utils';
import { socket } from './lib/socket';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState | 'creating' | 'joining' | 'single-player'>('landing');
  const [room, setRoom] = useState<Room | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(() => sessionStorage.getItem('dharma_player_id'));
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSinglePlayerMode, setIsSinglePlayerMode] = useState(false);

  useEffect(() => {
    // Listen for authoritative state updates from the socket bridge
    socket.on('room_updated', (data: { room: Room; currentPlayerId?: string }) => {
      setRoom(data.room);
      if (data.currentPlayerId) {
        setCurrentPlayerId(data.currentPlayerId);
        sessionStorage.setItem('dharma_player_id', data.currentPlayerId);
      }
      setIsSyncing(false);
      
      // Auto-transition view based on room status
      if (data.room.status === 'in-game') {
        setView('in-game');
      } else if (data.room.status === 'waiting' && !isSinglePlayerMode) {
        if (view === 'landing' || view === 'creating' || view === 'joining') {
          setView('lobby');
        }
      }
    });

    socket.on('error', (msg: string) => {
      setError(msg);
      setIsSyncing(false);
    });

    return () => {};
  }, [view, isSinglePlayerMode]);

  const handleCreateRoom = (data: { roomName: string; maxPlayers: number; playerName: string }) => {
    setIsSyncing(true);
    setIsSinglePlayerMode(false);
    socket.emit('create_room', { 
      ...data, 
      color: getRandomColor(),
      isSinglePlayer: false
    });
  };

  const handleJoinRoom = (data: { roomCode: string; playerName: string }) => {
    setIsSyncing(true);
    setIsSinglePlayerMode(false);
    socket.emit('join_room', {
      ...data,
      color: getRandomColor()
    });
    
    setTimeout(() => {
      if (!room && view === 'joining') {
        setError("Joining failed. Room not found in this dharma plane.");
        setIsSyncing(false);
      }
    }, 2500);
  };

  const handleSinglePlayer = (data: { roomName: string; maxPlayers: number; playerName: string }) => {
    setIsSyncing(true);
    setIsSinglePlayerMode(true);
    socket.emit('create_room', { 
      ...data, 
      color: getRandomColor(),
      isSinglePlayer: true
    });
  };

  const toggleReady = () => {
    if (!room || !currentPlayerId) return;
    setIsSyncing(true);
    socket.emit('toggle_ready', { roomId: room.roomCode, playerId: currentPlayerId });
  };

  const handleSendMessage = (text: string) => {
    if (!room || !currentPlayerId) return;
    const player = room.players.find(p => p.id === currentPlayerId);
    socket.emit('chat_message', { 
      roomId: room.roomCode, 
      playerId: currentPlayerId, 
      playerName: player?.name || 'Unknown', 
      text 
    });
  };

  const startGame = () => {
    if (!room) return;
    setIsSyncing(true);
    socket.emit('start_game', { roomId: room.roomCode });
  };

  const leaveRoom = () => {
    setRoom(null);
    setCurrentPlayerId(null);
    sessionStorage.removeItem('dharma_player_id');
    setIsSinglePlayerMode(false);
    setView('landing');
  };

  return (
    <div className="min-h-screen text-[#1F2937]">
      {isSyncing && (
        <div className="fixed inset-0 z-[1000] bg-white/40 backdrop-blur-[4px] flex flex-col items-center justify-center cursor-wait">
           <div className="bg-black text-white px-8 py-4 rounded-full font-black uppercase text-[10px] tracking-[0.5em] animate-pulse shadow-2xl border border-white/20 mb-4">
             Synchronizing Dharma...
           </div>
           <div className="h-1 w-48 bg-gray-200 rounded-full overflow-hidden">
             <div className="h-full bg-[#0F766E] animate-[shimmer_2s_infinite]"></div>
           </div>
        </div>
      )}

      {view === 'landing' && (
        <LandingPage 
          onCreateRoom={() => setView('creating')} 
          onJoinRoom={() => setView('joining')} 
          onSinglePlayer={() => setView('single-player')} 
        />
      )}
      
      {(view === 'creating' || view === 'joining' || view === 'single-player') && (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50/50">
          <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl border-2 border-gray-100 animate-in fade-in zoom-in duration-300">
            {view === 'creating' && <CreateRoomForm onSubmit={handleCreateRoom} onCancel={() => setView('landing')} />}
            {view === 'joining' && <JoinRoomForm onSubmit={handleJoinRoom} onCancel={() => setView('landing')} error={error} />}
            {view === 'single-player' && <SinglePlayerForm onSubmit={handleSinglePlayer} onCancel={() => setView('landing')} />}
          </div>
        </div>
      )}

      {view === 'lobby' && room && (
        <WaitingRoom 
          room={room} 
          currentPlayerId={currentPlayerId!} 
          onToggleReady={toggleReady} 
          onSendMessage={handleSendMessage} 
          onStartGame={startGame} 
          onLeaveRoom={leaveRoom} 
        />
      )}

      {(view === 'in-game' || room?.status === 'finished') && room && (
        <Board 
          room={room} 
          currentPlayerId={currentPlayerId!} 
          onUpdateRoom={() => {}} 
          onLeaveRoom={leaveRoom} 
        />
      )}

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default App;
