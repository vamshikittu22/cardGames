import React, { useState, useEffect, useCallback } from 'react';
import { LandingPage } from './components/LandingPage';
import { CreateRoomForm, JoinRoomForm, SinglePlayerForm } from './components/RoomForms';
import { WaitingRoom } from './components/WaitingRoom';
import { Board } from './components/Board';
import { Room, ViewState } from './types';
import { getRandomColor } from './utils';
import { socket } from './lib/socket';
import { safeSessionStorage } from './utils/safeStorage';

const App: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [view, setView] = useState<ViewState | 'creating' | 'joining' | 'single-player'>('landing');
  const [room, setRoom] = useState<Room | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSinglePlayerMode, setIsSinglePlayerMode] = useState(false);

  useEffect(() => {
    try {
      // Sync player ID from safe storage on startup
      const savedId = safeSessionStorage.getItem('dharma_player_id');
      if (savedId) setCurrentPlayerId(savedId);
      setIsInitialized(true);
    } catch (err) {
      console.error("Initialization failed:", err);
    }
  }, []);

  useEffect(() => {
    if (!isInitialized) return;

    const handleRoomUpdate = (data: { room: Room; currentPlayerId?: string }) => {
      setRoom(data.room);

      const authoritativeId = data.currentPlayerId || safeSessionStorage.getItem('dharma_player_id');
      if (authoritativeId) {
        setCurrentPlayerId(authoritativeId);
        safeSessionStorage.setItem('dharma_player_id', authoritativeId);
      }

      setIsSyncing(false);

      if (data.room.status === 'in-game') {
        setView('in-game');
      } else if (data.room.status === 'waiting') {
        if (view === 'landing' || view === 'creating' || view === 'joining' || view === 'single-player') {
          setView('lobby');
        }
      }
    };

    const handleError = (msg: string) => {
      setError(msg);
      setIsSyncing(false);
    };

    socket.on('room_updated', handleRoomUpdate);
    socket.on('error', handleError);

    return () => {
      // Listeners are managed inside the bridge class, but we can clear specific UI effects here if needed
    };
  }, [view, isInitialized]);

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
    safeSessionStorage.removeItem('dharma_player_id');
    setIsSinglePlayerMode(false);
    setView('landing');
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-swiss-white flex items-center justify-center">
        <div className="text-center font-black italic tracking-tighter text-8xl animate-pulse">
          LOADING...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-swiss-black bg-swiss-white selection:bg-swiss-red selection:text-white">
      {isSyncing && (
        <div className="fixed inset-0 z-[1000] bg-swiss-black/90 flex items-center justify-center cursor-wait">
          <div className="bg-swiss-red text-white px-12 py-6 font-black uppercase text-4xl tracking-tighter animate-bounce">
            SYNCING...
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
        <div className="min-h-screen flex items-center justify-center p-4 bg-swiss-blue">
          <div className="w-full max-w-2xl bg-swiss-white p-12 swiss-border shadow-[16px_16px_0px_rgba(0,0,0,1)]">
            <div className="mb-8 text-xs font-black uppercase tracking-[0.5em] text-swiss-red">
              SYSTEM • CONFIGURATION
            </div>
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
          onUpdateRoom={() => { }}
          onLeaveRoom={leaveRoom}
        />
      )}
    </div>
  );
};

export default App;