
import React, { useState, useEffect } from 'react';
import { Room, LogEntry, GameCard as IGameCard, Player, TargetingMode } from '../types';
import { GameHeader } from './GameHeader';
import { AssuraZone } from './AssuraZone';
import { PlayerArea } from './PlayerArea';
import { ControlPanel } from './ControlPanel';
import { GameLog } from './GameLog';
import { DeckPile } from './DeckStacks';
import { generateId, shuffle } from '../utils';
// Fixed: Imported the GameCard component to be used in JSX
import { GameCard } from './GameCard';

interface BoardProps {
  room: Room;
  currentPlayerId: string;
  onUpdateRoom: (room: Room) => void;
}

export const Board: React.FC<BoardProps> = ({ room, currentPlayerId, onUpdateRoom }) => {
  const [showLog, setShowLog] = useState(false);
  const [toast, setToast] = useState<{ message: string; color: string } | null>(null);
  const [announcement, setAnnouncement] = useState<string | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [targetingMode, setTargetingMode] = useState<TargetingMode>('none');
  const [activeMaya, setActiveMaya] = useState<IGameCard | null>(null);

  const activePlayer = room.players[room.activePlayerIndex];
  const isMyTurn = activePlayer.id === currentPlayerId;
  const currentPlayer = room.players.find(p => p.id === currentPlayerId)!;
  const otherPlayers = room.players.filter(p => p.id !== currentPlayerId);

  useEffect(() => {
    if (room.currentTurn === 1 && room.gameLogs.length === 0) {
      setAnnouncement(`${activePlayer.name} goes first!`);
      setTimeout(() => setAnnouncement(null), 2500);
    }
  }, []);

  const showToast = (message: string, color: string = '#F59E0B') => {
    setToast({ message, color });
    setTimeout(() => setToast(null), 3000);
  };

  const getOpponentPosition = (index: number, total: number): 'top' | 'left' | 'right' => {
    if (total === 1) return 'top';
    if (total === 2) return index === 0 ? 'left' : 'right';
    if (total === 3) {
      if (index === 0) return 'left';
      if (index === 1) return 'top';
      return 'right';
    }
    if (index === 0) return 'left';
    if (index === total - 1) return 'right';
    return 'top';
  };

  const handleAction = (label: string, cost: number) => {
    if (!isMyTurn) return;

    if (label === 'Draw Card') {
      handleDrawCard();
      return;
    }

    if (!selectedCardId) {
      showToast("Please select a card from your hand first.", "red");
      return;
    }

    const selectedCard = currentPlayer.hand.find(c => c.id === selectedCardId);
    if (!selectedCard) return;

    // Phase 5: Action Handling
    if (label === 'Introduce Major') {
      if (selectedCard.type !== 'Major') { showToast("Not a Major card.", "red"); return; }
      if (currentPlayer.sena.length >= 8) { showToast("Sena is full.", "red"); return; }
      
      executePlayCard(selectedCard, 'Sena', cost);
    } 
    else if (label === 'Play Astra') {
      if (selectedCard.type !== 'Astra') { showToast("Not an Astra card.", "red"); return; }
      if (currentPlayer.sena.length === 0) { showToast("No Major to enhance.", "red"); return; }
      setTargetingMode('astra');
    }
    else if (label === 'Attach Curse') {
      if (selectedCard.type !== 'Curse') { showToast("Not a Curse card.", "red"); return; }
      const hasOpponentMajors = otherPlayers.some(p => p.sena.length > 0);
      if (!hasOpponentMajors) { showToast("No opponent Major to curse.", "red"); return; }
      setTargetingMode('curse');
    }
    else if (label === 'Play Maya') {
      if (selectedCard.type !== 'Maya') { showToast("Not a Maya card.", "red"); return; }
      setActiveMaya(selectedCard);
    }
  };

  const executePlayCard = (card: IGameCard, targetType: 'Sena' | 'Submerge' | 'Attach', cost: number, targetInfo?: { playerId: string, cardId: string }) => {
    const updatedHand = currentPlayer.hand.filter(c => c.id !== card.id);
    let updatedPlayers = [...room.players];
    let updatedSubmerge = [...room.submergePile];

    if (targetType === 'Sena') {
      updatedPlayers = updatedPlayers.map(p => 
        p.id === currentPlayerId 
          ? { ...p, karmaPoints: p.karmaPoints - cost, hand: updatedHand, sena: [...p.sena, card] } 
          : p
      );
    } else if (targetType === 'Submerge') {
      updatedSubmerge.push(card);
      updatedPlayers = updatedPlayers.map(p => 
        p.id === currentPlayerId 
          ? { ...p, karmaPoints: p.karmaPoints - cost, hand: updatedHand } 
          : p
      );
    } else if (targetType === 'Attach' && targetInfo) {
      updatedPlayers = updatedPlayers.map(p => {
        if (p.id === targetInfo.playerId) {
          const updatedSena = p.sena.map(major => {
            if (major.id === targetInfo.cardId) {
              if (card.type === 'Astra') {
                return { ...major, attachedAstras: [...major.attachedAstras, card] };
              } else {
                return { ...major, curses: [card] }; // One curse replaces old
              }
            }
            return major;
          });
          return { ...p, sena: updatedSena };
        }
        if (p.id === currentPlayerId) {
          return { ...p, karmaPoints: p.karmaPoints - cost, hand: updatedHand };
        }
        return p;
      });
    }

    onUpdateRoom({
      ...room,
      players: updatedPlayers,
      submergePile: updatedSubmerge,
      gameLogs: [...room.gameLogs, {
        id: generateId(),
        turn: room.currentTurn,
        playerName: currentPlayer.name,
        action: `played ${card.name}`,
        kpSpent: cost,
        timestamp: Date.now()
      }]
    });

    setSelectedCardId(null);
    setTargetingMode('none');
    showToast(`${card.name} utilized.`, activePlayer.color);
  };

  const handleTargetSelection = (playerId: string, cardId: string) => {
    const selectedCard = currentPlayer.hand.find(c => c.id === selectedCardId)!;
    executePlayCard(selectedCard, 'Attach', 1, { playerId, cardId });
  };

  const resolveMaya = () => {
    if (!activeMaya) return;
    
    // Simple Maya Logic for MVP
    let updatedPlayers = [...room.players];
    let updatedDrawDeck = [...room.drawDeck];

    if (activeMaya.name.includes('Illusion')) {
      // Gain 2 KP (net +1)
      updatedPlayers = updatedPlayers.map(p => p.id === currentPlayerId ? { ...p, karmaPoints: p.karmaPoints + 2 } : p);
    } else {
      // Draw 2 Cards
      const cards = updatedDrawDeck.splice(0, 2);
      updatedPlayers = updatedPlayers.map(p => p.id === currentPlayerId ? { ...p, hand: [...p.hand, ...cards] } : p);
    }

    onUpdateRoom({
      ...room,
      players: updatedPlayers,
      drawDeck: updatedDrawDeck
    });

    executePlayCard(activeMaya, 'Submerge', 1);
    setActiveMaya(null);
  };

  const handleDrawCard = () => {
    if (!isMyTurn) return;
    if (currentPlayer.karmaPoints < 1) { showToast("Need 1 Karma Point.", "red"); return; }

    let deck = [...room.drawDeck];
    let submerge = [...room.submergePile];

    if (deck.length === 0) {
      if (submerge.length === 0) return;
      deck = shuffle(submerge);
      submerge = [];
    }

    const card = deck.shift()!;
    onUpdateRoom({
      ...room,
      drawDeck: deck,
      submergePile: submerge,
      players: room.players.map(p => p.id === currentPlayerId ? { ...p, karmaPoints: p.karmaPoints - 1, hand: [...p.hand, card] } : p)
    });
  };

  const handleEndTurn = () => {
    const nextIndex = (room.activePlayerIndex + 1) % room.players.length;
    onUpdateRoom({
      ...room,
      currentTurn: room.currentTurn + 1,
      turnStartTime: Date.now(),
      activePlayerIndex: nextIndex,
      players: room.players.map((p, idx) => idx === nextIndex ? { ...p, karmaPoints: 3 } : p),
      actionsUsedThisTurn: []
    });
    setSelectedCardId(null);
  };

  return (
    <div className="fixed inset-0 bg-[#0F172A] text-white overflow-hidden flex flex-col select-none">
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      
      {/* Targeting Overlay */}
      {targetingMode !== 'none' && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm animate-in fade-in flex items-center justify-center pointer-events-none">
          <div className="bg-black/80 px-8 py-4 rounded-full border-2 border-yellow-500/50 flex items-center gap-4 animate-bounce">
            <span className="text-yellow-500 text-xl">🎯</span>
            <p className="text-sm font-black uppercase tracking-widest text-white">
              {targetingMode === 'astra' ? 'Select your Major to enhance' : "Select opponent's Major to curse"}
            </p>
            <button 
              onClick={() => setTargetingMode('none')}
              className="ml-4 pointer-events-auto px-4 py-1 bg-white/10 rounded-full text-[10px] font-black hover:bg-white/20"
            >CANCEL</button>
          </div>
        </div>
      )}

      {/* Maya Overlay */}
      {activeMaya && (
        <div className="fixed inset-0 z-[200] bg-black/90 flex flex-col items-center justify-center gap-8 animate-in zoom-in">
           <h2 className="text-4xl font-black uppercase tracking-[0.5em] text-blue-500 animate-pulse">Invoke Maya</h2>
           {/* Fixed: Used GameCard component instead of IGameCard type */}
           <GameCard card={activeMaya} size="lg" isInteractive={false} className="shadow-[0_0_60px_rgba(37,99,235,0.4)] ring-4 ring-blue-500/50" />
           <p className="text-xl text-white/60 font-medium max-w-md text-center">{activeMaya.description}</p>
           <div className="flex gap-4">
             <button onClick={resolveMaya} className="px-12 py-4 bg-blue-600 rounded-xl text-xl font-black uppercase shadow-2xl hover:bg-blue-500 transition-all transform hover:scale-105">Manifest Effect</button>
             <button onClick={() => setActiveMaya(null)} className="px-12 py-4 bg-white/5 border border-white/10 rounded-xl text-xl font-black uppercase hover:bg-white/10">Discard Action</button>
           </div>
        </div>
      )}

      {announcement && (
        <div className="absolute inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-md">
           <h1 className="text-5xl md:text-7xl font-black uppercase text-white drop-shadow-2xl animate-in zoom-in">{announcement}</h1>
        </div>
      )}

      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[150] animate-in slide-in-from-top-4 duration-300">
           <div className="px-6 py-3 rounded-full border-2 bg-black/80 backdrop-blur-xl shadow-2xl flex items-center gap-3" style={{ borderColor: `${toast.color}44` }}>
              <span className="text-xs font-black uppercase tracking-widest text-white">{toast.message}</span>
           </div>
        </div>
      )}

      <GameHeader turnNumber={room.currentTurn} activePlayer={activePlayer} turnStartTime={room.turnStartTime} />

      <div className="absolute top-28 left-8 flex flex-col gap-6 z-40">
        <DeckPile label="Cosmos" count={room.drawDeck.length} type="draw" isEmpty={room.drawDeck.length === 0} />
        <DeckPile label="Submerge" count={room.submergePile.length} type="submerge" isEmpty={room.submergePile.length === 0} />
      </div>

      <main className="flex-1 relative mt-24 mb-32 flex flex-col items-center justify-between p-4 md:p-8 overflow-hidden">
        <div className="w-full flex justify-center items-center gap-4 flex-wrap max-h-[30vh]">
          {otherPlayers.map((player, idx) => (
            <PlayerArea 
              key={player.id} player={player} isActive={activePlayer.id === player.id} isCurrent={false} 
              position={getOpponentPosition(idx, otherPlayers.length)} 
              targetingMode={targetingMode} onTargetSelect={handleTargetSelection}
            />
          ))}
        </div>

        <div className="flex-1 flex items-center justify-center scale-90 md:scale-100">
          <AssuraZone assuras={room.assuras} />
        </div>

        <div className="w-full flex justify-center">
          <PlayerArea 
            player={currentPlayer} isActive={isMyTurn} isCurrent={true} position="bottom" 
            selectedCardId={selectedCardId} onCardClick={(id) => setSelectedCardId(prev => prev === id ? null : id)}
            targetingMode={targetingMode} onTargetSelect={handleTargetSelection}
          />
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-50 max-w-7xl mx-auto px-4">
        <ControlPanel 
          kp={currentPlayer.karmaPoints} isActive={isMyTurn} onAction={handleAction} 
          onEndTurn={handleEndTurn} actionsUsed={room.actionsUsedThisTurn}
          deckEmpty={room.drawDeck.length === 0 && room.submergePile.length === 0}
        />
      </div>

      <GameLog logs={room.gameLogs} isOpen={showLog} onClose={() => setShowLog(false)} />
    </div>
  );
};
