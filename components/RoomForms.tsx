
import React, { useState } from 'react';
import { Button } from './Button';
import { MAX_PLAYERS_OPTIONS } from '../constants';

interface CreateRoomFormProps {
  onSubmit: (data: { roomName: string; maxPlayers: number; playerName: string }) => void;
  onCancel: () => void;
}

export const CreateRoomForm: React.FC<CreateRoomFormProps> = ({ onSubmit, onCancel }) => {
  const [roomName, setRoomName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [playerName, setPlayerName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomName && playerName) {
      onSubmit({ roomName, maxPlayers, playerName });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-3xl font-black uppercase tracking-tight">Create Room</h2>
      
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Room Name</label>
        <input 
          type="text" 
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="Enter room name"
          required
          className="w-full p-4 border-2 border-gray-100 rounded-lg focus:border-[#0F766E] outline-none transition-colors"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Max Players</label>
        <select 
          value={maxPlayers}
          onChange={(e) => setMaxPlayers(Number(e.target.value))}
          className="w-full p-4 border-2 border-gray-100 rounded-lg focus:border-[#0F766E] outline-none transition-colors bg-white"
        >
          {MAX_PLAYERS_OPTIONS.map(opt => (
            <option key={opt} value={opt}>{opt} Players</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Your Name</label>
        <input 
          type="text" 
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter your name"
          required
          className="w-full p-4 border-2 border-gray-100 rounded-lg focus:border-[#0F766E] outline-none transition-colors"
        />
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" fullWidth>Create</Button>
        <Button variant="ghost" onClick={onCancel} fullWidth>Cancel</Button>
      </div>
    </form>
  );
};

export const SinglePlayerForm: React.FC<CreateRoomFormProps> = ({ onSubmit, onCancel }) => {
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [playerName, setPlayerName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName) {
      onSubmit({ roomName: "Dharma Quest", maxPlayers, playerName });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-3xl font-black uppercase tracking-tight">Single Player</h2>
      
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Number of Players</label>
        <select 
          value={maxPlayers}
          onChange={(e) => setMaxPlayers(Number(e.target.value))}
          className="w-full p-4 border-2 border-gray-100 rounded-lg focus:border-[#0F766E] outline-none transition-colors bg-white"
        >
          {MAX_PLAYERS_OPTIONS.map(opt => (
            <option key={opt} value={opt}>{opt} Players</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Your Name</label>
        <input 
          type="text" 
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter your name"
          required
          className="w-full p-4 border-2 border-gray-100 rounded-lg focus:border-[#0F766E] outline-none transition-colors"
        />
      </div>

      <div className="flex gap-4 pt-4">
        <Button type="submit" fullWidth className="!bg-[#F59E0B] !text-black">Start Quest</Button>
        <Button variant="ghost" onClick={onCancel} fullWidth>Cancel</Button>
      </div>
    </form>
  );
};

interface JoinRoomFormProps {
  onSubmit: (data: { roomCode: string; playerName: string }) => void;
  onCancel: () => void;
  error?: string | null;
}

export const JoinRoomForm: React.FC<JoinRoomFormProps> = ({ onSubmit, onCancel, error }) => {
  const [roomCode, setRoomCode] = useState('');
  const [playerName, setPlayerName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCode && playerName) {
      onSubmit({ roomCode: roomCode.toUpperCase(), playerName });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-3xl font-black uppercase tracking-tight">Join Room</h2>
      
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Room Code</label>
        <input 
          type="text" 
          value={roomCode}
          onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
          placeholder="6-DIGIT CODE"
          maxLength={6}
          required
          className="w-full p-4 border-2 border-gray-100 rounded-lg focus:border-[#0F766E] outline-none transition-colors font-mono tracking-widest"
        />
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-gray-500">Your Name</label>
        <input 
          type="text" 
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          placeholder="Enter your name"
          required
          className="w-full p-4 border-2 border-gray-100 rounded-lg focus:border-[#0F766E] outline-none transition-colors"
        />
      </div>

      {error && <p className="text-red-500 text-sm font-bold animate-pulse">{error}</p>}

      <div className="flex gap-4 pt-4">
        <Button type="submit" variant="secondary" fullWidth>Join</Button>
        <Button variant="ghost" onClick={onCancel} fullWidth>Cancel</Button>
      </div>
    </form>
  );
};
