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

  const showToast = useCallback((message: string, color: string = '#0F766E') => {
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
      showToast("Select an Assura from the central realm.", "#047857");
      return;
    }

    if (!selectedCardId) return showToast("Choose a manifestation from thy hand.", "red");

    const card = currentPlayer.hand.find(c => c.id === selectedCardId);
    if (!card) return;

    if (label === 'Introduce Major') {
      if (card.type !== 'Major') return showToast("Requires a Warrior manifestation.", "red");
      emitAction('PLAY_CARD', { cardId: selectedCardId, cost: 1 });
      setSelectedCardId(null);
    } else if (label === 'Attach Curse') {
      if (card.type !== 'Curse') return showToast("Requires a Curse manifestation.", "red");
      setTargetingMode('curse');
      showToast("Select an opponent's Major.", "#7F1D1D");
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
    showToast("Manifestation Successful", "#059669");
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
    <div className="fixed inset-0 bg-[#0F1117] text-white flex flex-col overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-500/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-orange-500/10 rounded-full blur-[120px]"></div>
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
           <div className="bg-black/95 backdrop-blur-3xl px-16 py-8 rounded-[40px] border border-white/10 shadow-2xl">
             <div className="flex flex-col items-center gap-2">
                <span className="text-yellow-500 font-black tracking-[0.5em] text-[8px] uppercase">Divine Shift</span>
                <h2 className="text-4xl font-black uppercase tracking-tight text-white text-center">{activePlayer.name}</h2>
             </div>
           </div>
        </div>
      )}

      <GameHeader turnNumber={room.currentTurn} activePlayer={activePlayer} turnStartTime={room.turnStartTime} onLeave={onLeaveRoom} />

      <InstructionPanel isMyTurn={isMyTurn} activePlayerName={activePlayer.name} targetingMode={targetingMode} selectedCard={currentPlayer.hand.find(c => c.id === selectedCardId)} />

      {rollingFor && (
        <DiceRoller 
          title={`Capturing ${rollingFor.card.name}`} 
          onComplete={handleRollComplete}
          ranges={{
            capture: rollingFor.card.captureRange,
            retaliation: rollingFor.card.retaliationRange,
            safe: rollingFor.card.safeZone
          }}
        />
      )}

      {/* Main Battlefield Scrollbox */}
      <main className="flex-1 overflow-y-auto scrollbar-hide flex flex-col items-center pt-24 pb-96">
        <div className="w-full max-w-screen-2xl px-6 flex flex-col gap-12">
          
          {/* Opponents Section */}
          <div className="flex flex-wrap justify-center gap-8">
            {otherPlayers.map((p) => (
              <div key={p.id} className="w-full lg:w-[45%] xl:w-[30%]">
                <PlayerArea 
                  player={p} 
                  isActive={room.activePlayerIndex === room.players.findIndex(pl => pl.id === p.id)} 
                  isCurrent={false} 
                  position="top" 
                  targetingMode={targetingMode} 
                  onTargetSelect={handleTargetSelection} 
                  isGameOver={isGameOver} 
                />
              </div>
            ))}
          </div>

          {/* Neutral Zone (Assuras & Decks) */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12 py-8 bg-black/20 rounded-[60px] border border-white/5 backdrop-blur-md px-12">
             <div className="flex gap-8">
               <DeckPile label="Draw" count={room.drawDeck.length} type="draw" />
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
                  className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 font-black uppercase tracking-widest text-[9px] hover:bg-white/10 transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  Chronicles
                </button>
             </div>
          </div>

          {/* Self Section */}
          <div className="flex justify-center">
            <div className="w-full lg:w-[80%] xl:w-[60%]">
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

      {/* Persistent HUD */}
      <div className="fixed bottom-0 left-0 right-0 z-[100] flex flex-col">
         <div className="pointer-events-auto">
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
        <div className="fixed top-24 left-1/2 -translate-x-1/2 px-8 py-3 rounded-full font-black uppercase text-[9px] tracking-[0.4em] text-white shadow-2xl z-[500] border border-white/20 animate-in slide-in-from-top" style={{ backgroundColor: toast.color }}>
          {toast.message}
        </div>
      )}
      <GameLog logs={room.gameLogs} isOpen={showLog} onClose={() => setShowLog(false)} />
    </div>
  );
};