
import React, { useState, useEffect, useRef } from 'react';
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

  // Synchronize ID immediately when room updates
  useEffect(() => {
    socket.on('room_updated', (data: { room: Room; currentPlayerId?: string }) => {
      setRoom(data.room);
      
      const authoritativeId = data.currentPlayerId || sessionStorage.getItem('dharma_player_id');
      if (authoritativeId) {
        setCurrentPlayerId(authoritativeId);
        sessionStorage.setItem('dharma_player_id', authoritativeId);
      }
      
      setIsSyncing(false);
      
      if (data.room.status === 'in-game') {
        setView('in-game');
      } else if (data.room.status === 'waiting' && !isSinglePlayerMode) {
        if (view === 'landing' || view === 'creating' || view === 'joining' || view === 'single-player') {
          setView('lobby');
        }
      }
    });

    socket.on('error', (msg: string) => {
      setError(msg);
      setIsSyncing(false);
    });
  }, [view, isSinglePlayerMode]);

  const handleCreateRoom = (data: { roomName: string; maxPlayers: number; playerName: string }) => {
    setIsSyncing(true);
    socket.emit('create_room', { ...data, color: getRandomColor(), isSinglePlayer: false });
  };

  const handleJoinRoom = (data: { roomCode: string; playerName: string }) => {
    setIsSyncing(true);
    socket.emit('join_room', { ...data, color: getRandomColor() });
  };

  const handleSinglePlayer = (data: { roomName: string; maxPlayers: number; playerName: string }) => {
    setIsSyncing(true);
    setIsSinglePlayerMode(true);
    socket.emit('create_room', { ...data, color: getRandomColor(), isSinglePlayer: true });
  };

  const toggleReady = () => {
    if (!room || !currentPlayerId) return;
    setIsSyncing(true);
    socket.emit('toggle_ready', { roomId: room.roomCode, playerId: currentPlayerId });
  };

  const handleSendMessage = (text: string) => {
    if (!room || !currentPlayerId) return;
    const p = room.players.find(p => p.id === currentPlayerId);
    socket.emit('chat_message', { roomId: room.roomCode, playerId: currentPlayerId, playerName: p?.name || 'Unknown', text });
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
        <div className="fixed inset-0 z-[1000] bg-black/40 backdrop-blur-[2px] flex items-center justify-center cursor-wait">
           <div className="bg-white text-black px-8 py-4 rounded-full font-black uppercase text-[10px] tracking-[0.5em] animate-pulse shadow-2xl">
             Aligning Cycles...
           </div>
        </div>
      )}

      {view === 'landing' && (
        <LandingPage onCreateRoom={() => setView('creating')} onJoinRoom={() => setView('joining')} onSinglePlayer={() => setView('single-player')} />
      )}
      
      {(view === 'creating' || view === 'joining' || view === 'single-player') && (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl border-2 border-gray-100">
            {view === 'creating' && <CreateRoomForm onSubmit={handleCreateRoom} onCancel={() => setView('landing')} />}
            {view === 'joining' && <JoinRoomForm onSubmit={handleJoinRoom} onCancel={() => setView('landing')} error={error} />}
            {view === 'single-player' && <SinglePlayerForm onSubmit={handleSinglePlayer} onCancel={() => setView('landing')} />}
          </div>
        </div>
      )}

      {view === 'lobby' && room && (
        <WaitingRoom room={room} currentPlayerId={currentPlayerId!} onToggleReady={toggleReady} onSendMessage={handleSendMessage} onStartGame={startGame} onLeaveRoom={leaveRoom} />
      )}

      {(view === 'in-game' || room?.status === 'finished') && room && (
        <Board room={room} currentPlayerId={currentPlayerId!} onUpdateRoom={() => {}} onLeaveRoom={leaveRoom} />
      )}
    </div>
  );
};

export default App;
