
import React, { useState } from 'react';
import { LandingPage } from './components/LandingPage';
import { CreateRoomForm, JoinRoomForm, SinglePlayerForm } from './components/RoomForms';
import { WaitingRoom } from './components/WaitingRoom';
import { Board } from './components/Board';
import { Room, ViewState, Player, ChatMessage } from './types';
import { generateRoomCode, getRandomColor, generateId, createMasterDeck, createAssuraPool, createGenerals, shuffle } from './utils';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState | 'creating' | 'joining' | 'single-player'>('landing');
  const [rooms, setRooms] = useState<Record<string, Room>>({});
  const [currentRoomCode, setCurrentRoomCode] = useState<string | null>(null);
  const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCreateRoom = (data: { roomName: string; maxPlayers: number; playerName: string }) => {
    const code = generateRoomCode();
    const pId = generateId();
    
    const newRoom: Room = {
      roomCode: code,
      roomName: data.roomName,
      maxPlayers: data.maxPlayers,
      players: [{
        id: pId,
        name: data.playerName,
        color: getRandomColor(),
        isReady: false,
        isCreator: true,
        karmaPoints: 3,
        hand: [],
        sena: [],
        jail: []
      }],
      status: 'waiting',
      createdAt: Date.now(),
      messages: [{
        id: generateId(),
        playerId: 'system',
        playerName: 'System',
        text: `Welcome to ${data.roomName}! Share code ${code} with your friends.`,
        timestamp: Date.now()
      }],
      currentTurn: 1,
      turnStartTime: Date.now(),
      activePlayerIndex: 0,
      assuras: [],
      assuraReserve: [],
      gameLogs: [],
      actionsUsedThisTurn: [],
      drawDeck: [],
      submergePile: [],
      shaknyModifiers: []
    };

    setRooms(prev => ({ ...prev, [code]: newRoom }));
    setCurrentRoomCode(code);
    setCurrentPlayerId(pId);
    setView('lobby');
  };

  const handleSinglePlayer = (data: { roomName: string; maxPlayers: number; playerName: string }) => {
    const code = "LOCAL";
    const pId = generateId();
    
    const masterDeck = createMasterDeck();
    const assuraPool = createAssuraPool();
    const generals = shuffle(createGenerals());

    const human: Player = {
      id: pId,
      name: data.playerName,
      color: getRandomColor(),
      isReady: true,
      isCreator: true,
      karmaPoints: 3,
      hand: [],
      sena: [],
      jail: []
    };

    const bots: Player[] = Array.from({ length: data.maxPlayers - 1 }).map((_, i) => ({
      id: `bot-${i}`,
      name: `System Sage ${i + 1}`,
      color: getRandomColor(),
      isReady: true,
      isCreator: false,
      karmaPoints: 3,
      hand: [],
      sena: [],
      jail: []
    }));

    const players = [human, ...bots];
    
    players.forEach((p, idx) => {
      const general = generals[idx % generals.length];
      const startingHand = masterDeck.splice(0, 5);
      p.hand = [general, ...startingHand];
    });

    const firstPlayerIdx = Math.floor(Math.random() * players.length);

    const newRoom: Room = {
      roomCode: code,
      roomName: data.roomName,
      maxPlayers: data.maxPlayers,
      players: players,
      status: 'in-game',
      createdAt: Date.now(),
      messages: [],
      currentTurn: 1,
      turnStartTime: Date.now(),
      activePlayerIndex: firstPlayerIdx,
      assuras: assuraPool.splice(0, 3),
      assuraReserve: assuraPool,
      gameLogs: [],
      actionsUsedThisTurn: [],
      drawDeck: masterDeck,
      submergePile: [],
      shaknyModifiers: []
    };

    setRooms(prev => ({ ...prev, [code]: newRoom }));
    setCurrentRoomCode(code);
    setCurrentPlayerId(pId);
    setView('in-game');
  };

  const handleJoinRoom = (data: { roomCode: string; playerName: string }) => {
    const room = rooms[data.roomCode];
    if (!room) {
      setError("Room not found. Please check the code.");
      return;
    }
    if (room.players.length >= room.maxPlayers) {
      setError("Room is full.");
      return;
    }

    const pId = generateId();
    const newPlayer: Player = {
      id: pId,
      name: data.playerName,
      color: getRandomColor(),
      isReady: false,
      isCreator: false,
      karmaPoints: 3,
      hand: [],
      sena: [],
      jail: []
    };

    setRooms(prev => ({ ...prev, [data.roomCode]: { ...room, players: [...room.players, newPlayer] } }));
    setCurrentRoomCode(data.roomCode);
    setCurrentPlayerId(pId);
    setView('lobby');
    setError(null);
  };

  const startGame = () => {
    if (!currentRoomCode) return;
    
    setRooms(prev => {
      const room = prev[currentRoomCode];
      const masterDeck = createMasterDeck();
      const assuraPool = createAssuraPool();
      const generals = shuffle(createGenerals());

      const initializedPlayers = room.players.map((p, idx) => {
        const general = generals[idx % generals.length];
        const startingHand = masterDeck.splice(0, 5);
        return {
          ...p,
          karmaPoints: 3,
          hand: [general, ...startingHand],
          sena: [],
          jail: []
        };
      });

      const firstPlayerIdx = Math.floor(Math.random() * initializedPlayers.length);

      return {
        ...prev,
        [currentRoomCode]: {
          ...room,
          status: 'in-game',
          players: initializedPlayers,
          activePlayerIndex: firstPlayerIdx,
          turnStartTime: Date.now(),
          assuras: assuraPool.splice(0, 3),
          assuraReserve: assuraPool,
          drawDeck: masterDeck,
          submergePile: [],
          shaknyModifiers: []
        }
      };
    });

    setView('in-game');
  };

  const updateRoomState = (room: Room) => {
    setRooms(prev => ({ ...prev, [room.roomCode]: room }));
    // If the room just got reset to waiting, update view
    if (room.status === 'waiting') {
      setView('lobby');
    }
  };

  const toggleReady = () => {
    if (!currentRoomCode || !currentPlayerId) return;
    setRooms(prev => {
      const room = prev[currentRoomCode];
      const updatedPlayers = room.players.map(p => p.id === currentPlayerId ? { ...p, isReady: !p.isReady } : p);
      return { ...prev, [currentRoomCode]: { ...room, players: updatedPlayers } };
    });
  };

  const handleSendMessage = (text: string) => {
    if (!currentRoomCode || !currentPlayerId) return;
    const player = rooms[currentRoomCode].players.find(p => p.id === currentPlayerId);
    const newMessage: ChatMessage = { id: generateId(), playerId: currentPlayerId, playerName: player?.name || 'Unknown', text, timestamp: Date.now() };
    setRooms(prev => ({ ...prev, [currentRoomCode]: { ...prev[currentRoomCode], messages: [...prev[currentRoomCode].messages, newMessage] } }));
  };

  const leaveRoom = () => {
    setCurrentRoomCode(null);
    setCurrentPlayerId(null);
    setView('landing');
  };

  return (
    <div className="min-h-screen text-[#1F2937]">
      {view === 'landing' && <LandingPage onCreateRoom={() => setView('creating')} onJoinRoom={() => setView('joining')} onSinglePlayer={() => setView('single-player')} />}
      {(view === 'creating' || view === 'joining' || view === 'single-player') && (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50/50">
          <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-2xl border-2 border-gray-100 animate-in fade-in zoom-in duration-300">
            {view === 'creating' && <CreateRoomForm onSubmit={handleCreateRoom} onCancel={() => setView('landing')} />}
            {view === 'joining' && <JoinRoomForm onSubmit={handleJoinRoom} onCancel={() => setView('landing')} error={error} />}
            {view === 'single-player' && <SinglePlayerForm onSubmit={handleSinglePlayer} onCancel={() => setView('landing')} />}
          </div>
        </div>
      )}
      {view === 'lobby' && currentRoomCode && rooms[currentRoomCode] && (
        <WaitingRoom room={rooms[currentRoomCode]} currentPlayerId={currentPlayerId!} onToggleReady={toggleReady} onSendMessage={handleSendMessage} onStartGame={startGame} onLeaveRoom={leaveRoom} />
      )}
      {(view === 'in-game' || (currentRoomCode && rooms[currentRoomCode]?.status === 'finished')) && currentRoomCode && rooms[currentRoomCode] && (
        <Board room={rooms[currentRoomCode]} currentPlayerId={currentPlayerId!} onUpdateRoom={updateRoomState} onLeaveRoom={leaveRoom} />
      )}
    </div>
  );
};

export default App;
