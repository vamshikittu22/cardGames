import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Room, GameCard as IGameCard, Player, TargetingMode } from '../types';
import { GameHeader } from './GameHeader';
import { AssuraZone } from './AssuraZone';
import { PlayerArea } from './PlayerArea';
import { ControlPanel } from './ControlPanel';
import { GameLog } from './GameLog';
import { DeckPile } from './DeckStacks';
import { VictoryScreen } from './VictoryScreen';
import { PlayerHand } from './PlayerHand';
import { InstructionPanel } from './InstructionPanel';
import { DiceRoller } from './DiceRoller';
import { socket } from '../lib/socket';
import { validateAssuraRequirement } from '../utils';

interface BoardProps {
  room: Room;
  currentPlayerId: string;
  onUpdateRoom: (room: Room) => void;
  onLeaveRoom: () => void;
}

export const Board: React.FC<BoardProps> = ({ room, currentPlayerId, onLeaveRoom }) => {
  const [showLog, setShowLog] = useState(false);
  const [toast, setToast] = useState<{ message: string; color: string } | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [targetingMode, setTargetingMode] = useState<TargetingMode>('none');
  const [showTurnOverlay, setShowTurnOverlay] = useState(false);
  const [rollingFor, setRollingFor] = useState<{ card: IGameCard } | null>(null);

  const activePlayer = useMemo(() => room.players[room.activePlayerIndex], [room.players, room.activePlayerIndex]);
  const isMyTurn = activePlayer?.id === currentPlayerId;
  const currentPlayer = useMemo(() => room.players.find(p => p.id === currentPlayerId) || room.players[0], [room.players, currentPlayerId]);
  const otherPlayers = useMemo(() => room.players.filter(p => p.id !== currentPlayerId), [room.players, currentPlayerId]);
  const isGameOver = room.status === 'finished';

  useEffect(() => {
    setShowTurnOverlay(true);
    const t = setTimeout(() => setShowTurnOverlay(false), 2000);
    return () => clearTimeout(t);
  }, [room.activePlayerIndex]);

  const showToast = useCallback((message: string, color: string = '#14B8A6') => {
    setToast({ message, color });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const emitAction = useCallback((actionType: string, payload: any = {}) => {
    socket.emit('game_action', { roomId: room.roomCode, playerId: currentPlayerId, actionType, payload });
  }, [room.roomCode, currentPlayerId]);

  const handleAction = useCallback((label: string, cost: number) => {
    if (!isMyTurn || isGameOver) return showToast("Awaiting thy manifestation cycle...", "red");

    if (label === 'Draw Card') {
      if (currentPlayer.karmaPoints < 1) return showToast("Insufficient Karma.", "red");
      emitAction('DRAW_CARD');
      return;
    }

    if (label === 'Capture Assura') {
      if (currentPlayer.karmaPoints < 2) return showToast("Capture requires 2 Karma Points.", "red");
      setTargetingMode('capture-assura');
      showToast("Select an Assura from the central realm.", "#F59E0B");
      return;
    }

    if (!selectedCardId) return showToast("Choose a manifestation from thy hand.", "red");

    const card = currentPlayer.hand.find(c => c.id === selectedCardId);
    if (!card) return;

    if (label === 'Introduce Major') {
      if (card.type !== 'Major' && card.type !== 'General') return showToast("Requires a Warrior manifestation.", "red");
      emitAction('PLAY_CARD', { cardId: selectedCardId, cost: 1 });
      setSelectedCardId(null);
    } else if (label === 'Attach Curse') {
      if (card.type !== 'Curse') return showToast("Requires a Curse manifestation.", "red");
      setTargetingMode('curse');
      showToast("Select an opponent's Major.", "#991B1B");
    } else if (label === 'Play Astra') {
      if (card.type !== 'Astra') return showToast("Requires an Astra manifestation.", "red");
      setTargetingMode('astra');
      showToast("Select thy own Major warrior.", "#F59E0B");
    } else if (label === 'Play Maya') {
      if (card.type !== 'Maya') return showToast("Requires a Maya manifestation.", "red");
      setTargetingMode('maya');
      showToast("Select any warrior on the field.", "#2563EB");
    } else {
      emitAction('PLAY_CARD', { cardId: selectedCardId, cost: cost || 1 });
      setSelectedCardId(null);
    }
  }, [isMyTurn, isGameOver, currentPlayer, selectedCardId, emitAction, showToast]);

  const handleEndTurn = useCallback(() => {
    if (!isMyTurn || isGameOver) return;
    socket.emit('game_action', { roomId: room.roomCode, playerId: currentPlayerId, actionType: 'END_TURN' });
    setSelectedCardId(null);
    setTargetingMode('none');
  }, [isMyTurn, isGameOver, room.roomCode, currentPlayerId]);

  const handleTargetSelection = (playerId: string, cardId: string) => {
    emitAction('PLAY_CARD', { cardId: selectedCardId, cost: 1, targetInfo: { playerId, cardId } });
    setTargetingMode('none');
    setSelectedCardId(null);
    showToast("Divine Manifestation Successful", "#14B8A6");
  };

  const handleAssuraSelection = (assuraId: string) => {
    const assura = room.assuras.find(a => a.id === assuraId);
    if (!assura) return;

    if (!validateAssuraRequirement(currentPlayer.sena, assura.requirement || '')) {
      return showToast(`Incomplete Sena forces. Requirement: ${assura.requirement}`, "red");
    }

    setRollingFor({ card: assura });
    setTargetingMode('none');
  };

  const handleRollComplete = (result: number) => {
    if (!rollingFor) return;
    const assura = rollingFor.card;
    const isCaptured = result >= (assura.captureRange?.[0] || 7);

    emitAction('CAPTURE_RESULT', {
      cardId: assura.id,
      isCaptured,
      cost: 2
    });

    setRollingFor(null);
  };

  return (
    <div className="fixed inset-0 bg-[#0A0C10] text-white flex flex-col overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#1e293b_0%,#0a0c10_80%)]"></div>
      </div>

      {isGameOver && room.winner && (
        <VictoryScreen
          roomName={room.roomName}
          winner={room.winner}
          players={room.players}
          turnCount={room.currentTurn}
          onReturnToLobby={() => socket.emit('reset_room', { roomId: room.roomCode })}
          onExit={onLeaveRoom}
        />
      )}

      {showTurnOverlay && !isGameOver && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center pointer-events-none animate-in fade-in zoom-in duration-500">
          <div className="glass-panel px-20 py-10 rounded-[40px] border border-dharma-gold/30 shadow-[0_0_80px_rgba(245,158,11,0.2)]">
            <div className="flex flex-col items-center gap-2">
              <span className="text-dharma-gold font-black tracking-[0.6em] text-[10px] uppercase mb-2">Cycle Manifestation</span>
              <h2 className="text-5xl font-black uppercase tracking-tight text-white text-center drop-shadow-lg">{activePlayer.name}</h2>
            </div>
          </div>
        </div>
      )}

      <GameHeader turnNumber={room.currentTurn} activePlayer={activePlayer} turnStartTime={room.turnStartTime} onLeave={onLeaveRoom} />
      <InstructionPanel isMyTurn={isMyTurn} activePlayerName={activePlayer.name} targetingMode={targetingMode} selectedCard={currentPlayer.hand.find(c => c.id === selectedCardId)} />

      {rollingFor && (
        <DiceRoller
          title={`Invoking Force against ${rollingFor.card.name}`}
          onComplete={handleRollComplete}
          ranges={{
            capture: rollingFor.card.captureRange,
            retaliation: rollingFor.card.retaliationRange,
            safe: rollingFor.card.safeZone
          }}
        />
      )}

      {/* SIMPLE VERTICAL LAYOUT */}
      <main className="flex-1 flex flex-col overflow-y-auto scrollbar-hide pb-[320px]">
        <div className="flex-1 flex flex-col gap-4 p-4 max-w-[1400px] mx-auto w-full">
          
          {/* Opponents Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {otherPlayers.map((p) => (
              <PlayerArea 
                key={p.id}
                player={p} 
                isActive={room.activePlayerIndex === room.players.findIndex(pl => pl.id === p.id)} 
                isCurrent={false} 
                position="top" 
                targetingMode={targetingMode} 
                onTargetSelect={handleTargetSelection} 
                isGameOver={isGameOver} 
              />
            ))}
          </div>

          {/* Central Game Board */}
          <div className="flex items-center justify-center gap-6 py-4 px-6 bg-gradient-to-br from-[#1a2332]/80 to-[#0d1117]/80 backdrop-blur-sm rounded-2xl border border-white/20">
            <DeckPile label="Draw" count={room.drawDeck.length} type="draw" />
            
            <AssuraZone 
              assuras={room.assuras} 
              targetingMode={targetingMode} 
              onAssuraSelect={handleAssuraSelection} 
            />

            <DeckPile label="Discard" count={room.submergePile.length} type="submerge" />
            
            <button 
              onClick={() => setShowLog(true)} 
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 font-black uppercase tracking-widest text-[7px] hover:bg-white/10 transition-all"
            >
              Log
            </button>
          </div>

          {/* Your Play Area */}
          <div className="w-full">
            <PlayerArea 
              player={currentPlayer} is Active={isMyTurn} 
              isCurrent={true} 
              position="bottom" 
              targetingMode={targetingMode} 
              onTargetSelect={handleTargetSelection} 
              isGameOver={isGameOver} 
            />
          </div>
        </div>
      </main>

      {/* Fixed Bottom: Hand + Control Panel */}
      <div className="fixed bottom-0 left-0 right-0 z-[200]">
        {/* Hand Area */}
        <div className="h-[230px] bg-gradient-to-t from-black via-black to-black/50 border-t-2 border-white/30 pt-3">
          <div className="text-center text-[8px] font-black text-white/50 uppercase tracking-widest mb-2">▼ Your Hand ▼</div>
          <PlayerHand 
            hand={currentPlayer.hand} 
            selectedCardId={selectedCardId} 
            onSelectCard={(id) => !isGameOver && setSelectedCardId(selectedCardId === id ? null : id)} 
            isGameOver={isGameOver} 
          />
        </div>
        
        {/* Control Panel */}
        <div className="bg-black">
          <ControlPanel 
            kp={currentPlayer.karmaPoints} 
            isActive={isMyTurn && !isGameOver} 
            onAction={handleAction} 
            onEndTurn={handleEndTurn} 
            actionsUsed={[]} 
            deckEmpty={room.drawDeck.length === 0}
          />
        </div>
      </div>


      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 px-10 py-3 rounded-full font-black uppercase text-[10px] tracking-[0.5em] text-white shadow-2xl z-[500] border border-white/20 animate-in slide-in-from-top-4" style={{ backgroundColor: toast.color }}>
          {toast.message}
        </div>
      )}
      <GameLog logs={room.gameLogs} isOpen={showLog} onClose={() => setShowLog(false)} />
    </div>
  );
};

