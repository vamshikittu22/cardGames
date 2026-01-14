
import React, { useState, useEffect } from 'react';
import { Room, GameCard as IGameCard, Player, TargetingMode, TutorialStep } from '../types';
import { GameHeader } from './GameHeader';
import { AssuraZone } from './AssuraZone';
import { PlayerArea } from './PlayerArea';
import { ControlPanel } from './ControlPanel';
import { GameLog } from './GameLog';
import { DeckPile } from './DeckStacks';
import { validateAssuraRequirement } from '../utils';
import { GameCard } from './GameCard';
import { DiceRoller } from './DiceRoller';
import { VictoryScreen } from './VictoryScreen';
import { socket } from '../lib/socket';

const getOpponentPosition = (index: number, total: number): 'top' | 'left' | 'right' => {
  if (total === 1) return 'top';
  if (index === 0) return 'left';
  if (index === total - 1) return 'right';
  return 'top';
};

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    title: "The Path of Dharma",
    content: "Welcome, Seeker. Your goal is to restore balance by capturing 3 Assuras or mastering all 6 warrior classes. Use Karma Points (KP) to take actions."
  },
  {
    title: "Gathering Resources",
    content: "Start your turn by drawing cards. Each draw costs 1 KP. Click the 'COSMOS' deck or the 'DRAW CARD' button to begin your prophecy."
  },
  {
    title: "Mobilizing Forces",
    content: "Select a 'Major' card from your hand and click 'Introduce Major' (1 KP) to move it to your Sena (Army). This builds your power base."
  },
  {
    title: "The Great Challenge",
    content: "To capture an Assura in the center, you need 2 KP and the specific class requirements met by your Sena. Success depends on the divine dice roll!"
  },
  {
    title: "Divine Intervention",
    content: "Astras strengthen your warriors, while Curses weaken opponents. Maya cards shift the game state. Use them wisely to outplay other seekers."
  }
];

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
  const [rollingFor, setRollingFor] = useState<{ type: 'power' | 'capture', card: IGameCard, playerId: string, attackers?: IGameCard[] } | null>(null);
  const [selectedAssuraId, setSelectedAssuraId] = useState<string | null>(null);
  const [selectedAttackerIds, setSelectedAttackerIds] = useState<string[]>([]);
  
  // Tutorial State (Persisted)
  const [tutorialEnabled, setTutorialEnabled] = useState(() => {
    const saved = localStorage.getItem('dharma_tutorial_enabled');
    return saved === null ? true : saved === 'true';
  });
  const [tutorialStep, setTutorialStep] = useState(0);

  const activePlayer = room.players[room.activePlayerIndex];
  const isMyTurn = activePlayer.id === currentPlayerId;
  const currentPlayer = room.players.find(p => p.id === currentPlayerId)!;
  const otherPlayers = room.players.filter(p => p.id !== currentPlayerId);
  const isGameOver = room.status === 'finished';

  const showToast = (message: string, color: string = '#F59E0B') => {
    setToast({ message, color });
    setTimeout(() => setToast(null), 3000);
  };

  const emitAction = (actionType: string, payload: any = {}) => {
    socket.emit('game_action', { 
      roomId: room.roomCode,
      playerId: currentPlayerId,
      actionType,
      payload 
    });
  };

  const handleAction = (label: string, cost: number) => {
    if (!isMyTurn || isGameOver) return;
    
    if (label === 'Draw Card') { 
      emitAction('DRAW_CARD'); 
      return; 
    }

    if (label === 'Capture Assura') {
      if (room.actionsUsedThisTurn.includes('Capture Assura')) { 
        showToast("Already attempted this turn.", "red"); 
        return; 
      }
      if (currentPlayer.karmaPoints < 2) { 
        showToast("Insufficient Karma.", "red"); 
        return; 
      }
      setTargetingMode('capture-assura');
      return;
    }

    if (!selectedCardId) { 
      showToast("Pick a card from your hand first.", "red"); 
      return; 
    }

    const card = currentPlayer.hand.find(c => c.id === selectedCardId);
    if (!card) return;

    if (label === 'Introduce Major') {
      if (card.type !== 'Major') {
        showToast("Only Major cards can be introduced to Sena.", "red");
        return;
      }
      if (currentPlayer.sena.length >= 8) {
        showToast("Sena capacity reached (8).", "red");
        return;
      }
      emitAction('PLAY_CARD', { cardId: selectedCardId, cost });
      setSelectedCardId(null);
    } else if (label === 'Play Astra') {
      if (card.type !== 'Astra') return;
      setTargetingMode('astra');
    } else if (label === 'Attach Curse') {
      if (card.type !== 'Curse') return;
      setTargetingMode('curse');
    } else if (label === 'Play Maya') {
      if (card.type !== 'Maya') return;
      emitAction('PLAY_CARD', { cardId: selectedCardId, cost });
      setSelectedCardId(null);
    }
  };

  const handleTargetSelection = (playerId: string, cardId: string) => {
    emitAction('PLAY_CARD', { 
      cardId: selectedCardId, 
      cost: 1, 
      targetInfo: { playerId, cardId } 
    });
    setTargetingMode('none');
    setSelectedCardId(null);
  };

  const handleDiceComplete = (result: number) => {
    if (!rollingFor) return;
    const { type, card, attackers } = rollingFor;
    const shaknyBonus = room.shaknyModifiers.reduce((acc, curr) => acc + curr.value, 0);
    const finalResult = result + shaknyBonus;

    if (type === 'capture') {
      const capRange = card.captureRange || [8, 12];
      const isCaptured = finalResult >= capRange[0] && finalResult <= capRange[1];
      emitAction('CAPTURE_RESULT', { isCaptured, cardId: card.id, attackerIds: attackers?.map(a => a.id) });
    }
    setRollingFor(null);
  };

  const handleToggleTutorial = () => {
    const newState = !tutorialEnabled;
    setTutorialEnabled(newState);
    localStorage.setItem('dharma_tutorial_enabled', String(newState));
  };

  return (
    <div className="fixed inset-0 bg-[#0F172A] text-white overflow-hidden flex flex-col select-none">
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
      
      {isGameOver && room.winner && (
        <VictoryScreen 
          roomName={room.roomName} winner={room.winner} players={room.players} turnCount={room.currentTurn}
          onReturnToLobby={() => socket.emit('reset_room', { roomId: room.roomCode })}
          onExit={onLeaveRoom}
        />
      )}

      {/* Tutorial Overlay */}
      {tutorialEnabled && !isGameOver && (
        <div className="fixed bottom-48 left-8 z-[200] max-w-sm animate-in slide-in-from-left duration-500">
          <div className="bg-white p-6 rounded-[24px] shadow-2xl border-2 border-[#F59E0B] relative">
             <button 
               onClick={handleToggleTutorial}
               className="absolute top-4 right-4 text-gray-300 hover:text-black transition-colors"
               title="Disable Tutorial Permanently"
             >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
             <h4 className="text-black font-black uppercase text-xs tracking-widest mb-1">{TUTORIAL_STEPS[tutorialStep].title}</h4>
             <p className="text-gray-600 text-[10px] leading-relaxed mb-4 font-medium">{TUTORIAL_STEPS[tutorialStep].content}</p>
             <div className="flex items-center justify-between">
                <div className="flex gap-1">
                   {TUTORIAL_STEPS.map((_, i) => (
                     <div key={i} className={`h-1 rounded-full transition-all ${i === tutorialStep ? 'w-4 bg-[#F59E0B]' : 'w-1 bg-gray-200'}`}></div>
                   ))}
                </div>
                <div className="flex gap-3">
                   {tutorialStep > 0 && (
                     <button onClick={() => setTutorialStep(s => s - 1)} className="text-[8px] font-black uppercase tracking-widest text-gray-400 hover:text-black">Prev</button>
                   )}
                   {tutorialStep < TUTORIAL_STEPS.length - 1 ? (
                     <button onClick={() => setTutorialStep(s => s + 1)} className="bg-[#0F766E] text-white px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest shadow-md">Next</button>
                   ) : (
                     <button onClick={handleToggleTutorial} className="bg-black text-white px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest">Done</button>
                   )}
                </div>
             </div>
          </div>
        </div>
      )}

      {rollingFor && (
        <DiceRoller 
          title={rollingFor.type === 'capture' ? `Challenging ${rollingFor.card.name}` : `Invoking Power`} 
          onComplete={handleDiceComplete} 
          ranges={rollingFor.type === 'capture' ? { 
            capture: rollingFor.card.captureRange, 
            retaliation: rollingFor.card.retaliationRange, 
            safe: rollingFor.card.safeZone 
          } : undefined} 
        />
      )}

      {targetingMode !== 'none' && !isGameOver && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm animate-in fade-in flex flex-col items-center justify-center pointer-events-none">
          <div className="bg-black/80 px-8 py-4 rounded-full border-2 border-yellow-500/50 flex items-center gap-4 animate-bounce">
            <span className="text-yellow-500 text-xl">🎯</span>
            <p className="text-sm font-black uppercase tracking-widest text-white">
              {targetingMode === 'capture-assura' ? "Select target Assura" : "Select target Major"}
            </p>
            <button onClick={() => setTargetingMode('none')} className="ml-4 pointer-events-auto px-4 py-1 bg-white/10 rounded-full text-[10px] font-black hover:bg-white/20 uppercase">Cancel</button>
          </div>
        </div>
      )}

      <GameHeader turnNumber={room.currentTurn} activePlayer={activePlayer} turnStartTime={room.turnStartTime} />

      <main className="flex-1 relative mt-24 mb-64 flex flex-col items-center overflow-y-auto scrollbar-hide p-4">
        {/* Opponents Section */}
        <div className="w-full flex justify-center items-center gap-4 flex-wrap">
          {otherPlayers.map((p, idx) => (
            <PlayerArea 
              key={p.id} player={p} isActive={activePlayer.id === p.id} isCurrent={false} 
              position={getOpponentPosition(idx, otherPlayers.length)} 
              targetingMode={targetingMode} onTargetSelect={handleTargetSelection} isGameOver={isGameOver} 
            />
          ))}
        </div>

        {/* Center Game Board */}
        <div className="flex-1 w-full flex items-center justify-between gap-8 my-12 relative px-12">
           <div className="flex flex-col gap-8">
             <div onClick={() => isMyTurn && handleAction('Draw Card', 1)} className="cursor-pointer hover:scale-105 transition-transform active:scale-95">
                <DeckPile label="Cosmos" count={room.drawDeck.length} type="draw" isEmpty={room.drawDeck.length === 0} />
             </div>
             <DeckPile label="Submerge" count={room.submergePile.length} type="submerge" isEmpty={room.submergePile.length === 0} />
           </div>

           <AssuraZone assuras={room.assuras} targetingMode={targetingMode} onAssuraSelect={(id) => setSelectedAssuraId(id)} selectedAssuraId={selectedAssuraId} />

           <div className="flex flex-col gap-4 items-end">
              <button 
                onClick={handleToggleTutorial}
                className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${tutorialEnabled ? 'bg-[#F59E0B] text-black border-white/20' : 'bg-white/5 text-white/40 border-white/10'}`}
              >
                {tutorialEnabled ? 'Hide Guide' : 'Guide'}
              </button>
              <button 
                onClick={() => setShowLog(true)}
                className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              </button>
           </div>
        </div>

        {/* Current Player Sena Area */}
        <div className="w-full flex justify-center pb-8">
          <PlayerArea 
            player={currentPlayer} isActive={isMyTurn} isCurrent={true} position="bottom" 
            targetingMode={targetingMode} onTargetSelect={handleTargetSelection} selectedAttackerIds={selectedAttackerIds} isGameOver={isGameOver}
          />
        </div>
      </main>

      {/* FIXED FOOTER AREA: Hand + Controls */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex flex-col pointer-events-none">
         {/* Hand Overlay */}
         <div className="w-full max-w-6xl mx-auto px-4 pointer-events-auto">
            <div className="relative flex justify-center items-end min-h-[160px] pb-4 group">
               <div className="flex gap-3 items-end transition-all duration-500 overflow-x-auto scrollbar-hide px-8 py-2">
                 {currentPlayer.hand.map((card, i) => {
                   const isSelected = selectedCardId === card.id;
                   return (
                     <div 
                       key={card.id} 
                       onClick={() => !isGameOver && setSelectedCardId(isSelected ? null : card.id)}
                       className={`transform transition-all duration-300 cursor-pointer ${isSelected ? '-translate-y-12 scale-125 z-50' : 'hover:-translate-y-6'}`}
                     >
                       <GameCard 
                         card={card} 
                         size="md" 
                         isHeld={isSelected}
                         className={`${isSelected ? 'ring-4 ring-[#F59E0B] shadow-[0_0_50px_rgba(245,158,11,0.6)]' : ''}`} 
                         isInteractive={true}
                       />
                     </div>
                   );
                 })}
                 {currentPlayer.hand.length === 0 && (
                   <div className="px-12 py-8 bg-black/40 border-2 border-dashed border-white/5 rounded-3xl opacity-20">
                     <span className="text-[10px] font-black uppercase tracking-widest text-white">Empty Hand</span>
                   </div>
                 )}
               </div>
               {/* Label */}
               <div className="absolute top-0 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                 <span className="text-[8px] font-black uppercase tracking-[0.5em] text-white/20">Thy Hand of Fate</span>
               </div>
            </div>
         </div>

         {/* Controls */}
         <div className="w-full pointer-events-auto">
            <ControlPanel 
              kp={currentPlayer.karmaPoints} isActive={isMyTurn && !isGameOver} 
              onAction={handleAction} onEndTurn={() => { emitAction('END_TURN'); setSelectedCardId(null); }} 
              actionsUsed={room.actionsUsedThisTurn} deckEmpty={room.drawDeck.length === 0 && room.submergePile.length === 0}
            />
         </div>
      </div>

      {toast && (
        <div 
          className="fixed top-24 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full font-black uppercase text-xs tracking-widest text-white shadow-2xl z-[200] animate-in slide-in-from-top"
          style={{ backgroundColor: toast.color }}
        >
          {toast.message}
        </div>
      )}

      <GameLog logs={room.gameLogs} isOpen={showLog} onClose={() => setShowLog(false)} />
    </div>
  );
};
