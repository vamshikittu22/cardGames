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
      {/* Immersive Background */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#1e293b_0%,#0a0c10_80%)]"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-dharma-teal/5 blur-[150px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-dharma-gold/5 blur-[150px] translate-y-1/2 -translate-x-1/2"></div>
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

      {/* Main Play Area */}
      <main className="flex-1 overflow-y-auto scrollbar-hide pt-28 pb-80 px-8">
        <div className="max-w-7xl mx-auto flex flex-col gap-12">

          {/* Opponents Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
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

          {/* Central Neutral Zone */}
          <div className="relative flex flex-col lg:flex-row items-center justify-between gap-8 py-10 glass-panel rounded-[64px] border border-white/5 px-12 overflow-visible">
            <div className="flex gap-10 items-center">
              <DeckPile label="Universal Source" count={room.drawDeck.length} type="draw" />
              <DeckPile label="Submerge" count={room.submergePile.length} type="submerge" />
            </div>

            <AssuraZone
              assuras={room.assuras}
              targetingMode={targetingMode}
              onAssuraSelect={handleAssuraSelection}
            />

            <div className="flex flex-col gap-4">
              <button
                onClick={() => setShowLog(true)}
                className="px-8 py-3 rounded-2xl bg-white/5 border border-white/10 font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all flex items-center gap-3 group"
              >
                <svg className="w-5 h-5 text-dharma-gold group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                The Chronicles
              </button>
            </div>
          </div>

          {/* Player Personal Zone */}
          <div className="flex justify-center">
            <div className="w-full max-w-5xl">
              <PlayerArea
                player={currentPlayer}
                isActive={isMyTurn}
                isCurrent={true}
                position="bottom"
                targetingMode={targetingMode}
                onTargetSelect={handleTargetSelection}
                isGameOver={isGameOver}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Interface HUD */}
      <div className="fixed bottom-0 left-0 right-0 z-[110] flex flex-col pointer-events-none">
        <div className="pointer-events-auto h-[330px]">
          <PlayerHand
            hand={currentPlayer.hand}
            selectedCardId={selectedCardId}
            onSelectCard={(id) => !isGameOver && setSelectedCardId(selectedCardId === id ? null : id)}
            isGameOver={isGameOver}
          />
        </div>
        <div className="pointer-events-auto">
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