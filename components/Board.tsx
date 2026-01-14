
import React, { useState, useEffect } from 'react';
import { Room, LogEntry, GameCard as IGameCard, Player, TargetingMode, WinCondition } from '../types';
import { GameHeader } from './GameHeader';
import { AssuraZone } from './AssuraZone';
import { PlayerArea } from './PlayerArea';
import { ControlPanel } from './ControlPanel';
import { GameLog } from './GameLog';
import { DeckPile } from './DeckStacks';
import { generateId, shuffle, validateAssuraRequirement } from '../utils';
import { GameCard } from './GameCard';
import { DiceRoller } from './DiceRoller';
import { InterruptWindow } from './InterruptWindow';
import { ClashDuel } from './ClashDuel';
import { VictoryScreen } from './VictoryScreen';

const getOpponentPosition = (index: number, total: number): 'top' | 'left' | 'right' => {
  if (total === 1) return 'top';
  if (index === 0) return 'left';
  if (index === total - 1) return 'right';
  return 'top';
};

interface BoardProps {
  room: Room;
  currentPlayerId: string;
  onUpdateRoom: (room: Room) => void;
  onLeaveRoom: () => void;
}

export const Board: React.FC<BoardProps> = ({ room, currentPlayerId, onUpdateRoom, onLeaveRoom }) => {
  const [showLog, setShowLog] = useState(false);
  const [toast, setToast] = useState<{ message: string; color: string } | null>(null);
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [targetingMode, setTargetingMode] = useState<TargetingMode>('none');
  const [activeMaya, setActiveMaya] = useState<IGameCard | null>(null);
  const [rollingFor, setRollingFor] = useState<{ type: 'power' | 'capture', card: IGameCard, playerId: string, attackers?: IGameCard[] } | null>(null);
  const [selectedAssuraId, setSelectedAssuraId] = useState<string | null>(null);
  const [selectedAttackerIds, setSelectedAttackerIds] = useState<string[]>([]);

  const activePlayer = room.players[room.activePlayerIndex];
  const isMyTurn = activePlayer.id === currentPlayerId;
  const currentPlayer = room.players.find(p => p.id === currentPlayerId)!;
  const otherPlayers = room.players.filter(p => p.id !== currentPlayerId);
  const isGameOver = room.status === 'finished';

  // Phase 8: Timer Management for Interrupts
  useEffect(() => {
    if (!room.interruptStatus || isGameOver) return;
    const remaining = room.interruptStatus.endTime - Date.now();
    const timer = setTimeout(() => {
      resolveInterruptWindow();
    }, Math.max(0, remaining));
    return () => clearTimeout(timer);
  }, [room.interruptStatus?.endTime, isGameOver]);

  const showToast = (message: string, color: string = '#F59E0B') => {
    setToast({ message, color });
    setTimeout(() => setToast(null), 3000);
  };

  const checkWinConditions = (players: Player[]): { winnerId: string, condition: WinCondition } | null => {
    for (const p of players) {
      // Condition 1: 3 Assuras Captured
      if (p.jail.length >= 3) return { winnerId: p.id, condition: 'assura-capture' };
      
      // Condition 2: 6 Unique Major Classes in Sena
      const uniqueClasses = new Set(p.sena.map(m => m.classSymbol).filter(Boolean));
      if (uniqueClasses.size >= 6) return { winnerId: p.id, condition: 'class-completion' };
    }
    return null;
  };

  const resolveInterruptWindow = () => {
    if (!room.interruptStatus || isGameOver) return;

    if (room.interruptStatus.type === 'clash-window') {
      if (!room.clashDuel && room.pendingAction) {
        executeFinalizedAction(room.pendingAction);
      }
    } else if (room.interruptStatus.type === 'shakny-window') {
      if (room.interruptStatus.rollDetails) {
        setRollingFor(room.interruptStatus.rollDetails);
        onUpdateRoom({ ...room, interruptStatus: undefined });
      }
    }
  };

  const executeFinalizedAction = (action: any) => {
    const { actorId, card, cost, type, targetInfo } = action;
    const actor = room.players.find(p => p.id === actorId)!;
    const updatedHand = actor.hand.filter(c => c.id !== card.id);
    let updatedPlayers = [...room.players];
    let updatedSubmerge = [...room.submergePile];

    if (type === 'intro') {
      updatedPlayers = updatedPlayers.map(p => p.id === actorId ? { ...p, karmaPoints: p.karmaPoints - cost, hand: updatedHand, sena: [...p.sena, card] } : p);
    } else if (type === 'maya') {
      setActiveMaya(card);
      updatedPlayers = updatedPlayers.map(p => p.id === actorId ? { ...p, karmaPoints: p.karmaPoints - cost, hand: updatedHand } : p);
    } else if (type === 'astra' || type === 'curse') {
      updatedPlayers = updatedPlayers.map(p => {
        if (p.id === targetInfo.playerId) {
          const sena = p.sena.map(m => m.id === targetInfo.cardId ? (type === 'astra' ? { ...m, attachedAstras: [...m.attachedAstras, card] } : { ...m, curses: [card] }) : m);
          return { ...p, sena };
        }
        if (p.id === actorId) return { ...p, karmaPoints: p.karmaPoints - cost, hand: updatedHand };
        return p;
      });
    }

    // Real-time Win Check after Major Intro
    const victory = checkWinConditions(updatedPlayers);
    
    onUpdateRoom({
      ...room,
      players: updatedPlayers,
      submergePile: updatedSubmerge,
      pendingAction: undefined,
      interruptStatus: !victory && type === 'intro' ? { type: 'shakny-window', endTime: Date.now() + 3000, rollDetails: { type: 'power', card, playerId: actorId } } : undefined,
      status: victory ? 'finished' : room.status,
      winner: victory ? { id: victory.winnerId, name: updatedPlayers.find(p => p.id === victory.winnerId)!.name, color: updatedPlayers.find(p => p.id === victory.winnerId)!.color, condition: victory.condition, timestamp: Date.now() } : undefined,
      gameLogs: [...room.gameLogs, { id: generateId(), turn: room.currentTurn, playerName: actor.name, action: `successfully played ${card.name}`, kpSpent: cost, timestamp: Date.now() }]
    });
  };

  const resolveMaya = () => {
    if (!activeMaya) return;
    showToast(`${activeMaya.name} effect manifested!`, "#2563EB");
    onUpdateRoom({
      ...room,
      submergePile: [...room.submergePile, activeMaya]
    });
  };

  const handleAssuraSelection = (id: string) => {
    if (targetingMode !== 'capture-assura' || isGameOver) return;
    setSelectedAssuraId(id);
    setTargetingMode('capture-majors');
    showToast("Select your attackers.", "#EA580C");
  };

  const handleAction = (label: string, cost: number) => {
    if (!isMyTurn || isGameOver) return;
    if (label === 'Draw Card') { handleDrawCard(); return; }
    if (label === 'Invoke Power') {
      const hasUnusedMajors = currentPlayer.sena.some(m => !m.invokedThisTurn);
      if (!hasUnusedMajors) { showToast("No Majors available.", "red"); return; }
      setTargetingMode('invoke');
      return;
    }
    if (label === 'Capture Assura') {
      if (room.actionsUsedThisTurn.includes('Capture Assura')) { showToast("Already attempted.", "red"); return; }
      if (currentPlayer.karmaPoints < 2) { showToast("Need 2 KP.", "red"); return; }
      setTargetingMode('capture-assura');
      return;
    }

    if (!selectedCardId) { showToast("Select a card from hand.", "red"); return; }
    const card = currentPlayer.hand.find(c => c.id === selectedCardId);
    if (!card) return;

    if (label === 'Introduce Major') {
      if (card.type !== 'Major' || currentPlayer.sena.length >= 8) return;
      startClashableAction(card, cost, 'intro');
    } else if (label === 'Play Astra') {
      if (card.type !== 'Astra') return;
      setTargetingMode('astra');
    } else if (label === 'Attach Curse') {
      if (card.type !== 'Curse') return;
      setTargetingMode('curse');
    } else if (label === 'Play Maya') {
      if (card.type !== 'Maya') return;
      startClashableAction(card, cost, 'maya');
    }
  };

  const startClashableAction = (card: IGameCard, cost: number, type: any, targetInfo?: any) => {
    onUpdateRoom({
      ...room,
      pendingAction: { actorId: currentPlayerId, card, cost, type, targetInfo },
      interruptStatus: { type: 'clash-window', endTime: Date.now() + 3000 }
    });
    setSelectedCardId(null);
    setTargetingMode('none');
  };

  const handleTargetSelection = (playerId: string, cardId: string) => {
    if (targetingMode === 'invoke') {
      const major = currentPlayer.sena.find(m => m.id === cardId);
      if (!major || major.invokedThisTurn) return;
      onUpdateRoom({ ...room, players: room.players.map(p => p.id === currentPlayerId ? { ...p, karmaPoints: p.karmaPoints - 1, sena: p.sena.map(m => m.id === cardId ? { ...m, invokedThisTurn: true } : m) } : p) });
      startShaknyWindow({ type: 'power', card: major, playerId: currentPlayerId });
      setTargetingMode('none');
      return;
    }
    if (targetingMode === 'capture-majors') {
      setSelectedAttackerIds(prev => prev.includes(cardId) ? prev.filter(id => id !== cardId) : [...prev, cardId]);
      return;
    }
    const card = currentPlayer.hand.find(c => c.id === selectedCardId)!;
    startClashableAction(card, 1, card.type === 'Astra' ? 'astra' : 'curse', { playerId, cardId });
  };

  const handleClash = () => {
    if (isMyTurn || !room.pendingAction) return;
    setTargetingMode('clash-select');
  };

  const handleShakny = () => {
    if (isGameOver) return;
    setTargetingMode('shakny-select');
  };

  const startShaknyWindow = (rollDetails: any) => {
    onUpdateRoom({
      ...room,
      shaknyModifiers: [],
      interruptStatus: { type: 'shakny-window', endTime: Date.now() + 3000, rollDetails }
    });
  };

  const onInterruptCardSelect = (cardId: string) => {
    const card = currentPlayer.hand.find(c => c.id === cardId);
    if (!card) return;

    if (card.type === 'Clash') {
      onUpdateRoom({
        ...room,
        clashDuel: { actorId: room.pendingAction!.actorId, clasherId: currentPlayerId },
        players: room.players.map(p => p.id === currentPlayerId ? { ...p, hand: p.hand.filter(c => c.id !== cardId) } : p),
        submergePile: [...room.submergePile, card]
      });
      setTargetingMode('none');
      setTimeout(resolveClashDuel, 1500);
    } else if (card.type === 'Shakny') {
      const value = card.description.includes('+2') ? 2 : -2;
      onUpdateRoom({
        ...room,
        shaknyModifiers: [...room.shaknyModifiers, { playerId: currentPlayerId, value, cardName: card.name }],
        players: room.players.map(p => p.id === currentPlayerId ? { ...p, hand: p.hand.filter(c => c.id !== cardId) } : p),
        submergePile: [...room.submergePile, card]
      });
      setTargetingMode('none');
    }
  };

  const resolveClashDuel = () => {
    const actorRoll = Math.floor(Math.random() * 6) + 1;
    const clasherRoll = Math.floor(Math.random() * 6) + 1;
    onUpdateRoom({ ...room, clashDuel: { ...room.clashDuel!, actorRoll, clasherRoll } });
    setTimeout(() => {
      if (clasherRoll > actorRoll) {
        onUpdateRoom({ ...room, pendingAction: undefined, clashDuel: undefined, interruptStatus: undefined, submergePile: [...room.submergePile, room.pendingAction!.card], gameLogs: [...room.gameLogs, { id: generateId(), turn: room.currentTurn, playerName: currentPlayer.name, action: `Clashed and canceled opponent's action!`, kpSpent: 0, timestamp: Date.now() }] });
        showToast("CLASH SUCCESSFUL!", "green");
      } else {
        showToast("CLASH FAILED!", "red");
        executeFinalizedAction(room.pendingAction!);
        onUpdateRoom({ ...room, clashDuel: undefined });
      }
    }, 2000);
  };

  const handleDiceComplete = (result: number) => {
    if (!rollingFor) return;
    const { type, card, playerId, attackers } = rollingFor;
    const shaknyBonus = room.shaknyModifiers.reduce((acc, curr) => acc + curr.value, 0);
    
    if (type === 'power') {
      const finalResult = Math.max(1, Math.min(12, result + card.attachedAstras.length - card.curses.length * 2 + shaknyBonus));
      const isSuccess = finalResult >= (card.powerRange?.[0] || 7) && finalResult <= (card.powerRange?.[1] || 11);
      let updatedPlayers = [...room.players];
      let updatedDrawDeck = [...room.drawDeck];
      if (isSuccess) {
        if (card.powerEffectType === 'draw') updatedPlayers = updatedPlayers.map(p => p.id === playerId ? { ...p, hand: [...p.hand, ...updatedDrawDeck.splice(0, 2)] } : p);
        else if (card.powerEffectType === 'kp') updatedPlayers = updatedPlayers.map(p => p.id === playerId ? { ...p, karmaPoints: p.karmaPoints + 2 } : p);
      }
      onUpdateRoom({ ...room, players: updatedPlayers, drawDeck: updatedDrawDeck, shaknyModifiers: [], gameLogs: [...room.gameLogs, { id: generateId(), turn: room.currentTurn, playerName: room.players.find(p => p.id === playerId)?.name || '', action: `invoked ${card.name}: Result ${finalResult}`, kpSpent: 0, timestamp: Date.now() }] });
    } else {
      const finalResult = Math.max(1, Math.min(12, result + shaknyBonus));
      const capRange = card.captureRange || [8, 12];
      const retRange = card.retaliationRange || [3, 7];
      const isCaptured = finalResult >= capRange[0] && finalResult <= capRange[1];
      const isRetaliation = finalResult >= retRange[0] && finalResult <= retRange[1];
      
      let updatedPlayers = [...room.players], updatedAssuras = [...room.assuras], updatedReserve = [...room.assuraReserve], updatedSubmerge = [...room.submergePile];
      
      if (isCaptured) {
        updatedPlayers = updatedPlayers.map(p => p.id === playerId ? { ...p, jail: [...p.jail, card] } : p);
        updatedAssuras = updatedAssuras.filter(a => a.id !== card.id);
        if (updatedReserve.length > 0) updatedAssuras.push(updatedReserve.shift()!);
      } else if (isRetaliation) {
        updatedPlayers = updatedPlayers.map(p => {
          if (p.id === playerId && attackers) {
            const lostIds = attackers.map(m => m.id);
            updatedSubmerge.push(...p.sena.filter(m => lostIds.includes(m.id)));
            return { ...p, sena: p.sena.filter(m => !lostIds.includes(m.id)) };
          }
          return p;
        });
      }

      // Check Win Condition after Capture Result
      const victory = checkWinConditions(updatedPlayers);

      onUpdateRoom({ 
        ...room, 
        players: updatedPlayers, 
        assuras: updatedAssuras, 
        assuraReserve: updatedReserve, 
        submergePile: updatedSubmerge, 
        shaknyModifiers: [], 
        status: victory ? 'finished' : room.status,
        winner: victory ? { id: victory.winnerId, name: updatedPlayers.find(p => p.id === victory.winnerId)!.name, color: updatedPlayers.find(p => p.id === victory.winnerId)!.color, condition: victory.condition, timestamp: Date.now() } : undefined,
        gameLogs: [...room.gameLogs, { id: generateId(), turn: room.currentTurn, playerName: currentPlayer.name, action: isCaptured ? `CAPTURED ${card.name}!` : `failed to capture ${card.name}`, kpSpent: 2, timestamp: Date.now() }] 
      });
    }
    setRollingFor(null);
  };

  const handleConfirmCaptureAttack = () => {
    const assura = room.assuras.find(a => a.id === selectedAssuraId)!;
    const attackers = currentPlayer.sena.filter(m => selectedAttackerIds.includes(m.id));
    if (!validateAssuraRequirement(attackers, assura.requirement || "")) return;
    onUpdateRoom({ ...room, players: room.players.map(p => p.id === currentPlayerId ? { ...p, karmaPoints: p.karmaPoints - 2 } : p), actionsUsedThisTurn: [...room.actionsUsedThisTurn, 'Capture Assura'] });
    startShaknyWindow({ type: 'capture', card: assura, playerId: currentPlayerId, attackers });
    setTargetingMode('none');
    setSelectedAssuraId(null);
    setSelectedAttackerIds([]);
  };

  const handleDrawCard = () => {
    if (!isMyTurn || currentPlayer.karmaPoints < 1 || isGameOver) return;
    let deck = [...room.drawDeck], submerge = [...room.submergePile];
    if (deck.length === 0) { if (submerge.length === 0) return; deck = shuffle(submerge); submerge = []; }
    const card = deck.shift()!;
    onUpdateRoom({ ...room, drawDeck: deck, submergePile: submerge, players: room.players.map(p => p.id === currentPlayerId ? { ...p, karmaPoints: p.karmaPoints - 1, hand: [...p.hand, card] } : p) });
  };

  const handleEndTurn = () => {
    if (isGameOver) return;
    const nextIndex = (room.activePlayerIndex + 1) % room.players.length;
    onUpdateRoom({ ...room, currentTurn: room.currentTurn + 1, turnStartTime: Date.now(), activePlayerIndex: nextIndex, players: room.players.map((p, idx) => ({ ...p, karmaPoints: idx === nextIndex ? 3 : p.karmaPoints, sena: p.sena.map(m => ({ ...m, invokedThisTurn: false })) })), actionsUsedThisTurn: [] });
    setSelectedCardId(null);
  };

  return (
    <div className="fixed inset-0 bg-[#0F172A] text-white overflow-hidden flex flex-col select-none">
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      
      {/* Phase 9 Victory Screen */}
      {isGameOver && room.winner && (
        <VictoryScreen 
          roomName={room.roomName} 
          winner={room.winner} 
          players={room.players} 
          turnCount={room.currentTurn}
          onReturnToLobby={() => onUpdateRoom({ ...room, status: 'waiting', winner: undefined, gameLogs: [], currentTurn: 1 })}
          onExit={onLeaveRoom}
        />
      )}

      {/* Interrupt Window - Don't show if game is over */}
      {room.interruptStatus && !isGameOver && (
        <InterruptWindow 
          type={room.interruptStatus.type === 'clash-window' ? 'clash' : 'shakny'} 
          endTime={room.interruptStatus.endTime} 
          onAction={room.interruptStatus.type === 'clash-window' ? handleClash : handleShakny}
          isActor={isMyTurn}
        />
      )}

      {/* Clash Duel Overlay - Don't show if game is over */}
      {room.clashDuel && !isGameOver && (
        <ClashDuel 
          actor={room.players.find(p => p.id === room.clashDuel!.actorId)!}
          clasher={room.players.find(p => p.id === room.clashDuel!.clasherId)!}
          actorRoll={room.clashDuel.actorRoll}
          clasherRoll={room.clashDuel.clasherRoll}
          isRolling={!room.clashDuel.actorRoll}
        />
      )}

      {rollingFor && <DiceRoller title={rollingFor.type === 'capture' ? `Challenging ${rollingFor.card.name}` : `Invoking ${rollingFor.card.name}`} onComplete={handleDiceComplete} ranges={rollingFor.type === 'capture' ? { capture: rollingFor.card.captureRange, retaliation: rollingFor.card.retaliationRange, safe: rollingFor.card.safeZone } : undefined} />}

      {targetingMode !== 'none' && !isGameOver && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm animate-in fade-in flex flex-col items-center justify-center pointer-events-none">
          <div className="bg-black/80 px-8 py-4 rounded-full border-2 border-yellow-500/50 flex items-center gap-4 animate-bounce">
            <span className="text-yellow-500 text-xl">🎯</span>
            <p className="text-sm font-black uppercase tracking-widest text-white">
              {targetingMode === 'clash-select' ? "Select a Clash card to use" :
               targetingMode === 'shakny-select' ? "Select a Shakny card to use" :
               targetingMode === 'capture-assura' ? "Select an Assura to attack" :
               targetingMode === 'capture-majors' ? "Assemble your attackers" : "Select target"}
            </p>
            <button onClick={() => setTargetingMode('none')} className="ml-4 pointer-events-auto px-4 py-1 bg-white/10 rounded-full text-[10px] font-black hover:bg-white/20">CANCEL</button>
          </div>
          {targetingMode === 'capture-majors' && (
             <div className="mt-8 pointer-events-auto">
                <button onClick={handleConfirmCaptureAttack} disabled={selectedAttackerIds.length === 0} className={`px-12 py-4 rounded-xl text-xl font-black uppercase shadow-2xl transition-all ${selectedAttackerIds.length > 0 ? 'bg-red-600 hover:bg-red-500' : 'bg-gray-600 cursor-not-allowed opacity-50'}`}>Attack</button>
             </div>
          )}
        </div>
      )}

      {activeMaya && (
        <div className="fixed inset-0 z-[200] bg-black/90 flex flex-col items-center justify-center gap-8 animate-in zoom-in">
           <h2 className="text-4xl font-black uppercase tracking-[0.5em] text-blue-500 animate-pulse">Invoke Maya</h2>
           <GameCard card={activeMaya} size="lg" isInteractive={false} className="shadow-[0_0_60px_rgba(37,99,235,0.4)] ring-4 ring-blue-500/50" />
           <p className="text-xl text-white/60 font-medium max-w-md text-center">{activeMaya.description}</p>
           <div className="flex gap-4">
             <button onClick={() => { resolveMaya(); setActiveMaya(null); }} className="px-12 py-4 bg-blue-600 rounded-xl text-xl font-black uppercase hover:bg-blue-500 transition-all">Manifest</button>
             <button onClick={() => setActiveMaya(null)} className="px-12 py-4 bg-white/5 border border-white/10 rounded-xl text-xl font-black uppercase hover:bg-white/10">Dismiss</button>
           </div>
        </div>
      )}

      {announcement && <div className="absolute inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-md"><h1 className="text-4xl md:text-7xl font-black uppercase text-white drop-shadow-2xl animate-in zoom-in text-center px-8">{announcement}</h1></div>}
      {toast && <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[150] animate-in slide-in-from-top-4 duration-300"><div className="px-6 py-3 rounded-full border-2 bg-black/80 backdrop-blur-xl shadow-2xl flex items-center gap-3" style={{ borderColor: `${toast.color}44` }}><span className="text-xs font-black uppercase tracking-widest text-white">{toast.message}</span></div></div>}

      <GameHeader turnNumber={room.currentTurn} activePlayer={activePlayer} turnStartTime={room.turnStartTime} />

      <div className="absolute top-28 left-8 flex flex-col gap-6 z-40">
        <DeckPile label="Cosmos" count={room.drawDeck.length} type="draw" isEmpty={room.drawDeck.length === 0} />
        <DeckPile label="Submerge" count={room.submergePile.length} type="submerge" isEmpty={room.submergePile.length === 0} />
      </div>

      <main className="flex-1 relative mt-24 mb-32 flex flex-col items-center justify-between p-4 md:p-8 overflow-hidden">
        <div className="w-full flex justify-center items-center gap-4 flex-wrap max-h-[30vh]">
          {otherPlayers.map((p, idx) => (
            <PlayerArea key={p.id} player={p} isActive={activePlayer.id === p.id} isCurrent={false} position={getOpponentPosition(idx, otherPlayers.length)} targetingMode={targetingMode} onTargetSelect={handleTargetSelection} isGameOver={isGameOver} />
          ))}
        </div>

        <div className="flex-1 flex items-center justify-center scale-90 md:scale-100">
          <AssuraZone assuras={room.assuras} targetingMode={targetingMode} onAssuraSelect={handleAssuraSelection} selectedAssuraId={selectedAssuraId} />
        </div>

        <div className="w-full flex justify-center">
          <PlayerArea 
            player={currentPlayer} isActive={isMyTurn} isCurrent={true} position="bottom" 
            selectedCardId={selectedCardId} 
            onCardClick={(id) => {
              if (targetingMode === 'clash-select' || targetingMode === 'shakny-select') {
                const card = currentPlayer.hand.find(c => c.id === id);
                if ((targetingMode === 'clash-select' && card?.type === 'Clash') || (targetingMode === 'shakny-select' && card?.type === 'Shakny')) {
                  onInterruptCardSelect(id);
                }
              } else {
                setSelectedCardId(prev => prev === id ? null : id);
              }
            }}
            targetingMode={targetingMode} onTargetSelect={handleTargetSelection} selectedAttackerIds={selectedAttackerIds} isGameOver={isGameOver}
          />
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-50 max-w-7xl mx-auto px-4">
        <ControlPanel 
          kp={currentPlayer.karmaPoints} isActive={isMyTurn && !isGameOver} onAction={handleAction} onEndTurn={handleEndTurn} actionsUsed={room.actionsUsedThisTurn} deckEmpty={room.drawDeck.length === 0 && room.submergePile.length === 0}
          isInterrupting={!!room.interruptStatus && !isGameOver}
        />
      </div>

      <GameLog logs={room.gameLogs} isOpen={showLog} onClose={() => setShowLog(false)} />
    </div>
  );
};
